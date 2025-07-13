'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { DesignType } from '@messai/ui'
import MFCConfigPanel from './MFCConfigPanel'

// Dynamic import to avoid SSR issues with Three.js - using new MESSModel3D
const MESSModel3D = dynamic(
  () => import('@messai/ui').then(mod => mod.MESSModel3D),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-400">Loading 3D Model...</p>
        </div>
      </div>
    )
  }
)

interface ExperimentParameters {
  name: string
  temperature: number
  ph: number
  substrateConcentration: number
  notes?: string
}

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

interface ParameterFormProps {
  designId: string
  designName: string
  designType: string
  onSubmit: (params: ExperimentParameters) => void
  onCancel: () => void
  initialConfig?: MFCConfig
  predictions?: {
    power: number
    efficiency: number
    cost: number
    confidence: number
  }
}

export default function ParameterForm({ designId, designName, designType, onSubmit, onCancel, initialConfig, predictions }: ParameterFormProps) {
  const [parameters, setParameters] = useState<ExperimentParameters>({
    name: `${designName} Experiment ${new Date().toLocaleDateString()}`,
    temperature: 28,
    ph: 7.0,
    substrateConcentration: 1.0,
    notes: ''
  })

  const [mfcConfig, setMfcConfig] = useState<MFCConfig>(initialConfig || {
    electrode: {
      material: 'carbon-cloth',
      surface: 100,
      thickness: 2.0
    },
    microbial: {
      density: 5.0,
      species: 'geobacter',
      activity: 75
    },
    chamber: {
      volume: 1.0,
      shape: 'rectangular',
      material: 'acrylic'
    }
  })

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onSubmit(parameters)
    setLoading(false)
  }

  const handleInputChange = (field: keyof ExperimentParameters, value: string | number) => {
    setParameters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleConfigChange = (component: keyof MFCConfig, field: string, value: any) => {
    setMfcConfig(prev => ({
      ...prev,
      [component]: {
        ...prev[component],
        [field]: value
      }
    }))
  }

  const handleComponentSelect = (component: string) => {
    setSelectedComponent(component === selectedComponent ? null : component)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Setup New Experiment</h2>
            <p className="text-sm text-gray-600">Configure parameters and design for your {designName}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Experiment...' : 'Start Experiment'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Horizontal Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Panel: 3D Model */}
        <div className="w-full lg:w-2/5 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col min-h-0">
          <div className="p-3 lg:p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">3D MFC Model</h3>
            <p className="text-xs lg:text-sm text-gray-600">Click components to configure</p>
          </div>
          <div className="flex-1 p-2 lg:p-4 min-h-[200px] lg:min-h-0">
            <MESSModel3D 
              design={designType as DesignType}
              interactive={true}
              showGrid={true}
              autoRotate={true}
              rotationSpeed={0.01}
              onClick={(component) => handleComponentSelect(component || 'overall')}
            />
          </div>
          
          {/* AI Prediction Preview - Compact */}
          <div className="p-3 lg:p-4 border-t border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 flex-shrink-0">
            <h4 className="text-xs lg:text-sm font-semibold text-gray-900 mb-2">AI Prediction Preview</h4>
            <div className="grid grid-cols-3 gap-2 lg:gap-4 text-xs">
              <div>
                <div className="text-gray-600">Power</div>
                <div className="font-semibold text-green-800">
                  {Math.round(parameters.temperature * parameters.ph * parameters.substrateConcentration * 45)} mW
                </div>
              </div>
              <div>
                <div className="text-gray-600">Efficiency</div>
                <div className="font-semibold text-blue-800">
                  {Math.round(65 + (parameters.temperature - 20) + (parameters.ph - 6) * 5)}%
                </div>
              </div>
              <div>
                <div className="text-gray-600">Duration</div>
                <div className="font-semibold text-purple-800">
                  {Math.round(5 + parameters.substrateConcentration * 3)} days
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Configuration */}
        <div className="w-full lg:w-2/5 bg-white flex flex-col min-h-0">
          <div className="p-3 lg:p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Component Configuration</h3>
            <p className="text-xs lg:text-sm text-gray-600">
              {selectedComponent ? `Editing: ${selectedComponent}` : 'Select a component to configure'}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto min-h-[300px] lg:min-h-0">
            <MFCConfigPanel 
              config={mfcConfig}
              selectedComponent={selectedComponent}
              onConfigChange={handleConfigChange}
            />
          </div>
        </div>

        {/* Right Panel: Experiment Parameters */}
        <div className="w-full lg:w-1/5 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col min-h-0">
          <div className="p-3 lg:p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Parameters</h3>
            <p className="text-xs lg:text-sm text-gray-600">Environmental conditions</p>
          </div>
          
          <div className="flex-1 p-3 lg:p-4 space-y-3 lg:space-y-4 overflow-y-auto">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={parameters.name}
                onChange={(e) => setParameters(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
                Temperature (°C)
              </label>
              <input
                type="number"
                id="temperature"
                min="20"
                max="40"
                step="0.5"
                value={parameters.temperature}
                onChange={(e) => setParameters(prev => ({ ...prev, temperature: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">20-40°C</p>
            </div>

            <div>
              <label htmlFor="ph" className="block text-sm font-medium text-gray-700 mb-2">
                pH Level
              </label>
              <input
                type="number"
                id="ph"
                min="6"
                max="8"
                step="0.1"
                value={parameters.ph}
                onChange={(e) => setParameters(prev => ({ ...prev, ph: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">6-8</p>
            </div>

            <div>
              <label htmlFor="substrate" className="block text-sm font-medium text-gray-700 mb-2">
                Substrate (g/L)
              </label>
              <input
                type="number"
                id="substrate"
                min="0.5"
                max="2"
                step="0.1"
                value={parameters.substrateConcentration}
                onChange={(e) => setParameters(prev => ({ ...prev, substrateConcentration: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">0.5-2 g/L</p>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={parameters.notes}
                onChange={(e) => setParameters(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}