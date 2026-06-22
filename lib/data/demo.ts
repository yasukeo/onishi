"use client";

// ════════════════════════════════════════════════════════════════════
// MODE DÉMO — backend simulé en localStorage (aucun Supabase requis).
// Permet de pitcher tout le parcours : commande client + suivi temps réel
// + dashboard admin, synchronisés entre onglets via BroadcastChannel.
// Dès que Supabase est configuré, ce module n'est plus utilisé (cf. api.ts).
// ════════════════════════════════════════════════════════════════════

import type {
  CategoryWithItems,
  CreateOrderInput,
  MenuItem,
  OrderAdmin,
  OrderStatus,
} from "../types";
import { MENU } from "../menu-data";

const ORDERS_KEY = "onishi:demo:orders";
const COUNTER_KEY = "onishi:demo:counter";
const MENU_KEY = "onishi:demo:menu-overrides";

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
    sous_total: input.sous_total,
    frais_livraison: input.frais_livraison,
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

// ── Menu (overrides admin en démo) ──────────────────────────────────
interface MenuOverrides {
  patched: Record<string, Partial<MenuItem>>;
  added: MenuItem[];
  removed: string[];
}

function readOverrides(): MenuOverrides {
  if (typeof window === "undefined") return { patched: {}, added: [], removed: [] };
  try {
    return JSON.parse(
      localStorage.getItem(MENU_KEY) ?? '{"patched":{},"added":[],"removed":[]}'
    ) as MenuOverrides;
  } catch {
    return { patched: {}, added: [], removed: [] };
  }
}

function writeOverrides(o: MenuOverrides) {
  localStorage.setItem(MENU_KEY, JSON.stringify(o));
  emit();
}

/** Menu effectif (seed + overrides) pour le mode démo. */
export function getMenuDemo(): CategoryWithItems[] {
  const ov = readOverrides();
  return MENU.map((cat) => {
    const base = cat.items
      .filter((i) => !ov.removed.includes(i.id))
      .map((i) => ({ ...i, ...ov.patched[i.id] }));
    const extra = ov.added.filter((i) => i.category_id === cat.id);
    return { ...cat, items: [...base, ...extra] };
  });
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

export function resetDemo() {
  localStorage.removeItem(ORDERS_KEY);
  localStorage.removeItem(MENU_KEY);
  localStorage.removeItem(COUNTER_KEY);
  emit();
}
