import { getServerSession as getNextAuthSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

// Real auth implementation
export const getServerSession = async () => {
  return await getNextAuthSession(authOptions)
}

// Export authOptions for backward compatibility
export { authOptions }