import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super App — All-in-One",
  description:
    "Recharge, bills, marketplace, services, property, vehicles and public directory in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
