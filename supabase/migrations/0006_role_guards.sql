-- ════════════════════════════════════════════════════════════════════
-- Onishi — 0006_role_guards.sql
-- Durcissement des droits par rôle sur les commandes (défense côté serveur,
-- en complément du contrôle d'accès de l'interface).
--
-- Problème corrigé : la policy `orders_staff_update` autorisait TOUT staff
-- (donc un livreur) à modifier n'importe quelle commande. Désormais un
-- livreur ne peut que faire avancer une LIVRAISON (en_livraison / livree).
-- ════════════════════════════════════════════════════════════════════

create or replace function staff_role_of(uid uuid)
returns staff_role as $$
  select role from staff_users where id = uid and actif = true;
$$ language sql security definer stable set search_path = public;

create or replace function enforce_order_update_perms()
returns trigger as $$
declare r staff_role;
begin
  r := staff_role_of(auth.uid());

  -- admin & cuisine : aucune restriction supplémentaire.
  if r = 'livreur' then
    -- Un livreur ne traite que les livraisons.
    if new.type <> 'livraison' then
      raise exception 'Un livreur ne peut modifier qu''une commande en livraison.';
    end if;
    -- Et uniquement pour la faire avancer : en route / livrée.
    if new.statut not in ('en_livraison', 'livree') then
      raise exception 'Un livreur ne peut définir que les statuts « en livraison » ou « livrée ».';
    end if;
    -- Il ne peut pas toucher au contenu/prix de la commande.
    if new.total is distinct from old.total
       or new.sous_total is distinct from old.sous_total
       or new.client_telephone is distinct from old.client_telephone
       or new.client_nom is distinct from old.client_nom then
      raise exception 'Un livreur ne peut pas modifier le contenu d''une commande.';
    end if;
  end if;

  return new;
end; $$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_orders_role on orders;
create trigger trg_orders_role
  before update on orders
  for each row execute function enforce_order_update_perms();
