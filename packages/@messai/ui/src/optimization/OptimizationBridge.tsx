'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '../Button'
import { Card, CardHeader, CardTitle, CardContent } from '../Card'
import { Input } from '../Input'

// ============================================================================
// OPTIMIZATION BRIDGE INTERFACES
// ============================================================================

export interface OptimizationRequest {
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES'
  objective: 'MAXIMIZE_POWER' | 'MAXIMIZE_EFFICIENCY' | 'MINIMIZE_COST' | 'MULTI_OBJECTIVE'
  algorithm: 'GRADIENT_DESCENT' | 'GENETIC_ALGORITHM' | 'PARTICLE_SWARM' | 'BAYESIAN'
  initialParameters: BioreactorParameters
  constraints: OptimizationConstraints
  weights?: {
    power?: number
    efficiency?: number
    cost?: number
    durability?: number
  }
}

export interface BioreactorParameters {
  temperature: number
  ph: number
  flowRate: number
  mixingSpeed: number
  electrodeVoltage: number
  substrateConcentration: number
  pressure?: number
  oxygenLevel?: number
  salinity?: number
}

export interface OptimizationConstraints {
  temperature: { min: number; max: number }
  ph: { min: number; max: number }
  flowRate: { min: number; max: number }
  mixingSpeed: { min: number; max: number }
  electrodeVoltage: { min: number; max: number }
  substrateConcentration: { min: number; max: number }
  pressure?: { min: number; max: number }
  oxygenLevel?: { min: number; max: number }
  salinity?: { min: number; max: number }
}

export interface OptimizationProgress {
  iteration: number
  objectiveValue: number
  parameters: Partial<BioreactorParameters>
  convergenceHistory: Array<{
    iteration: number
    objectiveValue: number
    parameters: Partial<BioreactorParameters>
  }>
}

export interface OptimizationResult {
  success: boolean
  optimizedParameters: BioreactorParameters
  objectiveValue: number
  constraintViolations: string[]
  iterations: number
  convergenceHistory: OptimizationProgress['convergenceHistory']
  sensitivity?: Array<{
    parameter: string
    sensitivity: number
    optimalRange: { min: number; max: number }
  }>
}

// ============================================================================
// OPTIMIZATION BRIDGE COMPONENT
// ============================================================================

export interface OptimizationBridgeProps {
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES'
  initialParameters: BioreactorParameters
  onOptimizationStart?: (request: OptimizationRequest) => void
  onOptimizationProgress?: (progress: OptimizationProgress) => void
  onOptimizationComplete?: (result: OptimizationResult) => void
  onParameterSuggestion?: (parameters: BioreactorParameters) => void
  className?: string
}

export const OptimizationBridge: React.FC<OptimizationBridgeProps> = ({
  systemType,
  initialParameters,
  onOptimizationStart,
  onOptimizationProgress,
  onOptimizationComplete,
  onParameterSuggestion,
  className
}) => {
  // State management
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [progress, setProgress] = useState<OptimizationProgress | null>(null)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [objective, setObjective] = useState<OptimizationRequest['objective']>('MAXIMIZE_POWER')
  const [algorithm, setAlgorithm] = useState<OptimizationRequest['algorithm']>('GENETIC_ALGORITHM')
  const [weights, setWeights] = useState({ power: 0.4, efficiency: 0.3, cost: 0.2, durability: 0.1 })
  const [constraints, setConstraints] = useState<OptimizationConstraints>({
    temperature: { min: 15, max: 45 },
    ph: { min: 6.0, max: 8.5 },
    flowRate: { min: 0.1, max: 100 },
    mixingSpeed: { min: 50, max: 300 },
    electrodeVoltage: { min: 50, max: 200 },
    substrateConcentration: { min: 0.5, max: 10.0 }
  })

  // WebSocket connection for real-time progress
  const wsRef = useRef<WebSocket | null>(null)

  // ============================================================================
  // WEBSOCKET MANAGEMENT
  // ============================================================================

  const connectWebSocket = useCallback(() => {
    try {
      wsRef.current = new WebSocket(`ws://localhost:3001/api/optimization/websocket`)
      
      wsRef.current.onopen = () => {
        console.log('OptimizationBridge: WebSocket connected')
      }

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === 'OPTIMIZATION_PROGRESS') {
          const progressData: OptimizationProgress = data.payload
          setProgress(progressData)
          onOptimizationProgress?.(progressData)
        } else if (data.type === 'OPTIMIZATION_COMPLETE') {
          const resultData: OptimizationResult = data.payload
          setResult(resultData)
          setIsOptimizing(false)
          onOptimizationComplete?.(resultData)
          
          // Suggest optimized parameters
          if (resultData.success && onParameterSuggestion) {
            onParameterSuggestion(resultData.optimizedParameters)
          }
        } else if (data.type === 'OPTIMIZATION_ERROR') {
          console.error('Optimization error:', data.payload)
          setIsOptimizing(false)
        }
      }

      wsRef.current.onclose = () => {
        console.log('OptimizationBridge: WebSocket disconnected')
      }

      wsRef.current.onerror = (error) => {
        console.error('OptimizationBridge: WebSocket error:', error)
        setIsOptimizing(false)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }, [onOptimizationProgress, onOptimizationComplete, onParameterSuggestion])

  useEffect(() => {
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connectWebSocket])

  // ============================================================================
  // OPTIMIZATION CONTROL
  // ============================================================================

  const startOptimization = useCallback(async () => {
    if (isOptimizing) return

    const optimizationRequest: OptimizationRequest = {
      systemType,
      objective,
      algorithm,
      initialParameters,
      constraints,
      weights: objective === 'MULTI_OBJECTIVE' ? weights : undefined
    }

    setIsOptimizing(true)
    setProgress(null)
    setResult(null)
    onOptimizationStart?.(optimizationRequest)

    try {
      // Send optimization request to API
      const response = await fetch('/api/optimization/bioreactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimizationRequest)
      })

      if (!response.ok) {
        throw new Error(`Optimization request failed: ${response.statusText}`)
      }

      // WebSocket will handle progress and completion updates
    } catch (error) {
      console.error('Failed to start optimization:', error)
      setIsOptimizing(false)
    }
  }, [
    isOptimizing, systemType, objective, algorithm, initialParameters, 
    constraints, weights, onOptimizationStart
  ])

  const cancelOptimization = useCallback(() => {
    if (wsRef.current && isOptimizing) {
      wsRef.current.send(JSON.stringify({
        type: 'CANCEL_OPTIMIZATION'
      }))
    }
    setIsOptimizing(false)
  }, [isOptimizing])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card className={`optimization-bridge ${className || ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Optimization Bridge</span>
          <div className="flex gap-2">
            <Button
              onClick={startOptimization}
              disabled={isOptimizing}
              size="sm"
              variant={isOptimizing ? "outline" : "default"}
            >
              {isOptimizing ? 'Optimizing...' : 'Start Optimization'}
            </Button>
            {isOptimizing && (
              <Button
                onClick={cancelOptimization}
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Optimization Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Objective</label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value as OptimizationRequest['objective'])}
              disabled={isOptimizing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MAXIMIZE_POWER">Maximize Power</option>
              <option value="MAXIMIZE_EFFICIENCY">Maximize Efficiency</option>
              <option value="MINIMIZE_COST">Minimize Cost</option>
              <option value="MULTI_OBJECTIVE">Multi-Objective</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as OptimizationRequest['algorithm'])}
              disabled={isOptimizing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="GENETIC_ALGORITHM">Genetic Algorithm</option>
              <option value="PARTICLE_SWARM">Particle Swarm</option>
              <option value="GRADIENT_DESCENT">Gradient Descent</option>
              <option value="BAYESIAN">Bayesian Optimization</option>
            </select>
          </div>
        </div>

        {/* Multi-objective weights */}
        {objective === 'MULTI_OBJECTIVE' && (
          <div>
            <label className="block text-sm font-medium mb-2">Objective Weights</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs">Power ({Math.round(weights.power * 100)}%)</label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={weights.power}
                  onChange={(e) => setWeights(prev => ({ ...prev, power: parseFloat(e.target.value) }))}
                  disabled={isOptimizing}
                />
              </div>
              <div>
                <label className="text-xs">Efficiency ({Math.round(weights.efficiency * 100)}%)</label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={weights.efficiency}
                  onChange={(e) => setWeights(prev => ({ ...prev, efficiency: parseFloat(e.target.value) }))}
                  disabled={isOptimizing}
                />
              </div>
              <div>
                <label className="text-xs">Cost ({Math.round(weights.cost * 100)}%)</label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={weights.cost}
                  onChange={(e) => setWeights(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                  disabled={isOptimizing}
                />
              </div>
              <div>
                <label className="text-xs">Durability ({Math.round(weights.durability * 100)}%)</label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={weights.durability}
                  onChange={(e) => setWeights(prev => ({ ...prev, durability: parseFloat(e.target.value) }))}
                  disabled={isOptimizing}
                />
              </div>
            </div>
          </div>
        )}

        {/* Progress Display */}
        {progress && (
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Iteration {progress.iteration}</span>
              <span className="text-sm text-blue-600">
                Objective: {progress.objectiveValue.toFixed(3)}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (progress.iteration / 100) * 100)}%` 
                }}
              />
            </div>
            
            {/* Convergence visualization */}
            {progress.convergenceHistory.length > 5 && (
              <div className="mt-2">
                <div className="text-xs text-gray-600 mb-1">Convergence Trend</div>
                <div className="flex items-end space-x-1 h-8">
                  {progress.convergenceHistory.slice(-20).map((point, index) => (
                    <div
                      key={index}
                      className="bg-blue-400 w-1 rounded-t"
                      style={{
                        height: `${Math.max(2, (point.objectiveValue / Math.max(...progress.convergenceHistory.map(p => p.objectiveValue))) * 32)}px`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className={`p-3 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">
                {result.success ? 'Optimization Complete' : 'Optimization Failed'}
              </span>
              <span className="text-sm">
                {result.iterations} iterations
              </span>
            </div>
            
            {result.success && (
              <div className="text-sm space-y-1">
                <div>Final Objective Value: {result.objectiveValue.toFixed(3)}</div>
                <div className="text-xs text-gray-600">
                  Optimized Parameters:
                  <ul className="mt-1 space-y-0.5">
                    <li>Temperature: {result.optimizedParameters.temperature.toFixed(1)}°C</li>
                    <li>pH: {result.optimizedParameters.ph.toFixed(2)}</li>
                    <li>Flow Rate: {result.optimizedParameters.flowRate.toFixed(1)} mL/min</li>
                    <li>Mixing Speed: {result.optimizedParameters.mixingSpeed.toFixed(0)} rpm</li>
                    <li>Voltage: {result.optimizedParameters.electrodeVoltage.toFixed(0)} mV</li>
                    <li>Substrate: {result.optimizedParameters.substrateConcentration.toFixed(2)} g/L</li>
                  </ul>
                </div>
              </div>
            )}
            
            {result.constraintViolations.length > 0 && (
              <div className="mt-2 text-xs text-red-600">
                Constraint Violations:
                <ul className="mt-1 space-y-0.5">
                  {result.constraintViolations.map((violation, index) => (
                    <li key={index}>• {violation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* System Information */}
        <div className="text-xs text-gray-500 border-t pt-2">
          System Type: {systemType} | 
          WebSocket: {wsRef.current?.readyState === WebSocket.OPEN ? 'Connected' : 'Disconnected'}
        </div>
      </CardContent>
    </Card>
  )
}

export default OptimizationBridge