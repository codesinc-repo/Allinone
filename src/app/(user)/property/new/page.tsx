import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";

async function create(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const location = String(formData.get("location") ?? "").trim();
  const subtype = String(formData.get("subtype") ?? "HOUSE");
  const bedrooms = Number(formData.get("bedrooms") ?? 0) || undefined;
  const area = String(formData.get("area") ?? "").trim() || undefined;
  const imagesRaw = String(formData.get("images") ?? "").trim();
  if (!title || !description || !location || price <= 0) redirect("/property/new?error=1");
  const images = imagesRaw.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const l = await prisma.listing.create({
    data: {
      type: "PROPERTY",
      subtype,
      title,
      description,
      price,
      location,
      images: JSON.stringify(images),
      meta: JSON.stringify({ bedrooms, area }),
      sellerId: user!.id,
      status: "ACTIVE",
    },
  });
  redirect(`/property/${l.id}`);
}

export default async function NewPropertyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageHeading title="List a property" />
      <form action={create} className="card space-y-3 p-5">
        <div>
          <label className="label">Title</label>
          <input name="title" required className="input" placeholder="e.g. 3BHK house in Vastrapur" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Type</label>
            <select name="subtype" className="input" defaultValue="HOUSE">
              <option value="PLOT">Plot</option>
              <option value="HOUSE">House</option>
              <option value="APARTMENT">Apartment</option>
            </select>
          </div>
          <div>
            <label className="label">Price (₹)</label>
            <input name="price" type="number" min={1} required className="input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Bedrooms</label>
            <input name="bedrooms" type="number" className="input" />
          </div>
          <div>
            <label className="label">Area (sq ft / sq yd)</label>
            <input name="area" className="input" placeholder="e.g. 1800 sq ft" />
          </div>
        </div>
        <div>
          <label className="label">Location</label>
          <input name="location" required className="input" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" required rows={4} className="input" />
        </div>
        <div>
          <label className="label">Image URLs (one per line)</label>
          <textarea name="images" rows={2} className="input" />
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
          Note: ownership verification and legal checks are out of scope for the demo and must be handled offline.
        </div>
        <button className="btn-primary">Publish</button>
      </form>
    </div>
  );
}
