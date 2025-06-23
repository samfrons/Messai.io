'use client'

import { useState } from 'react'
import MFC3DModel from './MFC3DModel'
import MFCConfigPanel from './MFCConfigPanel'

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
  onSubmit: (params: ExperimentParameters) => void
  onCancel: () => void
}

export default function ParameterForm({ designId, designName, onSubmit, onCancel }: ParameterFormProps) {
  const [parameters, setParameters] = useState<ExperimentParameters>({
    name: `${designName} Experiment ${new Date().toLocaleDateString()}`,
    temperature: 28,
    ph: 7.0,
    substrateConcentration: 1.0,
    notes: ''
  })

  const [mfcConfig, setMfcConfig] = useState<MFCConfig>({
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Setup New Experiment</h2>
          <p className="text-gray-600 mt-1">Configure parameters and design for your {designName}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D Model */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">MFC 3D Model</h3>
          <MFC3DModel 
            config={mfcConfig}
            onComponentSelect={handleComponentSelect}
            selectedComponent={selectedComponent}
          />
          <p className="text-sm text-gray-600 mt-2">
            Click on components in the 3D model to configure them
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <MFCConfigPanel 
            config={mfcConfig}
            selectedComponent={selectedComponent}
            onConfigChange={handleConfigChange}
          />
        </div>
      </div>

      {/* Experiment Parameters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">

      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Experiment Parameters</h3>
        <p className="text-gray-600 mt-1">Set environmental conditions for your experiment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Experiment Name
          </label>
          <input
            type="text"
            id="name"
            value={parameters.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
              Temperature (°C)
            </label>
            <input
              type="number"
              id="temperature"
              min="20"
              max="40"
              step="0.1"
              value={parameters.temperature}
              onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Range: 20-40°C</p>
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
              onChange={(e) => handleInputChange('ph', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Range: 6-8</p>
          </div>

          <div>
            <label htmlFor="substrate" className="block text-sm font-medium text-gray-700 mb-2">
              Substrate Concentration (g/L)
            </label>
            <input
              type="number"
              id="substrate"
              min="0.5"
              max="2"
              step="0.1"
              value={parameters.substrateConcentration}
              onChange={(e) => handleInputChange('substrateConcentration', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Range: 0.5-2 g/L</p>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={parameters.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes about your experiment setup..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">AI Prediction Preview</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Power Output</div>
              <div className="font-semibold text-blue-800">
                {Math.round(50 + (parameters.temperature * 5) + (parameters.ph * 20) + (mfcConfig.electrode.surface * 0.5))} mW
              </div>
            </div>
            <div>
              <div className="text-gray-600">Efficiency</div>
              <div className="font-semibold text-green-800">
                {Math.round((mfcConfig.microbial.activity + mfcConfig.electrode.surface) / 3)}%
              </div>
            </div>
            <div>
              <div className="text-gray-600">Est. Runtime</div>
              <div className="font-semibold text-purple-800">
                {Math.round(mfcConfig.chamber.volume * 24)} hours
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating Experiment...' : 'Start Experiment'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}