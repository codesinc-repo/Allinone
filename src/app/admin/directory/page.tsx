import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { revalidatePath } from "next/cache";

async function createEntry(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const website = String(formData.get("website") ?? "").trim() || null;
  const hours = String(formData.get("hours") ?? "").trim() || null;
  const isPaid = formData.get("isPaid") === "on";
  const featured = formData.get("featured") === "on";
  if (!name || !categoryId || !description || !address) return;
  await prisma.directoryEntry.create({
    data: { name, categoryId, description, address, phone, website, hours, isPaid, featured },
  });
  revalidatePath("/admin/directory");
}

async function toggleFeatured(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const e = await prisma.directoryEntry.findUnique({ where: { id } });
  if (!e) return;
  await prisma.directoryEntry.update({ where: { id }, data: { featured: !e.featured } });
  revalidatePath("/admin/directory");
}

async function deleteEntry(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  await prisma.directoryEntry.delete({ where: { id } });
  revalidatePath("/admin/directory");
}

export default async function AdminDirectory() {
  const [entries, categories] = await Promise.all([
    prisma.directoryEntry.findMany({ orderBy: { name: "asc" }, include: { category: true } }),
    prisma.category.findMany({ where: { module: "DIRECTORY" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <PageHeading title="Find Here directory" sub={`${entries.length} authorities and organisations`} />
      <form action={createEntry} className="card grid gap-3 p-4 sm:grid-cols-4">
        <div className="sm:col-span-4 text-sm font-semibold">Add an entry</div>
        <input name="name" required className="input" placeholder="Name" />
        <select name="categoryId" required className="input">
          <option value="">Category…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input name="phone" className="input" placeholder="Phone" />
        <input name="website" className="input" placeholder="Website" />
        <input name="hours" className="input sm:col-span-2" placeholder="Hours (e.g. Mon-Fri 10am-5pm)" />
        <input name="address" required className="input sm:col-span-2" placeholder="Address" />
        <textarea name="description" required rows={2} className="input sm:col-span-4" placeholder="Short description" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPaid" /> Paid private</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured</label>
        <div className="sm:col-span-2"><button className="btn-primary">Add entry</button></div>
      </form>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Address</th>
              <th className="p-3">Type</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{e.name}</td>
                <td className="p-3">{e.category.name}</td>
                <td className="p-3 text-xs text-gray-600">{e.address}</td>
                <td className="p-3">
                  <span className={`badge ${e.isPaid ? "border-purple-200 bg-purple-50 text-purple-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                    {e.isPaid ? "Paid" : "Public"}
                  </span>
                </td>
                <td className="p-3">
                  <form action={toggleFeatured}>
                    <input type="hidden" name="id" value={e.id} />
                    <button className={`badge ${e.featured ? "border-amber-200 bg-amber-50 text-amber-700" : "border-gray-200 bg-gray-50"}`}>
                      {e.featured ? "★ Featured" : "Make featured"}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={deleteEntry}>
                    <input type="hidden" name="id" value={e.id} />
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
