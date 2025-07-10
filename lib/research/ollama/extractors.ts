/**
 * Ollama-based Data Extractors for MESSAi Research Papers
 * Specialized extraction templates and methods for bioelectrochemical systems
 */

import { ollamaClient, OllamaClient } from './client'

// Type definitions for extracted data
export interface PerformanceMetrics {
  powerDensity?: {
    value: number | null
    unit: string | null
    conditions?: string | null
  }
  currentDensity?: {
    value: number | null
    unit: string | null
    conditions?: string | null
  }
  voltage?: {
    value: number | null
    type: 'OCV' | 'operating' | 'max' | null
    conditions?: string | null
  }
  coulombicEfficiency?: {
    value: number | null
    conditions?: string | null
  }
  energyEfficiency?: {
    value: number | null
    conditions?: string | null
  }
  hydrogenProduction?: {
    value: number | null
    unit: string | null
    conditions?: string | null
  }
}

export interface MaterialData {
  anodeMaterials?: Array<{
    name: string
    modifications?: string[]
    properties?: { [key: string]: any }
  }>
  cathodeMaterials?: Array<{
    name: string
    catalyst?: string
    properties?: { [key: string]: any }
  }>
  membrane?: {
    type: string
    properties?: { [key: string]: any }
  }
}

export interface MicrobialData {
  organisms?: Array<{
    name: string
    type: 'pure' | 'mixed' | 'consortium' | 'biofilm'
    source?: string
    role?: string
  }>
  inoculum?: {
    source: string
    pretreatment?: string
  }
  biofilmThickness?: {
    value: number
    unit: string
  }
}

export interface SystemConfiguration {
  systemType?: 'MFC' | 'MEC' | 'MDC' | 'MES' | 'BES' | null
  chamberConfig?: 'single' | 'dual' | 'multi' | null
  volume?: {
    anodeChamber?: number
    cathodeChamber?: number
    unit?: string
  }
  electrodeSpacing?: {
    value: number
    unit: string
  }
  flowRate?: {
    value: number
    unit: string
  }
  operatingMode?: 'batch' | 'continuous' | 'fed-batch' | null
}

export interface OperatingConditions {
  temperature?: {
    value: number
    unit: 'C' | 'K' | 'F'
    range?: { min: number; max: number }
  }
  pH?: {
    anode?: number
    cathode?: number
    controlled?: boolean
  }
  substrate?: {
    type: string
    concentration?: {
      value: number
      unit: string
    }
    cod?: {
      value: number
      unit: string
    }
  }
  hydraulicRetentionTime?: {
    value: number
    unit: string
  }
  externalResistance?: {
    value: number
    unit: string
  }
}

export interface ResearchPaperExtraction {
  performance: PerformanceMetrics
  materials: MaterialData
  microbes: MicrobialData
  systemConfig: SystemConfiguration
  operatingConditions: OperatingConditions
  keyFindings?: string[]
  limitations?: string[]
  confidenceScore?: number
}

export class OllamaExtractor {
  private client: OllamaClient

  constructor(client: OllamaClient = ollamaClient) {
    this.client = client
  }

  /**
   * Extract performance metrics from paper text
   */
  async extractPerformanceMetrics(
    text: string,
    model?: string
  ): Promise<PerformanceMetrics> {
    const template: PerformanceMetrics = {
      powerDensity: { value: null, unit: null, conditions: null },
      currentDensity: { value: null, unit: null, conditions: null },
      voltage: { value: null, type: null, conditions: null },
      coulombicEfficiency: { value: null, conditions: null },
      energyEfficiency: { value: null, conditions: null },
      hydrogenProduction: { value: null, unit: null, conditions: null }
    }

    const instructions = `Extract performance metrics from the text. Look for:
    - Power density (mW/m², W/m³, etc.)
    - Current density (mA/cm², A/m², etc.)
    - Voltage (OCV, operating, maximum)
    - Coulombic efficiency (CE, %)
    - Energy efficiency (%)
    - Hydrogen production rates (mL/L/d, m³/m³/d, etc.)
    Include the conditions under which these values were measured if mentioned.`

    return this.client.extractWithTemplate(
      model || this.client.getRecommendedModel('extraction'),
      text,
      template,
      instructions
    )
  }

  /**
   * Extract material information
   */
  async extractMaterials(
    text: string,
    model?: string
  ): Promise<MaterialData> {
    const template: MaterialData = {
      anodeMaterials: [{
        name: '',
        modifications: [],
        properties: {}
      }],
      cathodeMaterials: [{
        name: '',
        catalyst: '',
        properties: {}
      }],
      membrane: {
        type: '',
        properties: {}
      }
    }

    const instructions = `Extract electrode and membrane materials from the text. Look for:
    - Anode materials (carbon cloth, graphite, graphene, MXene, etc.)
    - Anode modifications (treatments, coatings, nanoparticles)
    - Cathode materials and catalysts (Pt/C, carbon, metal oxides)
    - Membrane/separator types (Nafion, PEM, CEM, AEM)
    Include any mentioned properties like surface area, conductivity, cost.`

    return this.client.extractWithTemplate(
      model || this.client.getRecommendedModel('extraction'),
      text,
      template,
      instructions
    )
  }

