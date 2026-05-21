import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Trim.ai — AI Spend Audit Tool",
    template: "%s | Trim.ai",
  },
  description:
    "Audit your AI tool subscriptions in 2 minutes. Find overlapping licenses, optimize seat plans, and discover cheaper alternatives. Save up to 40% on your AI stack.",
  keywords: [
    "AI spend audit",
    "AI cost optimization",
    "ChatGPT savings",
    "Cursor pricing",
    "Claude pricing",
    "AI subscription management",
    "developer tools cost",
  ],
  authors: [{ name: "Trim.ai" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "Trim.ai",
    title: "Trim.ai — Audit Your AI Spend in 2 Minutes",
    description:
      "Find overlapping AI subscriptions, optimize seat plans, and save up to 40% on your AI stack.",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trim.ai — AI Spend Audit Tool",
    description:
      "Audit your AI tool subscriptions in 2 minutes. Save up to 40% on your stack.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
