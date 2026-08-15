import clsx from "clsx";

/**
 * Studio-style staging backdrop for the PhoneMock illustration: soft radial
 * spotlight + ambient contact shadow, standing in for real product photography.
 */
export function ProductStage({
  children,
  tone = "light",
  className,
  rounded = "rounded-[28px]",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={clsx(
        "relative flex items-center justify-center overflow-hidden",
        rounded,
        tone === "light" ? "bg-gradient-to-b from-mist to-white" : "bg-gradient-to-b from-ink-soft to-ink",
        className
      )}
    >
      <div
        className={clsx(
          "pointer-events-none absolute inset-0",
          tone === "light"
            ? "bg-[radial-gradient(60%_50%_at_50%_38%,rgba(255,255,255,0.9),transparent_70%)]"
            : "bg-[radial-gradient(55%_45%_at_50%_32%,rgba(255,255,255,0.14),transparent_70%)]"
        )}
      />
      <div className="relative z-10 flex h-full w-full items-center justify-center p-[10%]">
        {children}
      </div>
      <div
        className={clsx(
          "pointer-events-none absolute bottom-[8%] left-1/2 h-[10%] w-[55%] -translate-x-1/2 rounded-full blur-xl",
          tone === "light" ? "bg-black/10" : "bg-black/40"
        )}
      />
    </div>
  );
}
