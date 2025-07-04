'use client'

import { SessionProvider } from '@/components/SessionProvider'
import { ReactNode } from 'react'

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}