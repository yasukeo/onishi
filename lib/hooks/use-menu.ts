"use client";

import { useCallback, useEffect, useState } from "react";
import { getMenu } from "../data/api";
import { isSupabaseConfigured } from "../supabase/config";
import { subscribeDemo } from "../data/demo";
import type { CategoryWithItems } from "../types";

export function useMenu() {
  const [menu, setMenu] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const m = await getMenu();
    setMenu(m);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    if (!isSupabaseConfigured) return subscribeDemo(reload);
  }, [reload]);

  return { menu, loading, reload };
}
