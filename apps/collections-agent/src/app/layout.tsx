import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

// Using system fonts to avoid network fetch during build

export const metadata: Metadata = {
  title: "Houndini",
  description: "Houndini — AI collections sequences with Stripe and email",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <header className="border-b">
          <nav className="max-w-5xl mx-auto p-4 flex items-center gap-4 text-sm">
            <Link href="/" className="font-medium">
              Houndini
            </Link>
            <Link href="/sequences" className="text-gray-600 hover:text-black">
              Sequences
            </Link>
            <Link href="/activity" className="text-gray-600 hover:text-black">
              Activity
            </Link>
            <Link href="/settings" className="text-gray-600 hover:text-black">
              Settings
            </Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
