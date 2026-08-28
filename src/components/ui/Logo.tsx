import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={clsx("inline-flex select-none items-center", className)}>
      <span className={clsx("inline-flex items-center rounded-lg", dark && "bg-white px-2.5 py-1.5")}>
        <Image
          src="/images/logobbs.jpeg"
          alt="Balla Business Service"
          width={619}
          height={246}
          priority
          className="h-9 w-auto object-contain sm:h-10"
        />
      </span>
    </Link>
  );
}
