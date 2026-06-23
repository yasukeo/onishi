"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { getServiceStatus, getHoraires } from "@/lib/data/api";
import { DEFAULT_HORAIRES, DEFAULT_SERVICE } from "@/lib/data/settings-default";
import { computeServiceState } from "@/lib/horaires";
import type { HorairesSettings, ServiceStatus } from "@/lib/types";

export function ServiceBanner() {
  const [service, setService] = useState<ServiceStatus>(DEFAULT_SERVICE);
  const [horaires, setHoraires] = useState<HorairesSettings>(DEFAULT_HORAIRES);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    getServiceStatus().then(setService);
    getHoraires().then(setHoraires);
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const etat = computeServiceState(service, horaires, now);
  if (etat.open) return null;

  return (
    <div className="bg-red-600 text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-sm sm:px-6">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <p>{etat.message}</p>
      </div>
    </div>
  );
}
