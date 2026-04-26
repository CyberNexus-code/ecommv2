import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { siteDescription } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Handmade Cake Toppers & Party Decor',
  description: siteDescription,
  alternates: {
    canonical: '/',
  },
};

type HomePageProps = {
  searchParams?: Promise<{ reset?: string | string[] }>
}

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const resetParam = resolvedSearchParams?.reset;
  const showResetSuccess = Array.isArray(resetParam)
    ? resetParam.includes("success")
    : resetParam === "success";

  return (
    <>
    <div className="w-full mx-auto pb-12 md:pt-32 lg:pt-36">
        {showResetSuccess ? (
          <div className="mx-auto mb-4 max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800 shadow-sm">
            Password updated successfully. You can continue shopping or sign in with your new password.
          </div>
        ) : null}
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-8 px-5 md:flex-row md:items-start md:gap-12 lg:gap-16">
          <Image
            src="/logo.png"
            alt="Cute & Creative Toppers brand logo"
            width={1024}
            height={1024}
            sizes="(min-width: 1280px) 42rem, (min-width: 768px) 40vw, 82vw"
            className="h-auto w-[min(82vw,28rem)] object-contain md:w-[min(40vw,36rem)] lg:w-[min(42vw,42rem)]"
            priority
          />
          <div className="w-full max-w-xl md:max-w-[38rem] md:pt-10 lg:max-w-[40rem] lg:pt-14">
            <div className="w-full rounded-3xl">
            <h1 className="max-w-[15ch] text-balance text-[2.55rem] font-semibold leading-[0.94] tracking-[-0.04em] text-rose-700 sm:text-5xl md:max-w-none md:text-[3.1rem] lg:text-[3.5rem]">
              <span className="md:block">Welcome to</span>
              <span className="md:block">Cute & Creative Toppers!</span>
            </h1>
            <h2 className="mt-3 max-w-[30ch] text-balance text-lg leading-8 text-rose-950 sm:text-xl md:mt-4 md:max-w-[28ch]">Check out our selection of Cake toppers and party boxes!</h2>
            <Link href="/products" aria-label="Shop now!" className="mt-8 inline-flex rounded-xl bg-rose-700 px-7 py-3 text-white shadow-[0_14px_30px_-18px_rgba(190,24,93,0.8)] transition hover:bg-rose-600">Shop now!</Link>
            </div>
          </div>
        </div>
    </div>
    </>
  );
}
