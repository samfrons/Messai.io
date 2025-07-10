#!/usr/bin/env npx tsx

import prisma from '../../lib/db'
import { z } from 'zod'

/**
 * Cross-Parameter Validation Framework
 * 
 * Validates extracted parameters against physical constraints and relationships
 * defined in MESS_PARAMETER_LIBRARY.md
 */

interface ValidationResult {
  is_valid: boolean
  confidence_score: number       // 0-1
  violations: ValidationViolation[]
  warnings: ValidationWarning[]
  consistency_score: number      // 0-1
  physical_plausibility: number  // 0-1
  recommendations: string[]
}

interface ValidationViolation {
  type: 'range' | 'units' | 'relationship' | 'physical'
  severity: 'critical' | 'major' | 'minor'
  parameter: string
  value: any
  expected_range?: string
  relationship?: string
  message: string
}

interface ValidationWarning {
  type: 'missing' | 'unusual' | 'incomplete'
  parameter: string
  message: string
  impact: 'high' | 'medium' | 'low'
}

/**
 * Parameter validation rules based on MESS_PARAMETER_LIBRARY.md
 */
const VALIDATION_RULES = {
  // Physical constraints from parameter library
  ranges: {
    // Environmental parameters
    'environmental.temperature.operating': { min: 4, max: 80, unit: '°C' },
    'environmental.pressure.atmospheric': { min: 50, max: 110, unit: 'kPa' },
    'environmental.humidity.relative': { min: 0, max: 100, unit: '%' },
    
    // Cell parameters
    'cell_level.geometry.cell_volume': { min: 10, max: 5000, unit: 'mL' },
    'cell_level.electrodes.anode_area': { min: 0.1, max: 100, unit: 'cm²' },
    'cell_level.electrodes.electrode_spacing': { min: 1, max: 100, unit: 'mm' },
    'cell_level.performance.operating_voltage': { min: 0, max: 1.5, unit: 'V' },
    'cell_level.performance.current_density': { min: 0, max: 100, unit: 'A/m²' },
    'cell_level.performance.power_density': { min: 0, max: 1000, unit: 'W/m³' },
    
    // Performance metrics
    'performance.electrical.coulombic_efficiency': { min: 1, max: 100, unit: '%' },
    'performance.electrical.energy_efficiency': { min: 1, max: 50, unit: '%' },
    'performance.treatment.cod_removal_efficiency': { min: 10, max: 99, unit: '%' },
    
    // Biological parameters
    'biological.biofilm.thickness': { min: 1, max: 1000, unit: 'μm' },
    'biological.substrates.concentration': { min: 0.1, max: 100, unit: 'g/L' },
    
    // Material parameters
    'materials.cathode.catalyst_loading': { min: 0, max: 10, unit: 'mg/cm²' },
    'materials.membrane.thickness': { min: 10, max: 500, unit: 'μm' }
  },

  // Physical relationships that must be maintained
  relationships: [
    {
      name: 'ohms_law',
      description: 'V = I × R (Ohm\'s law for electrical circuits)',
      validate: (data: any) => {
        const voltage = data.cell_level?.performance?.operating_voltage
        const current = data.cell_level?.performance?.current_density
        const resistance = data.cell_level?.performance?.internal_resistance
        
        if (voltage && current && resistance) {
          const expected_voltage = (current / 10000) * resistance // Convert A/m² to A
          const tolerance = 0.3 // 30% tolerance
          return Math.abs(voltage - expected_voltage) / voltage < tolerance
        }
        return true // Cannot validate without all parameters
      }
    },
    {
      name: 'power_relationship',
      description: 'P = V × I (Power relationship)',
      validate: (data: any) => {
        const voltage = data.cell_level?.performance?.operating_voltage
        const current = data.cell_level?.performance?.current_density
        const power = data.performance?.electrical?.power_density_volumetric
        const area = data.cell_level?.electrodes?.anode_area
        const volume = data.cell_level?.geometry?.cell_volume
        
        if (voltage && current && power && area && volume) {
          const current_amps = (current * area) / 10000 // Convert A/m² to A
          const calculated_power = voltage * current_amps
          const power_per_volume = (calculated_power * 1000) / (volume / 1000) // W/m³
          
          const tolerance = 0.5 // 50% tolerance for power calculations
          return Math.abs(power - power_per_volume) / power < tolerance
        }
        return true
      }
    },
    {
      name: 'efficiency_relationship',
      description: 'Energy efficiency = Coulombic efficiency × Voltage efficiency',
      validate: (data: any) => {
        const coulombic = data.performance?.electrical?.coulombic_efficiency
        const energy = data.performance?.electrical?.energy_efficiency
        const voltage = data.performance?.electrical?.voltage_efficiency
        
        if (coulombic && energy && voltage) {
          const expected_energy = (coulombic * voltage) / 100
          const tolerance = 0.3
          return Math.abs(energy - expected_energy) / energy < tolerance
        }
        return true
      }
    },
    {
      name: 'biofilm_electrode_relationship',
      description: 'Biofilm thickness should be reasonable for electrode spacing',
      validate: (data: any) => {
        const biofilm_thickness = data.biological?.biofilm?.thickness // μm
        const electrode_spacing = data.cell_level?.electrodes?.electrode_spacing // mm
        
        if (biofilm_thickness && electrode_spacing) {
          const spacing_microns = electrode_spacing * 1000
          // Biofilm should not be more than 50% of electrode spacing
          return biofilm_thickness < (spacing_microns * 0.5)
        }
        return true
      }
    },
    {
      name: 'temperature_organism_compatibility',
      description: 'Operating temperature should be within organism tolerance',
      validate: (data: any) => {
        const temperature = data.environmental?.temperature?.operating
        const organisms = data.biological?.organisms
        
        if (temperature && organisms && organisms.length > 0) {
          // Check if temperature is within reasonable range for any identified organism
          return organisms.some((org: any) => {
            if (org.optimal_temperature) {
              // Allow ±10°C from optimal
              return Math.abs(temperature - org.optimal_temperature) <= 10
            }
            // Default mesophilic range if no specific organism data
            return temperature >= 15 && temperature <= 45
          })
        }
        return true
      }
    }
  ],

  // Critical parameters that should be present for high-quality papers
  critical_parameters: [
    'cell_level.geometry.cell_volume',
    'cell_level.performance.operating_voltage',
    'performance.electrical.power_density_volumetric',
    'environmental.temperature.operating',
    'biological.organisms',
    'materials.anode.base_material'
  ],

  // Parameter combinations that are unusual but not impossible
  unusual_combinations: [
    {
      condition: 'High power density with low voltage',
      check: (data: any) => {
        const power = data.performance?.electrical?.power_density_volumetric
        const voltage = data.cell_level?.performance?.operating_voltage
        return power > 500 && voltage < 0.3
      },
      warning: 'High power density with low voltage is unusual - check current density'
    },
    {
      condition: 'Very high efficiency claims',
      check: (data: any) => {
        const coulombic = data.performance?.electrical?.coulombic_efficiency
        const energy = data.performance?.electrical?.energy_efficiency
        return coulombic > 90 || energy > 30
      },
      warning: 'Very high efficiency values should be verified carefully'
    },
    {
      condition: 'Extreme temperature conditions',
      check: (data: any) => {
        const temp = data.environmental?.temperature?.operating
        return temp < 10 || temp > 60
      },
      warning: 'Extreme temperature conditions may limit practical applicability'
    }
  ]
}

