'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ModelsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to unified systems page with research filter
    router.push('/systems?purpose=research')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting...</h2>
        <p className="text-gray-600">The models library has moved to our unified systems catalog.</p>
      </div>
    </div>
  )
}