  /**
   * Extract microbial information
   */
  async extractMicrobialData(
    text: string,
    model?: string
  ): Promise<MicrobialData> {
    const template: MicrobialData = {
      organisms: [{
        name: '',
        type: null,
        source: '',
        role: ''
      }],
      inoculum: {
        source: '',
        pretreatment: ''
      },
      biofilmThickness: {
        value: null,
        unit: ''
      }
    }

    const instructions = `Extract microbial information from the text. Look for:
    - Specific organisms (Geobacter, Shewanella, etc.)
    - Microbial community type (pure culture, mixed culture, consortium)
    - Inoculum source (wastewater, sediment, previous reactor)
    - Biofilm characteristics
    - Microbial roles (exoelectrogen, fermenter, methanogen)`

    return this.client.extractWithTemplate(
      model || this.client.getRecommendedModel('extraction'),
      text,
      template,
      instructions
    )
  }

  /**
   * Extract system configuration
   */
  async extractSystemConfiguration(
    text: string,
    model?: string
  ): Promise<SystemConfiguration> {
    const template: SystemConfiguration = {
      systemType: null,
      chamberConfig: null,
      volume: {
        anodeChamber: null,
        cathodeChamber: null,
        unit: 'mL'
      },
      electrodeSpacing: {
        value: null,
        unit: 'cm'
      },
      flowRate: {
        value: null,
        unit: 'mL/min'
      },
      operatingMode: null
    }

    const instructions = `Extract system configuration details. Look for:
    - System type (MFC, MEC, MDC, MES, BES)
    - Chamber configuration (single, dual, multi-chamber)
    - Chamber volumes
    - Electrode spacing/distance
    - Flow rates for continuous systems
    - Operating mode (batch, continuous, fed-batch)`

    return this.client.extractWithTemplate(
      model || this.client.getRecommendedModel('extraction'),
      text,
      template,
      instructions
    )
  }

  /**
   * Extract operating conditions
   */
  async extractOperatingConditions(
    text: string,
    model?: string
  ): Promise<OperatingConditions> {
    const template: OperatingConditions = {
      temperature: {
        value: null,
        unit: 'C',
        range: null
      },
      pH: {
        anode: null,
        cathode: null,
        controlled: null
      },
      substrate: {
        type: '',
        concentration: { value: null, unit: 'g/L' },
        cod: { value: null, unit: 'mg/L' }
      },
      hydraulicRetentionTime: {
        value: null,
        unit: 'h'
      },
      externalResistance: {
        value: null,
        unit: 'Ω'
      }
    }

    const instructions = `Extract operating conditions. Look for:
    - Temperature (°C, K, ranges)
    - pH values (anode, cathode, controlled/buffered)
    - Substrate type and concentration
    - COD (Chemical Oxygen Demand)
    - HRT (Hydraulic Retention Time)
    - External resistance used`

    return this.client.extractWithTemplate(
      model || this.client.getRecommendedModel('extraction'),
      text,
      template,
      instructions
    )
  }

  /**
   * Perform comprehensive extraction from a research paper
   */
  async extractComprehensive(
    text: string,
    options: {
      model?: string
      includeKeyFindings?: boolean
      includeLimitations?: boolean
    } = {}
  ): Promise<ResearchPaperExtraction> {
    const { 
      model = this.client.getRecommendedModel('extraction'),
      includeKeyFindings = true,
      includeLimitations = true
    } = options

    // Process all extractions in parallel for efficiency
    const [
      performance,
      materials,
      microbes,
      systemConfig,
      operatingConditions,
      keyFindings,
      limitations
    ] = await Promise.all([
      this.extractPerformanceMetrics(text, model),
      this.extractMaterials(text, model),
      this.extractMicrobialData(text, model),
      this.extractSystemConfiguration(text, model),
      this.extractOperatingConditions(text, model),
      includeKeyFindings ? this.extractKeyFindings(text, model) : Promise.resolve([]),
      includeLimitations ? this.extractLimitations(text, model) : Promise.resolve([])
    ])

    // Calculate confidence score based on extracted data completeness
    const confidenceScore = this.calculateConfidenceScore({
      performance,
      materials,
      microbes,
      systemConfig,
      operatingConditions
    })

    return {
      performance,
      materials,
      microbes,
      systemConfig,
      operatingConditions,
      keyFindings: includeKeyFindings ? keyFindings : undefined,
      limitations: includeLimitations ? limitations : undefined,
      confidenceScore
    }
  }

