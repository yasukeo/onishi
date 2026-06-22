-- ════════════════════════════════════════════════════════════════════
-- Onishi — 0001_schema.sql
-- Schéma de base : menu, commandes, staff, journal de statuts.
-- Conforme à la section 7 du brief. Le RLS est dans 0002_rls.sql.
-- ════════════════════════════════════════════════════════════════════

-- Extensions utiles
create extension if not exists "pgcrypto";        -- gen_random_uuid()

-- ── Enums ───────────────────────────────────────────────────────────
do $$ begin
  create type order_status as enum
    ('nouvelle', 'confirmee', 'en_preparation', 'en_livraison', 'livree', 'annulee');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_type as enum ('livraison', 'emporter');
exception when duplicate_object then null; end $$;

do $$ begin
  create type staff_role as enum ('admin', 'employe', 'livreur');
exception when duplicate_object then null; end $$;

-- ── Catégories ──────────────────────────────────────────────────────
create table if not exists categories (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  nom             text not null,
  ordre_affichage int  not null default 0,
  cree_le         timestamptz not null default now()
);

-- ── Plats ───────────────────────────────────────────────────────────
create table if not exists menu_items (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references categories(id) on delete cascade,
  nom          text not null,
  description  text,
  prix         numeric(10,2) not null check (prix >= 0),
  photo_url    text,
  disponible   boolean not null default true,
  -- options : ex. [{ "nom": "Sauce", "choix": ["spicy mayo","anguille"] }]
  options      jsonb not null default '[]'::jsonb,
  ordre_affichage int not null default 0,
  cree_le      timestamptz not null default now(),
  maj_le       timestamptz not null default now()
);
create index if not exists menu_items_category_idx on menu_items(category_id);

-- ── Personnel (lié à auth.users) ────────────────────────────────────
create table if not exists staff_users (
  id        uuid primary key references auth.users(id) on delete cascade,
  nom       text not null,
  role      staff_role not null default 'employe',
  actif     boolean not null default true,
  cree_le   timestamptz not null default now()
);

-- ── Commandes ───────────────────────────────────────────────────────
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  -- token non devinable renvoyé au client anonyme pour suivre SA commande
  token            uuid not null unique default gen_random_uuid(),
  -- numéro court lisible pour la cuisine (ex. #A37) — généré par séquence
  numero           bigint generated always as identity,
  statut           order_status not null default 'nouvelle',
  type             order_type   not null,
  client_nom       text not null,
  client_telephone text not null,
  adresse          text,                 -- requis si type = livraison
  quartier         text,                 -- zone de livraison choisie
  notes            text,
  sous_total       numeric(10,2) not null default 0,
  frais_livraison  numeric(10,2) not null default 0,
  total            numeric(10,2) not null default 0,
  -- v1 : paiement à la livraison/au retrait (cash). Champs prêts pour la phase 2.
  mode_paiement    text not null default 'cash',
  paiement_statut  text not null default 'a_la_livraison',
  livreur_id       uuid references staff_users(id) on delete set null,
  creee_le         timestamptz not null default now(),
  maj_le           timestamptz not null default now()
);
create index if not exists orders_statut_idx on orders(statut);
create index if not exists orders_creee_le_idx on orders(creee_le desc);
create index if not exists orders_token_idx on orders(token);

-- ── Lignes de commande ──────────────────────────────────────────────
create table if not exists order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id) on delete cascade,
  menu_item_id    uuid references menu_items(id) on delete set null,
  nom             text not null,            -- snapshot du nom au moment de la commande
  quantite        int  not null check (quantite > 0),
  prix_unitaire   numeric(10,2) not null,
  options_choisies jsonb not null default '{}'::jsonb
);
create index if not exists order_items_order_idx on order_items(order_id);

-- ── Journal de statuts ──────────────────────────────────────────────
create table if not exists order_status_log (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  statut      order_status not null,
  horodatage  timestamptz not null default now(),
  change_par  uuid references staff_users(id) on delete set null
);
create index if not exists order_status_log_order_idx on order_status_log(order_id);

-- ── Réglages (zone de livraison configurable depuis l'admin) ────────
-- Jamais codée en dur dans le frontend (cf. brief 0.3).
create table if not exists settings (
  cle     text primary key,
  valeur  jsonb not null,
  maj_le  timestamptz not null default now()
);

-- ── Triggers : maj_le automatique ───────────────────────────────────
create or replace function set_maj_le() returns trigger as $$
begin
  new.maj_le = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_menu_items_maj on menu_items;
create trigger trg_menu_items_maj before update on menu_items
  for each row execute function set_maj_le();

drop trigger if exists trg_orders_maj on orders;
create trigger trg_orders_maj before update on orders
  for each row execute function set_maj_le();

-- ── Trigger : journaliser tout changement de statut de commande ─────
create or replace function log_order_status() returns trigger as $$
begin
  if (tg_op = 'INSERT') or (new.statut is distinct from old.statut) then
    insert into order_status_log(order_id, statut, change_par)
    values (new.id, new.statut, auth.uid());
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_orders_log on orders;
create trigger trg_orders_log after insert or update on orders
  for each row execute function log_order_status();

-- ── Realtime : exposer orders pour le suivi client + dashboard admin ─
do $$ begin
  alter publication supabase_realtime add table orders;
exception when duplicate_object then null; end $$;
