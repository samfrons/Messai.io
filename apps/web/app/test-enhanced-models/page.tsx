'use client'

import { useState } from 'react'
import { VanillaDesignModels } from '@/components/3d/vanilla-design-models'

const enhancedDesigns = [
  { id: 'micro-chip', name: 'Lab-on-Chip MFC', description: 'Y-junction microfluidics with serpentine electrodes' },
  { id: 'benchtop-bioreactor', name: 'Benchtop Bioreactor MFC', description: '5L vessel with stirrer and fuel cell stack' },
  { id: 'wastewater-treatment', name: 'Wastewater Treatment System', description: 'Modular MFC array with aeration' },
  { id: 'architectural-facade', name: 'Algal Facade Panel', description: 'Building-integrated photobioreactor' },
  { id: 'benthic-fuel-cell', name: 'Benthic Fuel Cell', description: 'Marine deployment with buoy' },
]

export default function TestEnhancedModelsPage() {
  const [selectedDesign, setSelectedDesign] = useState('micro-chip')
  const [showLabels, setShowLabels] = useState(true)
  const [autoRotate, setAutoRotate] = useState(false)
  const [enableAnimations, setEnableAnimations] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState(1)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced MESS Models Test</h1>
        <p className="text-gray-600 mb-8">Testing the detailed 3D models with animations</p>
        
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Model:
              </label>
              <select
                value={selectedDesign}
                onChange={(e) => setSelectedDesign(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {enhancedDesigns.map((design) => (
                  <option key={design.id} value={design.id}>
                    {design.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Animation Speed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation Speed: {animationSpeed.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            {/* Toggles */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded text-blue-500"
                />
                <span className="text-sm">Show Labels</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                  className="rounded text-blue-500"
                />
                <span className="text-sm">Auto Rotate</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={enableAnimations}
                  onChange={(e) => setEnableAnimations(e.target.checked)}
                  className="rounded text-blue-500"
                />
                <span className="text-sm">Enable Animations</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Model Description */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-900 mb-1">
            {enhancedDesigns.find(d => d.id === selectedDesign)?.name}
          </h3>
          <p className="text-blue-700 text-sm">
            {enhancedDesigns.find(d => d.id === selectedDesign)?.description}
          </p>
        </div>
        
        {/* 3D Model Display */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-[600px]">
            <VanillaDesignModels
              key={`${selectedDesign}-${enableAnimations}`} // Force re-mount when animations toggle
              designType={selectedDesign}
              scale={1}
              showLabels={showLabels}
              autoRotate={autoRotate}
              enableAnimations={enableAnimations}
              animationSpeed={animationSpeed}
            />
          </div>
        </div>
        
        {/* Animation Features */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Animation Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="border rounded-lg p-3">
              <h3 className="font-semibold text-gray-900">Micro-chip</h3>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Electrode glow pulsing</li>
                <li>• Flow visualization in channels</li>
                <li>• Chamber liquid movement</li>
              </ul>
            </div>
            <div className="border rounded-lg p-3">
              <h3 className="font-semibold text-gray-900">Benchtop Bioreactor</h3>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Stirrer rotation</li>
                <li>• Gas bubble generation</li>
                <li>• Liquid swirling effect</li>
              </ul>
            </div>
            <div className="border rounded-lg p-3">
              <h3 className="font-semibold text-gray-900">Wastewater Treatment</h3>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Flow field particles</li>
                <li>• Aeration bubbles</li>
                <li>• Clarifier rotation</li>
              </ul>
            </div>
            <div className="border rounded-lg p-3">
              <h3 className="font-semibold text-gray-900">Algal Facade</h3>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Diurnal light cycle</li>
                <li>• Photosynthesis color changes</li>
                <li>• CO₂ bubble injection</li>
              </ul>
            </div>
            <div className="border rounded-lg p-3">
              <h3 className="font-semibold text-gray-900">Benthic Fuel Cell</h3>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Tidal flow simulation</li>
                <li>• Buoy bobbing motion</li>
                <li>• Plankton drift</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}