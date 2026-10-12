import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { MODULES } from "@/lib/constants";
import { revalidatePath } from "next/cache";

async function createCategory(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const module = String(formData.get("module") ?? "MARKETPLACE");
  const icon = String(formData.get("icon") ?? "").trim() || null;
  if (!name) return;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  await prisma.category.create({ data: { name, slug, module, icon } });
  revalidatePath("/admin/categories");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

export default async function AdminCategories() {
  const grouped = await Promise.all(
    MODULES.map(async (m) => ({
      module: m,
      items: await prisma.category.findMany({ where: { module: m }, orderBy: { name: "asc" } }),
    })),
  );

  return (
    <div className="space-y-5">
      <PageHeading title="Categories" sub="Taxonomy for marketplace, services and directory." />
      <form action={createCategory} className="card grid gap-3 p-4 sm:grid-cols-4">
        <div className="sm:col-span-4 text-sm font-semibold">Add a category</div>
        <input name="name" required className="input" placeholder="Name" />
        <select name="module" className="input" defaultValue="MARKETPLACE">
          {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <input name="icon" className="input" placeholder="Icon (emoji optional)" />
        <button className="btn-primary">Add</button>
      </form>

      {grouped.map((g) => (
        <section key={g.module}>
          <h2 className="mb-2 text-sm font-semibold">{g.module}</h2>
          <div className="card divide-y">
            {g.items.length === 0 && <div className="p-3 text-xs text-gray-500">No categories.</div>}
            {g.items.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <span className="mr-2">{c.icon}</span>
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-2 text-xs text-gray-500">/{c.slug}</span>
                </div>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="btn-danger !px-2 !py-1 text-xs">Delete</button>
                </form>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
