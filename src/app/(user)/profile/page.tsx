import { redirect } from "next/navigation";
import { getCurrentUser, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { StatusBadge } from "@/components/Badge";
import { formatDate, formatMoney } from "@/lib/utils";
import Link from "next/link";

async function logoutAction() {
  "use server";
  await destroySession();
  redirect("/auth/login");
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [listings, requests, transactions] = await Promise.all([
    prisma.listing.findMany({ where: { sellerId: user.id }, take: 5, orderBy: { createdAt: "desc" } }),
    prisma.serviceRequest.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { provider: true },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeading title="My profile" />
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-brand text-xl font-bold text-white">
            {user.name[0]}
          </div>
          <div className="flex-1">
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
            <div className="text-xs text-gray-500">{user.phone ?? "No phone on file"}</div>
          </div>
          <span className="badge bg-brand-50 text-brand border-brand-100">{user.role}</span>
        </div>
        <form action={logoutAction} className="mt-4">
          <button className="btn-outline">Sign out</button>
        </form>
      </div>

      <section>
        <PageHeading
          title="My listings"
          action={<Link href="/marketplace/new" className="text-sm text-brand hover:underline">+ New</Link>}
        />
        {listings.length === 0 ? (
          <p className="text-sm text-gray-500">No listings yet.</p>
        ) : (
          <div className="card divide-y">
            {listings.map((l) => (
              <Link key={l.id} href={`/marketplace/${l.id}`} className="flex items-center justify-between p-3 hover:bg-gray-50">
                <div>
                  <div className="text-sm font-semibold">{l.title}</div>
                  <div className="text-xs text-gray-500">{l.type} · {formatMoney(l.price)}</div>
                </div>
                <StatusBadge status={l.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <PageHeading title="My service requests" />
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500">No requests yet.</p>
        ) : (
          <div className="card divide-y">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-semibold">{r.provider.name}</div>
                  <div className="text-xs text-gray-500">{formatDate(r.createdAt)} · {r.location}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <PageHeading
          title="Recent transactions"
          action={<Link href="/transactions" className="text-sm text-brand hover:underline">View all</Link>}
        />
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">No transactions yet.</p>
        ) : (
          <div className="card divide-y">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-semibold">{t.type} · {t.reference}</div>
                  <div className="text-xs text-gray-500">{formatDate(t.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatMoney(t.amount)}</div>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
