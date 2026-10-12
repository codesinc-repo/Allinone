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
  const subtype = String(formData.get("subtype") ?? "CAR");
  const year = Number(formData.get("year") ?? 0) || undefined;
  const km = Number(formData.get("km") ?? 0) || undefined;
  const fuel = String(formData.get("fuel") ?? "").trim() || undefined;
  const listingMode = String(formData.get("listingMode") ?? "SALE");
  const condition = String(formData.get("condition") ?? "USED");
  const imagesRaw = String(formData.get("images") ?? "").trim();
  if (!title || !description || !location || price <= 0) redirect("/vehicles/new?error=1");
  const images = imagesRaw.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const l = await prisma.listing.create({
    data: {
      type: "VEHICLE",
      subtype,
      title,
      description,
      price,
      condition,
      location,
      images: JSON.stringify(images),
      meta: JSON.stringify({ year, km, fuel, listingMode }),
      sellerId: user!.id,
      status: "ACTIVE",
    },
  });
  redirect(`/vehicles/${l.id}`);
}

export default async function NewVehiclePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageHeading title="List a vehicle" />
      <form action={create} className="card space-y-3 p-5">
        <div>
          <label className="label">Title</label>
          <input name="title" required className="input" placeholder="e.g. 2019 Honda City VX" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Mode</label>
            <select name="listingMode" className="input" defaultValue="SALE">
              <option value="SALE">For sale</option>
              <option value="RENTAL">For rent (per day)</option>
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select name="subtype" className="input" defaultValue="CAR">
              <option value="CAR">Car</option>
              <option value="BIKE">Bike / Scooter</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>
          <div>
            <label className="label">Condition</label>
            <select name="condition" className="input" defaultValue="USED">
              <option value="NEW">New</option>
              <option value="USED">Used</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Price (₹)</label>
            <input name="price" type="number" min={1} required className="input" />
          </div>
          <div>
            <label className="label">Year</label>
            <input name="year" type="number" className="input" />
          </div>
          <div>
            <label className="label">Kilometres</label>
            <input name="km" type="number" className="input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Fuel</label>
            <select name="fuel" className="input" defaultValue="">
              <option value="">—</option>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>CNG</option>
              <option>Electric</option>
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input name="location" required className="input" />
          </div>
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
          Rental deposits, insurance, and cancellation policies are out of demo scope — handle offline until approved.
        </div>
        <button className="btn-primary">Publish</button>
      </form>
    </div>
  );
}
