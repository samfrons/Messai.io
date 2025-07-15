// Fuel Cell Performance Prediction Engine
export interface FuelCellParameters {
  type: 'PEM' | 'SOFC' | 'PAFC' | 'MCFC' | 'AFC'
  cellCount: number
  activeArea: number // cm²
  operatingTemperature: number // °C
  operatingPressure: number // atm
  humidity: number // %
  fuelFlowRate: number // L/min
  airFlowRate: number // L/min
  currentDensity?: number // mA/cm²
  voltage?: number // V
}

// Extended interface for API compatibility
export interface FuelCellPredictionInput extends FuelCellParameters {
  fuelCellType?: 'PEM' | 'SOFC' | 'PAFC' | 'MCFC' | 'AFC'
}

export interface PredictionResult {
  powerOutput: number // W
  efficiency: number // %
  voltage: number // V
  current: number // A
  fuelUtilization: number // %
  confidence: number // %
  warnings: string[]
  recommendations: string[]
}

export interface ComparisonResult {
  configurations: FuelCellParameters[]
  results: PredictionResult[]
  bestConfiguration: {
    index: number
    metric: string
    value: number
  }
  analysis: {
    powerRange: { min: number; max: number }
    efficiencyRange: { min: number; max: number }
    tradeoffs: string[]
  }
}

