import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import ClientLogger from "@/components/observability/ClientLogger";
import { getAllCategories } from "@/lib/items/get";
import { siteDescription, siteName, siteUrl, toAbsoluteUrl } from "@/lib/site";

const defaultTitle = "Handmade cake toppers and party decorations";
const defaultDescription = siteDescription;

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
  category: 'ecommerce',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { categories } = await getAllCategories();
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
        logo: toAbsoluteUrl('/logo.png'),
        sameAs: [siteUrl],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            url: toAbsoluteUrl('/contact'),
            areaServed: 'ZA',
            availableLanguage: ['en'],
          },
        ],
      },
      {
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        inLanguage: 'en-ZA',
      },
    ],
  }

  return (
    <html lang="en-ZA">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-dvh min-h-screen flex-col w-full overflow-hidden`}
        >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <ClientLogger />
        <AppShell categories={categories}>{children}</AppShell>
      </body>
    </html>
  );
}
