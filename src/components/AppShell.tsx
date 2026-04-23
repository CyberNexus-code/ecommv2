'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import Nav from '@/components/Nav/Nav'
import { isAuthPath } from '@/lib/auth/paths'
import { AuthProvider } from '@/lib/auth/context'
import type { CategoryType } from '@/types/categoryType'

type AppShellProps = {
  categories: CategoryType[]
  children: ReactNode
}

export default function AppShell({ categories, children }: AppShellProps) {
  const pathname = usePathname()

  if (isAuthPath(pathname)) {
    return <main id="main-content" className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
  }

  return (
    <AuthProvider>
      <a
        href="#main-content"
        className="sr-only absolute left-4 top-4 z-50 rounded-full bg-white px-4 py-2 text-sm font-medium text-rose-900 shadow focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-rose-500"
      >
        Skip to content
      </a>
      <Nav categories={categories} />
      <div className="flex-1 flex fixed inset-0 -z-10 text-black/10 bg-[url('/background-pattern.svg')] bg-repeat opacity-35 overflow-y-auto" />
      <div className='no-scrollbar flex-1 overflow-y-auto'>
        <div className="flex min-h-full flex-col">
          <main id="main-content" className="flex-1">{children}</main>
          <footer className="border-t border-rose-100 bg-white/85 px-4 py-5 backdrop-blur md:px-6">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 text-sm text-stone-600 md:flex-row md:items-center md:justify-between">
              <p>© 2026 Cute & Creative Toppers. All rights reserved.</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link href="/privacy-policy" className="transition hover:text-rose-700">Privacy Policy</Link>
                <Link href="/terms-of-service" className="transition hover:text-rose-700">Terms of Service</Link>
                <Link href="/contact" className="transition hover:text-rose-700">Contact</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </AuthProvider>
  )
}