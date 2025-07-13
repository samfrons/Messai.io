'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const Safe3DViewer = dynamic(
  () => import('./3d/safe-3d-viewer').then(mod => mod.Safe3DViewer),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    )
  }
)

interface MFCConfig {
  electrode: {
    material: string
    surface: number
    thickness: number
  }
  microbial: {
    density: number
    species: string
    activity: number
  }
  chamber: {
    volume: number
    shape: string
    material: string
  }
}

interface SafeMFC3DModelProps {
  config: MFCConfig
  onComponentSelect: (component: string) => void
  selectedComponent: string | null
  designType?: string
}

export default function SafeMFC3DModel({ config, onComponentSelect, selectedComponent, designType }: SafeMFC3DModelProps) {
  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      }>
        <Safe3DViewer className="w-full h-full" />
      </Suspense>
    </div>
  )
}