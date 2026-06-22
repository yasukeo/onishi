import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { DemoBanner } from "@/components/site/demo-banner";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
