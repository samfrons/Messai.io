'use client'

import React, { useState, useEffect } from 'react'
import { predictionEngine, FidelityLevel, BioreactorParameters } from '@/lib/prediction-engine'
import { bioreactorCatalog } from '@/lib/bioreactor-catalog'

export default function TestPredictionsPage() {
  const [selectedReactor] = useState(bioreactorCatalog[0]) // EMBR-001
  const [fidelityLevel, setFidelityLevel] = useState<FidelityLevel>('advanced')
  const [isCalculating, setIsCalculating] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [executionTime, setExecutionTime] = useState<number>(0)
  
  const [parameters, setParameters] = useState<BioreactorParameters>({
    temperature: 35,
    ph: 7.2,
    flowRate: 25,
    mixingSpeed: 150,
    electrodeVoltage: 75,
    substrateConcentration: 2.0
  })

  useEffect(() => {
    runPrediction()
  }, [parameters, fidelityLevel])

  const runPrediction = async () => {
    setIsCalculating(true)
    const startTime = performance.now()
    
    try {
      const result = await predictionEngine.predict({
        bioreactorId: selectedReactor.id,
        parameters,
        fidelityLevel
      })
      
      setResults(result)
      setExecutionTime(performance.now() - startTime)
    } catch (error) {
      console.error('Prediction error:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-blue-400 mb-8">
        🧪 Enhanced AI Prediction Testing
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-400 mb-4">Test Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Model Fidelity</label>
                <select
                  value={fidelityLevel}
                  onChange={(e) => setFidelityLevel(e.target.value as FidelityLevel)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                >
                  <option value="basic">Basic (Fast)</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced (Full Physics)</option>
                </select>
              </div>

              {Object.entries(parameters).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <input
                    type="range"
                    min={key === 'ph' ? 4 : key === 'temperature' ? 10 : 0}
                    max={key === 'ph' ? 10 : key === 'temperature' ? 50 : key === 'electrodeVoltage' ? 200 : key === 'mixingSpeed' ? 300 : 100}
                    step={key === 'ph' ? 0.1 : key === 'substrateConcentration' ? 0.1 : 1}
                    value={value}
                    onChange={(e) => setParameters({...parameters, [key]: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400 mt-1">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-green-400 mb-4">Reactor: {selectedReactor.name}</h2>
            <p className="text-sm text-gray-300">{selectedReactor.description}</p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Expected Power: {selectedReactor.performance.powerDensity.value} mW/m²</p>
              <p>Electrode: {selectedReactor.electrodes.anode.material.join(', ')}</p>
              <p>Microbes: {selectedReactor.microbialSystem.primarySpecies.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {results && (
            <>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-purple-400 mb-4">
                  Prediction Results {isCalculating && <span className="text-sm animate-pulse">Calculating...</span>}
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <div className="text-2xl font-bold text-blue-400">{results.powerDensity.toFixed(1)}</div>
                    <div className="text-sm text-gray-400">Power Density (mW/m²)</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded">
                    <div className="text-2xl font-bold text-green-400">{results.currentDensity.toFixed(1)}</div>
                    <div className="text-sm text-gray-400">Current Density (mA/m²)</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded">
                    <div className="text-2xl font-bold text-yellow-400">{results.efficiency.toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">Efficiency</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded">
                    <div className={`text-2xl font-bold ${
                      results.operationalStatus === 'optimal' ? 'text-green-400' :
                      results.operationalStatus === 'good' ? 'text-yellow-400' :
                      results.operationalStatus === 'warning' ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {results.operationalStatus.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-400">Status</div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-400">
                  <p>Execution Time: {executionTime.toFixed(1)}ms</p>
                  <p>Confidence: {(results.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>

              {/* Advanced Results */}
              {fidelityLevel === 'advanced' && results.electrochemistry && (
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-cyan-400 mb-4">Advanced Analysis</h2>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-purple-300 mb-2">Electrochemistry</h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Activation η:</span>
                          <span>{(results.electrochemistry.overpotentials.activation * 1000).toFixed(1)} mV</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Concentration η:</span>
                          <span>{(results.electrochemistry.overpotentials.concentration * 1000).toFixed(1)} mV</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ohmic η:</span>
                          <span>{(results.electrochemistry.overpotentials.ohmic * 1000).toFixed(1)} mV</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Exchange i₀:</span>
                          <span>{results.electrochemistry.electrodeKinetics.exchangeCurrentDensity.toFixed(3)} A/m²</span>
                        </div>
                      </div>
                      
                      <h3 className="text-sm font-semibold text-orange-300 mt-4 mb-2">Limiting Factors</h3>
                      <div className="space-y-1 text-xs">
                        <div className={`flex justify-between ${results.electrochemistry.limitingFactors.massTransferLimited ? 'text-red-400' : 'text-green-400'}`}>
                          <span>Mass Transfer:</span>
                          <span>{results.electrochemistry.limitingFactors.massTransferLimited ? '❌ LIMITED' : '✅ OK'}</span>
                        </div>
                        <div className={`flex justify-between ${results.electrochemistry.limitingFactors.activationLimited ? 'text-red-400' : 'text-green-400'}`}>
                          <span>Activation:</span>
                          <span>{results.electrochemistry.limitingFactors.activationLimited ? '❌ LIMITED' : '✅ OK'}</span>
                        </div>
                        <div className={`flex justify-between ${results.electrochemistry.limitingFactors.ohmicLimited ? 'text-red-400' : 'text-green-400'}`}>
                          <span>Ohmic:</span>
                          <span>{results.electrochemistry.limitingFactors.ohmicLimited ? '❌ LIMITED' : '✅ OK'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-blue-300 mb-2">Fluid Dynamics</h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Reynolds:</span>
                          <span>{results.fluidDynamics.reynoldsNumber.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sherwood:</span>
                          <span>{results.fluidDynamics.sherwoodNumber.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mixing:</span>
                          <span>{(results.fluidDynamics.mixingEfficiency * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dead Zones:</span>
                          <span>{(results.fluidDynamics.deadZones * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>kLa:</span>
                          <span>{(results.fluidDynamics.massTransferCoefficient * 1e6).toFixed(2)} μm/s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {results.warnings.length > 0 && (
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-orange-400 mb-4">Warnings</h2>
                  <div className="space-y-2">
                    {results.warnings.map((warning, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <span className="text-orange-400">⚠️</span>
                        <span className="text-gray-300">{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Feature Summary */}
      <div className="mt-12 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-green-400 mb-4">🎯 Enhanced Prediction Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-blue-300 mb-2">Electrochemical Modeling</h3>
            <ul className="space-y-1 text-gray-400">
              <li>• Butler-Volmer kinetics</li>
              <li>• Material-specific properties</li>
              <li>• Biofilm enhancement factors</li>
              <li>• Limiting factor analysis</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-purple-300 mb-2">Mass Transfer</h3>
            <ul className="space-y-1 text-gray-400">
              <li>• Reynolds number modeling</li>
              <li>• Sherwood correlations</li>
              <li>• Mixing efficiency</li>
              <li>• Dead zone analysis</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-cyan-300 mb-2">Literature Validation</h3>
            <ul className="space-y-1 text-gray-400">
              <li>• Validated correlations</li>
              <li>• System-specific multipliers</li>
              <li>• Biochemical warnings</li>
              <li>• Uncertainty quantification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}