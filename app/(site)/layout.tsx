import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { DemoBanner } from "@/components/site/demo-banner";
import { ServiceBanner } from "@/components/site/service-banner";
import { CartDrawer } from "@/components/site/cart-drawer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenu"
        className="sr-only z-[80] rounded-full bg-terracotta px-4 py-2 font-medium text-cream focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Aller au contenu
      </a>
      <DemoBanner />
      <ServiceBanner />
      <Header />
      <main id="contenu" className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
