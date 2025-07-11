/**
 * Data validation and standardization utilities for literature extraction
 * Handles JSON schema validation, unit conversion, and data quality checks
 */

import { z } from 'zod'

// Core data schemas for extracted research data
export const PerformanceMetricSchema = z.object({
  value: z.number().finite(),
  unit: z.string().min(1),
  confidence: z.number().min(0).max(1).optional().default(0.8)
})

export const MaterialSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['anode', 'cathode', 'membrane', 'substrate']).optional(),
  properties: z.record(z.string(), z.any()).optional()
})

export const OrganismSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['bacteria', 'archaea', 'mixed_culture', 'yeast', 'algae']).optional(),
  conditions: z.record(z.string(), z.any()).optional()
})

export const ExtractedDataSchema = z.object({
  // Performance metrics
  power_density: PerformanceMetricSchema.nullable().optional(),
  current_density: PerformanceMetricSchema.nullable().optional(),
  voltage: PerformanceMetricSchema.nullable().optional(),
  coulombic_efficiency: z.number().min(0).max(100).nullable().optional(),
  cod_removal_efficiency: z.number().min(0).max(100).nullable().optional(),
  bod_removal_efficiency: z.number().min(0).max(100).nullable().optional(),
  hydrogen_production: PerformanceMetricSchema.nullable().optional(),
  
  // Physical properties
  conductivity: PerformanceMetricSchema.nullable().optional(),
  surface_area: PerformanceMetricSchema.nullable().optional(),
  ph: z.number().min(0).max(14).nullable().optional(),
  temperature: PerformanceMetricSchema.nullable().optional(),
  
  // Materials and organisms
  anode_materials: z.array(MaterialSchema).nullable().optional(),
  cathode_materials: z.array(MaterialSchema).nullable().optional(),
  microorganisms: z.array(OrganismSchema).nullable().optional(),
  
  // System information
  system_type: z.enum(['MFC', 'MEC', 'MDC', 'MES', 'BES']).nullable().optional(),
  substrate: z.string().nullable().optional(),
  
  // Analysis metadata
  key_findings: z.array(z.string()).nullable().optional(),
  has_performance_data: z.boolean(),
  extraction_confidence: z.number().min(0).max(1).default(0.5)
})

export type ExtractedData = z.infer<typeof ExtractedDataSchema>
export type PerformanceMetric = z.infer<typeof PerformanceMetricSchema>

// Unit conversion utilities
export class UnitConverter {
  // Power density conversions (target: mW/m²)
  static convertPowerDensity(value: number, fromUnit: string): number | null {
    const conversions: Record<string, number> = {
      'mW/m²': 1,
      'mW/m2': 1,
      'W/m²': 1000,
      'W/m2': 1000,
      'μW/cm²': 10,
      'μW/cm2': 10,
      'mW/cm²': 10000,
      'mW/cm2': 10000,
      'W/cm²': 10000000,
      'W/cm2': 10000000
    }
    
    const normalized = fromUnit.toLowerCase().replace(/[\s\-_]/g, '')
    for (const [unit, factor] of Object.entries(conversions)) {
      if (normalized.includes(unit.toLowerCase().replace(/[\s\-_²2]/g, ''))) {
        return value * factor
      }
    }
    return null
  }

  // Current density conversions (target: mA/cm²)
  static convertCurrentDensity(value: number, fromUnit: string): number | null {
    const conversions: Record<string, number> = {
      'mA/cm²': 1,
      'mA/cm2': 1,
      'A/m²': 0.1,
      'A/m2': 0.1,
      'μA/cm²': 0.001,
      'μA/cm2': 0.001,
      'A/cm²': 1000,
      'A/cm2': 1000
    }
    
    const normalized = fromUnit.toLowerCase().replace(/[\s\-_]/g, '')
    for (const [unit, factor] of Object.entries(conversions)) {
      if (normalized.includes(unit.toLowerCase().replace(/[\s\-_²2]/g, ''))) {
        return value * factor
      }
    }
    return null
  }

  // Temperature conversions (target: °C)
  static convertTemperature(value: number, fromUnit: string): number | null {
    const unit = fromUnit.toLowerCase().trim()
    
    if (unit.includes('c') || unit.includes('celsius')) {
      return value
    } else if (unit.includes('k') || unit.includes('kelvin')) {
      return value - 273.15
    } else if (unit.includes('f') || unit.includes('fahrenheit')) {
      return (value - 32) * 5/9
    }
    
    return null
  }

