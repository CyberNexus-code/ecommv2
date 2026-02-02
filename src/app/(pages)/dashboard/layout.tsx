import Link from "next/link";

export default async function DashboardLayout({
  children,
}: Readonly<{children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 h-full">
       <aside className="bg-rose-700 pt-5 px-2 text-white">
          <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
          <nav className="flex flex-col space-y-2">
            <Link href="/dashboard/products">Products</Link>
            <Link href="/dashboard/categories">Categories</Link>
            <Link href="/dashboard/orders">Orders</Link>
            <Link href="/dashboard/accounts">Accounts</Link>
          </nav>
       </aside>

       <section className="flex-1 overflow-auto">
        {children}
       </section>
      </div>
  );
}  