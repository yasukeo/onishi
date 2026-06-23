"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { LocateFixed, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LatLng {
  lat: number;
  lng: number;
}

// Témara, par défaut.
const DEFAULT_CENTER: LatLng = { lat: 33.9287, lng: -6.9067 };
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

let leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject();
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = reject;
    document.body.appendChild(script);
  });
  return leafletPromise;
}

/** Pin terracotta de marque (divIcon, évite les images 404 de Leaflet). */
function brandIcon(L: any) {
  return L.divIcon({
    className: "",
    html:
      `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 27 17 27s17-15 17-27C34 7.6 26.4 0 17 0z" fill="#da693f"/>` +
      `<circle cx="17" cy="17" r="6.5" fill="#fff5e6"/></svg>`,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
  });
}

export function LocationPicker({
  value,
  onChange,
  onResolveAddress,
  className,
}: {
  value: LatLng | null;
  onChange: (v: LatLng) => void;
  /** Appelé avec une adresse lisible après géolocalisation / déplacement du pin. */
  onResolveAddress?: (addr: string) => void;
  className?: string;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const onResolveRef = useRef(onResolveAddress);
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  onChangeRef.current = onChange;
  onResolveRef.current = onResolveAddress;

  async function reverseGeocode(p: LatLng) {
    if (!onResolveRef.current) return;
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${p.lat}&lon=${p.lng}&accept-language=fr`,
        { headers: { Accept: "application/json" } }
      );
      const d = await r.json();
      if (d?.display_name) onResolveRef.current?.(d.display_name as string);
    } catch {
      /* silencieux : l'adresse reste saisie manuellement */
    }
  }

  function place(p: LatLng, fly = false) {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([p.lat, p.lng]);
    } else {
      markerRef.current = L.marker([p.lat, p.lng], { draggable: true, icon: brandIcon(L) }).addTo(mapRef.current);
      markerRef.current.on("dragend", () => {
        const ll = markerRef.current.getLatLng();
        const np = { lat: ll.lat, lng: ll.lng };
        onChangeRef.current(np);
        reverseGeocode(np);
      });
    }
    if (fly) mapRef.current.setView([p.lat, p.lng], 16);
  }

  // Initialise la carte une seule fois.
  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapEl.current || mapRef.current) return;
        const start = value ?? DEFAULT_CENTER;
        const map = L.map(mapEl.current, { attributionControl: true }).setView(
          [start.lat, start.lng],
          value ? 16 : 13
        );
        // En prod, définir NEXT_PUBLIC_MAPTILER_KEY pour des tuiles fiables
        // (les tuiles OSM publiques ne sont pas faites pour la production).
        const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
        if (key) {
          L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`, {
            maxZoom: 20,
            tileSize: 512,
            zoomOffset: -1,
            attribution: "© MapTiler © OpenStreetMap",
          }).addTo(map);
        } else {
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
          }).addTo(map);
        }
        map.on("click", (e: any) => {
          const np = { lat: e.latlng.lat, lng: e.latlng.lng };
          place(np);
          onChangeRef.current(np);
          reverseGeocode(np);
        });
        mapRef.current = map;
        if (value) place(value);
        setReady(true);
        // Recalcule la taille (souvent rendu dans un conteneur masqué au départ).
        setTimeout(() => map.invalidateSize(), 60);
      })
      .catch(() => setError("Carte indisponible. Saisissez l'adresse manuellement."));
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        place(p, true);
        onChangeRef.current(p);
        reverseGeocode(p);
        setLocating(false);
      },
      () => {
        setError("Impossible de récupérer votre position. Autorisez la localisation ou placez le repère manuellement.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
          <MapPin className="h-4 w-4 text-terracotta" />
          Placez le repère sur votre position exacte
        </p>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-sand-deep bg-white px-3 text-sm font-medium text-ink transition-colors hover:bg-sand disabled:opacity-60"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4 text-terracotta" />}
          Ma position
        </button>
      </div>

      <div
        ref={mapEl}
        className="relative z-0 h-56 w-full overflow-hidden rounded-[var(--radius-lg)] border border-sand-deep bg-sand"
        role="application"
        aria-label="Carte de sélection de l'adresse de livraison"
      >
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-soft">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement de la carte…
          </div>
        )}
      </div>

      {value && (
        <p className="text-xs text-matcha">
          ✓ Position enregistrée ({value.lat.toFixed(5)}, {value.lng.toFixed(5)}) — elle aidera le livreur.
        </p>
      )}
      {error && <p className="text-xs text-terracotta-700">{error}</p>}
    </div>
  );
}
