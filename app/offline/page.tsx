import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "Hors ligne" };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand">
        <WifiOff className="h-7 w-7 text-terracotta" />
      </div>
      <h1 className="mt-5 font-serif text-3xl text-ink">Vous êtes hors ligne</h1>
      <p className="mt-2 text-ink-soft">
        Pas de connexion pour le moment. Reconnectez-vous pour passer commande ou suivre votre
        commande en cours.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-terracotta px-6 font-medium text-cream hover:bg-terracotta-600"
      >
        Réessayer
      </Link>
    </div>
  );
}
