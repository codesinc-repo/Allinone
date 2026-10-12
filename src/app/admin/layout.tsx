import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, destroySession } from "@/lib/auth";

async function logoutAction() {
  "use server";
  await destroySession();
  redirect("/auth/login");
}

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/providers", label: "Providers" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/operators", label: "Operators" },
  { href: "/admin/transactions", label: "Transactions" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/directory", label: "Directory" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/auth/login?error=Admin+area+requires+sign-in");
  if (session.role !== "ADMIN") redirect("/?error=admin-only");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-56 flex-shrink-0 border-r border-gray-200 bg-white sm:block">
        <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
          <span className="grid h-7 w-7 place-items-center rounded bg-brand text-xs font-bold text-white">SA</span>
          <div>
            <div className="text-sm font-semibold">Admin</div>
            <div className="text-[10px] text-gray-500">Super App</div>
          </div>
        </div>
        <nav className="p-2 text-sm">
          {NAV.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="block rounded-md px-3 py-2 text-gray-700 hover:bg-brand-50 hover:text-brand"
            >
              {it.label}
            </Link>
          ))}
          <Link href="/" className="mt-6 block rounded-md px-3 py-2 text-xs text-gray-500 hover:text-gray-800">
            ← Back to app
          </Link>
          <form action={logoutAction}>
            <button className="mt-1 w-full rounded-md px-3 py-2 text-left text-xs text-gray-500 hover:text-gray-800">
              Sign out
            </button>
          </form>
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
          <nav className="flex gap-2 overflow-x-auto text-sm sm:hidden">
            {NAV.map((it) => (
              <Link key={it.href} href={it.href} className="whitespace-nowrap text-gray-700">
                {it.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto text-xs text-gray-500">
            Signed in as <span className="font-medium text-gray-800">{session.name}</span>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
