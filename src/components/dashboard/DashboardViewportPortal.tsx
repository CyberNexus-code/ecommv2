'use client'

import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

type DashboardViewportPortalProps = {
  children: ReactNode
}

export default function DashboardViewportPortal({ children }: DashboardViewportPortalProps) {
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(children, document.body)
}