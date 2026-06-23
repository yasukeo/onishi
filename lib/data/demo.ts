"use client";

// ════════════════════════════════════════════════════════════════════
// MODE DÉMO — backend simulé en localStorage (aucun Supabase requis).
// Permet de pitcher tout le parcours : commande client + suivi temps réel
// + dashboard admin, synchronisés entre onglets via BroadcastChannel.
// Dès que Supabase est configuré, ce module n'est plus utilisé (cf. api.ts).
// ════════════════════════════════════════════════════════════════════

import type {
  Category,
  CategoryWithItems,
  CreateOrderInput,
  HorairesSettings,
  LivraisonSettings,
  MenuItem,
  OrderAdmin,
  OrderStatus,
  PromoCode,
  Review,
  ServiceStatus,
  StaffUser,
} from "../types";
import { MENU } from "../menu-data";
import { DEFAULT_LIVRAISON, DEFAULT_HORAIRES, DEFAULT_SERVICE, DEFAULT_STAFF, DEFAULT_PROMOS } from "./settings-default";

const ORDERS_KEY = "onishi:demo:orders";
const COUNTER_KEY = "onishi:demo:counter";
const MENU_KEY = "onishi:demo:menu-overrides";
const SETTINGS_KEY = "onishi:demo:settings";
const STAFF_KEY = "onishi:demo:staff-list";
const PROMOS_KEY = "onishi:demo:promos";
const REVIEWS_KEY = "onishi:demo:reviews";

type Listener = () => void;
const listeners = new Set<Listener>();
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!channel && "BroadcastChannel" in window) {
    channel = new BroadcastChannel("onishi-demo");
    channel.onmessage = () => listeners.forEach((l) => l());
  }
  return channel;
}

function emit() {
  listeners.forEach((l) => l());
  getChannel()?.postMessage("update");
}

