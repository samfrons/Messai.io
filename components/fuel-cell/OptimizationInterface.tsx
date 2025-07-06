'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FuelCellType } from '@/lib/types/fuel-cell-types'
import { 
  OptimizationObjective, 
  OptimizationConstraints, 
  OptimizationParameters,
  OptimizationResult 
} from '@/lib/fuel-cell-optimization'

// ============================================================================
// INTERFACES
// ============================================================================

interface OptimizationInterfaceProps {
  fuelCellType: FuelCellType
  onOptimizationStart?: (config: OptimizationConfig) => void
  optimizationResult?: OptimizationResult | null
  isOptimizing?: boolean
  className?: string
}

interface OptimizationConfig {
  objective: OptimizationObjective
  constraints: OptimizationConstraints
  parameters: OptimizationParameters
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

const DEFAULT_CONSTRAINTS: Record<FuelCellType, OptimizationConstraints> = {
  PEM: {
    cellCount: { min: 10, max: 200 },
    activeArea: { min: 10, max: 500 },
    temperature: { min: 40, max: 90 },
    pressure: { min: 1, max: 10 },
    humidity: { min: 50, max: 100 },
    fuelFlowRate: { min: 0.1, max: 50 },
    airFlowRate: { min: 1, max: 500 },
    availableMaterials: {
      anodeCatalysts: ['pt-c', 'pt-alloy', 'non-pgm'],
      cathodeCatalysts: ['pt-c', 'pt-alloy', 'non-pgm'],
      membraneTypes: ['nafion', 'pfsa', 'hydrocarbon']
    }
  },
  SOFC: {
    cellCount: { min: 5, max: 100 },
    activeArea: { min: 50, max: 1000 },
    temperature: { min: 600, max: 1000 },
    pressure: { min: 1, max: 20 },
    fuelFlowRate: { min: 0.5, max: 100 },
    airFlowRate: { min: 5, max: 1000 },
    availableMaterials: {
      anodeCatalysts: ['ni-based'],
      cathodeCatalysts: ['ni-based'],
      membraneTypes: ['ceramic']
    }
  },
  PAFC: {
    cellCount: { min: 20, max: 150 },
    activeArea: { min: 50, max: 600 },
    temperature: { min: 150, max: 220 },
    pressure: { min: 1, max: 8 },
    humidity: { min: 60, max: 95 },
    fuelFlowRate: { min: 0.5, max: 60 },
    airFlowRate: { min: 2, max: 600 },
    availableMaterials: {
      anodeCatalysts: ['pt-c'],
      cathodeCatalysts: ['pt-c'],
      membraneTypes: ['pfsa']
    }
  },
  MCFC: {
    cellCount: { min: 10, max: 80 },
    activeArea: { min: 100, max: 1200 },
    temperature: { min: 600, max: 700 },
    pressure: { min: 1, max: 15 },
    fuelFlowRate: { min: 1, max: 150 },
    airFlowRate: { min: 10, max: 1500 },
    availableMaterials: {
      anodeCatalysts: ['ni-based'],
      cathodeCatalysts: ['ni-based'],
      membraneTypes: ['ceramic']
    }
  },
  AFC: {
    cellCount: { min: 15, max: 120 },
    activeArea: { min: 20, max: 400 },
    temperature: { min: 50, max: 90 },
    pressure: { min: 1, max: 6 },
    humidity: { min: 80, max: 100 },
    fuelFlowRate: { min: 0.2, max: 40 },
    airFlowRate: { min: 1, max: 400 },
    availableMaterials: {
      anodeCatalysts: ['non-pgm'],
      cathodeCatalysts: ['non-pgm'],
      membraneTypes: ['hydrocarbon']
    }
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OptimizationInterface({
  fuelCellType,
  onOptimizationStart,
  optimizationResult,
  isOptimizing = false,
  className = ''
}: OptimizationInterfaceProps) {
  const [config, setConfig] = useState<OptimizationConfig>({
    objective: {
      type: 'MAXIMIZE_POWER',
      weights: { power: 1, efficiency: 0, cost: 0, durability: 0 },
      targets: {}
    },
    constraints: DEFAULT_CONSTRAINTS[fuelCellType],
    parameters: {
      algorithm: 'GENETIC_ALGORITHM',
      maxIterations: 100,
      convergenceTolerance: 0.001,
      populationSize: 50
    }
  })

  const [activeTab, setActiveTab] = useState<'objective' | 'constraints' | 'algorithm' | 'results'>('objective')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleObjectiveChange = useCallback((updates: Partial<OptimizationObjective>) => {
    setConfig(prev => ({
      ...prev,
      objective: { ...prev.objective, ...updates }
    }))
  }, [])

  const handleConstraintsChange = useCallback((updates: Partial<OptimizationConstraints>) => {
    setConfig(prev => ({
      ...prev,
      constraints: { ...prev.constraints, ...updates }
    }))
  }, [])

  const handleParametersChange = useCallback((updates: Partial<OptimizationParameters>) => {
    setConfig(prev => ({
      ...prev,
      parameters: { ...prev.parameters, ...updates }
    }))
  }, [])

  const handleStartOptimization = useCallback(() => {
    onOptimizationStart?.(config)
  }, [config, onOptimizationStart])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Fuel Cell System Optimization
        </h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            showAdvanced 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'objective', label: 'Objective', icon: '🎯' },
            { id: 'constraints', label: 'Constraints', icon: '🔒' },
            { id: 'algorithm', label: 'Algorithm', icon: '🧮' },
            { id: 'results', label: 'Results', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              disabled={tab.id === 'results' && !optimizationResult}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'objective' && (
            <ObjectiveConfiguration
              objective={config.objective}
              onChange={handleObjectiveChange}
              showAdvanced={showAdvanced}
            />
          )}

          {activeTab === 'constraints' && (
            <ConstraintsConfiguration
              constraints={config.constraints}
              onChange={handleConstraintsChange}
              fuelCellType={fuelCellType}
              showAdvanced={showAdvanced}
            />
          )}

          {activeTab === 'algorithm' && (
            <AlgorithmConfiguration
              parameters={config.parameters}
              onChange={handleParametersChange}
              showAdvanced={showAdvanced}
            />
          )}

          {activeTab === 'results' && optimizationResult && (
            <OptimizationResults
              result={optimizationResult}
              fuelCellType={fuelCellType}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      {activeTab !== 'results' && (
        <div className="flex justify-center gap-4">
          <button
            onClick={handleStartOptimization}
            disabled={isOptimizing}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {isOptimizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <span>🚀</span>
                Start Optimization
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// OBJECTIVE CONFIGURATION
// ============================================================================

interface ObjectiveConfigurationProps {
  objective: OptimizationObjective
  onChange: (updates: Partial<OptimizationObjective>) => void
  showAdvanced: boolean
}

function ObjectiveConfiguration({ objective, onChange, showAdvanced }: ObjectiveConfigurationProps) {
  return (
    <div className="space-y-6">
      {/* Objective Type Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Optimization Objective
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { type: 'MAXIMIZE_POWER', label: 'Maximize Power', icon: '⚡', description: 'Optimize for maximum power output' },
            { type: 'MAXIMIZE_EFFICIENCY', label: 'Maximize Efficiency', icon: '📈', description: 'Optimize for highest efficiency' },
            { type: 'MINIMIZE_COST', label: 'Minimize Cost', icon: '💰', description: 'Optimize for lowest system cost' },
            { type: 'MAXIMIZE_DURABILITY', label: 'Maximize Durability', icon: '🛡️', description: 'Optimize for longest lifetime' },
            { type: 'MULTI_OBJECTIVE', label: 'Multi-Objective', icon: '🎯', description: 'Balance multiple objectives' }
          ].map(obj => (
            <button
              key={obj.type}
              onClick={() => onChange({ type: obj.type as any })}
              className={`p-4 border rounded-lg text-left transition-colors ${
                objective.type === obj.type
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{obj.icon}</span>
                <div className="font-medium text-gray-900 dark:text-gray-100">{obj.label}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{obj.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Objective Weights */}
      {objective.type === 'MULTI_OBJECTIVE' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Objective Weights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { param: 'power', label: 'Power', icon: '⚡' },
              { param: 'efficiency', label: 'Efficiency', icon: '📈' },
              { param: 'cost', label: 'Cost', icon: '💰' },
              { param: 'durability', label: 'Durability', icon: '🛡️' }
            ].map(item => (
              <div key={item.param}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="mr-2">{item.icon}</span>
                  {item.label} Weight
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={objective.weights?.[item.param as keyof typeof objective.weights] || 0}
                  onChange={(e) => onChange({
                    weights: {
                      ...objective.weights,
                      [item.param]: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center mt-1">
                  {objective.weights?.[item.param as keyof typeof objective.weights] || 0}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Target Constraints */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Target Constraints</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Power (W)
              </label>
              <input
                type="number"
                value={objective.targets?.minPower || ''}
                onChange={(e) => onChange({
                  targets: {
                    ...objective.targets,
                    minPower: e.target.value ? parseFloat(e.target.value) : undefined
                  }
                })}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Efficiency (%)
              </label>
              <input
                type="number"
                value={objective.targets?.minEfficiency || ''}
                onChange={(e) => onChange({
                  targets: {
                    ...objective.targets,
                    minEfficiency: e.target.value ? parseFloat(e.target.value) : undefined
                  }
                })}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ============================================================================
// CONSTRAINTS CONFIGURATION
// ============================================================================

interface ConstraintsConfigurationProps {
  constraints: OptimizationConstraints
  onChange: (updates: Partial<OptimizationConstraints>) => void
  fuelCellType: FuelCellType
  showAdvanced: boolean
}

function ConstraintsConfiguration({ constraints, onChange, fuelCellType, showAdvanced }: ConstraintsConfigurationProps) {
  return (
    <div className="space-y-6">
      {/* System Constraints */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          System Constraints
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConstraintRange
            label="Cell Count"
            min={constraints.cellCount.min}
            max={constraints.cellCount.max}
            onMinChange={(min) => onChange({ cellCount: { ...constraints.cellCount, min } })}
            onMaxChange={(max) => onChange({ cellCount: { ...constraints.cellCount, max } })}
            step={1}
          />
          <ConstraintRange
            label="Active Area (cm²)"
            min={constraints.activeArea.min}
            max={constraints.activeArea.max}
            onMinChange={(min) => onChange({ activeArea: { ...constraints.activeArea, min } })}
            onMaxChange={(max) => onChange({ activeArea: { ...constraints.activeArea, max } })}
            step={1}
          />
        </div>
      </div>

      {/* Operating Constraints */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Operating Constraints
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConstraintRange
            label="Temperature (°C)"
            min={constraints.temperature.min}
            max={constraints.temperature.max}
            onMinChange={(min) => onChange({ temperature: { ...constraints.temperature, min } })}
            onMaxChange={(max) => onChange({ temperature: { ...constraints.temperature, max } })}
            step={1}
          />
          <ConstraintRange
            label="Pressure (bar)"
            min={constraints.pressure.min}
            max={constraints.pressure.max}
            onMinChange={(min) => onChange({ pressure: { ...constraints.pressure, min } })}
            onMaxChange={(max) => onChange({ pressure: { ...constraints.pressure, max } })}
            step={0.1}
          />
          {(fuelCellType === 'PEM' || fuelCellType === 'PAFC' || fuelCellType === 'AFC') && (
            <ConstraintRange
              label="Humidity (%)"
              min={constraints.humidity?.min || 0}
              max={constraints.humidity?.max || 100}
              onMinChange={(min) => onChange({ humidity: { min, max: constraints.humidity?.max || 100 } })}
              onMaxChange={(max) => onChange({ humidity: { min: constraints.humidity?.min || 0, max } })}
              step={1}
            />
          )}
        </div>
      </div>

      {/* Material Constraints */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Material Constraints
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Select available materials for optimization
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Material selection checkboxes would go here */}
          </div>
        </motion.div>
      )}
    </div>
  )
}

interface ConstraintRangeProps {
  label: string
  min: number
  max: number
  onMinChange: (value: number) => void
  onMaxChange: (value: number) => void
  step?: number
}

function ConstraintRange({ label, min, max, onMinChange, onMaxChange, step = 1 }: ConstraintRangeProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={min}
          onChange={(e) => onMinChange(parseFloat(e.target.value) || 0)}
          step={step}
          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
        />
        <span className="text-gray-500">to</span>
        <input
          type="number"
          value={max}
          onChange={(e) => onMaxChange(parseFloat(e.target.value) || 0)}
          step={step}
          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
        />
      </div>
    </div>
  )
}

// ============================================================================
// ALGORITHM CONFIGURATION
// ============================================================================

interface AlgorithmConfigurationProps {
  parameters: OptimizationParameters
  onChange: (updates: Partial<OptimizationParameters>) => void
  showAdvanced: boolean
}

function AlgorithmConfiguration({ parameters, onChange, showAdvanced }: AlgorithmConfigurationProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Optimization Algorithm
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: 'GENETIC_ALGORITHM', label: 'Genetic Algorithm', icon: '🧬', description: 'Good for complex search spaces' },
            { id: 'GRADIENT_DESCENT', label: 'Gradient Descent', icon: '📉', description: 'Fast for smooth objectives' },
            { id: 'BAYESIAN', label: 'Bayesian Optimization', icon: '🎲', description: 'Efficient with expensive evaluations' },
            { id: 'PARTICLE_SWARM', label: 'Particle Swarm', icon: '🐝', description: 'Good for non-convex problems' },
            { id: 'SIMULATED_ANNEALING', label: 'Simulated Annealing', icon: '🔥', description: 'Escapes local optima' }
          ].map(alg => (
            <button
              key={alg.id}
              onClick={() => onChange({ algorithm: alg.id as any })}
              className={`p-4 border rounded-lg text-left transition-colors ${
                parameters.algorithm === alg.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{alg.icon}</span>
                <div className="font-medium text-gray-900 dark:text-gray-100">{alg.label}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{alg.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Common Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Maximum Iterations
          </label>
          <input
            type="number"
            value={parameters.maxIterations}
            onChange={(e) => onChange({ maxIterations: parseInt(e.target.value) || 100 })}
            min="10"
            max="1000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Convergence Tolerance
          </label>
          <input
            type="number"
            value={parameters.convergenceTolerance}
            onChange={(e) => onChange({ convergenceTolerance: parseFloat(e.target.value) || 0.001 })}
            min="0.00001"
            max="0.1"
            step="0.00001"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Algorithm-specific parameters */}
      {showAdvanced && (parameters.algorithm === 'GENETIC_ALGORITHM' || parameters.algorithm === 'PARTICLE_SWARM') && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Population Size
            </label>
            <input
              type="number"
              value={parameters.populationSize || 50}
              onChange={(e) => onChange({ populationSize: parseInt(e.target.value) || 50 })}
              min="10"
              max="200"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ============================================================================
// OPTIMIZATION RESULTS
// ============================================================================

interface OptimizationResultsProps {
  result: OptimizationResult
  fuelCellType: FuelCellType
}

function OptimizationResults({ result, fuelCellType }: OptimizationResultsProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className={`p-4 rounded-lg ${
        result.success 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
      }`}>
        <h3 className={`text-lg font-semibold mb-2 ${
          result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
        }`}>
          Optimization {result.success ? 'Successful' : 'Failed'}
        </h3>
        <div className="text-sm">
          <div>Objective Value: {result.objectiveValue.toFixed(2)}</div>
          <div>Iterations: {result.iterations}</div>
          {result.constraintViolations.length > 0 && (
            <div className="mt-2">
              <div className="font-medium">Constraint Violations:</div>
              <ul className="list-disc list-inside">
                {result.constraintViolations.map((violation, i) => (
                  <li key={i}>{violation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Optimized Parameters */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Optimized Parameters
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Cell Count</div>
            <div className="text-lg font-semibold">{result.optimizedParameters.cellCount}</div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Area</div>
            <div className="text-lg font-semibold">{result.optimizedParameters.activeArea.toFixed(1)} cm²</div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Temperature</div>
            <div className="text-lg font-semibold">{result.optimizedParameters.operatingTemperature.toFixed(1)}°C</div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Pressure</div>
            <div className="text-lg font-semibold">{result.optimizedParameters.operatingPressure.toFixed(1)} bar</div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Fuel Flow</div>
            <div className="text-lg font-semibold">{result.optimizedParameters.fuelFlowRate.toFixed(1)} L/min</div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Air Flow</div>
            <div className="text-lg font-semibold">{result.optimizedParameters.airFlowRate.toFixed(1)} L/min</div>
          </div>
        </div>
      </div>

      {/* Convergence History Chart */}
      {result.convergenceHistory.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Convergence History
          </h3>
          <ConvergenceChart history={result.convergenceHistory} />
        </div>
      )}

      {/* Sensitivity Analysis */}
      {result.sensitivity && result.sensitivity.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Sensitivity Analysis
          </h3>
          <div className="space-y-3">
            {result.sensitivity.map((item, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{item.parameter}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Sensitivity: {item.sensitivity.toFixed(3)}
                  </div>
                </div>
                <div className="text-sm">
                  Optimal Range: {item.optimalRange.min.toFixed(1)} - {item.optimalRange.max.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ConvergenceChart({ history }: { history: OptimizationResult['convergenceHistory'] }) {
  const maxValue = Math.max(...history.map(h => h.objectiveValue))
  const minValue = Math.min(...history.map(h => h.objectiveValue))
  const range = maxValue - minValue || 1

  return (
    <div className="h-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <svg width="100%" height="100%" viewBox="0 0 600 200" className="overflow-visible">
        {/* Grid lines */}
        <g stroke="#e5e7eb" strokeWidth="1" opacity="0.5">
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <line
              key={`h-${ratio}`}
              x1="40"
              y1={20 + ratio * 160}
              x2="580"
              y2={20 + ratio * 160}
            />
          ))}
        </g>

        {/* Data line */}
        <path
          d={history.map((point, i) => {
            const x = 40 + (i / (history.length - 1)) * 540
            const y = 180 - ((point.objectiveValue - minValue) / range) * 160
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
          }).join(' ')}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {/* Data points */}
        {history.map((point, i) => {
          const x = 40 + (i / (history.length - 1)) * 540
          const y = 180 - ((point.objectiveValue - minValue) / range) * 160
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#3b82f6"
              className="hover:r-5 transition-all cursor-pointer"
            >
              <title>Iteration {point.iteration}: {point.objectiveValue.toFixed(2)}</title>
            </circle>
          )
        })}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <text
            key={`y-${ratio}`}
            x="35"
            y={185 - ratio * 160}
            textAnchor="end"
            fontSize="12"
            fill="currentColor"
            className="text-gray-600 dark:text-gray-400"
          >
            {(minValue + ratio * range).toFixed(1)}
          </text>
        ))}

        {/* X-axis label */}
        <text
          x="310"
          y="195"
          textAnchor="middle"
          fontSize="12"
          fill="currentColor"
          className="text-gray-600 dark:text-gray-400"
        >
          Iteration
        </text>
      </svg>
    </div>
  )
}