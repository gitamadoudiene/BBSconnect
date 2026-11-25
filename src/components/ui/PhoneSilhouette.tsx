import clsx from "clsx";

/** A flat, front-on phone outline in the variant's colour. Used wherever a
 * product has no clean photo yet — it keeps the grid honest (the colour is
 * the real one) without falling back to a stock image. */
export function PhoneSilhouette({
  color = "#2b2d31",
  label,
  className,
}: {
  color?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={clsx("flex h-full w-full flex-col items-center justify-center gap-4", className)}>
      <svg viewBox="0 0 120 240" className="h-[62%] w-auto" aria-hidden>
        <rect x="2" y="2" width="116" height="236" rx="26" fill={color} />
        <rect x="2" y="2" width="116" height="236" rx="26" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
        <rect x="9" y="9" width="102" height="222" rx="20" fill="rgba(255,255,255,0.08)" />
        <rect x="44" y="17" width="32" height="9" rx="4.5" fill="rgba(0,0,0,0.55)" />
      </svg>
      {label && <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate">{label}</span>}
    </div>
  );
}
