import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={clsx("group/arrow inline-flex items-center gap-1.5 text-[13.5px] font-semibold", className)}>
      {children}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/arrow:translate-x-1" />
    </Link>
  );
}
