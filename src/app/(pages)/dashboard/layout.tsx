import Link from "next/link";
import { getUserRole } from "@/lib/getuserRole";
import { TruckIcon, UserGroupIcon, TableCellsIcon, CakeIcon, PresentationChartBarIcon } from "@heroicons/react/24/outline";

export default async function DashboardLayout({
  children,
}: Readonly<{children: React.ReactNode;
}>) {

  const styleClass = "flex bg-rose-700 cursor-pointer justify-start gap-4 hover:bg-rose-600 text-white p-2 active:bg-rose-700"

  const role = await getUserRole();

  if(role === "admin"){
    return (
      <div className="flex flex-1 h-full">
         <aside className="hidden md:block bg-rose-700 w-50 px-2 text-white">
            <nav className="flex flex-col pt-5 h-full">
              <Link className={styleClass} href="/dashboard"><PresentationChartBarIcon className="size-6"/>Overview</Link>
              <Link className={styleClass} href="/dashboard/products"><CakeIcon className="size-6"/>Products</Link>
              <Link className={styleClass} href="/dashboard/categories"><TableCellsIcon className="size-6"/>Categories</Link>
              <Link className={styleClass} href="/dashboard/orders"><TruckIcon className="size-6"/>Orders</Link>
              <Link className={styleClass} href="/dashboard/accounts"><UserGroupIcon className="size-6"/>Accounts</Link>
            </nav>
         </aside>
  
         <section className="flex-1 overflow-y-auto">
          {children}
         </section>
        </div>
    );
  }else{
    return(
      <div className="m-auto">
        <h1>You are not authorised to view this page</h1>
      </div>
    )
  }
}  