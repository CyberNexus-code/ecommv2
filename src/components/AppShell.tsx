'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import Nav from '@/components/Nav/Nav'
import { AuthProvider } from '@/lib/auth/context'
import type { CategoryType } from '@/types/categoryType'

type AppShellProps = {
  categories: CategoryType[]
  children: ReactNode
}

function isAuthPath(pathname: string | null) {
  return (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/update-password' ||
    pathname?.startsWith('/auth/')
  )
}

export default function AppShell({ categories, children }: AppShellProps) {
  const pathname = usePathname()

  if (isAuthPath(pathname)) {
    return <>{children}</>
  }

  return (
    <AuthProvider>
      <Nav categories={categories} />
      <div className="flex-1 flex fixed inset-0 -z-10 text-black/10 bg-[url('/background-pattern.svg')] bg-repeat opacity-35 overflow-y-auto" />
      {children}
    </AuthProvider>
  )
}