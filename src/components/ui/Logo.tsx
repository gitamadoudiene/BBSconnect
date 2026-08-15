import Link from "next/link";
import clsx from "clsx";

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={clsx("inline-flex flex-col leading-none select-none", className)}>
      <span
        className={clsx(
          "text-[26px] font-extrabold tracking-tight",
          dark ? "text-white" : "text-brand-navy"
        )}
      >
        BBS<span className="text-brand-blue">.</span>
      </span>
      <span
        className={clsx(
          "mt-1 border-t pt-0.5 text-[9px] font-semibold tracking-[0.4em] text-brand-blue",
          dark ? "border-brand-blue/60" : "border-brand-blue"
        )}
      >
        CONNECT
      </span>
    </Link>
  );
}
