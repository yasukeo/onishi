"use client";

// ════════════════════════════════════════════════════════════════════
// API de données unifiée (client). Branche automatiquement :
//   • Supabase si configuré (Postgres + RLS + Realtime)
//   • sinon MODE DÉMO (lib/data/demo.ts, localStorage)
// ════════════════════════════════════════════════════════════════════

import { getSupabaseBrowser } from "../supabase/client";
import { isSupabaseConfigured } from "../supabase/config";
import type {
  CategoryWithItems,
  CreateOrderInput,
  LivraisonSettings,
  MenuItem,
  OrderAdmin,
  OrderPublic,
  OrderStatus,
} from "../types";
import { DEFAULT_LIVRAISON } from "./settings-default";
import * as demo from "./demo";

// ── Commandes ───────────────────────────────────────────────────────
export async function createOrder(
  input: CreateOrderInput
): Promise<{ id: string; token: string }> {
  const sb = getSupabaseBrowser();
  if (!sb) return demo.createOrderDemo(input);

  const { data: order, error } = await sb
    .from("orders")
    .insert({
      type: input.type,
      client_nom: input.client_nom,
      client_telephone: input.client_telephone,
      adresse: input.adresse,
      quartier: input.quartier,
      notes: input.notes,
      sous_total: input.sous_total,
      frais_livraison: input.frais_livraison,
      total: input.total,
    })
    .select("id, token")
    .single();
  if (error || !order) throw error ?? new Error("Création de commande impossible");

  const items = input.items.map((i) => ({
    order_id: order.id,
    menu_item_id: i.menu_item_id.startsWith("itm-") ? null : i.menu_item_id,
    nom: i.nom,
    quantite: i.quantite,
    prix_unitaire: i.prix_unitaire,
    options_choisies: i.options_choisies,
  }));
  const { error: itemsError } = await sb.from("order_items").insert(items);
  if (itemsError) throw itemsError;

  return { id: order.id as string, token: order.token as string };
}

export async function getOrderByToken(token: string): Promise<OrderPublic | null> {
  const sb = getSupabaseBrowser();
  if (!sb) return demo.getOrderByTokenDemo(token);

  const { data, error } = await sb.rpc("get_order_by_token", { p_token: token });
  if (error || !data) return null;
  return data as OrderPublic;
}

export async function listOrders(): Promise<OrderAdmin[]> {
  const sb = getSupabaseBrowser();
  if (!sb) return demo.listOrdersDemo();

  const { data, error } = await sb
    .from("orders")
    .select(
      "*, items:order_items(nom, quantite, prix_unitaire, options_choisies), historique:order_status_log(statut, horodatage)"
    )
    .order("creee_le", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as OrderAdmin[]).map((o) => ({
    ...o,
    historique: [...(o.historique ?? [])].sort(
      (a, b) => new Date(a.horodatage).getTime() - new Date(b.horodatage).getTime()
    ),
  }));
}

export async function getOrderById(id: string): Promise<OrderAdmin | null> {
  const sb = getSupabaseBrowser();
  if (!sb) return demo.getOrderByIdDemo(id);

  const { data, error } = await sb
    .from("orders")
    .select(
      "*, items:order_items(nom, quantite, prix_unitaire, options_choisies), historique:order_status_log(statut, horodatage)"
    )
    .eq("id", id)
    .single();
  if (error || !data) return null;
  const o = data as unknown as OrderAdmin;
  o.historique = [...(o.historique ?? [])].sort(
    (a, b) => new Date(a.horodatage).getTime() - new Date(b.horodatage).getTime()
  );
  return o;
}

export async function updateOrderStatus(id: string, statut: OrderStatus): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) return demo.updateOrderStatusDemo(id, statut);
  const { error } = await sb.from("orders").update({ statut }).eq("id", id);
  if (error) throw error;
}

export async function assignLivreur(id: string, livreurId: string | null): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) return demo.assignLivreurDemo(id, livreurId);
  const { error } = await sb.from("orders").update({ livreur_id: livreurId }).eq("id", id);
  if (error) throw error;
}

/**
 * S'abonne aux changements de commandes (realtime). Renvoie une fonction de
 * désabonnement. Le callback est appelé à chaque insert/update.
 */
export function subscribeOrders(onChange: () => void): () => void {
  const sb = getSupabaseBrowser();
  if (!sb) return demo.subscribeDemo(onChange);

  const channel = sb
    .channel("orders-stream")
    .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, onChange)
    .subscribe();
  return () => {
    sb.removeChannel(channel);
  };
}

// ── Menu ────────────────────────────────────────────────────────────
export async function getMenu(): Promise<CategoryWithItems[]> {
  const sb = getSupabaseBrowser();
  if (!sb) return demo.getMenuDemo();

  const { data, error } = await sb
    .from("categories")
    .select("*, items:menu_items(*)")
    .order("ordre_affichage", { ascending: true });
  if (error || !data) return [];
  return (data as unknown as CategoryWithItems[]).map((c) => ({
    ...c,
    items: [...(c.items ?? [])].sort((a, b) => a.ordre_affichage - b.ordre_affichage),
  }));
}

export async function patchMenuItem(id: string, patch: Partial<MenuItem>): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) return demo.patchMenuItemDemo(id, patch);
  const { error } = await sb.from("menu_items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function addMenuItem(item: Omit<MenuItem, "id">): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) {
    demo.addMenuItemDemo(item);
    return;
  }
  const { error } = await sb.from("menu_items").insert(item);
  if (error) throw error;
}

export async function removeMenuItem(id: string): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) return demo.removeMenuItemDemo(id);
  const { error } = await sb.from("menu_items").delete().eq("id", id);
  if (error) throw error;
}

// ── Réglages ────────────────────────────────────────────────────────
export async function getLivraisonSettings(): Promise<LivraisonSettings> {
  const sb = getSupabaseBrowser();
  if (!sb) return DEFAULT_LIVRAISON;
  const { data } = await sb.from("settings").select("valeur").eq("cle", "livraison").single();
  return (data?.valeur as LivraisonSettings) ?? DEFAULT_LIVRAISON;
}

export { isSupabaseConfigured };
