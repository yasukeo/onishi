"use client";

import { useCallback, useEffect, useState } from "react";
import { getMenu } from "../data/api";
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
  }, [reload]);

  return { menu, loading, reload };
}
