"use client";

// ════════════════════════════════════════════════════════════════════
// API de données (client) — 100 % Supabase (Postgres + RLS + Realtime).
// Plus de mode démo : Supabase est requis (cf. lib/supabase/client.ts).
// ════════════════════════════════════════════════════════════════════

import { getSupabaseBrowser } from "../supabase/client";
import type {
  Category,
  CategoryWithItems,
  CreateOrderInput,
  EtaSettings,
  HorairesSettings,
  LivraisonSettings,
  MenuItem,
  OrderAdmin,
  OrderPublic,
  OrderStatus,
  PromoCode,
  Review,
  ServiceStatus,
  StaffUser,
} from "../types";
import {
  DEFAULT_LIVRAISON,
  DEFAULT_HORAIRES,
  DEFAULT_SERVICE,
  DEFAULT_ETA,
} from "./settings-default";

// ── Commandes ───────────────────────────────────────────────────────
export async function createOrder(
  input: CreateOrderInput
): Promise<{ id: string; token: string }> {
  const sb = getSupabaseBrowser();
  // Un client anonyme peut créer une commande mais ne peut pas la relire (RLS).
  // On passe par une fonction SECURITY DEFINER qui insère commande + lignes,
  // recalcule les montants côté serveur, et renvoie { id, token }.
  const { data, error } = await sb.rpc("create_order", {
    payload: {
      type: input.type,
      client_nom: input.client_nom,
      client_telephone: input.client_telephone,
      adresse: input.adresse,
      quartier: input.quartier,
      notes: input.notes,
      latitude: input.latitude,
      longitude: input.longitude,
      sous_total: input.sous_total,
      frais_livraison: input.frais_livraison,
      remise: input.remise,
      code_promo: input.code_promo,
      total: input.total,
      items: input.items.map((i) => ({
        menu_item_id: i.menu_item_id,
        nom: i.nom,
        quantite: i.quantite,
        prix_unitaire: i.prix_unitaire,
        options_choisies: i.options_choisies,
      })),
    },
  });
  if (error || !data) throw error ?? new Error("Création de commande impossible");

  const res = data as { id: string; token: string };
  return { id: res.id, token: res.token };
}

export async function getOrderByToken(token: string): Promise<OrderPublic | null> {
  const sb = getSupabaseBrowser();
  const { data, error } = await sb.rpc("get_order_by_token", { p_token: token });
  if (error || !data) return null;
  return data as OrderPublic;
}

export async function listOrders(): Promise<OrderAdmin[]> {
  const sb = getSupabaseBrowser();
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
  const { error } = await sb.from("orders").update({ statut }).eq("id", id);
  if (error) throw error;
}

export async function assignLivreur(id: string, livreurId: string | null): Promise<void> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("orders").update({ livreur_id: livreurId }).eq("id", id);
  if (error) throw error;
}

export async function updateOrderNote(id: string, note: string | null): Promise<void> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("orders").update({ note_interne: note }).eq("id", id);
  if (error) throw error;
}

/** Avance plusieurs commandes d'un coup (actions groupées). */
export async function bulkUpdateStatus(ids: string[], statut: OrderStatus): Promise<void> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("orders").update({ statut }).in("id", ids);
  if (error) throw error;
}

/**
 * S'abonne aux changements de commandes (realtime). Renvoie une fonction de
 * désabonnement. Le callback est appelé à chaque insert/update.
 */
export function subscribeOrders(onChange: () => void): () => void {
  const sb = getSupabaseBrowser();
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
  const { error } = await sb.from("menu_items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function addMenuItem(item: Omit<MenuItem, "id">): Promise<void> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("menu_items").insert(item);
  if (error) throw error;
}

export async function removeMenuItem(id: string): Promise<void> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("menu_items").delete().eq("id", id);
  if (error) throw error;
}

// ── Catégories ──────────────────────────────────────────────────────
export async function addCategory(nom: string, ordre: number): Promise<void> {
  const sb = getSupabaseBrowser();
  const slug = nom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const { error } = await sb.from("categories").insert({ nom, slug: slug || `cat-${Date.now()}`, ordre_affichage: ordre });
  if (error) throw error;
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<void> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("categories").update(patch).eq("id", id);
  if (error) throw error;
}

