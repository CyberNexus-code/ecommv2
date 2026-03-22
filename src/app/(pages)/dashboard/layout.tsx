import Link from "next/link";
import { getUserRole } from "@/lib/getuserRole";
import { TruckIcon, TableCellsIcon, CakeIcon, PresentationChartBarIcon } from "@heroicons/react/24/outline";

export default async function DashboardLayout({
  children,
}: Readonly<{children: React.ReactNode;
}>) {

  const styleClass = "flex items-center gap-3 rounded-xl px-3 py-2 text-rose-100 transition hover:bg-rose-600/70 hover:text-white";

  const role = await getUserRole();

  if(role === "admin"){
    const navItems = [
      { href: "/dashboard", label: "Overview", icon: <PresentationChartBarIcon className="size-5" /> },
      { href: "/dashboard/products", label: "Products", icon: <CakeIcon className="size-5" /> },
      { href: "/dashboard/categories", label: "Categories", icon: <TableCellsIcon className="size-5" /> },
      { href: "/dashboard/orders", label: "Orders", icon: <TruckIcon className="size-5" /> },
    ];

    return (
      <div className="relative flex min-h-[calc(100dvh-96px)] w-full">
        <aside className="hidden w-64 shrink-0 p-4 md:block">
          <div className="sticky top-4 rounded-2xl border border-rose-200 bg-rose-700 p-4 text-white shadow-[0_10px_30px_-18px_rgba(190,24,93,0.7)]">
            <h2 className="mb-1 text-lg font-semibold">Dashboard</h2>
            <p className="mb-4 text-sm text-rose-100/90">Manage products, categories and orders.</p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} className={styleClass} href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <section className="themed-scrollbar relative flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            {navItems.map((item) => (
              <Link
                key={`mobile-${item.href}`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700"
                href={item.href}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
          {children}
        </section>
        </div>
    );
  }else{
    return(
      <div className="m-auto rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-rose-800">You are not authorised to view this page</h1>
      </div>
    )
  }
}  
