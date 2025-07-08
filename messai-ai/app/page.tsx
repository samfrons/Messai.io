'use client'

import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { bioreactorCatalog, BioreactorModel } from '@/lib/bioreactor-catalog'

// Dynamic imports to avoid SSR issues
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), { ssr: false })
const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })), { ssr: false })
const Environment = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.Environment })), { ssr: false })
const AdvancedBioreactor3D = dynamic(() => import('@/components/bioreactor/AdvancedBioreactor3D'), { ssr: false })

export default function BioreactorTestPage() {
  const [selectedBioreactor, setSelectedBioreactor] = useState<BioreactorModel>(bioreactorCatalog[0])
  const [parameters, setParameters] = useState({
    temperature: 30,
    ph: 7.0,
    flowRate: 50,
    mixingSpeed: 100,
    electrodeVoltage: 50,
    substrateConcentration: 2.0,
    showPhysics: true,
    showPerformance: true,
    showVectors: false,
    showConcentration: false,
    showBiofilm: true
  })
  const [animationSpeed, setAnimationSpeed] = useState(1.0)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">
              Advanced Bioreactor Visualization System
            </h1>
            <p className="text-gray-300 mt-1">
              Interactive 3D modeling and performance prediction for electrochemical bioreactors
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/electroanalytical"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Electroanalytical Lab
            </a>
            <a
              href="/simple"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Simple View
            </a>
          </div>
        </div>
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
              <div className="mt-2 text-xs text-gray-400">
                <p><strong>Type:</strong> {selectedBioreactor.reactorType}</p>
                <p><strong>Scale:</strong> {selectedBioreactor.geometry.scale}</p>
                <p><strong>Volume:</strong> {selectedBioreactor.geometry.volume}L</p>
              </div>
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
                    min={selectedBioreactor.operating.temperature.range[0]}
                    max={selectedBioreactor.operating.temperature.range[1]}
                    step="0.5"
                    value={parameters.temperature}
                    onChange={(e) => setParameters(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{selectedBioreactor.operating.temperature.range[0]}°C</span>
                    <span className="text-green-400">Optimal: {selectedBioreactor.operating.temperature.optimal}°C</span>
                    <span>{selectedBioreactor.operating.temperature.range[1]}°C</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    pH: {parameters.ph.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min={selectedBioreactor.operating.ph.range[0]}
                    max={selectedBioreactor.operating.ph.range[1]}
                    step="0.1"
                    value={parameters.ph}
                    onChange={(e) => setParameters(prev => ({ ...prev, ph: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{selectedBioreactor.operating.ph.range[0]}</span>
                    <span className="text-green-400">Optimal: {selectedBioreactor.operating.ph.optimal}</span>
                    <span>{selectedBioreactor.operating.ph.range[1]}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Flow Rate: {parameters.flowRate} L/h
                  </label>
                  <input
                    type="range"
                    min={selectedBioreactor.operating.flowRate?.range[0] || 10}
                    max={selectedBioreactor.operating.flowRate?.range[1] || 200}
                    step="5"
                    value={parameters.flowRate}
                    onChange={(e) => setParameters(prev => ({ ...prev, flowRate: parseFloat(e.target.value) }))}
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Substrate Concentration: {parameters.substrateConcentration.toFixed(1)} g/L
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={parameters.substrateConcentration}
                    onChange={(e) => setParameters(prev => ({ ...prev, substrateConcentration: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Visualization Controls */}
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Visualization</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Animation Speed: {animationSpeed.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {Object.entries({
                  showPhysics: 'Show Physics Simulation',
                  showPerformance: 'Show Performance Metrics',
                  showVectors: 'Show Flow Vectors',
                  showConcentration: 'Show Concentration Field',
                  showBiofilm: 'Show Biofilm Growth'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={parameters[key as keyof typeof parameters] as boolean}
                      onChange={(e) => setParameters(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Performance Info */}
            <div className="bg-gray-700 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Expected Performance</h4>
              <div className="space-y-1 text-xs text-gray-300">
                <p>Power Density: {selectedBioreactor.performance.powerDensity.value} {selectedBioreactor.performance.powerDensity.unit}</p>
                <p>Current Density: {selectedBioreactor.performance.currentDensity.value} {selectedBioreactor.performance.currentDensity.unit}</p>
                <p>COD Removal: {selectedBioreactor.performance.efficiency.codRemoval}%</p>
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
                <Environment preset="warehouse" />
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />
                
                <AdvancedBioreactor3D
                  bioreactorId={selectedBioreactor.id}
                  parameters={parameters}
                  showPhysics={parameters.showPhysics}
                  showPerformance={parameters.showPerformance}
                  animationSpeed={animationSpeed}
                  onParameterChange={(key: string, value: any) => 
                    setParameters(prev => ({ ...prev, [key]: value }))
                  }
                />
                
                <OrbitControls enablePan enableZoom enableRotate />
              </Suspense>
            </Canvas>
          </Suspense>

          {/* Overlay Information */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
            <h3 className="font-bold text-lg text-blue-400">{selectedBioreactor.name}</h3>
            <p className="text-sm text-gray-300 mt-1">{selectedBioreactor.description}</p>
            <div className="mt-2 text-xs text-gray-400">
              <p>WebGPU: {typeof navigator !== 'undefined' && 'gpu' in navigator ? 'Supported' : 'Fallback Mode'}</p>
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