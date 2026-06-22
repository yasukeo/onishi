-- ════════════════════════════════════════════════════════════════════
-- Onishi — 0004_admin_bootstrap.sql
-- Confort : promouvoir un compte Auth existant en membre du staff.
-- À exécuter dans le SQL Editor de Supabase APRÈS avoir créé le compte
-- (Authentication → Add user).  Exemple en bas de fichier.
-- ════════════════════════════════════════════════════════════════════

create or replace function make_staff(p_email text, p_nom text, p_role staff_role)
returns void as $$
declare uid uuid;
begin
  select id into uid from auth.users where email = lower(p_email);
  if uid is null then
    raise exception 'Aucun compte Auth pour %. Créez-le d''abord (Authentication → Add user).', p_email;
  end if;
  insert into staff_users (id, nom, role)
  values (uid, p_nom, p_role)
  on conflict (id) do update set nom = excluded.nom, role = excluded.role, actif = true;
end; $$ language plpgsql security definer set search_path = public, auth;

-- ── Exemple (décommentez et adaptez) ────────────────────────────────
-- select make_staff('admin@onishi.ma',   'Gérant',      'admin');
-- select make_staff('cuisine@onishi.ma', 'Cuisine',     'employe');
-- select make_staff('livreur@onishi.ma', 'Livreur 1',   'livreur');
