import Link from "next/link";
import clsx from "clsx";

/** The two overlapping circles of the Balla Business Service mark, drawn in
 * SVG so they stay crisp at every size. Blue #00A0CA / orange #EA792C, the
 * overlap rendered as the logo's teal. */
export function DuoMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size * 0.62}
      viewBox="0 0 50 31"
      aria-hidden
      className={clsx("shrink-0", className)}
    >
      <circle cx="15.5" cy="15.5" r="15.5" fill="#00A0CA" />
      <circle cx="34.5" cy="15.5" r="15.5" fill="#EA792C" />
      <path d="M25 3.25 A15.5 15.5 0 0 1 25 27.75 A15.5 15.5 0 0 1 25 3.25 Z" fill="#5EBDC1" />
    </svg>
  );
}

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="BBS Connect — Balla Business Service, accueil"
      className={clsx("inline-flex shrink-0 select-none items-center gap-2.5", className)}
    >
      <DuoMark size={30} className="sm:w-[34px]" />
      <span className="flex flex-col leading-none">
        <span className={clsx("text-[17px] font-bold tracking-[-0.04em] sm:text-[19px]", dark ? "text-white" : "text-ink")}>
          BBS Connect
        </span>
        <span
          className={clsx(
            "mt-1 hidden font-mono text-[9.5px] uppercase tracking-[0.14em] sm:block",
            dark ? "text-white/45" : "text-slate"
          )}
        >
          Balla Business Service
        </span>
      </span>
    </Link>
  );
}
