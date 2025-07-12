#!/usr/bin/env npx tsx

import prisma from '../../lib/db'
import { z } from 'zod'

/**
 * Enhanced Data Extractor using MESS Parameter Library
 * 
 * This script extracts data from research papers using the comprehensive
 * parameter structure defined in MESS_PARAMETER_LIBRARY.md
 */

// Parameter Library Schema Definitions
const EnvironmentalParametersSchema = z.object({
  temperature: z.object({
    operating: z.number().min(4).max(80).optional(),
    ambient: z.number().min(-50).max(60).optional(),
    fluctuation: z.number().min(0).max(20).optional(),
    gradient: z.number().min(0).max(10).optional()
  }).optional(),
  pressure: z.object({
    atmospheric: z.number().min(50).max(110).optional(),
    gauge: z.number().min(-100).max(1000).optional(),
    partial_O2: z.number().min(0).max(100).optional(),
    partial_CO2: z.number().min(0).max(100).optional(),
    partial_H2: z.number().min(0).max(100).optional()
  }).optional(),
  humidity: z.object({
    relative: z.number().min(0).max(100).optional(),
    absolute: z.number().min(0).max(50).optional(),
    dew_point: z.number().min(-50).max(50).optional()
  }).optional(),
  light: z.object({
    intensity: z.number().min(0).max(2000).optional(),
    duration: z.number().min(0).max(24).optional(),
    spectrum_peak: z.number().min(350).max(750).optional(),
    uv_intensity: z.number().min(0).max(100).optional()
  }).optional(),
  gas_composition: z.object({
    oxygen_concentration: z.number().min(0).max(100).optional(),
    carbon_dioxide_ppm: z.number().min(0).max(50000).optional(),
    nitrogen_concentration: z.number().min(0).max(100).optional()
  }).optional()
}).optional()

const CellLevelParametersSchema = z.object({
  geometry: z.object({
    cell_type: z.enum(['cylindrical', 'rectangular', 'cubic', 'custom']).optional(),
    cell_volume: z.number().min(10).max(5000).optional(), // mL
    working_volume: z.number().min(5).max(4500).optional(), // mL
    cell_diameter: z.number().min(10).max(500).optional(), // mm
    cell_height: z.number().min(10).max(1000).optional() // mm
  }).optional(),
  electrodes: z.object({
    anode_area: z.number().min(0.1).max(100).optional(), // cm²
    cathode_area: z.number().min(0.1).max(100).optional(), // cm²
    electrode_spacing: z.number().min(1).max(100).optional(), // mm
    arrangement: z.enum(['parallel', 'sandwich', 'concentric']).optional()
  }).optional(),
  performance: z.object({
    open_circuit_voltage: z.number().min(0).max(2).optional(), // V
    operating_voltage: z.number().min(0).max(1.5).optional(), // V
    current_density: z.number().min(0).max(100).optional(), // A/m²
    power_density: z.number().min(0).max(1000).optional(), // W/m³
    internal_resistance: z.number().min(0.1).max(1000).optional() // Ω
  }).optional()
}).optional()

const MaterialParametersSchema = z.object({
  anode: z.object({
    base_material: z.enum(['carbon_cloth', 'carbon_felt', 'graphite', 'carbon_brush']).optional(),
    surface_area: z.number().min(0.1).max(1000).optional(), // m²/g
    conductivity: z.number().min(1000).max(50000).optional(), // S/m
    porosity: z.number().min(70).max(95).optional(), // %
    modifications: z.array(z.string()).optional(),
    biocompatibility_score: z.number().min(1).max(10).optional()
  }).optional(),
  cathode: z.object({
    base_material: z.enum(['carbon_cloth', 'carbon_paper', 'metal_mesh']).optional(),
    catalyst_type: z.enum(['platinum', 'MnO2', 'activated_carbon', 'metal_free']).optional(),
    catalyst_loading: z.number().min(0).max(10).optional(), // mg/cm²
    oxygen_permeability: z.number().min(0).max(1).optional(), // cm³/cm²·s
    water_resistance: z.number().min(1).max(10).optional()
  }).optional(),
  membrane: z.object({
    type: z.enum(['nafion', 'PES', 'SPEEK', 'ceramic', 'none']).optional(),
    thickness: z.number().min(10).max(500).optional(), // μm
    conductivity: z.number().min(0.1).max(100).optional(), // mS/cm
    selectivity: z.number().min(80).max(99).optional() // %
  }).optional()
}).optional()

