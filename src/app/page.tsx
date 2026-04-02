import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Browse handmade cake toppers, party boxes, and custom celebration decor for birthdays, weddings, and special occasions.",
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
    <div className="h-screen w-full mx-auto md:pt-42">
        {showResetSuccess ? (
          <div className="mx-auto mb-4 max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800 shadow-sm">
            Password updated successfully. You can continue shopping or sign in with your new password.
          </div>
        ) : null}
        <div className="flex flex-col w-full mx-auto md:flex-row px-5 max-w-8/10 max-h-2/10 justify-around items-center">
          <Image
                    src="/logo.png"
                    alt="Cute & Creative Toppers brand logo"
                    width={400} // fixed width
                    height={200} // auto-height maintained
                    className="object-contain"
                  />
          <div className="md:w-9/10">
            <div className="h-90 w-full rounded-3xl md:my-10 md:mx-10 md:pt-10">
            <h1 className="text-red-600 md:text-base lg:text-3xl">Welcome to Cute & Creative Toppers!</h1>
            <h2 className="mb-10">Check out our selection of Cake toppers and party boxes!</h2>
            <Link href="/products" aria-label="Shop now!" className="bg-rose-700 text-white rounded-xl py-3 px-6">Shop now!</Link>
            </div>
          </div>
        </div>
    </div>
    </>
  );
}
