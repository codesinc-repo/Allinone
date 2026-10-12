import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ModuleGrid, PageHeading } from "@/components/Shell";
import { StatusBadge } from "@/components/Badge";
import { formatDate, formatMoney, parseImages } from "@/lib/utils";

export default async function HomePage() {
  const session = await getSession();
  const [featuredListings, topProviders, recentTxns] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.serviceProvider.findMany({
      orderBy: [{ verified: "desc" }, { rating: "desc" }],
      take: 4,
      include: { category: true },
    }),
    session
      ? prisma.transaction.findMany({
          where: { userId: session.sub },
          orderBy: { createdAt: "desc" },
          take: 3,
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-brand to-brand-700 p-5 text-white sm:p-7">
        <div className="text-xs opacity-80">
          {session ? `Welcome back, ${session.name.split(" ")[0]}` : "Welcome"}
        </div>
        <h1 className="mt-1 text-xl font-bold sm:text-2xl">
          Everything you need, in one app
        </h1>
        <p className="mt-1 max-w-md text-sm opacity-90">
          Pay bills, buy & sell, book trusted services, browse property & vehicles,
          and find local authorities.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/recharge"
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand"
          >
            Recharge now
          </Link>
          <Link
            href="/marketplace/new"
            className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Post a listing
          </Link>
        </div>
      </section>

      <section>
        <PageHeading title="Browse services" sub="Pick any module to begin." />
        <ModuleGrid />
      </section>

      {recentTxns.length > 0 && (
        <section>
          <PageHeading
            title="Recent transactions"
            action={
              <Link href="/transactions" className="text-sm text-brand hover:underline">
                View all
              </Link>
            }
          />
          <div className="card divide-y">
            {recentTxns.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {t.type} · {t.reference}
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(t.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatMoney(t.amount)}</div>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <PageHeading
          title="Fresh in the marketplace"
          action={
            <Link href="/marketplace" className="text-sm text-brand hover:underline">
              See all
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {featuredListings.map((l) => {
            const imgs = parseImages(l.images);
            return (
              <Link
                key={l.id}
                href={`/marketplace/${l.id}`}
                className="card overflow-hidden hover:shadow-md"
              >
                <div className="aspect-video bg-gray-100">
                  {imgs[0] ? (
                    <img src={imgs[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-xl">🛍</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {l.title}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{l.location}</span>
                    <span className="text-sm font-bold text-brand">
                      {formatMoney(l.price)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <PageHeading
          title="Trusted service providers"
          action={
            <Link href="/services" className="text-sm text-brand hover:underline">
              See all
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {topProviders.map((p) => (
            <Link
              key={p.id}
              href={`/services/${p.id}`}
              className="card flex items-center gap-3 p-3 hover:shadow-md"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-xl">
                🔧
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{p.name}</span>
                  {p.verified && (
                    <span className="badge bg-sky-50 text-sky-700 border-sky-200">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {p.category.name} · {p.serviceArea}
                </div>
              </div>
              <div className="text-sm font-semibold text-amber-600">★ {p.rating.toFixed(1)}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
