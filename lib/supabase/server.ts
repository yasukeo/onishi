import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Client Supabase côté serveur (RSC / Route Handlers). Lit/écrit les cookies
 * de session pour l'auth staff. Supabase est requis (plus de mode démo).
 */
export async function getSupabaseServer(): Promise<SupabaseClient> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase non configuré (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY).");
  }
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Appelé depuis un RSC : ignoré (le middleware rafraîchit la session).
        }
      },
    },
  });
}
