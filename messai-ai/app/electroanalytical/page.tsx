'use client'

import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { electroanalyticalCatalog, ElectroanalyticalTechnique } from '@/lib/electroanalytical/electroanalytical-catalog'

// Dynamic imports to avoid SSR issues
const ElectroanalyticalTool = dynamic(() => import('@/components/electroanalytical/ElectroanalyticalTool'), { ssr: false })

export default function ElectroanalyticalPage() {
  const [selectedTechnique, setSelectedTechnique] = useState<ElectroanalyticalTechnique>(electroanalyticalCatalog[0])
  const [parameters, setParameters] = useState({
    // Common parameters
    temperature: 25, // °C
    electrolyte: 'PBS',
    electrodeArea: 1.0, // cm²
    
    // Voltammetry parameters
    startPotential: -0.6, // V
    endPotential: 0.4, // V
    scanRate: 0.1, // V/s
    
    // Impedance parameters
    frequency: 100000, // Hz
    amplitude: 0.01, // V
    
    // Chronoamperometry parameters
    appliedPotential: 0.2, // V
    duration: 300, // s
    
    // System parameters
    showRealTime: true,
    dataPoints: 1000
  })

  const [isRunning, setIsRunning] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1.0)

  const updateParameter = (key: string, value: any) => {
    setParameters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a
                href="/"
                className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
              >
                ← Bioreactor Lab
              </a>
              <div className="mx-4 text-gray-600">|</div>
              <h1 className="text-xl font-bold text-white">Electroanalytical Laboratory</h1>
              <span className="ml-3 text-sm text-gray-400">
                Interactive bioelectrochemical characterization
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Animation Speed:</span>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  className="w-20 accent-blue-500"
                />
                <span className="text-sm text-gray-300 w-8">{animationSpeed.toFixed(1)}×</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Technique Selection & Parameters */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            {/* Technique Selection */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-white">Technique Selection</h2>
              <div className="space-y-2">
                {electroanalyticalCatalog.map((technique) => (
                  <button
                    key={technique.id}
                    onClick={() => setSelectedTechnique(technique)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTechnique.id === technique.id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium">{technique.name}</div>
                    <div className="text-sm opacity-75">{technique.abbreviation}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-white">Parameters</h2>
              
              {/* Common Parameters */}
              <div className="space-y-4 mb-6">
                <h3 className="text-md font-medium text-gray-300">General</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    value={parameters.temperature}
                    onChange={(e) => updateParameter('temperature', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Electrode Area (cm²)
                  </label>
                  <input
                    type="number"
                    value={parameters.electrodeArea}
                    onChange={(e) => updateParameter('electrodeArea', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    min="0.1"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Electrolyte
                  </label>
                  <select
                    value={parameters.electrolyte}
                    onChange={(e) => updateParameter('electrolyte', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="PBS">Phosphate Buffer (PBS)</option>
                    <option value="KCl">Potassium Chloride</option>
                    <option value="NaCl">Sodium Chloride</option>
                    <option value="acetate">Acetate Buffer</option>
                  </select>
                </div>
              </div>

              {/* Technique-specific Parameters */}
              {selectedTechnique.id === 'cv' && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-300">Cyclic Voltammetry</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Start Potential (V)
                    </label>
                    <input
                      type="number"
                      value={parameters.startPotential}
                      onChange={(e) => updateParameter('startPotential', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      min="-2"
                      max="2"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      End Potential (V)
                    </label>
                    <input
                      type="number"
                      value={parameters.endPotential}
                      onChange={(e) => updateParameter('endPotential', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      min="-2"
                      max="2"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Scan Rate (V/s)
                    </label>
                    <input
                      type="number"
                      value={parameters.scanRate}
                      onChange={(e) => updateParameter('scanRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      min="0.001"
                      max="10"
                      step="0.001"
                    />
                  </div>
                </div>
              )}

              {selectedTechnique.id === 'eis' && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-300">Impedance Spectroscopy</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Frequency (Hz)
                    </label>
                    <input
                      type="number"
                      value={parameters.frequency}
                      onChange={(e) => updateParameter('frequency', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      min="0.01"
                      max="1000000"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      AC Amplitude (V)
                    </label>
                    <input
                      type="number"
                      value={parameters.amplitude}
                      onChange={(e) => updateParameter('amplitude', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      min="0.001"
                      max="0.1"
                      step="0.001"
                    />
                  </div>
                </div>
              )}

              {selectedTechnique.id === 'ca' && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-300">Chronoamperometry</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Applied Potential (V)
                    </label>
                    <input
                      type="number"
                      value={parameters.appliedPotential}
                      onChange={(e) => updateParameter('appliedPotential', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      min="-2"
                      max="2"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Duration (s)
                    </label>
                    <input
                      type="number"
                      value={parameters.duration}
                      onChange={(e) => updateParameter('duration', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      min="1"
                      max="3600"
                      step="1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isRunning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRunning ? 'Stop Experiment' : 'Start Experiment'}
              </button>

              <button
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Export Data
              </button>

              <button
                className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Reset Parameters
              </button>
            </div>
          </div>
        </div>

        {/* Main Visualization Area */}
        <div className="flex-1 bg-gray-900">
          <Suspense 
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading electroanalytical tool...</p>
                </div>
              </div>
            }
          >
            <ElectroanalyticalTool
              technique={selectedTechnique}
              parameters={parameters}
              isRunning={isRunning}
              animationSpeed={animationSpeed}
              onParameterChange={updateParameter}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}