const BiologicalParametersSchema = z.object({
  organisms: z.array(z.object({
    species: z.string(),
    type: z.enum(['pure', 'consortium', 'biofilm']),
    optimal_temperature: z.number().min(4).max(80).optional(),
    optimal_ph: z.number().min(3).max(11).optional(),
    electrogenicity: z.number().min(1).max(10).optional(),
    growth_rate: z.number().min(0.01).max(5).optional()
  })).optional(),
  biofilm: z.object({
    thickness: z.number().min(1).max(1000).optional(), // μm
    density: z.number().min(0.01).max(0.5).optional(), // g/cm³
    porosity: z.number().min(50).max(95).optional(), // %
    coverage: z.number().min(10).max(100).optional(), // %
    maturation_time: z.number().min(1).max(30).optional(), // days
    conductivity: z.number().min(1e-6).max(1e-2).optional() // S/m
  }).optional(),
  substrates: z.object({
    carbon_source: z.enum(['acetate', 'glucose', 'lactate', 'wastewater']).optional(),
    concentration: z.number().min(0.1).max(100).optional(), // g/L
    cod_content: z.number().min(100).max(100000).optional(), // mg/L
    nitrogen_source: z.enum(['NH4Cl', 'NaNO3', 'urea', 'peptone']).optional(),
    phosphorus_source: z.enum(['KH2PO4', 'Na2HPO4', 'organic']).optional()
  }).optional()
}).optional()

const PerformanceMetricsSchema = z.object({
  electrical: z.object({
    power_density_volumetric: z.number().min(0.1).max(1000).optional(), // W/m³
    power_density_surface: z.number().min(0.001).max(100).optional(), // W/m²
    coulombic_efficiency: z.number().min(1).max(100).optional(), // %
    energy_efficiency: z.number().min(1).max(50).optional(), // %
    voltage_efficiency: z.number().min(10).max(90).optional(), // %
    maximum_power: z.number().min(0.001).max(10000).optional() // W
  }).optional(),
  treatment: z.object({
    cod_removal_efficiency: z.number().min(10).max(99).optional(), // %
    bod_removal_efficiency: z.number().min(10).max(99).optional(), // %
    nitrogen_removal: z.number().min(5).max(95).optional(), // %
    phosphorus_removal: z.number().min(5).max(90).optional() // %
  }).optional(),
  production: z.object({
    hydrogen_rate: z.number().min(0).max(100).optional(), // L/m²·day
    methane_rate: z.number().min(0).max(50).optional() // L/m²·day
  }).optional()
}).optional()

// Complete Parameter Extraction Schema
const ExtractedParametersSchema = z.object({
  version: z.string().default('1.0.0'),
  extraction_date: z.string().default(new Date().toISOString()),
  extraction_method: z.string().default('parameter-library-enhanced-v1'),
  
  environmental: EnvironmentalParametersSchema,
  cell_level: CellLevelParametersSchema,
  materials: MaterialParametersSchema,
  biological: BiologicalParametersSchema,
  performance: PerformanceMetricsSchema,
  
  // Quality and validation metrics
  parameter_coverage: z.object({
    categories_covered: z.number().min(0).max(15),
    total_parameters_found: z.number().min(0),
    quantitative_parameters: z.number().min(0),
    confidence_score: z.number().min(0).max(1)
  }).optional(),
  
  validation_results: z.object({
    cross_parameter_consistency: z.number().min(0).max(1),
    unit_consistency: z.boolean(),
    range_violations: z.array(z.string()).default([]),
    missing_critical_parameters: z.array(z.string()).default([])
  }).optional()
})

