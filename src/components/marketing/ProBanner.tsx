import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { images } from "@/lib/images";

export function ProBanner() {
  return (
    <section className="relative flex min-h-[520px] items-center overflow-hidden bg-ink lg:min-h-[640px]">
      <Image
        src={images.proBanner}
        alt="iPhone Pro en environnement premium"
        fill
        sizes="100vw"
        className="object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />

      <div className="container-page relative z-10">
        <Reveal className="max-w-lg">
          <p className="text-eyebrow text-white/60">iPhone Pro</p>
          <h2 className="text-h1 mt-5 text-white">
            Pro.
            <br />
            Plus qu&apos;un smartphone.
          </h2>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/70">
            Des performances exceptionnelles. Un design conçu pour durer.
          </p>
          <Link href="/boutique?categorie=iphone-16" className="btn btn-inverse mt-9">
            Découvrir iPhone Pro <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
