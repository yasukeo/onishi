-- ════════════════════════════════════════════════════════════════════
-- Onishi — 0010_order_integrity.sql
-- Durcissement de la création de commande : les montants ne sont PLUS
-- jamais ceux envoyés par le client. Le serveur recalcule tout depuis la
-- base (prix des plats, frais de livraison, code promo) et refuse une
-- commande hors service / hors horaires / sous le minimum.
--   + Coordonnées GPS (carte de livraison) sur orders.
--   + Réglage 'eta' (temps de préparation / livraison estimés).
-- ════════════════════════════════════════════════════════════════════

-- ── Coordonnées GPS du client (sélection sur carte, livraison) ──────
alter table orders add column if not exists latitude  numeric(9,6);
alter table orders add column if not exists longitude numeric(9,6);

-- ── Réglage ETA par défaut (modifiable depuis l'admin) ──────────────
insert into settings (cle, valeur) values
  ('eta', jsonb_build_object('preparation_min', 25, 'livraison_min', 20))
on conflict (cle) do nothing;

-- ════════════════════════════════════════════════════════════════════
-- create_order : recalcul intégral côté serveur (SECURITY DEFINER)
-- ════════════════════════════════════════════════════════════════════
create or replace function create_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id    uuid;
  new_token uuid;
  it        jsonb;

  v_type        order_type := (payload->>'type')::order_type;
  v_quartier    text := nullif(payload->>'quartier','');
  v_code        text := nullif(payload->>'code_promo','');
  v_lat         numeric := nullif(payload->>'latitude','')::numeric;
  v_lng         numeric := nullif(payload->>'longitude','')::numeric;

  v_livraison   jsonb;
  v_service     jsonb;
  v_horaires    jsonb;

  v_item_id     uuid;
  v_prix        numeric;
  v_nom         text;
  v_dispo       boolean;
  v_qte         int;

  v_sous_total  numeric := 0;
  v_frais       numeric := 0;
  v_remise      numeric := 0;
  v_min         numeric := 0;
  v_total       numeric := 0;

  v_promo       promo_codes%rowtype;

  -- horaires
  v_local       timestamp;
  v_dow         int;
  v_day         jsonb;
  v_now_min     int;
  v_ouvre_min   int;
  v_ferme_min   int;
  v_open        boolean := true;
begin
  -- ── Réglages courants ─────────────────────────────────────────────
  select valeur into v_livraison from settings where cle = 'livraison';
  select valeur into v_service   from settings where cle = 'service';
  select valeur into v_horaires  from settings where cle = 'horaires';

  -- ── Service en pause (interrupteur manuel) ────────────────────────
  if v_service is not null and (v_service->>'ouvert') = 'false' then
    raise exception 'Le restaurant ne prend pas de commande pour le moment.'
      using errcode = 'P0001';
  end if;

  -- ── Horaires d'ouverture (si un planning est configuré) ───────────
  if v_horaires is not null
     and jsonb_typeof(v_horaires->'planning') = 'array'
     and jsonb_array_length(v_horaires->'planning') = 7 then
    v_local   := now() at time zone 'Africa/Casablanca';
    v_dow     := extract(isodow from v_local)::int;          -- 1=lundi … 7=dimanche
    v_day     := v_horaires->'planning'->(v_dow - 1);
    v_now_min := extract(hour from v_local)::int * 60 + extract(minute from v_local)::int;

    if v_day is null or coalesce((v_day->>'ouvert')::boolean, false) = false then
      v_open := false;
    else
      v_ouvre_min := split_part(coalesce(v_day->>'ouvre','00:00'), ':', 1)::int * 60
                   + split_part(coalesce(v_day->>'ouvre','00:00'), ':', 2)::int;
      v_ferme_min := split_part(coalesce(v_day->>'ferme','23:59'), ':', 1)::int * 60
                   + split_part(coalesce(v_day->>'ferme','23:59'), ':', 2)::int;
      if v_ferme_min = 0 then v_ferme_min := 1440; end if;   -- 00:00 = minuit (fin)
      if v_ferme_min <= v_ouvre_min then                      -- service à cheval sur minuit
        v_open := v_now_min >= v_ouvre_min or v_now_min < v_ferme_min;
      else
        v_open := v_now_min >= v_ouvre_min and v_now_min < v_ferme_min;
      end if;
    end if;

    if not v_open then
      raise exception 'Le restaurant est actuellement fermé. Consultez nos horaires.'
        using errcode = 'P0001';
    end if;
  end if;

  -- ── 1) Recalcul du sous-total depuis les prix RÉELS des plats ─────
  for it in select * from jsonb_array_elements(coalesce(payload->'items', '[]'::jsonb))
  loop
    v_item_id := case
      when (it->>'menu_item_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then (it->>'menu_item_id')::uuid else null end;

    if v_item_id is null then
      raise exception 'Un article de votre panier est invalide. Rechargez la carte.'
        using errcode = 'P0001';
    end if;

    select prix, nom, disponible into v_prix, v_nom, v_dispo
    from menu_items where id = v_item_id;

    if v_prix is null then
      raise exception 'Un article de votre panier n''existe plus.'
        using errcode = 'P0001';
    end if;
    if not v_dispo then
      raise exception 'L''article « % » n''est plus disponible.', v_nom
        using errcode = 'P0001';
    end if;

    v_qte := greatest(coalesce((it->>'quantite')::int, 1), 1);
    v_sous_total := v_sous_total + v_prix * v_qte;
  end loop;

  if v_sous_total <= 0 then
    raise exception 'Votre panier est vide.' using errcode = 'P0001';
  end if;

  -- ── 2) Frais de livraison selon le quartier (réglages admin) ──────
  if v_type = 'livraison' then
    if v_livraison is not null then
      select coalesce((q->>'frais')::numeric, (v_livraison->>'frais_par_defaut')::numeric)
        into v_frais
      from jsonb_array_elements(coalesce(v_livraison->'quartiers', '[]'::jsonb)) q
      where q->>'nom' = v_quartier
      limit 1;
      v_frais := coalesce(v_frais, (v_livraison->>'frais_par_defaut')::numeric, 0);
      v_min   := coalesce((v_livraison->>'minimum_commande')::numeric, 0);
    end if;

    if v_sous_total < v_min then
      raise exception 'Minimum de % dh pour la livraison.', v_min using errcode = 'P0001';
    end if;
  end if;

  -- ── 3) Code promo : validation + remise recalculées serveur ───────
  if v_code is not null then
    select * into v_promo from promo_codes where upper(code) = upper(v_code) limit 1;
    if found
       and v_promo.actif
       and (v_promo.expire_le is null or v_promo.expire_le > now())
       and v_sous_total >= v_promo.min_commande then
      if v_promo.type = 'pourcentage' then
        v_remise := round(v_sous_total * v_promo.valeur / 100);
      else
        v_remise := least(v_promo.valeur, v_sous_total);
      end if;
      v_code := v_promo.code;   -- normalise la casse
    else
      v_code   := null;          -- code refusé → aucune remise
      v_remise := 0;
    end if;
  end if;

  v_total := greatest(0, v_sous_total + v_frais - v_remise);

  -- ── 4) Insertion de la commande avec les montants vérifiés ────────
  insert into orders (type, client_nom, client_telephone, adresse, quartier, notes,
                      latitude, longitude,
                      sous_total, frais_livraison, remise, code_promo, total)
  values (
    v_type,
    coalesce(payload->>'client_nom', ''),
    coalesce(payload->>'client_telephone', ''),
    nullif(payload->>'adresse', ''),
    v_quartier,
    nullif(payload->>'notes', ''),
    v_lat,
    v_lng,
    v_sous_total,
    v_frais,
    v_remise,
    v_code,
    v_total
  )
  returning id, token into new_id, new_token;

  -- ── 5) Lignes de commande (nom + prix = snapshot serveur) ─────────
  for it in select * from jsonb_array_elements(coalesce(payload->'items', '[]'::jsonb))
  loop
    v_item_id := (it->>'menu_item_id')::uuid;
    select prix, nom into v_prix, v_nom from menu_items where id = v_item_id;
    insert into order_items (order_id, menu_item_id, nom, quantite, prix_unitaire, options_choisies)
    values (
      new_id,
      v_item_id,
      v_nom,
      greatest(coalesce((it->>'quantite')::int, 1), 1),
      v_prix,
      coalesce(it->'options_choisies', '{}'::jsonb)
    );
  end loop;

  return jsonb_build_object('id', new_id, 'token', new_token);
end;
$$;

revoke all on function create_order(jsonb) from public;
grant execute on function create_order(jsonb) to anon, authenticated;