class ParameterValidator {
  
  /**
   * Validate extracted parameters for a paper
   */
  validateParameters(extractedData: any): ValidationResult {
    const violations: ValidationViolation[] = []
    const warnings: ValidationWarning[] = []
    const recommendations: string[] = []
    
    // 1. Range validation
    const rangeResults = this.validateRanges(extractedData)
    violations.push(...rangeResults.violations)
    
    // 2. Relationship validation
    const relationshipResults = this.validateRelationships(extractedData)
    violations.push(...relationshipResults.violations)
    warnings.push(...relationshipResults.warnings)
    
    // 3. Critical parameter presence
    const criticalResults = this.validateCriticalParameters(extractedData)
    warnings.push(...criticalResults.warnings)
    recommendations.push(...criticalResults.recommendations)
    
    // 4. Unusual combination detection
    const unusualResults = this.detectUnusualCombinations(extractedData)
    warnings.push(...unusualResults.warnings)
    
    // Calculate overall scores
    const consistency_score = this.calculateConsistencyScore(violations, warnings)
    const physical_plausibility = this.calculatePhysicalPlausibility(violations)
    const confidence_score = (consistency_score + physical_plausibility) / 2
    
    return {
      is_valid: violations.filter(v => v.severity === 'critical').length === 0,
      confidence_score,
      violations,
      warnings,
      consistency_score,
      physical_plausibility,
      recommendations
    }
  }

