import clsx from "clsx";

type PhoneMockProps = {
  color?: string;
  variant?: "back" | "front";
  className?: string;
};

/** Stylized iPhone illustration used as a product placeholder image. */
export function PhoneMock({ color = "#3b4756", variant = "back", className }: PhoneMockProps) {
  return (
    <svg
      viewBox="0 0 200 400"
      className={clsx("h-full w-full", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`body-${color}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="14" y="6" width="172" height="388" rx="42" fill={`url(#body-${color})`} stroke="#00000022" strokeWidth="1.5" />
      <rect x="20" y="12" width="160" height="376" rx="36" fill="url(#glass)" />

      {variant === "back" ? (
        <>
          <rect x="38" y="34" width="70" height="70" rx="18" fill="#ffffff22" />
          <circle cx="60" cy="56" r="15" fill="#0f1420" stroke="#ffffff44" strokeWidth="2" />
          <circle cx="60" cy="56" r="6" fill="#33415580" />
          <circle cx="88" cy="56" r="15" fill="#0f1420" stroke="#ffffff44" strokeWidth="2" />
          <circle cx="88" cy="56" r="6" fill="#33415580" />
          <circle cx="60" cy="84" r="15" fill="#0f1420" stroke="#ffffff44" strokeWidth="2" />
          <circle cx="60" cy="84" r="6" fill="#33415580" />
          <circle cx="93" cy="85" r="6" fill="#0f1420" stroke="#ffffff33" strokeWidth="1.5" />
          <rect x="88" y="150" width="24" height="60" rx="12" fill="#ffffff14" />
        </>
      ) : (
        <>
          <rect x="70" y="20" width="60" height="20" rx="10" fill="#0f1420" />
          <circle cx="118" cy="30" r="4" fill="#233" />
          <rect x="34" y="60" width="132" height="300" rx="6" fill="#0c1118" opacity="0.85" />
          <rect x="34" y="60" width="132" height="60" fill="#ffffff10" />
        </>
      )}

      <rect x="14" y="6" width="172" height="388" rx="42" fill="none" stroke="#ffffff33" strokeWidth="1" />
    </svg>
  );
}
