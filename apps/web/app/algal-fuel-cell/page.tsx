'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic import to avoid SSR issues with Three.js
const AlgalFuelCell3D = dynamic(
  () => import('@/components/algal-fuel-cell/AlgalFuelCell3D'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="text-lcars-cyan text-2xl mb-4">Loading Algal Fuel Cell Designer...</div>
          <div className="w-16 h-16 border-4 border-lcars-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }
)

export default function AlgalFuelCellPage() {
  return (
    <div className="fixed inset-0 bg-black">
      <Suspense fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <div className="text-lcars-cyan text-2xl">Initializing...</div>
        </div>
      }>
        <AlgalFuelCell3D />
      </Suspense>
    </div>
  )
}