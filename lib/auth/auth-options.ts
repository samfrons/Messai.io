import { NextAuthOptions } from 'next-auth'

// Stub auth options for master branch
// Real auth implementation is in private/auth-system branch
export const authOptions: NextAuthOptions = {
  providers: [],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session }) {
      return session
    },
  },
}

// Stub function for auth checks
export async function getServerSession() {
  return null
}