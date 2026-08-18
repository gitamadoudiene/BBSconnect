import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/connexion?redirect=/dashboard/parametres");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/connexion");

  return (
    <div>
      <div className="max-w-lg rounded-xl border border-db-border bg-db-card p-6">
        <SettingsForm name={user.name} email={user.email} phone={user.phone ?? ""} />
      </div>
    </div>
  );
}
