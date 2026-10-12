import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PageHeading } from "@/components/Shell";
import { StatusBadge } from "@/components/Badge";
import { formatDate, formatMoney, parseImages, parseMeta } from "@/lib/utils";

async function sendInquiry(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const listingId = String(formData.get("listingId") ?? "");
  if (!user) redirect("/auth/login");
  const message = String(formData.get("message") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  if (!message || !contact) redirect(`/vehicles/${listingId}`);
  await prisma.inquiry.create({ data: { listingId, buyerId: user!.id, message, contact } });
  redirect(`/vehicles/${listingId}?sent=1`);
}

export default async function VehicleDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  const l = await prisma.listing.findUnique({ where: { id }, include: { seller: true } });
  if (!l || l.type !== "VEHICLE") notFound();
  const imgs = parseImages(l.images);
  const meta = parseMeta<{ year?: number; km?: number; fuel?: string; listingMode?: string }>(l.meta);
  const isRental = meta.listingMode === "RENTAL";

  return (
    <div className="space-y-5">
      <PageHeading title={l.title} action={<Link href="/vehicles" className="btn-outline">Back</Link>} />
      {sp.sent && <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">Inquiry sent.</div>}
      <div className="grid gap-5 sm:grid-cols-5">
        <div className="sm:col-span-3 card overflow-hidden">
          <div className="aspect-video bg-gray-100">
            {imgs[0] ? <img src={imgs[0]} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-4xl">🚗</div>}
          </div>
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-brand">
                {formatMoney(l.price)}{isRental && "/day"}
              </div>
              <StatusBadge status={l.status} />
            </div>
            <div className="text-xs text-gray-500">
              {l.subtype} · {meta.year ?? "—"} · {meta.km ? `${meta.km.toLocaleString("en-IN")} km` : "—"} · {meta.fuel ?? "—"}
            </div>
            <p className="whitespace-pre-line text-sm text-gray-700">{l.description}</p>
            <div className="text-xs text-gray-500">Posted {formatDate(l.createdAt)} by {l.seller.name}</div>
          </div>
        </div>

        <div className="sm:col-span-2">
          <form action={sendInquiry} className="card space-y-3 p-4">
            <div className="text-sm font-semibold">
              {isRental ? "Request rental" : "Contact seller"}
            </div>
            <input type="hidden" name="listingId" value={l.id} />
            <div>
              <label className="label">Your contact</label>
              <input name="contact" className="input" required />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea name="message" required rows={3} className="input" placeholder={isRental ? "Dates needed, pickup area…" : "Is this still available?"} />
            </div>
            <button className="btn-primary w-full" disabled={!user}>
              {user ? "Send" : "Sign in to send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
