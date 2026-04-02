'use client'

import { CloseButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BanknotesIcon,
  CakeIcon,
  ChevronRightIcon,
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
  { href: '/dashboard/accounting', label: 'Accounting', description: 'Invoices and exports', icon: BanknotesIcon },
]

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function DashboardNav() {
  const pathname = usePathname()
  const activeItem = navItems.find((item) => isActive(pathname, item.href)) ?? navItems[0]

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

      <div className="mb-4 xl:hidden">
        <Popover className="relative">
          <PopoverButton className="flex w-full items-center justify-between gap-3 rounded-[22px] border border-rose-200/80 bg-white/90 px-3 py-2.5 text-left shadow-[0_16px_34px_-26px_rgba(15,23,42,0.45)] backdrop-blur transition hover:border-rose-300 hover:bg-rose-50/80 sm:rounded-[24px] sm:px-4 sm:py-3">
            <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <span className="rounded-2xl bg-rose-100 p-2 text-rose-700">
                <activeItem.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-500">Dashboard Menu</span>
                <span className="mt-0.5 block truncate text-sm font-semibold text-stone-900">{activeItem.label}</span>
                <span className="block truncate text-xs text-stone-500">{activeItem.description}</span>
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700 sm:gap-2 sm:px-3 sm:text-xs sm:tracking-[0.16em]">
              <Bars3Icon className="size-4" />
              Open
            </span>
          </PopoverButton>

          <PopoverPanel anchor="bottom start" className="z-30 mt-2 w-[min(92vw,24rem)] overflow-hidden rounded-[24px] border border-rose-200 bg-white p-2 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)] sm:w-[min(92vw,30rem)] sm:rounded-[26px] sm:p-3">
            <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-[20px] bg-[linear-gradient(145deg,#fff1f2_0%,#ffffff_55%,#fff7f8_100%)] p-3 sm:rounded-[22px] sm:p-4">
              <div className="mb-3 flex items-start justify-between gap-3 border-b border-rose-100 pb-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-500">Admin Console</p>
                  <p className="mt-1 text-sm font-semibold text-stone-900">Choose a dashboard section</p>
                </div>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">{activeItem.label}</span>
              </div>

              <nav className="space-y-1.5 sm:space-y-2">
                {navItems.map((item) => {
                  const active = isActive(pathname, item.href)
                  const Icon = item.icon

                  return (
                    <CloseButton
                      key={`mobile-${item.href}`}
                      as={Link}
                      href={item.href}
                      className={[
                        'flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition sm:py-3',
                        active
                          ? 'bg-rose-700 text-white shadow-[0_18px_30px_-22px_rgba(15,23,42,0.85)]'
                          : 'bg-white text-stone-800 hover:bg-rose-50',
                      ].join(' ')}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className={[
                          'rounded-xl p-2',
                          active ? 'bg-white/15 text-white' : 'bg-rose-100 text-rose-700',
                        ].join(' ')}>
                          <Icon className="size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">{item.label}</span>
                          <span className={[
                            'block truncate text-xs',
                            active ? 'text-rose-50/80' : 'text-stone-500',
                          ].join(' ')}>
                            {item.description}
                          </span>
                        </span>
                      </span>
                      <ChevronRightIcon className={[
                        'size-4 shrink-0',
                        active ? 'text-white/80' : 'text-rose-400',
                      ].join(' ')} />
                    </CloseButton>
                  )
                })}
              </nav>
            </div>
          </PopoverPanel>
        </Popover>
      </div>
    </>
  )
}