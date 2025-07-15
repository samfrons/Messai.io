// Parameter validation functions for MESS reference system

export interface ParameterValue {
  value: number | string
  unit?: string
  confidence?: number
}

export interface ValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  suggestions: string[]
}

export interface MESSConfiguration {
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES'
  anodeMaterial: string
  cathodeMaterial: string
  microorganism?: string
  temperature?: number
  ph?: number
  substrateConcentration?: number
  powerDensity?: number
  currentDensity?: number
  voltage?: number
}

// Load validation rules from JSON
const validationRules = require('./parameter-ranges.json')

/**
 * Validate a single parameter value
 */
export function validateParameter(
  parameterName: string, 
  value: number, 
  unit?: string
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    warnings: [],
    errors: [],
    suggestions: []
  }

  // Find parameter rules
  const rules = findParameterRules(parameterName)
  if (!rules) {
    result.warnings.push(`No validation rules found for parameter: ${parameterName}`)
    return result
  }

  // Check unit
  if (unit && unit !== rules.unit) {
    result.warnings.push(`Expected unit ${rules.unit}, got ${unit}`)
  }

  // Check valid range
  if (value < rules.valid_range.min || value > rules.valid_range.max) {
    result.isValid = false
    result.errors.push(
      `Value ${value} outside valid range [${rules.valid_range.min}, ${rules.valid_range.max}]`
    )
  }

  // Check typical range
  if (value < rules.typical_range.min || value > rules.typical_range.max) {
    result.warnings.push(
      `Value ${value} outside typical range [${rules.typical_range.min}, ${rules.typical_range.max}]`
    )
  }

  // Check outlier threshold
  if (value > rules.outlier_threshold) {
    result.warnings.push(`Value ${value} exceeds outlier threshold ${rules.outlier_threshold}`)
    result.suggestions.push('Please verify measurement method and conditions')
  }

  return result
}

/**
 * Validate a complete MESS configuration
 */
export function validateConfiguration(config: MESSConfiguration): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    warnings: [],
    errors: [],
    suggestions: []
  }

  // Validate individual parameters
  if (config.temperature) {
    const tempResult = validateParameter('temperature', config.temperature, '°C')
    mergeValidationResults(result, tempResult)
  }

  if (config.ph) {
    const phResult = validateParameter('ph', config.ph, 'pH')
    mergeValidationResults(result, phResult)
  }

  if (config.powerDensity) {
    const powerResult = validateParameter('power_density', config.powerDensity, 'W/m³')
    mergeValidationResults(result, powerResult)
  }

  // Check material compatibility
  const compatibilityResult = checkMaterialCompatibility(
    config.anodeMaterial,
    config.cathodeMaterial,
    config.microorganism
  )
  mergeValidationResults(result, compatibilityResult)

  // Check system-specific rules
  const systemResult = validateSystemType(config)
  mergeValidationResults(result, systemResult)

  return result
}

/**
 * Check electrode material compatibility
 */
export function checkMaterialCompatibility(
  anodeMaterial: string,
  cathodeMaterial: string,
  microorganism?: string
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    warnings: [],
    errors: [],
    suggestions: []
  }

  const anodeRules = validationRules.compatibility_rules.anode_materials[anodeMaterial]
  const cathodeRules = validationRules.compatibility_rules.cathode_materials[cathodeMaterial]

  if (!anodeRules) {
    result.warnings.push(`Unknown anode material: ${anodeMaterial}`)
  }

  if (!cathodeRules) {
    result.warnings.push(`Unknown cathode material: ${cathodeMaterial}`)
  }

  if (microorganism && anodeRules) {
    if (!anodeRules.compatible_microbes.includes(microorganism)) {
      result.warnings.push(
        `Microorganism ${microorganism} may not be compatible with ${anodeMaterial}`
      )
      result.suggestions.push(
        `Consider using: ${anodeRules.compatible_microbes.join(', ')}`
      )
    }
  }

  return result
}

/**
 * Validate system-specific requirements
 */
function validateSystemType(config: MESSConfiguration): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    warnings: [],
    errors: [],
    suggestions: []
  }

  switch (config.systemType) {
    case 'MFC':
      // MFC should have power output
      if (!config.powerDensity) {
        result.suggestions.push('MFC systems should report power density')
      }
      break

    case 'MEC':
      // MEC requires external voltage
      if (config.voltage && config.voltage < 0.2) {
        result.warnings.push('MEC systems typically require applied voltage > 0.2V')
      }
      break

    case 'MDC':
      // MDC for desalination
      result.suggestions.push('MDC systems should monitor salt removal efficiency')
      break

    case 'MES':
      // MES for chemical production
      result.suggestions.push('MES systems should report product formation rates')
      break
  }

  return result
}

/**
 * Helper functions
 */
function findParameterRules(parameterName: string): any {
  for (const category of Object.values(validationRules.categories)) {
    if (category && typeof category === 'object' && category[parameterName]) {
      return category[parameterName]
    }
  }
  return null
}

function mergeValidationResults(target: ValidationResult, source: ValidationResult): void {
  if (!source.isValid) {
    target.isValid = false
  }
  target.warnings.push(...source.warnings)
  target.errors.push(...source.errors)
  target.suggestions.push(...source.suggestions)
}

/**
 * Generate performance predictions based on configuration
 */
export function predictPerformance(config: MESSConfiguration): {
  powerDensity: number
  efficiency: number
  confidence: number
} {
  let basePower = 10 // W/m³
  let efficiency = 50 // %
  let confidence = 0.7

  // Material factors
  const materialFactors = {
    carbon_cloth: 1.0,
    graphite_felt: 1.1,
    carbon_nanotube: 1.5,
    mxene_ti3c2tx: 1.8
  }

  const cathodeFactor = {
    platinum: 1.5,
    carbon_pt_catalyst: 1.2,
    stainless_steel: 0.8,
    air_cathode: 1.0
  }

  // Apply material factors
  basePower *= materialFactors[config.anodeMaterial as keyof typeof materialFactors] || 1.0
  basePower *= cathodeFactor[config.cathodeMaterial as keyof typeof cathodeFactor] || 1.0

  // Temperature factor (optimum around 30°C)
  if (config.temperature) {
    const tempFactor = Math.exp(-Math.pow(config.temperature - 30, 2) / 200)
    basePower *= tempFactor
    efficiency *= tempFactor
  }

  // pH factor (optimum around 7)
  if (config.ph) {
    const phFactor = Math.exp(-Math.pow(config.ph - 7, 2) / 2)
    basePower *= phFactor
    efficiency *= phFactor
  }

  // Reduce confidence for unknown materials
  if (!materialFactors[config.anodeMaterial as keyof typeof materialFactors]) {
    confidence *= 0.5
  }

  return {
    powerDensity: Math.round(basePower * 10) / 10,
    efficiency: Math.round(efficiency),
    confidence: Math.round(confidence * 100) / 100
  }
}

/**
 * Export validation rules for use in UI
 */
export function getValidationRules() {
  return validationRules
}