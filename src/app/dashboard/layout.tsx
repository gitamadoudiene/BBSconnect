import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") {
    redirect("/connexion?redirect=/dashboard");
  }

  return (
    <DashboardShell merchantName={session.name} merchantEmail={session.email}>
      {children}
    </DashboardShell>
  );
}
