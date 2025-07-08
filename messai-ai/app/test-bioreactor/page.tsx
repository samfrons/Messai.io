'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues
const AdvancedBioreactor3D = dynamic(
  () => import('@/components/bioreactor/AdvancedBioreactor3D'),
  { ssr: false }
)

export default function TestBioreactorPage() {
  const [parameters] = useState({
    temperature: 30,
    ph: 7.0,
    flowRate: 50,
    mixingSpeed: 100,
    electrodeVoltage: 50,
    substrateConcentration: 2.0
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold text-blue-400 mb-4">
        Bioreactor 3D Test
      </h1>
      
      <div className="w-full h-[600px] bg-gray-800 rounded-lg overflow-hidden">
        <AdvancedBioreactor3D
          bioreactorId="embr-001"
          parameters={parameters}
          showPhysics={true}
          showPerformance={true}
          animationSpeed={1}
        />
      </div>
      
      <div className="mt-4 text-sm text-gray-400">
        <p>If you see this message but no 3D visualization above, check the browser console for errors.</p>
        <p>The "P is not part of the THREE namespace" error should be resolved.</p>
      </div>
    </div>
  )
}