type ExtractedParameters = z.infer<typeof ExtractedParametersSchema>

/**
 * Enhanced Pattern Matching for Parameter Extraction
 */
class ParameterExtractor {
  
  // Temperature patterns
  private temperaturePatterns = [
    /temperature[s]?\s*(?:of|was|were|at|maintained|controlled|set|kept)?\s*(?:at|to|around|approximately|~)?\s*(\d+(?:\.\d+)?)\s*°?[°C℃]/gi,
    /(\d+(?:\.\d+)?)\s*°C/gi,
    /room\s*temperature/gi,
    /ambient\s*temperature/gi,
    /mesophilic\s*(?:conditions?|temperature)/gi // ~35°C
  ]

  // pH patterns
  private phPatterns = [
    /pH\s*(?:of|was|were|at|maintained|controlled|set|adjusted|to)?\s*(?:at|to|around|approximately|~)?\s*(\d+(?:\.\d+)?)/gi,
    /pH\s*(\d+(?:\.\d+)?)/gi,
    /neutral\s*pH/gi // ~7.0
  ]

  // Power density patterns
  private powerDensityPatterns = [
    /power\s*density[:\s]*(\d+(?:\.\d+)?)\s*(?:mW|W)?\/m[²³2³]/gi,
    /(\d+(?:\.\d+)?)\s*(?:mW|W)\/m[²³2³]/gi,
    /maximum\s*power[:\s]*(\d+(?:\.\d+)?)\s*(?:mW|W)/gi
  ]

  // Current density patterns
  private currentDensityPatterns = [
    /current\s*density[:\s]*(\d+(?:\.\d+)?)\s*(?:mA|A)\/(?:cm²|m²)/gi,
    /(\d+(?:\.\d+)?)\s*(?:mA|A)\/(?:cm²|m²)/gi
  ]

  // Voltage patterns
  private voltagePatterns = [
    /(?:open\s*circuit\s*)?voltage[:\s]*(\d+(?:\.\d+)?)\s*[mV]/gi,
    /(?:OCV|open\s*circuit)[:\s]*(\d+(?:\.\d+)?)\s*[mV]/gi,
    /operating\s*voltage[:\s]*(\d+(?:\.\d+)?)\s*[mV]/gi
  ]

  // Efficiency patterns
  private efficiencyPatterns = [
    /coulombic\s*efficiency[:\s]*(\d+(?:\.\d+)?)\s*%/gi,
    /energy\s*efficiency[:\s]*(\d+(?:\.\d+)?)\s*%/gi,
    /CE[:\s]*(\d+(?:\.\d+)?)\s*%/gi
  ]

  // Volume patterns
  private volumePatterns = [
    /(?:reactor|cell|chamber)\s*volume[:\s]*(\d+(?:\.\d+)?)\s*(?:mL|L|ml|l)/gi,
    /volume[:\s]*(\d+(?:\.\d+)?)\s*(?:mL|L|ml|l)/gi,
    /(\d+(?:\.\d+)?)\s*(?:mL|L|ml|l)\s*(?:reactor|cell|chamber)/gi
  ]

  // Electrode area patterns
  private electrodeAreaPatterns = [
    /(?:anode|cathode|electrode)\s*(?:surface\s*)?area[:\s]*(\d+(?:\.\d+)?)\s*cm[²2]/gi,
    /surface\s*area[:\s]*(\d+(?:\.\d+)?)\s*cm[²2]/gi
  ]

  // Material patterns
  private materialPatterns = [
    /carbon\s*cloth/gi,
    /carbon\s*felt/gi,
    /carbon\s*paper/gi,
    /graphite\s*(?:rod|plate|electrode)/gi,
    /platinum\s*(?:catalyst|black)/gi,
    /MnO[₂2]/gi,
    /nafion/gi,
    /activated\s*carbon/gi
  ]

