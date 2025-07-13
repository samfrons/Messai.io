import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

// Stub NextAuth handler for master branch
// Real implementation is in private/auth-system branch
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }