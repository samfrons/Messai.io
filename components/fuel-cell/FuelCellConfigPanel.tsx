'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FuelCellType, ModelFidelity } from '@/lib/types/fuel-cell-types'
import { type FuelCellPredictionInput, type FuelCellPredictionResult } from '@/lib/fuel-cell-predictions'

// ============================================================================
// FUEL CELL CONFIGURATION INTERFACES
// ============================================================================

interface FuelCellConfig {
  // System Configuration
  fuelCellType: FuelCellType
  cellCount: number
  activeArea: number // cm²
  
  // Operating Conditions
  operatingTemperature: number // °C
  operatingPressure: number // bar
  humidity: number // %
  
  // Gas Flows
  fuelFlowRate: number // L/min
  airFlowRate: number // L/min
  
  // Materials
  anodeCatalyst?: string
  cathodeCatalyst?: string
  membraneType?: string
  
  // Model Settings
  modelFidelity: ModelFidelity
  
  // Advanced Options
  stackVoltage?: number
  currentDensity?: number
}

interface FuelCellConfigPanelProps {
  initialConfig?: Partial<FuelCellConfig>
  onConfigChange?: (config: FuelCellConfig) => void
  onPredictionRequest?: (config: FuelCellConfig) => void
  prediction?: FuelCellPredictionResult | null
  isCalculating?: boolean
  className?: string
}

// ============================================================================
// FUEL CELL MATERIALS DATABASE
// ============================================================================

const FUEL_CELL_MATERIALS = {
  anodeCatalysts: [
    { id: 'pt-c', name: 'Pt/C', activity: 1.0, cost: 100, description: 'Standard platinum catalyst' },
    { id: 'pt-alloy', name: 'Pt-alloy', activity: 1.15, cost: 80, description: 'Enhanced platinum alloy' },
    { id: 'non-pgm', name: 'Non-PGM', activity: 0.7, cost: 20, description: 'Non-precious metal catalyst' },
    { id: 'ni-based', name: 'Ni-based', activity: 0.6, cost: 10, description: 'Nickel-based catalyst' }
  ],
  cathodeCatalysts: [
    { id: 'pt-c', name: 'Pt/C', activity: 1.0, cost: 150, description: 'Standard platinum catalyst' },
    { id: 'pt-alloy', name: 'Pt-alloy', activity: 1.2, cost: 120, description: 'Enhanced platinum alloy' },
    { id: 'non-pgm', name: 'Non-PGM', activity: 0.6, cost: 25, description: 'Non-precious metal catalyst' },
    { id: 'ni-based', name: 'Ni-based', activity: 0.5, cost: 12, description: 'Nickel-based catalyst' }
  ],
  membranes: [
    { id: 'nafion', name: 'Nafion', conductivity: 1.0, cost: 50, description: 'Industry standard PFSA membrane' },
    { id: 'pfsa', name: 'PFSA', conductivity: 0.9, cost: 40, description: 'Perfluorosulfonic acid membrane' },
    { id: 'hydrocarbon', name: 'Hydrocarbon', conductivity: 0.8, cost: 30, description: 'Hydrocarbon-based membrane' },
    { id: 'ceramic', name: 'Ceramic', conductivity: 1.2, cost: 60, description: 'High-temperature ceramic electrolyte' }
  ]
}

