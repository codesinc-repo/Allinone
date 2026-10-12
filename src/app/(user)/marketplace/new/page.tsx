import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";

async function createListing(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const condition = String(formData.get("condition") ?? "USED");
  const location = String(formData.get("location") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const imagesRaw = String(formData.get("images") ?? "").trim();
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!title || !description || !location || price <= 0) {
    redirect("/marketplace/new?error=1");
  }

  const images = imagesRaw
    ? imagesRaw.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
    : [];

  const listing = await prisma.listing.create({
    data: {
      type: "PRODUCT",
      title,
      description,
      price,
      condition,
      location,
      images: JSON.stringify(images),
      status,
      categoryId: categoryId,
      sellerId: user!.id,
    },
  });

  redirect(`/marketplace/${listing.id}`);
}

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const categories = await prisma.category.findMany({
    where: { module: "MARKETPLACE" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageHeading title="Post a listing" sub="Add a few details — buyers will contact you in-app." />
      <form action={createListing} className="card space-y-3 p-5">
        <div>
          <label className="label">Title</label>
          <input name="title" required className="input" placeholder="e.g. iPhone 13 Pro (128GB) — immaculate" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" required rows={4} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Price (₹)</label>
            <input name="price" type="number" min={1} required className="input" />
          </div>
          <div>
            <label className="label">Condition</label>
            <select name="condition" className="input" defaultValue="USED">
              <option value="NEW">New</option>
              <option value="USED">Used</option>
              <option value="REFURBISHED">Refurbished</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select name="categoryId" className="input">
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input name="location" required className="input" placeholder="City, area" />
          </div>
        </div>
        <div>
          <label className="label">Image URLs (one per line)</label>
          <textarea name="images" rows={2} className="input" placeholder="https://…" />
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" className="input" defaultValue="ACTIVE">
            <option value="ACTIVE">Active (visible to all)</option>
            <option value="DRAFT">Draft (hidden)</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary">Publish</button>
        </div>
      </form>
    </div>
  );
}
