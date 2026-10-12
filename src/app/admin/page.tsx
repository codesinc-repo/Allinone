import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { StatusBadge } from "@/components/Badge";
import { formatDate, formatMoney } from "@/lib/utils";

function Stat({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const inner = (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
  return href ? <Link href={href} className="block hover:shadow-md">{inner}</Link> : inner;
}

export default async function AdminOverview() {
  const [
    userCount,
    listingCount,
    providerCount,
    openReports,
    txnStats,
    recentTxns,
    recentReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.serviceProvider.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.transaction.groupBy({
      by: ["status"],
      _count: true,
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: true, operator: true },
    }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { reporter: true },
    }),
  ]);

  const totalCollected = txnStats
    .filter((s) => s.status === "SUCCESS")
    .reduce((n, s) => n + (s._sum.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeading title="Admin overview" sub="Operational snapshot across every module." />

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Users" value={userCount} href="/admin/users" />
        <Stat label="Listings" value={listingCount} href="/admin/listings" />
        <Stat label="Providers" value={providerCount} href="/admin/providers" />
        <Stat label="Open reports" value={openReports} href="/admin/reports" />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {txnStats.map((s) => (
          <Stat
            key={s.status}
            label={`Txns · ${s.status}`}
            value={s._count}
            href={`/admin/transactions?status=${s.status}`}
          />
        ))}
        <Stat label="Collected" value={formatMoney(totalCollected)} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <section>
          <PageHeading title="Latest transactions" action={<Link href="/admin/transactions" className="text-sm text-brand">All →</Link>} />
          <div className="card divide-y">
            {recentTxns.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <div className="font-semibold">{t.user.name} — {t.type}</div>
                  <div className="text-xs text-gray-500">{t.operator?.name ?? "—"} · {formatDate(t.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatMoney(t.amount)}</div>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <PageHeading title="Open reports" action={<Link href="/admin/reports" className="text-sm text-brand">All →</Link>} />
          <div className="card divide-y">
            {recentReports.length === 0 && (
              <div className="p-4 text-sm text-gray-500">Nothing to review.</div>
            )}
            {recentReports.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <div className="font-semibold">{r.targetType} · {r.reason}</div>
                  <div className="text-xs text-gray-500">By {r.reporter.name} · {formatDate(r.createdAt)}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
