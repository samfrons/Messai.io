'use client'

import { SessionProvider } from '@/components/SessionProvider'
import { useSession } from '@/lib/auth/mock-auth'
import { ReactNode, useEffect } from 'react'
import { getDemoConfig } from '@/lib/demo-mode'

function NavigationManager() {
  const { data: session, status } = useSession()
  const demoConfig = getDemoConfig()

  useEffect(() => {
    // Hide/show authenticated navigation based on session and demo mode
    const authOnlyElements = document.querySelectorAll('.auth-only-nav')
    
    if (demoConfig.isDemo) {
      // In demo mode, always hide authenticated navigation
      authOnlyElements.forEach(el => {
        (el as HTMLElement).style.display = 'none'
      })
    } else if (session) {
      // In production mode, show if user is logged in
      authOnlyElements.forEach(el => {
        (el as HTMLElement).style.display = 'block'
      })
    } else {
      // In production mode, hide if no session
      authOnlyElements.forEach(el => {
        (el as HTMLElement).style.display = 'none'
      })
    }
  }, [session, status, demoConfig.isDemo])

  return null
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <NavigationManager />
      {children}
    </SessionProvider>
  )
}