"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { disableTracking, track } from "@/lib/analytics-client";

/** Sends one page view per route change. Off for the merchant's own visits. */
export function Tracker({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) disableTracking();
  }, [enabled]);

  useEffect(() => {
    if (enabled && pathname) track("PAGE_VIEW", { path: pathname });
  }, [enabled, pathname]);

  return null;
}
