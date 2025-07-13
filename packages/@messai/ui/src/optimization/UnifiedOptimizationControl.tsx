'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '../Button'
import { Card, CardHeader, CardTitle, CardContent } from '../Card'
import { Input } from '../Input'
import { OptimizationBridge, BioreactorParameters, OptimizationProgress, OptimizationResult } from './OptimizationBridge'
import { OptimizationInterface } from './OptimizationInterface'
import { OptimizationOverlay3D } from './OptimizationOverlay3D'

// ============================================================================
// UNIFIED OPTIMIZATION CONTROL TYPES
// ============================================================================

export interface OptimizationSession {
  id: string
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES'
  startTime: number
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error'
  currentParameters: BioreactorParameters
  progress?: OptimizationProgress
  result?: OptimizationResult
  history: Array<{
    timestamp: number
    parameters: BioreactorParameters
    performance: { power: number; efficiency: number; cost: number }
  }>
}

export interface UnifiedOptimizationControlProps {
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES'
  initialParameters: BioreactorParameters
  onParametersChange: (parameters: BioreactorParameters) => void
  onOptimizationComplete?: (result: OptimizationResult) => void
  predictionEngine?: (params: BioreactorParameters) => Promise<{
    power: number
    efficiency: number
    cost: number
  }>
  show3DOverlay?: boolean
  onVisualizationModeChange?: (mode: 'HEATMAP' | 'PATH' | 'CONVERGENCE') => void
  className?: string
}

// ============================================================================
// UNIFIED OPTIMIZATION CONTROL COMPONENT
// ============================================================================