/** S'abonner aux changements (orders ou menu). Retourne une fonction de désabonnement. */
export function subscribeDemo(listener: Listener): () => void {
  listeners.add(listener);
  getChannel();
  const onStorage = (e: StorageEvent) => {
    if (e.key === ORDERS_KEY || e.key === MENU_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// ── Orders ──────────────────────────────────────────────────────────
function readOrders(): OrderAdmin[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? "[]") as OrderAdmin[];
  } catch {
    return [];
  }
}

function writeOrders(orders: OrderAdmin[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  emit();
}

function nextNumero(): number {
  const cur = parseInt(localStorage.getItem(COUNTER_KEY) ?? "100", 10);
  const next = cur + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return next;
}

function uid(): string {
  return crypto.randomUUID();
}

export function createOrderDemo(input: CreateOrderInput): { id: string; token: string } {
  const now = new Date().toISOString();
  const id = uid();
  const token = uid();
  const order: OrderAdmin = {
    id,
    token,
    numero: nextNumero(),
    statut: "nouvelle",
    type: input.type,
    client_nom: input.client_nom,
    client_telephone: input.client_telephone,
    adresse: input.adresse,
    quartier: input.quartier,
    notes: input.notes,
    latitude: input.latitude,
    longitude: input.longitude,
    note_interne: null,
    code_promo: input.code_promo,
    sous_total: input.sous_total,
    frais_livraison: input.frais_livraison,
    remise: input.remise,
    total: input.total,
    livreur_id: null,
    creee_le: now,
    maj_le: now,
    items: input.items.map((i) => ({
      nom: i.nom,
      quantite: i.quantite,
      prix_unitaire: i.prix_unitaire,
      options_choisies: i.options_choisies,
    })),
    historique: [{ statut: "nouvelle", horodatage: now }],
  };
  writeOrders([order, ...readOrders()]);
  return { id, token };
}

export function listOrdersDemo(): OrderAdmin[] {
  return readOrders().sort(
    (a, b) => new Date(b.creee_le).getTime() - new Date(a.creee_le).getTime()
  );
}

export function getOrderByTokenDemo(token: string): OrderAdmin | null {
  return readOrders().find((o) => o.token === token) ?? null;
}

export function getOrderByIdDemo(id: string): OrderAdmin | null {
  return readOrders().find((o) => o.id === id) ?? null;
}

export function updateOrderStatusDemo(id: string, statut: OrderStatus) {
  const orders = readOrders();
  const o = orders.find((x) => x.id === id);
  if (!o) return;
  const now = new Date().toISOString();
  o.statut = statut;
  o.maj_le = now;
  o.historique = [...o.historique, { statut, horodatage: now }];
  writeOrders(orders);
}

export function assignLivreurDemo(id: string, livreurId: string | null) {
  const orders = readOrders();
  const o = orders.find((x) => x.id === id);
  if (!o) return;
  o.livreur_id = livreurId;
  o.maj_le = new Date().toISOString();
  writeOrders(orders);
}

export function updateOrderNoteDemo(id: string, note: string | null) {
  const orders = readOrders();
  const o = orders.find((x) => x.id === id);
  if (!o) return;
  o.note_interne = note;
  writeOrders(orders);
}

// ── Menu (overrides admin en démo) ──────────────────────────────────
interface MenuOverrides {
  patched: Record<string, Partial<MenuItem>>;
  added: MenuItem[];
  removed: string[];
  catPatched: Record<string, Partial<Category>>;
  catAdded: Category[];
  catRemoved: string[];
}

function readOverrides(): MenuOverrides {
  const empty: MenuOverrides = {
    patched: {}, added: [], removed: [], catPatched: {}, catAdded: [], catRemoved: [],
  };
  if (typeof window === "undefined") return empty;
  try {
    return { ...empty, ...(JSON.parse(localStorage.getItem(MENU_KEY) ?? "{}") as MenuOverrides) };
  } catch {
    return empty;
  }
}

function writeOverrides(o: MenuOverrides) {
  localStorage.setItem(MENU_KEY, JSON.stringify(o));
  emit();
}

/** Menu effectif (seed + overrides) pour le mode démo. */
export function getMenuDemo(): CategoryWithItems[] {
  const ov = readOverrides();
  const cats = [
    ...MENU.filter((c) => !ov.catRemoved.includes(c.id)).map((c) => ({ ...c, ...ov.catPatched[c.id] })),
    ...ov.catAdded.map((c) => ({ ...c, items: [] as MenuItem[] })),
  ];
  return cats
    .map((cat) => {
      const base = (MENU.find((c) => c.id === cat.id)?.items ?? [])
        .filter((i) => !ov.removed.includes(i.id))
        .map((i) => ({ ...i, ...ov.patched[i.id] }));
      const extra = ov.added.filter((i) => i.category_id === cat.id);
      return { ...cat, items: [...base, ...extra] };
    })
    .sort((a, b) => a.ordre_affichage - b.ordre_affichage);
}

// ── Catégories (démo) ───────────────────────────────────────────────
export function addCategoryDemo(nom: string): Category {
  const ov = readOverrides();
  const maxOrdre = Math.max(0, ...MENU.map((c) => c.ordre_affichage), ...ov.catAdded.map((c) => c.ordre_affichage));
  const slug = nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const cat: Category = { id: `cat-custom-${uid().slice(0, 8)}`, slug: slug || `cat-${uid().slice(0, 4)}`, nom, ordre_affichage: maxOrdre + 1 };
  ov.catAdded.push(cat);
  writeOverrides(ov);
  return cat;
}

export function updateCategoryDemo(id: string, patch: Partial<Category>) {
  const ov = readOverrides();
  const i = ov.catAdded.findIndex((c) => c.id === id);
  if (i >= 0) ov.catAdded[i] = { ...ov.catAdded[i], ...patch };
  else ov.catPatched[id] = { ...ov.catPatched[id], ...patch };
  writeOverrides(ov);
}

export function removeCategoryDemo(id: string) {
  const ov = readOverrides();
  const i = ov.catAdded.findIndex((c) => c.id === id);
  if (i >= 0) ov.catAdded.splice(i, 1);
  else if (!ov.catRemoved.includes(id)) ov.catRemoved.push(id);
  writeOverrides(ov);
}

export function patchMenuItemDemo(id: string, patch: Partial<MenuItem>) {
  const ov = readOverrides();
  // si c'est un item ajouté, on le modifie directement
  const addedIdx = ov.added.findIndex((i) => i.id === id);
  if (addedIdx >= 0) {
    ov.added[addedIdx] = { ...ov.added[addedIdx], ...patch };
  } else {
    ov.patched[id] = { ...ov.patched[id], ...patch };
  }
  writeOverrides(ov);
}

export function addMenuItemDemo(item: Omit<MenuItem, "id">): MenuItem {
  const ov = readOverrides();
  const created: MenuItem = { ...item, id: `itm-custom-${uid().slice(0, 8)}` };
  ov.added.push(created);
  writeOverrides(ov);
  return created;
}

export function removeMenuItemDemo(id: string) {
  const ov = readOverrides();
  const addedIdx = ov.added.findIndex((i) => i.id === id);
  if (addedIdx >= 0) {
    ov.added.splice(addedIdx, 1);
  } else if (!ov.removed.includes(id)) {
    ov.removed.push(id);
  }
  writeOverrides(ov);
}

// ── Réglages (démo) ─────────────────────────────────────────────────
function readSettings(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getSettingDemo<T>(cle: string, fallback: T): T {
  const v = readSettings()[cle];
  return (v as T) ?? fallback;
}

export function setSettingDemo(cle: string, valeur: unknown) {
  const s = readSettings();
  s[cle] = valeur;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  emit();
}

// ── Personnel (démo) ────────────────────────────────────────────────
function readStaff(): StaffUser[] {
  if (typeof window === "undefined") return DEFAULT_STAFF;
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    return raw ? (JSON.parse(raw) as StaffUser[]) : DEFAULT_STAFF;
  } catch {
    return DEFAULT_STAFF;
  }
}

function writeStaff(list: StaffUser[]) {
  localStorage.setItem(STAFF_KEY, JSON.stringify(list));
  emit();
}

export function listStaffDemo(): StaffUser[] {
  return readStaff();
}

export function addStaffDemo(nom: string, role: StaffUser["role"]): StaffUser {
  const s = readStaff();
  const u: StaffUser = { id: `staff-${uid().slice(0, 8)}`, nom, role, actif: true };
  writeStaff([...s, u]);
  return u;
}

export function updateStaffDemo(id: string, patch: Partial<StaffUser>) {
  writeStaff(readStaff().map((u) => (u.id === id ? { ...u, ...patch } : u)));
}

export function removeStaffDemo(id: string) {
  writeStaff(readStaff().filter((u) => u.id !== id));
}

// ── Codes promo (démo) ──────────────────────────────────────────────
function readPromos(): PromoCode[] {
  if (typeof window === "undefined") return DEFAULT_PROMOS;
  try {
    const raw = localStorage.getItem(PROMOS_KEY);
    return raw ? (JSON.parse(raw) as PromoCode[]) : DEFAULT_PROMOS;
  } catch {
    return DEFAULT_PROMOS;
  }
}

function writePromos(list: PromoCode[]) {
  localStorage.setItem(PROMOS_KEY, JSON.stringify(list));
  emit();
}

export function listPromosDemo(): PromoCode[] {
  return readPromos();
}

export function addPromoDemo(p: Omit<PromoCode, "id">): PromoCode {
  const created: PromoCode = { ...p, id: `promo-${uid().slice(0, 8)}` };
  writePromos([...readPromos(), created]);
  return created;
}

export function updatePromoDemo(id: string, patch: Partial<PromoCode>) {
  writePromos(readPromos().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export function removePromoDemo(id: string) {
  writePromos(readPromos().filter((p) => p.id !== id));
}

// ── Avis (démo) ─────────────────────────────────────────────────────
function readReviews(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY) ?? "[]") as Review[];
  } catch {
    return [];
  }
}

export function listReviewsDemo(): Review[] {
  return readReviews().sort((a, b) => new Date(b.creee_le).getTime() - new Date(a.creee_le).getTime());
}

export function addReviewDemo(orderToken: string, note: number, commentaire: string | null): boolean {
  const order = readOrders().find((o) => o.token === orderToken);
  if (!order) return false;
  const reviews = readReviews();
  const review: Review = {
    id: uid(),
    order_id: order.id,
    numero: order.numero,
    note,
    commentaire,
    client_nom: order.client_nom,
    creee_le: new Date().toISOString(),
  };
  localStorage.setItem(REVIEWS_KEY, JSON.stringify([review, ...reviews]));
  emit();
  return true;
}

export function resetDemo() {
  [ORDERS_KEY, MENU_KEY, COUNTER_KEY, SETTINGS_KEY, STAFF_KEY, PROMOS_KEY, REVIEWS_KEY].forEach((k) =>
    localStorage.removeItem(k)
  );
  emit();
}
