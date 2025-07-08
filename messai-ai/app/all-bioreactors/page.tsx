'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { bioreactorCatalog } from '@/lib/bioreactor-catalog'

// Dynamic import to avoid SSR issues
const AdvancedBioreactor3D = dynamic(
  () => import('@/components/bioreactor/AdvancedBioreactor3D'),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full">Loading 3D visualization...</div>
  }
)

export default function AllBioreactorsPage() {
  const [selectedBioreactor, setSelectedBioreactor] = useState(bioreactorCatalog[0].id)
  const [parameters, setParameters] = useState({
    temperature: 30,
    ph: 7.0,
    flowRate: 50,
    mixingSpeed: 100,
    electrodeVoltage: 50,
    substrateConcentration: 2.0
  })

  const currentBioreactor = bioreactorCatalog.find(b => b.id === selectedBioreactor)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-blue-400 mb-8">
        MESSAi Bioreactor Catalog - 3D Visualization Test
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Bioreactor Selection */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Select Bioreactor</h2>
          {bioreactorCatalog.map((bioreactor) => (
            <button
              key={bioreactor.id}
              onClick={() => setSelectedBioreactor(bioreactor.id)}
              className={`w-full p-4 rounded-lg text-left transition-all ${
                selectedBioreactor === bioreactor.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="font-semibold">{bioreactor.name}</div>
              <div className="text-sm opacity-75">{bioreactor.category}</div>
              <div className="text-xs mt-1">
                Power: {bioreactor.performance.powerDensity.value} {bioreactor.performance.powerDensity.unit}
              </div>
            </button>
          ))}
        </div>

        {/* 3D Visualization */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">3D Visualization</h2>
          <div className="w-full h-[600px] bg-gray-800 rounded-lg overflow-hidden">
            <AdvancedBioreactor3D
              bioreactorId={selectedBioreactor}
              parameters={parameters}
              showPhysics={true}
              showPerformance={true}
              animationSpeed={1}
              onParameterChange={setParameters}
            />
          </div>
        </div>

        {/* Parameters Control */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Parameters</h2>
          <div className="bg-gray-800 p-4 rounded-lg space-y-4">
            <div>
              <label className="block text-sm mb-1">Temperature (°C)</label>
              <input
                type="range"
                min="15"
                max="45"
                value={parameters.temperature}
                onChange={(e) => setParameters({...parameters, temperature: Number(e.target.value)})}
                className="w-full"
              />
              <span className="text-sm text-gray-400">{parameters.temperature}°C</span>
            </div>
            
            <div>
              <label className="block text-sm mb-1">pH</label>
              <input
                type="range"
                min="5"
                max="9"
                step="0.1"
                value={parameters.ph}
                onChange={(e) => setParameters({...parameters, ph: Number(e.target.value)})}
                className="w-full"
              />
              <span className="text-sm text-gray-400">{parameters.ph}</span>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Flow Rate (L/h)</label>
              <input
                type="range"
                min="0"
                max="200"
                value={parameters.flowRate}
                onChange={(e) => setParameters({...parameters, flowRate: Number(e.target.value)})}
                className="w-full"
              />
              <span className="text-sm text-gray-400">{parameters.flowRate} L/h</span>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Mixing Speed (RPM)</label>
              <input
                type="range"
                min="0"
                max="300"
                value={parameters.mixingSpeed}
                onChange={(e) => setParameters({...parameters, mixingSpeed: Number(e.target.value)})}
                className="w-full"
              />
              <span className="text-sm text-gray-400">{parameters.mixingSpeed} RPM</span>
            </div>
          </div>

          {/* Bioreactor Info */}
          {currentBioreactor && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Current Model</h3>
              <p className="text-sm text-gray-400 mb-2">{currentBioreactor.description}</p>
              <div className="text-xs space-y-1">
                <div>Scale: {currentBioreactor.geometry.scale}</div>
                <div>Volume: {currentBioreactor.geometry.volume}L</div>
                <div>Efficiency: {currentBioreactor.performance.efficiency.overall}%</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}