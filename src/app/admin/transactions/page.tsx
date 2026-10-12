import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { StatusBadge } from "@/components/Badge";
import { formatDate, formatMoney } from "@/lib/utils";
import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from "@/lib/constants";

export default async function AdminTxns({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const txns = await prisma.transaction.findMany({
    where: {
      ...(sp.status ? { status: sp.status } : {}),
      ...(sp.type ? { type: sp.type } : {}),
      ...(sp.q
        ? { OR: [{ reference: { contains: sp.q } }, { providerRef: { contains: sp.q } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { user: true, operator: true },
    take: 500,
  });

  const totalSuccess = txns.filter((t) => t.status === "SUCCESS").reduce((s, t) => s + t.amount, 0);
  const totalPending = txns.filter((t) => t.status === "PENDING").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-5">
      <PageHeading
        title="Transactions"
        sub={`${txns.length} shown · Success total ${formatMoney(totalSuccess)} · Pending ${formatMoney(totalPending)}`}
      />
      <form action="/admin/transactions" className="card flex flex-wrap items-end gap-2 p-3">
        <div className="min-w-[160px] flex-1">
          <label className="label">Search ref</label>
          <input name="q" defaultValue={sp.q ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Type</label>
          <select name="type" defaultValue={sp.type ?? ""} className="input">
            <option value="">All</option>
            {TRANSACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={sp.status ?? ""} className="input">
            <option value="">All</option>
            {TRANSACTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn-primary">Filter</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="p-3">User</th>
              <th className="p-3">Type</th>
              <th className="p-3">Operator</th>
              <th className="p-3">Reference</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Provider ref</th>
              <th className="p-3">When</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="p-3">
                  <Link href={`/admin/users?q=${encodeURIComponent(t.user.email)}`} className="font-medium text-brand hover:underline">
                    {t.user.name}
                  </Link>
                  <div className="text-xs text-gray-500">{t.user.email}</div>
                </td>
                <td className="p-3 text-xs"><span className="badge border-gray-200 bg-gray-50">{t.type}</span></td>
                <td className="p-3 text-xs">{t.operator?.name ?? "—"}</td>
                <td className="p-3 font-mono text-xs">{t.reference}</td>
                <td className="p-3 font-medium">{formatMoney(t.amount)}</td>
                <td className="p-3"><StatusBadge status={t.status} /></td>
                <td className="p-3 font-mono text-xs">{t.providerRef ?? "—"}</td>
                <td className="p-3 text-xs text-gray-500">{formatDate(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
