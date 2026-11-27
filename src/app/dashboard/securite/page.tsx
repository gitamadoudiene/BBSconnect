import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Clock, KeyRound, LogOut, Monitor, ShieldCheck, Smartphone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { signOutEverywhereAction } from "@/actions/settings";
import { EmailForm, PasswordForm } from "@/components/dashboard/SettingsForm";
import { ConfirmButton } from "@/components/dashboard/ConfirmButton";
import { CardTitle, PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

const DEMO_EMAILS = ["marchand@bbsconnect.sn"];

function when(d: Date | null) {
  if (!d) return "Jamais";
  return d.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Dakar" });
}

function device(ua: string | null) {
  if (!ua) return { label: "Appareil inconnu", mobile: false };
  const mobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Navigateur";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return { label: [browser, os].filter(Boolean).join(" · "), mobile };
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export default async function SecurityPage() {
  const merchant = await requireMerchant();

  const since = daysAgo(30);
  const [attempts, failures30d] = await Promise.all([
    prisma.loginAttempt.findMany({
      where: { email: merchant.email },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.loginAttempt.count({ where: { email: merchant.email, success: false, createdAt: { gte: since } } }),
  ]);

  const checks = [
    {
      ok: Boolean(merchant.passwordChangedAt),
      title: merchant.passwordChangedAt ? "Mot de passe personnalisé" : "Mot de passe d'origine",
      text: merchant.passwordChangedAt
        ? `Modifié le ${when(merchant.passwordChangedAt)}.`
        : "Le mot de passe n'a jamais été changé depuis la création du compte. Changez-le maintenant.",
    },
    {
      ok: !DEMO_EMAILS.includes(merchant.email),
      title: DEMO_EMAILS.includes(merchant.email) ? "Adresse de démonstration" : "Adresse personnelle",
      text: DEMO_EMAILS.includes(merchant.email)
        ? "Le compte utilise encore l'adresse de démonstration. Remplacez-la par la vôtre."
        : `Connexion avec ${merchant.email}.`,
    },
    {
      ok: failures30d < 5,
      title: failures30d ? `${failures30d} échec${failures30d > 1 ? "s" : ""} de connexion en 30 jours` : "Aucun échec de connexion",
      text:
        failures30d >= 5
          ? "Quelqu'un a peut-être essayé de deviner votre mot de passe. Changez-le par précaution."
          : "Après 5 essais ratés, le compte se verrouille 15 minutes.",
    },
  ];
  const score = checks.filter((c) => c.ok).length;

  return (
    <div>
      <PageHeader
        eyebrow="Compte"
        title="Sécurité"
        description="Protégez l'accès au back-office : il contrôle le catalogue, les prix et les commandes."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <section className="db-card p-6 lg:p-8">
            <CardTitle
              action={<KeyRound className="h-4 w-4 text-slate" />}
            >
              Mot de passe
            </CardTitle>
            <PasswordForm />
          </section>

          <section className="db-card p-6 lg:p-8">
            <CardTitle>Adresse de connexion</CardTitle>
            <p className="mb-5 text-[14px] text-slate">
              Actuellement <span className="font-mono text-[13px] text-ink">{merchant.email}</span>. Votre mot de passe
              est demandé pour la changer.
            </p>
            <EmailForm email={merchant.email} />
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-[22px] bg-ink p-6 text-white lg:p-8">
            <div className="flex items-start justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/50">État du compte</p>
              <span className="tabular font-mono text-[12px] text-white/60">{score}/3</span>
            </div>
            <p className="mt-6 text-[24px] font-bold leading-tight tracking-[-0.035em]">
              {score === 3 ? "Votre compte est bien protégé." : "Quelques réglages à faire."}
            </p>
            <ul className="mt-6 space-y-4">
              {checks.map((c) => (
                <li key={c.title} className="flex gap-3">
                  <span
                    className={clsx(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      c.ok ? "bg-white/10 text-white" : "bg-signal text-white"
                    )}
                  >
                    {c.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold">{c.title}</span>
                    <span className="block text-[13px] leading-relaxed text-white/60">{c.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="db-card p-6">
            <CardTitle>Session</CardTitle>
            <dl className="space-y-3 text-[13.5px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-slate"><Clock className="h-4 w-4" /> Dernière connexion</dt>
                <dd className="text-right font-mono text-[12px] text-ink">{when(merchant.lastLoginAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-slate"><ShieldCheck className="h-4 w-4" /> Durée d&apos;une session</dt>
                <dd className="font-mono text-[12px] text-ink">12 h</dd>
              </div>
            </dl>
            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-4 text-[13.5px] text-slate">
                Un téléphone perdu, un ordinateur partagé ? Fermez toutes les sessions ouvertes, y compris celle-ci.
              </p>
              <ConfirmButton
                action={signOutEverywhereAction}
                title="Déconnecter tous les appareils ?"
                confirmLabel="Tout déconnecter"
                description="Toutes les sessions seront fermées, y compris celle-ci. Vous devrez vous reconnecter."
                trigger={
                  <button className="btn btn-secondary btn-sm w-full">
                    <LogOut className="h-4 w-4" /> Déconnecter tous les appareils
                  </button>
                }
              />
            </div>
          </section>
        </div>
      </div>

      <section className="db-card mt-4 overflow-hidden">
        <div className="px-6 pt-6">
          <CardTitle>Activité de connexion récente</CardTitle>
        </div>
        {attempts.length === 0 ? (
          <p className="px-6 pb-6 text-[13.5px] text-slate">
            Aucune tentative enregistrée pour l&apos;instant. Le journal démarre avec cette version.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-y border-line bg-paper/60 text-left">
                  <th className="db-th px-6 py-3">Résultat</th>
                  <th className="db-th px-4 py-3">Appareil</th>
                  <th className="db-th px-4 py-3">Adresse IP</th>
                  <th className="db-th px-6 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => {
                  const d = device(a.userAgent);
                  const Icon = d.mobile ? Smartphone : Monitor;
                  return (
                    <tr key={a.id} className="border-b border-line last:border-0">
                      <td className="px-6 py-3.5">
                        <span className={clsx("badge", a.success ? "bg-db-success-tint text-db-success" : "bg-db-danger-tint text-db-danger")}>
                          {a.success ? "Connexion réussie" : "Échec"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-2 text-ink">
                          <Icon className="h-4 w-4 text-slate" /> {d.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[12px] text-slate">{a.ip}</td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-right font-mono text-[12px] text-slate">{when(a.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
