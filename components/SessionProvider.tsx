'use client';

// Research-only version: Use mock authentication
import { SessionProvider as MockSessionProvider } from '@/lib/auth/mock-auth';
import { ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return <MockSessionProvider>{children}</MockSessionProvider>;
}