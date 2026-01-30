import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthComponent from "../components/AuthComponent/authComponent";
import Nav from "@/components/Nav/Nav";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cute & Creative Toppers",
  description: "Handmade cake toppers and party boxes for every occasion",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthComponent />
        <Nav />
        <div className="fixed inset-0 -z-10 text-black/10 bg-[url('/background-pattern.svg')] bg-repeat opacity-35" />
          {children}
      </body>
    </html>
  );
}
