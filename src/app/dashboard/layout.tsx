import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMerchant } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Back-office | BBS Connect",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const merchant = await getMerchant();
  if (!merchant) {
    // Signed token but revoked account/session → clear it, otherwise straight to sign-in.
    redirect((await getSession()) ? "/api/session/expired" : "/connexion?redirect=/dashboard");
  }

  return (
    <DashboardShell merchantName={merchant.name} merchantEmail={merchant.email}>
      {children}
    </DashboardShell>
  );
}
