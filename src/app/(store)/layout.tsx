import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Tracker } from "@/components/analytics/Tracker";
import { getSession } from "@/lib/session";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <Tracker enabled={session?.role !== "MERCHANT"} />
    </>
  );
}
