import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { StatusBadge } from "@/components/Badge";
import { formatDate, formatMoney } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  const sp = await searchParams;

  const txns = await prisma.transaction.findMany({
    where: {
      userId: session.sub,
      ...(sp.status ? { status: sp.status } : {}),
      ...(sp.type ? { type: sp.type } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { operator: true },
  });

  return (
    <div className="space-y-5">
      <PageHeading
        title="Transaction history"
        sub="Every payment attempt — successful, pending, or failed — appears here with a traceable reference."
      />
      <div className="flex flex-wrap gap-2 text-xs">
        {["SUCCESS", "PENDING", "FAILED"].map((s) => (
          <Link
            key={s}
            href={`/transactions?status=${s}`}
            className={`badge border ${sp.status === s ? "border-brand bg-brand text-white" : "border-gray-200 bg-white"}`}
          >
            {s}
          </Link>
        ))}
        {sp.status && (
          <Link href="/transactions" className="badge border border-gray-200 bg-white">
            Clear
          </Link>
        )}
      </div>

      {txns.length === 0 ? (
        <EmptyState title="No transactions yet" description="Try a recharge or bill payment to see history here." />
      ) : (
        <div className="card divide-y">
          {txns.map((t) => (
            <Link
              key={t.id}
              href={`/transactions/${t.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div>
                <div className="text-sm font-semibold">
                  {t.type} · {t.operator?.name ?? "—"}
                </div>
                <div className="text-xs text-gray-500">
                  Ref {t.reference} · {formatDate(t.createdAt)}
                </div>
                {t.providerRef && (
                  <div className="text-[11px] text-gray-400">Provider: {t.providerRef}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{formatMoney(t.amount)}</div>
                <StatusBadge status={t.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
