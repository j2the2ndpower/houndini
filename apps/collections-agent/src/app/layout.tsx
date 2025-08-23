import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b">
          <nav className="max-w-5xl mx-auto p-4 flex items-center gap-4 text-sm">
            <a href="/" className="font-medium">
              Houndini
            </a>
            <a href="/sequences" className="text-gray-600 hover:text-black">
              Sequences
            </a>
            <a href="/activity" className="text-gray-600 hover:text-black">
              Activity
            </a>
            <a href="/settings" className="text-gray-600 hover:text-black">
              Settings
            </a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
