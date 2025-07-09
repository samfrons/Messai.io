'use client'

import React, { createContext, useContext } from 'react'

// Mock session type matching NextAuth's structure
interface MockSession {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  expires?: string
}

interface MockSessionContextValue {
  data: MockSession | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  update: (data?: any) => Promise<MockSession | null>
}

// Create context with default values
const MockSessionContext = createContext<MockSessionContextValue>({
  data: null,
  status: 'unauthenticated',
  update: async () => null
})

// Mock SessionProvider that always returns unauthenticated
export function MockSessionProvider({
  children,
  session
}: {
  children: React.ReactNode
  session?: MockSession | null
}) {
  const value: MockSessionContextValue = {
    data: null,
    status: 'unauthenticated',
    update: async () => null
  }

  return (
    <MockSessionContext.Provider value={value}>
      {children}
    </MockSessionContext.Provider>
  )
}

// Mock useSession hook that always returns unauthenticated
export function useMockSession() {
  const context = useContext(MockSessionContext)
  if (!context) {
    throw new Error('useMockSession must be used within MockSessionProvider')
  }
  return context
}

// Export with NextAuth-compatible names
export const SessionProvider = MockSessionProvider
export const useSession = useMockSession