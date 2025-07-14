'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@messai/ui'
import { Play, Pause, RotateCcw, Eye, EyeOff } from 'lucide-react'

// Dynamic imports to avoid SSR issues
const Scene = dynamic(() => import('./core/Scene'), { ssr: false })
const BioreactorModel = dynamic(() => import('./bioreactor/BioreactorModel'), { ssr: false })
const BiofilmSimulation = dynamic(() => import('./biofilm/BiofilmSimulation'), { ssr: false })
const AlgaeBioreactorFuelCell = dynamic(() => import('./microfluidic/AlgaeBioreactorFuelCell'), { ssr: false })

const modelPresets = [
  {
    id: 'microfluidic-algae',
    name: 'Microfluidic Algae Cell',
    type: 'microfluidic',
    description: 'High-precision algae bioreactor with Caladan Bio aesthetic',
  },
  {
    id: 'single-mfc',
    name: 'Single Chamber MFC',
    type: 'bioreactor',
    systemType: 'MFC' as const,
    scale: 'laboratory' as const,
    anode: 'carbonCloth',
    cathode: 'stainlessSteel',
  },
  {
    id: 'dual-mec',
    name: 'Dual Chamber MEC',
    type: 'bioreactor',
    systemType: 'MEC' as const,
    scale: 'pilot' as const,
    anode: 'carbonFelt',
    cathode: 'platinum',
  },
  {
    id: 'triple-mdc',
    name: 'Triple Chamber MDC',
    type: 'bioreactor',
    systemType: 'MDC' as const,
    scale: 'laboratory' as const,
    anode: 'grapheneOxide',
    cathode: 'carbonCloth',
  },
]

export default function ModelingLab() {
  const [selectedModel, setSelectedModel] = useState(modelPresets[0])
  const [isPlaying, setIsPlaying] = useState(true)
  const [showBiofilm, setShowBiofilm] = useState(false)
  const [viewMode, setViewMode] = useState<'model' | 'biofilm'>('model')

  return (
    <div className="flex h-full">
      {/* Control Panel */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Model Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Model Presets</h3>
            <div className="space-y-2">
              {modelPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedModel(preset)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedModel.id === preset.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{preset.name}</div>
                  <div className="text-sm text-gray-600">
                    {preset.type === 'microfluidic' 
                      ? preset.description 
                      : `${preset.systemType} • ${preset.scale}`
                    }
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* View Controls */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">View Mode</h3>
            <div className="space-y-2">
              <Button
                variant={viewMode === 'model' ? 'default' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => setViewMode('model')}
              >
                System Model
              </Button>
              <Button
                variant={viewMode === 'biofilm' ? 'default' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => setViewMode('biofilm')}
              >
                Biofilm Growth
              </Button>
            </div>
          </div>

          {/* Animation Controls */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Controls</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowBiofilm(!showBiofilm)}
              >
                {showBiofilm ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showBiofilm ? 'Hide' : 'Show'} Biofilm
              </Button>
            </div>
          </div>

          {/* Model Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Current Model</h4>
            <div className="space-y-1 text-sm">
              {selectedModel.type === 'microfluidic' ? (
                <>
                  <div>
                    <span className="text-blue-700">Type:</span>{' '}
                    <span className="font-medium">Microfluidic</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Culture:</span>{' '}
                    <span className="font-medium">Algae Bioreactor</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Flow:</span>{' '}
                    <span className="font-medium">Co-laminar</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Material:</span>{' '}
                    <span className="font-medium">PDMS/Glass</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-blue-700">Type:</span>{' '}
                    <span className="font-medium">{selectedModel.systemType}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Scale:</span>{' '}
                    <span className="font-medium capitalize">{selectedModel.scale}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Anode:</span>{' '}
                    <span className="font-medium">{selectedModel.anode}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Cathode:</span>{' '}
                    <span className="font-medium">{selectedModel.cathode}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading 3D visualization...</p>
              </div>
            </div>
          }
        >
          <Scene controls environment shadows debug>
            {viewMode === 'model' && selectedModel.type === 'microfluidic' && (
              <AlgaeBioreactorFuelCell
                scale={1.5}
                showFlow={isPlaying}
                showAlgae={showBiofilm}
                animate={isPlaying}
              />
            )}
            
            {viewMode === 'model' && selectedModel.type === 'bioreactor' && (
              <BioreactorModel
                systemType={selectedModel.systemType}
                scale={selectedModel.scale}
                anodeMaterial={selectedModel.anode}
                cathodeMaterial={selectedModel.cathode}
              />
            )}
            
            {viewMode === 'biofilm' && (
              <BiofilmSimulation
                surfaceWidth={2}
                surfaceHeight={1}
                thickness={0.1}
                growthRate={isPlaying ? 0.2 : 0}
                showGrowthStages
              />
            )}
          </Scene>
        </Suspense>
        
        {/* Overlay UI */}
        <div className="absolute top-4 right-4">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <div className="text-sm text-gray-600">
              View: <span className="font-medium capitalize">{viewMode}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}