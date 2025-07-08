'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { FuelCellType } from '@/lib/types/fuel-cell-types'

interface Section {
  id: string
  title: string
  icon: string
}

const sections: Section[] = [
  { id: 'type', title: 'Fuel Cell Type', icon: '⚡' },
  { id: 'system', title: 'System Configuration', icon: '⚙️' },
  { id: 'operating', title: 'Operating Conditions', icon: '🌡️' },
  { id: 'flow', title: 'Flow Rates', icon: '💨' },
  { id: 'materials', title: 'Materials', icon: '🧪' },
]

interface FuelCellConfigPanelMobileProps {
  config: any
  onConfigChange: (config: any) => void
  onPredictionRequest: (config: any) => void
  prediction?: any
  isCalculating?: boolean
  className?: string
}

export default function FuelCellConfigPanelMobile({
  config,
  onConfigChange,
  onPredictionRequest,
  prediction,
  isCalculating = false,
  className = ''
}: FuelCellConfigPanelMobileProps) {
  const [expandedSection, setExpandedSection] = useState<string>('type')

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? '' : sectionId)
  }

  return (
    <div className={`bg-white dark:bg-gray-800 ${className}`}>
      {/* Accordion Sections */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{section.icon}</span>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {section.title}
                </h3>
              </div>
              {expandedSection === section.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    {section.id === 'type' && (
                      <FuelCellTypeSection
                        value={config.fuelCellType}
                        onChange={(type) => onConfigChange({ ...config, fuelCellType: type })}
                      />
                    )}
                    {section.id === 'system' && (
                      <SystemConfigSection
                        config={config}
                        onChange={onConfigChange}
                      />
                    )}
                    {section.id === 'operating' && (
                      <OperatingConditionsSection
                        config={config}
                        onChange={onConfigChange}
                      />
                    )}
                    {section.id === 'flow' && (
                      <FlowRatesSection
                        config={config}
                        onChange={onConfigChange}
                      />
                    )}
                    {section.id === 'materials' && (
                      <MaterialsSection
                        config={config}
                        onChange={onConfigChange}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Prediction Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onPredictionRequest(config)}
          disabled={isCalculating}
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isCalculating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calculating...
            </span>
          ) : (
            'Get Predictions'
          )}
        </button>
      </div>

      {/* Prediction Results */}
      {prediction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800"
        >
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
            Prediction Results
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-blue-700 dark:text-blue-300">Power</div>
              <div className="font-semibold text-blue-900 dark:text-blue-100">
                {prediction.predictedPower.toFixed(1)} W
              </div>
            </div>
            <div>
              <div className="text-blue-700 dark:text-blue-300">Efficiency</div>
              <div className="font-semibold text-blue-900 dark:text-blue-100">
                {prediction.efficiency.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-blue-700 dark:text-blue-300">Voltage</div>
              <div className="font-semibold text-blue-900 dark:text-blue-100">
                {prediction.voltage.toFixed(2)} V
              </div>
            </div>
            <div>
              <div className="text-blue-700 dark:text-blue-300">Current</div>
              <div className="font-semibold text-blue-900 dark:text-blue-100">
                {prediction.current.toFixed(1)} A
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Section Components
function FuelCellTypeSection({ value, onChange }: { value: FuelCellType; onChange: (type: FuelCellType) => void }) {
  const types = [
    { value: 'PEM', label: 'PEM', description: 'Proton Exchange Membrane' },
    { value: 'SOFC', label: 'SOFC', description: 'Solid Oxide' },
    { value: 'PAFC', label: 'PAFC', description: 'Phosphoric Acid' },
    { value: 'MCFC', label: 'MCFC', description: 'Molten Carbonate' },
    { value: 'AFC', label: 'AFC', description: 'Alkaline' }
  ]

  return (
    <div className="space-y-2">
      {types.map((type) => (
        <button
          key={type.value}
          onClick={() => onChange(type.value as FuelCellType)}
          className={`w-full p-3 rounded-lg border transition-colors text-left ${
            value === type.value
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="font-medium text-gray-900 dark:text-gray-100">{type.label}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{type.description}</div>
        </button>
      ))}
    </div>
  )
}

function SystemConfigSection({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cell Count
        </label>
        <input
          type="range"
          min="1"
          max="200"
          value={config.cellCount || 50}
          onChange={(e) => onChange({ ...config, cellCount: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
          {config.cellCount || 50} cells
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Active Area (cm²)
        </label>
        <input
          type="range"
          min="10"
          max="500"
          value={config.activeArea || 100}
          onChange={(e) => onChange({ ...config, activeArea: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
          {config.activeArea || 100} cm²
        </div>
      </div>
    </div>
  )
}

function OperatingConditionsSection({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Temperature (°C)
        </label>
        <input
          type="number"
          value={config.operatingTemperature || 80}
          onChange={(e) => onChange({ ...config, operatingTemperature: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Pressure (bar)
        </label>
        <input
          type="number"
          step="0.1"
          value={config.operatingPressure || 2.5}
          onChange={(e) => onChange({ ...config, operatingPressure: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
        />
      </div>

      {(config.fuelCellType === 'PEM' || config.fuelCellType === 'PAFC' || config.fuelCellType === 'AFC') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Humidity (%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={config.humidity || 100}
            onChange={(e) => onChange({ ...config, humidity: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
            {config.humidity || 100}%
          </div>
        </div>
      )}
    </div>
  )
}

function FlowRatesSection({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Fuel Flow Rate (L/min)
        </label>
        <input
          type="number"
          step="0.1"
          value={config.fuelFlowRate || 5}
          onChange={(e) => onChange({ ...config, fuelFlowRate: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Air Flow Rate (L/min)
        </label>
        <input
          type="number"
          step="0.1"
          value={config.airFlowRate || 25}
          onChange={(e) => onChange({ ...config, airFlowRate: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
        />
      </div>
    </div>
  )
}

function MaterialsSection({ config, onChange }: { config: any; onChange: (config: any) => void }) {
  const catalysts = {
    PEM: ['pt-c', 'pt-alloy', 'non-pgm'],
    SOFC: ['ni-based', 'lscf', 'lsm'],
    PAFC: ['pt-c'],
    MCFC: ['ni-based'],
    AFC: ['non-pgm', 'silver']
  }

  const membranes = {
    PEM: ['nafion', 'pfsa', 'hydrocarbon'],
    SOFC: ['ysz', 'gdc', 'lsgm'],
    PAFC: ['sic-matrix'],
    MCFC: ['alkali-carbonate'],
    AFC: ['asbestos-free']
  }

  const availableCatalysts = catalysts[config.fuelCellType as keyof typeof catalysts] || []
  const availableMembranes = membranes[config.fuelCellType as keyof typeof membranes] || []

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Anode Catalyst
        </label>
        <select
          value={config.anodeCatalyst || availableCatalysts[0]}
          onChange={(e) => onChange({ ...config, anodeCatalyst: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
        >
          {availableCatalysts.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Membrane Type
        </label>
        <select
          value={config.membraneType || availableMembranes[0]}
          onChange={(e) => onChange({ ...config, membraneType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
        >
          {availableMembranes.map(mem => (
            <option key={mem} value={mem}>{mem}</option>
          ))}
        </select>
      </div>
    </div>
  )
}