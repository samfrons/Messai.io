'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UnifiedMESSSystem, getRelatedSystems, standardizePowerOutput, getDesignTypeFor3D } from '@/lib/unified-systems-catalog'
import MFC3DModel from './MFC3DModel'
import MFCConfigPanel from './MFCConfigPanel'
import ParameterForm from './ParameterForm'
import ComprehensiveFuelCellConfig from './ComprehensiveFuelCellConfig'
import FuelCellStack3D from './fuel-cell/FuelCellStack3D'

interface Enhanced3DSystemModalProps {
  system: UnifiedMESSSystem
  onClose: () => void
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

interface FuelCellConfig {
  systemArchitecture: {
    stackConfiguration: 'single' | 'series' | 'parallel' | 'series-parallel'
    cellsInSeries: number
    cellsInParallel: number
    stackPower: number
    systemVoltage: number
    nominalCurrent: number
  }
  cellConfiguration: {
    cellType: 'PEM' | 'SOFC' | 'PAFC' | 'MCFC' | 'AFC'
    activeArea: number
    cellVoltage: number
    currentDensity: number
    cellThickness: number
  }
  components: {
    membrane: {
      material: string
      thickness: number
      conductivity: number
      waterContent: number
    }
    catalyst: {
      anodeMaterial: string
      cathodeMaterial: string
      anodeLoading: number
      cathodeLoading: number
      supportMaterial: string
    }
    gdl: {
      material: string
      porosity: number
      thickness: number
      permeability: number
      compressibility: number
    }
    bipolarPlate: {
      material: string
      flowPattern: 'serpentine' | 'parallel' | 'interdigitated' | 'pin-type'
      channelWidth: number
      channelDepth: number
      landWidth: number
      thickness: number
    }
  }
  operatingConditions: {
    temperature: number
    pressure: {
      anode: number
      cathode: number
      differential: number
    }
    humidity: {
      anode: number
      cathode: number
    }
    flowRates: {
      hydrogen: number
      air: number
      stoichiometry: {
        hydrogen: number
        air: number
      }
    }
    purging: {
      enabled: boolean
      interval: number
      duration: number
      nitrogenThreshold: number
    }
  }
  balanceOfPlant: {
    hydrogenStorage: {
      type: '700bar' | '350bar' | 'liquid' | 'metal-hydride'
      pressure: number
      capacity: number
      purityLevel: number
    }
    thermalManagement: {
      coolantType: 'water' | 'ethylene-glycol' | 'air'
      coolantFlow: number
      radiatorSize: number
      fanPower: number
    }
    powerElectronics: {
      dcDcConverter: boolean
      inverter: boolean
      efficiency: number
      powerRating: number
    }
    gasProcessing: {
      humidifier: boolean
      reformer: boolean
      aftercooler: boolean
      waterSeparator: boolean
    }
  }
  controlSystem: {
    controllers: {
      thermal: {
        enabled: boolean
        setpoint: number
        pidGains: { kp: number; ki: number; kd: number }
      }
      pressure: {
        enabled: boolean
        setpoint: number
        pidGains: { kp: number; ki: number; kd: number }
      }
      humidity: {
        enabled: boolean
        setpoint: number
        pidGains: { kp: number; ki: number; kd: number }
      }
      flowControl: {
        enabled: boolean
        hydrogenFlow: number
        airFlow: number
      }
    }
    safety: {
      gasLeakDetection: boolean
      emergencyShutdown: boolean
      overtemperatureProtection: boolean
      undervoltageProtection: boolean
    }
  }
  performanceTargets: {
    power: number
    efficiency: number
    durability: number
    startupTime: number
    dynamicResponse: number
  }
}

export default function Enhanced3DSystemModal({ system, onClose }: Enhanced3DSystemModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | '3d-config' | 'parameters'>('3d-config')
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [showParameterForm, setShowParameterForm] = useState(false)
  const [predictions, setPredictions] = useState({
    power: 0,
    efficiency: 0,
    cost: 0,
    confidence: 0
  })

  // Detect if this is a fuel cell system
  const isFuelCellSystem = system.systemType.toLowerCase().includes('fuel cell') ||
                          system.name.toLowerCase().includes('fuel cell') ||
                          system.specialFeatures.some(f => f.toLowerCase().includes('fuel cell')) ||
                          system.applications.some(a => a.toLowerCase().includes('hydrogen'))

  // Initialize config from system data
  const [config, setConfig] = useState<MFCConfig>(() => ({
    electrode: {
      material: system.materials.anode[0]?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'carbon-cloth',
      surface: system.powerOutput.unit === 'mW/m²' ? Math.min(250, Math.max(5, system.powerOutput.value / 100)) : 50,
      thickness: 2
    },
    microbial: {
      density: 5,
      species: system.organisms?.[0]?.toLowerCase().includes('geobacter') ? 'geobacter' : 
                system.organisms?.[0]?.toLowerCase().includes('shewanella') ? 'shewanella' : 'geobacter',
      activity: system.efficiency ? Math.min(100, Math.max(10, system.efficiency * 0.8)) : 70
    },
    chamber: {
      volume: system.dimensions?.volume ? parseFloat(system.dimensions.volume.match(/[\d.]+/)?.[0] || '1') : 1,
      shape: system.designType?.includes('rectangular') ? 'rectangular' : 
             system.designType?.includes('cylindrical') ? 'cylindrical' : 'rectangular',
      material: system.materials.container?.toLowerCase().includes('glass') ? 'glass' :
                system.materials.container?.toLowerCase().includes('acrylic') ? 'acrylic' : 'acrylic'
    }
  }))

  // Initialize fuel cell config for fuel cell systems
  const [fuelCellConfig, setFuelCellConfig] = useState<FuelCellConfig>(() => ({
    systemArchitecture: {
      stackConfiguration: 'single',
      cellsInSeries: 100,
      cellsInParallel: 1,
      stackPower: 10,
      systemVoltage: 48,
      nominalCurrent: 200
    },
    cellConfiguration: {
      cellType: 'PEM',
      activeArea: 100,
      cellVoltage: 0.65,
      currentDensity: 1.0,
      cellThickness: 0.5
    },
    components: {
      membrane: {
        material: 'nafion-117',
        thickness: 175,
        conductivity: 0.083,
        waterContent: 14
      },
      catalyst: {
        anodeMaterial: 'pt-c-40',
        cathodeMaterial: 'pt-c-40',
        anodeLoading: 0.5,
        cathodeLoading: 0.5,
        supportMaterial: 'carbon-black'
      },
      gdl: {
        material: 'toray-tgp-h-060',
        porosity: 78,
        thickness: 190,
        permeability: 1.2e-11,
        compressibility: 15
      },
      bipolarPlate: {
        material: 'graphite',
        flowPattern: 'serpentine',
        channelWidth: 1.0,
        channelDepth: 0.5,
        landWidth: 1.0,
        thickness: 3.0
      }
    },
    operatingConditions: {
      temperature: 80,
      pressure: {
        anode: 1.6,
        cathode: 1.6,
        differential: 0.0
      },
      humidity: {
        anode: 100,
        cathode: 100
      },
      flowRates: {
        hydrogen: 10,
        air: 50,
        stoichiometry: {
          hydrogen: 1.2,
          air: 2.0
        }
      },
      purging: {
        enabled: true,
        interval: 30,
        duration: 3,
        nitrogenThreshold: 10
      }
    },
    balanceOfPlant: {
      hydrogenStorage: {
        type: '700bar',
        pressure: 700,
        capacity: 5,
        purityLevel: 99.97
      },
      thermalManagement: {
        coolantType: 'water',
        coolantFlow: 5,
        radiatorSize: 15,
        fanPower: 500
      },
      powerElectronics: {
        dcDcConverter: true,
        inverter: true,
        efficiency: 92,
        powerRating: 10
      },
      gasProcessing: {
        humidifier: true,
        reformer: false,
        aftercooler: true,
        waterSeparator: true
      }
    },
    controlSystem: {
      controllers: {
        thermal: {
          enabled: true,
          setpoint: 80,
          pidGains: { kp: 1.0, ki: 0.1, kd: 0.05 }
        },
        pressure: {
          enabled: true,
          setpoint: 1.6,
          pidGains: { kp: 2.0, ki: 0.2, kd: 0.1 }
        },
        humidity: {
          enabled: true,
          setpoint: 100,
          pidGains: { kp: 0.5, ki: 0.05, kd: 0.02 }
        },
        flowControl: {
          enabled: true,
          hydrogenFlow: 10,
          airFlow: 50
        }
      },
      safety: {
        gasLeakDetection: true,
        emergencyShutdown: true,
        overtemperatureProtection: true,
        undervoltageProtection: true
      }
    },
    performanceTargets: {
      power: 10,
      efficiency: 55,
      durability: 40000,
      startupTime: 30,
      dynamicResponse: 10
    }
  }))

  const relatedSystems = getRelatedSystems(system.id, 3)

  // Real-time prediction calculation
  useEffect(() => {
    const calculatePredictions = async () => {
      try {
        if (isFuelCellSystem) {
          // Fuel cell predictions based on white paper specifications
          const cellPower = fuelCellConfig.cellConfiguration.activeArea * 
                           fuelCellConfig.cellConfiguration.currentDensity * 
                           fuelCellConfig.cellConfiguration.cellVoltage / 1000 // Convert to kW
          const stackPower = cellPower * fuelCellConfig.systemArchitecture.cellsInSeries
          
          // Efficiency based on cell type and operating conditions
          const baseEfficiencies = { PEM: 55, SOFC: 60, PAFC: 42, MCFC: 55, AFC: 50 }
          const baseEfficiency = baseEfficiencies[fuelCellConfig.cellConfiguration.cellType]
          const temperatureCorrection = fuelCellConfig.operatingConditions.temperature > 80 ? -2 : 2
          const pressureCorrection = fuelCellConfig.operatingConditions.pressure.cathode > 1.5 ? 3 : 0
          
          const predictedEfficiency = Math.min(70, Math.max(35, baseEfficiency + temperatureCorrection + pressureCorrection))
          
          // Cost estimation (simplified)
          const stackCost = fuelCellConfig.systemArchitecture.cellsInSeries * 
                           fuelCellConfig.cellConfiguration.activeArea * 2 // $2/cm²
          const bopCost = fuelCellConfig.systemArchitecture.stackPower * 500 // $500/kW
          const totalCost = Math.round(stackCost + bopCost)
          
          setPredictions({
            power: Math.round(stackPower * 1000), // Convert back to W for display
            efficiency: predictedEfficiency,
            cost: totalCost,
            confidence: 92 + Math.random() * 6 // Higher confidence for fuel cell models
          })
        } else {
          // Microbial electrochemical system predictions (existing logic)
          const basePower = config.electrode.surface * config.microbial.activity * 0.05
          const materialMultipliers: Record<string, number> = {
            'carbon-cloth': 1.0,
            'graphite': 0.8,
            'stainless-steel': 0.7,
            'graphene-oxide': 1.8,
            'reduced-graphene-oxide': 2.2,
            'graphene-aerogel': 2.5,
            'swcnt': 2.0,
            'mwcnt': 1.7,
            'cnt-graphene': 2.8,
            'ti3c2tx': 2.1,
            'v2ctx': 1.9,
            'nb2ctx': 1.6,
          }
          
          const materialMultiplier = materialMultipliers[config.electrode.material] || 1.0
          const volumeMultiplier = Math.sqrt(config.chamber.volume)
          const shapeMultiplier = config.chamber.shape === 'hexagonal' ? 1.2 : 
                                 config.chamber.shape === 'cylindrical' ? 1.1 : 1.0
          
          const predictedPower = Math.round(basePower * materialMultiplier * volumeMultiplier * shapeMultiplier)
          const predictedEfficiency = Math.min(95, Math.round(40 + materialMultiplier * 15 + config.microbial.activity * 0.3))
          
          // Cost calculation
          const materialCosts: Record<string, number> = {
            'carbon-cloth': 5,
            'graphite': 3,
            'stainless-steel': 8,
            'graphene-oxide': 25,
            'reduced-graphene-oxide': 35,
            'graphene-aerogel': 45,
            'swcnt': 50,
            'mwcnt': 30,
            'cnt-graphene': 60,
            'ti3c2tx': 40,
            'v2ctx': 35,
            'nb2ctx': 50,
          }
          
          const chamberCosts = { acrylic: 15, glass: 25, plastic: 8 }
          const materialCost = materialCosts[config.electrode.material] || 10
          const chamberCost = chamberCosts[config.chamber.material as keyof typeof chamberCosts] || 15
          const totalCost = Math.round(materialCost + chamberCost + config.chamber.volume * 5)
          
          setPredictions({
            power: predictedPower,
            efficiency: predictedEfficiency,
            cost: totalCost,
            confidence: 85 + Math.random() * 10 // Simulated confidence
          })
        }
      } catch (error) {
        console.error('Error calculating predictions:', error)
      }
    }

    calculatePredictions()
  }, [config, fuelCellConfig, isFuelCellSystem])

  const handleConfigChange = (component: keyof MFCConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [component]: {
        ...prev[component],
        [field]: value
      }
    }))
  }

  const handleFuelCellConfigChange = (section: keyof FuelCellConfig, subsection: string, field: string, value: any) => {
    setFuelCellConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }))
  }

  const handleExperimentSubmit = async (parameters: any) => {
    try {
      const experimentId = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const experimentData = {
        id: experimentId,
        name: parameters.name,
        systemId: system.id,
        systemName: system.name,
        systemType: system.systemType,
        status: 'setup',
        createdAt: new Date().toISOString(),
        parameters: {
          ...parameters,
          configuration: config,
          predictions: predictions
        },
        stats: {
          totalMeasurements: 0,
          averagePower: predictions.power,
          maxPower: Math.round(predictions.power * 1.2),
          efficiency: predictions.efficiency
        }
      }
      
      const existingExperiments = JSON.parse(localStorage.getItem('messai-experiments') || '[]')
      existingExperiments.push(experimentData)
      localStorage.setItem('messai-experiments', JSON.stringify(existingExperiments))
      
      window.location.href = `/experiment/${experimentId}`
    } catch (error) {
      console.error('Failed to create experiment:', error)
      alert('Failed to create experiment. Please try again.')
    }
  }

  if (showParameterForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <ParameterForm
            designId={system.id}
            designName={system.name}
            designType={getDesignTypeFor3D(system)}
            onSubmit={handleExperimentSubmit}
            onCancel={() => setShowParameterForm(false)}
            initialConfig={config}
            predictions={predictions}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{system.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{system.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">System Type:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{system.systemType}</span>
                {system.priority && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-xs font-medium rounded-full">
                    Priority {system.priority}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('3d-config')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === '3d-config'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {isFuelCellSystem ? '⚡ Fuel Cell Configuration' : '🎮 3D Configuration'}
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              📊 System Overview
            </button>
            <button
              onClick={() => setActiveTab('parameters')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'parameters'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              ⚙️ Advanced Parameters
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === '3d-config' && (
            <div className="h-full flex">
              {/* 3D Model */}
              <div className="flex-1 p-6">
                <div className="h-full bg-gray-900 rounded-lg overflow-hidden">
                  {isFuelCellSystem ? (
                    <FuelCellStack3D
                      fuelCellType={fuelCellConfig.cellConfiguration.cellType}
                      cellCount={fuelCellConfig.systemArchitecture.cellsInSeries}
                      activeArea={fuelCellConfig.cellConfiguration.activeArea}
                      showGasFlow={true}
                      showTemperature={true}
                      showControls={true}
                    />
                  ) : (
                    <MFC3DModel
                      config={config}
                      onComponentSelect={setSelectedComponent}
                      selectedComponent={selectedComponent}
                      designType={getDesignTypeFor3D(system)}
                    />
                  )}
                </div>
                
                {/* Real-time Predictions */}
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Real-time AI Predictions</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{predictions.power.toLocaleString()}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{isFuelCellSystem ? 'W Power' : 'mW/m² Power'}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{predictions.efficiency}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Efficiency</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">${predictions.cost}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Est. Cost</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{Math.round(predictions.confidence)}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Confidence</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuration Panel */}
              <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
                {isFuelCellSystem ? (
                  <ComprehensiveFuelCellConfig
                    config={fuelCellConfig}
                    onConfigChange={handleFuelCellConfigChange}
                    selectedComponent={selectedComponent}
                  />
                ) : (
                  <MFCConfigPanel
                    config={config}
                    selectedComponent={selectedComponent}
                    onConfigChange={handleConfigChange}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="p-6 overflow-y-auto h-full space-y-6">
              {/* Performance Metrics */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {system.powerOutput.range || `${system.powerOutput.value} ${system.powerOutput.unit}`}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Power Output</div>
                    {system.powerOutput.conditions && (
                      <div className="text-xs text-green-500 dark:text-green-500 mt-1">
                        {system.powerOutput.conditions}
                      </div>
                    )}
                  </div>
                  {system.efficiency && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {system.efficiency}%
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Efficiency</div>
                    </div>
                  )}
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300 capitalize">
                      {system.scale}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Scale</div>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Materials & Components</h4>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Anode:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{system.materials.anode.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Cathode:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{system.materials.cathode.join(', ')}</span>
                  </div>
                  {system.materials.membrane && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Membrane:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{system.materials.membrane}</span>
                    </div>
                  )}
                  {system.materials.container && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Container:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{system.materials.container}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Organisms */}
              {system.organisms && system.organisms.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Microbial Community</h4>
                  <div className="flex flex-wrap gap-2">
                    {system.organisms.map((organism, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded-full"
                      >
                        {organism}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Features */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Special Features</h4>
                <ul className="space-y-2">
                  {system.specialFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Applications */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Applications</h4>
                <div className="flex flex-wrap gap-2">
                  {system.applications.map((app, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parameters' && (
            <div className="p-6 overflow-y-auto h-full">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Advanced System Parameters</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Configure detailed experimental parameters for precise system optimization.
                  </p>
                </div>

                {/* Environmental Parameters */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Environmental Conditions</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Temperature (°C)
                      </label>
                      <input
                        type="range"
                        min="15"
                        max="45"
                        defaultValue="30"
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">Current: 30°C</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        pH Level
                      </label>
                      <input
                        type="range"
                        min="4"
                        max="10"
                        step="0.1"
                        defaultValue="7.0"
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">Current: 7.0</div>
                    </div>
                  </div>
                </div>

                {/* Substrate Configuration */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Substrate & Nutrients</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Substrate Type
                      </label>
                      <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                        <option>Acetate</option>
                        <option>Glucose</option>
                        <option>Wastewater</option>
                        <option>Custom organic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Concentration (g/L)
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        defaultValue="2"
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">Current: 2.0 g/L</div>
                    </div>
                  </div>
                </div>

                {/* Operating Conditions */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">Operating Conditions</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Flow Rate (mL/min)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        defaultValue="5"
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">Current: 5 mL/min</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        External Resistance (Ω)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="10000"
                        defaultValue="1000"
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">Current: 1000 Ω</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {system.researchBacked && (
                <Link
                  href={`/research?search=${encodeURIComponent(system.name)}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  📖 View Research Papers →
                </Link>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              {system.isExperimental && (
                <button
                  onClick={() => setShowParameterForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Create Experiment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}