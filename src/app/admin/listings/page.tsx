import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { StatusBadge } from "@/components/Badge";
import { formatDate, formatMoney } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { LISTING_STATUSES, LISTING_TYPES } from "@/lib/constants";

async function updateStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "ACTIVE");
  await prisma.listing.update({ where: { id }, data: { status } });
  revalidatePath("/admin/listings");
}

async function removeListing(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  await prisma.listing.delete({ where: { id } });
  revalidatePath("/admin/listings");
}

export default async function AdminListings({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const listings = await prisma.listing.findMany({
    where: {
      ...(sp.type ? { type: sp.type } : {}),
      ...(sp.status ? { status: sp.status } : {}),
      ...(sp.q ? { OR: [{ title: { contains: sp.q } }, { location: { contains: sp.q } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { seller: true, category: true },
  });

  return (
    <div className="space-y-5">
      <PageHeading title="Listings" sub="All marketplace, property and vehicle listings." />

      <form action="/admin/listings" className="card flex flex-wrap items-end gap-2 p-3">
        <div className="min-w-[160px] flex-1">
          <label className="label">Search</label>
          <input name="q" defaultValue={sp.q ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Type</label>
          <select name="type" defaultValue={sp.type ?? ""} className="input">
            <option value="">All</option>
            {LISTING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={sp.status ?? ""} className="input">
            <option value="">All</option>
            {LISTING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn-primary">Filter</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="p-3">Title</th>
              <th className="p-3">Type</th>
              <th className="p-3">Seller</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Posted</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} className="border-b last:border-0">
                <td className="p-3">
                  <Link href={`/${l.type === "PRODUCT" ? "marketplace" : l.type === "PROPERTY" ? "property" : "vehicles"}/${l.id}`} className="font-medium text-brand hover:underline">
                    {l.title}
                  </Link>
                  <div className="text-xs text-gray-500">{l.location}{l.category ? ` · ${l.category.name}` : ""}</div>
                </td>
                <td className="p-3 text-xs"><span className="badge border-gray-200 bg-gray-50">{l.type}</span></td>
                <td className="p-3 text-xs">{l.seller.name}</td>
                <td className="p-3">{formatMoney(l.price)}</td>
                <td className="p-3">
                  <form action={updateStatus} className="flex gap-1">
                    <input type="hidden" name="id" value={l.id} />
                    <select name="status" defaultValue={l.status} className="input !py-1 text-xs">
                      {LISTING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="btn-outline !px-2 !py-1 text-xs">Save</button>
                  </form>
                </td>
                <td className="p-3 text-xs text-gray-500">{formatDate(l.createdAt)}</td>
                <td className="p-3">
                  <form action={removeListing}>
                    <input type="hidden" name="id" value={l.id} />
                    <button className="btn-danger !px-2 !py-1 text-xs">Remove</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