  // Organism patterns
  private organismPatterns = [
    /Geobacter\s*sulfurreducens/gi,
    /Shewanella\s*oneidensis/gi,
    /Pseudomonas\s*aeruginosa/gi,
    /mixed\s*culture/gi,
    /anaerobic\s*sludge/gi,
    /wastewater\s*(?:sludge|inoculum)/gi
  ]

  /**
   * Extract environmental parameters from text
   */
  extractEnvironmental(text: string): any {
    const environmental: any = {}

    // Temperature extraction
    const tempMatches = this.extractWithPatterns(text, this.temperaturePatterns)
    if (tempMatches.length > 0) {
      environmental.temperature = {
        operating: this.parseNumericValue(tempMatches[0])
      }
    }

    // pH extraction
    const phMatches = this.extractWithPatterns(text, this.phPatterns)
    if (phMatches.length > 0) {
      environmental.ph = this.parseNumericValue(phMatches[0])
    }

    // Room temperature assumption
    if (text.toLowerCase().includes('room temperature')) {
      environmental.temperature = { operating: 25 }
    }

    return Object.keys(environmental).length > 0 ? environmental : undefined
  }

  /**
   * Extract cell-level parameters from text
   */
  extractCellLevel(text: string): any {
    const cellLevel: any = {}

    // Volume extraction
    const volumeMatches = this.extractWithPatterns(text, this.volumePatterns)
    if (volumeMatches.length > 0) {
      const volume = this.parseNumericValue(volumeMatches[0])
      if (volume) {
        // Convert to mL if needed
        const volumeML = text.toLowerCase().includes(' l ') || text.toLowerCase().includes('liter') 
          ? volume * 1000 : volume
        
        cellLevel.geometry = { cell_volume: volumeML }
      }
    }

    // Electrode area extraction
    const areaMatches = this.extractWithPatterns(text, this.electrodeAreaPatterns)
    if (areaMatches.length > 0) {
      const area = this.parseNumericValue(areaMatches[0])
      if (area) {
        cellLevel.electrodes = { anode_area: area, cathode_area: area }
      }
    }

    // Voltage extraction
    const voltageMatches = this.extractWithPatterns(text, this.voltagePatterns)
    if (voltageMatches.length > 0) {
      const voltage = this.parseNumericValue(voltageMatches[0])
      if (voltage) {
        cellLevel.performance = { 
          open_circuit_voltage: voltage > 1 ? voltage / 1000 : voltage // Convert mV to V
        }
      }
    }

    return Object.keys(cellLevel).length > 0 ? cellLevel : undefined
  }

  /**
   * Extract material parameters from text
   */
  extractMaterials(text: string): any {
    const materials: any = {}

    // Anode materials
    const anodeMaterials = this.materialPatterns.filter(pattern => {
      const matches = text.match(pattern)
      return matches && text.toLowerCase().includes('anode')
    })

    if (anodeMaterials.length > 0 || text.toLowerCase().includes('carbon cloth')) {
      materials.anode = {
        base_material: 'carbon_cloth', // Most common default
        modifications: []
      }
    }

    // Cathode materials
    if (text.toLowerCase().includes('platinum') || text.toLowerCase().includes('pt')) {
      materials.cathode = {
        catalyst_type: 'platinum'
      }
    } else if (text.toLowerCase().includes('mno') || text.toLowerCase().includes('manganese')) {
      materials.cathode = {
        catalyst_type: 'MnO2'
      }
    }

    // Membrane
    if (text.toLowerCase().includes('nafion')) {
      materials.membrane = {
        type: 'nafion'
      }
    } else if (text.toLowerCase().includes('proton exchange') || text.toLowerCase().includes('pem')) {
      materials.membrane = {
        type: 'nafion' // Assumption for PEM
      }
    }

    return Object.keys(materials).length > 0 ? materials : undefined
  }

