import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { StatusBadge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";
import { REPORT_STATUSES } from "@/lib/constants";
import { revalidatePath } from "next/cache";

async function updateReportStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "OPEN");
  await prisma.report.update({ where: { id }, data: { status } });
  revalidatePath("/admin/reports");
}

async function removeTarget(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return;
  if (report.targetType === "LISTING") {
    await prisma.listing
      .update({ where: { id: report.targetId }, data: { status: "INACTIVE" } })
      .catch(() => {});
  } else if (report.targetType === "PROVIDER") {
    await prisma.serviceProvider
      .delete({ where: { id: report.targetId } })
      .catch(() => {});
  } else if (report.targetType === "DIRECTORY") {
    await prisma.directoryEntry
      .delete({ where: { id: report.targetId } })
      .catch(() => {});
  }
  await prisma.report.update({ where: { id }, data: { status: "ACTIONED" } });
  revalidatePath("/admin/reports");
}

export default async function AdminReports({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const reports = await prisma.report.findMany({
    where: sp.status ? { status: sp.status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { reporter: true },
  });
  return (
    <div className="space-y-5">
      <PageHeading title="Reports queue" sub={`${reports.length} reports`} />
      <div className="flex gap-2 text-xs">
        {REPORT_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/reports?status=${s}`}
            className={`badge border ${sp.status === s ? "border-brand bg-brand text-white" : "border-gray-200 bg-white"}`}
          >
            {s}
          </Link>
        ))}
        <Link href="/admin/reports" className="badge border border-gray-200 bg-white">All</Link>
      </div>
      <div className="card divide-y">
        {reports.length === 0 && <div className="p-4 text-sm text-gray-500">No reports.</div>}
        {reports.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-[200px] flex-1">
              <div className="text-sm font-semibold">{r.reason}</div>
              <div className="text-xs text-gray-500">
                {r.targetType} <span className="font-mono">{r.targetId}</span> · Reported by {r.reporter.name} · {formatDate(r.createdAt)}
              </div>
            </div>
            <StatusBadge status={r.status} />
            <form action={updateReportStatus} className="flex gap-1">
              <input type="hidden" name="id" value={r.id} />
              <select name="status" defaultValue={r.status} className="input !py-1 text-xs">
                {REPORT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="btn-outline !px-2 !py-1 text-xs">Update</button>
            </form>
            <form action={removeTarget}>
              <input type="hidden" name="id" value={r.id} />
              <button className="btn-danger !px-2 !py-1 text-xs">Deactivate target</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
