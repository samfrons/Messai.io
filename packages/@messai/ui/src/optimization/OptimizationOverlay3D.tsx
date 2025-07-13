'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '../Button'
import { Card, CardContent } from '../Card'
import { BioreactorParameters, OptimizationProgress, OptimizationResult } from './OptimizationBridge'

// ============================================================================
// 3D OPTIMIZATION OVERLAY TYPES
// ============================================================================

export interface OptimizationVisualization {
  parameterHeatmap: {
    parameter: keyof BioreactorParameters
    values: Array<{ position: [number, number, number]; value: number; color: string }>
  }[]
  optimizationPath: Array<{
    iteration: number
    parameters: BioreactorParameters
    performance: number
    position: [number, number, number]
  }>
  convergenceZones: Array<{
    center: [number, number, number]
    radius: number
    performance: number
    color: string
  }>
}

export interface OptimizationOverlay3DProps {
  isVisible: boolean
  currentParameters: BioreactorParameters
  optimizationProgress?: OptimizationProgress
  optimizationResult?: OptimizationResult
  onParameterHover?: (parameter: keyof BioreactorParameters, value: number) => void
  onParameterSelect?: (parameter: keyof BioreactorParameters, value: number) => void
  onOptimizationStart?: () => void
  onOptimizationStop?: () => void
  onVisualizationModeChange?: (mode: 'HEATMAP' | 'PATH' | 'CONVERGENCE') => void
  className?: string
}

// ============================================================================
// 3D OPTIMIZATION OVERLAY COMPONENT
// ============================================================================

