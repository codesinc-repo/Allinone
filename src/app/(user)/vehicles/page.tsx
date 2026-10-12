import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney, parseImages, parseMeta } from "@/lib/utils";

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; subtype?: string; mode?: string }>;
}) {
  const sp = await searchParams;
  const mode = sp.mode ?? "SALE";
  const listings = await prisma.listing.findMany({
    where: {
      type: "VEHICLE",
      status: "ACTIVE",
      ...(sp.subtype ? { subtype: sp.subtype } : {}),
      ...(sp.q ? { OR: [{ title: { contains: sp.q } }, { location: { contains: sp.q } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  const filtered = listings.filter((l) => {
    const meta = parseMeta<{ listingMode?: string }>(l.meta);
    return (meta.listingMode ?? "SALE") === mode;
  });

  return (
    <div className="space-y-5">
      <PageHeading
        title="Vehicles"
        sub="Buy, sell or rent cars and bikes."
        action={<Link href="/vehicles/new" className="btn-primary">+ List</Link>}
      />

      <div className="flex gap-2">
        {["SALE", "RENTAL"].map((m) => (
          <Link
            key={m}
            href={`/vehicles?mode=${m}`}
            className={`badge border ${mode === m ? "border-brand bg-brand text-white" : "border-gray-200 bg-white"}`}
          >
            {m === "SALE" ? "For sale" : "For rent"}
          </Link>
        ))}
      </div>

      <form className="card flex flex-wrap items-end gap-3 p-3" action="/vehicles">
        <input type="hidden" name="mode" value={mode} />
        <div className="min-w-[180px] flex-1">
          <label className="label">Search</label>
          <input name="q" defaultValue={sp.q ?? ""} className="input" placeholder="model, area…" />
        </div>
        <div className="w-40">
          <label className="label">Type</label>
          <select name="subtype" defaultValue={sp.subtype ?? ""} className="input">
            <option value="">All</option>
            <option value="CAR">Car</option>
            <option value="BIKE">Bike / Scooter</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
        </div>
        <button className="btn-primary">Apply</button>
      </form>

      {filtered.length === 0 ? (
        <EmptyState title="No vehicles match your filters" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {filtered.map((l) => {
            const imgs = parseImages(l.images);
            const meta = parseMeta<{ year?: number; km?: number; fuel?: string; listingMode?: string }>(l.meta);
            return (
              <Link key={l.id} href={`/vehicles/${l.id}`} className="card overflow-hidden hover:shadow-md">
                <div className="aspect-video bg-gray-100">
                  {imgs[0] ? <img src={imgs[0]} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-3xl">🚗</div>}
                </div>
                <div className="p-3">
                  <div className="truncate text-sm font-semibold">{l.title}</div>
                  <div className="text-xs text-gray-500">
                    {meta.year ?? "—"} · {meta.km ? `${meta.km.toLocaleString("en-IN")} km` : "—"} · {meta.fuel ?? "—"}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{l.location}</span>
                    <span className="text-sm font-bold text-brand">
                      {formatMoney(l.price)}{meta.listingMode === "RENTAL" && "/day"}
                    </span>
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
