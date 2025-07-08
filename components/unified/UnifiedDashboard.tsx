'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SystemSelector from './SystemSelector'
import FuelCellConfigPanel from '../fuel-cell/FuelCellConfigPanel'
import FuelCellConfigPanelMobile from '../fuel-cell/FuelCellConfigPanelMobile'
import FuelCellStack3D from '../fuel-cell/FuelCellStack3D'
import ControlSystemDesigner from '../fuel-cell/ControlSystemDesigner'
import ControlSystemVisualization from '../fuel-cell/ControlSystemVisualization'
import HILTestingInterface from '../fuel-cell/HILTestingInterface'
import OptimizationInterface from '../fuel-cell/OptimizationInterface'
import ComparativeAnalysis from '../fuel-cell/ComparativeAnalysis'
import FuelCellOnboarding from '../onboarding/FuelCellOnboarding'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorMessage from '../ui/ErrorMessage'
import MESSConfigPanel from '../MESSConfigPanel'
import { VanillaDashboard3D } from '../3d/vanilla-dashboard-3d'
import { type FuelCellPredictionResult } from '@/lib/fuel-cell-predictions'
import { type PredictionResult } from '@/lib/ai-predictions'
import { useKeyboardShortcuts, fuelCellShortcuts } from '@/hooks/useKeyboardShortcuts'

// ============================================================================
// INTERFACES
// ============================================================================

interface UnifiedDashboardProps {
  initialSystemType?: 'microbial' | 'fuel-cell' | null
  className?: string
}

interface SystemState {
  type: 'microbial' | 'fuel-cell' | null
  config: any
  prediction: any
  isCalculating: boolean
  controlSystemConfig?: any
  controlSimulationResults?: any
  hilTestResults?: any
  optimizationResult?: any
}

// ============================================================================
// UNIFIED DASHBOARD COMPONENT
// ============================================================================