const FUEL_CELL_DEFAULTS: Record<FuelCellType, Partial<FuelCellConfig>> = {
  PEM: {
    operatingTemperature: 80,
    operatingPressure: 2.5,
    humidity: 100,
    anodeCatalyst: 'pt-c',
    cathodeCatalyst: 'pt-c',
    membraneType: 'nafion'
  },
  SOFC: {
    operatingTemperature: 750,
    operatingPressure: 1.5,
    humidity: 0,
    anodeCatalyst: 'ni-based',
    cathodeCatalyst: 'ni-based',
    membraneType: 'ceramic'
  },
  PAFC: {
    operatingTemperature: 200,
    operatingPressure: 3.0,
    humidity: 85,
    anodeCatalyst: 'pt-c',
    cathodeCatalyst: 'pt-c',
    membraneType: 'pfsa'
  },
  MCFC: {
    operatingTemperature: 650,
    operatingPressure: 2.0,
    humidity: 0,
    anodeCatalyst: 'ni-based',
    cathodeCatalyst: 'ni-based',
    membraneType: 'ceramic'
  },
  AFC: {
    operatingTemperature: 70,
    operatingPressure: 2.0,
    humidity: 95,
    anodeCatalyst: 'non-pgm',
    cathodeCatalyst: 'non-pgm',
    membraneType: 'hydrocarbon'
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FuelCellConfigPanel({
  initialConfig,
  onConfigChange,
  onPredictionRequest,
  prediction,
  isCalculating = false,
  className = ''
}: FuelCellConfigPanelProps) {
  const [config, setConfig] = useState<FuelCellConfig>({
    fuelCellType: 'PEM',
    cellCount: 50,
    activeArea: 100,
    operatingTemperature: 80,
    operatingPressure: 2.5,
    humidity: 100,
    fuelFlowRate: 5.0,
    airFlowRate: 25.0,
    anodeCatalyst: 'pt-c',
    cathodeCatalyst: 'pt-c',
    membraneType: 'nafion',
    modelFidelity: 'BASIC',
    ...initialConfig
  })

  const [expandedSections, setExpandedSections] = useState({
    system: true,
    operating: true,
    materials: false,
    advanced: false
  })

  // Update config when fuel cell type changes
  useEffect(() => {
    const defaults = FUEL_CELL_DEFAULTS[config.fuelCellType]
    setConfig(prev => ({ ...prev, ...defaults }))
  }, [config.fuelCellType])

  // Notify parent of config changes
  useEffect(() => {
    onConfigChange?.(config)
  }, [config, onConfigChange])

  const updateConfig = useCallback((updates: Partial<FuelCellConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }, [])

  const handlePredictionRequest = useCallback(() => {
    onPredictionRequest?.(config)
  }, [config, onPredictionRequest])

  const getConstraints = (fuelCellType: FuelCellType) => {
    const constraints = {
      PEM: { tempMin: 40, tempMax: 90, pressureMax: 10, humidityMin: 50 },
      SOFC: { tempMin: 600, tempMax: 1000, pressureMax: 20, humidityMin: 0 },
      PAFC: { tempMin: 150, tempMax: 220, pressureMax: 8, humidityMin: 60 },
      MCFC: { tempMin: 600, tempMax: 700, pressureMax: 15, humidityMin: 0 },
      AFC: { tempMin: 50, tempMax: 90, pressureMax: 6, humidityMin: 80 }
    }
    return constraints[fuelCellType]
  }

  const constraints = getConstraints(config.fuelCellType)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Fuel Cell Configuration
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Model Fidelity:</span>
          <select
            value={config.modelFidelity}
            onChange={(e) => updateConfig({ modelFidelity: e.target.value as ModelFidelity })}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="BASIC">Basic</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      {/* System Configuration */}
      <ConfigSection
        title="System Configuration"
        icon="⚙️"
        expanded={expandedSections.system}
        onToggle={() => toggleSection('system')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fuel Cell Type
            </label>
            <select
              value={config.fuelCellType}
              onChange={(e) => updateConfig({ fuelCellType: e.target.value as FuelCellType })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="PEM">PEM - Proton Exchange Membrane</option>
              <option value="SOFC">SOFC - Solid Oxide Fuel Cell</option>
              <option value="PAFC">PAFC - Phosphoric Acid Fuel Cell</option>
              <option value="MCFC">MCFC - Molten Carbonate Fuel Cell</option>
              <option value="AFC">AFC - Alkaline Fuel Cell</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cell Count
            </label>
            <input
              type="number"
              value={config.cellCount}
              onChange={(e) => updateConfig({ cellCount: parseInt(e.target.value) || 1 })}
              min="1"
              max="1000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Active Area (cm²)
            </label>
            <input
              type="number"
              value={config.activeArea}
              onChange={(e) => updateConfig({ activeArea: parseFloat(e.target.value) || 0.1 })}
              min="0.1"
              max="10000"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </ConfigSection>

      {/* Operating Conditions */}
      <ConfigSection
        title="Operating Conditions"
        icon="🌡️"
        expanded={expandedSections.operating}
        onToggle={() => toggleSection('operating')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Temperature (°C)
              <span className="text-xs text-gray-500 ml-1">
                [{constraints.tempMin}-{constraints.tempMax}°C]
              </span>
            </label>
            <input
              type="number"
              value={config.operatingTemperature}
              onChange={(e) => updateConfig({ operatingTemperature: parseFloat(e.target.value) || constraints.tempMin })}
              min={constraints.tempMin}
              max={constraints.tempMax}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pressure (bar)
              <span className="text-xs text-gray-500 ml-1">
                [1-{constraints.pressureMax} bar]
              </span>
            </label>
            <input
              type="number"
              value={config.operatingPressure}
              onChange={(e) => updateConfig({ operatingPressure: parseFloat(e.target.value) || 1 })}
              min="1"
              max={constraints.pressureMax}
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Humidity (%)
              <span className="text-xs text-gray-500 ml-1">
                [{constraints.humidityMin}-100%]
              </span>
            </label>
            <input
              type="number"
              value={config.humidity}
              onChange={(e) => updateConfig({ humidity: parseFloat(e.target.value) || constraints.humidityMin })}
              min={constraints.humidityMin}
              max="100"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fuel Flow Rate (L/min)
            </label>
            <input
              type="number"
              value={config.fuelFlowRate}
              onChange={(e) => updateConfig({ fuelFlowRate: parseFloat(e.target.value) || 0.01 })}
              min="0.01"
              max="1000"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Air Flow Rate (L/min)
            </label>
            <input
              type="number"
              value={config.airFlowRate}
              onChange={(e) => updateConfig({ airFlowRate: parseFloat(e.target.value) || 0.01 })}
              min="0.01"
              max="10000"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </ConfigSection>

      {/* Materials Selection */}
      <ConfigSection
        title="Materials Selection"
        icon="🧪"
        expanded={expandedSections.materials}
        onToggle={() => toggleSection('materials')}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MaterialSelector
            label="Anode Catalyst"
            value={config.anodeCatalyst || ''}
            onChange={(value) => updateConfig({ anodeCatalyst: value })}
            materials={FUEL_CELL_MATERIALS.anodeCatalysts}
          />

          <MaterialSelector
            label="Cathode Catalyst"
            value={config.cathodeCatalyst || ''}
            onChange={(value) => updateConfig({ cathodeCatalyst: value })}
            materials={FUEL_CELL_MATERIALS.cathodeCatalysts}
          />

          <MaterialSelector
            label="Membrane Type"
            value={config.membraneType || ''}
            onChange={(value) => updateConfig({ membraneType: value })}
            materials={FUEL_CELL_MATERIALS.membranes}
          />
        </div>
      </ConfigSection>

      {/* Prediction Button */}
      <div className="flex justify-center">
        <button
          onClick={handlePredictionRequest}
          disabled={isCalculating}
          className="px-8 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
        >
          {isCalculating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <span>🔬</span>
              Calculate Performance
            </>
          )}
        </button>
      </div>

      {/* Prediction Results */}
      <AnimatePresence>
        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Performance Prediction Results
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-white dark:bg-gray-700 rounded">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {prediction.predictedPower.toFixed(1)}W
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Power Output</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-700 rounded">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {prediction.efficiency.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Efficiency</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-700 rounded">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {prediction.voltage.toFixed(1)}V
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Stack Voltage</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-700 rounded">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {prediction.current.toFixed(1)}A
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Current</div>
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Model: {prediction.modelInfo.fidelity} | 
              Execution Time: {prediction.modelInfo.executionTime}ms |
              Confidence: {prediction.confidenceInterval.lower.toFixed(1)} - {prediction.confidenceInterval.upper.toFixed(1)}W
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ConfigSectionProps {
  title: string
  icon: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function ConfigSection({ title, icon, expanded, onToggle, children }: ConfigSectionProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-gray-900">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface MaterialSelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
  materials: Array<{ id: string; name: string; activity?: number; conductivity?: number; cost: number; description: string }>
}

function MaterialSelector({ label, value, onChange, materials }: MaterialSelectorProps) {
  const selectedMaterial = materials.find(m => m.id === value)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-2"
      >
        <option value="">Select {label}</option>
        {materials.map(material => (
          <option key={material.id} value={material.id}>
            {material.name} (${material.cost}/m²)
          </option>
        ))}
      </select>
      
      {selectedMaterial && (
        <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="font-medium">{selectedMaterial.name}</div>
          <div>{selectedMaterial.description}</div>
          {selectedMaterial.activity && (
            <div>Activity: {selectedMaterial.activity}x</div>
          )}
          {selectedMaterial.conductivity && (
            <div>Conductivity: {selectedMaterial.conductivity}x</div>
          )}
          <div>Cost: ${selectedMaterial.cost}/m²</div>
        </div>
      )}
    </div>
  )
}