import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect(`/auth/login?error=${encodeURIComponent("Invalid email or password")}`);
  }
  if (user) {
    await createSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "USER" | "ADMIN" | "PROVIDER" | "SELLER",
    });
    redirect(user.role === "ADMIN" ? "/admin" : "/");
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="card p-6">
      <div className="mb-5 text-center">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
          SA
        </div>
        <h1 className="mt-3 text-lg font-bold">Sign in to Super App</h1>
        <p className="text-xs text-gray-500">Welcome back.</p>
      </div>
      {sp.error && (
        <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
          {sp.error}
        </div>
      )}
      <form action={loginAction} className="space-y-3">
        <div>
          <label className="label">Email</label>
          <input className="input" name="email" type="email" required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" name="password" type="password" required />
        </div>
        <button className="btn-primary w-full">Sign in</button>
      </form>
      <div className="mt-4 rounded-md bg-gray-50 p-3 text-xs text-gray-600">
        <div className="font-semibold text-gray-800">Demo accounts</div>
        <div>Admin: admin@superapp.test / admin1234</div>
        <div>User: priya@superapp.test / password</div>
      </div>
      <div className="mt-4 text-center text-xs text-gray-600">
        No account?{" "}
        <Link href="/auth/register" className="text-brand hover:underline">
          Create one
        </Link>
      </div>
    </div>
  );
}