  /**
   * Extract biological parameters from text
   */
  extractBiological(text: string): any {
    const biological: any = {}

    // Organism identification
    const organisms: any[] = []
    
    this.organismPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          organisms.push({
            species: match.trim(),
            type: match.toLowerCase().includes('mixed') ? 'consortium' : 'pure'
          })
        })
      }
    })

    if (organisms.length > 0) {
      biological.organisms = organisms
    }

    // Substrate information
    const substrates: any = {}
    
    if (text.toLowerCase().includes('acetate')) {
      substrates.carbon_source = 'acetate'
    } else if (text.toLowerCase().includes('glucose')) {
      substrates.carbon_source = 'glucose'
    } else if (text.toLowerCase().includes('wastewater')) {
      substrates.carbon_source = 'wastewater'
    }

    // COD extraction
    const codMatches = text.match(/COD[:\s]*(\d+(?:\.\d+)?)\s*(?:mg\/L|ppm)/gi)
    if (codMatches && codMatches.length > 0) {
      const cod = this.parseNumericValue(codMatches[0])
      if (cod) substrates.cod_content = cod
    }

    if (Object.keys(substrates).length > 0) {
      biological.substrates = substrates
    }

    return Object.keys(biological).length > 0 ? biological : undefined
  }

  /**
   * Extract performance metrics from text
   */
  extractPerformance(text: string): any {
    const performance: any = {}

    // Power density
    const powerMatches = this.extractWithPatterns(text, this.powerDensityPatterns)
    if (powerMatches.length > 0) {
      const power = this.parseNumericValue(powerMatches[0])
      if (power) {
        performance.electrical = {
          power_density_volumetric: text.toLowerCase().includes('mw') ? power : power * 1000
        }
      }
    }

    // Current density
    const currentMatches = this.extractWithPatterns(text, this.currentDensityPatterns)
    if (currentMatches.length > 0) {
      const current = this.parseNumericValue(currentMatches[0])
      if (current) {
        if (!performance.electrical) performance.electrical = {}
        performance.electrical.current_density = text.toLowerCase().includes('ma') ? current / 100 : current
      }
    }

    // Efficiency
    const efficiencyMatches = this.extractWithPatterns(text, this.efficiencyPatterns)
    if (efficiencyMatches.length > 0) {
      const efficiency = this.parseNumericValue(efficiencyMatches[0])
      if (efficiency) {
        if (!performance.electrical) performance.electrical = {}
        performance.electrical.coulombic_efficiency = efficiency
      }
    }

    // COD removal efficiency
    const codRemovalMatches = text.match(/COD\s*removal[:\s]*(\d+(?:\.\d+)?)\s*%/gi)
    if (codRemovalMatches && codRemovalMatches.length > 0) {
      const removal = this.parseNumericValue(codRemovalMatches[0])
      if (removal) {
        performance.treatment = {
          cod_removal_efficiency: removal
        }
      }
    }

    return Object.keys(performance).length > 0 ? performance : undefined
  }

  /**
   * Calculate parameter coverage and quality metrics
   */
  calculateQualityMetrics(extracted: any): any {
    let categoriesCovered = 0
    let totalParameters = 0
    let quantitativeParameters = 0

    // Count coverage
    if (extracted.environmental) {
      categoriesCovered++
      totalParameters += this.countParameters(extracted.environmental)
      quantitativeParameters += this.countQuantitativeParameters(extracted.environmental)
    }
    if (extracted.cell_level) {
      categoriesCovered++
      totalParameters += this.countParameters(extracted.cell_level)
      quantitativeParameters += this.countQuantitativeParameters(extracted.cell_level)
    }
    if (extracted.materials) {
      categoriesCovered++
      totalParameters += this.countParameters(extracted.materials)
      quantitativeParameters += this.countQuantitativeParameters(extracted.materials)
    }
    if (extracted.biological) {
      categoriesCovered++
      totalParameters += this.countParameters(extracted.biological)
      quantitativeParameters += this.countQuantitativeParameters(extracted.biological)
    }
    if (extracted.performance) {
      categoriesCovered++
      totalParameters += this.countParameters(extracted.performance)
      quantitativeParameters += this.countQuantitativeParameters(extracted.performance)
    }

    return {
      categories_covered: categoriesCovered,
      total_parameters_found: totalParameters,
      quantitative_parameters: quantitativeParameters,
      confidence_score: Math.min(categoriesCovered / 5, 1) // Max confidence when 5+ categories covered
    }
  }

  /**
   * Helper methods
   */
  private extractWithPatterns(text: string, patterns: RegExp[]): string[] {
    const matches: string[] = []
    patterns.forEach(pattern => {
      const found = text.match(pattern)
      if (found) matches.push(...found)
    })
    return matches
  }

  private parseNumericValue(text: string): number | null {
    const match = text.match(/(\d+(?:\.\d+)?)/)
    return match ? parseFloat(match[1]) : null
  }

  private countParameters(obj: any): number {
    let count = 0
    for (const key in obj) {
      if (obj[key] !== null && obj[key] !== undefined) {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          count += this.countParameters(obj[key])
        } else {
          count++
        }
      }
    }
    return count
  }

  private countQuantitativeParameters(obj: any): number {
    let count = 0
    for (const key in obj) {
      if (typeof obj[key] === 'number') {
        count++
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
        count += this.countQuantitativeParameters(obj[key])
      }
    }
    return count
  }

  /**
   * Main extraction method
   */
  extractParameters(title: string, abstract: string | null): ExtractedParameters {
    const fullText = `${title} ${abstract || ''}`
    
    const extracted: any = {
      version: '1.0.0',
      extraction_date: new Date().toISOString(),
      extraction_method: 'parameter-library-enhanced-v1',
      environmental: this.extractEnvironmental(fullText),
      cell_level: this.extractCellLevel(fullText),
      materials: this.extractMaterials(fullText),
      biological: this.extractBiological(fullText),
      performance: this.extractPerformance(fullText)
    }

    // Calculate quality metrics
    extracted.parameter_coverage = this.calculateQualityMetrics(extracted)

    // Basic validation
    extracted.validation_results = {
      cross_parameter_consistency: 0.8, // Placeholder - would implement full validation
      unit_consistency: true,
      range_violations: [],
      missing_critical_parameters: []
    }

    return ExtractedParametersSchema.parse(extracted)
  }
}

