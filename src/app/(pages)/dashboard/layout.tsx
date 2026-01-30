import Link from "next/link";

export default async function DashboardLayout({
  children,
}: Readonly<{children: React.ReactNode;
}>) {
  return (
    <div>
        <div className="flex flex-column m-auto gap-2 w-screen h-screen">
            <div className="pt-5 px-2 bg-rose-700 h-full">
              <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1> 
              <Link href="/dashboard/products" className="text-white hover:underline">
                Manage Products
              </Link>
              <br />
              <Link href="/dashboard/orders" className="text-white hover:underline">
                View Orders
              </Link>
              <br />
              <Link href="/dashboard/users" className="text-white hover:underline">
                User Accounts
              </Link>    
            </div>
            <div>
                {children}
            </div>
        </div>
      </div>
  );
}  