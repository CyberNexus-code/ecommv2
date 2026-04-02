import { getUserRole } from "@/lib/getuserRole";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: Readonly<{children: React.ReactNode;
}>) {

  const role = await getUserRole();

  if(role !== "admin"){
    redirect("/");
  }

  return (
    <div className="relative min-h-[calc(100dvh-96px)] w-full bg-[radial-gradient(circle_at_top_left,rgba(251,207,232,0.35),transparent_26%),linear-gradient(180deg,#fff7f8_0%,#fff 36%,#fff1f2 100%)]">
      <div className="mx-auto flex w-full max-w-[1500px] gap-4 px-4 py-4 md:px-6 md:py-6">
        <DashboardNav />

        <section className="themed-scrollbar relative min-w-0 flex-1 overflow-y-auto rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur md:p-6">
          {children}
        </section>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_15%,rgba(251,113,133,0.12),transparent_18%),radial-gradient(circle_at_12%_82%,rgba(244,114,182,0.12),transparent_20%)]" />
    </div>
  );
}  
