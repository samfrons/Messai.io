'use client'

import React, { useState, Suspense, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { bioreactorCatalog, BioreactorModel, getOptimalOperatingConditions, calculatePerformanceScore } from '@/lib/bioreactor-catalog'
import { predictionEngine, FidelityLevel, BioreactorParameters, BasicPrediction, IntermediatePrediction, AdvancedPrediction } from '@/lib/prediction-engine'

// Dynamic imports to avoid SSR issues
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), { ssr: false })
const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })), { ssr: false })

// Enhanced bioreactor visualization component
function AdvancedBioreactorVisualization({ 
  reactor, 
  parameters, 
  predictions 
}: { 
  reactor: BioreactorModel
  parameters: BioreactorParameters
  predictions: BasicPrediction | IntermediatePrediction | AdvancedPrediction | null
}) {
  const meshRef = useRef<any>()
  const particlesRef = useRef<any>()
  
  // Dynamic material properties based on reactor
  const getMaterialColor = () => {
    if (!predictions) return 0x4a90e2
    
    const efficiency = predictions.efficiency
    if (efficiency > 80) return 0x4CAF50 // Green
    if (efficiency > 60) return 0xFFC107 // Yellow
    if (efficiency > 40) return 0xFF9800 // Orange
    return 0xF44336 // Red
  }
  
  const getElectrodeProperties = (type: 'anode' | 'cathode') => {
    const electrode = reactor.electrodes[type]
    const materials = electrode.material.join(', ')
    
    // Material-based visual properties
    if (materials.includes('Graphene')) {
      return { color: 0x2c3e50, metalness: 0.7, roughness: 0.3 }
    } else if (materials.includes('Carbon')) {
      return { color: 0x1a1a1a, metalness: 0.1, roughness: 0.9 }
    } else if (materials.includes('Platinum')) {
      return { color: 0xe0e0e0, metalness: 0.95, roughness: 0.05 }
    } else {
      return { color: 0x607d8b, metalness: 0.5, roughness: 0.5 }
    }
  }
  
  return (
    <group>
      {/* Main reactor vessel */}
      <mesh ref={meshRef} castShadow receiveShadow>
        {reactor.reactorType.includes('Stirred Tank') ? (
          <cylinderGeometry args={[1, 1, 2, 32]} />
        ) : reactor.reactorType.includes('Photobioreactor') ? (
          <boxGeometry args={[1.5, 2, 0.3]} />
        ) : reactor.reactorType.includes('Airlift') ? (
          <cylinderGeometry args={[0.8, 0.8, 3, 32]} />
        ) : reactor.reactorType.includes('Fractal') ? (
          <dodecahedronGeometry args={[0.8]} />
        ) : (
          <boxGeometry args={[1.2, 1.5, 0.8]} />
        )}
        <meshPhysicalMaterial
          color={getMaterialColor()}
          transparent
          opacity={0.4}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Electrodes based on configuration */}
      {reactor.electrodes.configuration === 'single' && (
        <>
          <mesh position={[-0.6, 0, 0]} castShadow>
            <boxGeometry args={[0.05, 1.5, 0.8]} />
            <meshStandardMaterial {...getElectrodeProperties('anode')} />
          </mesh>
          <mesh position={[0.6, 0, 0]} castShadow>
            <boxGeometry args={[0.05, 1.5, 0.8]} />
            <meshStandardMaterial {...getElectrodeProperties('cathode')} />
          </mesh>
        </>
      )}
      
      {reactor.electrodes.configuration === 'multiple' && (
        <>
          {Array.from({ length: reactor.electrodes.count || 4 }, (_, i) => (
            <group key={i}>
              <mesh position={[-0.6, (i - 1.5) * 0.4, 0]} castShadow>
                <boxGeometry args={[0.05, 0.3, 0.8]} />
                <meshStandardMaterial {...getElectrodeProperties('anode')} />
              </mesh>
              <mesh position={[0.6, (i - 1.5) * 0.4, 0]} castShadow>
                <boxGeometry args={[0.05, 0.3, 0.8]} />
                <meshStandardMaterial {...getElectrodeProperties('cathode')} />
              </mesh>
            </group>
          ))}
        </>
      )}
      
      {/* Performance indicator */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={getMaterialColor()}
          emissive={getMaterialColor()}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Mixing indicator for stirred tank */}
      {reactor.reactorType.includes('Stirred Tank') && (
        <group rotation={[0, Date.now() * 0.001 * parameters.mixingSpeed * 0.01, 0]}>
          {Array.from({ length: 4 }, (_, i) => (
            <mesh key={i} rotation={[0, (i * Math.PI) / 2, Math.PI / 12]}>
              <boxGeometry args={[0.6, 0.02, 0.1]} />
              <meshStandardMaterial color={0x455a64} metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Light source for photobioreactor */}
      {reactor.reactorType.includes('Photobioreactor') && (
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial
            color={0xffffff}
            emissive={0xffffff}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  )
}

export default function AdvancedBioreactorPage() {
  const [selectedReactor, setSelectedReactor] = useState<BioreactorModel>(bioreactorCatalog[0])
  const [fidelityLevel, setFidelityLevel] = useState<FidelityLevel>('basic')
  const [parameters, setParameters] = useState<BioreactorParameters>(() => {
    const optimal = getOptimalOperatingConditions(bioreactorCatalog[0].id)
    return optimal || {
      temperature: 30,
      ph: 7.0,
      flowRate: 50,
      mixingSpeed: 100,
      electrodeVoltage: 50,
      substrateConcentration: 2.0
    }
  })
  
  const [predictions, setPredictions] = useState<BasicPrediction | IntermediatePrediction | AdvancedPrediction | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [lastCalculationTime, setLastCalculationTime] = useState<number>(0)

  // Auto-calculate predictions when parameters change
  useEffect(() => {
    const calculatePredictions = async () => {
      setIsCalculating(true)
      try {
        const result = await predictionEngine.predict({
          bioreactorId: selectedReactor.id,
          parameters,
          fidelityLevel
        })
        setPredictions(result)
        setLastCalculationTime(result.executionTime)
      } catch (error) {
        console.error('Prediction calculation failed:', error)
      } finally {
        setIsCalculating(false)
      }
    }

    const timeoutId = setTimeout(calculatePredictions, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [selectedReactor.id, parameters, fidelityLevel])

  // Update parameters when reactor changes
  useEffect(() => {
    const optimal = getOptimalOperatingConditions(selectedReactor.id)
    if (optimal) {
      setParameters(optimal)
    }
  }, [selectedReactor.id])

  const handleParameterChange = (key: keyof BioreactorParameters, value: number) => {
    setParameters(prev => ({ ...prev, [key]: value }))
  }

  const handleReactorChange = (reactorId: string) => {
    const reactor = bioreactorCatalog.find(r => r.id === reactorId)
    if (reactor) {
      setSelectedReactor(reactor)
    }
  }

  const performanceScore = calculatePerformanceScore(selectedReactor)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">
              Advanced Bioreactor Analysis Platform
            </h1>
            <p className="text-gray-300 mt-1">
              Multi-fidelity modeling and performance prediction for electrochemical bioreactors
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Performance Score: <span className="text-blue-400 font-bold">{performanceScore.toFixed(1)}/100</span>
            </div>
            <div className="text-xs text-gray-500">
              Calc: {lastCalculationTime.toFixed(0)}ms
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Control Panel */}
        <div className="w-96 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Bioreactor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bioreactor Model
              </label>
              <select
                value={selectedReactor.id}
                onChange={(e) => handleReactorChange(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                {bioreactorCatalog.map(reactor => (
                  <option key={reactor.id} value={reactor.id}>
                    {reactor.name} ({reactor.category})
                  </option>
                ))}
              </select>
              <div className="mt-2 text-xs text-gray-400 space-y-1">
                <p><strong>Type:</strong> {selectedReactor.reactorType}</p>
                <p><strong>Scale:</strong> {selectedReactor.geometry.scale}</p>
                <p><strong>Volume:</strong> {selectedReactor.geometry.volume}L</p>
                <p><strong>Expected Power:</strong> {selectedReactor.performance.powerDensity.value} mW/m²</p>
              </div>
            </div>

            {/* Fidelity Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model Fidelity
              </label>
              <select
                value={fidelityLevel}
                onChange={(e) => setFidelityLevel(e.target.value as FidelityLevel)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="basic">Basic (Fast)</option>
                <option value="intermediate">Intermediate (Detailed)</option>
                <option value="advanced">Advanced (Full Physics)</option>
              </select>
              <div className="mt-1 text-xs text-gray-400">
                {fidelityLevel === 'basic' && 'Simple correlations, <100ms'}
                {fidelityLevel === 'intermediate' && 'Mass transfer + economics, <1s'}
                {fidelityLevel === 'advanced' && 'Multi-physics + optimization, <10s'}
              </div>
            </div>

            {/* Operating Parameters */}
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Operating Parameters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Temperature: {parameters.temperature.toFixed(1)}°C
                  </label>
                  <input
                    type="range"
                    min={selectedReactor.operating.temperature.range[0]}
                    max={selectedReactor.operating.temperature.range[1]}
                    step="0.5"
                    value={parameters.temperature}
                    onChange={(e) => handleParameterChange('temperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{selectedReactor.operating.temperature.range[0]}°C</span>
                    <span className="text-green-400">Optimal: {selectedReactor.operating.temperature.optimal}°C</span>
                    <span>{selectedReactor.operating.temperature.range[1]}°C</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    pH: {parameters.ph.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min={selectedReactor.operating.ph.range[0]}
                    max={selectedReactor.operating.ph.range[1]}
                    step="0.1"
                    value={parameters.ph}
                    onChange={(e) => handleParameterChange('ph', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{selectedReactor.operating.ph.range[0]}</span>
                    <span className="text-green-400">Optimal: {selectedReactor.operating.ph.optimal}</span>
                    <span>{selectedReactor.operating.ph.range[1]}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Flow Rate: {parameters.flowRate.toFixed(0)} L/h
                  </label>
                  <input
                    type="range"
                    min={selectedReactor.operating.flowRate?.range[0] || 10}
                    max={selectedReactor.operating.flowRate?.range[1] || 200}
                    step="5"
                    value={parameters.flowRate}
                    onChange={(e) => handleParameterChange('flowRate', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Mixing Speed: {parameters.mixingSpeed.toFixed(0)} RPM
                  </label>
                  <input
                    type="range"
                    min={selectedReactor.operating.mixingSpeed?.range[0] || 0}
                    max={selectedReactor.operating.mixingSpeed?.range[1] || 300}
                    step="10"
                    value={parameters.mixingSpeed}
                    onChange={(e) => handleParameterChange('mixingSpeed', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Electrode Voltage: {parameters.electrodeVoltage.toFixed(0)} mV
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="5"
                    value={parameters.electrodeVoltage}
                    onChange={(e) => handleParameterChange('electrodeVoltage', parseFloat(e.target.value))}
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
                    onChange={(e) => handleParameterChange('substrateConcentration', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Predictions Display */}
            {predictions && (
              <div className="bg-gray-700 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center">
                  Real-time Predictions
                  {isCalculating && <div className="ml-2 animate-spin w-3 h-3 border border-blue-400 border-t-transparent rounded-full"></div>}
                </h4>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Power Density:</span>
                    <span className="text-blue-400">{predictions.powerDensity.toFixed(0)} mW/m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Density:</span>
                    <span className="text-green-400">{predictions.currentDensity.toFixed(1)} mA/m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efficiency:</span>
                    <span className="text-yellow-400">{predictions.efficiency.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-semibold ${
                      predictions.operationalStatus === 'optimal' ? 'text-green-400' :
                      predictions.operationalStatus === 'good' ? 'text-yellow-400' :
                      predictions.operationalStatus === 'warning' ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {predictions.operationalStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span className="text-purple-400">{(predictions.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                
                {predictions.warnings.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-600">
                    <h5 className="text-xs font-semibold text-orange-400 mb-1">Warnings:</h5>
                    {predictions.warnings.map((warning, index) => (
                      <p key={index} className="text-xs text-orange-300">{warning}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Advanced Data (for intermediate/advanced fidelity) */}
            {predictions && fidelityLevel !== 'basic' && 'economics' in predictions && (
              <div className="bg-gray-700 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Advanced Analytics</h4>
                <div className="space-y-1 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Operating Cost:</span>
                    <span>${predictions.economics.operatingCost.toFixed(3)}/kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance:</span>
                    <span>${predictions.economics.maintenanceCost.toFixed(1)}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biofilm Thickness:</span>
                    <span>{predictions.biofilmDynamics.thickness.toFixed(1)} μm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biofilm Viability:</span>
                    <span>{(predictions.biofilmDynamics.viability * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Electrochemical Details (Advanced fidelity only) */}
            {predictions && fidelityLevel === 'advanced' && 'electrochemistry' in predictions && (
              <div className="bg-gray-700 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Electrochemical Analysis</h4>
                <div className="space-y-1 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Activation η:</span>
                    <span>{(predictions.electrochemistry.overpotentials.activation * 1000).toFixed(1)} mV</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Concentration η:</span>
                    <span>{(predictions.electrochemistry.overpotentials.concentration * 1000).toFixed(1)} mV</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ohmic η:</span>
                    <span>{(predictions.electrochemistry.overpotentials.ohmic * 1000).toFixed(1)} mV</span>
                  </div>
                  {predictions.electrochemistry.overpotentials.membrane && (
                    <div className="flex justify-between">
                      <span>Membrane η:</span>
                      <span>{(predictions.electrochemistry.overpotentials.membrane * 1000).toFixed(1)} mV</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Exchange i₀:</span>
                    <span>{predictions.electrochemistry.electrodeKinetics.exchangeCurrentDensity.toFixed(3)} A/m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tafel Slope:</span>
                    <span>{(predictions.electrochemistry.electrodeKinetics.tafelSlope * 1000).toFixed(1)} mV/dec</span>
                  </div>
                </div>
                
                {/* Limiting Factors */}
                <div className="mt-3 pt-2 border-t border-gray-600">
                  <h5 className="text-xs font-semibold text-orange-400 mb-1">Limiting Factors:</h5>
                  <div className="space-y-1 text-xs">
                    <div className={`flex justify-between ${predictions.electrochemistry.limitingFactors.massTransferLimited ? 'text-red-400' : 'text-green-400'}`}>
                      <span>Mass Transfer:</span>
                      <span>{predictions.electrochemistry.limitingFactors.massTransferLimited ? '❌ LIMITED' : '✅ OK'}</span>
                    </div>
                    <div className={`flex justify-between ${predictions.electrochemistry.limitingFactors.activationLimited ? 'text-red-400' : 'text-green-400'}`}>
                      <span>Activation:</span>
                      <span>{predictions.electrochemistry.limitingFactors.activationLimited ? '❌ LIMITED' : '✅ OK'}</span>
                    </div>
                    <div className={`flex justify-between ${predictions.electrochemistry.limitingFactors.ohmicLimited ? 'text-red-400' : 'text-green-400'}`}>
                      <span>Ohmic:</span>
                      <span>{predictions.electrochemistry.limitingFactors.ohmicLimited ? '❌ LIMITED' : '✅ OK'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fluid Dynamics (Advanced fidelity only) */}
            {predictions && fidelityLevel === 'advanced' && 'fluidDynamics' in predictions && (
              <div className="bg-gray-700 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">Fluid Dynamics</h4>
                <div className="space-y-1 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Reynolds Number:</span>
                    <span>{predictions.fluidDynamics.reynoldsNumber.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sherwood Number:</span>
                    <span>{predictions.fluidDynamics.sherwoodNumber.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mixing Efficiency:</span>
                    <span>{(predictions.fluidDynamics.mixingEfficiency * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dead Zones:</span>
                    <span>{(predictions.fluidDynamics.deadZones * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>kLa:</span>
                    <span>{(predictions.fluidDynamics.massTransferCoefficient * 1e6).toFixed(2)} μm/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Turbulence:</span>
                    <span>{(predictions.fluidDynamics.turbulenceIntensity * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3D Visualization */}
        <div className="flex-1 relative">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p>Loading Advanced Visualization...</p>
              </div>
            </div>
          }>
            <Canvas camera={{ position: [3, 2, 3], fov: 60 }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
              <pointLight position={[-10, -10, -5]} intensity={0.5} />
              
              <AdvancedBioreactorVisualization
                reactor={selectedReactor}
                parameters={parameters}
                predictions={predictions}
              />
              
              <OrbitControls 
                enablePan={true} 
                enableZoom={true} 
                enableRotate={true}
                minDistance={2}
                maxDistance={10}
              />
            </Canvas>
          </Suspense>

          {/* Model Information Overlay */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg max-w-xs">
            <h3 className="font-bold text-lg text-blue-400">{selectedReactor.name}</h3>
            <p className="text-sm text-gray-300 mt-1">{selectedReactor.description}</p>
            
            <div className="mt-3 text-xs text-gray-400 space-y-1">
              <p><strong>Materials:</strong></p>
              <p>Anode: {selectedReactor.electrodes.anode.material.join(', ')}</p>
              <p>Cathode: {selectedReactor.electrodes.cathode.material.join(', ')}</p>
              <p><strong>Species:</strong> {selectedReactor.microbialSystem.primarySpecies.join(', ')}</p>
            </div>
            
            {predictions && (
              <div className="mt-3 text-xs">
                <div className={`inline-block px-2 py-1 rounded text-white font-semibold ${
                  predictions.operationalStatus === 'optimal' ? 'bg-green-600' :
                  predictions.operationalStatus === 'good' ? 'bg-yellow-600' :
                  predictions.operationalStatus === 'warning' ? 'bg-orange-600' : 'bg-red-600'
                }`}>
                  {predictions.operationalStatus.toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Performance Indicator */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-sm">
                <div className="font-semibold text-blue-400">Performance</div>
                <div className="text-xs text-gray-400">
                  {predictions ? `${predictions.powerDensity.toFixed(0)} mW/m² @ ${predictions.efficiency.toFixed(0)}% eff` : 'Calculating...'}
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                predictions?.operationalStatus === 'optimal' ? 'bg-green-400' :
                predictions?.operationalStatus === 'good' ? 'bg-yellow-400' :
                predictions?.operationalStatus === 'warning' ? 'bg-orange-400' : 'bg-red-400'
              }`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}