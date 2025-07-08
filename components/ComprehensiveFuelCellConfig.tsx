'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FuelCellConfig {
  // System Architecture
  systemArchitecture: {
    stackConfiguration: 'single' | 'series' | 'parallel' | 'series-parallel'
    cellsInSeries: number
    cellsInParallel: number
    stackPower: number // kW
    systemVoltage: number // V
    nominalCurrent: number // A
  }
  
  // Cell-Level Configuration
  cellConfiguration: {
    cellType: 'PEM' | 'SOFC' | 'PAFC' | 'MCFC' | 'AFC'
    activeArea: number // cm²
    cellVoltage: number // V
    currentDensity: number // A/cm²
    cellThickness: number // mm
  }
  
  // Component Materials
  components: {
    membrane: {
      material: string
      thickness: number // μm
      conductivity: number // S/cm
      waterContent: number
    }
    catalyst: {
      anodeMaterial: string
      cathodeMaterial: string
      anodeLoading: number // mg/cm²
      cathodeLoading: number // mg/cm²
      supportMaterial: string
    }
    gdl: {
      material: string
      porosity: number // %
      thickness: number // μm
      permeability: number // m²
      compressibility: number // %
    }
    bipolarPlate: {
      material: string
      flowPattern: 'serpentine' | 'parallel' | 'interdigitated' | 'pin-type'
      channelWidth: number // mm
      channelDepth: number // mm
      landWidth: number // mm
      thickness: number // mm
    }
  }
  
  // Operating Conditions
  operatingConditions: {
    temperature: number // °C
    pressure: {
      anode: number // bar
      cathode: number // bar
      differential: number // bar
    }
    humidity: {
      anode: number // %RH
      cathode: number // %RH
    }
    flowRates: {
      hydrogen: number // slpm
      air: number // slpm
      stoichiometry: {
        hydrogen: number
        air: number
      }
    }
    purging: {
      enabled: boolean
      interval: number // seconds
      duration: number // seconds
      nitrogenThreshold: number // %
    }
  }
  
  // Balance of Plant
  balanceOfPlant: {
    hydrogenStorage: {
      type: '700bar' | '350bar' | 'liquid' | 'metal-hydride'
      pressure: number // bar
      capacity: number // kg
      purityLevel: number // %
    }
    thermalManagement: {
      coolantType: 'water' | 'ethylene-glycol' | 'air'
      coolantFlow: number // L/min
      radiatorSize: number // kW
      fanPower: number // W
    }
    powerElectronics: {
      dcDcConverter: boolean
      inverter: boolean
      efficiency: number // %
      powerRating: number // kW
    }
    gasProcessing: {
      humidifier: boolean
      reformer: boolean
      aftercooler: boolean
      waterSeparator: boolean
    }
  }
  
  // Control System
  controlSystem: {
    controllers: {
      thermal: {
        enabled: boolean
        setpoint: number // °C
        pidGains: { kp: number; ki: number; kd: number }
      }
      pressure: {
        enabled: boolean
        setpoint: number // bar
        pidGains: { kp: number; ki: number; kd: number }
      }
      humidity: {
        enabled: boolean
        setpoint: number // %RH
        pidGains: { kp: number; ki: number; kd: number }
      }
      flowControl: {
        enabled: boolean
        hydrogenFlow: number // slpm
        airFlow: number // slpm
      }
    }
    safety: {
      gasLeakDetection: boolean
      emergencyShutdown: boolean
      overtemperatureProtection: boolean
      undervoltageProtection: boolean
    }
  }
  
  // Performance Targets
  performanceTargets: {
    power: number // kW
    efficiency: number // %
    durability: number // hours
    startupTime: number // seconds
    dynamicResponse: number // %/s
  }
}

interface ComprehensiveFuelCellConfigProps {
  config: FuelCellConfig
  onConfigChange: (section: keyof FuelCellConfig, subsection: string, field: string, value: any) => void
  selectedComponent: string | null
}

