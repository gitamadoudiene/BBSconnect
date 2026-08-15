import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { images } from "@/lib/images";

export function LifestyleGrid() {
  const shots = images.lifestyleGrid;

  return (
    <section className="section-space-sm bg-paper">
      <div className="container-page">
        <Reveal className="max-w-lg">
          <p className="text-eyebrow text-slate">@bbsconnect.sn</p>
          <h2 className="text-h2 mt-4 text-ink">BBS Connect dans votre quotidien</h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {shots.map((src, i) => (
            <Reveal key={src} delay={i * 60} className={i > 3 ? "hidden lg:block" : ""}>
              <div className="hover-zoom relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={src}
                  alt="BBS Connect — photo lifestyle"
                  fill
                  sizes="(min-width: 1024px) 16vw, 33vw"
                  className="zoom-target object-cover"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
