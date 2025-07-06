'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { DesignType } from '@messai/ui'

// Dynamic imports with loading states
const MESSModel3D = dynamic(
  () => import('@messai/ui').then(mod => mod.MESSModel3D),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-gray-600">Loading 3D model...</div>
      </div>
    )
  }
)

const MESSModel3DLite = dynamic(
  () => import('@messai/ui').then(mod => mod.MESSModel3DLite),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 rounded-full animate-spin border-t-transparent" />
      </div>
    )
  }
)

const designs: { id: DesignType; name: string }[] = [
  { id: 'earthen-pot', name: 'Earthen Pot MFC' },
  { id: 'cardboard', name: 'Cardboard MFC' },
  { id: 'mason-jar', name: 'Mason Jar MFC' },
  { id: '3d-printed', name: '3D Printed MFC' },
  { id: 'wetland', name: 'Wetland MFC' },
  { id: 'micro-chip', name: 'Micro MFC Chip' },
  { id: 'isolinear-chip', name: 'Isolinear Bio-Chip' },
  { id: 'benchtop-bioreactor', name: 'Benchtop Bioreactor' },
  { id: 'wastewater-treatment', name: 'Wastewater Treatment' },
  { id: 'brewery-processing', name: 'Brewery Processing' },
  { id: 'architectural-facade', name: 'Architectural Facade' },
  { id: 'benthic-fuel-cell', name: 'Benthic Fuel Cell' },
  { id: 'kitchen-sink', name: 'Kitchen Sink System' },
]

export default function Test3DModelsPage() {
  const [selectedDesign, setSelectedDesign] = useState<DesignType>('earthen-pot')
  const [showGrid, setShowGrid] = useState(true)
  const [autoRotate, setAutoRotate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [use3DInGrid, setUse3DInGrid] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        MESSModel3D Test Gallery
      </h1>
      
      {/* WebGL Context Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> To avoid WebGL context limits, the grid view uses CSS 3D transforms by default. 
          Toggle "Use WebGL in Grid" to see full 3D models (may cause context loss with many models).
        </p>
      </div>
      
      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded text-primary-500"
            />
            <span>Show Grid</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
              className="rounded text-primary-500"
            />
            <span>Auto Rotate</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={interactive}
              onChange={(e) => setInteractive(e.target.checked)}
              className="rounded text-primary-500"
            />
            <span>Interactive Controls</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={use3DInGrid}
              onChange={(e) => setUse3DInGrid(e.target.checked)}
              className="rounded text-primary-500"
            />
            <span>Use WebGL in Grid</span>
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Design:
          </label>
          <select
            value={selectedDesign}
            onChange={(e) => setSelectedDesign(e.target.value as DesignType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {designs.map((design) => (
              <option key={design.id} value={design.id}>
                {design.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 3D View */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-12">
        <div className="h-[600px]">
          <MESSModel3D
            key={selectedDesign} // Force re-mount on design change
            design={selectedDesign}
            showGrid={showGrid}
            autoRotate={autoRotate}
            interactive={interactive}
            onLoad={() => console.log('Model loaded:', selectedDesign)}
            onError={(error) => console.error('Model error:', error)}
            onClick={(component) => console.log('Clicked:', component)}
          />
        </div>
      </div>

      {/* Grid View */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          All Models {use3DInGrid ? '(WebGL)' : '(CSS 3D)'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {designs.map((design) => (
            <div
              key={design.id}
              className={`bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
                selectedDesign === design.id ? 'ring-2 ring-primary-500' : ''
              }`}
              onClick={() => setSelectedDesign(design.id)}
            >
              <div className="h-48 bg-gray-50">
                {use3DInGrid ? (
                  <MESSModel3D
                    design={design.id}
                    showGrid={false}
                    autoRotate={true}
                    interactive={false}
                    performanceMode={true}
                  />
                ) : (
                  <MESSModel3DLite
                    design={design.id}
                    autoRotate={true}
                    rotationSpeed={0.005}
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{design.name}</h3>
                <p className="text-sm text-gray-600">ID: {design.id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}