export default function UnifiedDashboard({ 
  initialSystemType = null, 
  className = '' 
}: UnifiedDashboardProps) {
  const [systemState, setSystemState] = useState<SystemState>({
    type: initialSystemType,
    config: null,
    prediction: null,
    isCalculating: false
  })

  const [viewMode, setViewMode] = useState<'config' | '3d' | 'split' | 'control' | 'hil' | 'optimize' | 'compare'>('split')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { ...fuelCellShortcuts.switchToConfig, handler: () => setViewMode('config') },
    { ...fuelCellShortcuts.switchTo3D, handler: () => setViewMode('3d') },
    { ...fuelCellShortcuts.switchToSplit, handler: () => setViewMode('split') },
    { ...fuelCellShortcuts.switchToControl, handler: () => systemState.type === 'fuel-cell' && setViewMode('control') },
    { ...fuelCellShortcuts.switchToHIL, handler: () => systemState.type === 'fuel-cell' && setViewMode('hil') },
    { ...fuelCellShortcuts.switchToOptimize, handler: () => systemState.type === 'fuel-cell' && setViewMode('optimize') },
    { ...fuelCellShortcuts.switchToCompare, handler: () => systemState.type === 'fuel-cell' && setViewMode('compare') },
    { ...fuelCellShortcuts.toggleAdvanced, handler: () => setShowAdvancedOptions(!showAdvancedOptions) },
  ])

  // Handle system selection
  const handleSystemSelect = useCallback((systemId: string) => {
    const newType = systemId as 'microbial' | 'fuel-cell' | null
    setSystemState(prev => ({
      ...prev,
      type: newType,
      config: null,
      prediction: null,
      isCalculating: false
    }))
  }, [])

  // Handle configuration changes
  const handleConfigChange = useCallback((config: any) => {
    setSystemState(prev => ({
      ...prev,
      config,
      prediction: null // Clear prediction when config changes
    }))
  }, [])

  // Handle prediction requests
  const handlePredictionRequest = useCallback(async (config: any) => {
    if (!systemState.type) return

    setSystemState(prev => ({ ...prev, isCalculating: true }))

    try {
      let response: Response
      let prediction: any

      if (systemState.type === 'fuel-cell') {
        response = await fetch('/api/fuel-cell/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        })
      } else {
        // Microbial system prediction
        response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        })
      }

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.statusText}`)
      }

      const result = await response.json()
      prediction = systemState.type === 'fuel-cell' ? result.data : result

      setSystemState(prev => ({
        ...prev,
        prediction,
        isCalculating: false
      }))

    } catch (error) {
      console.error('Prediction error:', error)
      setSystemState(prev => ({ ...prev, isCalculating: false }))
      setError('Failed to calculate prediction. Please check your configuration and try again.')
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000)
    }
  }, [systemState.type])

  // Handle control system configuration changes
  const handleControlSystemConfigChange = useCallback((config: any) => {
    setSystemState(prev => ({
      ...prev,
      controlSystemConfig: config
    }))
  }, [])

  // Handle control system simulation
  const handleControlSimulation = useCallback(async (config: any) => {
    if (systemState.type !== 'fuel-cell') return

    try {
      const response = await fetch('/api/fuel-cell/control-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fuelCellType: systemState.config?.fuelCellType || 'PEM',
          controlConfig: config,
          preset: 'BASIC_TEST'
        })
      })

      if (!response.ok) {
        throw new Error(`Control simulation failed: ${response.statusText}`)
      }

      const result = await response.json()
      setSystemState(prev => ({
        ...prev,
        controlSimulationResults: result.data
      }))
    } catch (error) {
      console.error('Control simulation error:', error)
      alert('Failed to run control simulation. Please check your configuration.')
    }
  }, [systemState.type, systemState.config])

  // Handle HIL test start
  const handleHILTestStart = useCallback((testConfig: any) => {
    console.log('Starting HIL test:', testConfig)
    // In a real implementation, this would interface with actual hardware
  }, [])

  // Handle HIL test stop
  const handleHILTestStop = useCallback(() => {
    console.log('Stopping HIL test')
  }, [])

  // Handle optimization
  const handleOptimizationStart = useCallback(async (optimizationConfig: any) => {
    if (systemState.type !== 'fuel-cell') return

    try {
      const response = await fetch('/api/fuel-cell/optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fuelCellType: systemState.config?.fuelCellType || 'PEM',
          ...optimizationConfig
        })
      })

      if (!response.ok) {
        throw new Error(`Optimization failed: ${response.statusText}`)
      }

      const result = await response.json()
      setSystemState(prev => ({
        ...prev,
        optimizationResult: result.data
      }))
    } catch (error) {
      console.error('Optimization error:', error)
      alert('Failed to run optimization. Please check your configuration.')
    }
  }, [systemState.type, systemState.config])

  // Mock experiments for microbial dashboard
  const mockExperiments = [
    {
      id: 'exp-1',
      name: 'Test Experiment',
      designName: 'Mason Jar MFC',
      status: 'running',
      lastPower: 245.6,
      parameters: {
        temperature: 28.5,
        ph: 7.1,
        substrateConcentration: 1.2
      }
    }
  ]

  if (!systemState.type) {
    return (
      <div className={`space-y-6 ${className}`}>
        <SystemSelector
          selectedSystem={systemState.type}
          onSystemSelect={handleSystemSelect}
        />
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Onboarding for fuel cell systems */}
      {systemState.type === 'fuel-cell' && <FuelCellOnboarding />}
      
      {/* Error message display */}
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          className="mx-4 md:mx-0"
        />
      )}
      
      {/* Header with system info and controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleSystemSelect('')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            ← Change System
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {systemState.type === 'microbial' ? 'Microbial Electrochemical Systems' : 'Fuel Cell Systems'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {systemState.type === 'microbial' 
                ? 'Design and optimize bioelectrochemical systems'
                : 'Design and optimize fuel cell stacks and systems'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode selector */}
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('config')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'config'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Config
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === '3d'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              3D View
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Split
            </button>
            {systemState.type === 'fuel-cell' && (
              <>
                <button
                  onClick={() => setViewMode('control')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'control'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Control
                </button>
                <button
                  onClick={() => setViewMode('hil')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'hil'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  HIL
                </button>
                <button
                  onClick={() => setViewMode('optimize')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'optimize'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Optimize
                </button>
                <button
                  onClick={() => setViewMode('compare')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'compare'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Compare
                </button>
              </>
            )}
          </div>

          {/* Advanced options toggle */}
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className={`px-3 py-2 rounded-md text-sm transition-colors ${
              showAdvancedOptions
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <AnimatePresence>
          {(viewMode === 'config' || viewMode === 'split') && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={viewMode === 'config' ? 'lg:col-span-2' : ''}
            >
              {systemState.type === 'fuel-cell' ? (
                isMobile ? (
                  <FuelCellConfigPanelMobile
                    config={systemState.config || {}}
                    onConfigChange={handleConfigChange}
                    onPredictionRequest={handlePredictionRequest}
                    prediction={systemState.prediction as FuelCellPredictionResult}
                    isCalculating={systemState.isCalculating}
                  />
                ) : (
                  <FuelCellConfigPanel
                    initialConfig={systemState.config}
                    onConfigChange={handleConfigChange}
                    onPredictionRequest={handlePredictionRequest}
                    prediction={systemState.prediction as FuelCellPredictionResult}
                    isCalculating={systemState.isCalculating}
                  />
                )
              ) : (
                <MESSConfigPanel
                  onConfigChange={handleConfigChange}
                  onPredictionRequest={handlePredictionRequest}
                  prediction={systemState.prediction as PredictionResult}
                  isCalculating={systemState.isCalculating}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D Visualization */}
        <AnimatePresence>
          {(viewMode === '3d' || viewMode === 'split') && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={viewMode === '3d' ? 'lg:col-span-2' : ''}
            >
              {systemState.type === 'fuel-cell' && systemState.config ? (
                <FuelCellStack3D
                  fuelCellType={systemState.config.fuelCellType}
                  cellCount={systemState.config.cellCount}
                  activeArea={systemState.config.activeArea}
                  prediction={systemState.prediction}
                  showGasFlow={showAdvancedOptions}
                  showTemperature={showAdvancedOptions}
                  showControls={true}
                />
              ) : systemState.type === 'microbial' ? (
                <VanillaDashboard3D
                  experiments={mockExperiments}
                  selectedExperiment={mockExperiments[0]?.id}
                  onExperimentSelect={(id) => console.log('Selected experiment:', id)}
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Configure your system to see 3D visualization
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control System Designer (Fuel Cell only) */}
      <AnimatePresence>
        {viewMode === 'control' && systemState.type === 'fuel-cell' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <ControlSystemDesigner
              fuelCellType={systemState.config?.fuelCellType || 'PEM'}
              systemConfig={systemState.config}
              onConfigChange={handleControlSystemConfigChange}
              onSimulationRequest={handleControlSimulation}
              simulationResults={systemState.controlSimulationResults}
            />
            
            {systemState.controlSimulationResults && (
              <ControlSystemVisualization
                timeSeriesData={systemState.controlSimulationResults.timeSeriesData}
                fuelCellType={systemState.config?.fuelCellType || 'PEM'}
                isSimulating={false}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HIL Testing Interface (Fuel Cell only) */}
      <AnimatePresence>
        {viewMode === 'hil' && systemState.type === 'fuel-cell' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <HILTestingInterface
              fuelCellType={systemState.config?.fuelCellType || 'PEM'}
              onTestStart={handleHILTestStart}
              onTestStop={handleHILTestStop}
              testResults={systemState.hilTestResults || []}
              isConnected={false} // Would be determined by actual hardware connection
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optimization Interface (Fuel Cell only) */}
      <AnimatePresence>
        {viewMode === 'optimize' && systemState.type === 'fuel-cell' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <OptimizationInterface
              fuelCellType={systemState.config?.fuelCellType || 'PEM'}
              onOptimizationStart={handleOptimizationStart}
              optimizationResult={systemState.optimizationResult}
              isOptimizing={false} // Would track actual optimization state
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparative Analysis (Fuel Cell only) */}
      <AnimatePresence>
        {viewMode === 'compare' && systemState.type === 'fuel-cell' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ComparativeAnalysis />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance comparison section */}
      {systemState.prediction && showAdvancedOptions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <PerformanceComparisonPanel
            systemType={systemState.type}
            prediction={systemState.prediction}
            config={systemState.config}
          />
        </motion.div>
      )}

      {/* Export and sharing options */}
      {systemState.config && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4"
        >
          <button
            onClick={() => exportConfiguration(systemState)}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Export Configuration
          </button>
          <button
            onClick={() => shareResults(systemState)}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Share Results
          </button>
          <button
            onClick={() => saveExperiment(systemState)}
            className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
          >
            Save Experiment
          </button>
        </motion.div>
      )}
    </div>
  )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface PerformanceComparisonPanelProps {
  systemType: 'microbial' | 'fuel-cell'
  prediction: any
  config: any
}

function PerformanceComparisonPanel({ 
  systemType, 
  prediction, 
  config 
}: PerformanceComparisonPanelProps) {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Performance Analysis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Performance metrics */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Power Metrics</h4>
          {systemType === 'fuel-cell' ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Power:</span>
                <span className="font-medium">{prediction.predictedPower.toFixed(1)} W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Power Density:</span>
                <span className="font-medium">{prediction.powerDensity.toFixed(2)} W/cm²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Efficiency:</span>
                <span className="font-medium">{prediction.efficiency.toFixed(1)}%</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Predicted Power:</span>
                <span className="font-medium">{prediction.predictedPower.toFixed(1)} mW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                <span className="font-medium">
                  {prediction.confidenceInterval.lower.toFixed(1)} - {prediction.confidenceInterval.upper.toFixed(1)} mW
                </span>
              </div>
            </>
          )}
        </div>

        {/* Operating conditions */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Operating Conditions</h4>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Temperature:</span>
            <span className="font-medium">
              {systemType === 'fuel-cell' 
                ? `${prediction.operatingPoint.temperature}°C`
                : `${config.temperature || 'N/A'}°C`
              }
            </span>
          </div>
          {systemType === 'fuel-cell' && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Pressure:</span>
                <span className="font-medium">{prediction.operatingPoint.pressure} bar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Humidity:</span>
                <span className="font-medium">{prediction.operatingPoint.humidity}%</span>
              </div>
            </>
          )}
        </div>

        {/* System configuration */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">System Configuration</h4>
          {systemType === 'fuel-cell' ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="font-medium">{config.fuelCellType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cells:</span>
                <span className="font-medium">{config.cellCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Area:</span>
                <span className="font-medium">{config.activeArea} cm²</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Design:</span>
                <span className="font-medium">{config.designType || 'Custom'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">pH:</span>
                <span className="font-medium">{config.ph || 'N/A'}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function exportConfiguration(systemState: SystemState) {
  const exportData = {
    systemType: systemState.type,
    configuration: systemState.config,
    prediction: systemState.prediction,
    timestamp: new Date().toISOString(),
    version: '1.0'
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${systemState.type}-config-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function shareResults(systemState: SystemState) {
  const shareData = {
    title: `${systemState.type === 'fuel-cell' ? 'Fuel Cell' : 'Microbial'} System Results`,
    text: `Check out my ${systemState.type} system design results from MESSAi!`,
    url: window.location.href
  }

  if (navigator.share) {
    navigator.share(shareData)
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
    alert('Results copied to clipboard!')
  }
}

async function saveExperiment(systemState: SystemState) {
  try {
    const response = await fetch('/api/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemType: systemState.type,
        configuration: systemState.config,
        prediction: systemState.prediction,
        name: `${systemState.type} Experiment ${new Date().toLocaleDateString()}`
      })
    })

    if (response.ok) {
      alert('Experiment saved successfully!')
    } else {
      throw new Error('Failed to save experiment')
    }
  } catch (error) {
    console.error('Save experiment error:', error)
    alert('Failed to save experiment. Please try again.')
  }
}