/**
 * Process papers with enhanced parameter extraction
 */
async function processWithParameterLibrary(limit: number = 50) {
  const extractor = new ParameterExtractor()
  
  console.log('🔬 Starting Parameter Library Enhanced Extraction...')
  console.log(`Processing ${limit} papers with comprehensive parameter extraction`)

  // Get papers that haven't been processed with this method
  const papers = await prisma.researchPaper.findMany({
    where: {
      OR: [
        { aiDataExtraction: null },
        { 
          NOT: {
            aiDataExtraction: {
              contains: 'parameter-library-enhanced-v1'
            }
          }
        }
      ]
    },
    select: {
      id: true,
      title: true,
      abstract: true,
      systemType: true,
      powerOutput: true,
      efficiency: true
    },
    take: limit
  })

  console.log(`Found ${papers.length} papers to process`)

  let processed = 0
  let enhanced = 0
  let errors = 0

  for (const paper of papers) {
    try {
      console.log(`\nProcessing: ${paper.title.substring(0, 80)}...`)
      
      // Extract parameters using the library
      const extractedParams = extractor.extractParameters(paper.title, paper.abstract)
      
      // Calculate quality score based on parameter coverage
      const qualityScore = Math.min(
        (extractedParams.parameter_coverage?.categories_covered || 0) * 15 + // 15 points per category
        (extractedParams.parameter_coverage?.quantitative_parameters || 0) * 2, // 2 points per quantitative param
        100
      )

      // Update paper with extracted parameters
      await prisma.researchPaper.update({
        where: { id: paper.id },
        data: {
          aiDataExtraction: JSON.stringify(extractedParams),
          aiProcessingDate: new Date(),
          aiModelVersion: 'parameter-library-enhanced-v1',
          aiConfidence: extractedParams.parameter_coverage?.confidence_score || 0,
          
          // Update structured fields
          experimentalConditions: extractedParams.environmental ? JSON.stringify(extractedParams.environmental) : null,
          reactorConfiguration: extractedParams.cell_level ? JSON.stringify(extractedParams.cell_level) : null,
          electrodeSpecifications: extractedParams.materials ? JSON.stringify(extractedParams.materials) : null,
          biologicalParameters: extractedParams.biological ? JSON.stringify(extractedParams.biological) : null,
          performanceMetrics: extractedParams.performance ? JSON.stringify(extractedParams.performance) : null
        }
      })

      processed++
      
      if (extractedParams.parameter_coverage && extractedParams.parameter_coverage.categories_covered > 2) {
        enhanced++
        console.log(`  ✅ Enhanced: ${extractedParams.parameter_coverage.categories_covered} categories, ${extractedParams.parameter_coverage.total_parameters_found} parameters`)
      } else {
        console.log(`  ⚪ Basic: ${extractedParams.parameter_coverage?.categories_covered || 0} categories`)
      }

    } catch (error) {
      console.error(`  ❌ Error processing paper ${paper.id}:`, error.message)
      errors++
    }
  }

  console.log(`\n📊 Processing Complete:`)
  console.log(`  Processed: ${processed}`)
  console.log(`  Enhanced: ${enhanced}`)
  console.log(`  Errors: ${errors}`)
  console.log(`  Enhancement Rate: ${((enhanced / processed) * 100).toFixed(1)}%`)

  // Generate quality report
  const qualityReport = await generateQualityReport()
  console.log(`\n📋 Database Quality Report:`)
  console.log(qualityReport)
}

