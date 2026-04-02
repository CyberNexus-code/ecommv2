import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import ClientLogger from "@/components/observability/ClientLogger";
import { getAllCategories } from "@/lib/items/get";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = "Cute & Creative Toppers";
const defaultTitle = "Handmade cake toppers and party decorations";
const defaultDescription = "Shop handmade cake toppers, party boxes, and custom celebration decor with nationwide delivery from Amanzimtoti.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | ${defaultTitle}`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  keywords: [
    "cake toppers",
    "custom cake toppers",
    "party boxes",
    "party decor",
    "handmade toppers",
    "South Africa party supplies",
  ],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: siteUrl,
    siteName,
    title: `${siteName} | ${defaultTitle}`,
    description: defaultDescription,
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: `${siteName} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | ${defaultTitle}`,
    description: defaultDescription,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { categories } = await getAllCategories();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col w-full overflow-y-auto`}
        >
        <ClientLogger />
        <AppShell categories={categories}>{children}</AppShell>
      </body>
    </html>
  );
}
