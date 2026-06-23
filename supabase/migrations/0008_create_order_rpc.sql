-- ════════════════════════════════════════════════════════════════════
-- Onishi — 0008_create_order_rpc.sql
-- Création de commande par un client anonyme SANS exposer la table orders
-- en lecture. (Le RLS interdit à l'anon de relire la commande, donc un
-- insert().select() classique échoue.) L'app appelle
-- rpc('create_order', { payload }) et reçoit { id, token }.
-- ════════════════════════════════════════════════════════════════════

create or replace function create_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  new_token uuid;
  it jsonb;
begin
  insert into orders (type, client_nom, client_telephone, adresse, quartier, notes,
                      sous_total, frais_livraison, remise, code_promo, total)
  values (
    (payload->>'type')::order_type,
    coalesce(payload->>'client_nom',''),
    coalesce(payload->>'client_telephone',''),
    nullif(payload->>'adresse',''),
    nullif(payload->>'quartier',''),
    nullif(payload->>'notes',''),
    coalesce((payload->>'sous_total')::numeric, 0),
    coalesce((payload->>'frais_livraison')::numeric, 0),
    coalesce((payload->>'remise')::numeric, 0),
    nullif(payload->>'code_promo',''),
    coalesce((payload->>'total')::numeric, 0)
  )
  returning id, token into new_id, new_token;

  for it in select * from jsonb_array_elements(coalesce(payload->'items', '[]'::jsonb))
  loop
    insert into order_items (order_id, menu_item_id, nom, quantite, prix_unitaire, options_choisies)
    values (
      new_id,
      case when (it->>'menu_item_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
           then (it->>'menu_item_id')::uuid else null end,
      coalesce(it->>'nom',''),
      greatest(coalesce((it->>'quantite')::int, 1), 1),
      coalesce((it->>'prix_unitaire')::numeric, 0),
      coalesce(it->'options_choisies', '{}'::jsonb)
    );
  end loop;

  return jsonb_build_object('id', new_id, 'token', new_token);
end;
$$;

revoke all on function create_order(jsonb) from public;
grant execute on function create_order(jsonb) to anon, authenticated;
