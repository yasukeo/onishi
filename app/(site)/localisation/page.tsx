import type { Metadata } from "next";
import { MapPin, Clock, Phone, Navigation, Bike } from "lucide-react";
import { HORAIRES_TEXTE, DEFAULT_LIVRAISON } from "@/lib/data/settings-default";
import { formatDh } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Localisation & contact",
  description: "Onishi à Témara : adresse, horaires, plan et zone de livraison.",
};

const LAT = 33.9407112;
const LNG = -6.8984887;
const MAPS_URL =
  "https://www.google.com/maps/place/Onishi/@33.9406475,-6.8983935,18z/data=!4m6!3m5!1s0xda713b471b89103:0x35c222edc95891e6!8m2!3d33.9407112!4d-6.8984887";
const EMBED_URL = `https://www.google.com/maps?q=${LAT},${LNG}&z=17&output=embed`;

export default function LocalisationPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-ink sm:text-5xl">Nous trouver</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          Onishi vous accueille à Témara centre-ville, et livre les quartiers alentour.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-sand-deep">
          <iframe
            title="Plan Onishi Témara"
            src={EMBED_URL}
            className="h-[420px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-[var(--radius-lg)] border border-sand-deep bg-white/70 p-5">
            <h2 className="flex items-center gap-2 font-serif text-xl text-ink">
              <MapPin className="h-5 w-5 text-terracotta" /> Adresse
            </h2>
            <p className="mt-2 text-ink-soft">Témara, centre-ville — adresse exacte à compléter.</p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-11 items-center gap-2 rounded-full bg-terracotta px-5 text-sm font-medium text-cream hover:bg-terracotta-600"
            >
              <Navigation className="h-4 w-4" /> Itinéraire Google Maps
            </a>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-sand-deep bg-white/70 p-5">
            <h2 className="flex items-center gap-2 font-serif text-xl text-ink">
              <Clock className="h-5 w-5 text-terracotta" /> Horaires
            </h2>
            <p className="mt-2 text-ink-soft">{HORAIRES_TEXTE}</p>
            <p className="mt-1 text-xs text-ink-soft/70">Horaires à reconfirmer avec le restaurant.</p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-sand-deep bg-white/70 p-5">
            <h2 className="flex items-center gap-2 font-serif text-xl text-ink">
              <Phone className="h-5 w-5 text-terracotta" /> Contact
            </h2>
            <p className="mt-2 text-ink-soft">Téléphone à compléter avant mise en ligne.</p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-sand-deep bg-white/70 p-5">
            <h2 className="flex items-center gap-2 font-serif text-xl text-ink">
              <Bike className="h-5 w-5 text-terracotta" /> Zone de livraison
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {DEFAULT_LIVRAISON.quartiers.map((q) => (
                <li
                  key={q.nom}
                  className="rounded-full bg-sand px-3 py-1 text-sm text-ink-soft"
                >
                  {q.nom} · {formatDh(q.frais)}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-soft/70">
              Minimum {formatDh(DEFAULT_LIVRAISON.minimum_commande)} pour la livraison.
              Zones configurables depuis l&apos;espace admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
