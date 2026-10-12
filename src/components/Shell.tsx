import Link from "next/link";
import { getSession } from "@/lib/auth";
import { MODULE_META } from "@/lib/constants";

export async function AppHeader() {
  const session = await getSession();
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
            SA
          </span>
          <span className="text-sm font-semibold">Super App</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/transactions" className="hidden text-gray-600 hover:text-gray-900 sm:inline">
            History
          </Link>
          {session ? (
            <>
              {session.role === "ADMIN" && (
                <Link href="/admin" className="text-brand hover:underline">
                  Admin
                </Link>
              )}
              <Link href="/profile" className="btn-outline">
                {session.name.split(" ")[0]}
              </Link>
            </>
          ) : (
            <Link href="/auth/login" className="btn-primary">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function BottomNav() {
  const items = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/marketplace", label: "Shop", icon: "🛍" },
    { href: "/services", label: "Services", icon: "🔧" },
    { href: "/transactions", label: "History", icon: "📋" },
    { href: "/profile", label: "Me", icon: "👤" },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white sm:hidden">
      <div className="mx-auto grid max-w-5xl grid-cols-5">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="flex flex-col items-center py-2 text-[11px] text-gray-600 hover:text-brand"
          >
            <span className="text-lg leading-none">{it.icon}</span>
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function PageHeading({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {sub && <p className="mt-1 text-sm text-gray-600">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function ModuleGrid() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {Object.entries(MODULE_META).map(([k, m]) => (
        <Link
          key={k}
          href={m.href}
          className="card flex flex-col items-center justify-center p-4 text-center hover:border-brand hover:shadow-md"
        >
          <div className={`grid h-11 w-11 place-items-center rounded-full text-xl ${m.color}`}>
            {m.icon}
          </div>
          <span className="mt-2 text-xs font-medium text-gray-800">{m.label}</span>
        </Link>
      ))}
    </div>
  );
}