export default function ComprehensiveFuelCellConfig({ 
  config, 
  onConfigChange, 
  selectedComponent 
}: ComprehensiveFuelCellConfigProps) {
  const [expandedSections, setExpandedSections] = useState({
    systemArchitecture: true,
    cellConfiguration: true,
    components: true,
    operatingConditions: false,
    balanceOfPlant: false,
    controlSystem: false,
    performanceTargets: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Material databases based on white paper specifications
  const materialOptions = {
    membranes: [
      { id: 'nafion-117', name: 'Nafion® 117', thickness: 175, conductivity: 0.083, cost: 'High' },
      { id: 'nafion-115', name: 'Nafion® 115', thickness: 125, conductivity: 0.091, cost: 'High' },
      { id: 'nafion-212', name: 'Nafion® 212', thickness: 50, conductivity: 0.095, cost: 'Very High' },
      { id: 'aquivion', name: 'Aquivion®', thickness: 83, conductivity: 0.089, cost: 'High' },
      { id: 'fumapem', name: 'Fumapem® F-950', thickness: 50, conductivity: 0.087, cost: 'Medium' },
      { id: 'speek', name: 'SPEEK', thickness: 100, conductivity: 0.045, cost: 'Low' }
    ],
    catalysts: {
      anode: [
        { id: 'pt-c-50', name: 'Pt/C 50%', activity: 1.0, cost: 'Very High', loading: 0.4 },
        { id: 'pt-c-40', name: 'Pt/C 40%', activity: 0.85, cost: 'High', loading: 0.5 },
        { id: 'pt-c-20', name: 'Pt/C 20%', activity: 0.7, cost: 'Medium', loading: 0.8 },
        { id: 'pt-ru', name: 'Pt-Ru/C', activity: 1.2, cost: 'Very High', loading: 0.6 },
        { id: 'pt-free', name: 'Pt-free Catalyst', activity: 0.3, cost: 'Low', loading: 1.0 }
      ],
      cathode: [
        { id: 'pt-c-50', name: 'Pt/C 50%', activity: 1.0, cost: 'Very High', loading: 0.4 },
        { id: 'pt-c-40', name: 'Pt/C 40%', activity: 0.85, cost: 'High', loading: 0.5 },
        { id: 'pt-alloy', name: 'Pt-Alloy/C', activity: 1.3, cost: 'Very High', loading: 0.3 },
        { id: 'pt-nanostructured', name: 'Pt Nanostructured', activity: 1.5, cost: 'Ultra High', loading: 0.2 },
        { id: 'non-pgm', name: 'Non-PGM', activity: 0.4, cost: 'Low', loading: 2.0 }
      ]
    },
    gdlMaterials: [
      { id: 'toray-tgp-h-060', name: 'Toray TGP-H-060', porosity: 78, thickness: 190, permeability: 1.2e-11 },
      { id: 'toray-tgp-h-090', name: 'Toray TGP-H-090', porosity: 80, thickness: 280, permeability: 1.8e-11 },
      { id: 'freudenberg-h23', name: 'Freudenberg H23', porosity: 83, thickness: 230, permeability: 2.1e-11 },
      { id: 'sigracet-35bc', name: 'SGL 35BC', porosity: 84, thickness: 300, permeability: 1.5e-11 },
      { id: 'avcarb-p50', name: 'AvCarb P50', porosity: 75, thickness: 200, permeability: 1.0e-11 }
    ],
    bipolarPlateMaterials: [
      { id: 'graphite', name: 'Graphite', conductivity: 100, cost: 'Medium', weight: 'Heavy' },
      { id: 'stainless-steel-316l', name: 'SS 316L', conductivity: 200, cost: 'Low', weight: 'Heavy' },
      { id: 'titanium', name: 'Titanium', conductivity: 150, cost: 'High', weight: 'Medium' },
      { id: 'aluminum', name: 'Aluminum', conductivity: 250, cost: 'Low', weight: 'Light' },
      { id: 'carbon-composite', name: 'Carbon Composite', conductivity: 80, cost: 'High', weight: 'Light' },
      { id: 'coated-steel', name: 'Coated Steel', conductivity: 180, cost: 'Medium', weight: 'Heavy' }
    ]
  }

  const flowPatterns = [
    { id: 'serpentine', name: 'Serpentine', description: 'Single channel path', pressure_drop: 'High', uniformity: 'Excellent' },
    { id: 'parallel', name: 'Parallel', description: 'Multiple parallel channels', pressure_drop: 'Low', uniformity: 'Good' },
    { id: 'interdigitated', name: 'Interdigitated', description: 'Forced convection', pressure_drop: 'Very High', uniformity: 'Excellent' },
    { id: 'pin-type', name: 'Pin Type', description: 'Pin array structure', pressure_drop: 'Medium', uniformity: 'Good' }
  ]

  const Section = ({ title, sectionKey, children }: { 
    title: string, 
    sectionKey: keyof typeof expandedSections, 
    children: React.ReactNode 
  }) => (
    <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-4 py-3 flex items-center justify-between text-left font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <span>{title}</span>
        {expandedSections[sectionKey] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <AnimatePresence>
        {expandedSections[sectionKey] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="space-y-4 max-h-full overflow-y-auto">
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Fuel Cell System Configuration
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Comprehensive system-level design parameters based on white paper specifications
        </p>
      </div>

      {/* System Architecture */}
      <Section title="🏗️ System Architecture" sectionKey="systemArchitecture">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stack Configuration
            </label>
            <select 
              value={config.systemArchitecture.stackConfiguration}
              onChange={(e) => onConfigChange('systemArchitecture', 'stackConfiguration', 'value', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="single">Single Stack</option>
              <option value="series">Series Connection</option>
              <option value="parallel">Parallel Connection</option>
              <option value="series-parallel">Series-Parallel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cells in Series: {config.systemArchitecture.cellsInSeries}
            </label>
            <input
              type="range"
              min="50"
              max="400"
              value={config.systemArchitecture.cellsInSeries}
              onChange={(e) => onConfigChange('systemArchitecture', 'cellsInSeries', 'value', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Power: {config.systemArchitecture.stackPower} kW
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={config.systemArchitecture.stackPower}
              onChange={(e) => onConfigChange('systemArchitecture', 'stackPower', 'value', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              System Voltage: {config.systemArchitecture.systemVoltage} V
            </label>
            <input
              type="range"
              min="12"
              max="800"
              value={config.systemArchitecture.systemVoltage}
              onChange={(e) => onConfigChange('systemArchitecture', 'systemVoltage', 'value', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </Section>

      {/* Cell Configuration */}
      <Section title="🔋 Cell Configuration" sectionKey="cellConfiguration">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cell Type
            </label>
            <select 
              value={config.cellConfiguration.cellType}
              onChange={(e) => onConfigChange('cellConfiguration', 'cellType', 'value', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="PEM">PEM (40-90°C)</option>
              <option value="SOFC">SOFC (600-1000°C)</option>
              <option value="PAFC">PAFC (150-220°C)</option>
              <option value="MCFC">MCFC (600-700°C)</option>
              <option value="AFC">AFC (60-120°C)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Active Area: {config.cellConfiguration.activeArea} cm²
            </label>
            <input
              type="range"
              min="25"
              max="500"
              value={config.cellConfiguration.activeArea}
              onChange={(e) => onConfigChange('cellConfiguration', 'activeArea', 'value', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Density: {config.cellConfiguration.currentDensity} A/cm²
            </label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={config.cellConfiguration.currentDensity}
              onChange={(e) => onConfigChange('cellConfiguration', 'currentDensity', 'value', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cell Voltage: {config.cellConfiguration.cellVoltage} V
            </label>
            <input
              type="range"
              min="0.3"
              max="1.2"
              step="0.01"
              value={config.cellConfiguration.cellVoltage}
              onChange={(e) => onConfigChange('cellConfiguration', 'cellVoltage', 'value', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </Section>

      {/* Component Materials */}
      <Section title="🧪 Component Materials" sectionKey="components">
        <div className="space-y-6">
          {/* Membrane */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Proton Exchange Membrane</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Membrane Material
                </label>
                <select 
                  value={config.components.membrane.material}
                  onChange={(e) => onConfigChange('components', 'membrane', 'material', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {materialOptions.membranes.map(mem => (
                    <option key={mem.id} value={mem.id}>
                      {mem.name} ({mem.thickness}μm, ${mem.cost} cost)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Water Content: {config.components.membrane.waterContent}
                </label>
                <input
                  type="range"
                  min="5"
                  max="22"
                  value={config.components.membrane.waterContent}
                  onChange={(e) => onConfigChange('components', 'membrane', 'waterContent', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Catalyst */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Catalyst Layers</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Anode Catalyst
                </label>
                <select 
                  value={config.components.catalyst.anodeMaterial}
                  onChange={(e) => onConfigChange('components', 'catalyst', 'anodeMaterial', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {materialOptions.catalysts.anode.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} (Activity: {cat.activity}x, ${cat.cost})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cathode Catalyst
                </label>
                <select 
                  value={config.components.catalyst.cathodeMaterial}
                  onChange={(e) => onConfigChange('components', 'catalyst', 'cathodeMaterial', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {materialOptions.catalysts.cathode.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} (Activity: {cat.activity}x, ${cat.cost})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Anode Loading: {config.components.catalyst.anodeLoading} mg/cm²
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={config.components.catalyst.anodeLoading}
                  onChange={(e) => onConfigChange('components', 'catalyst', 'anodeLoading', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cathode Loading: {config.components.catalyst.cathodeLoading} mg/cm²
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={config.components.catalyst.cathodeLoading}
                  onChange={(e) => onConfigChange('components', 'catalyst', 'cathodeLoading', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Gas Diffusion Layer */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Gas Diffusion Layers</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  GDL Material
                </label>
                <select 
                  value={config.components.gdl.material}
                  onChange={(e) => onConfigChange('components', 'gdl', 'material', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {materialOptions.gdlMaterials.map(gdl => (
                    <option key={gdl.id} value={gdl.id}>
                      {gdl.name} ({gdl.porosity}% porosity, {gdl.thickness}μm)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Compression: {config.components.gdl.compressibility}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={config.components.gdl.compressibility}
                  onChange={(e) => onConfigChange('components', 'gdl', 'compressibility', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Bipolar Plates */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Bipolar Plates</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plate Material
                </label>
                <select 
                  value={config.components.bipolarPlate.material}
                  onChange={(e) => onConfigChange('components', 'bipolarPlate', 'material', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {materialOptions.bipolarPlateMaterials.map(plate => (
                    <option key={plate.id} value={plate.id}>
                      {plate.name} ({plate.conductivity} S/cm, {plate.weight} weight)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Flow Pattern
                </label>
                <select 
                  value={config.components.bipolarPlate.flowPattern}
                  onChange={(e) => onConfigChange('components', 'bipolarPlate', 'flowPattern', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {flowPatterns.map(pattern => (
                    <option key={pattern.id} value={pattern.id}>
                      {pattern.name} ({pattern.pressure_drop} ΔP, {pattern.uniformity} uniformity)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Channel Width: {config.components.bipolarPlate.channelWidth} mm
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={config.components.bipolarPlate.channelWidth}
                  onChange={(e) => onConfigChange('components', 'bipolarPlate', 'channelWidth', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Channel Depth: {config.components.bipolarPlate.channelDepth} mm
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="2.0"
                  step="0.1"
                  value={config.components.bipolarPlate.channelDepth}
                  onChange={(e) => onConfigChange('components', 'bipolarPlate', 'channelDepth', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Operating Conditions */}
      <Section title="🌡️ Operating Conditions" sectionKey="operatingConditions">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Temperature: {config.operatingConditions.temperature}°C
              </label>
              <input
                type="range"
                min="40"
                max="90"
                value={config.operatingConditions.temperature}
                onChange={(e) => onConfigChange('operatingConditions', 'temperature', 'value', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cathode Pressure: {config.operatingConditions.pressure.cathode} bar
              </label>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={config.operatingConditions.pressure.cathode}
                onChange={(e) => onConfigChange('operatingConditions', 'pressure', 'cathode', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Gas Flow Control</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  H₂ Stoichiometry: {config.operatingConditions.flowRates.stoichiometry.hydrogen}
                </label>
                <input
                  type="range"
                  min="1.1"
                  max="3.0"
                  step="0.1"
                  value={config.operatingConditions.flowRates.stoichiometry.hydrogen}
                  onChange={(e) => onConfigChange('operatingConditions', 'flowRates', 'stoichiometry', { ...config.operatingConditions.flowRates.stoichiometry, hydrogen: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Air Stoichiometry: {config.operatingConditions.flowRates.stoichiometry.air}
                </label>
                <input
                  type="range"
                  min="1.5"
                  max="4.0"
                  step="0.1"
                  value={config.operatingConditions.flowRates.stoichiometry.air}
                  onChange={(e) => onConfigChange('operatingConditions', 'flowRates', 'stoichiometry', { ...config.operatingConditions.flowRates.stoichiometry, air: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Nitrogen Purging (White Paper Spec)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.operatingConditions.purging.enabled}
                  onChange={(e) => onConfigChange('operatingConditions', 'purging', 'enabled', e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">Enable Purging</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  N₂ Threshold: {config.operatingConditions.purging.nitrogenThreshold}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="15"
                  value={config.operatingConditions.purging.nitrogenThreshold}
                  onChange={(e) => onConfigChange('operatingConditions', 'purging', 'nitrogenThreshold', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purge Duration: {config.operatingConditions.purging.duration}s
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={config.operatingConditions.purging.duration}
                  onChange={(e) => onConfigChange('operatingConditions', 'purging', 'duration', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Balance of Plant */}
      <Section title="⚙️ Balance of Plant" sectionKey="balanceOfPlant">
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">700 bar Hydrogen Storage (White Paper)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Storage Type
                </label>
                <select 
                  value={config.balanceOfPlant.hydrogenStorage.type}
                  onChange={(e) => onConfigChange('balanceOfPlant', 'hydrogenStorage', 'type', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="700bar">700 bar Compressed (Automotive)</option>
                  <option value="350bar">350 bar Compressed (Stationary)</option>
                  <option value="liquid">Liquid Hydrogen (Cryogenic)</option>
                  <option value="metal-hydride">Metal Hydride (Low Pressure)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  H₂ Purity: {config.balanceOfPlant.hydrogenStorage.purityLevel}%
                </label>
                <input
                  type="range"
                  min="99.9"
                  max="99.999"
                  step="0.001"
                  value={config.balanceOfPlant.hydrogenStorage.purityLevel}
                  onChange={(e) => onConfigChange('balanceOfPlant', 'hydrogenStorage', 'purityLevel', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Thermal Management System</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Coolant Type
                </label>
                <select 
                  value={config.balanceOfPlant.thermalManagement.coolantType}
                  onChange={(e) => onConfigChange('balanceOfPlant', 'thermalManagement', 'coolantType', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="water">Deionized Water</option>
                  <option value="ethylene-glycol">Ethylene Glycol Mix</option>
                  <option value="air">Air Cooling</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Coolant Flow: {config.balanceOfPlant.thermalManagement.coolantFlow} L/min
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={config.balanceOfPlant.thermalManagement.coolantFlow}
                  onChange={(e) => onConfigChange('balanceOfPlant', 'thermalManagement', 'coolantFlow', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Power Electronics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.balanceOfPlant.powerElectronics.dcDcConverter}
                    onChange={(e) => onConfigChange('balanceOfPlant', 'powerElectronics', 'dcDcConverter', e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">DC-DC Converter</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.balanceOfPlant.powerElectronics.inverter}
                    onChange={(e) => onConfigChange('balanceOfPlant', 'powerElectronics', 'inverter', e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">Inverter</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PE Efficiency: {config.balanceOfPlant.powerElectronics.efficiency}%
                </label>
                <input
                  type="range"
                  min="85"
                  max="98"
                  value={config.balanceOfPlant.powerElectronics.efficiency}
                  onChange={(e) => onConfigChange('balanceOfPlant', 'powerElectronics', 'efficiency', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Control System */}
      <Section title="🎛️ Control System" sectionKey="controlSystem">
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">PID Controllers</h4>
            <div className="space-y-4">
              {['thermal', 'pressure', 'humidity'].map(controller => (
                <div key={controller} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{controller} Controller</span>
                    <input
                      type="checkbox"
                      checked={config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers].enabled}
                      onChange={(e) => onConfigChange('controlSystem', 'controllers', controller, { ...config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers], enabled: e.target.checked })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <label>Kp: {config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers].pidGains.kp}</label>
                      <input
                        type="range"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers].pidGains.kp}
                        onChange={(e) => onConfigChange('controlSystem', 'controllers', controller, { 
                          ...config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers], 
                          pidGains: { 
                            ...config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers].pidGains, 
                            kp: parseFloat(e.target.value) 
                          } 
                        })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label>Ki: {config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers].pidGains.ki}</label>
                      <input
                        type="range"
                        min="0.01"
                        max="1"
                        step="0.01"
                        value={config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers].pidGains.ki}
                        onChange={(e) => onConfigChange('controlSystem', 'controllers', controller, { 
                          ...config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers], 
                          pidGains: { 
                            ...config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers].pidGains, 
                            ki: parseFloat(e.target.value) 
                          } 
                        })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label>Kd: {config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers].pidGains.kd}</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers].pidGains.kd}
                        onChange={(e) => onConfigChange('controlSystem', 'controllers', controller, { 
                          ...config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers], 
                          pidGains: { 
                            ...config.controlSystem.controllers[controller as keyof typeof config.controlSystem.controllers].pidGains, 
                            kd: parseFloat(e.target.value) 
                          } 
                        })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Safety Systems</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(config.controlSystem.safety).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => onConfigChange('controlSystem', 'safety', key, e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Performance Targets */}
      <Section title="🎯 Performance Targets" sectionKey="performanceTargets">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Power: {config.performanceTargets.power} kW
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={config.performanceTargets.power}
              onChange={(e) => onConfigChange('performanceTargets', 'power', 'value', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Efficiency: {config.performanceTargets.efficiency}%
            </label>
            <input
              type="range"
              min="40"
              max="70"
              value={config.performanceTargets.efficiency}
              onChange={(e) => onConfigChange('performanceTargets', 'efficiency', 'value', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durability Target: {config.performanceTargets.durability} hours
            </label>
            <input
              type="range"
              min="5000"
              max="80000"
              step="1000"
              value={config.performanceTargets.durability}
              onChange={(e) => onConfigChange('performanceTargets', 'durability', 'value', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Startup Time: {config.performanceTargets.startupTime} seconds
            </label>
            <input
              type="range"
              min="10"
              max="300"
              value={config.performanceTargets.startupTime}
              onChange={(e) => onConfigChange('performanceTargets', 'startupTime', 'value', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </Section>
    </div>
  )
}