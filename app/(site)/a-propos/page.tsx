import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, Flame, Star, ArrowRight } from "lucide-react";
import { DishImage } from "@/components/site/dish-image";

export const metadata: Metadata = {
  title: "À propos",
  description: "L'histoire d'Onishi, sushi raffiné à Témara.",
};

const VALUES = [
  {
    icon: Leaf,
    titre: "Fraîcheur d'abord",
    texte: "Poisson taillé minute, légumes croquants, sauces maison. Rien n'attend.",
  },
  {
    icon: Flame,
    titre: "Le geste du chef",
    texte: "Rolls flambés au chalumeau, dressage soigné, fleurs comestibles. Le détail compte.",
  },
  {
    icon: Star,
    titre: "Le bon rapport",
    texte: "Une qualité haut de gamme à Témara, sans renoncer à un prix juste.",
  },
];

export default function AProposPage() {
  return (
    <div>
      <section className="wave-bg bg-terracotta text-cream">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <h1 className="font-serif text-4xl sm:text-5xl">Notre histoire</h1>
          <p className="mx-auto mt-4 max-w-2xl text-cream/85">
            Onishi est né d&apos;une idée simple : offrir à Témara une expérience sushi
            soignée, généreuse et accessible. Du plateau-bateau en bois aux gunkan
            colorés, chaque plat raconte le soin que nous mettons en cuisine.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-sand-deep">
          <DishImage src="/plats/delice-saumon.png" alt="Dressage Onishi" seed={2} className="h-full w-full" sizes="(max-width:1024px) 90vw, 540px" />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-terracotta">
            Notre approche
          </p>
          <h2 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">
            Le sushi comme un art du détail
          </h2>
          <p className="mt-4 text-ink-soft">
            Nigiri sur ardoise noire, gunkan au tobiko, rolls légèrement caramélisés
            relevés de mayo épicée et de sauce anguille : nous cultivons une cuisine
            visuelle autant que savoureuse. Une centaine d&apos;avis nous placent parmi
            les meilleures adresses de la ville pour le rapport qualité-prix et le service.
          </p>
          <p className="mt-3 text-ink-soft">
            Nous disposons de nos propres livreurs : votre commande part de notre cuisine
            et arrive chez vous, toujours dressée avec le même soin.
          </p>
        </div>
      </section>

      <section className="bg-sand">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center font-serif text-3xl text-ink sm:text-4xl">Ce qui nous tient à cœur</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.titre} className="rounded-[var(--radius-lg)] border border-sand-deep bg-cream p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10">
                  <v.icon className="h-6 w-6 text-terracotta" />
                </div>
                <h3 className="mt-4 font-serif text-xl text-ink">{v.titre}</h3>
                <p className="mt-2 text-sm text-ink-soft">{v.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="font-serif text-3xl text-ink sm:text-4xl">Envie de goûter ?</h2>
        <p className="mt-2 text-ink-soft">Composez votre commande en quelques clics.</p>
        <Link
          href="/menu"
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-terracotta px-7 font-medium text-cream hover:bg-terracotta-600"
        >
          Voir la carte <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
