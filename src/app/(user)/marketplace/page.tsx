import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { formatMoney, parseImages } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; condition?: string }>;
}) {
  const sp = await searchParams;
  const [categories, listings] = await Promise.all([
    prisma.category.findMany({ where: { module: "MARKETPLACE" }, orderBy: { name: "asc" } }),
    prisma.listing.findMany({
      where: {
        type: "PRODUCT",
        status: "ACTIVE",
        ...(sp.q
          ? { OR: [{ title: { contains: sp.q } }, { description: { contains: sp.q } }] }
          : {}),
        ...(sp.cat ? { category: { slug: sp.cat } } : {}),
        ...(sp.condition ? { condition: sp.condition } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
  ]);

  return (
    <div className="space-y-5">
      <PageHeading
        title="Marketplace"
        sub="Browse or list new and used products from your area."
        action={<Link href="/marketplace/new" className="btn-primary">+ Sell</Link>}
      />

      <form className="card flex flex-wrap items-end gap-3 p-3" action="/marketplace">
        <div className="min-w-[180px] flex-1">
          <label className="label">Search</label>
          <input name="q" defaultValue={sp.q ?? ""} className="input" placeholder="phone, chair, bike…" />
        </div>
        <div className="w-40">
          <label className="label">Category</label>
          <select name="cat" defaultValue={sp.cat ?? ""} className="input">
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <label className="label">Condition</label>
          <select name="condition" defaultValue={sp.condition ?? ""} className="input">
            <option value="">Any</option>
            <option value="NEW">New</option>
            <option value="USED">Used</option>
            <option value="REFURBISHED">Refurbished</option>
          </select>
        </div>
        <button className="btn-primary">Apply</button>
      </form>

      {listings.length === 0 ? (
        <EmptyState title="No listings match" description="Try different filters, or post the first one." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {listings.map((l) => {
            const imgs = parseImages(l.images);
            return (
              <Link key={l.id} href={`/marketplace/${l.id}`} className="card overflow-hidden hover:shadow-md">
                <div className="aspect-video bg-gray-100">
                  {imgs[0] ? (
                    <img src={imgs[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-xl">🛍</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="truncate text-sm font-semibold">{l.title}</div>
                  <div className="text-xs text-gray-500">
                    {l.category?.name ?? "Uncategorised"} · {l.condition ?? "—"}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{l.location}</span>
                    <span className="text-sm font-bold text-brand">{formatMoney(l.price)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
