"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

let _client: SupabaseClient | null = null;

/**
 * Client Supabase navigateur (singleton). Retourne null en MODE DÉMO,
 * ce qui permet à la couche data de basculer sur le stockage local.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (_client) return _client;
  _client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _client;
}
