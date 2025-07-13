'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FuelCellType } from '@/lib/types/fuel-cell-types'
import { ControllerSettings } from '@/lib/fuel-cell-predictions'

// ============================================================================
// CONTROL SYSTEM INTERFACES
// ============================================================================

interface ControllerConfig {
  enabled: boolean
  type: 'PID' | 'FUZZY' | 'ADAPTIVE' | 'NEURAL'
  setpoint: number
  pidParams: {
    kp: number
    ki: number
    kd: number
  }
  constraints: {
    min: number
    max: number
    rateLimit: number
  }
  deadband?: number
  windup_limit?: number
}

interface ControlSystemConfig {
  thermal: ControllerConfig
  humidity: ControllerConfig
  pressure: ControllerConfig
  purging: ControllerConfig & {
    strategy: 'TIME_BASED' | 'COMPOSITION_BASED' | 'PERFORMANCE_BASED'
    threshold: number
    interval: number
    duration: number
  }
  airIntake: ControllerConfig
  stackVoltage: ControllerConfig
}

interface ControlSystemDesignerProps {
  fuelCellType: FuelCellType
  systemConfig?: any
  onConfigChange?: (config: ControlSystemConfig) => void
  onSimulationRequest?: (config: ControlSystemConfig) => void
  simulationResults?: ControlSystemSimulationResult | null
  className?: string
}

