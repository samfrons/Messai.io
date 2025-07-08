#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Fix DATABASE_URL protocol if needed
if (process.env.DATABASE_URL?.startsWith('postgres://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://')
}

const prisma = new PrismaClient()

// Comprehensive extraction patterns for different parameter categories
const EXTRACTION_PATTERNS = {
  // Experimental Conditions
  temperature: [
    /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*°C/gi,
    /temperature.*?(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(?:degrees?\s*)?(?:celsius|C)/gi,
    /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*K(?:elvin)?/gi,
    /ambient\s*temperature/gi, // Will be set to 25°C
    /room\s*temperature/gi // Will be set to 22°C
  ],
  
  pH: [
    /pH\s*(?:of\s*)?(\d+(?:\.\d+)?)/gi,
    /pH\s*(?:=|:)\s*(\d+(?:\.\d+)?)/gi,
    /pH\s*(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?/gi,
    /neutral\s*pH/gi // Will be set to 7.0
  ],
  
  duration: [
    /(\d+)\s*(?:days?|d)/gi,
    /(\d+)\s*(?:hours?|hrs?|h)/gi,
    /(\d+)\s*(?:weeks?|wks?)/gi,
    /(\d+)\s*(?:months?|mo)/gi,
    /operation(?:al)?\s*(?:time|period|duration).*?(\d+)\s*(?:days?|hours?|weeks?)/gi
  ],
  
  substrate: [
    /acetate\s*(?:concentration)?.*?(\d+(?:\.\d+)?)\s*(?:g\/L|mM|mg\/L)/gi,
    /glucose\s*(?:concentration)?.*?(\d+(?:\.\d+)?)\s*(?:g\/L|mM|mg\/L)/gi,
    /wastewater\s*COD.*?(\d+(?:\.\d+)?)\s*(?:mg\/L|g\/L)/gi,
    /substrate.*?(\d+(?:\.\d+)?)\s*(?:g\/L|mM|mg\/L)/gi,
    /(brewery|domestic|synthetic|industrial)\s*wastewater/gi
  ],
  
  // Reactor Configuration
  reactorVolume: [
    /(?:reactor|cell|chamber)\s*volume.*?(\d+(?:\.\d+)?)\s*(?:mL|ml|L|cm³|cm3)/gi,
    /(\d+(?:\.\d+)?)\s*(?:mL|ml|L|cm³|cm3)\s*(?:reactor|cell|chamber)/gi,
    /volume\s*(?:of|:)?\s*(\d+(?:\.\d+)?)\s*(?:mL|ml|L)/gi
  ],
  
  reactorDesign: [
    /(single|dual|two)[\s-]*chamber/gi,
    /(H-type|tubular|flat[\s-]*plate|stacked|continuous[\s-]*flow)/gi,
    /(batch|fed[\s-]*batch|continuous|semi[\s-]*continuous)\s*(?:mode|operation)?/gi,
    /(up[\s-]*flow|horizontal[\s-]*flow|air[\s-]*cathode)/gi
  ],
  
  flowRate: [
    /flow\s*rate.*?(\d+(?:\.\d+)?)\s*(?:mL\/min|L\/h|mL\/h)/gi,
    /(\d+(?:\.\d+)?)\s*(?:mL\/min|L\/h|mL\/h)\s*flow/gi,
    /HRT.*?(\d+(?:\.\d+)?)\s*(?:hours?|h|days?|d)/gi
  ],
  
  // Electrode Specifications
  electrodeArea: [
    /(?:anode|cathode|electrode)\s*(?:surface\s*)?area.*?(\d+(?:\.\d+)?)\s*(?:cm²|cm2|m²|m2)/gi,
    /(\d+(?:\.\d+)?)\s*(?:cm²|cm2|m²|m2)\s*(?:anode|cathode|electrode)/gi,
    /projected\s*area.*?(\d+(?:\.\d+)?)\s*(?:cm²|cm2|m²|m2)/gi
  ],
  
  electrodeSpacing: [
    /electrode\s*(?:spacing|distance|gap).*?(\d+(?:\.\d+)?)\s*(?:cm|mm|m)/gi,
    /distance\s*between\s*electrodes.*?(\d+(?:\.\d+)?)\s*(?:cm|mm|m)/gi,
    /(\d+(?:\.\d+)?)\s*(?:cm|mm)\s*electrode\s*spacing/gi
  ],
  
  electrodeModification: [
    /(carbon\s*nanotube|CNT|MWCNT|SWCNT)[\s-]*(?:modified|coated|deposited)/gi,
    /(graphene|reduced\s*graphene\s*oxide|rGO|GO)[\s-]*(?:modified|coated)/gi,
    /(platinum|Pt|gold|Au|silver|Ag)[\s-]*(?:catalyst|coating|nanoparticles)/gi,
    /(biochar|activated\s*carbon)[\s-]*(?:modified|treated)/gi,
    /(polyaniline|PANI|polypyrrole|PPy)[\s-]*(?:coating|modification)/gi
  ],
  
  // Performance Metrics (Extended)
  powerDensity: [
    /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mW\/m[²2]|W\/m[²2]|μW\/cm[²2])/gi,
    /power\s*density.*?(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mW\/m[²2]|W\/m[²2])/gi,
    /maximum\s*power.*?(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mW\/m[²2]|W\/m[²2])/gi
  ],
  
  currentDensity: [
    /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mA\/m[²2]|A\/m[²2]|μA\/cm[²2])/gi,
    /current\s*density.*?(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mA\/m[²2]|A\/m[²2])/gi
  ],
  
  voltage: [
    /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mV|V)\s*(?:at|@)?\s*(?:maximum\s*power|peak\s*power|OCV)?/gi,
    /open[\s-]*circuit\s*voltage.*?(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mV|V)/gi,
    /OCV.*?(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mV|V)/gi
  ],
  
  coulombicEfficiency: [
    /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*%\s*(?:coulombic\s*efficiency|CE)/gi,
    /coulombic\s*efficiency.*?(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*%/gi,
    /CE.*?(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*%/gi
  ],
  
  // Operational Parameters
  externalResistance: [
    /external\s*resistance.*?(\d+(?:\.\d+)?)\s*(?:Ω|ohm|kΩ|kohm)/gi,
    /(\d+(?:\.\d+)?)\s*(?:Ω|ohm|kΩ|kohm)\s*external\s*(?:resistance|resistor|load)/gi,
    /load\s*resistance.*?(\d+(?:\.\d+)?)\s*(?:Ω|ohm|kΩ|kohm)/gi
  ],
  
  hrt: [
    /HRT.*?(\d+(?:\.\d+)?)\s*(?:hours?|h|days?|d)/gi,
    /hydraulic\s*retention\s*time.*?(\d+(?:\.\d+)?)\s*(?:hours?|h|days?|d)/gi,
    /retention\s*time.*?(\d+(?:\.\d+)?)\s*(?:hours?|h|days?|d)/gi
  ],
  
  olr: [
    /OLR.*?(\d+(?:\.\d+)?)\s*(?:g\/L·d|kg\/m³·d|g\s*COD\/L·d)/gi,
    /organic\s*loading\s*rate.*?(\d+(?:\.\d+)?)\s*(?:g\/L·d|kg\/m³·d)/gi,
    /loading\s*rate.*?(\d+(?:\.\d+)?)\s*(?:g\/L·d|kg\/m³·d)/gi
  ],
  
  // Biological Parameters
  inoculumSource: [
    /(wastewater\s*treatment\s*plant|WWTP|activated\s*sludge|anaerobic\s*sludge)/gi,
    /(sediment|river\s*sediment|marine\s*sediment|lake\s*sediment)/gi,
    /(compost|soil|garden\s*soil)/gi,
    /(pre[\s-]*acclimated|enriched|mixed)\s*(?:culture|consortium|community)/gi,
    /(Geobacter|Shewanella|Pseudomonas)\s*(?:sulfurreducens|oneidensis|aeruginosa)?/gi
  ],
  
  biofilmAge: [
    /biofilm.*?(\d+)\s*(?:days?|weeks?|months?)\s*old/gi,
    /(\d+)[\s-]*(?:day|week|month)[\s-]*old\s*biofilm/gi,
    /mature\s*biofilm/gi // Will be set to "mature"
  ],
  
  // Electrochemical Data
  impedance: [
    /internal\s*resistance.*?(\d+(?:\.\d+)?)\s*(?:Ω|ohm|mΩ)/gi,
    /charge\s*transfer\s*resistance.*?(\d+(?:\.\d+)?)\s*(?:Ω|ohm)/gi,
    /R[ct].*?(\d+(?:\.\d+)?)\s*(?:Ω|ohm)/gi,
    /EIS|electrochemical\s*impedance\s*spectroscopy/gi
  ],
  
  voltammetry: [
    /cyclic\s*voltammetry|CV/gi,
    /linear\s*sweep\s*voltammetry|LSV/gi,
    /differential\s*pulse\s*voltammetry|DPV/gi,
    /scan\s*rate.*?(\d+(?:\.\d+)?)\s*mV\/s/gi
  ]
}

interface ExtractedParameters {
  experimentalConditions?: {
    temperature?: { value: number; unit: string }
    pH?: number
    duration?: { value: number; unit: string }
    substrate?: { type: string; concentration?: { value: number; unit: string } }
  }
  reactorConfiguration?: {
    volume?: { value: number; unit: string }
    design?: string
    dimensions?: string
    flowRate?: { value: number; unit: string }
  }
  electrodeSpecifications?: {
    anodeArea?: { value: number; unit: string }
    cathodeArea?: { value: number; unit: string }
    spacing?: { value: number; unit: string }
    modifications?: string[]
  }
  biologicalParameters?: {
    inoculumSource?: string
    biofilmAge?: string
    microbialDiversity?: string[]
  }
  performanceMetrics?: {
    powerDensity?: { value: number; unit: string; conditions?: string }
    currentDensity?: { value: number; unit: string }
    voltage?: { value: number; unit: string; type?: string }
    coulombicEfficiency?: number
    energyEfficiency?: number
  }
  operationalParameters?: {
    externalResistance?: { value: number; unit: string }
    hrt?: { value: number; unit: string }
    olr?: { value: number; unit: string }
    feedingMode?: string
  }
  electrochemicalData?: {
    internalResistance?: { value: number; unit: string }
    chargeTransferResistance?: { value: number; unit: string }
    voltammetryType?: string[]
    scanRate?: { value: number; unit: string }
  }
  timeSeriesData?: {
    performanceOverTime?: any[]
    degradationRate?: number
  }
  economicMetrics?: {
    costAnalysis?: any
    scaleUpProjections?: any
  }
}

class EnhancedParameterExtractor {
  private convertTemperature(value: number, fromUnit: string): number {
    // Convert to Celsius
    if (fromUnit === 'K') {
      return value - 273.15
    }
    return value
  }

  private convertToStandardUnits(value: number, unit: string, type: string): { value: number; unit: string } {
    // Convert power density to mW/m²
    if (type === 'power') {
      if (unit.includes('W/m')) {
        return { value: value * 1000, unit: 'mW/m²' }
      } else if (unit.includes('μW/cm')) {
        return { value: value * 0.1, unit: 'mW/m²' }
      }
      return { value, unit: 'mW/m²' }
    }
    
    // Convert current density to mA/m²
    if (type === 'current') {
      if (unit.includes('A/m')) {
        return { value: value * 1000, unit: 'mA/m²' }
      } else if (unit.includes('μA/cm')) {
        return { value: value * 0.1, unit: 'mA/m²' }
      }
      return { value, unit: 'mA/m²' }
    }
    
    // Convert voltage to mV
    if (type === 'voltage') {
      if (unit === 'V') {
        return { value: value * 1000, unit: 'mV' }
      }
      return { value, unit: 'mV' }
    }
    
    // Convert volume to mL
    if (type === 'volume') {
      if (unit === 'L') {
        return { value: value * 1000, unit: 'mL' }
      } else if (unit.includes('cm³') || unit.includes('cm3')) {
        return { value, unit: 'mL' }
      }
      return { value, unit }
    }
    
    // Convert area to cm²
    if (type === 'area') {
      if (unit.includes('m²') || unit.includes('m2')) {
        return { value: value * 10000, unit: 'cm²' }
      }
      return { value, unit: 'cm²' }
    }
    
    // Convert resistance to Ω
    if (type === 'resistance') {
      if (unit.includes('kΩ') || unit.includes('kohm')) {
        return { value: value * 1000, unit: 'Ω' }
      } else if (unit.includes('mΩ')) {
        return { value: value / 1000, unit: 'Ω' }
      }
      return { value, unit: 'Ω' }
    }
    
    return { value, unit }
  }

  async extractParameters(paper: any): Promise<ExtractedParameters> {
    const text = `${paper.title} ${paper.abstract || ''}`.toLowerCase()
    const params: ExtractedParameters = {}
    
    // Extract Experimental Conditions
    const experimentalConditions: any = {}
    
    // Temperature
    for (const pattern of EXTRACTION_PATTERNS.temperature) {
      const match = text.match(pattern)
      if (match) {
        if (match[0].includes('ambient')) {
          experimentalConditions.temperature = { value: 25, unit: '°C' }
        } else if (match[0].includes('room')) {
          experimentalConditions.temperature = { value: 22, unit: '°C' }
        } else if (match[1]) {
          const value = parseFloat(match[1])
          const unit = match[0].includes('K') ? 'K' : '°C'
          experimentalConditions.temperature = { 
            value: this.convertTemperature(value, unit), 
            unit: '°C' 
          }
        }
        break
      }
    }
    
    // pH
    for (const pattern of EXTRACTION_PATTERNS.pH) {
      const match = text.match(pattern)
      if (match) {
        if (match[0].includes('neutral')) {
          experimentalConditions.pH = 7.0
        } else if (match[1]) {
          experimentalConditions.pH = parseFloat(match[1])
        }
        break
      }
    }
    
    // Duration
    for (const pattern of EXTRACTION_PATTERNS.duration) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const value = parseInt(match[1])
        let unit = 'days'
        if (match[0].includes('hour') || match[0].includes('h')) unit = 'hours'
        else if (match[0].includes('week')) unit = 'weeks'
        else if (match[0].includes('month')) unit = 'months'
        experimentalConditions.duration = { value, unit }
        break
      }
    }
    
    // Substrate
    for (const pattern of EXTRACTION_PATTERNS.substrate) {
      const matches = [...text.matchAll(pattern)]
      if (matches.length > 0) {
        const match = matches[0]
        if (match[0].includes('brewery')) {
          experimentalConditions.substrate = { type: 'brewery wastewater' }
        } else if (match[0].includes('domestic')) {
          experimentalConditions.substrate = { type: 'domestic wastewater' }
        } else if (match[0].includes('synthetic')) {
          experimentalConditions.substrate = { type: 'synthetic wastewater' }
        } else if (match[0].includes('acetate')) {
          experimentalConditions.substrate = { 
            type: 'acetate',
            concentration: match[1] ? { value: parseFloat(match[1]), unit: match[0].match(/g\/L|mM|mg\/L/)?.[0] || 'g/L' } : undefined
          }
        } else if (match[0].includes('glucose')) {
          experimentalConditions.substrate = { 
            type: 'glucose',
            concentration: match[1] ? { value: parseFloat(match[1]), unit: match[0].match(/g\/L|mM|mg\/L/)?.[0] || 'g/L' } : undefined
          }
        }
        break
      }
    }
    
    if (Object.keys(experimentalConditions).length > 0) {
      params.experimentalConditions = experimentalConditions
    }
    
    // Extract Reactor Configuration
    const reactorConfig: any = {}
    
    // Volume
    for (const pattern of EXTRACTION_PATTERNS.reactorVolume) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const value = parseFloat(match[1])
        const unit = match[0].match(/mL|ml|L|cm³|cm3/)?.[0] || 'mL'
        reactorConfig.volume = this.convertToStandardUnits(value, unit, 'volume')
        break
      }
    }
    
    // Design
    for (const pattern of EXTRACTION_PATTERNS.reactorDesign) {
      const match = text.match(pattern)
      if (match) {
        reactorConfig.design = match[0]
        break
      }
    }
    
    // Flow rate
    for (const pattern of EXTRACTION_PATTERNS.flowRate) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const value = parseFloat(match[1])
        const unit = match[0].match(/mL\/min|L\/h|mL\/h|hours?|h|days?|d/)?.[0] || 'mL/min'
        reactorConfig.flowRate = { value, unit }
        break
      }
    }
    
    if (Object.keys(reactorConfig).length > 0) {
      params.reactorConfiguration = reactorConfig
    }
    
    // Extract Electrode Specifications
    const electrodeSpecs: any = {}
    
    // Electrode area
    for (const pattern of EXTRACTION_PATTERNS.electrodeArea) {
      const matches = [...text.matchAll(pattern)]
      for (const match of matches) {
        if (match[1]) {
          const value = parseFloat(match[1])
          const unit = match[0].match(/cm²|cm2|m²|m2/)?.[0] || 'cm²'
          const standardized = this.convertToStandardUnits(value, unit, 'area')
          
          if (match[0].includes('anode')) {
            electrodeSpecs.anodeArea = standardized
          } else if (match[0].includes('cathode')) {
            electrodeSpecs.cathodeArea = standardized
          } else if (!electrodeSpecs.anodeArea) {
            // If not specified, assume it's for both
            electrodeSpecs.anodeArea = standardized
            electrodeSpecs.cathodeArea = standardized
          }
        }
      }
    }
    
    // Electrode spacing
    for (const pattern of EXTRACTION_PATTERNS.electrodeSpacing) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const value = parseFloat(match[1])
        const unit = match[0].match(/cm|mm|m/)?.[0] || 'cm'
        electrodeSpecs.spacing = { value, unit }
        break
      }
    }
    
    // Electrode modifications
    const modifications: string[] = []
    for (const pattern of EXTRACTION_PATTERNS.electrodeModification) {
      const matches = text.match(pattern)
      if (matches) {
        modifications.push(matches[0])
      }
    }
    if (modifications.length > 0) {
      electrodeSpecs.modifications = [...new Set(modifications)]
    }
    
    if (Object.keys(electrodeSpecs).length > 0) {
      params.electrodeSpecifications = electrodeSpecs
    }
    
    // Extract Performance Metrics
    const performanceMetrics: any = {}
    
    // Power density
    for (const pattern of EXTRACTION_PATTERNS.powerDensity) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const value = parseFloat(match[1])
        const unit = match[2] || 'mW/m²'
        performanceMetrics.powerDensity = this.convertToStandardUnits(value, unit, 'power')
        if (match[0].includes('maximum') || match[0].includes('peak')) {
          performanceMetrics.powerDensity.conditions = 'maximum'
        }
        break
      }
    }
    
    // Current density
    for (const pattern of EXTRACTION_PATTERNS.currentDensity) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const value = parseFloat(match[1])
        const unit = match[2] || 'mA/m²'
        performanceMetrics.currentDensity = this.convertToStandardUnits(value, unit, 'current')
        break
      }
    }
    
    // Voltage
    for (const pattern of EXTRACTION_PATTERNS.voltage) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const value = parseFloat(match[1])
        const unit = match[2] || 'mV'
        performanceMetrics.voltage = this.convertToStandardUnits(value, unit, 'voltage')
        if (match[0].includes('open') || match[0].includes('OCV')) {
          performanceMetrics.voltage.type = 'OCV'
        }
        break
      }
    }
    
    // Coulombic efficiency
    for (const pattern of EXTRACTION_PATTERNS.coulombicEfficiency) {
      const match = text.match(pattern)
      if (match && match[1]) {
        performanceMetrics.coulombicEfficiency = parseFloat(match[1])
        break
      }
    }
    
    if (Object.keys(performanceMetrics).length > 0) {
      params.performanceMetrics = performanceMetrics
    }
    
    // Extract Operational Parameters
    const operationalParams: any = {}
    
    // External resistance
    for (const pattern of EXTRACTION_PATTERNS.externalResistance) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const value = parseFloat(match[1])
        const unit = match[0].match(/Ω|ohm|kΩ|kohm/)?.[0] || 'Ω'
        operationalParams.externalResistance = this.convertToStandardUnits(value, unit, 'resistance')
        break
      }
    }
    
    // HRT
    for (const pattern of EXTRACTION_PATTERNS.hrt) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const value = parseFloat(match[1])
        const unit = match[0].match(/hours?|h|days?|d/)?.[0] || 'h'
        operationalParams.hrt = { value, unit: unit.startsWith('d') ? 'days' : 'hours' }
        break
      }
    }
    
    // OLR
    for (const pattern of EXTRACTION_PATTERNS.olr) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const value = parseFloat(match[1])
        const unit = match[0].match(/g\/L·d|kg\/m³·d|g\s*COD\/L·d/)?.[0] || 'g/L·d'
        operationalParams.olr = { value, unit }
        break
      }
    }
    
    if (Object.keys(operationalParams).length > 0) {
      params.operationalParameters = operationalParams
    }
    
    // Extract Biological Parameters
    const biologicalParams: any = {}
    
    // Inoculum source
    for (const pattern of EXTRACTION_PATTERNS.inoculumSource) {
      const match = text.match(pattern)
      if (match) {
        biologicalParams.inoculumSource = match[0]
        break
      }
    }
    
    // Biofilm age
    for (const pattern of EXTRACTION_PATTERNS.biofilmAge) {
      const match = text.match(pattern)
      if (match) {
        if (match[0].includes('mature')) {
          biologicalParams.biofilmAge = 'mature'
        } else if (match[1]) {
          const value = match[1]
          const unit = match[0].match(/days?|weeks?|months?/)?.[0] || 'days'
          biologicalParams.biofilmAge = `${value} ${unit}`
        }
        break
      }
    }
    
    if (Object.keys(biologicalParams).length > 0) {
      params.biologicalParameters = biologicalParams
    }
    
    // Extract Electrochemical Data
    const electrochemData: any = {}
    
    // Impedance
    for (const pattern of EXTRACTION_PATTERNS.impedance) {
      const match = text.match(pattern)
      if (match) {
        if (match[1]) {
          const value = parseFloat(match[1])
          const unit = match[0].match(/Ω|ohm|mΩ/)?.[0] || 'Ω'
          const standardized = this.convertToStandardUnits(value, unit, 'resistance')
          
          if (match[0].includes('internal')) {
            electrochemData.internalResistance = standardized
          } else if (match[0].includes('charge') || match[0].includes('Rct')) {
            electrochemData.chargeTransferResistance = standardized
          }
        } else if (match[0].includes('EIS') || match[0].includes('impedance')) {
          electrochemData.impedancePerformed = true
        }
      }
    }
    
    // Voltammetry
    const voltammetryTypes: string[] = []
    for (const pattern of EXTRACTION_PATTERNS.voltammetry) {
      const match = text.match(pattern)
      if (match) {
        if (match[0].includes('cyclic') || match[0].includes('CV')) {
          voltammetryTypes.push('CV')
        } else if (match[0].includes('linear') || match[0].includes('LSV')) {
          voltammetryTypes.push('LSV')
        } else if (match[0].includes('differential') || match[0].includes('DPV')) {
          voltammetryTypes.push('DPV')
        } else if (match[1]) {
          // Scan rate
          electrochemData.scanRate = { value: parseFloat(match[1]), unit: 'mV/s' }
        }
      }
    }
    if (voltammetryTypes.length > 0) {
      electrochemData.voltammetryType = [...new Set(voltammetryTypes)]
    }
    
    if (Object.keys(electrochemData).length > 0) {
      params.electrochemicalData = electrochemData
    }
    
    return params
  }

  async processPaper(paper: any): Promise<boolean> {
    try {
      console.log(`\n📄 Processing: ${paper.title}`)
      
      const extractedParams = await this.extractParameters(paper)
      
      // Update the paper with extracted parameters
      const updateData: any = {}
      
      if (extractedParams.experimentalConditions && Object.keys(extractedParams.experimentalConditions).length > 0) {
        updateData.experimentalConditions = JSON.stringify(extractedParams.experimentalConditions)
      }
      
      if (extractedParams.reactorConfiguration && Object.keys(extractedParams.reactorConfiguration).length > 0) {
        updateData.reactorConfiguration = JSON.stringify(extractedParams.reactorConfiguration)
      }
      
      if (extractedParams.electrodeSpecifications && Object.keys(extractedParams.electrodeSpecifications).length > 0) {
        updateData.electrodeSpecifications = JSON.stringify(extractedParams.electrodeSpecifications)
      }
      
      if (extractedParams.biologicalParameters && Object.keys(extractedParams.biologicalParameters).length > 0) {
        updateData.biologicalParameters = JSON.stringify(extractedParams.biologicalParameters)
      }
      
      if (extractedParams.performanceMetrics && Object.keys(extractedParams.performanceMetrics).length > 0) {
        updateData.performanceMetrics = JSON.stringify(extractedParams.performanceMetrics)
        
        // Also update basic fields for backward compatibility
        if (extractedParams.performanceMetrics.powerDensity) {
          updateData.powerOutput = extractedParams.performanceMetrics.powerDensity.value
        }
        if (extractedParams.performanceMetrics.coulombicEfficiency) {
          updateData.efficiency = extractedParams.performanceMetrics.coulombicEfficiency
        }
      }
      
      if (extractedParams.operationalParameters && Object.keys(extractedParams.operationalParameters).length > 0) {
        updateData.operationalParameters = JSON.stringify(extractedParams.operationalParameters)
      }
      
      if (extractedParams.electrochemicalData && Object.keys(extractedParams.electrochemicalData).length > 0) {
        updateData.electrochemicalData = JSON.stringify(extractedParams.electrochemicalData)
      }
      
      if (Object.keys(updateData).length > 0) {
        await prisma.researchPaper.update({
          where: { id: paper.id },
          data: updateData
        })
        
        console.log(`   ✅ Extracted ${Object.keys(updateData).length} parameter categories`)
        
        // Log what was extracted
        if (extractedParams.experimentalConditions) {
          console.log(`      - Experimental: T=${extractedParams.experimentalConditions.temperature?.value}°C, pH=${extractedParams.experimentalConditions.pH}`)
        }
        if (extractedParams.performanceMetrics) {
          console.log(`      - Performance: ${extractedParams.performanceMetrics.powerDensity?.value} ${extractedParams.performanceMetrics.powerDensity?.unit}`)
        }
        if (extractedParams.reactorConfiguration) {
          console.log(`      - Reactor: ${extractedParams.reactorConfiguration.volume?.value} ${extractedParams.reactorConfiguration.volume?.unit}`)
        }
        
        return true
      } else {
        console.log(`   ⚠️  No parameters extracted`)
        return false
      }
      
    } catch (error) {
      console.error(`   ❌ Error: ${error}`)
      return false
    }
  }

  async processBatch(limit: number = 100) {
    console.log('🚀 Starting enhanced parameter extraction...')
    
    // Find papers that haven't been processed with enhanced extraction
    const papers = await prisma.researchPaper.findMany({
      where: {
        AND: [
          {
            // Has abstract to extract from
            abstract: { not: null }
          },
          {
            // Is a real paper
            OR: [
              { doi: { not: null } },
              { pubmedId: { not: null } },
              { arxivId: { not: null } }
            ]
          },
          {
            // Hasn't been processed with enhanced extraction
            experimentalConditions: null
          }
        ]
      },
      select: {
        id: true,
        title: true,
        abstract: true
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\nFound ${papers.length} papers to process`)
    
    let processed = 0
    let successful = 0
    
    for (const paper of papers) {
      const success = await this.processPaper(paper)
      processed++
      if (success) successful++
      
      if (processed % 10 === 0) {
        console.log(`\n📊 Progress: ${processed}/${papers.length} papers processed (${successful} successful)`)
      }
    }
    
    console.log(`\n✅ Extraction complete!`)
    console.log(`   Total processed: ${processed}`)
    console.log(`   Successfully extracted: ${successful}`)
    console.log(`   Extraction rate: ${((successful / processed) * 100).toFixed(1)}%`)
  }

  async getExtractionStats() {
    const [
      total,
      withExperimentalConditions,
      withReactorConfig,
      withElectrodeSpecs,
      withBiologicalParams,
      withPerformanceMetrics,
      withOperationalParams,
      withElectrochemicalData
    ] = await Promise.all([
      prisma.researchPaper.count(),
      prisma.researchPaper.count({ where: { experimentalConditions: { not: null } } }),
      prisma.researchPaper.count({ where: { reactorConfiguration: { not: null } } }),
      prisma.researchPaper.count({ where: { electrodeSpecifications: { not: null } } }),
      prisma.researchPaper.count({ where: { biologicalParameters: { not: null } } }),
      prisma.researchPaper.count({ where: { performanceMetrics: { not: null } } }),
      prisma.researchPaper.count({ where: { operationalParameters: { not: null } } }),
      prisma.researchPaper.count({ where: { electrochemicalData: { not: null } } })
    ])
    
    console.log(`\n📊 Enhanced Parameter Extraction Statistics:`)
    console.log(`   Total papers: ${total}`)
    console.log(`   With experimental conditions: ${withExperimentalConditions} (${((withExperimentalConditions/total)*100).toFixed(1)}%)`)
    console.log(`   With reactor configuration: ${withReactorConfig} (${((withReactorConfig/total)*100).toFixed(1)}%)`)
    console.log(`   With electrode specifications: ${withElectrodeSpecs} (${((withElectrodeSpecs/total)*100).toFixed(1)}%)`)
    console.log(`   With biological parameters: ${withBiologicalParams} (${((withBiologicalParams/total)*100).toFixed(1)}%)`)
    console.log(`   With performance metrics: ${withPerformanceMetrics} (${((withPerformanceMetrics/total)*100).toFixed(1)}%)`)
    console.log(`   With operational parameters: ${withOperationalParams} (${((withOperationalParams/total)*100).toFixed(1)}%)`)
    console.log(`   With electrochemical data: ${withElectrochemicalData} (${((withElectrochemicalData/total)*100).toFixed(1)}%)`)
  }
}

async function main() {
  const extractor = new EnhancedParameterExtractor()
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Enhanced Parameter Extraction - Extract comprehensive parameters from research papers

Usage:
  npm run literature:extract-params           Extract from 100 papers
  npm run literature:extract-params [limit]   Extract from specified number of papers
  npm run literature:extract-params --stats   Show extraction statistics

This script extracts:
  - Experimental conditions (temperature, pH, duration, substrate)
  - Reactor configuration (volume, design, flow rates)
  - Electrode specifications (area, spacing, modifications)
  - Biological parameters (inoculum, biofilm age)
  - Performance metrics (power, current, voltage, efficiency)
  - Operational parameters (HRT, OLR, resistance)
  - Electrochemical data (impedance, voltammetry)
    `)
    return
  }
  
  try {
    if (args[0] === '--stats') {
      await extractor.getExtractionStats()
    } else {
      const limit = args[0] ? parseInt(args[0]) : 100
      await extractor.processBatch(limit)
      await extractor.getExtractionStats()
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { EnhancedParameterExtractor }