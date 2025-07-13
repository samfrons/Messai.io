import { getServerSession as getNextAuthSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

// Stub auth for master branch
// Real implementation is in private/auth-system branch
export const getServerSession = async () => {
  return null
}

// Export authOptions for backward compatibility
export { authOptions }