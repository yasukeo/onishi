-- ════════════════════════════════════════════════════════════════════
-- Onishi — 0005_admin_features.sql
-- Fonctionnalités admin avancées : remises/promo, note interne, codes
-- promo, avis clients, statut de service. + RLS associées.
-- ════════════════════════════════════════════════════════════════════

-- ── Colonnes supplémentaires sur orders ─────────────────────────────
alter table orders add column if not exists remise        numeric(10,2) not null default 0;
alter table orders add column if not exists code_promo     text;
alter table orders add column if not exists note_interne   text;

-- ── Codes promo ─────────────────────────────────────────────────────
do $$ begin
  create type promo_type as enum ('pourcentage', 'montant');
exception when duplicate_object then null; end $$;

create table if not exists promo_codes (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,
  type         promo_type not null default 'pourcentage',
  valeur       numeric(10,2) not null check (valeur >= 0),
  min_commande numeric(10,2) not null default 0,
  actif        boolean not null default true,
  expire_le    timestamptz,
  cree_le      timestamptz not null default now()
);

alter table promo_codes enable row level security;

-- Lecture publique (le checkout doit valider un code), écriture admin.
drop policy if exists promo_read on promo_codes;
create policy promo_read on promo_codes for select using (true);

drop policy if exists promo_admin_write on promo_codes;
create policy promo_admin_write on promo_codes
  for all using (is_admin()) with check (is_admin());

-- ── Avis clients ────────────────────────────────────────────────────
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  note        int  not null check (note between 1 and 5),
  commentaire text,
  client_nom  text,
  creee_le    timestamptz not null default now()
);
create index if not exists reviews_order_idx on reviews(order_id);

alter table reviews enable row level security;

-- Le staff lit tous les avis ; personne n'insère/lit en direct côté client
-- (l'insert passe par add_review_by_token, SECURITY DEFINER, ci-dessous).
drop policy if exists reviews_staff_read on reviews;
create policy reviews_staff_read on reviews for select using (is_staff());

-- Vue admin pratique : avis + numéro de commande.
create or replace view reviews_admin as
  select r.id, r.order_id, o.numero, r.note, r.commentaire, r.client_nom, r.creee_le
  from reviews r join orders o on o.id = r.order_id;

-- ── Déposer un avis via le token (client anonyme, commande livrée) ──
create or replace function add_review_by_token(p_token uuid, p_note int, p_commentaire text)
returns boolean as $$
declare o orders%rowtype;
begin
  select * into o from orders where token = p_token;
  if not found then return false; end if;
  if p_note < 1 or p_note > 5 then return false; end if;
  -- un seul avis par commande
  if exists (select 1 from reviews where order_id = o.id) then return false; end if;
  insert into reviews(order_id, note, commentaire, client_nom)
  values (o.id, p_note, p_commentaire, o.client_nom);
  return true;
end; $$ language plpgsql security definer set search_path = public;

revoke all on function add_review_by_token(uuid, int, text) from public;
grant execute on function add_review_by_token(uuid, int, text) to anon, authenticated;

-- ── Statut de service (ouvert/fermé) — réglage par défaut ───────────
insert into settings (cle, valeur) values
  ('service', jsonb_build_object('ouvert', true, 'message', ''))
on conflict (cle) do nothing;

-- ── get_order_by_token : inclure la remise (compat front) ───────────
create or replace function get_order_by_token(p_token uuid)
returns jsonb as $$
  select case when o.id is null then null else jsonb_build_object(
    'id', o.id,
    'numero', o.numero,
    'statut', o.statut,
    'type', o.type,
    'client_nom', o.client_nom,
    'adresse', o.adresse,
    'quartier', o.quartier,
    'sous_total', o.sous_total,
    'frais_livraison', o.frais_livraison,
    'remise', o.remise,
    'total', o.total,
    'creee_le', o.creee_le,
    'maj_le', o.maj_le,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'nom', oi.nom, 'quantite', oi.quantite,
        'prix_unitaire', oi.prix_unitaire, 'options_choisies', oi.options_choisies))
      from order_items oi where oi.order_id = o.id), '[]'::jsonb),
    'historique', coalesce((
      select jsonb_agg(jsonb_build_object('statut', l.statut, 'horodatage', l.horodatage)
        order by l.horodatage)
      from order_status_log l where l.order_id = o.id), '[]'::jsonb)
  ) end
  from (select * from orders where token = p_token) o;
$$ language sql security definer stable set search_path = public;

revoke all on function get_order_by_token(uuid) from public;
grant execute on function get_order_by_token(uuid) to anon, authenticated;

-- ── Seed : quelques codes promo de démonstration ───────────────────
insert into promo_codes (code, type, valeur, min_commande, actif) values
  ('BIENVENUE10', 'pourcentage', 10, 100, true),
  ('LIVRAISON',   'montant',     15, 150, true)
on conflict (code) do nothing;

-- ── Bucket Storage "menu" pour les photos de plats (public en lecture) ──
-- À créer dans Supabase (Storage → New bucket "menu", public) OU :
-- insert into storage.buckets (id, name, public) values ('menu','menu',true)
--   on conflict (id) do nothing;
