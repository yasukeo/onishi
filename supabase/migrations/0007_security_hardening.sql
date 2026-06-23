-- ════════════════════════════════════════════════════════════════════
-- Onishi — 0007_security_hardening.sql
-- Corrections issues du linter de sécurité Supabase (get_advisors).
-- ════════════════════════════════════════════════════════════════════

-- 1) make_staff : amorçage admin réservé au SQL Editor / service role.
--    SANS ceci, un utilisateur connecté pourrait se promouvoir admin.
revoke all on function public.make_staff(text, text, public.staff_role) from public, anon, authenticated;

-- 2) Fonctions internes (trigger / helper) hors API publique.
revoke all on function public.enforce_order_update_perms() from public, anon, authenticated;
revoke all on function public.staff_role_of(uuid) from public, anon, authenticated;

-- 3) Vue admin exécutée avec les droits de l'appelant (respect du RLS).
alter view public.reviews_admin set (security_invoker = on);

-- 4) search_path figé sur les fonctions trigger.
alter function public.set_maj_le() set search_path = public;
alter function public.log_order_status() set search_path = public;

-- 5) Bucket public "menu" : retirer la policy de listage large
--    (l'accès par URL publique fonctionne sans).
drop policy if exists "menu public read" on storage.objects;

-- Note : les fonctions get_order_by_token / add_review_by_token restent
-- exécutables par anon (RPC publics volontaires, limités au token).
-- is_staff / is_admin restent exécutables (helpers utilisés par les policies RLS).