export async function removeCategory(id: string): Promise<void> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ── Upload photo (Supabase Storage, bucket "menu" public) ───────────
export async function uploadPhoto(file: File): Promise<string> {
  const sb = getSupabaseBrowser();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `plats/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from("menu").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = sb.storage.from("menu").getPublicUrl(path);
  return data.publicUrl;
}

// ── Réglages (table settings, clé/valeur jsonb) ─────────────────────
async function getSetting<T>(cle: string, fallback: T): Promise<T> {
  const sb = getSupabaseBrowser();
  const { data } = await sb.from("settings").select("valeur").eq("cle", cle).single();
  return (data?.valeur as T) ?? fallback;
}

async function setSetting(cle: string, valeur: unknown): Promise<void> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("settings").upsert({ cle, valeur, maj_le: new Date().toISOString() });
  if (error) throw error;
}

export const getLivraisonSettings = () => getSetting<LivraisonSettings>("livraison", DEFAULT_LIVRAISON);
export const setLivraisonSettings = (v: LivraisonSettings) => setSetting("livraison", v);
export const getHoraires = () => getSetting<HorairesSettings>("horaires", DEFAULT_HORAIRES);
export const setHoraires = (v: HorairesSettings) => setSetting("horaires", v);
export const getServiceStatus = () => getSetting<ServiceStatus>("service", DEFAULT_SERVICE);
export const setServiceStatus = (v: ServiceStatus) => setSetting("service", v);
export const getEtaSettings = () => getSetting<EtaSettings>("eta", DEFAULT_ETA);
export const setEtaSettings = (v: EtaSettings) => setSetting("eta", v);

// ── Personnel ───────────────────────────────────────────────────────
export async function listStaff(): Promise<StaffUser[]> {
  const sb = getSupabaseBrowser();
  const { data } = await sb.from("staff_users").select("id, nom, role, actif").order("nom");
  return (data as StaffUser[]) ?? [];
}

export async function addStaff(): Promise<{ error: string | null }> {
  // Les comptes staff sont liés à Supabase Auth : on les crée dans
  // Authentication → Add user, puis on attribue le rôle via make_staff().
  return {
    error:
      "Créez d'abord le compte dans Supabase (Authentication → Add user), puis exécutez make_staff('email','Nom','role').",
  };
}

export async function updateStaff(id: string, patch: Partial<StaffUser>): Promise<void> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("staff_users").update(patch).eq("id", id);
  if (error) throw error;
}

export async function removeStaff(id: string): Promise<void> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("staff_users").update({ actif: false }).eq("id", id);
  if (error) throw error;
}

export async function listLivreurs(): Promise<StaffUser[]> {
  return (await listStaff()).filter((s) => s.role === "livreur" && s.actif);
}

// ── Codes promo ─────────────────────────────────────────────────────
export async function listPromos(): Promise<PromoCode[]> {
  const sb = getSupabaseBrowser();
  const { data } = await sb.from("promo_codes").select("*").order("code");
  return (data as PromoCode[]) ?? [];
}

export async function addPromo(p: Omit<PromoCode, "id">): Promise<void> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("promo_codes").insert(p);
  if (error) throw error;
}

export async function updatePromo(id: string, patch: Partial<PromoCode>): Promise<void> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("promo_codes").update(patch).eq("id", id);
  if (error) throw error;
}

export async function removePromo(id: string): Promise<void> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.from("promo_codes").delete().eq("id", id);
  if (error) throw error;
}

/** Valide un code promo et calcule la remise applicable (vérifié à nouveau côté serveur). */
export async function validatePromo(
  code: string,
  sousTotal: number
): Promise<{ ok: boolean; remise: number; message: string; code: string }> {
  const promos = await listPromos();
  const p = promos.find((x) => x.code.toUpperCase() === code.trim().toUpperCase());
  if (!p) return { ok: false, remise: 0, message: "Code inconnu.", code };
  if (!p.actif) return { ok: false, remise: 0, message: "Code inactif.", code };
  if (p.expire_le && new Date(p.expire_le) < new Date())
    return { ok: false, remise: 0, message: "Code expiré.", code };
  if (sousTotal < p.min_commande)
    return { ok: false, remise: 0, message: `Minimum ${p.min_commande} dh pour ce code.`, code };
  const remise =
    p.type === "pourcentage" ? Math.round((sousTotal * p.valeur) / 100) : Math.min(p.valeur, sousTotal);
  return { ok: true, remise, message: `Code ${p.code} appliqué.`, code: p.code };
}

// ── Avis clients ────────────────────────────────────────────────────
export async function listReviews(): Promise<Review[]> {
  const sb = getSupabaseBrowser();
  const { data } = await sb.from("reviews").select("*").order("creee_le", { ascending: false });
  return (data as Review[]) ?? [];
}

export async function addReview(
  orderToken: string,
  note: number,
  commentaire: string | null
): Promise<boolean> {
  const sb = getSupabaseBrowser();
  const { error } = await sb.rpc("add_review_by_token", {
    p_token: orderToken,
    p_note: note,
    p_commentaire: commentaire,
  });
  return !error;
}
