-- ════════════════════════════════════════════════════════════════════
-- Onishi — 0009_fix_status_log_trigger.sql
-- Correctif : le changement de statut depuis l'admin échouait avec
-- « new row violates row-level security policy for table order_status_log ».
--
-- Cause : le trigger AFTER UPDATE log_order_status s'exécutait avec les
-- droits du staff authentifié et insérait dans order_status_log (RLS active,
-- aucune policy INSERT) -> refus -> update annulé.
--
-- Fix : log_order_status en SECURITY DEFINER (insertion par le propriétaire,
-- bypass RLS). auth.uid() continue d'identifier l'auteur du changement.
-- ════════════════════════════════════════════════════════════════════

create or replace function log_order_status() returns trigger as $$
begin
  if (tg_op = 'INSERT') or (new.statut is distinct from old.statut) then
    insert into order_status_log(order_id, statut, change_par)
    values (new.id, new.statut, auth.uid());
  end if;
  return new;
end; $$ language plpgsql security definer set search_path = public;

revoke all on function log_order_status() from public, anon, authenticated;
