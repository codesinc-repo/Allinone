import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney, parseImages, parseMeta } from "@/lib/utils";

export default async function PropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; subtype?: string; max?: string }>;
}) {
  const sp = await searchParams;
  const listings = await prisma.listing.findMany({
    where: {
      type: "PROPERTY",
      status: "ACTIVE",
      ...(sp.subtype ? { subtype: sp.subtype } : {}),
      ...(sp.q
        ? { OR: [{ title: { contains: sp.q } }, { location: { contains: sp.q } }] }
        : {}),
      ...(sp.max ? { price: { lte: Number(sp.max) } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <PageHeading
        title="Property"
        sub="Plots for resale and houses for sale."
        action={<Link href="/property/new" className="btn-primary">+ List</Link>}
      />

      <form className="card flex flex-wrap items-end gap-3 p-3" action="/property">
        <div className="min-w-[180px] flex-1">
          <label className="label">Search</label>
          <input name="q" defaultValue={sp.q ?? ""} className="input" placeholder="area, title…" />
        </div>
        <div className="w-40">
          <label className="label">Type</label>
          <select name="subtype" defaultValue={sp.subtype ?? ""} className="input">
            <option value="">All</option>
            <option value="PLOT">Plot</option>
            <option value="HOUSE">House</option>
            <option value="APARTMENT">Apartment</option>
          </select>
        </div>
        <div className="w-40">
          <label className="label">Max price (₹)</label>
          <input name="max" type="number" defaultValue={sp.max ?? ""} className="input" />
        </div>
        <button className="btn-primary">Apply</button>
      </form>

      {listings.length === 0 ? (
        <EmptyState title="No properties match your filters" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {listings.map((l) => {
            const imgs = parseImages(l.images);
            const meta = parseMeta<{ bedrooms?: number; area?: string }>(l.meta);
            return (
              <Link key={l.id} href={`/property/${l.id}`} className="card overflow-hidden hover:shadow-md">
                <div className="aspect-video bg-gray-100">
                  {imgs[0] ? (
                    <img src={imgs[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-3xl">🏠</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="truncate text-sm font-semibold">{l.title}</div>
                  <div className="text-xs text-gray-500">
                    {l.subtype ?? "—"} · {l.location}
                  </div>
                  <div className="text-xs text-gray-500">
                    {meta.bedrooms ? `${meta.bedrooms} BR · ` : ""}{meta.area ?? ""}
                  </div>
                  <div className="mt-1 text-sm font-bold text-brand">{formatMoney(l.price)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