  /**
   * Extract key findings from the paper
   */
  private async extractKeyFindings(
    text: string,
    model?: string
  ): Promise<string[]> {
    const prompt = `Extract the 3-5 most important findings or conclusions from this research paper. Focus on:
    - Novel discoveries
    - Performance improvements
    - Breakthrough results
    - Important correlations
    Return as a JSON array of strings.`

    try {
      const findings = await this.client.generateJSON<string[]>(
        model || this.client.getRecommendedModel('summary'),
        prompt + '\n\nText:\n' + text.substring(0, 4000) // Limit text length
      )
      return findings || []
    } catch {
      return []
    }
  }

  /**
   * Extract limitations mentioned in the paper
   */
  private async extractLimitations(
    text: string,
    model?: string
  ): Promise<string[]> {
    const prompt = `Extract any limitations, challenges, or areas for improvement mentioned in this research. Focus on:
    - Technical limitations
    - Scalability issues
    - Cost concerns
    - Performance gaps
    Return as a JSON array of strings.`

    try {
      const limitations = await this.client.generateJSON<string[]>(
        model || this.client.getRecommendedModel('summary'),
        prompt + '\n\nText:\n' + text.substring(0, 4000)
      )
      return limitations || []
    } catch {
      return []
    }
  }

  /**
   * Calculate confidence score for extracted data
   */
  private calculateConfidenceScore(data: Partial<ResearchPaperExtraction>): number {
    let score = 0
    let totalFields = 0

    // Check performance metrics
    if (data.performance) {
      totalFields += 6
      if (data.performance.powerDensity?.value !== null) score++
      if (data.performance.currentDensity?.value !== null) score++
      if (data.performance.voltage?.value !== null) score++
      if (data.performance.coulombicEfficiency?.value !== null) score++
      if (data.performance.energyEfficiency?.value !== null) score++
      if (data.performance.hydrogenProduction?.value !== null) score++
    }

    // Check materials
    if (data.materials) {
      totalFields += 3
      if (data.materials.anodeMaterials?.length) score++
      if (data.materials.cathodeMaterials?.length) score++
      if (data.materials.membrane?.type) score++
    }

    // Check microbes
    if (data.microbes) {
      totalFields += 2
      if (data.microbes.organisms?.length) score++
      if (data.microbes.inoculum?.source) score++
    }

    // Check system config
    if (data.systemConfig) {
      totalFields += 4
      if (data.systemConfig.systemType) score++
      if (data.systemConfig.chamberConfig) score++
      if (data.systemConfig.volume?.anodeChamber !== null) score++
      if (data.systemConfig.operatingMode) score++
    }

    // Check operating conditions
    if (data.operatingConditions) {
      totalFields += 5
      if (data.operatingConditions.temperature?.value !== null) score++
      if (data.operatingConditions.pH?.anode !== null) score++
      if (data.operatingConditions.substrate?.type) score++
      if (data.operatingConditions.hydraulicRetentionTime?.value !== null) score++
      if (data.operatingConditions.externalResistance?.value !== null) score++
    }

    return totalFields > 0 ? score / totalFields : 0
  }

  /**
   * Validate extracted data for consistency
   */
  validateExtraction(data: ResearchPaperExtraction): {
    isValid: boolean
    issues: string[]
  } {
    const issues: string[] = []

    // Validate performance metrics
    if (data.performance.powerDensity?.value !== null) {
      if (data.performance.powerDensity.value < 0) {
        issues.push('Power density cannot be negative')
      }
      if (data.performance.powerDensity.value > 50000) {
        issues.push('Power density seems unrealistically high (>50 W/m²)')
      }
    }

    // Validate efficiencies
    if (data.performance.coulombicEfficiency?.value !== null) {
      if (data.performance.coulombicEfficiency.value < 0 || 
          data.performance.coulombicEfficiency.value > 100) {
        issues.push('Coulombic efficiency must be between 0-100%')
      }
    }

    // Validate pH
    if (data.operatingConditions.pH?.anode !== null) {
      if (data.operatingConditions.pH.anode < 0 || 
          data.operatingConditions.pH.anode > 14) {
        issues.push('pH must be between 0-14')
      }
    }

    // Validate temperature
    if (data.operatingConditions.temperature?.value !== null) {
      const temp = data.operatingConditions.temperature
      if (temp.unit === 'C' && (temp.value < -273 || temp.value > 100)) {
        issues.push('Temperature in Celsius seems out of range')
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }
}

// Export default instance
export const ollamaExtractor = new OllamaExtractor()