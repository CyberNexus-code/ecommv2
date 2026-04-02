'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CakeIcon,
  PresentationChartBarIcon,
  SwatchIcon,
  TableCellsIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'

const navItems = [
  { href: '/dashboard', label: 'Overview', description: 'Metrics and catalog health', icon: PresentationChartBarIcon },
  { href: '/dashboard/products', label: 'Products', description: 'Catalog and merchandising', icon: CakeIcon },
  { href: '/dashboard/categories', label: 'Categories', description: 'Storefront organization', icon: TableCellsIcon },
  { href: '/dashboard/tags', label: 'Tags', description: 'Themes and search filters', icon: SwatchIcon },
  { href: '/dashboard/orders', label: 'Orders', description: 'Fulfillment and revenue', icon: TruckIcon },
]

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <>
      <aside className="hidden w-[292px] shrink-0 p-4 xl:block">
        <div className="sticky top-4 overflow-hidden rounded-[28px] border border-rose-200/80 bg-[linear-gradient(165deg,#881337_0%,#be123c_42%,#1f2937_140%)] p-5 text-white shadow-[0_22px_50px_-28px_rgba(159,18,57,0.85)]">
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,#fecdd3_0%,transparent_72%)] opacity-25" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-100/80">Admin Console</p>
            <h2 className="mt-2 text-2xl font-semibold">Dashboard</h2>
            <p className="mt-2 max-w-xs text-sm text-rose-50/80">
              Monitor sales, tune the catalog, and keep fulfillment moving without jumping between screens.
            </p>

            <nav className="mt-6 space-y-2">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'group flex items-start gap-3 rounded-2xl px-4 py-3 transition',
                      active
                        ? 'bg-white text-rose-900 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.9)]'
                        : 'text-rose-50/88 hover:bg-white/12 hover:text-white',
                    ].join(' ')}
                  >
                    <span className={[
                      'mt-0.5 rounded-xl p-2 transition',
                      active ? 'bg-rose-100 text-rose-700' : 'bg-white/10 text-rose-50 group-hover:bg-white/15',
                    ].join(' ')}>
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className={[
                        'mt-0.5 block text-xs',
                        active ? 'text-stone-600' : 'text-rose-50/65',
                      ].join(' ')}>
                        {item.description}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-6 rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-100/75">Focus</p>
              <p className="mt-2 text-sm text-white/90">Review untagged products regularly so storefront filters stay useful and search-friendly.</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:hidden">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon

          return (
            <Link
              key={`mobile-${item.href}`}
              href={item.href}
              className={[
                'flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition',
                active
                  ? 'border-rose-300 bg-rose-700 text-white shadow-sm'
                  : 'border-rose-200 bg-white text-rose-800 hover:border-rose-300 hover:bg-rose-50',
              ].join(' ')}
            >
              <Icon className="size-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}