// Performance prediction algorithms
export const predictFuelCellPerformance = (params: FuelCellParameters): PredictionResult => {
  // Simplified prediction model based on fuel cell type
  const baseSpecs = getFuelCellBaseSpecs(params.type)
  
  // Temperature effects
  const tempFactor = calculateTemperatureFactor(params.operatingTemperature, params.type)
  
  // Pressure effects
  const pressureFactor = calculatePressureFactor(params.operatingPressure, params.type)
  
  // Flow rate optimization
  const flowFactor = calculateFlowRateFactor(params.fuelFlowRate, params.airFlowRate, params.type)
  
  // Calculate performance metrics
  const maxPowerDensity = baseSpecs.maxPowerDensity * tempFactor * pressureFactor * flowFactor
  const powerOutput = maxPowerDensity * params.activeArea * params.cellCount / 1000 // Convert to W
  
  const baseEfficiency = baseSpecs.efficiency
  const efficiency = Math.min(baseEfficiency * tempFactor * flowFactor, 85) // Cap at 85%
  
  const voltage = calculateVoltage(params, powerOutput)
  const current = powerOutput / voltage
  
  const fuelUtilization = calculateFuelUtilization(params)
  
  // Generate warnings and recommendations
  const warnings = generateWarnings(params, { powerOutput, efficiency, voltage })
  const recommendations = generateRecommendations(params, { powerOutput, efficiency, voltage })
  
  // Calculate confidence based on parameter validity
  const confidence = calculateConfidence(params)
  
  return {
    powerOutput: Math.round(powerOutput * 100) / 100,
    efficiency: Math.round(efficiency * 100) / 100,
    voltage: Math.round(voltage * 100) / 100,
    current: Math.round(current * 100) / 100,
    fuelUtilization: Math.round(fuelUtilization * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    warnings,
    recommendations
  }
}

export const compareFuelCellConfigurations = (configurations: FuelCellParameters[]): ComparisonResult => {
  const results = configurations.map(config => predictFuelCellPerformance(config))
  
  // Find best configuration by power output
  let bestIndex = 0
  let bestPower = results[0].powerOutput
  
  results.forEach((result, index) => {
    if (result.powerOutput > bestPower) {
      bestPower = result.powerOutput
      bestIndex = index
    }
  })
  
  // Calculate ranges
  const powers = results.map(r => r.powerOutput)
  const efficiencies = results.map(r => r.efficiency)
  
  const analysis = {
    powerRange: { min: Math.min(...powers), max: Math.max(...powers) },
    efficiencyRange: { min: Math.min(...efficiencies), max: Math.max(...efficiencies) },
    tradeoffs: generateTradeoffAnalysis(configurations, results)
  }
  
  return {
    configurations,
    results,
    bestConfiguration: {
      index: bestIndex,
      metric: 'power',
      value: bestPower
    },
    analysis
  }
}

// Helper functions
const getFuelCellBaseSpecs = (type: FuelCellParameters['type']) => {
  const specs = {
    PEM: { maxPowerDensity: 800, efficiency: 50, optimalTemp: 70 },
    SOFC: { maxPowerDensity: 500, efficiency: 65, optimalTemp: 850 },
    PAFC: { maxPowerDensity: 300, efficiency: 45, optimalTemp: 200 },
    MCFC: { maxPowerDensity: 200, efficiency: 55, optimalTemp: 650 },
    AFC: { maxPowerDensity: 400, efficiency: 60, optimalTemp: 80 }
  }
  return specs[type]
}

const calculateTemperatureFactor = (temp: number, type: FuelCellParameters['type']): number => {
  const specs = getFuelCellBaseSpecs(type)
  const tempDiff = Math.abs(temp - specs.optimalTemp)
  return Math.max(0.3, 1 - (tempDiff / specs.optimalTemp) * 0.5)
}

const calculatePressureFactor = (pressure: number, type: FuelCellParameters['type']): number => {
  // Higher pressure generally improves performance, but with diminishing returns
  if (type === 'SOFC') {
    return Math.min(1.2, 1 + (pressure - 1) * 0.1)
  }
  return Math.min(1.5, 1 + (pressure - 1) * 0.2)
}

const calculateFlowRateFactor = (fuelFlow: number, airFlow: number, type: FuelCellParameters['type']): number => {
  // Simplified stoichiometric calculation
  const optimalRatio = type === 'SOFC' ? 2.0 : 1.5
  const actualRatio = airFlow / fuelFlow
  const ratioFactor = Math.max(0.5, 1 - Math.abs(actualRatio - optimalRatio) / optimalRatio)
  return ratioFactor
}

const calculateVoltage = (params: FuelCellParameters, power: number): number => {
  // Estimate voltage based on fuel cell type and operating conditions
  const baseVoltage = {
    PEM: 0.7,
    SOFC: 0.8,
    PAFC: 0.65,
    MCFC: 0.75,
    AFC: 0.9
  }[params.type]
  
  // Voltage decreases with current density
  const currentDensity = power / (params.activeArea * params.cellCount * baseVoltage)
  const voltageDrop = currentDensity * 0.0002 // Simplified polarization curve
  
  return Math.max(0.3, (baseVoltage - voltageDrop) * params.cellCount)
}

const calculateFuelUtilization = (params: FuelCellParameters): number => {
  // Simplified fuel utilization calculation
  const baseUtilization = {
    PEM: 85,
    SOFC: 90,
    PAFC: 80,
    MCFC: 88,
    AFC: 85
  }[params.type]
  
  // Higher flow rates reduce utilization
  const flowFactor = Math.max(0.7, 1 - (params.fuelFlowRate - 1) * 0.05)
  return baseUtilization * flowFactor
}

const generateWarnings = (params: FuelCellParameters, result: { powerOutput: number; efficiency: number; voltage: number }): string[] => {
  const warnings: string[] = []
  
  const specs = getFuelCellBaseSpecs(params.type)
  
  if (Math.abs(params.operatingTemperature - specs.optimalTemp) > specs.optimalTemp * 0.2) {
    warnings.push(`Operating temperature is far from optimal (${specs.optimalTemp}°C)`)
  }
  
  if (result.efficiency < 30) {
    warnings.push('Low efficiency detected - check operating conditions')
  }
  
  if (result.voltage < 0.5 * params.cellCount) {
    warnings.push('Low voltage output - consider reducing current demand')
  }
  
  if (params.fuelFlowRate < 0.5 || params.fuelFlowRate > 20) {
    warnings.push('Fuel flow rate outside typical range')
  }
  
  return warnings
}

const generateRecommendations = (params: FuelCellParameters, result: { powerOutput: number; efficiency: number; voltage: number }): string[] => {
  const recommendations: string[] = []
  
  const specs = getFuelCellBaseSpecs(params.type)
  
  if (params.operatingTemperature < specs.optimalTemp * 0.9) {
    recommendations.push(`Increase operating temperature towards ${specs.optimalTemp}°C for better performance`)
  }
  
  if (params.operatingPressure < 1.5 && params.type === 'PEM') {
    recommendations.push('Consider increasing operating pressure to 1.5-2 atm for PEM fuel cells')
  }
  
  if (result.efficiency < 40) {
    recommendations.push('Optimize flow rates and operating conditions to improve efficiency')
  }
  
  if (params.activeArea < 50) {
    recommendations.push('Consider larger electrode area for higher power output')
  }
  
  return recommendations
}

const calculateConfidence = (params: FuelCellParameters): number => {
  let confidence = 100
  
  const specs = getFuelCellBaseSpecs(params.type)
  
  // Reduce confidence for non-optimal conditions
  if (Math.abs(params.operatingTemperature - specs.optimalTemp) > specs.optimalTemp * 0.3) {
    confidence -= 20
  }
  
  if (params.operatingPressure < 0.8 || params.operatingPressure > 5) {
    confidence -= 15
  }
  
  if (params.fuelFlowRate < 0.1 || params.fuelFlowRate > 50) {
    confidence -= 25
  }
  
  return Math.max(30, confidence)
}

const generateTradeoffAnalysis = (configs: FuelCellParameters[], results: PredictionResult[]): string[] => {
  const tradeoffs: string[] = []
  
  // Analyze power vs efficiency tradeoffs
  const avgPower = results.reduce((sum, r) => sum + r.powerOutput, 0) / results.length
  const avgEfficiency = results.reduce((sum, r) => sum + r.efficiency, 0) / results.length
  
  if (Math.max(...results.map(r => r.powerOutput)) > avgPower * 1.2) {
    tradeoffs.push('Higher power configurations may sacrifice efficiency')
  }
  
  if (Math.max(...results.map(r => r.efficiency)) > avgEfficiency * 1.1) {
    tradeoffs.push('Higher efficiency configurations may have lower power output')
  }
  
  // Temperature tradeoffs
  const tempRange = Math.max(...configs.map(c => c.operatingTemperature)) - Math.min(...configs.map(c => c.operatingTemperature))
  if (tempRange > 100) {
    tradeoffs.push('Temperature significantly affects both power and efficiency')
  }
  
  return tradeoffs
}

// Main modeling engine class
export class FuelCellModelingEngine {
  private modelFidelity: 'low' | 'medium' | 'high' | 'ultra'
  
  constructor(fidelity: 'low' | 'medium' | 'high' | 'ultra' = 'medium') {
    this.modelFidelity = fidelity
  }
  
  predict(params: FuelCellParameters): PredictionResult {
    return predictFuelCellPerformance(params)
  }
  
  compare(configurations: FuelCellParameters[]): ComparisonResult {
    return compareFuelCellConfigurations(configurations)
  }
  
  setFidelity(fidelity: 'low' | 'medium' | 'high' | 'ultra'): void {
    this.modelFidelity = fidelity
  }
  
  getFidelity(): string {
    return this.modelFidelity
  }
}