  /**
   * Validate parameter ranges against defined limits
   */
  private validateRanges(data: any): { violations: ValidationViolation[] } {
    const violations: ValidationViolation[] = []
    
    Object.entries(VALIDATION_RULES.ranges).forEach(([path, rule]) => {
      const value = this.getNestedValue(data, path)
      
      if (value !== null && value !== undefined) {
        if (typeof value === 'number') {
          if (value < rule.min || value > rule.max) {
            violations.push({
              type: 'range',
              severity: this.getSeverityForRange(path, value, rule),
              parameter: path,
              value: value,
              expected_range: `${rule.min}-${rule.max} ${rule.unit}`,
              message: `${path} value ${value} is outside valid range ${rule.min}-${rule.max} ${rule.unit}`
            })
          }
        }
      }
    })
    
    return { violations }
  }

  /**
   * Validate physical relationships between parameters
   */
  private validateRelationships(data: any): { violations: ValidationViolation[], warnings: ValidationWarning[] } {
    const violations: ValidationViolation[] = []
    const warnings: ValidationWarning[] = []
    
    VALIDATION_RULES.relationships.forEach(relationship => {
      if (!relationship.validate(data)) {
        violations.push({
          type: 'relationship',
          severity: 'major',
          parameter: relationship.name,
          value: 'relationship_violation',
          relationship: relationship.description,
          message: `Physical relationship violated: ${relationship.description}`
        })
      }
    })
    
    return { violations, warnings }
  }

  /**
   * Check for presence of critical parameters
   */
  private validateCriticalParameters(data: any): { warnings: ValidationWarning[], recommendations: string[] } {
    const warnings: ValidationWarning[] = []
    const recommendations: string[] = []
    
    VALIDATION_RULES.critical_parameters.forEach(param => {
      const value = this.getNestedValue(data, param)
      
      if (value === null || value === undefined) {
        warnings.push({
          type: 'missing',
          parameter: param,
          message: `Critical parameter ${param} is missing`,
          impact: 'high'
        })
        
        recommendations.push(`Measure and report ${param} for better data quality`)
      }
    })
    
    return { warnings, recommendations }
  }

  /**
   * Detect unusual but potentially valid parameter combinations
   */
  private detectUnusualCombinations(data: any): { warnings: ValidationWarning[] } {
    const warnings: ValidationWarning[] = []
    
    VALIDATION_RULES.unusual_combinations.forEach(combo => {
      if (combo.check(data)) {
        warnings.push({
          type: 'unusual',
          parameter: 'combination',
          message: combo.warning,
          impact: 'medium'
        })
      }
    })
    
    return { warnings }
  }

