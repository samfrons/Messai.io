'use client'

import React, { useState, useCallback } from 'react'
import { 
  UnifiedOptimizationControl, 
  BioreactorParameters,
  OptimizationResult
} from '@messai/ui'

// ============================================================================
// OPTIMIZATION INTEGRATION TEST PAGE
// ============================================================================

export default function OptimizationIntegrationTest() {
  // Test parameters
  const [systemType, setSystemType] = useState<'MFC' | 'MEC' | 'MDC' | 'MES'>('MFC')
  const [currentParameters, setCurrentParameters] = useState<BioreactorParameters>({
    temperature: 30,
    ph: 7.0,
    flowRate: 50,
    mixingSpeed: 150,
    electrodeVoltage: 100,
    substrateConcentration: 3.0
  })

  const [show3DOverlay, setShow3DOverlay] = useState(true)
  const [testResults, setTestResults] = useState<string[]>([])

  // Mock prediction engine for testing
  const mockPredictionEngine = useCallback(async (params: BioreactorParameters) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Simple performance calculation for testing
    const basePower = systemType === 'MFC' ? 25 : systemType === 'MEC' ? 15 : 20
    const baseEfficiency = systemType === 'MFC' ? 65 : systemType === 'MEC' ? 85 : 70
    
    // Calculate performance based on parameters
    let power = basePower
    let efficiency = baseEfficiency
    
    // Temperature effects (optimal around 30°C)
    const tempFactor = 1 - Math.abs(params.temperature - 30) / 50
    power *= tempFactor
    efficiency *= tempFactor
    
    // pH effects (optimal around 7.0)
    const phFactor = 1 - Math.abs(params.ph - 7.0) / 5
    power *= phFactor
    efficiency *= phFactor
    
    // Flow rate effects
    const flowFactor = Math.min(1, params.flowRate / 50) * Math.max(0.5, 1 - (params.flowRate - 50) / 100)
    power *= flowFactor
    
    // Calculate cost
    let cost = 500 // Base cost
    cost += Math.abs(params.temperature - 30) * 2
    cost += params.mixingSpeed * 0.1
    cost += params.electrodeVoltage * 0.05
    cost += params.substrateConcentration * params.flowRate * 0.01
    
    return {
      power: Math.max(0.1, power),
      efficiency: Math.max(5, Math.min(95, efficiency)),
      cost
    }
  }, [systemType])

  // Event handlers
  const handleParametersChange = useCallback((newParameters: BioreactorParameters) => {
    setCurrentParameters(newParameters)
    addTestResult(`Parameters updated: ${JSON.stringify(newParameters)}`)
  }, [])

  const handleOptimizationComplete = useCallback((result: OptimizationResult) => {
    addTestResult(`Optimization completed: Success=${result.success}, Iterations=${result.iterations}, Score=${result.objectiveValue.toFixed(3)}`)
  }, [])

  const handleVisualizationModeChange = useCallback((mode: 'HEATMAP' | 'PATH' | 'CONVERGENCE') => {
    addTestResult(`3D visualization mode changed to: ${mode}`)
  }, [])

  const addTestResult = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]) // Keep last 20 messages
  }, [])

  // Test specific optimization endpoints
  const testBioreactorOptimization = useCallback(async () => {
    addTestResult('Testing bioreactor optimization API...')
    
    try {
      const response = await fetch('/api/optimization/bioreactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemType,
          objective: 'MAXIMIZE_POWER',
          algorithm: 'GENETIC_ALGORITHM',
          initialParameters: currentParameters,
          constraints: {
            temperature: { min: 15, max: 45 },
            ph: { min: 6.0, max: 8.5 },
            flowRate: { min: 10, max: 100 },
            mixingSpeed: { min: 50, max: 300 },
            electrodeVoltage: { min: 50, max: 200 },
            substrateConcentration: { min: 0.5, max: 10.0 }
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        addTestResult(`Bioreactor optimization API test: SUCCESS - ${result.optimization.iterations} iterations`)
      } else {
        addTestResult(`Bioreactor optimization API test: FAILED - ${response.status}`)
      }
    } catch (error) {
      addTestResult(`Bioreactor optimization API test: ERROR - ${error}`)
    }
  }, [systemType, currentParameters])

  const testElectrochemicalOptimization = useCallback(async () => {
    addTestResult('Testing electrochemical optimization API...')
    
    try {
      const response = await fetch('/api/laboratory/electroanalytical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'cyclic-voltammetry',
          parameters: {
            scanRate: 100,
            startPotential: -0.5,
            endPotential: 0.5,
            cycles: 3
          },
          optimizationRequest: {
            targetMetrics: { peak_current: 1.0 },
            constraints: {
              scanRate: { min: 10, max: 1000 }
            }
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        addTestResult(`Electrochemical optimization API test: SUCCESS - ${result.optimization?.optimizationSteps?.length || 0} steps`)
      } else {
        addTestResult(`Electrochemical optimization API test: FAILED - ${response.status}`)
      }
    } catch (error) {
      addTestResult(`Electrochemical optimization API test: ERROR - ${error}`)
    }
  }, [])

  const testWebSocketConnection = useCallback(async () => {
    addTestResult('Testing WebSocket optimization connection...')
    
    try {
      const response = await fetch('/api/optimization/websocket', {
        method: 'GET'
      })

      if (response.ok) {
        const result = await response.json()
        addTestResult(`WebSocket connection test: SUCCESS - Connection ID: ${result.connectionId}`)
      } else {
        addTestResult(`WebSocket connection test: FAILED - ${response.status}`)
      }
    } catch (error) {
      addTestResult(`WebSocket connection test: ERROR - ${error}`)
    }
  }, [])

  const runAllTests = useCallback(async () => {
    addTestResult('Running complete integration test suite...')
    await testBioreactorOptimization()
    await testElectrochemicalOptimization()
    await testWebSocketConnection()
    addTestResult('Integration test suite completed!')
  }, [testBioreactorOptimization, testElectrochemicalOptimization, testWebSocketConnection])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Optimization Integration Test
          </h1>
          <p className="text-gray-600">
            Test the complete optimization workflow integration
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">System Type</label>
              <select
                value={systemType}
                onChange={(e) => setSystemType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="MFC">Microbial Fuel Cell (MFC)</option>
                <option value="MEC">Microbial Electrolysis Cell (MEC)</option>
                <option value="MDC">Microbial Desalination Cell (MDC)</option>
                <option value="MES">Microbial Electrosynthesis (MES)</option>
              </select>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={show3DOverlay}
                  onChange={(e) => setShow3DOverlay(e.target.checked)}
                />
                <span className="text-sm">Show 3D Optimization Overlay</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={testBioreactorOptimization}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Bioreactor API
            </button>
            <button
              onClick={testElectrochemicalOptimization}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test Electrochemical API
            </button>
            <button
              onClick={testWebSocketConnection}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Test WebSocket
            </button>
            <button
              onClick={runAllTests}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Run All Tests
            </button>
          </div>
        </div>

        {/* Main Optimization Control */}
        <UnifiedOptimizationControl
          systemType={systemType}
          initialParameters={currentParameters}
          onParametersChange={handleParametersChange}
          onOptimizationComplete={handleOptimizationComplete}
          predictionEngine={mockPredictionEngine}
          show3DOverlay={show3DOverlay}
          onVisualizationModeChange={handleVisualizationModeChange}
        />

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-md h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-gray-500">No test results yet. Run some tests to see output here.</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Current Parameters Display */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Parameters</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Temperature</div>
              <div>{currentParameters.temperature}°C</div>
            </div>
            <div>
              <div className="font-medium">pH</div>
              <div>{currentParameters.ph}</div>
            </div>
            <div>
              <div className="font-medium">Flow Rate</div>
              <div>{currentParameters.flowRate} mL/min</div>
            </div>
            <div>
              <div className="font-medium">Mixing Speed</div>
              <div>{currentParameters.mixingSpeed} rpm</div>
            </div>
            <div>
              <div className="font-medium">Electrode Voltage</div>
              <div>{currentParameters.electrodeVoltage} mV</div>
            </div>
            <div>
              <div className="font-medium">Substrate Concentration</div>
              <div>{currentParameters.substrateConcentration} g/L</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}