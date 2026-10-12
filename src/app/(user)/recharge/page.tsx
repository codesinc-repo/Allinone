import Link from "next/link";
import { PageHeading } from "@/components/Shell";

const SERVICES = [
  { href: "/recharge/mobile", title: "Mobile", desc: "Prepaid & postpaid", icon: "📱" },
  { href: "/recharge/dth", title: "DTH / Dish", desc: "TV recharge", icon: "📺" },
  { href: "/recharge/fastag", title: "FASTag", desc: "Highway toll tag", icon: "🛣" },
  { href: "/recharge/electricity", title: "Electricity", desc: "Pay power bills", icon: "💡" },
  { href: "/recharge/loan", title: "Loan EMI", desc: "Loan repayment", icon: "🏦" },
  { href: "/recharge/credit-card", title: "Credit Card", desc: "Pay card bills", icon: "💳" },
];

export default function RechargeHome() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Recharge & Bills"
        sub="Pay bills, top up accounts, and track every transaction with a provider-backed reference."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SERVICES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="card flex flex-col items-start p-4 hover:border-brand hover:shadow-md"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-xl">
              {s.icon}
            </div>
            <div className="mt-3 text-sm font-semibold">{s.title}</div>
            <div className="text-xs text-gray-500">{s.desc}</div>
          </Link>
        ))}
      </div>
      <div className="card bg-amber-50 border-amber-200 p-4 text-xs text-amber-800">
        <strong>Demo note:</strong> this build uses a mock payment aggregator so flows
        are testable end-to-end. The SoW explicitly notes real integrations require
        authorised provider access.
      </div>
    </div>
  );
}
