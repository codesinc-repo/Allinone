import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";

async function registerAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name || !email || password.length < 6) {
    redirect(`/auth/register?error=${encodeURIComponent("Fill all fields; password 6+ chars")}`);
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/auth/register?error=${encodeURIComponent("Email already registered")}`);
  }
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash: await hashPassword(password) },
  });
  await createSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: "USER",
  });
  redirect("/");
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="card p-6">
      <div className="mb-5 text-center">
        <h1 className="text-lg font-bold">Create your account</h1>
        <p className="text-xs text-gray-500">One account across every service.</p>
      </div>
      {sp.error && (
        <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
          {sp.error}
        </div>
      )}
      <form action={registerAction} className="space-y-3">
        <div>
          <label className="label">Full name</label>
          <input className="input" name="name" required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" name="email" type="email" required />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" name="phone" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" name="password" type="password" minLength={6} required />
        </div>
        <button className="btn-primary w-full">Create account</button>
      </form>
      <div className="mt-4 text-center text-xs text-gray-600">
        Already have one?{" "}
        <Link href="/auth/login" className="text-brand hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