  // Generic metric converter
  static convertMetric(metric: PerformanceMetric, targetUnit: string): PerformanceMetric | null {
    let convertedValue: number | null = null
    
    if (targetUnit === 'mW/m²') {
      convertedValue = this.convertPowerDensity(metric.value, metric.unit)
    } else if (targetUnit === 'mA/cm²') {
      convertedValue = this.convertCurrentDensity(metric.value, metric.unit)
    } else if (targetUnit === '°C') {
      convertedValue = this.convertTemperature(metric.value, metric.unit)
    }
    
    if (convertedValue === null) return null
    
    return {
      value: convertedValue,
      unit: targetUnit,
      confidence: metric.confidence || 0.8
    }
  }
}

// Data quality scoring
export class DataQualityScorer {
  static scoreExtractedData(data: ExtractedData): number {
    let score = 0
    let maxScore = 0
    
    // Performance metrics (60% of score)
    const performanceMetrics = [
      'power_density', 'current_density', 'voltage', 
      'coulombic_efficiency', 'cod_removal_efficiency'
    ]
    
    performanceMetrics.forEach(metric => {
      maxScore += 12
      if (data[metric as keyof ExtractedData]) {
        score += 12
      }
    })
    
    // Materials (20% of score)
    maxScore += 20
    if (data.anode_materials?.length || data.cathode_materials?.length) {
      score += 20
    }
    
    // System information (15% of score)
    maxScore += 15
    if (data.system_type && data.substrate) {
      score += 15
    }
    
    // Key findings (5% of score)
    maxScore += 5
    if (data.key_findings?.length) {
      score += 5
    }
    
    return Math.round((score / maxScore) * 100)
  }
  
  static validateDataCompleteness(data: ExtractedData): string[] {
    const issues: string[] = []
    
    if (!data.has_performance_data) {
      issues.push('No performance data flag set')
    }
    
    if (!data.power_density && !data.current_density) {
      issues.push('Missing critical performance metrics')
    }
    
    if (!data.anode_materials?.length && !data.cathode_materials?.length) {
      issues.push('Missing electrode material information')
    }
    
    if (!data.system_type) {
      issues.push('System type not identified')
    }
    
    return issues
  }
}

// Validation utilities
export class DataValidator {
  static validateExtractedData(rawData: any): { 
    isValid: boolean, 
    data?: ExtractedData, 
    errors: string[] 
  } {
    try {
      const validatedData = ExtractedDataSchema.parse(rawData)
      const qualityIssues = DataQualityScorer.validateDataCompleteness(validatedData)
      
      return {
        isValid: true,
        data: validatedData,
        errors: qualityIssues
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }
      }
      
      return {
        isValid: false,
        errors: ['Unknown validation error']
      }
    }
  }
  
  static standardizeExtractedData(data: ExtractedData): ExtractedData {
    const standardized = { ...data }
    
    // Standardize power density to mW/m²
    if (data.power_density) {
      const converted = UnitConverter.convertMetric(data.power_density, 'mW/m²')
      if (converted) {
        standardized.power_density = converted
      }
    }
    
    // Standardize current density to mA/cm²
    if (data.current_density) {
      const converted = UnitConverter.convertMetric(data.current_density, 'mA/cm²')
      if (converted) {
        standardized.current_density = converted
      }
    }
    
    // Standardize temperature to °C
    if (data.temperature) {
      const converted = UnitConverter.convertMetric(data.temperature, '°C')
      if (converted) {
        standardized.temperature = converted
      }
    }
    
    return standardized
  }
}

// Example successful extraction for prompt templates
export const SUCCESSFUL_EXTRACTION_EXAMPLES = [
  {
    title: "High-performance microbial fuel cell with graphene anode",
    abstract: "We developed an MFC with graphene-enhanced anode achieving power density of 1250 mW/m² and current density of 2.1 mA/cm² with 85% coulombic efficiency using E. coli.",
    expected_output: {
      power_density: { value: 1250, unit: "mW/m²" },
      current_density: { value: 2.1, unit: "mA/cm²" },
      coulombic_efficiency: 85,
      anode_materials: [{ name: "graphene", type: "anode" }],
      microorganisms: [{ name: "E. coli", type: "bacteria" }],
      system_type: "MFC",
      has_performance_data: true
    }
  },
  {
    title: "Wastewater treatment using dual-chamber MFC",
    abstract: "Dual-chamber MFC treated municipal wastewater achieving 78% COD removal and 65% BOD removal with carbon cloth electrodes at pH 7.2 and 30°C.",
    expected_output: {
      cod_removal_efficiency: 78,
      bod_removal_efficiency: 65,
      anode_materials: [{ name: "carbon cloth", type: "anode" }],
      cathode_materials: [{ name: "carbon cloth", type: "cathode" }],
      ph: 7.2,
      temperature: { value: 30, unit: "°C" },
      system_type: "MFC",
      substrate: "municipal wastewater",
      has_performance_data: true
    }
  }
]