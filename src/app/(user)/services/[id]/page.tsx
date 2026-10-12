import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PageHeading } from "@/components/Shell";
import { StatusBadge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";

async function submitRequest(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const providerId = String(formData.get("providerId") ?? "");
  if (!user) redirect("/auth/login");
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const preferredTime = String(formData.get("preferredTime") ?? "").trim();
  if (!description || !location || !preferredTime) redirect(`/services/${providerId}?err=1`);
  await prisma.serviceRequest.create({
    data: { providerId, userId: user!.id, description, location, preferredTime },
  });
  redirect(`/services/${providerId}?sent=1`);
}

async function submitReview(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const providerId = String(formData.get("providerId") ?? "");
  if (!user) redirect("/auth/login");
  const rating = Number(formData.get("rating") ?? 5);
  const comment = String(formData.get("comment") ?? "").trim();
  if (!comment) redirect(`/services/${providerId}?err=review`);
  await prisma.review.create({
    data: { providerId, userId: user!.id, rating, comment },
  });
  // recompute aggregate
  const agg = await prisma.review.aggregate({
    where: { providerId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.serviceProvider.update({
    where: { id: providerId },
    data: {
      rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      reviewCount: agg._count,
    },
  });
  redirect(`/services/${providerId}?reviewed=1`);
}

async function reportProvider(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const providerId = String(formData.get("providerId") ?? "");
  if (!user) redirect("/auth/login");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) redirect(`/services/${providerId}`);
  await prisma.report.create({
    data: {
      targetType: "PROVIDER",
      targetId: providerId,
      reporterId: user!.id,
      reason,
    },
  });
  redirect(`/services/${providerId}?reported=1`);
}

export default async function ProviderDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; reviewed?: string; reported?: string; err?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  const p = await prisma.serviceProvider.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 10 },
      requests: user ? { where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 } : false,
    },
  });
  if (!p) notFound();

  return (
    <div className="space-y-5">
      <PageHeading
        title={p.name}
        action={<Link href="/services" className="btn-outline">Back</Link>}
      />
      {sp.sent && <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">Request sent — the provider will contact you.</div>}
      {sp.reviewed && <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">Thanks for your review.</div>}
      {sp.reported && <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">Reported — admin will review.</div>}

      <div className="grid gap-5 sm:grid-cols-5">
        <div className="sm:col-span-3 space-y-4">
          <div className="card p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl">🔧</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{p.name}</span>
                  {p.verified && <span className="badge border-sky-200 bg-sky-50 text-sky-700">✓ Verified</span>}
                </div>
                <div className="text-xs text-gray-500">{p.category.name} · {p.serviceArea}</div>
                <div className="text-xs text-gray-500">Availability: {p.availability}</div>
                <div className="text-sm font-semibold text-amber-600">★ {p.rating.toFixed(1)} ({p.reviewCount} reviews)</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-700">{p.bio}</p>
            <div className="mt-3 text-xs text-gray-500">Contact: {p.phone}</div>
          </div>

          <div className="card p-5">
            <div className="mb-3 text-sm font-semibold">Reviews</div>
            {p.reviews.length === 0 ? (
              <p className="text-sm text-gray-500">No reviews yet.</p>
            ) : (
              <ul className="space-y-3">
                {p.reviews.map((r) => (
                  <li key={r.id} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{r.user.name}</span>
                      <span className="text-xs text-amber-600">★ {r.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(r.createdAt)}</div>
                    <p className="mt-1 text-sm text-gray-700">{r.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="sm:col-span-2 space-y-4">
          <form action={submitRequest} className="card space-y-3 p-4">
            <div className="text-sm font-semibold">Request service</div>
            <input type="hidden" name="providerId" value={p.id} />
            <div>
              <label className="label">What needs doing?</label>
              <textarea name="description" rows={3} required className="input" placeholder="e.g. leaking bathroom tap" />
            </div>
            <div>
              <label className="label">Your location</label>
              <input name="location" required className="input" placeholder="Area, landmark" />
            </div>
            <div>
              <label className="label">Preferred time</label>
              <input name="preferredTime" required className="input" placeholder="e.g. Sat morning" />
            </div>
            <button className="btn-primary w-full" disabled={!user}>
              {user ? "Send request" : "Sign in to request"}
            </button>
          </form>

          {user && (
            <form action={submitReview} className="card space-y-3 p-4">
              <div className="text-sm font-semibold">Leave a review</div>
              <input type="hidden" name="providerId" value={p.id} />
              <div>
                <label className="label">Rating</label>
                <select name="rating" className="input" defaultValue="5">
                  {[5,4,3,2,1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Comment</label>
                <textarea name="comment" required rows={2} className="input" />
              </div>
              <button className="btn-outline w-full">Submit review</button>
            </form>
          )}

          <form action={reportProvider} className="card space-y-2 p-4">
            <div className="text-sm font-semibold">Report provider</div>
            <input type="hidden" name="providerId" value={p.id} />
            <select name="reason" className="input" defaultValue="">
              <option value="" disabled>Select a reason…</option>
              <option value="Fake profile">Fake profile</option>
              <option value="Did not show up">Did not show up</option>
              <option value="Poor quality / damage">Poor quality / damage</option>
              <option value="Unprofessional behaviour">Unprofessional behaviour</option>
            </select>
            <button className="btn-outline w-full">Report</button>
          </form>

          {Array.isArray(p.requests) && p.requests.length > 0 && (
            <div className="card p-4">
              <div className="mb-2 text-sm font-semibold">My requests to this provider</div>
              <ul className="divide-y">
                {p.requests.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2 text-xs">
                    <span>{formatDate(r.createdAt)}</span>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
