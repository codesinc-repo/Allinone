import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PageHeading } from "@/components/Shell";
import { StatusBadge } from "@/components/Badge";
import { formatDate, formatMoney } from "@/lib/utils";

export default async function TransactionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/auth/login");
  const t = await prisma.transaction.findUnique({
    where: { id },
    include: { operator: true },
  });
  if (!t || t.userId !== session.sub) notFound();

  return (
    <div className="space-y-5">
      <PageHeading
        title="Transaction detail"
        action={<Link href="/transactions" className="btn-outline">Back</Link>}
      />
      <div className="card p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">{t.type}</div>
            <div className="text-2xl font-bold">{formatMoney(t.amount)}</div>
            <div className="mt-1 text-xs text-gray-500">{formatDate(t.createdAt)}</div>
          </div>
          <StatusBadge status={t.status} />
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-gray-500">Operator</dt>
            <dd>{t.operator?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Reference</dt>
            <dd>{t.reference}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Provider ref</dt>
            <dd className="font-mono text-xs">{t.providerRef ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Status message</dt>
            <dd>{t.message ?? "—"}</dd>
          </div>
        </dl>
      </div>
      {t.status === "FAILED" && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Payment failed. No amount was deducted. You can retry anytime.
        </div>
      )}
      {t.status === "PENDING" && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Awaiting provider confirmation. Final status will update when the provider responds.
        </div>
      )}
    </div>
  );
}