/**
 * Generate database quality report
 */
async function generateQualityReport(): Promise<string> {
  const totalPapers = await prisma.researchPaper.count()
  const processedPapers = await prisma.researchPaper.count({
    where: {
      aiDataExtraction: {
        contains: 'parameter-library-enhanced-v1'
      }
    }
  })

  // Count papers by parameter categories covered
  const papers = await prisma.researchPaper.findMany({
    where: {
      aiDataExtraction: {
        contains: 'parameter-library-enhanced-v1'
      }
    },
    select: {
      aiDataExtraction: true,
      aiConfidence: true
    }
  })

  let highQuality = 0 // 4+ categories
  let mediumQuality = 0 // 2-3 categories  
  let basicQuality = 0 // 1 category
  let totalParametersExtracted = 0

  papers.forEach(paper => {
    try {
      const data = JSON.parse(paper.aiDataExtraction || '{}')
      const categories = data.parameter_coverage?.categories_covered || 0
      const params = data.parameter_coverage?.total_parameters_found || 0
      
      totalParametersExtracted += params
      
      if (categories >= 4) highQuality++
      else if (categories >= 2) mediumQuality++
      else if (categories >= 1) basicQuality++
    } catch (e) {
      // Skip invalid JSON
    }
  })

  return `
  Total Papers: ${totalPapers}
  Parameter-Processed: ${processedPapers} (${((processedPapers/totalPapers)*100).toFixed(1)}%)
  
  Quality Distribution:
  📊 High Quality (4+ categories): ${highQuality}
  📊 Medium Quality (2-3 categories): ${mediumQuality}  
  📊 Basic Quality (1 category): ${basicQuality}
  
  📈 Total Parameters Extracted: ${totalParametersExtracted}
  📈 Average Parameters per Paper: ${(totalParametersExtracted / papers.length).toFixed(1)}
  📈 Average Quality Score: ${papers.reduce((sum, p) => sum + (p.aiConfidence || 0), 0) / papers.length * 100}%
  `
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const limit = parseInt(args[0]) || 50

  await processWithParameterLibrary(limit)
  await prisma.$disconnect()
}

if (require.main === module) {
  main().catch(console.error)
}

export { ParameterExtractor, processWithParameterLibrary }