import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { EmptyState } from "@/components/EmptyState";

export default async function FindHerePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; paid?: string }>;
}) {
  const sp = await searchParams;
  const [categories, entries] = await Promise.all([
    prisma.category.findMany({ where: { module: "DIRECTORY" }, orderBy: { name: "asc" } }),
    prisma.directoryEntry.findMany({
      where: {
        ...(sp.cat ? { category: { slug: sp.cat } } : {}),
        ...(sp.q
          ? { OR: [{ name: { contains: sp.q } }, { description: { contains: sp.q } }, { address: { contains: sp.q } }] }
          : {}),
        ...(sp.paid === "public" ? { isPaid: false } : sp.paid === "paid" ? { isPaid: true } : {}),
      },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      include: { category: true },
    }),
  ]);

  return (
    <div className="space-y-5">
      <PageHeading
        title="Find Here"
        sub="Government offices, utilities and paid private authorities — all in one directory."
        action={
          <Link href="/echallan" className="btn-outline">E-challan →</Link>
        }
      />

      <form className="card flex flex-wrap items-end gap-3 p-3" action="/find-here">
        <div className="min-w-[180px] flex-1">
          <label className="label">Search</label>
          <input name="q" defaultValue={sp.q ?? ""} className="input" placeholder="hospital, RTO, bank…" />
        </div>
        <div className="w-56">
          <label className="label">Category</label>
          <select name="cat" defaultValue={sp.cat ?? ""} className="input">
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <label className="label">Type</label>
          <select name="paid" defaultValue={sp.paid ?? ""} className="input">
            <option value="">Public + private</option>
            <option value="public">Public only</option>
            <option value="paid">Paid private</option>
          </select>
        </div>
        <button className="btn-primary">Apply</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/find-here?cat=${c.slug}`}
            className={`badge border ${sp.cat === c.slug ? "border-brand bg-brand text-white" : "border-gray-200 bg-white"}`}
          >
            {c.icon} {c.name}
          </Link>
        ))}
      </div>

      {entries.length === 0 ? (
        <EmptyState title="No entries match your filters" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map((e) => (
            <div key={e.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{e.name}</span>
                    {e.featured && <span className="badge border-amber-200 bg-amber-50 text-amber-700">★ Featured</span>}
                    {e.isPaid ? (
                      <span className="badge border-purple-200 bg-purple-50 text-purple-700">Paid</span>
                    ) : (
                      <span className="badge border-emerald-200 bg-emerald-50 text-emerald-700">Public</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{e.category.name}</div>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-700">{e.description}</p>
              <dl className="mt-3 space-y-1 text-xs text-gray-600">
                <div>📍 {e.address}</div>
                {e.phone && <div>📞 {e.phone}</div>}
                {e.hours && <div>🕒 {e.hours}</div>}
                {e.website && (
                  <div>🌐 <a href={e.website} target="_blank" rel="noreferrer" className="text-brand hover:underline">{e.website}</a></div>
                )}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
