'use client'

import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import Navigation from './Navigation'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Define routes that should not have navigation
  const noNavRoutes = ['/', '/login', '/signup', '/auth/error']
  const shouldShowNav = !noNavRoutes.includes(pathname)

  return (
    <SessionProvider>
      {shouldShowNav && <Navigation />}
      <main className={shouldShowNav ? 'pt-16' : ''}>
        {children}
      </main>
    </SessionProvider>
  )
}