  /**
   * Calculate consistency score based on violations and warnings
   */
  private calculateConsistencyScore(violations: ValidationViolation[], warnings: ValidationWarning[]): number {
    let score = 1.0
    
    violations.forEach(violation => {
      switch (violation.severity) {
        case 'critical':
          score -= 0.3
          break
        case 'major':
          score -= 0.2
          break
        case 'minor':
          score -= 0.1
          break
      }
    })
    
    warnings.forEach(warning => {
      switch (warning.impact) {
        case 'high':
          score -= 0.15
          break
        case 'medium':
          score -= 0.1
          break
        case 'low':
          score -= 0.05
          break
      }
    })
    
    return Math.max(score, 0)
  }

  /**
   * Calculate physical plausibility score
   */
  private calculatePhysicalPlausibility(violations: ValidationViolation[]): number {
    const physicalViolations = violations.filter(v => v.type === 'physical' || v.type === 'relationship')
    
    if (physicalViolations.length === 0) return 1.0
    
    let score = 1.0
    physicalViolations.forEach(violation => {
      score -= violation.severity === 'critical' ? 0.4 : 0.2
    })
    
    return Math.max(score, 0)
  }

  /**
   * Determine severity based on how far outside range a value is
   */
  private getSeverityForRange(path: string, value: number, rule: any): 'critical' | 'major' | 'minor' {
    const range = rule.max - rule.min
    const deviation = Math.min(
      Math.abs(value - rule.min), 
      Math.abs(value - rule.max)
    )
    
    // Critical: >100% outside range
    if (deviation > range) return 'critical'
    
    // Major: >50% outside range
    if (deviation > range * 0.5) return 'major'
    
    // Minor: <50% outside range
    return 'minor'
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null
    }, obj)
  }

  /**
   * Batch validate multiple papers
   */
  async validateMultiplePapers(paperIds: string[]): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>()
    
    for (const paperId of paperIds) {
      try {
        const paper = await prisma.researchPaper.findUnique({
          where: { id: paperId },
          select: { aiDataExtraction: true }
        })
        
        if (paper?.aiDataExtraction) {
          const extractedData = JSON.parse(paper.aiDataExtraction)
          const validation = this.validateParameters(extractedData)
          results.set(paperId, validation)
        }
      } catch (error) {
        console.error(`Error validating paper ${paperId}:`, error.message)
      }
    }
    
    return results
  }

  /**
   * Update papers with validation results
   */
  async updateValidationResults(paperIds: string[]): Promise<void> {
    console.log(`Updating validation results for ${paperIds.length} papers...`)
    
    let updated = 0
    for (const paperId of paperIds) {
      try {
        const paper = await prisma.researchPaper.findUnique({
          where: { id: paperId },
          select: { aiDataExtraction: true }
        })
        
        if (paper?.aiDataExtraction) {
          const extractedData = JSON.parse(paper.aiDataExtraction)
          const validation = this.validateParameters(extractedData)
          
          // Update the extracted data with validation results
          extractedData.validation_results = {
            cross_parameter_consistency: validation.consistency_score,
            unit_consistency: validation.violations.filter(v => v.type === 'units').length === 0,
            range_violations: validation.violations.filter(v => v.type === 'range').map(v => v.message),
            missing_critical_parameters: validation.warnings.filter(w => w.type === 'missing').map(w => w.parameter),
            validation_date: new Date().toISOString(),
            is_valid: validation.is_valid,
            confidence_score: validation.confidence_score
          }
          
          await prisma.researchPaper.update({
            where: { id: paperId },
            data: {
              aiDataExtraction: JSON.stringify(extractedData),
              aiConfidence: validation.confidence_score
            }
          })
          
          updated++
          if (updated % 10 === 0) {
            console.log(`  Updated ${updated} papers...`)
          }
        }
      } catch (error) {
        console.error(`Error updating validation for paper ${paperId}:`, error.message)
      }
    }
    
    console.log(`✅ Updated validation results for ${updated} papers`)
  }
}

