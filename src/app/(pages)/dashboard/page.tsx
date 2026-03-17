import Link from "next/link";

export default function DashboardPage() {
    const cards = [
      { title: "Products", description: "Create and manage product listings.", href: "/dashboard/products" },
      { title: "Categories", description: "Organize your storefront structure.", href: "/dashboard/categories" },
      { title: "Orders", description: "Track status and process customer orders.", href: "/dashboard/orders" },
    ];

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-500">Admin Overview</p>
          <h1 className="mt-1 text-2xl font-semibold text-rose-900 md:text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-stone-600 md:text-base">
            Use this space to keep your catalog updated and orders moving smoothly.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-rose-800">{card.title}</h2>
              <p className="mt-2 text-sm text-stone-600">{card.description}</p>
              <p className="mt-4 text-sm font-medium text-rose-600">Open {card.title}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }
