'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '../Button'
import { Card, CardHeader, CardTitle, CardContent } from '../Card'
import { Input } from '../Input'
import { BioreactorParameters, OptimizationProgress, OptimizationResult } from './OptimizationBridge'

// ============================================================================
// OPTIMIZATION INTERFACE TYPES
// ============================================================================

export interface ParameterSuggestion {
  parameter: keyof BioreactorParameters
  currentValue: number
  suggestedValue: number
  improvementPotential: number
  confidence: number
  reasoning: string
}

export interface OptimizationRecommendation {
  type: 'PARAMETER_ADJUSTMENT' | 'MATERIAL_CHANGE' | 'DESIGN_MODIFICATION'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  description: string
  expectedImprovement: number
  implementation: string
  parameters?: Partial<BioreactorParameters>
}

export interface OptimizationInterfaceProps {
  currentParameters: BioreactorParameters
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES'
  onParametersUpdate: (parameters: BioreactorParameters) => void
  onOptimizationComplete?: (result: OptimizationResult) => void
  predictionEngine?: (params: BioreactorParameters) => Promise<{
    power: number
    efficiency: number
    cost: number
  }>
  className?: string
}

// ============================================================================
// OPTIMIZATION INTERFACE COMPONENT
// ============================================================================

export const OptimizationInterface: React.FC<OptimizationInterfaceProps> = ({
  currentParameters,
  systemType,
  onParametersUpdate,
  onOptimizationComplete,
  predictionEngine,
  className
}) => {
  // State management
  const [suggestions, setSuggestions] = useState<ParameterSuggestion[]>([])
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [performancePreview, setPerformancePreview] = useState<{
    current: { power: number; efficiency: number; cost: number }
    predicted: { power: number; efficiency: number; cost: number }
  } | null>(null)
  const [autoOptimize, setAutoOptimize] = useState(false)
  const [optimizationInterval, setOptimizationInterval] = useState(5000) // 5 seconds

  // Auto-optimization interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // ============================================================================
  // PARAMETER ANALYSIS
  // ============================================================================

  const analyzeParameters = useCallback(async () => {
    if (!predictionEngine) return

    setIsAnalyzing(true)
    
    try {
      // Get current performance
      const currentPerformance = await predictionEngine(currentParameters)
      
      // Generate parameter suggestions
      const newSuggestions = await generateParameterSuggestions(
        currentParameters,
        currentPerformance,
        systemType,
        predictionEngine
      )
      
      // Generate optimization recommendations
      const newRecommendations = await generateOptimizationRecommendations(
        currentParameters,
        currentPerformance,
        systemType
      )
      
      setSuggestions(newSuggestions)
      setRecommendations(newRecommendations)
      
      // Calculate performance preview for best suggestion
      if (newSuggestions.length > 0) {
        const bestSuggestion = newSuggestions[0]
        const optimizedParams = {
          ...currentParameters,
          [bestSuggestion.parameter]: bestSuggestion.suggestedValue
        }
        
        const predictedPerformance = await predictionEngine(optimizedParams)
        
        setPerformancePreview({
          current: currentPerformance,
          predicted: predictedPerformance
        })
      }
      
    } catch (error) {
      console.error('Failed to analyze parameters:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [currentParameters, systemType, predictionEngine])

  // ============================================================================
  // AUTO-OPTIMIZATION
  // ============================================================================

  useEffect(() => {
    if (autoOptimize && predictionEngine) {
      intervalRef.current = setInterval(() => {
        analyzeParameters()
      }, optimizationInterval)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoOptimize, optimizationInterval, analyzeParameters, predictionEngine])

  // ============================================================================
  // PARAMETER ADJUSTMENT
  // ============================================================================

  const applySuggestion = useCallback((suggestion: ParameterSuggestion) => {
    const updatedParameters = {
      ...currentParameters,
      [suggestion.parameter]: suggestion.suggestedValue
    }
    onParametersUpdate(updatedParameters)
  }, [currentParameters, onParametersUpdate])

  const applyRecommendation = useCallback((recommendation: OptimizationRecommendation) => {
    if (recommendation.parameters) {
      const updatedParameters = {
        ...currentParameters,
        ...recommendation.parameters
      }
      onParametersUpdate(updatedParameters)
    }
  }, [currentParameters, onParametersUpdate])

  // ============================================================================
  // MANUAL OPTIMIZATION
  // ============================================================================

  const runQuickOptimization = useCallback(async () => {
    if (!predictionEngine) return

    setIsAnalyzing(true)
    
    try {
      // Simple hill-climbing optimization
      let bestParams = { ...currentParameters }
      let bestPerformance = await predictionEngine(bestParams)
      let bestScore = calculateObjectiveScore(bestPerformance, systemType)
      
      const stepSizes = {
        temperature: 1.0,
        ph: 0.1,
        flowRate: 5.0,
        mixingSpeed: 10.0,
        electrodeVoltage: 5.0,
        substrateConcentration: 0.1
      }
      
      // Try small adjustments to each parameter
      for (const [param, stepSize] of Object.entries(stepSizes)) {
        const paramKey = param as keyof BioreactorParameters
        
        // Try increasing parameter
        const increasedParams = {
          ...bestParams,
          [paramKey]: bestParams[paramKey] + stepSize
        }
        
        const increasedPerformance = await predictionEngine(increasedParams)
        const increasedScore = calculateObjectiveScore(increasedPerformance, systemType)
        
        if (increasedScore > bestScore) {
          bestParams = increasedParams
          bestPerformance = increasedPerformance
          bestScore = increasedScore
        }
        
        // Try decreasing parameter
        const decreasedParams = {
          ...bestParams,
          [paramKey]: Math.max(0, bestParams[paramKey] - stepSize)
        }
        
        const decreasedPerformance = await predictionEngine(decreasedParams)
        const decreasedScore = calculateObjectiveScore(decreasedPerformance, systemType)
        
        if (decreasedScore > bestScore) {
          bestParams = decreasedParams
          bestPerformance = decreasedPerformance
          bestScore = decreasedScore
        }
      }
      
      // Apply optimized parameters if improvement found
      if (bestScore > calculateObjectiveScore(await predictionEngine(currentParameters), systemType)) {
        onParametersUpdate(bestParams)
        
        // Create mock optimization result
        const result: OptimizationResult = {
          success: true,
          optimizedParameters: bestParams,
          objectiveValue: bestScore,
          constraintViolations: [],
          iterations: 1,
          convergenceHistory: []
        }
        
        onOptimizationComplete?.(result)
      }
      
    } catch (error) {
      console.error('Quick optimization failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [currentParameters, systemType, predictionEngine, onParametersUpdate, onOptimizationComplete])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`optimization-interface space-y-4 ${className || ''}`}>
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Optimization Interface</span>
            <div className="flex gap-2">
              <Button
                onClick={analyzeParameters}
                disabled={isAnalyzing || !predictionEngine}
                size="sm"
                variant="outline"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
              <Button
                onClick={runQuickOptimization}
                disabled={isAnalyzing || !predictionEngine}
                size="sm"
              >
                Quick Optimize
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Auto-optimization toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoOptimize}
                  onChange={(e) => setAutoOptimize(e.target.checked)}
                  disabled={!predictionEngine}
                  className="rounded"
                />
                <span className="text-sm">Auto-optimization</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Continuously analyze and suggest improvements
              </p>
            </div>
            
            {autoOptimize && (
              <div className="flex items-center space-x-2">
                <span className="text-xs">Interval:</span>
                <select
                  value={optimizationInterval}
                  onChange={(e) => setOptimizationInterval(parseInt(e.target.value))}
                  className="text-xs px-2 py-1 border rounded"
                >
                  <option value={1000}>1s</option>
                  <option value={5000}>5s</option>
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                </select>
              </div>
            )}
          </div>

          {/* Performance Preview */}
          {performancePreview && (
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm font-medium mb-2">Performance Preview</div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-gray-600">Power</div>
                  <div className="flex items-center space-x-2">
                    <span>{performancePreview.current.power.toFixed(1)}W</span>
                    <span className="text-blue-600">→</span>
                    <span className="font-medium text-blue-700">
                      {performancePreview.predicted.power.toFixed(1)}W
                    </span>
                    <span className={`text-xs ${
                      performancePreview.predicted.power > performancePreview.current.power 
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({((performancePreview.predicted.power - performancePreview.current.power) / performancePreview.current.power * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-600">Efficiency</div>
                  <div className="flex items-center space-x-2">
                    <span>{performancePreview.current.efficiency.toFixed(1)}%</span>
                    <span className="text-blue-600">→</span>
                    <span className="font-medium text-blue-700">
                      {performancePreview.predicted.efficiency.toFixed(1)}%
                    </span>
                    <span className={`text-xs ${
                      performancePreview.predicted.efficiency > performancePreview.current.efficiency 
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({((performancePreview.predicted.efficiency - performancePreview.current.efficiency) / performancePreview.current.efficiency * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-600">Cost</div>
                  <div className="flex items-center space-x-2">
                    <span>${performancePreview.current.cost.toFixed(0)}</span>
                    <span className="text-blue-600">→</span>
                    <span className="font-medium text-blue-700">
                      ${performancePreview.predicted.cost.toFixed(0)}
                    </span>
                    <span className={`text-xs ${
                      performancePreview.predicted.cost < performancePreview.current.cost 
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({((performancePreview.predicted.cost - performancePreview.current.cost) / performancePreview.current.cost * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parameter Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parameter Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                  <div className="flex-1">
                    <div className="font-medium text-sm capitalize">
                      {suggestion.parameter.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {suggestion.currentValue.toFixed(2)} → {suggestion.suggestedValue.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {suggestion.reasoning}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      +{suggestion.improvementPotential.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(suggestion.confidence * 100)}% confident
                    </div>
                    <Button
                      onClick={() => applySuggestion(suggestion)}
                      size="sm"
                      className="mt-2"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className={`p-3 rounded-md ${
                  rec.priority === 'HIGH' ? 'bg-red-50' :
                  rec.priority === 'MEDIUM' ? 'bg-yellow-50' : 'bg-blue-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{rec.description}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          rec.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {rec.implementation}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Expected improvement: +{rec.expectedImprovement.toFixed(1)}%
                      </div>
                    </div>
                    {rec.parameters && (
                      <Button
                        onClick={() => applyRecommendation(rec)}
                        size="sm"
                        variant="outline"
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status */}
      {!predictionEngine && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              <div className="text-sm">No prediction engine available</div>
              <div className="text-xs mt-1">
                Connect to the prediction API to enable optimization features
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function generateParameterSuggestions(
  currentParams: BioreactorParameters,
  currentPerformance: { power: number; efficiency: number; cost: number },
  systemType: string,
  predictionEngine: (params: BioreactorParameters) => Promise<{ power: number; efficiency: number; cost: number }>
): Promise<ParameterSuggestion[]> {
  const suggestions: ParameterSuggestion[] = []
  
  // Define parameter adjustment ranges
  const adjustments = {
    temperature: [-2, -1, 1, 2],
    ph: [-0.2, -0.1, 0.1, 0.2],
    flowRate: [-5, -2, 2, 5],
    mixingSpeed: [-20, -10, 10, 20],
    electrodeVoltage: [-10, -5, 5, 10],
    substrateConcentration: [-0.5, -0.2, 0.2, 0.5]
  }
  
  for (const [param, adjusts] of Object.entries(adjustments)) {
    const paramKey = param as keyof BioreactorParameters
    
    for (const adjust of adjusts) {
      const testParams = {
        ...currentParams,
        [paramKey]: Math.max(0, currentParams[paramKey] + adjust)
      }
      
      try {
        const testPerformance = await predictionEngine(testParams)
        const currentScore = calculateObjectiveScore(currentPerformance, systemType)
        const testScore = calculateObjectiveScore(testPerformance, systemType)
        
        if (testScore > currentScore) {
          const improvement = ((testScore - currentScore) / currentScore) * 100
          
          suggestions.push({
            parameter: paramKey,
            currentValue: currentParams[paramKey],
            suggestedValue: testParams[paramKey],
            improvementPotential: improvement,
            confidence: Math.min(0.9, improvement / 10), // Simple confidence based on improvement
            reasoning: generateReasoning(paramKey, adjust, improvement, systemType)
          })
        }
      } catch (error) {
        // Skip this suggestion if prediction fails
        continue
      }
    }
  }
  
  // Sort by improvement potential
  return suggestions
    .sort((a, b) => b.improvementPotential - a.improvementPotential)
    .slice(0, 5)
}

async function generateOptimizationRecommendations(
  currentParams: BioreactorParameters,
  currentPerformance: { power: number; efficiency: number; cost: number },
  systemType: string
): Promise<OptimizationRecommendation[]> {
  const recommendations: OptimizationRecommendation[] = []
  
  // Temperature optimization
  if (currentParams.temperature < 25 || currentParams.temperature > 35) {
    recommendations.push({
      type: 'PARAMETER_ADJUSTMENT',
      priority: 'MEDIUM',
      description: 'Optimize temperature for microbial activity',
      expectedImprovement: 8,
      implementation: 'Adjust temperature to 28-32°C range for optimal microbial performance',
      parameters: { temperature: 30 }
    })
  }
  
  // pH optimization
  if (currentParams.ph < 6.5 || currentParams.ph > 7.5) {
    recommendations.push({
      type: 'PARAMETER_ADJUSTMENT',
      priority: 'HIGH',
      description: 'Adjust pH to neutral range',
      expectedImprovement: 12,
      implementation: 'Maintain pH between 6.8-7.2 for optimal microbial electron transfer',
      parameters: { ph: 7.0 }
    })
  }
  
  // Flow rate optimization based on system type
  let optimalFlowRate = 50
  if (systemType === 'MFC') optimalFlowRate = 30
  else if (systemType === 'MEC') optimalFlowRate = 40
  else if (systemType === 'MDC') optimalFlowRate = 60
  
  if (Math.abs(currentParams.flowRate - optimalFlowRate) > 15) {
    recommendations.push({
      type: 'PARAMETER_ADJUSTMENT',
      priority: 'MEDIUM',
      description: `Optimize flow rate for ${systemType} system`,
      expectedImprovement: 6,
      implementation: `Adjust flow rate to ${optimalFlowRate} mL/min for optimal substrate contact time`,
      parameters: { flowRate: optimalFlowRate }
    })
  }
  
  // Material recommendations (if cost is high)
  if (currentPerformance.cost > 1000) {
    recommendations.push({
      type: 'MATERIAL_CHANGE',
      priority: 'LOW',
      description: 'Consider cost-effective electrode materials',
      expectedImprovement: 15,
      implementation: 'Replace expensive materials with carbon cloth or graphite felt alternatives'
    })
  }
  
  // Design modifications for efficiency
  if (currentPerformance.efficiency < 60) {
    recommendations.push({
      type: 'DESIGN_MODIFICATION',
      priority: 'HIGH',
      description: 'Improve system efficiency through design changes',
      expectedImprovement: 20,
      implementation: 'Consider membrane upgrades or electrode surface area optimization'
    })
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

function calculateObjectiveScore(
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

function generateReasoning(
  parameter: keyof BioreactorParameters,
  adjustment: number,
  improvement: number,
  systemType: string
): string {
  const reasons = {
    temperature: adjustment > 0 
      ? 'Higher temperature increases microbial metabolic rate'
      : 'Lower temperature reduces maintenance energy costs',
    ph: adjustment > 0
      ? 'Slightly alkaline conditions favor electron transfer'
      : 'Slightly acidic conditions improve substrate utilization',
    flowRate: adjustment > 0
      ? 'Increased flow improves mass transfer rates'
      : 'Reduced flow increases residence time for reactions',
    mixingSpeed: adjustment > 0
      ? 'Better mixing improves substrate distribution'
      : 'Reduced mixing prevents biofilm shear stress',
    electrodeVoltage: adjustment > 0
      ? 'Higher voltage drives more electron transfer'
      : 'Lower voltage reduces energy losses',
    substrateConcentration: adjustment > 0
      ? 'Higher concentration provides more available electrons'
      : 'Lower concentration reduces inhibition effects'
  }
  
  return reasons[parameter] || 'Optimization based on system performance modeling'
}

export default OptimizationInterface