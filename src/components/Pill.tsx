"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function Pill({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`badge border ${active ? "border-brand bg-brand text-white" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
    >
      {children}
    </Link>
  );
}

export function FilterPill({
  param,
  value,
  label,
  base,
}: {
  param: string;
  value: string;
  label: string;
  base?: string;
}) {
  const path = usePathname();
  const sp = useSearchParams();
  const current = sp.get(param);
  const next = new URLSearchParams(sp.toString());
  if (current === value) next.delete(param);
  else next.set(param, value);
  const href = `${base ?? path}?${next.toString()}`;
  const active = current === value;
  return (
    <Pill href={href} active={active}>
      {label}
    </Pill>
  );
}
