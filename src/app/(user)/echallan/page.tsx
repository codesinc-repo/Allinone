import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { StatusBadge } from "@/components/Badge";
import { formatDate, formatMoney } from "@/lib/utils";
import { lookupMockChallan, submitMockTransaction } from "@/lib/mock-provider";

async function lookupAction(formData: FormData) {
  "use server";
  const vehicleNumber = String(formData.get("vehicleNumber") ?? "").trim().toUpperCase();
  if (!vehicleNumber) redirect("/echallan");
  redirect(`/echallan?v=${encodeURIComponent(vehicleNumber)}`);
}

async function payAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const vehicleNumber = String(formData.get("vehicleNumber") ?? "");
  const challanNumber = String(formData.get("challanNumber") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const description = String(formData.get("description") ?? "");

  const result = submitMockTransaction({ type: "ECHALLAN", amount, reference: challanNumber });

  const challan = await prisma.eChallan.create({
    data: {
      userId: user!.id,
      vehicleNumber,
      challanNumber,
      amount,
      description,
      status: result.status === "SUCCESS" ? "PAID" : result.status === "PENDING" ? "PENDING" : "FAILED",
      paidAt: result.status === "SUCCESS" ? new Date() : null,
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user!.id,
      type: "ECHALLAN",
      amount,
      reference: challanNumber,
      status: result.status,
      providerRef: result.providerRef,
      message: result.message,
    },
  });
  redirect(`/echallan?v=${encodeURIComponent(vehicleNumber)}&paid=${challan.id}`);
}

export default async function EChallanPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string; paid?: string }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const vehicle = sp.v;
  const challans = vehicle ? lookupMockChallan(vehicle) : null;
  const myHistory = user
    ? await prisma.eChallan.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <div className="space-y-5">
      <PageHeading
        title="E-challan"
        sub="Look up pending traffic challans by vehicle number. Payments use an authorised provider in production — demo uses a mock."
      />

      <form action={lookupAction} className="card flex flex-wrap gap-2 p-4">
        <input
          name="vehicleNumber"
          defaultValue={vehicle ?? ""}
          className="input flex-1"
          placeholder="e.g. GJ01AB1234"
          required
        />
        <button className="btn-primary">Check challans</button>
      </form>

      {vehicle && challans === null && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Vehicle number format invalid. Try something like <code>GJ01AB1234</code>.
        </div>
      )}
      {vehicle && Array.isArray(challans) && challans.length === 0 && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          No pending challans found for {vehicle}.
        </div>
      )}
      {sp.paid && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Payment recorded. See <a href="/transactions" className="underline">transaction history</a>.
        </div>
      )}

      {Array.isArray(challans) && challans.length > 0 && (
        <div className="card divide-y">
          {challans.map((c) => (
            <form key={c.challanNumber} action={payAction} className="flex items-center justify-between p-4">
              <input type="hidden" name="vehicleNumber" value={vehicle ?? ""} />
              <input type="hidden" name="challanNumber" value={c.challanNumber} />
              <input type="hidden" name="amount" value={c.amount} />
              <input type="hidden" name="description" value={c.description} />
              <div>
                <div className="text-sm font-semibold">{c.description}</div>
                <div className="text-xs text-gray-500">Challan {c.challanNumber}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-semibold">{formatMoney(c.amount)}</div>
                <button className="btn-primary" disabled={!user}>
                  {user ? "Pay" : "Sign in"}
                </button>
              </div>
            </form>
          ))}
        </div>
      )}

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        If no authorised API exists for a given jurisdiction, the production app links out to the official portal
        instead of handling payment in-app.
      </div>

      {user && myHistory.length > 0 && (
        <div>
          <h3 className="mb-2 mt-6 text-sm font-semibold">My challan payments</h3>
          <div className="card divide-y">
            {myHistory.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <div className="font-medium">{c.vehicleNumber} · {c.description}</div>
                  <div className="text-xs text-gray-500">{formatDate(c.createdAt)} · {c.challanNumber}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatMoney(c.amount)}</span>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