/**
 * Generate validation report for database
 */
async function generateValidationReport(): Promise<void> {
  console.log('🔍 Generating Parameter Validation Report...')
  
  const validator = new ParameterValidator()
  
  const papers = await prisma.researchPaper.findMany({
    where: {
      aiDataExtraction: { not: null }
    },
    select: {
      id: true,
      title: true,
      aiDataExtraction: true,
      aiConfidence: true
    },
    take: 100 // Sample for report
  })

  console.log(`\nAnalyzing ${papers.length} papers for validation...`)

  let validPapers = 0
  let totalViolations = 0
  let totalWarnings = 0
  const violationTypes: { [key: string]: number } = {}
  const warningTypes: { [key: string]: number } = {}

  for (const paper of papers) {
    try {
      const extractedData = JSON.parse(paper.aiDataExtraction!)
      const validation = validator.validateParameters(extractedData)
      
      if (validation.is_valid) validPapers++
      
      totalViolations += validation.violations.length
      totalWarnings += validation.warnings.length
      
      validation.violations.forEach(v => {
        violationTypes[v.type] = (violationTypes[v.type] || 0) + 1
      })
      
      validation.warnings.forEach(w => {
        warningTypes[w.type] = (warningTypes[w.type] || 0) + 1
      })
      
    } catch (error) {
      console.error(`Error validating paper ${paper.id}`)
    }
  }

  console.log(`\n📊 Validation Summary:`)
  console.log(`  Valid Papers: ${validPapers}/${papers.length} (${(validPapers/papers.length*100).toFixed(1)}%)`)
  console.log(`  Total Violations: ${totalViolations}`)
  console.log(`  Total Warnings: ${totalWarnings}`)
  
  console.log(`\n⚠️  Violation Types:`)
  Object.entries(violationTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`)
  })
  
  console.log(`\n⚡ Warning Types:`)
  Object.entries(warningTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`)
  })

  console.log(`\n📈 Data Quality Metrics:`)
  console.log(`  Average Violations per Paper: ${(totalViolations/papers.length).toFixed(1)}`)
  console.log(`  Average Warnings per Paper: ${(totalWarnings/papers.length).toFixed(1)}`)
  console.log(`  Papers with Critical Issues: ${papers.length - validPapers}`)
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  const validator = new ParameterValidator()

  if (command === 'validate') {
    const limit = parseInt(args[1]) || 50
    
    const papers = await prisma.researchPaper.findMany({
      where: {
        aiDataExtraction: { not: null }
      },
      select: { id: true },
      take: limit
    })

    const paperIds = papers.map(p => p.id)
    await validator.updateValidationResults(paperIds)
    
  } else if (command === 'report') {
    await generateValidationReport()
    
  } else if (command === 'single') {
    const paperId = args[1]
    if (!paperId) {
      console.error('Please provide a paper ID')
      process.exit(1)
    }
    
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      select: { aiDataExtraction: true, title: true }
    })
    
    if (paper?.aiDataExtraction) {
      const extractedData = JSON.parse(paper.aiDataExtraction)
      const validation = validator.validateParameters(extractedData)
      
      console.log(`\nValidation Results for: ${paper.title.substring(0, 80)}...`)
      console.log('Validation Result:', JSON.stringify(validation, null, 2))
    } else {
      console.error('Paper not found or no extracted data')
    }
    
  } else {
    console.log(`
Usage:
  npx tsx parameter-validation-framework.ts validate [limit]  # Validate papers (default: 50)
  npx tsx parameter-validation-framework.ts report           # Generate validation report
  npx tsx parameter-validation-framework.ts single <paper-id> # Validate single paper
`)
  }
  
  await prisma.$disconnect()
}

if (require.main === module) {
  main().catch(console.error)
}

export { ParameterValidator, ValidationResult }