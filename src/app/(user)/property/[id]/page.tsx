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
  if (!message || !contact) redirect(`/property/${listingId}`);
  await prisma.inquiry.create({ data: { listingId, buyerId: user!.id, message, contact } });
  redirect(`/property/${listingId}?sent=1`);
}

export default async function PropertyDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  const l = await prisma.listing.findUnique({
    where: { id },
    include: { seller: true },
  });
  if (!l || l.type !== "PROPERTY") notFound();
  const imgs = parseImages(l.images);
  const meta = parseMeta<{ bedrooms?: number; area?: string }>(l.meta);

  return (
    <div className="space-y-5">
      <PageHeading title={l.title} action={<Link href="/property" className="btn-outline">Back</Link>} />
      {sp.sent && <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">Inquiry sent to the owner/agent.</div>}
      <div className="grid gap-5 sm:grid-cols-5">
        <div className="sm:col-span-3 card overflow-hidden">
          <div className="aspect-video bg-gray-100">
            {imgs[0] ? <img src={imgs[0]} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-4xl">🏠</div>}
          </div>
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-brand">{formatMoney(l.price)}</div>
              <StatusBadge status={l.status} />
            </div>
            <div className="text-xs text-gray-500">{l.subtype} · {l.location}</div>
            {(meta.bedrooms || meta.area) && (
              <div className="text-xs text-gray-500">
                {meta.bedrooms ? `${meta.bedrooms} BR` : ""} {meta.area ? `· ${meta.area}` : ""}
              </div>
            )}
            <p className="whitespace-pre-line text-sm text-gray-700">{l.description}</p>
            <div className="text-xs text-gray-500">Posted {formatDate(l.createdAt)} by {l.seller.name}</div>
          </div>
        </div>

        <div className="sm:col-span-2">
          <form action={sendInquiry} className="card space-y-3 p-4">
            <div className="text-sm font-semibold">Contact owner / agent</div>
            <input type="hidden" name="listingId" value={l.id} />
            <div>
              <label className="label">Your contact</label>
              <input name="contact" className="input" required />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea name="message" required rows={3} className="input" placeholder="Interested in a site visit" />
            </div>
            <button className="btn-primary w-full" disabled={!user}>
              {user ? "Send inquiry" : "Sign in to inquire"}
            </button>
          </form>
          <div className="card mt-4 p-3 text-xs text-gray-600">
            Verify ownership and legal titles offline; the platform does not perform legal checks.
          </div>
        </div>
      </div>
    </div>
  );
}
