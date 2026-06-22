"use client";

import { useEffect, useState } from "react";

/** true uniquement après hydratation — évite les mismatches SSR (panier, etc.). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
