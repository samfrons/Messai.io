'use client'

import { useState } from 'react'

interface ExperimentParameters {
  name: string
  temperature: number
  ph: number
  substrateConcentration: number
  notes?: string
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Setup New Experiment</h2>
        <p className="text-gray-600 mt-1">Configure parameters for your {designName}</p>
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">AI Prediction Preview</h4>
          <p className="text-sm text-blue-700">
            Based on your parameters, the AI predicts a power output of{' '}
            <span className="font-semibold">
              {Math.round(50 + (parameters.temperature * 5) + (parameters.ph * 20))} mW
            </span>
            {' '}(±15% confidence interval)
          </p>
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
  )
}