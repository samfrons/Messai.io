'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'

// Dynamic import to avoid SSR issues
const ModelingLab = dynamic(() => import('@/components/3d/ModelingLab'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Initializing 3D Lab</h3>
        <p className="text-gray-600">Loading interactive modeling environment...</p>
      </div>
    </div>
  )
})

export default function ModelingLabPage() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/features/3d-modeling"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Overview
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">3D Modeling Lab</h1>
              <p className="text-sm text-gray-600">Interactive bioelectrochemical system design</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              Click and drag to rotate • Scroll to zoom
            </div>
          </div>
        </div>
      </header>

      {/* Main Lab Interface */}
      <main className="flex-1 overflow-hidden">
        <ModelingLab />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6 text-gray-600">
            <span>✅ 3D Rendering Active</span>
            <span>🔄 Real-time Updates</span>
            <span>🎮 Interactive Controls</span>
          </div>
          <div className="text-gray-500">
            MESSAi 3D Modeling Lab v1.0
          </div>
        </div>
      </footer>
    </div>
  )
}