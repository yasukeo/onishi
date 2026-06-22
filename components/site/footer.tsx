import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { LogoLockup } from "@/components/brand/logo";
import { HORAIRES_TEXTE } from "@/lib/data/settings-default";

const MAPS_URL =
  "https://www.google.com/maps/place/Onishi/@33.9406475,-6.8983935,18z/data=!4m6!3m5!1s0xda713b471b89103:0x35c222edc95891e6!8m2!3d33.9407112!4d-6.8984887";

export function Footer() {
  return (
    <footer className="mt-20 wave-bg bg-charcoal text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <LogoLockup light />
          <p className="max-w-xs text-sm text-cream/70">
            Sushi raffiné à Témara. Rolls flambés, sashimi et nos Onishi Deals,
            à emporter ou en livraison.
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-serif text-lg tracking-wide">Navigation</h3>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/menu" className="hover:text-cream">La carte</Link></li>
            <li><Link href="/panier" className="hover:text-cream">Commander</Link></li>
            <li><Link href="/localisation" className="hover:text-cream">Localisation</Link></li>
            <li><Link href="/a-propos" className="hover:text-cream">À propos</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-serif text-lg tracking-wide">Infos</h3>
          <ul className="space-y-3 text-sm text-cream/70">
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
              <span>{HORAIRES_TEXTE}</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                Témara centre-ville — voir sur Google Maps
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
              <span>Téléphone à compléter</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-serif text-lg tracking-wide">Espace équipe</h3>
          <p className="mb-3 text-sm text-cream/70">
            Réception et suivi des commandes en cuisine.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center rounded-full border border-cream/30 px-4 py-2 text-sm font-medium hover:bg-cream/10"
          >
            Accès staff
          </Link>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-cream/50 sm:flex-row">
          <span>© {new Date().getFullYear()} Onishi — Authentic Sushi. Tous droits réservés.</span>
          <span>Maquette de présentation — menu et photos à valider avant mise en ligne.</span>
        </div>
      </div>
    </footer>
  );
}
