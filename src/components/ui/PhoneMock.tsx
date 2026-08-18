import clsx from "clsx";

type PhoneMockProps = {
  color?: string;
  variant?: "back" | "front";
  className?: string;
};

/** Stylized iPhone illustration used as a product placeholder image. */
export function PhoneMock({ color = "#3b4756", variant = "back", className }: PhoneMockProps) {
  const uid = color.replace("#", "");

  return (
    <svg
      viewBox="0 0 200 400"
      className={clsx("h-full w-full", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="14%" stopColor={color} stopOpacity="0.92" />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={`edge-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lens" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#4a5568" />
          <stop offset="45%" stopColor="#0f1420" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <linearGradient id="plate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      <rect x="14" y="6" width="172" height="388" rx="44" fill={`url(#edge-${uid})`} />
      <rect x="16.5" y="8.5" width="167" height="383" rx="41.5" fill={`url(#body-${uid})`} stroke="#00000022" strokeWidth="1" />
      <rect x="20" y="12" width="160" height="376" rx="36" fill="url(#glass)" />

      {variant === "back" ? (
        <>
          <rect x="36" y="32" width="76" height="76" rx="20" fill="url(#plate)" stroke="#ffffff1a" strokeWidth="1" />
          <circle cx="59" cy="55" r="16" fill="url(#lens)" stroke="#ffffff33" strokeWidth="1.5" />
          <circle cx="59" cy="55" r="16" fill="none" stroke="#00000055" strokeWidth="0.75" />
          <circle cx="53.5" cy="49.5" r="3.5" fill="#ffffff55" />
          <circle cx="89" cy="55" r="16" fill="url(#lens)" stroke="#ffffff33" strokeWidth="1.5" />
          <circle cx="83.5" cy="49.5" r="3.5" fill="#ffffff55" />
          <circle cx="59" cy="85" r="16" fill="url(#lens)" stroke="#ffffff33" strokeWidth="1.5" />
          <circle cx="53.5" cy="79.5" r="3.5" fill="#ffffff55" />
          <circle cx="94" cy="87" r="6.5" fill="#0f1420" stroke="#ffffff2a" strokeWidth="1.5" />
          <circle cx="94" cy="87" r="6.5" fill="url(#lens)" opacity="0.6" />
          <rect x="88" y="152" width="26" height="66" rx="13" fill="#ffffff10" />
          <path d="M20 12 Q100 2 180 12" stroke="#ffffff30" strokeWidth="2" fill="none" />
        </>
      ) : (
        <>
          <rect x="34" y="60" width="132" height="300" rx="8" fill="#0c1118" opacity="0.92" />
          <rect x="68" y="20" width="64" height="22" rx="11" fill="#0a0d12" />
          <circle cx="122" cy="31" r="3.5" fill="#1b2a3a" />
          <rect x="34" y="60" width="132" height="70" fill="#ffffff0c" />
          <path d="M34 320 Q100 300 166 320" stroke="#ffffff08" strokeWidth="40" fill="none" />
        </>
      )}

      <rect x="14" y="6" width="172" height="388" rx="44" fill="none" stroke="#ffffff2a" strokeWidth="1" />
    </svg>
  );
}
