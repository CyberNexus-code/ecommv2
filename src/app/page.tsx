import Image from "next/image";
import Link from "next/link";
import AuthComponent from "@/components/AuthComponent/authComponent";


export default function Home() {
  return (
    <>
    <AuthComponent />
    <div className="w-screen mx-auto">
        <div className="flex flex-col w-full mx-auto md:flex-row px-5 max-w-8/10 max-h-2/10 justify-around items-center">
          <Image
                    src="/logo.png"
                    alt="about us"
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
