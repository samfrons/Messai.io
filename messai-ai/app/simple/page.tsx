'use client'

import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { bioreactorCatalog, BioreactorModel } from '@/lib/bioreactor-catalog'

// Dynamic imports to avoid SSR issues
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), { ssr: false })
const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })), { ssr: false })
const SimpleVisualization = dynamic(() => import('@/components/SimpleVisualization'), { ssr: false })

export default function SimpleBioreactorPage() {
  const [selectedBioreactor, setSelectedBioreactor] = useState<BioreactorModel>(bioreactorCatalog[0])
  const [parameters, setParameters] = useState({
    temperature: 30,
    ph: 7.0,
    flowRate: 50,
    mixingSpeed: 100,
    electrodeVoltage: 50,
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-2xl font-bold text-blue-400">
          Bioreactor Visualization Test (Simple Version)
        </h1>
        <p className="text-gray-300 mt-1">
          Basic 3D visualization to test Three.js integration
        </p>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Control Panel */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Bioreactor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bioreactor Model
              </label>
              <select
                value={selectedBioreactor.id}
                onChange={(e) => {
                  const reactor = bioreactorCatalog.find(r => r.id === e.target.value)
                  if (reactor) setSelectedBioreactor(reactor)
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                {bioreactorCatalog.map(reactor => (
                  <option key={reactor.id} value={reactor.id}>
                    {reactor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Operating Parameters */}
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Operating Parameters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Temperature: {parameters.temperature}°C
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="45"
                    step="1"
                    value={parameters.temperature}
                    onChange={(e) => setParameters(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    pH: {parameters.ph.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="9"
                    step="0.1"
                    value={parameters.ph}
                    onChange={(e) => setParameters(prev => ({ ...prev, ph: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Mixing Speed: {parameters.mixingSpeed} RPM
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="10"
                    value={parameters.mixingSpeed}
                    onChange={(e) => setParameters(prev => ({ ...prev, mixingSpeed: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Electrode Voltage: {parameters.electrodeVoltage} mV
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="5"
                    value={parameters.electrodeVoltage}
                    onChange={(e) => setParameters(prev => ({ ...prev, electrodeVoltage: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Model Info */}
            <div className="bg-gray-700 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Model Info</h4>
              <div className="space-y-1 text-xs text-gray-300">
                <p><strong>Type:</strong> {selectedBioreactor.reactorType}</p>
                <p><strong>Volume:</strong> {selectedBioreactor.geometry.volume}L</p>
                <p><strong>Power:</strong> {selectedBioreactor.performance.powerDensity.value} mW/m²</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Visualization */}
        <div className="flex-1 relative">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p>Loading 3D Visualization...</p>
              </div>
            </div>
          }>
            <Canvas camera={{ position: [3, 2, 3], fov: 60 }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />
                
                <SimpleVisualization
                  bioreactorType={selectedBioreactor.reactorType}
                  parameters={parameters}
                />
                
                <OrbitControls enablePan enableZoom enableRotate />
              </Suspense>
            </Canvas>
          </Suspense>

          {/* Overlay Information */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
            <h3 className="font-bold text-lg text-blue-400">{selectedBioreactor.name}</h3>
            <p className="text-sm text-gray-300 mt-1">Simple 3D visualization test</p>
            <div className="mt-2 text-xs text-gray-400">
              <p>Temperature: {parameters.temperature}°C</p>
              <p>pH: {parameters.ph}</p>
              <p>Mixing: {parameters.mixingSpeed} RPM</p>
              <p>Voltage: {parameters.electrodeVoltage} mV</p>
            </div>
          </div>

          {/* Loading Indicator */}
          <div className="absolute bottom-4 left-4 text-sm text-gray-400">
            <p>Use mouse to orbit • Scroll to zoom • Drag to pan</p>
          </div>
        </div>
      </div>
    </div>
  )
}