-- ════════════════════════════════════════════════════════════════════
-- Onishi — 0002_rls.sql
-- Row Level Security. Règle d'or (brief 7) :
--   • client anonyme : peut CRÉER une commande, lire UNIQUEMENT la sienne
--     (via le token renvoyé à la création) — jamais celles des autres.
--   • staff authentifié : accès selon son rôle.
--   • AUCUNE table sans policy explicite. Jamais de service_role côté client.
-- ════════════════════════════════════════════════════════════════════

-- Active RLS partout (deny-by-default une fois activé).
alter table categories       enable row level security;
alter table menu_items       enable row level security;
alter table staff_users      enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table order_status_log enable row level security;
alter table settings         enable row level security;

-- ── Helpers de rôle (SECURITY DEFINER pour éviter la récursion RLS) ──
create or replace function is_staff() returns boolean as $$
  select exists (
    select 1 from staff_users s
    where s.id = auth.uid() and s.actif = true
  );
$$ language sql security definer stable set search_path = public;

create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from staff_users s
    where s.id = auth.uid() and s.role = 'admin' and s.actif = true
  );
$$ language sql security definer stable set search_path = public;

-- ════════════════════════════════════════════════════════════════════
-- CATEGORIES — lecture publique, écriture admin uniquement.
-- ════════════════════════════════════════════════════════════════════
drop policy if exists categories_read on categories;
create policy categories_read on categories
  for select using (true);

drop policy if exists categories_admin_write on categories;
create policy categories_admin_write on categories
  for all using (is_admin()) with check (is_admin());

-- ════════════════════════════════════════════════════════════════════
-- MENU_ITEMS — lecture publique (le menu est public), écriture admin.
-- ════════════════════════════════════════════════════════════════════
drop policy if exists menu_items_read on menu_items;
create policy menu_items_read on menu_items
  for select using (true);

drop policy if exists menu_items_admin_write on menu_items;
create policy menu_items_admin_write on menu_items
  for all using (is_admin()) with check (is_admin());

-- ════════════════════════════════════════════════════════════════════
-- STAFF_USERS — chaque membre lit sa fiche ; l'admin gère tout.
-- ════════════════════════════════════════════════════════════════════
drop policy if exists staff_self_read on staff_users;
create policy staff_self_read on staff_users
  for select using (id = auth.uid() or is_admin());

drop policy if exists staff_admin_write on staff_users;
create policy staff_admin_write on staff_users
  for all using (is_admin()) with check (is_admin());

-- ════════════════════════════════════════════════════════════════════
-- ORDERS
--   • INSERT : tout le monde (anonyme inclus) peut créer une commande.
--     -> garde-fous via 0001 (CHECK), et le client ne choisit pas le statut.
--   • SELECT : le staff voit tout ; le client anonyme NE lit RIEN par RLS
--     classique. Le suivi par token passe par une fonction SECURITY DEFINER
--     (get_order_by_token) — voir plus bas — pour ne jamais exposer
--     l'ensemble de la table aux anonymes.
--   • UPDATE : staff uniquement.
-- ════════════════════════════════════════════════════════════════════
drop policy if exists orders_insert_anyone on orders;
create policy orders_insert_anyone on orders
  for insert with check (
    -- empêche un anonyme de pré-positionner un statut autre que 'nouvelle'
    statut = 'nouvelle'
  );

drop policy if exists orders_staff_read on orders;
create policy orders_staff_read on orders
  for select using (is_staff());

drop policy if exists orders_staff_update on orders;
create policy orders_staff_update on orders
  for update using (is_staff()) with check (is_staff());

drop policy if exists orders_admin_delete on orders;
create policy orders_admin_delete on orders
  for delete using (is_admin());

-- ════════════════════════════════════════════════════════════════════
-- ORDER_ITEMS
--   • INSERT : autorisé si la commande parente vient d'être créée par la
--     même session (on autorise l'insert tant que la commande existe ;
--     comme un anonyme ne peut pas lire les autres commandes, il ne peut
--     pas deviner d'order_id arbitraire — uuid non énumérable).
--   • SELECT/UPDATE : staff uniquement.
-- ════════════════════════════════════════════════════════════════════
drop policy if exists order_items_insert on order_items;
create policy order_items_insert on order_items
  for insert with check (
    exists (select 1 from orders o where o.id = order_id)
  );

drop policy if exists order_items_staff_read on order_items;
create policy order_items_staff_read on order_items
  for select using (is_staff());

drop policy if exists order_items_staff_write on order_items;
create policy order_items_staff_write on order_items
  for update using (is_staff()) with check (is_staff());

-- ════════════════════════════════════════════════════════════════════
-- ORDER_STATUS_LOG — staff en lecture (rempli par trigger SECURITY DEFINER).
-- ════════════════════════════════════════════════════════════════════
drop policy if exists order_status_log_staff_read on order_status_log;
create policy order_status_log_staff_read on order_status_log
  for select using (is_staff());

-- ════════════════════════════════════════════════════════════════════
-- SETTINGS — lecture publique (la zone de livraison sert au checkout),
-- écriture admin uniquement.
-- ════════════════════════════════════════════════════════════════════
drop policy if exists settings_read on settings;
create policy settings_read on settings
  for select using (true);

drop policy if exists settings_admin_write on settings;
create policy settings_admin_write on settings
  for all using (is_admin()) with check (is_admin());

-- ════════════════════════════════════════════════════════════════════
-- SUIVI CLIENT PAR TOKEN — fonction SECURITY DEFINER.
-- L'anonyme appelle rpc('get_order_by_token', { p_token }) et ne reçoit
-- QUE la commande correspondant au token (non devinable), avec ses lignes
-- et son historique. Aucune donnée des autres commandes n'est exposée.
-- ════════════════════════════════════════════════════════════════════
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
