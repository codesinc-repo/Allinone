import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PageHeading } from "@/components/Shell";
import { formatMoney } from "@/lib/utils";
import {
  fetchMockBill,
  submitMockTransaction,
} from "@/lib/mock-provider";
import type { OperatorType } from "@/lib/constants";

const TYPE_MAP: Record<
  string,
  {
    label: string;
    operatorType: OperatorType;
    refLabel: string;
    helper: string;
    showFetchBill: boolean;
  }
> = {
  mobile: {
    label: "Mobile recharge",
    operatorType: "MOBILE",
    refLabel: "Mobile number",
    helper: "Enter the 10-digit mobile number.",
    showFetchBill: false,
  },
  dth: {
    label: "DTH / Dish recharge",
    operatorType: "DTH",
    refLabel: "Customer / smart-card number",
    helper: "Enter the DTH account identifier.",
    showFetchBill: false,
  },
  fastag: {
    label: "FASTag recharge",
    operatorType: "FASTAG",
    refLabel: "Vehicle / Tag number",
    helper: "Enter the vehicle registration or tag ID.",
    showFetchBill: false,
  },
  electricity: {
    label: "Electricity bill",
    operatorType: "ELECTRICITY",
    refLabel: "Consumer number",
    helper: "Enter the consumer/reference number from your bill.",
    showFetchBill: true,
  },
  loan: {
    label: "Loan EMI",
    operatorType: "LOAN",
    refLabel: "Loan account number",
    helper: "Enter your loan account number.",
    showFetchBill: true,
  },
  "credit-card": {
    label: "Credit card bill",
    operatorType: "CREDIT_CARD",
    refLabel: "Last 4 digits of card",
    helper: "Payment is tokenised; the demo never stores card data.",
    showFetchBill: false,
  },
};

export default async function RechargeType({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ bill?: string; amount?: string; operator?: string; error?: string }>;
}) {
  const { type } = await params;
  const sp = await searchParams;
  const cfg = TYPE_MAP[type];
  if (!cfg) notFound();

  const operators = await prisma.operator.findMany({
    where: { type: cfg.operatorType, active: true },
    orderBy: { name: "asc" },
  });

  async function fetchBillAction(formData: FormData) {
    "use server";
    const reference = String(formData.get("reference") ?? "").trim();
    const operatorId = String(formData.get("operatorId") ?? "");
    if (!reference) {
      redirect(`/recharge/${type}?error=${encodeURIComponent("Enter a reference number")}`);
    }
    const bill = fetchMockBill({ type: cfg.operatorType, reference });
    if (!bill) {
      redirect(
        `/recharge/${type}?error=${encodeURIComponent("Provider could not find that account")}`,
      );
    }
    redirect(
      `/recharge/${type}?bill=${encodeURIComponent(reference)}&amount=${bill!.amount}&operator=${operatorId}`,
    );
  }

  async function submitAction(formData: FormData) {
    "use server";
    const user = await getCurrentUser();
    if (!user) redirect("/auth/login");

    const reference = String(formData.get("reference") ?? "").trim();
    const amount = Number(formData.get("amount") ?? 0);
    const operatorId = String(formData.get("operatorId") ?? "") || null;

    if (!reference || !amount || amount <= 0) {
      redirect(
        `/recharge/${type}?error=${encodeURIComponent("Enter a valid reference and amount")}`,
      );
    }

    const result = submitMockTransaction({
      type: cfg.operatorType,
      amount,
      reference,
    });

    const txn = await prisma.transaction.create({
      data: {
        userId: user!.id,
        operatorId: operatorId,
        type: cfg.operatorType,
        amount,
        reference,
        status: result.status,
        providerRef: result.providerRef,
        message: result.message,
      },
    });
    redirect(`/transactions/${txn.id}`);
  }

  const prefillAmount = sp.amount ?? "";
  const prefillRef = sp.bill ?? "";
  const prefillOp = sp.operator ?? "";

  return (
    <div className="space-y-5">
      <PageHeading title={cfg.label} sub={cfg.helper} />
      {sp.error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {sp.error}
        </div>
      )}

      <form action={submitAction} className="card space-y-4 p-5">
        <div>
          <label className="label">Operator</label>
          <select name="operatorId" className="input" defaultValue={prefillOp} required>
            <option value="">Select an operator</option>
            {operators.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{cfg.refLabel}</label>
          <input className="input" name="reference" defaultValue={prefillRef} required />
          <p className="mt-1 text-xs text-gray-500">
            Try ending with <code>0000</code> to see a mock failure, or any other value for success/pending.
          </p>
        </div>
        <div>
          <label className="label">Amount (₹)</label>
          <input className="input" name="amount" type="number" min={1} step={1} defaultValue={prefillAmount} required />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary">Pay {prefillAmount ? formatMoney(Number(prefillAmount)) : ""}</button>
          {cfg.showFetchBill && (
            <button className="btn-outline" formAction={fetchBillAction}>
              Fetch bill
            </button>
          )}
        </div>
      </form>

      <div className="card bg-gray-50 p-4 text-xs text-gray-600">
        We never store raw card credentials. Transaction status reflects the mock
        provider; real settlement/dispute policies will be defined with the live
        aggregator.
      </div>
    </div>
  );
}
