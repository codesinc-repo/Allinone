import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PageHeading } from "@/components/Shell";
import { StatusBadge } from "@/components/Badge";
import { formatDate, formatMoney, parseImages } from "@/lib/utils";

async function sendInquiry(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const listingId = String(formData.get("listingId") ?? "");
  if (!user) redirect(`/auth/login`);
  const message = String(formData.get("message") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  if (!message || !contact) redirect(`/marketplace/${listingId}?err=1`);
  await prisma.inquiry.create({
    data: { listingId, buyerId: user!.id, message, contact },
  });
  redirect(`/marketplace/${listingId}?sent=1`);
}

async function reportListing(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const listingId = String(formData.get("listingId") ?? "");
  if (!user) redirect("/auth/login");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) redirect(`/marketplace/${listingId}?err=report`);
  await prisma.report.create({
    data: {
      targetType: "LISTING",
      targetId: listingId,
      reporterId: user!.id,
      reason,
    },
  });
  redirect(`/marketplace/${listingId}?reported=1`);
}

async function updateStatus(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const listingId = String(formData.get("listingId") ?? "");
  const status = String(formData.get("status") ?? "ACTIVE");
  if (!user) redirect("/auth/login");
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.sellerId !== user!.id) redirect(`/marketplace/${listingId}`);
  await prisma.listing.update({ where: { id: listingId }, data: { status } });
  redirect(`/marketplace/${listingId}`);
}

export default async function ListingDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; reported?: string; err?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  const l = await prisma.listing.findUnique({
    where: { id },
    include: { seller: true, category: true, inquiries: user ? { where: { buyerId: user.id } } : false },
  });
  if (!l) notFound();
  const imgs = parseImages(l.images);
  const isSeller = user?.id === l.sellerId;

  return (
    <div className="space-y-5">
      <PageHeading
        title={l.title}
        action={<Link href="/marketplace" className="btn-outline">Back</Link>}
      />

      {sp.sent && <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">Inquiry sent to the seller.</div>}
      {sp.reported && <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">Report submitted — admin will review.</div>}

      <div className="grid gap-5 sm:grid-cols-5">
        <div className="sm:col-span-3 card overflow-hidden">
          <div className="aspect-video bg-gray-100">
            {imgs[0] ? (
              <img src={imgs[0]} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-4xl">🛍</div>
            )}
          </div>
          {imgs.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-2">
              {imgs.slice(1).map((src, i) => (
                <img key={i} src={src} alt="" className="h-16 w-24 flex-shrink-0 rounded object-cover" />
              ))}
            </div>
          )}
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-brand">{formatMoney(l.price)}</div>
              <StatusBadge status={l.status} />
            </div>
            <div className="text-xs text-gray-500">
              {l.category?.name ?? "Uncategorised"} · {l.condition ?? "—"} · {l.location}
            </div>
            <p className="whitespace-pre-line text-sm text-gray-700">{l.description}</p>
            <div className="text-xs text-gray-500">Posted {formatDate(l.createdAt)} by {l.seller.name}</div>
          </div>
        </div>

        <div className="space-y-4 sm:col-span-2">
          {isSeller ? (
            <div className="card p-4 space-y-3">
              <div className="text-sm font-semibold">Manage listing</div>
              <form action={updateStatus} className="flex gap-2">
                <input type="hidden" name="listingId" value={l.id} />
                <select name="status" defaultValue={l.status} className="input flex-1">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DRAFT">Draft</option>
                </select>
                <button className="btn-primary">Save</button>
              </form>
              <div className="text-xs text-gray-500">You can&apos;t message yourself.</div>
            </div>
          ) : (
            <form action={sendInquiry} className="card space-y-3 p-4">
              <div className="text-sm font-semibold">Contact seller</div>
              <input type="hidden" name="listingId" value={l.id} />
              <div>
                <label className="label">Your contact (phone or email)</label>
                <input name="contact" className="input" required />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea name="message" required rows={3} className="input" placeholder="Hi, is this still available?" />
              </div>
              <button className="btn-primary w-full" disabled={!user}>
                {user ? "Send inquiry" : "Sign in to contact seller"}
              </button>
            </form>
          )}

          <form action={reportListing} className="card space-y-2 p-4">
            <div className="text-sm font-semibold">Report this listing</div>
            <input type="hidden" name="listingId" value={l.id} />
            <select name="reason" className="input" defaultValue="">
              <option value="" disabled>Select a reason…</option>
              <option value="Suspected fraud">Suspected fraud</option>
              <option value="Prohibited item">Prohibited item</option>
              <option value="Spam / duplicate">Spam / duplicate</option>
              <option value="Wrong category">Wrong category</option>
            </select>
            <button className="btn-outline w-full">Report</button>
          </form>
        </div>
      </div>
    </div>
  );
}
