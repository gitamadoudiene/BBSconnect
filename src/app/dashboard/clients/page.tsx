import Link from "next/link";
import clsx from "clsx";
import { MessageCircle, Search, UserRound, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/dashboard/ui";
import { KpiCard } from "@/components/dashboard/KpiCard";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; tri?: string }>;

type Customer = {
  email: string;
  name: string;
  phone: string;
  orders: number;
  spent: number;
  lastOrder: Date;
  registered: boolean;
};

const sorts = {
  recent: "Dernière commande",
  spent: "Montant dépensé",
  orders: "Nombre de commandes",
} as const;

function whatsapp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("221") ? digits : `221${digits}`}`;
}

export default async function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = params.q?.trim().toLowerCase() ?? "";
  const tri = (params.tri && params.tri in sorts ? params.tri : "recent") as keyof typeof sorts;

  const [orders, accounts] = await Promise.all([
    prisma.order.findMany({
      select: { customerEmail: true, customerName: true, customerPhone: true, total: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: { email: true, name: true, phone: true, createdAt: true },
    }),
  ]);

  // One row per email: guests (orders only) and registered accounts.
  const byEmail = new Map<string, Customer>();
  for (const o of orders) {
    const email = o.customerEmail.toLowerCase();
    const row = byEmail.get(email) ?? {
      email,
      name: o.customerName,
      phone: o.customerPhone,
      orders: 0,
      spent: 0,
      lastOrder: o.createdAt,
      registered: false,
    };
    row.orders += 1;
    if (o.status !== "CANCELLED") row.spent += o.total;
    byEmail.set(email, row);
  }
  for (const a of accounts) {
    const email = a.email.toLowerCase();
    const row = byEmail.get(email);
    if (row) row.registered = true;
    else
      byEmail.set(email, {
        email,
        name: a.name,
        phone: a.phone ?? "",
        orders: 0,
        spent: 0,
        lastOrder: a.createdAt,
        registered: true,
      });
  }

  const all = [...byEmail.values()];
  const rows = all
    .filter((c) => !q || [c.name, c.email, c.phone].some((v) => v.toLowerCase().includes(q)))
    .sort((a, b) =>
      tri === "spent" ? b.spent - a.spent : tri === "orders" ? b.orders - a.orders : +b.lastOrder - +a.lastOrder
    );

  const buyers = all.filter((c) => c.orders > 0);
  const repeat = buyers.filter((c) => c.orders > 1).length;
  const lifetime = buyers.reduce((s, c) => s + c.spent, 0);

  const href = (t: string) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (t !== "recent") sp.set("tri", t);
    const s = sp.toString();
    return `/dashboard/clients${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow="Ventes"
        title="Clients"
        description="Tous ceux qui ont commandé ou créé un compte, regroupés par adresse email."
      >
        <form role="search" className="relative">
          {tri !== "recent" && <input type="hidden" name="tri" value={tri} />}
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input
            type="search"
            name="q"
            defaultValue={params.q}
            placeholder="Nom, email, téléphone…"
            aria-label="Rechercher un client"
            className="field field-sm w-72 pl-10"
          />
        </form>
      </PageHeader>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Clients" value={String(all.length)} icon={Users} hint={`${buyers.length} ont déjà commandé`} />
        <KpiCard
          label="Clients fidèles"
          value={String(repeat)}
          icon={UserRound}
          hint={buyers.length ? `${Math.round((repeat / buyers.length) * 100)} % ont commandé plus d'une fois` : "aucune commande pour l'instant"}
        />
        <KpiCard
          label="Valeur moyenne client"
          value={buyers.length ? formatFCFA(Math.round(lifetime / buyers.length)) : "—"}
          icon={Users}
          hint="dépensé par client, hors annulations"
        />
      </div>

      <div className="rail mb-4 flex items-center gap-2 overflow-x-auto">
        <span className="db-eyebrow mr-1">Trier</span>
        {(Object.keys(sorts) as (keyof typeof sorts)[]).map((t) => (
          <Link key={t} href={href(t)} className={clsx("pill", tri === t && "pill-active")}>
            {sorts[t]}
          </Link>
        ))}
      </div>

      <div className="db-card overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title={q ? "Aucun client ne correspond à cette recherche" : "Pas encore de clients"}
            text={q ? undefined : "Ils apparaîtront ici dès la première commande ou inscription."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-line bg-paper/60 text-left">
                  <th className="db-th px-6 py-3">Client</th>
                  <th className="db-th px-4 py-3">Compte</th>
                  <th className="db-th px-4 py-3 text-right">Commandes</th>
                  <th className="db-th px-4 py-3 text-right">Dépensé</th>
                  <th className="db-th px-4 py-3">Dernière activité</th>
                  <th className="db-th px-6 py-3 text-right">Contact</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.email} className="border-b border-line last:border-0 hover:bg-paper/50">
                    <td className="px-6 py-3.5">
                      <Link href={`/dashboard/commandes?q=${encodeURIComponent(c.email)}`} className="group flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper font-mono text-[11px] text-ink">
                          {c.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold tracking-[-0.01em] text-ink group-hover:text-accent">{c.name}</span>
                          <span className="block truncate font-mono text-[11px] text-slate">{c.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={clsx("badge", c.registered ? "bg-accent-tint text-accent-deep" : "bg-paper text-slate")}>
                        {c.registered ? "Inscrit" : "Invité"}
                      </span>
                    </td>
                    <td className="tabular px-4 py-3.5 text-right font-mono text-[12.5px] text-ink">{c.orders}</td>
                    <td className="tabular whitespace-nowrap px-4 py-3.5 text-right font-semibold text-ink">
                      {c.spent ? formatFCFA(c.spent) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11.5px] text-slate">
                      {c.lastOrder.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {c.phone ? (
                        <a
                          href={whatsapp(c.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pill h-8"
                          aria-label={`Écrire à ${c.name} sur WhatsApp`}
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> <span className="tabular">{c.phone}</span>
                        </a>
                      ) : (
                        <span className="font-mono text-[11.5px] text-slate">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
