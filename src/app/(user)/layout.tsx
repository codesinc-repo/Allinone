import { AppHeader, BottomNav } from "@/components/Shell";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20 sm:pb-6">
      <AppHeader />
      <main className="mx-auto max-w-5xl p-4 sm:p-6">{children}</main>
      <BottomNav />
    </div>
  );
}
