import { MotionConfig } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </MotionConfig>
  );
}
