import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { EmptyState } from "@/components/EmptyState";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const [categories, providers] = await Promise.all([
    prisma.category.findMany({ where: { module: "SERVICES" }, orderBy: { name: "asc" } }),
    prisma.serviceProvider.findMany({
      where: {
        ...(sp.cat ? { category: { slug: sp.cat } } : {}),
        ...(sp.q
          ? { OR: [{ name: { contains: sp.q } }, { serviceArea: { contains: sp.q } }, { bio: { contains: sp.q } }] }
          : {}),
      },
      orderBy: [{ verified: "desc" }, { rating: "desc" }],
      include: { category: true },
    }),
  ]);

  return (
    <div className="space-y-5">
      <PageHeading title="Home Services" sub="Find local electricians, plumbers, masons, labourers and more." />

      <form className="card flex flex-wrap items-end gap-3 p-3" action="/services">
        <div className="min-w-[180px] flex-1">
          <label className="label">Search</label>
          <input name="q" defaultValue={sp.q ?? ""} className="input" placeholder="name or area" />
        </div>
        <div className="w-56">
          <label className="label">Category</label>
          <select name="cat" defaultValue={sp.cat ?? ""} className="input">
            <option value="">All services</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary">Apply</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/services?cat=${c.slug}`}
            className={`badge border ${sp.cat === c.slug ? "border-brand bg-brand text-white" : "border-gray-200 bg-white"}`}
          >
            {c.icon} {c.name}
          </Link>
        ))}
      </div>

      {providers.length === 0 ? (
        <EmptyState title="No providers match your filters" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {providers.map((p) => (
            <Link key={p.id} href={`/services/${p.id}`} className="card flex gap-3 p-4 hover:shadow-md">
              <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-full bg-emerald-100 text-xl">
                🔧
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{p.name}</span>
                  {p.verified && <span className="badge border-sky-200 bg-sky-50 text-sky-700">✓</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {p.category.name} · {p.serviceArea}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-amber-600">★ {p.rating.toFixed(1)} ({p.reviewCount})</span>
                  <span className="text-gray-500">{p.availability}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