export const OptimizationOverlay3D: React.FC<OptimizationOverlay3DProps> = ({
  isVisible,
  currentParameters,
  optimizationProgress,
  optimizationResult,
  onParameterHover,
  onParameterSelect,
  onOptimizationStart,
  onOptimizationStop,
  onVisualizationModeChange,
  className
}) => {
  // State management
  const [visualizationMode, setVisualizationMode] = useState<'HEATMAP' | 'PATH' | 'CONVERGENCE'>('HEATMAP')
  const [selectedParameter, setSelectedParameter] = useState<keyof BioreactorParameters>('temperature')
  const [showOptimalRegions, setShowOptimalRegions] = useState(true)
  const [showParameterEffects, setShowParameterEffects] = useState(true)
  const [overlayOpacity, setOverlayOpacity] = useState(0.7)
  const [animationSpeed, setAnimationSpeed] = useState(1.0)

  // Visualization data
  const [visualization, setVisualization] = useState<OptimizationVisualization>({
    parameterHeatmap: [],
    optimizationPath: [],
    convergenceZones: []
  })

  // Animation frame reference
  const animationRef = useRef<number | null>(null)

  // ============================================================================
  // VISUALIZATION GENERATION
  // ============================================================================

  const generateParameterHeatmap = useCallback(() => {
    const heatmapData = []
    const parameterRanges = {
      temperature: { min: 15, max: 45, unit: '°C' },
      ph: { min: 6.0, max: 8.5, unit: '' },
      flowRate: { min: 10, max: 100, unit: 'mL/min' },
      mixingSpeed: { min: 50, max: 300, unit: 'rpm' },
      electrodeVoltage: { min: 50, max: 200, unit: 'mV' },
      substrateConcentration: { min: 0.5, max: 10.0, unit: 'g/L' }
    }

    // Generate visualization for each parameter
    for (const [param, range] of Object.entries(parameterRanges)) {
      const paramKey = param as keyof BioreactorParameters
      const values = []
      
      // Create a grid of values around the current parameter value
      const currentValue = currentParameters[paramKey]
      const stepSize = (range.max - range.min) / 20
      
      for (let i = 0; i < 21; i++) {
        const value = range.min + i * stepSize
        const performance = estimatePerformanceAtValue(paramKey, value, currentParameters)
        
        // Map to 3D position (simplified mapping)
        const x = (value - range.min) / (range.max - range.min) * 10 - 5
        const y = performance * 5 - 2.5
        const z = Math.sin(i * 0.3) * 2
        
        // Color based on performance (green = good, red = poor)
        const normalizedPerf = Math.max(0, Math.min(1, performance))
        const color = `hsl(${normalizedPerf * 120}, 70%, 50%)`
        
        values.push({
          position: [x, y, z] as [number, number, number],
          value,
          color
        })
      }
      
      heatmapData.push({
        parameter: paramKey,
        values
      })
    }

    return heatmapData
  }, [currentParameters])

  const generateOptimizationPath = useCallback(() => {
    if (!optimizationProgress?.convergenceHistory) return []

    return optimizationProgress.convergenceHistory.map((point, index) => {
      // Map parameters to 3D space
      const params = point.parameters as BioreactorParameters
      const x = ((params.temperature || 25) - 15) / 30 * 10 - 5
      const y = point.objectiveValue * 5 - 2.5
      const z = ((params.ph || 7) - 6) / 2.5 * 10 - 5

      return {
        iteration: point.iteration,
        parameters: params,
        performance: point.objectiveValue,
        position: [x, y, z] as [number, number, number]
      }
    })
  }, [optimizationProgress])

  const generateConvergenceZones = useCallback(() => {
    if (!optimizationResult?.optimizedParameters) return []

    // Create zones around optimal parameter combinations
    const optimal = optimizationResult.optimizedParameters
    const zones = []

    // Main optimal zone
    zones.push({
      center: [
        ((optimal.temperature - 15) / 30) * 10 - 5,
        optimizationResult.objectiveValue * 5 - 2.5,
        ((optimal.ph - 6) / 2.5) * 10 - 5
      ] as [number, number, number],
      radius: 2.0,
      performance: optimizationResult.objectiveValue,
      color: 'rgba(0, 255, 0, 0.3)'
    })

    // Secondary zones for parameter sensitivity
    if (optimizationResult.sensitivity) {
      optimizationResult.sensitivity.forEach(sens => {
        if (sens.sensitivity > 0.1) {
          const paramValue = optimal[sens.parameter as keyof BioreactorParameters]
          zones.push({
            center: [
              Math.random() * 10 - 5,
              (optimizationResult.objectiveValue * 0.9) * 5 - 2.5,
              Math.random() * 10 - 5
            ] as [number, number, number],
            radius: 1.0 / sens.sensitivity,
            performance: optimizationResult.objectiveValue * 0.9,
            color: `rgba(255, ${Math.round(255 * (1 - sens.sensitivity))}, 0, 0.2)`
          })
        }
      })
    }

    return zones
  }, [optimizationResult])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isVisible) {
      const heatmap = generateParameterHeatmap()
      const path = generateOptimizationPath()
      const zones = generateConvergenceZones()

      setVisualization({
        parameterHeatmap: heatmap,
        optimizationPath: path,
        convergenceZones: zones
      })
    }
  }, [isVisible, currentParameters, optimizationProgress, optimizationResult, 
      generateParameterHeatmap, generateOptimizationPath, generateConvergenceZones])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleVisualizationModeChange = useCallback((mode: 'HEATMAP' | 'PATH' | 'CONVERGENCE') => {
    setVisualizationMode(mode)
    onVisualizationModeChange?.(mode)
  }, [onVisualizationModeChange])

  const handleParameterChange = useCallback((param: keyof BioreactorParameters) => {
    setSelectedParameter(param)
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isVisible) return null

  return (
    <div className={`optimization-overlay-3d ${className || ''}`}>
      {/* Floating Control Panel */}
      <Card className="absolute top-4 right-4 w-80 bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">3D Optimization</h3>
            <Button
              onClick={optimizationProgress ? onOptimizationStop : onOptimizationStart}
              size="sm"
              variant={optimizationProgress ? "outline" : "default"}
            >
              {optimizationProgress ? 'Stop' : 'Start'}
            </Button>
          </div>

          {/* Visualization Mode */}
          <div>
            <label className="block text-xs font-medium mb-2">Visualization Mode</label>
            <div className="grid grid-cols-3 gap-1">
              {['HEATMAP', 'PATH', 'CONVERGENCE'].map(mode => (
                <Button
                  key={mode}
                  onClick={() => handleVisualizationModeChange(mode as any)}
                  size="sm"
                  variant={visualizationMode === mode ? "default" : "outline"}
                  className="text-xs py-1"
                >
                  {mode}
                </Button>
              ))}
            </div>
          </div>

          {/* Parameter Selection (for heatmap mode) */}
          {visualizationMode === 'HEATMAP' && (
            <div>
              <label className="block text-xs font-medium mb-2">Parameter</label>
              <select
                value={selectedParameter}
                onChange={(e) => handleParameterChange(e.target.value as keyof BioreactorParameters)}
                className="w-full text-xs px-2 py-1 border rounded"
              >
                <option value="temperature">Temperature</option>
                <option value="ph">pH</option>
                <option value="flowRate">Flow Rate</option>
                <option value="mixingSpeed">Mixing Speed</option>
                <option value="electrodeVoltage">Electrode Voltage</option>
                <option value="substrateConcentration">Substrate Concentration</option>
              </select>
            </div>
          )}

          {/* Visualization Options */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={showOptimalRegions}
                onChange={(e) => setShowOptimalRegions(e.target.checked)}
                className="w-3 h-3"
              />
              <span>Show Optimal Regions</span>
            </label>
            
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={showParameterEffects}
                onChange={(e) => setShowParameterEffects(e.target.checked)}
                className="w-3 h-3"
              />
              <span>Show Parameter Effects</span>
            </label>
          </div>

          {/* Opacity Control */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Opacity ({Math.round(overlayOpacity * 100)}%)
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Animation Speed */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Animation Speed ({animationSpeed.toFixed(1)}x)
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Current Status */}
          {optimizationProgress && (
            <div className="border-t pt-2">
              <div className="text-xs text-gray-600 mb-1">Optimization Progress</div>
              <div className="text-xs">
                Iteration: {optimizationProgress.iteration}
              </div>
              <div className="text-xs">
                Objective: {optimizationProgress.objectiveValue.toFixed(3)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, (optimizationProgress.iteration / 100) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Result Summary */}
          {optimizationResult && (
            <div className="border-t pt-2">
              <div className="text-xs text-gray-600 mb-1">Optimization Complete</div>
              <div className="text-xs">
                <div className={optimizationResult.success ? 'text-green-600' : 'text-red-600'}>
                  {optimizationResult.success ? 'Success' : 'Failed'}
                </div>
                <div>Iterations: {optimizationResult.iterations}</div>
                <div>Final Score: {optimizationResult.objectiveValue.toFixed(3)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overlay Legend */}
      <Card className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-3">
          <div className="text-xs font-medium mb-2">Legend</div>
          
          {visualizationMode === 'HEATMAP' && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>High Performance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Medium Performance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Low Performance</span>
              </div>
            </div>
          )}
          
          {visualizationMode === 'PATH' && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-1 bg-blue-500"></div>
                <span>Optimization Path</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>Current Position</span>
              </div>
            </div>
          )}
          
          {visualizationMode === 'CONVERGENCE' && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full opacity-50"></div>
                <span>Optimal Zone</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full opacity-50"></div>
                <span>Sensitive Parameter</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visualization Data for 3D Scene */}
      <div 
        className="optimization-visualization-data"
        data-mode={visualizationMode}
        data-parameter={selectedParameter}
        data-opacity={overlayOpacity}
        data-speed={animationSpeed}
        data-visualization={JSON.stringify(visualization)}
        style={{ display: 'none' }}
      />
    </div>
  )
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function estimatePerformanceAtValue(
  parameter: keyof BioreactorParameters,
  value: number,
  baseParameters: BioreactorParameters
): number {
  // Simplified performance estimation
  // In practice, this would use the actual prediction engine
  
  const testParams = { ...baseParameters, [parameter]: value }
  
  // Define optimal ranges for each parameter
  const optimalRanges = {
    temperature: { min: 25, max: 35, optimal: 30 },
    ph: { min: 6.5, max: 7.5, optimal: 7.0 },
    flowRate: { min: 20, max: 80, optimal: 50 },
    mixingSpeed: { min: 100, max: 250, optimal: 175 },
    electrodeVoltage: { min: 80, max: 150, optimal: 115 },
    substrateConcentration: { min: 2, max: 6, optimal: 4 }
  }
  
  const range = optimalRanges[parameter]
  const deviation = Math.abs(value - range.optimal) / (range.max - range.min)
  
  // Performance drops off with deviation from optimal
  return Math.max(0.1, 1 - deviation * 2)
}

export default OptimizationOverlay3D