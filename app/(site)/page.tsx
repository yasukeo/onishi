import Link from "next/link";
import { ArrowRight, Clock, MapPin, Sparkles, Truck, ShoppingBag } from "lucide-react";
import { DishImage } from "@/components/site/dish-image";
import { FeaturedDishes } from "@/components/site/featured-dishes";
import { HomeDeals } from "@/components/site/home-deals";
import { RestaurantJsonLd } from "@/components/seo/restaurant-jsonld";
import { formatDh } from "@/lib/utils";
import { HORAIRES_TEXTE } from "@/lib/data/settings-default";

const MAPS_URL =
  "https://www.google.com/maps/place/Onishi/@33.9406475,-6.8983935,18z/data=!4m6!3m5!1s0xda713b471b89103:0x35c222edc95891e6!8m2!3d33.9407112!4d-6.8984887";

export default function HomePage() {
  return (
    <>
      <RestaurantJsonLd />
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden wave-bg bg-terracotta text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/15 px-3 py-1 text-xs font-medium tracking-wide">
              <Sparkles className="h-3.5 w-3.5" /> Authentic Sushi · Témara
            </span>
            <h1 className="mt-5 font-serif text-5xl leading-[1.05] sm:text-6xl">
              L&apos;art du sushi,
              <br />
              <span className="text-cream/90">servi avec soin.</span>
            </h1>
            <p className="mt-5 max-w-md text-cream/85">
              Rolls flambés, sashimi taillés minute et nos célèbres Onishi Deals.
              Commandez en quelques clics, à emporter ou en livraison.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-cream px-6 font-medium text-terracotta-700 transition-transform hover:scale-[1.02]"
              >
                <ShoppingBag className="h-4 w-4" /> Commander en ligne
              </Link>
              <Link
                href="/menu"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-cream/40 px-6 font-medium text-cream hover:bg-cream/10"
              >
                Voir la carte <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-cream/75">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> 12h – minuit (fermé mardi)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4" /> Livraison Témara
              </span>
            </div>
          </div>

          <div className="relative animate-fade-up">
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] shadow-2xl ring-1 ring-cream/20">
              <DishImage
                src="/plats/roll-volcano.png"
                alt="Roll Volcano — plat signature"
                seed={1}
                className="h-full w-full"
                sizes="(max-width: 1024px) 90vw, 440px"
              />
            </div>
            <div className="absolute -bottom-4 left-4 rounded-2xl bg-cream px-4 py-3 text-ink shadow-lg sm:left-0">
              <p className="text-xs text-ink-soft">Le signature</p>
              <p className="font-serif text-lg leading-tight">Roll Volcano</p>
              <p className="text-sm font-semibold text-terracotta">{formatDh(115)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Onishi Deals (depuis le menu réel) ───────────────── */}
      <HomeDeals />

      <div className="wave-divider" />

      {/* ── Sélection (depuis le menu réel) ──────────────────── */}
      <FeaturedDishes />

      {/* ── Histoire + localisation ──────────────────────────── */}
      <section className="bg-sand">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-terracotta">
              Notre maison
            </p>
            <h2 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">
              Le raffinement japonais, à Témara
            </h2>
            <p className="mt-4 text-ink-soft">
              Chez Onishi, chaque plateau est dressé comme un tableau : présentation
              sur plateau-bateau en bois, fleurs comestibles, sauces en zigzag et
              poisson d&apos;une fraîcheur irréprochable. Un positionnement haut de
              gamme, pensé pour le plaisir et le partage.
            </p>
            <Link
              href="/a-propos"
              className="mt-6 inline-flex items-center gap-1 font-medium text-terracotta hover:gap-2"
            >
              Découvrir notre histoire <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-sand-deep bg-cream p-6">
            <h3 className="font-serif text-2xl text-ink">Nous trouver</h3>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
                <div>
                  <p className="font-medium text-ink">Témara, centre-ville</p>
                  <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="text-terracotta hover:underline">
                    Ouvrir dans Google Maps
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
                <div>
                  <p className="font-medium text-ink">Horaires</p>
                  <p className="text-ink-soft">{HORAIRES_TEXTE}</p>
                </div>
              </li>
            </ul>
            <Link
              href="/localisation"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-terracotta px-5 font-medium text-cream hover:bg-terracotta-600"
            >
              Voir le plan & contact
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
