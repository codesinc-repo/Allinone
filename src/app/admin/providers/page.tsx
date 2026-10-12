import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/utils";

async function createProvider(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const bio = String(formData.get("bio") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const serviceArea = String(formData.get("serviceArea") ?? "").trim();
  const availability = String(formData.get("availability") ?? "").trim();
  const verified = formData.get("verified") === "on";
  if (!name || !categoryId || !phone) return;
  await prisma.serviceProvider.create({
    data: { name, categoryId, bio, phone, serviceArea, availability, verified },
  });
  revalidatePath("/admin/providers");
}

async function toggleVerified(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const p = await prisma.serviceProvider.findUnique({ where: { id } });
  if (!p) return;
  await prisma.serviceProvider.update({ where: { id }, data: { verified: !p.verified } });
  revalidatePath("/admin/providers");
}

async function deleteProvider(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  await prisma.serviceProvider.delete({ where: { id } });
  revalidatePath("/admin/providers");
}

export default async function AdminProviders() {
  const [providers, categories] = await Promise.all([
    prisma.serviceProvider.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true, _count: { select: { requests: true, reviews: true } } },
    }),
    prisma.category.findMany({ where: { module: "SERVICES" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <PageHeading title="Service providers" sub={`${providers.length} providers listed`} />

      <form action={createProvider} className="card grid gap-3 p-4 sm:grid-cols-3">
        <div className="sm:col-span-3 text-sm font-semibold">Add a provider</div>
        <input name="name" required className="input" placeholder="Business / provider name" />
        <select name="categoryId" required className="input">
          <option value="">Category…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input name="phone" required className="input" placeholder="Contact phone" />
        <input name="serviceArea" required className="input" placeholder="Service area" />
        <input name="availability" required className="input" placeholder="e.g. Mon-Sat 9am-7pm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="verified" /> Verified
        </label>
        <textarea name="bio" rows={2} className="input sm:col-span-3" placeholder="Short bio" />
        <div className="sm:col-span-3"><button className="btn-primary">Add provider</button></div>
      </form>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Area</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Verified</th>
              <th className="p-3">Added</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3">{p.serviceArea}</td>
                <td className="p-3">{p.phone}</td>
                <td className="p-3">★ {p.rating.toFixed(1)} ({p._count.reviews})</td>
                <td className="p-3">
                  <form action={toggleVerified}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className={`badge ${p.verified ? "border-sky-200 bg-sky-50 text-sky-700" : "border-gray-200 bg-gray-50"}`}>
                      {p.verified ? "Verified" : "Mark verified"}
                    </button>
                  </form>
                </td>
                <td className="p-3 text-xs">{formatDate(p.createdAt)}</td>
                <td className="p-3">
                  <form action={deleteProvider}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="btn-danger !px-2 !py-1 text-xs">Delete</button>
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
