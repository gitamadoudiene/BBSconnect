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
      <h1 className="mb-6 text-2xl font-bold text-brand-navy">Paramètres du compte</h1>
      <div className="max-w-lg rounded-lg border border-brand-border bg-white p-6">
        <SettingsForm name={user.name} email={user.email} phone={user.phone ?? ""} />
      </div>
    </div>
  );
}
