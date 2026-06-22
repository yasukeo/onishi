"use client";

import { useCallback, useEffect, useState } from "react";
import { listOrders, subscribeOrders } from "../data/api";
import type { OrderAdmin } from "../types";

export function useOrders() {
  const [orders, setOrders] = useState<OrderAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const o = await listOrders();
    setOrders(o);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    return subscribeOrders(reload);
  }, [reload]);

  return { orders, loading, reload };
}