export const UnifiedOptimizationControl: React.FC<UnifiedOptimizationControlProps> = ({
  systemType,
  initialParameters,
  onParametersChange,
  onOptimizationComplete,
  predictionEngine,
  show3DOverlay = false,
  onVisualizationModeChange,
  className
}) => {
  // State management
  const [session, setSession] = useState<OptimizationSession>({
    id: Math.random().toString(36).substring(2, 15),
    systemType,
    startTime: Date.now(),
    status: 'idle',
    currentParameters: initialParameters,
    history: []
  })

  const [controlMode, setControlMode] = useState<'SIMPLE' | 'ADVANCED' | 'BRIDGE'>('SIMPLE')
  const [isAutoOptimizing, setIsAutoOptimizing] = useState(false)
  const [optimizationSpeed, setOptimizationSpeed] = useState(1.0)
  const [learningMode, setLearningMode] = useState(false)

  // Performance tracking
  const [performanceHistory, setPerformanceHistory] = useState<Array<{
    timestamp: number
    power: number
    efficiency: number
    cost: number
  }>>([])

  // Auto-optimization interval
  const autoOptimizeRef = useRef<NodeJS.Timeout | null>(null)

  // ============================================================================
  // OPTIMIZATION CONTROL
  // ============================================================================

  const startOptimization = useCallback(async () => {
    if (session.status === 'running') return

    setSession(prev => ({
      ...prev,
      status: 'running',
      startTime: Date.now()
    }))

    // Add initial performance point
    if (predictionEngine) {
      const initialPerformance = await predictionEngine(session.currentParameters)
      setPerformanceHistory(prev => [...prev, {
        timestamp: Date.now(),
        ...initialPerformance
      }])
    }
  }, [session.status, session.currentParameters, predictionEngine])

  const pauseOptimization = useCallback(() => {
    setSession(prev => ({
      ...prev,
      status: 'paused'
    }))
  }, [])

  const stopOptimization = useCallback(() => {
    setSession(prev => ({
      ...prev,
      status: 'idle'
    }))
    
    if (autoOptimizeRef.current) {
      clearInterval(autoOptimizeRef.current)
      autoOptimizeRef.current = null
    }
    setIsAutoOptimizing(false)
  }, [])

  const resetOptimization = useCallback(() => {
    setSession(prev => ({
      ...prev,
      status: 'idle',
      currentParameters: initialParameters,
      progress: undefined,
      result: undefined,
      history: []
    }))
    setPerformanceHistory([])
    onParametersChange(initialParameters)
  }, [initialParameters, onParametersChange])

  // ============================================================================
  // AUTO-OPTIMIZATION
  // ============================================================================

  const toggleAutoOptimization = useCallback(async () => {
    if (isAutoOptimizing) {
      if (autoOptimizeRef.current) {
        clearInterval(autoOptimizeRef.current)
        autoOptimizeRef.current = null
      }
      setIsAutoOptimizing(false)
    } else {
      setIsAutoOptimizing(true)
      
      autoOptimizeRef.current = setInterval(async () => {
        if (!predictionEngine || session.status !== 'running') return

        // Simple gradient-based auto-optimization
        const currentPerformance = await predictionEngine(session.currentParameters)
        let bestParams = session.currentParameters
        let bestScore = calculatePerformanceScore(currentPerformance, systemType)

        // Try small adjustments to each parameter
        const adjustmentFactor = 0.05 * optimizationSpeed
        const parameterAdjustments = {
          temperature: [-adjustmentFactor * 5, adjustmentFactor * 5],
          ph: [-adjustmentFactor * 0.2, adjustmentFactor * 0.2],
          flowRate: [-adjustmentFactor * 10, adjustmentFactor * 10],
          mixingSpeed: [-adjustmentFactor * 20, adjustmentFactor * 20],
          electrodeVoltage: [-adjustmentFactor * 10, adjustmentFactor * 10],
          substrateConcentration: [-adjustmentFactor * 1, adjustmentFactor * 1]
        }

        for (const [param, adjustments] of Object.entries(parameterAdjustments)) {
          const paramKey = param as keyof BioreactorParameters
          
          for (const adjustment of adjustments) {
            const testParams = {
              ...session.currentParameters,
              [paramKey]: Math.max(0, session.currentParameters[paramKey] + adjustment)
            }

            const testPerformance = await predictionEngine(testParams)
            const testScore = calculatePerformanceScore(testPerformance, systemType)

            if (testScore > bestScore) {
              bestParams = testParams
              bestScore = testScore
            }
          }
        }

        // Update parameters if improvement found
        if (bestScore > calculatePerformanceScore(currentPerformance, systemType)) {
          setSession(prev => ({
            ...prev,
            currentParameters: bestParams,
            history: [...prev.history, {
              timestamp: Date.now(),
              parameters: bestParams,
              performance: await predictionEngine(bestParams)
            }]
          }))
          
          onParametersChange(bestParams)
          
          const newPerformance = await predictionEngine(bestParams)
          setPerformanceHistory(prev => [...prev, {
            timestamp: Date.now(),
            ...newPerformance
          }])
        }
      }, 2000 / optimizationSpeed) // Adjust frequency based on speed
    }
  }, [isAutoOptimizing, optimizationSpeed, predictionEngine, session, systemType, onParametersChange])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleParametersUpdate = useCallback((newParameters: BioreactorParameters) => {
    setSession(prev => ({
      ...prev,
      currentParameters: newParameters
    }))
    onParametersChange(newParameters)
  }, [onParametersChange])

  const handleOptimizationProgress = useCallback((progress: OptimizationProgress) => {
    setSession(prev => ({
      ...prev,
      progress
    }))
  }, [])

  const handleOptimizationComplete = useCallback((result: OptimizationResult) => {
    setSession(prev => ({
      ...prev,
      status: 'completed',
      result,
      currentParameters: result.optimizedParameters
    }))
    
    onParametersChange(result.optimizedParameters)
    onOptimizationComplete?.(result)
  }, [onParametersChange, onOptimizationComplete])

  // ============================================================================
  // LEARNING MODE
  // ============================================================================

  const generateLearningInsights = useCallback(() => {
    if (session.history.length < 5) return []

    const insights = []
    const recentHistory = session.history.slice(-10)
    
    // Trend analysis
    const powerTrend = analyzeTrend(recentHistory.map(h => h.performance.power))
    const efficiencyTrend = analyzeTrend(recentHistory.map(h => h.performance.efficiency))
    
    if (powerTrend === 'increasing') {
      insights.push('Power output is trending upward - continue current optimization direction')
    } else if (powerTrend === 'decreasing') {
      insights.push('Power output declining - consider parameter constraints or alternative approaches')
    }
    
    if (efficiencyTrend === 'increasing') {
      insights.push('Efficiency improvements detected - good optimization progress')
    }
    
    // Parameter sensitivity analysis
    const sensitiveParams = findSensitiveParameters(recentHistory)
    if (sensitiveParams.length > 0) {
      insights.push(`Most sensitive parameters: ${sensitiveParams.join(', ')}`)
    }
    
    return insights
  }, [session.history])

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      if (autoOptimizeRef.current) {
        clearInterval(autoOptimizeRef.current)
      }
    }
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`unified-optimization-control space-y-4 ${className || ''}`}>
      {/* Main Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Unified Optimization Control</span>
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                session.status === 'running' ? 'bg-green-100 text-green-800' :
                session.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                session.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {session.status.toUpperCase()}
              </div>
              <span className="text-sm text-gray-500">{systemType}</span>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Control Mode Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Control Mode</label>
            <div className="flex gap-2">
              {['SIMPLE', 'ADVANCED', 'BRIDGE'].map(mode => (
                <Button
                  key={mode}
                  onClick={() => setControlMode(mode as any)}
                  size="sm"
                  variant={controlMode === mode ? "default" : "outline"}
                >
                  {mode}
                </Button>
              ))}
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex gap-2">
            <Button
              onClick={session.status === 'idle' ? startOptimization : pauseOptimization}
              disabled={session.status === 'completed'}
            >
              {session.status === 'idle' ? 'Start' : 
               session.status === 'running' ? 'Pause' : 'Resume'}
            </Button>
            
            <Button
              onClick={stopOptimization}
              variant="outline"
              disabled={session.status === 'idle'}
            >
              Stop
            </Button>
            
            <Button
              onClick={resetOptimization}
              variant="outline"
            >
              Reset
            </Button>
            
            <Button
              onClick={toggleAutoOptimization}
              variant={isAutoOptimizing ? "default" : "outline"}
              disabled={session.status !== 'running'}
            >
              {isAutoOptimizing ? 'Stop Auto' : 'Auto Optimize'}
            </Button>
          </div>

          {/* Auto-optimization Controls */}
          {isAutoOptimizing && (
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Auto-Optimization Active</span>
                <span className="text-xs text-blue-600">
                  Speed: {optimizationSpeed.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={optimizationSpeed}
                onChange={(e) => setOptimizationSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Performance Dashboard */}
          {performanceHistory.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm font-medium mb-2">Performance Tracking</div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-gray-600">Power</div>
                  <div className="font-medium">
                    {performanceHistory[performanceHistory.length - 1].power.toFixed(2)}W
                  </div>
                  <div className={`text-xs ${
                    performanceHistory.length > 1 && 
                    performanceHistory[performanceHistory.length - 1].power > 
                    performanceHistory[performanceHistory.length - 2].power ? 
                    'text-green-600' : 'text-red-600'
                  }`}>
                    {performanceHistory.length > 1 && (
                      `${performanceHistory[performanceHistory.length - 1].power > 
                        performanceHistory[performanceHistory.length - 2].power ? '↑' : '↓'}`
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-600">Efficiency</div>
                  <div className="font-medium">
                    {performanceHistory[performanceHistory.length - 1].efficiency.toFixed(1)}%
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-600">Cost</div>
                  <div className="font-medium">
                    ${performanceHistory[performanceHistory.length - 1].cost.toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Learning Mode */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={learningMode}
              onChange={(e) => setLearningMode(e.target.checked)}
              className="rounded"
            />
            <label className="text-sm">Learning Mode</label>
          </div>

          {learningMode && (
            <div className="bg-purple-50 p-3 rounded-md">
              <div className="text-sm font-medium mb-2">Learning Insights</div>
              <div className="space-y-1">
                {generateLearningInsights().map((insight, index) => (
                  <div key={index} className="text-xs text-purple-700">
                    • {insight}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mode-specific Components */}
      {controlMode === 'SIMPLE' && (
        <OptimizationInterface
          currentParameters={session.currentParameters}
          systemType={systemType}
          onParametersUpdate={handleParametersUpdate}
          onOptimizationComplete={handleOptimizationComplete}
          predictionEngine={predictionEngine}
        />
      )}

      {controlMode === 'BRIDGE' && (
        <OptimizationBridge
          systemType={systemType}
          initialParameters={session.currentParameters}
          onOptimizationProgress={handleOptimizationProgress}
          onOptimizationComplete={handleOptimizationComplete}
          onParameterSuggestion={handleParametersUpdate}
        />
      )}

      {/* 3D Overlay */}
      {show3DOverlay && (
        <OptimizationOverlay3D
          isVisible={show3DOverlay}
          currentParameters={session.currentParameters}
          optimizationProgress={session.progress}
          optimizationResult={session.result}
          onOptimizationStart={startOptimization}
          onOptimizationStop={stopOptimization}
          onVisualizationModeChange={onVisualizationModeChange}
        />
      )}

      {/* Session Summary */}
      <Card>
        <CardContent className="text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Session: {session.id}</span>
            <span>History: {session.history.length} points</span>
            <span>Duration: {Math.round((Date.now() - session.startTime) / 1000)}s</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculatePerformanceScore(
  performance: { power: number; efficiency: number; cost: number },
  systemType: string
): number {
  // Weight factors based on system type
  const weights = {
    MFC: { power: 0.5, efficiency: 0.3, cost: 0.2 },
    MEC: { power: 0.3, efficiency: 0.5, cost: 0.2 },
    MDC: { power: 0.3, efficiency: 0.4, cost: 0.3 },
    MES: { power: 0.4, efficiency: 0.4, cost: 0.2 }
  }
  
  const w = weights[systemType as keyof typeof weights] || weights.MFC
  
  // Normalize and combine (cost is inverted - lower is better)
  return (
    w.power * (performance.power / 100) +
    w.efficiency * (performance.efficiency / 100) +
    w.cost * (1000 / Math.max(performance.cost, 100)) // Inverse cost factor
  )
}

function analyzeTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 3) return 'stable'
  
  const recent = values.slice(-5)
  const slope = calculateSlope(recent)
  
  if (slope > 0.1) return 'increasing'
  if (slope < -0.1) return 'decreasing'
  return 'stable'
}

function calculateSlope(values: number[]): number {
  const n = values.length
  const sumX = (n * (n - 1)) / 2
  const sumY = values.reduce((sum, val) => sum + val, 0)
  const sumXY = values.reduce((sum, val, index) => sum + val * index, 0)
  const sumXX = values.reduce((sum, _, index) => sum + index * index, 0)
  
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
}

function findSensitiveParameters(
  history: Array<{
    parameters: BioreactorParameters
    performance: { power: number; efficiency: number; cost: number }
  }>
): string[] {
  if (history.length < 3) return []
  
  const parameterNames = Object.keys(history[0].parameters) as (keyof BioreactorParameters)[]
  const sensitivities: Array<{ param: string; sensitivity: number }> = []
  
  for (const param of parameterNames) {
    let totalSensitivity = 0
    let validComparisons = 0
    
    for (let i = 1; i < history.length; i++) {
      const prevValue = history[i - 1].parameters[param]
      const currValue = history[i].parameters[param]
      const prevPerf = calculatePerformanceScore(history[i - 1].performance, 'MFC')
      const currPerf = calculatePerformanceScore(history[i].performance, 'MFC')
      
      if (prevValue !== currValue) {
        const paramChange = Math.abs(currValue - prevValue) / prevValue
        const perfChange = Math.abs(currPerf - prevPerf) / prevPerf
        
        if (paramChange > 0) {
          totalSensitivity += perfChange / paramChange
          validComparisons++
        }
      }
    }
    
    if (validComparisons > 0) {
      sensitivities.push({
        param: param.toString(),
        sensitivity: totalSensitivity / validComparisons
      })
    }
  }
  
  return sensitivities
    .sort((a, b) => b.sensitivity - a.sensitivity)
    .slice(0, 3)
    .map(s => s.param)
}

export default UnifiedOptimizationControl