import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Blog Platform",
    template: "%s · Blog Platform",
  },
  description:
    "A blogging platform built with Next.js, Supabase, and AI-generated post summaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-dvh flex-col font-sans">
        <Header />
        <main className="relative flex min-h-0 flex-1 flex-col">{children}</main>
        <footer className="relative border-t border-stone-200/80 bg-[var(--surface)]/60 py-10 text-center backdrop-blur-sm dark:border-stone-800/80">
          <p className="text-xs font-medium tracking-[0.2em] text-[var(--muted)] uppercase">
            Blog Platform
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Next.js · Supabase · Google Gemini
          </p>
        </footer>
      </body>
    </html>
  );
}