interface ControlSystemSimulationResult {
  stability: number // 0-1
  performance: number // 0-1
  efficiency: number // %
  responseTime: number // seconds
  overshoot: number // %
  settlingTime: number // seconds
  recommendations: string[]
  timeSeriesData: {
    time: number[]
    temperature: number[]
    humidity: number[]
    pressure: number[]
    power: number[]
  }
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

const DEFAULT_CONFIGS: Record<FuelCellType, Partial<ControlSystemConfig>> = {
  PEM: {
    thermal: {
      enabled: true,
      type: 'PID',
      setpoint: 80,
      pidParams: { kp: 0.8, ki: 0.1, kd: 0.05 },
      constraints: { min: 40, max: 90, rateLimit: 2 },
      deadband: 1
    },
    humidity: {
      enabled: true,
      type: 'PID',
      setpoint: 100,
      pidParams: { kp: 0.5, ki: 0.2, kd: 0.02 },
      constraints: { min: 50, max: 100, rateLimit: 5 }
    },
    pressure: {
      enabled: true,
      type: 'PID',
      setpoint: 2.5,
      pidParams: { kp: 1.2, ki: 0.3, kd: 0.1 },
      constraints: { min: 1, max: 10, rateLimit: 0.5 }
    }
  },
  SOFC: {
    thermal: {
      enabled: true,
      type: 'PID',
      setpoint: 750,
      pidParams: { kp: 0.5, ki: 0.05, kd: 0.1 },
      constraints: { min: 600, max: 1000, rateLimit: 10 },
      deadband: 5
    },
    pressure: {
      enabled: true,
      type: 'ADAPTIVE',
      setpoint: 1.5,
      pidParams: { kp: 0.8, ki: 0.1, kd: 0.05 },
      constraints: { min: 1, max: 20, rateLimit: 0.3 }
    }
  },
  PAFC: {
    thermal: {
      enabled: true,
      type: 'PID',
      setpoint: 200,
      pidParams: { kp: 0.7, ki: 0.15, kd: 0.08 },
      constraints: { min: 150, max: 220, rateLimit: 3 },
      deadband: 2
    },
    humidity: {
      enabled: true,
      type: 'FUZZY',
      setpoint: 85,
      pidParams: { kp: 0.6, ki: 0.25, kd: 0.03 },
      constraints: { min: 60, max: 95, rateLimit: 3 }
    }
  },
  MCFC: {
    thermal: {
      enabled: true,
      type: 'ADAPTIVE',
      setpoint: 650,
      pidParams: { kp: 0.4, ki: 0.08, kd: 0.12 },
      constraints: { min: 600, max: 700, rateLimit: 8 },
      deadband: 3
    }
  },
  AFC: {
    thermal: {
      enabled: true,
      type: 'PID',
      setpoint: 70,
      pidParams: { kp: 0.9, ki: 0.2, kd: 0.04 },
      constraints: { min: 50, max: 90, rateLimit: 2 }
    },
    humidity: {
      enabled: true,
      type: 'PID',
      setpoint: 95,
      pidParams: { kp: 0.7, ki: 0.3, kd: 0.02 },
      constraints: { min: 80, max: 100, rateLimit: 4 }
    }
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ControlSystemDesigner({
  fuelCellType,
  systemConfig,
  onConfigChange,
  onSimulationRequest,
  simulationResults,
  className = ''
}: ControlSystemDesignerProps) {
  const [config, setConfig] = useState<ControlSystemConfig>(() => {
    const defaults = DEFAULT_CONFIGS[fuelCellType]
    return {
      thermal: defaults?.thermal || DEFAULT_CONFIGS.PEM.thermal!,
      humidity: defaults?.humidity || { enabled: false, type: 'PID', setpoint: 0, pidParams: { kp: 0, ki: 0, kd: 0 }, constraints: { min: 0, max: 100, rateLimit: 1 } },
      pressure: defaults?.pressure || DEFAULT_CONFIGS.PEM.pressure!,
      purging: {
        ...(defaults?.purging || { enabled: true, type: 'PID', setpoint: 0.5, pidParams: { kp: 1, ki: 0, kd: 0 }, constraints: { min: 0, max: 1, rateLimit: 0.1 } }),
        strategy: 'COMPOSITION_BASED' as const,
        threshold: 0.5,
        interval: 300,
        duration: 30
      },
      airIntake: defaults?.airIntake || { enabled: true, type: 'PID', setpoint: 25, pidParams: { kp: 0.8, ki: 0.1, kd: 0.05 }, constraints: { min: 1, max: 100, rateLimit: 2 } },
      stackVoltage: defaults?.stackVoltage || { enabled: true, type: 'PID', setpoint: 50, pidParams: { kp: 1.0, ki: 0.2, kd: 0.1 }, constraints: { min: 0, max: 200, rateLimit: 5 } }
    }
  })

  const [selectedController, setSelectedController] = useState<keyof ControlSystemConfig>('thermal')
  const [tuningMode, setTuningMode] = useState<'MANUAL' | 'AUTO' | 'ZIEGLER_NICHOLS'>('MANUAL')
  const [isSimulating, setIsSimulating] = useState(false)

  // Update config when fuel cell type changes
  useEffect(() => {
    const defaults = DEFAULT_CONFIGS[fuelCellType]
    if (defaults) {
      setConfig(prev => ({
        ...prev,
        ...defaults
      }))
    }
  }, [fuelCellType])

  // Notify parent of config changes
  useEffect(() => {
    onConfigChange?.(config)
  }, [config, onConfigChange])

  const updateController = useCallback((
    controllerName: keyof ControlSystemConfig,
    updates: Partial<ControllerConfig>
  ) => {
    setConfig(prev => ({
      ...prev,
      [controllerName]: {
        ...prev[controllerName],
        ...updates
      }
    }))
  }, [])

  const handleSimulation = useCallback(() => {
    setIsSimulating(true)
    onSimulationRequest?.(config)
    // Simulate delay
    setTimeout(() => setIsSimulating(false), 2000)
  }, [config, onSimulationRequest])

  const autoTunePID = useCallback((controllerName: keyof ControlSystemConfig) => {
    // Simplified auto-tuning using Ziegler-Nichols method
    const currentController = config[controllerName] as ControllerConfig
    const ku = 2.0 // Ultimate gain (would be determined experimentally)
    const tu = 10.0 // Ultimate period (would be determined experimentally)
    
    const newParams = {
      kp: 0.6 * ku,
      ki: (2 * currentController.pidParams.kp) / tu,
      kd: (currentController.pidParams.kp * tu) / 8
    }

    updateController(controllerName, { pidParams: newParams })
  }, [config, updateController])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Control System Designer
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Tuning Mode:</span>
          <select
            value={tuningMode}
            onChange={(e) => setTuningMode(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="MANUAL">Manual</option>
            <option value="AUTO">Auto-Tune</option>
            <option value="ZIEGLER_NICHOLS">Ziegler-Nichols</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controller Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Controllers</h3>
          <div className="space-y-2">
            {Object.entries(config).map(([name, controller]) => (
              <ControllerCard
                key={name}
                name={name as keyof ControlSystemConfig}
                controller={controller as ControllerConfig}
                isSelected={selectedController === name}
                onClick={() => setSelectedController(name as keyof ControlSystemConfig)}
                fuelCellType={fuelCellType}
              />
            ))}
          </div>
        </div>

        {/* Controller Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {selectedController.charAt(0).toUpperCase() + selectedController.slice(1)} Controller
          </h3>
          
          <ControllerConfigPanel
            controller={config[selectedController] as ControllerConfig}
            controllerName={selectedController}
            onUpdate={(updates) => updateController(selectedController, updates)}
            onAutoTune={() => autoTunePID(selectedController)}
            tuningMode={tuningMode}
            fuelCellType={fuelCellType}
          />
        </div>

        {/* System Status & Simulation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Status</h3>
          
          <SystemStatusPanel
            config={config}
            simulationResults={simulationResults}
            fuelCellType={fuelCellType}
          />

          <button
            onClick={handleSimulation}
            disabled={isSimulating}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isSimulating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <span>🔬</span>
                Run Simulation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulation Results */}
      <AnimatePresence>
        {simulationResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <SimulationResultsPanel results={simulationResults} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ControllerCardProps {
  name: keyof ControlSystemConfig
  controller: ControllerConfig
  isSelected: boolean
  onClick: () => void
  fuelCellType: FuelCellType
}

function ControllerCard({ name, controller, isSelected, onClick, fuelCellType }: ControllerCardProps) {
  const getControllerIcon = (name: string) => {
    const icons = {
      thermal: '🌡️',
      humidity: '💧',
      pressure: '🔘',
      purging: '💨',
      airIntake: '🌬️',
      stackVoltage: '⚡'
    }
    return icons[name as keyof typeof icons] || '⚙️'
  }

  const getControllerDescription = (name: string, fuelCellType: FuelCellType) => {
    const descriptions = {
      thermal: `Temperature control (${fuelCellType === 'SOFC' || fuelCellType === 'MCFC' ? 'High-temp' : 'Low-temp'})`,
      humidity: fuelCellType === 'SOFC' || fuelCellType === 'MCFC' ? 'Not applicable' : 'Humidity management',
      pressure: 'System pressure regulation',
      purging: 'Nitrogen removal strategy',
      airIntake: 'Air flow optimization',
      stackVoltage: 'Voltage regulation'
    }
    return descriptions[name as keyof typeof descriptions] || 'System control'
  }

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 text-left border rounded-md transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{getControllerIcon(name)}</span>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {getControllerDescription(name, fuelCellType)}
            </div>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${
          controller.enabled ? 'bg-green-500' : 'bg-gray-300'
        }`} />
      </div>
    </button>
  )
}

interface ControllerConfigPanelProps {
  controller: ControllerConfig
  controllerName: keyof ControlSystemConfig
  onUpdate: (updates: Partial<ControllerConfig>) => void
  onAutoTune: () => void
  tuningMode: string
  fuelCellType: FuelCellType
}

function ControllerConfigPanel({
  controller,
  controllerName,
  onUpdate,
  onAutoTune,
  tuningMode,
  fuelCellType
}: ControllerConfigPanelProps) {
  const getSetpointUnit = (name: keyof ControlSystemConfig) => {
    const units = {
      thermal: '°C',
      humidity: '%',
      pressure: 'bar',
      purging: '',
      airIntake: 'L/min',
      stackVoltage: 'V'
    }
    return units[name] || ''
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enabled</span>
        <button
          onClick={() => onUpdate({ enabled: !controller.enabled })}
          className={`w-12 h-6 rounded-full transition-colors ${
            controller.enabled ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
            controller.enabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {controller.enabled && (
        <>
          {/* Controller Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Controller Type
            </label>
            <select
              value={controller.type}
              onChange={(e) => onUpdate({ type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="PID">PID Controller</option>
              <option value="FUZZY">Fuzzy Logic</option>
              <option value="ADAPTIVE">Adaptive Control</option>
              <option value="NEURAL">Neural Network</option>
            </select>
          </div>

          {/* Setpoint */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Setpoint ({getSetpointUnit(controllerName)})
            </label>
            <input
              type="number"
              value={controller.setpoint}
              onChange={(e) => onUpdate({ setpoint: parseFloat(e.target.value) || 0 })}
              min={controller.constraints.min}
              max={controller.constraints.max}
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* PID Parameters */}
          {controller.type === 'PID' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">PID Parameters</span>
                {tuningMode !== 'MANUAL' && (
                  <button
                    onClick={onAutoTune}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Auto-Tune
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Kp</label>
                  <input
                    type="number"
                    value={controller.pidParams.kp}
                    onChange={(e) => onUpdate({
                      pidParams: { ...controller.pidParams, kp: parseFloat(e.target.value) || 0 }
                    })}
                    step="0.01"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Ki</label>
                  <input
                    type="number"
                    value={controller.pidParams.ki}
                    onChange={(e) => onUpdate({
                      pidParams: { ...controller.pidParams, ki: parseFloat(e.target.value) || 0 }
                    })}
                    step="0.01"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Kd</label>
                  <input
                    type="number"
                    value={controller.pidParams.kd}
                    onChange={(e) => onUpdate({
                      pidParams: { ...controller.pidParams, kd: parseFloat(e.target.value) || 0 }
                    })}
                    step="0.01"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Constraints */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Constraints</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min</label>
                <input
                  type="number"
                  value={controller.constraints.min}
                  onChange={(e) => onUpdate({
                    constraints: { ...controller.constraints, min: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max</label>
                <input
                  type="number"
                  value={controller.constraints.max}
                  onChange={(e) => onUpdate({
                    constraints: { ...controller.constraints, max: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface SystemStatusPanelProps {
  config: ControlSystemConfig
  simulationResults?: ControlSystemSimulationResult | null
  fuelCellType: FuelCellType
}

function SystemStatusPanel({ config, simulationResults, fuelCellType }: SystemStatusPanelProps) {
  const enabledControllers = Object.entries(config).filter(([_, controller]) => 
    (controller as ControllerConfig).enabled
  ).length

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">System Overview</div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Active Controllers:</span>
            <span className="text-sm font-medium">{enabledControllers}/6</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Fuel Cell Type:</span>
            <span className="text-sm font-medium">{fuelCellType}</span>
          </div>
          {simulationResults && (
            <>
              <div className="flex justify-between">
                <span className="text-sm">System Stability:</span>
                <span className={`text-sm font-medium ${
                  simulationResults.stability > 0.8 ? 'text-green-500' : 
                  simulationResults.stability > 0.6 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {(simulationResults.stability * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Performance:</span>
                <span className={`text-sm font-medium ${
                  simulationResults.performance > 0.8 ? 'text-green-500' : 
                  simulationResults.performance > 0.6 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {(simulationResults.performance * 100).toFixed(0)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {simulationResults && simulationResults.recommendations.length > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Recommendations
          </div>
          <ul className="space-y-1">
            {simulationResults.recommendations.map((rec, index) => (
              <li key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                • {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

interface SimulationResultsPanelProps {
  results: ControlSystemSimulationResult
}

function SimulationResultsPanel({ results }: SimulationResultsPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Simulation Results
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white dark:bg-gray-700 rounded">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {(results.stability * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Stability</div>
        </div>
        
        <div className="text-center p-3 bg-white dark:bg-gray-700 rounded">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {(results.performance * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Performance</div>
        </div>
        
        <div className="text-center p-3 bg-white dark:bg-gray-700 rounded">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {results.responseTime.toFixed(1)}s
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Response Time</div>
        </div>
        
        <div className="text-center p-3 bg-white dark:bg-gray-700 rounded">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {results.efficiency.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Efficiency</div>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Settling Time: {results.settlingTime.toFixed(1)}s | 
        Overshoot: {results.overshoot.toFixed(1)}%
      </div>
    </div>
  )
}