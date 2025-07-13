// Multi-fidelity prediction engine for bioreactor performance analysis
import { BioreactorModel } from './bioreactor-catalog'

export type FidelityLevel = 'basic' | 'intermediate' | 'advanced'

export interface BioreactorParameters {
  temperature: number // °C
  ph: number
  flowRate: number // L/h
  mixingSpeed: number // RPM
  electrodeVoltage: number // mV
  substrateConcentration: number // g/L
  pressure?: number // bar
  oxygenLevel?: number // %
  salinity?: number // g/L
}

export interface PredictionInput {
  bioreactorId: string
  parameters: BioreactorParameters
  fidelityLevel: FidelityLevel
  timeHorizon?: number // hours
}

export interface BasicPrediction {
  powerDensity: number // mW/m²
  currentDensity: number // mA/m²
  efficiency: number // %
  operationalStatus: 'optimal' | 'good' | 'warning' | 'critical'
  confidence: number // 0-1
  executionTime: number // ms
  warnings: string[]
}

export interface IntermediatePrediction extends BasicPrediction {
  thermalProfile: {
    averageTemperature: number
    hotSpots: number[]
    coolingRate: number
  }
  massTransfer: {
    oxygenTransferRate: number
    substrateUtilization: number
    protonFlux: number
  }
  biofilmDynamics: {
    thickness: number
    viability: number
    adhesionStrength: number
  }
  economics: {
    operatingCost: number // $/kWh
    maintenanceCost: number // $/day
    efficiency: number
  }
}

export interface AdvancedPrediction extends IntermediatePrediction {
  electrochemistry: {
    overpotentials: {
      activation: number
      concentration: number
      ohmic: number
      membrane?: number
    }
    currentDistribution: number[]
    electrodeKinetics: {
      exchangeCurrentDensity: number
      tafelSlope: number
      transferCoefficient: number
      surfaceRoughnessFactor: number
    }
    limitingFactors: {
      massTransferLimited: boolean
      activationLimited: boolean
      ohmicLimited: boolean
    }
  }
  fluidDynamics: {
    velocityField: number[][]
    turbulenceIntensity: number
    mixingEfficiency: number
    deadZones: number
    reynoldsNumber: number
    sherwoodNumber: number
    massTransferCoefficient: number
    residenceTimeDistribution: number[]
  }
  microbiology: {
    growthRate: number
    metabolicActivity: number
    speciesDistribution: { [species: string]: number }
    viabilityProfile: number[]
  }
  optimization: {
    recommendations: OptimizationRecommendation[]
    sensitivityAnalysis: SensitivityAnalysis
    operatingEnvelope: OperatingEnvelope
  }
}

export interface OptimizationRecommendation {
  parameter: string
  currentValue: number
  recommendedValue: number
  expectedImprovement: number
  confidence: number
  reason: string
}

export interface SensitivityAnalysis {
  mostInfluential: string
  parameterSensitivities: { [parameter: string]: number }
  interactionEffects: { [combination: string]: number }
}

export interface OperatingEnvelope {
  viableRanges: { [parameter: string]: [number, number] }
  optimalZone: { [parameter: string]: [number, number] }
  criticalLimits: { [parameter: string]: [number, number] }
}

export class MultiFidelityPredictionEngine {
  private performanceCache = new Map<string, any>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes
  
  async predict(input: PredictionInput): Promise<BasicPrediction | IntermediatePrediction | AdvancedPrediction> {
    const startTime = performance.now()
    
    // Check cache first
    const cacheKey = this.generateCacheKey(input)
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return { ...cached, executionTime: performance.now() - startTime }
    }
    
    let result: BasicPrediction | IntermediatePrediction | AdvancedPrediction
    
    switch (input.fidelityLevel) {
      case 'basic':
        result = await this.calculateBasic(input)
        break
      case 'intermediate':
        result = await this.calculateIntermediate(input)
        break
      case 'advanced':
        result = await this.calculateAdvanced(input)
        break
      default:
        throw new Error(`Unknown fidelity level: ${input.fidelityLevel}`)
    }
    
    result.executionTime = performance.now() - startTime
    this.setCache(cacheKey, result)
    
    return result
  }
  
  private async calculateBasic(input: PredictionInput): Promise<BasicPrediction> {
    const { bioreactorId, parameters } = input
    
    // Get bioreactor model from catalog
    const { getBioreactorById } = await import('./bioreactor-catalog')
    const reactor = getBioreactorById(bioreactorId)
    
    if (!reactor) {
      throw new Error(`Bioreactor not found: ${bioreactorId}`)
    }
    
    // Basic calculations using simplified models
    const powerDensity = this.calculatePowerDensity(reactor, parameters)
    const currentDensity = this.calculateCurrentDensity(reactor, parameters)
    const efficiency = this.calculateEfficiency(reactor, parameters)
    const operationalStatus = this.determineOperationalStatus(reactor, parameters)
    const confidence = this.calculateConfidence(reactor, parameters, 'basic')
    const warnings = this.generateWarnings(reactor, parameters)
    
    return {
      powerDensity,
      currentDensity,
      efficiency,
      operationalStatus,
      confidence,
      executionTime: 0, // Will be set by caller
      warnings
    }
  }
  
  private async calculateIntermediate(input: PredictionInput): Promise<IntermediatePrediction> {
    const basicResult = await this.calculateBasic(input)
    const { bioreactorId, parameters } = input
    
    const { getBioreactorById } = await import('./bioreactor-catalog')
    const reactor = getBioreactorById(bioreactorId)!
    
    // Enhanced calculations with thermal and mass transfer effects
    const thermalProfile = this.calculateThermalProfile(reactor, parameters)
    const massTransfer = this.calculateMassTransfer(reactor, parameters)
    const biofilmDynamics = this.calculateBiofilmDynamics(reactor, parameters)
    const economics = this.calculateEconomics(reactor, parameters)
    
    return {
      ...basicResult,
      thermalProfile,
      massTransfer,
      biofilmDynamics,
      economics,
      confidence: this.calculateConfidence(reactor, parameters, 'intermediate')
    }
  }
  
  private async calculateAdvanced(input: PredictionInput): Promise<AdvancedPrediction> {
    const intermediateResult = await this.calculateIntermediate(input)
    const { bioreactorId, parameters } = input
    
    const { getBioreactorById } = await import('./bioreactor-catalog')
    const reactor = getBioreactorById(bioreactorId)!
    
    // Advanced multi-physics calculations
    const electrochemistry = this.calculateElectrochemistry(reactor, parameters)
    const fluidDynamics = this.calculateFluidDynamics(reactor, parameters)
    const microbiology = this.calculateMicrobiology(reactor, parameters)
    const optimization = this.calculateOptimization(reactor, parameters)
    
    return {
      ...intermediateResult,
      electrochemistry,
      fluidDynamics,
      microbiology,
      optimization,
      confidence: this.calculateConfidence(reactor, parameters, 'advanced')
    }
  }
  
  // Enhanced core calculation methods with literature correlations
  private calculatePowerDensity(reactor: BioreactorModel, params: BioreactorParameters): number {
    const basePower = reactor.performance.powerDensity.value
    
    // Enhanced Arrhenius temperature correlation with activation energy
    const activationEnergy = 50000 // J/mol typical for microbial processes
    const gasConstant = 8.314 // J/mol/K
    const tempOptimalK = reactor.operating.temperature.optimal + 273.15
    const tempK = params.temperature + 273.15
    const tempFactor = Math.exp(-(activationEnergy / gasConstant) * (1/tempK - 1/tempOptimalK))
    
    // Enhanced pH factor with buffer capacity effects
    const phOptimal = reactor.operating.ph.optimal
    const phDeviation = Math.abs(params.ph - phOptimal)
    const bufferCapacity = 0.1 // mol/L/pH typical for bioelectrochemical systems
    const phFactor = Math.exp(-phDeviation * phDeviation / (2 * bufferCapacity))
    
    // Advanced Monod kinetics with inhibition effects
    const Ks = 0.5 // Half-saturation constant
    const Ki = 10.0 // Inhibition constant
    const substrateFactor = (params.substrateConcentration / (Ks + params.substrateConcentration)) * 
                           (Ki / (Ki + params.substrateConcentration))
    
    // Enhanced electrode kinetics factor
    const materialProps = this.getElectrodeMaterialProperties(reactor)
    const biofilmFactor = this.getBiofilmFactor(reactor, params)
    const electrodeKineticsFactor = materialProps.i0 * biofilmFactor * materialProps.roughness / 10
    
    // Mass transfer enhancement from mixing
    const reynoldsNumber = this.calculateReynoldsNumber(reactor, params)
    const sherwoodNumber = this.calculateSherwoodNumber(reynoldsNumber, this.calculateSchmidtNumber(params))
    const massTransferFactor = Math.min(sherwoodNumber / 100, 2.0)
    
    // Ohmic loss reduction factor
    const electrolyteResistance = this.getElectrolyteResistance(reactor, params)
    const ohmicFactor = 1 / (1 + electrolyteResistance * 100) // Reduced power due to resistance
    
    // System-specific multipliers
    const systemMultiplier = this.getSystemSpecificMultiplier(reactor, params)
    
    return basePower * tempFactor * phFactor * substrateFactor * 
           electrodeKineticsFactor * massTransferFactor * ohmicFactor * systemMultiplier
  }
  
  private calculateCurrentDensity(reactor: BioreactorModel, params: BioreactorParameters): number {
    const powerDensity = this.calculatePowerDensity(reactor, params)
    
    // Estimate voltage from operating conditions
    const estimatedVoltage = 0.3 + (params.electrodeVoltage / 1000) // Base voltage plus overpotential
    
    return powerDensity / estimatedVoltage
  }
  
  private calculateEfficiency(reactor: BioreactorModel, params: BioreactorParameters): number {
    const baseEfficiency = reactor.performance.efficiency.overall || 60
    
    // Operating condition factors
    const tempFactor = this.getTemperatureFactor(reactor, params.temperature)
    const phFactor = this.getPHFactor(reactor, params.ph)
    const mixingFactor = Math.min(params.mixingSpeed / 200, 1.0) // Optimal around 200 RPM
    
    return Math.min(baseEfficiency * tempFactor * phFactor * mixingFactor, 100)
  }
  
  private determineOperationalStatus(reactor: BioreactorModel, params: BioreactorParameters): 'optimal' | 'good' | 'warning' | 'critical' {
    const tempInRange = this.isInRange(params.temperature, reactor.operating.temperature.range)
    const phInRange = this.isInRange(params.ph, reactor.operating.ph.range)
    
    const tempOptimal = Math.abs(params.temperature - reactor.operating.temperature.optimal) <= reactor.operating.temperature.tolerance
    const phOptimal = Math.abs(params.ph - reactor.operating.ph.optimal) <= reactor.operating.ph.tolerance
    
    if (tempOptimal && phOptimal) return 'optimal'
    if (tempInRange && phInRange) return 'good'
    if (tempInRange || phInRange) return 'warning'
    return 'critical'
  }
  
  private calculateConfidence(reactor: BioreactorModel, params: BioreactorParameters, fidelity: FidelityLevel): number {
    let baseConfidence = reactor.performance.powerDensity.confidence === 'high' ? 0.9 : 
                        reactor.performance.powerDensity.confidence === 'medium' ? 0.7 : 0.5
    
    // Adjust based on parameter ranges
    const tempInRange = this.isInRange(params.temperature, reactor.operating.temperature.range)
    const phInRange = this.isInRange(params.ph, reactor.operating.ph.range)
    
    if (!tempInRange) baseConfidence *= 0.8
    if (!phInRange) baseConfidence *= 0.8
    
    // Fidelity bonus
    const fidelityBonus = fidelity === 'advanced' ? 1.1 : fidelity === 'intermediate' ? 1.05 : 1.0
    
    return Math.min(baseConfidence * fidelityBonus, 1.0)
  }
  
  private generateWarnings(reactor: BioreactorModel, params: BioreactorParameters): string[] {
    const warnings: string[] = []
    
    // Temperature warnings with specific effects
    if (!this.isInRange(params.temperature, reactor.operating.temperature.range)) {
      const effect = params.temperature < reactor.operating.temperature.range[0] ? 
        'reduced microbial activity' : 'enzyme denaturation and cell death'
      warnings.push(`Temperature ${params.temperature}°C outside range ${reactor.operating.temperature.range[0]}-${reactor.operating.temperature.range[1]}°C: ${effect}`)
    }
    
    // pH warnings with biochemical context
    if (!this.isInRange(params.ph, reactor.operating.ph.range)) {
      const effect = params.ph < reactor.operating.ph.range[0] ? 
        'acid stress on microorganisms' : 'alkaline stress affecting enzyme function'
      warnings.push(`pH ${params.ph} outside range ${reactor.operating.ph.range[0]}-${reactor.operating.ph.range[1]}: ${effect}`)
    }
    
    // Electrochemical warnings
    if (params.electrodeVoltage > 200) {
      warnings.push('Very high electrode voltage (>200mV) may cause water electrolysis and electrode corrosion')
    } else if (params.electrodeVoltage > 150) {
      warnings.push('High electrode voltage may accelerate electrode degradation')
    }
    
    if (params.electrodeVoltage < 10) {
      warnings.push('Low electrode voltage may insufficient for efficient electron transfer')
    }
    
    // Substrate concentration warnings
    if (params.substrateConcentration > 5.0) {
      warnings.push('High substrate concentration may cause substrate inhibition and reduced efficiency')
    } else if (params.substrateConcentration < 0.1) {
      warnings.push('Low substrate concentration may limit microbial growth and power output')
    }
    
    // Flow rate warnings
    if (params.flowRate > (reactor.operating.flowRate?.range[1] || 1000)) {
      warnings.push('High flow rate may cause biofilm washout and reduced performance')
    } else if (params.flowRate < (reactor.operating.flowRate?.range[0] || 0)) {
      warnings.push('Low flow rate may cause substrate depletion and mass transfer limitations')
    }
    
    // Mixing speed warnings for stirred systems
    if (reactor.reactorType.includes('Stirred Tank') && params.mixingSpeed > 300) {
      warnings.push('High mixing speed may damage biofilm structure and reduce power output')
    }
    
    // System-specific warnings
    if (reactor.reactorType.includes('Membrane') && params.ph < 6.0) {
      warnings.push('Low pH may damage membrane integrity in membrane bioreactor systems')
    }
    
    if (reactor.reactorType.includes('Photobioreactor') && params.temperature > 30) {
      warnings.push('High temperature may reduce photosynthetic efficiency in algae systems')
    }
    
    // Mass transfer limitations
    const reynoldsNumber = this.calculateReynoldsNumber(reactor, params)
    if (reynoldsNumber < 100) {
      warnings.push('Low Reynolds number indicates poor mixing and potential mass transfer limitations')
    }
    
    return warnings
  }
  
  // Intermediate calculation methods
  private calculateThermalProfile(reactor: BioreactorModel, params: BioreactorParameters) {
    const averageTemperature = params.temperature
    const hotSpots = [averageTemperature + 2, averageTemperature + 1.5, averageTemperature + 3] // Simplified
    const coolingRate = 0.1 * (averageTemperature - 25) // K/min
    
    return { averageTemperature, hotSpots, coolingRate }
  }
  
  private calculateMassTransfer(reactor: BioreactorModel, params: BioreactorParameters) {
    const kLa = reactor.massTransfer.oxygenTransferCoefficient || 10
    const oxygenTransferRate = kLa * (8.0 - (params.oxygenLevel || 4.0)) // Driving force
    
    const substrateUtilization = params.substrateConcentration * 0.8 * (params.mixingSpeed / 200)
    const protonFlux = 0.025 * this.calculateCurrentDensity(reactor, params) / 96485 // Faraday's law
    
    return { oxygenTransferRate, substrateUtilization, protonFlux }
  }
  
  private calculateBiofilmDynamics(reactor: BioreactorModel, params: BioreactorParameters) {
    const baseThickness = reactor.microbialSystem.biofilmCharacteristics.thickness
    const growthFactor = this.getTemperatureFactor(reactor, params.temperature) * this.getPHFactor(reactor, params.ph)
    
    const thickness = baseThickness * growthFactor
    const viability = 0.9 * growthFactor
    const adhesionStrength = 0.8 + 0.2 * Math.min(params.mixingSpeed / 100, 1.0)
    
    return { thickness, viability, adhesionStrength }
  }
  
  private calculateEconomics(reactor: BioreactorModel, params: BioreactorParameters) {
    const baseOperatingCost = reactor.economics.operatingCost || 0.02
    const powerOutput = this.calculatePowerDensity(reactor, params) / 1000 // W/m²
    
    const operatingCost = baseOperatingCost / Math.max(powerOutput, 0.1) // $/kWh
    const maintenanceCost = 5.0 + (params.mixingSpeed / 100) * 2.0 // $/day
    const efficiency = powerOutput / (baseOperatingCost * 1000)
    
    return { operatingCost, maintenanceCost, efficiency }
  }
  
  // Advanced calculation methods with enhanced literature correlations
  private calculateElectrochemistry(reactor: BioreactorModel, params: BioreactorParameters) {
    // Butler-Volmer kinetics with material-specific parameters
    const materialProperties = this.getElectrodeMaterialProperties(reactor)
    const currentDensity = this.calculateCurrentDensity(reactor, params)
    
    // Activation overpotential using Butler-Volmer equation
    const exchangeCurrentDensity = materialProperties.i0 * this.getBiofilmFactor(reactor, params)
    const tafelSlope = this.getTafelSlope(reactor.electrodes.anode.material[0])
    const activationOverpotential = tafelSlope * Math.log(currentDensity / exchangeCurrentDensity)
    
    // Concentration overpotential with Nernst equation corrections
    const limitingCurrentDensity = this.calculateLimitingCurrentDensity(reactor, params)
    const concentrationOverpotential = (8.314 * params.temperature / (96485 * 1)) * 
      Math.log(1 - (currentDensity / limitingCurrentDensity))
    
    // Ohmic overpotential with electrolyte conductivity
    const electrolyteResistance = this.getElectrolyteResistance(reactor, params)
    const ohmicOverpotential = currentDensity * electrolyteResistance
    
    // Membrane potential for membrane bioreactors
    const membranePotential = reactor.reactorType.includes('Membrane') ? 
      this.calculateMembranePotential(reactor, params) : 0
    
    const overpotentials = {
      activation: Math.abs(activationOverpotential),
      concentration: Math.abs(concentrationOverpotential),
      ohmic: Math.abs(ohmicOverpotential),
      membrane: Math.abs(membranePotential)
    }
    
    // Current distribution modeling with electrode geometry effects
    const currentDistribution = this.calculateCurrentDistribution(reactor, params, currentDensity)
    
    const electrodeKinetics = {
      exchangeCurrentDensity: exchangeCurrentDensity,
      tafelSlope: tafelSlope,
      transferCoefficient: materialProperties.alpha,
      surfaceRoughnessFactor: materialProperties.roughness
    }
    
    // Determine limiting factors
    const limitingFactors = {
      massTransferLimited: currentDensity > (0.8 * limitingCurrentDensity),
      activationLimited: overpotentials.activation > 0.2, // >200mV activation overpotential
      ohmicLimited: overpotentials.ohmic > overpotentials.activation
    }
    
    return { overpotentials, currentDistribution, electrodeKinetics, limitingFactors }
  }
  
  private calculateFluidDynamics(reactor: BioreactorModel, params: BioreactorParameters) {
    // Enhanced CFD-like calculations based on reactor type
    const reynoldsNumber = this.calculateReynoldsNumber(reactor, params)
    const schmidtNumber = this.calculateSchmidtNumber(params)
    
    // Velocity field based on reactor geometry and mixing
    const velocityField = this.generateVelocityField(reactor, params)
    
    // Turbulence modeling
    const turbulenceIntensity = this.calculateTurbulenceIntensity(reactor, params, reynoldsNumber)
    
    // Mixing efficiency from correlations
    const mixingEfficiency = this.calculateMixingEfficiency(reactor, params, reynoldsNumber)
    
    // Mass transfer enhancements
    const sherwoodNumber = this.calculateSherwoodNumber(reynoldsNumber, schmidtNumber)
    const massTransferCoefficient = this.calculateMassTransferCoefficient(sherwoodNumber, reactor)
    
    // Dead zone analysis
    const deadZones = this.calculateDeadZones(reactor, params, turbulenceIntensity)
    
    // Residence time distribution
    const rtd = this.calculateRTD(reactor, params, mixingEfficiency)
    
    return { 
      velocityField, 
      turbulenceIntensity, 
      mixingEfficiency, 
      deadZones,
      reynoldsNumber,
      sherwoodNumber,
      massTransferCoefficient,
      residenceTimeDistribution: rtd
    }
  }
  
  private calculateMicrobiology(reactor: BioreactorModel, params: BioreactorParameters) {
    const optimalTemp = reactor.operating.temperature.optimal
    const tempFactor = Math.exp(-Math.pow(params.temperature - optimalTemp, 2) / 200)
    
    const growthRate = 0.1 * tempFactor * this.getPHFactor(reactor, params.ph)
    const metabolicActivity = 0.8 * tempFactor
    
    const speciesDistribution: { [species: string]: number } = {}
    reactor.microbialSystem.primarySpecies.forEach((species, index) => {
      speciesDistribution[species] = 1.0 / reactor.microbialSystem.primarySpecies.length + 
                                   (Math.random() - 0.5) * 0.2
    })
    
    const viabilityProfile = Array.from({ length: 10 }, () => 0.7 + 0.3 * tempFactor * Math.random())
    
    return { growthRate, metabolicActivity, speciesDistribution, viabilityProfile }
  }
  
  private calculateOptimization(reactor: BioreactorModel, params: BioreactorParameters) {
    const recommendations: OptimizationRecommendation[] = []
    
    // Temperature optimization
    if (Math.abs(params.temperature - reactor.operating.temperature.optimal) > reactor.operating.temperature.tolerance) {
      recommendations.push({
        parameter: 'temperature',
        currentValue: params.temperature,
        recommendedValue: reactor.operating.temperature.optimal,
        expectedImprovement: 15,
        confidence: 0.9,
        reason: 'Moving closer to optimal temperature will improve microbial activity'
      })
    }
    
    // pH optimization
    if (Math.abs(params.ph - reactor.operating.ph.optimal) > reactor.operating.ph.tolerance) {
      recommendations.push({
        parameter: 'ph',
        currentValue: params.ph,
        recommendedValue: reactor.operating.ph.optimal,
        expectedImprovement: 10,
        confidence: 0.85,
        reason: 'Optimal pH range improves electron transfer efficiency'
      })
    }
    
    const sensitivityAnalysis: SensitivityAnalysis = {
      mostInfluential: 'temperature',
      parameterSensitivities: {
        temperature: 0.8,
        ph: 0.6,
        substrateConcentration: 0.4,
        mixingSpeed: 0.3,
        electrodeVoltage: 0.5
      },
      interactionEffects: {
        'temperature-ph': 0.3,
        'temperature-substrate': 0.2,
        'ph-voltage': 0.15
      }
    }
    
    const operatingEnvelope: OperatingEnvelope = {
      viableRanges: {
        temperature: reactor.operating.temperature.range,
        ph: reactor.operating.ph.range,
        substrateConcentration: [0.5, 5.0]
      },
      optimalZone: {
        temperature: [reactor.operating.temperature.optimal - reactor.operating.temperature.tolerance,
                     reactor.operating.temperature.optimal + reactor.operating.temperature.tolerance],
        ph: [reactor.operating.ph.optimal - reactor.operating.ph.tolerance,
             reactor.operating.ph.optimal + reactor.operating.ph.tolerance],
        substrateConcentration: [1.0, 3.0]
      },
      criticalLimits: {
        temperature: [10, 50],
        ph: [4, 10],
        substrateConcentration: [0.1, 10]
      }
    }
    
    return { recommendations, sensitivityAnalysis, operatingEnvelope }
  }
  
  // Helper methods
  private getConductivityBonus(reactor: BioreactorModel): number {
    const anodeConductivity = reactor.electrodes.anode.conductivity
    const cathodeConductivity = reactor.electrodes.cathode.conductivity
    
    const conductivityMap = { 'low': 0.9, 'medium': 1.0, 'high': 1.1, 'very-high': 1.2 }
    
    return (conductivityMap[anodeConductivity || 'medium'] + conductivityMap[cathodeConductivity || 'medium']) / 2
  }
  
  private getBiocompatibilityFactor(reactor: BioreactorModel): number {
    const anodeBiocompat = reactor.electrodes.anode.biocompatibility
    const cathodeBiocompat = reactor.electrodes.cathode.biocompatibility
    
    const biocompatMap = { 'poor': 0.8, 'fair': 0.9, 'good': 1.0, 'excellent': 1.1 }
    
    return (biocompatMap[anodeBiocompat || 'good'] + biocompatMap[cathodeBiocompat || 'good']) / 2
  }
  
  private getTemperatureFactor(reactor: BioreactorModel, temperature: number): number {
    const optimal = reactor.operating.temperature.optimal
    const tolerance = reactor.operating.temperature.tolerance
    return Math.exp(-Math.pow(temperature - optimal, 2) / (2 * Math.pow(tolerance, 2)))
  }
  
  private getPHFactor(reactor: BioreactorModel, ph: number): number {
    const optimal = reactor.operating.ph.optimal
    const tolerance = reactor.operating.ph.tolerance
    return Math.exp(-Math.pow(ph - optimal, 2) / (2 * Math.pow(tolerance, 2)))
  }
  
  private isInRange(value: number, range: [number, number]): boolean {
    return value >= range[0] && value <= range[1]
  }
  
  // Caching methods
  private generateCacheKey(input: PredictionInput): string {
    return JSON.stringify(input)
  }
  
  private getFromCache(key: string): any {
    const cached = this.performanceCache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }
  
  private setCache(key: string, data: any): void {
    this.performanceCache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
  
  // Clear cache
  clearCache(): void {
    this.performanceCache.clear()
  }
  
  // Enhanced electrochemical helper methods
  private getElectrodeMaterialProperties(reactor: BioreactorModel) {
    const anodeMaterial = reactor.electrodes.anode.material[0].toLowerCase()
    
    // Literature-based material properties (A/m², V, dimensionless, dimensionless)
    const materialProperties: { [key: string]: { i0: number, alpha: number, roughness: number } } = {
      'carbon cloth': { i0: 0.01, alpha: 0.5, roughness: 15.0 },
      'carbon felt': { i0: 0.008, alpha: 0.5, roughness: 12.0 },
      'graphite': { i0: 0.005, alpha: 0.5, roughness: 2.0 },
      'graphene': { i0: 0.1, alpha: 0.6, roughness: 25.0 },
      'graphene oxide': { i0: 0.05, alpha: 0.55, roughness: 20.0 },
      'carbon nanotubes': { i0: 0.08, alpha: 0.6, roughness: 30.0 },
      'carbon brush': { i0: 0.02, alpha: 0.5, roughness: 40.0 },
      'platinum': { i0: 0.2, alpha: 0.7, roughness: 1.0 },
      'stainless steel': { i0: 0.001, alpha: 0.4, roughness: 1.5 }
    }
    
    return materialProperties[anodeMaterial] || materialProperties['carbon cloth']
  }
  
  private getTafelSlope(material: string): number {
    // Tafel slopes in mV/decade based on literature
    const tafelSlopes: { [key: string]: number } = {
      'carbon': 120,
      'graphene': 90,
      'graphite': 110,
      'platinum': 70,
      'stainless steel': 140
    }
    
    const materialKey = Object.keys(tafelSlopes).find(key => 
      material.toLowerCase().includes(key)
    ) || 'carbon'
    
    return tafelSlopes[materialKey] / 1000 // Convert to V/decade
  }
  
  private getBiofilmFactor(reactor: BioreactorModel, params: BioreactorParameters): number {
    const biofilmThickness = reactor.microbialSystem.biofilmCharacteristics.thickness
    const density = reactor.microbialSystem.biofilmCharacteristics.density
    
    // Biofilm enhancement factor based on thickness and microbial activity
    const thicknessFactor = Math.min(biofilmThickness / 50, 2.0) // Optimal around 50 μm
    const activityFactor = this.getTemperatureFactor(reactor, params.temperature) * 
                          this.getPHFactor(reactor, params.ph)
    
    return thicknessFactor * activityFactor * (density / 1e9) * 0.1
  }
  
  private calculateLimitingCurrentDensity(reactor: BioreactorModel, params: BioreactorParameters): number {
    // Mass transfer limited current density
    const kLa = reactor.massTransfer.oxygenTransferCoefficient || 10
    const substrateConc = params.substrateConcentration
    const faradayConstant = 96485 // C/mol
    
    // Monod kinetics for substrate limitation
    const Ks = 0.5 // Half-saturation constant
    const maxSubstrateFlux = 0.1 * kLa * substrateConc / (Ks + substrateConc)
    
    // Convert to current density (assuming 4 electrons per mole substrate)
    return maxSubstrateFlux * 4 * faradayConstant / 1000 // A/m²
  }
  
  private getElectrolyteResistance(reactor: BioreactorModel, params: BioreactorParameters): number {
    // Electrolyte resistance based on conductivity and geometry
    const baseResistance = 0.1 // Ohm⋅m²
    const conductivityFactor = this.getConductivityFromPH(params.ph)
    const temperatureFactor = 1 + 0.02 * (params.temperature - 25) // 2%/°C increase
    const geometryFactor = reactor.electrodes.spacing ? reactor.electrodes.spacing / 10 : 1.0
    
    return baseResistance / (conductivityFactor * temperatureFactor) * geometryFactor
  }
  
  private getConductivityFromPH(ph: number): number {
    // Conductivity factor based on pH (higher at extremes)
    const neutralPH = 7.0
    const deviation = Math.abs(ph - neutralPH)
    return 1 + 0.1 * deviation // Increase conductivity away from neutral
  }
  
  private calculateMembranePotential(reactor: BioreactorModel, params: BioreactorParameters): number {
    // Membrane potential for EMBR systems
    const phGradient = params.ph - 7.0 // Assume neutral reference
    const temperatureK = params.temperature + 273.15
    const RT_F = 8.314 * temperatureK / 96485
    
    return RT_F * Math.log(Math.pow(10, phGradient)) // Nernst equation for protons
  }
  
  private calculateCurrentDistribution(reactor: BioreactorModel, params: BioreactorParameters, avgCurrent: number): number[] {
    const electrodeCount = reactor.electrodes.count || 2
    const distribution: number[] = []
    
    // Current distribution based on electrode configuration
    if (reactor.electrodes.configuration === 'single') {
      // Edge effects for single electrode pair
      const edgeEffect = 1.2
      const centerEffect = 0.9
      for (let i = 0; i < 10; i++) {
        const position = i / 9 // 0 to 1
        const edgeFactor = Math.min(
          edgeEffect * (1 - position),  // Left edge
          edgeEffect * position,        // Right edge
          centerEffect                  // Center
        )
        distribution.push(avgCurrent * (0.8 + 0.4 * edgeFactor))
      }
    } else {
      // More uniform for multiple electrodes
      for (let i = 0; i < 10; i++) {
        distribution.push(avgCurrent * (0.9 + 0.2 * Math.random()))
      }
    }
    
    return distribution
  }
  
  // Enhanced fluid dynamics helper methods
  private calculateReynoldsNumber(reactor: BioreactorModel, params: BioreactorParameters): number {
    // Reynolds number calculation based on reactor type
    const viscosity = 0.001 // Pa⋅s for water at room temperature
    const density = 1000 // kg/m³
    
    if (reactor.reactorType.includes('Stirred Tank')) {
      // For stirred tanks: Re = ρ⋅N⋅D²/μ
      const impellerDiameter = reactor.geometry.dimensions?.diameter ? 
        reactor.geometry.dimensions.diameter * 0.33 : 0.5 // 1/3 tank diameter
      const rotationRate = params.mixingSpeed / 60 // Hz
      return density * rotationRate * Math.pow(impellerDiameter, 2) / viscosity
    } else if (reactor.reactorType.includes('Airlift')) {
      // For airlift: Re = ρ⋅v⋅L/μ
      const characteristicLength = reactor.geometry.dimensions?.diameter || 1.0
      const superficialVelocity = params.flowRate / (3600 * Math.PI * Math.pow(characteristicLength/2, 2))
      return density * superficialVelocity * characteristicLength / viscosity
    } else {
      // For other reactors, use flow-based Reynolds number
      const hydraulicDiameter = 4 * reactor.geometry.volume / (reactor.geometry.surfaceAreaToVolume || 10)
      const velocity = params.flowRate / (3600 * Math.PI * Math.pow(hydraulicDiameter/2, 2))
      return density * velocity * hydraulicDiameter / viscosity
    }
  }
  
  private calculateSchmidtNumber(params: BioreactorParameters): number {
    // Schmidt number for substrate transport
    const viscosity = 0.001 // Pa⋅s
    const density = 1000 // kg/m³
    const diffusivity = 1e-9 // m²/s for typical substrates
    
    return viscosity / (density * diffusivity)
  }
  
  private generateVelocityField(reactor: BioreactorModel, params: BioreactorParameters): number[][] {
    const gridSize = 8
    const velocityField: number[][] = []
    
    for (let i = 0; i < gridSize; i++) {
      const row: number[] = []
      for (let j = 0; j < gridSize; j++) {
        if (reactor.reactorType.includes('Stirred Tank')) {
          // Circular flow pattern for stirred tanks
          const centerX = gridSize / 2
          const centerY = gridSize / 2
          const radius = Math.sqrt(Math.pow(i - centerX, 2) + Math.pow(j - centerY, 2))
          const tangentialVelocity = params.mixingSpeed * 0.01 * Math.max(0, 1 - radius / (gridSize/2))
          row.push(tangentialVelocity)
        } else if (reactor.reactorType.includes('Airlift')) {
          // Upflow/downflow pattern
          const velocity = j < gridSize/2 ? params.flowRate * 0.001 : -params.flowRate * 0.001
          row.push(velocity * (0.8 + 0.4 * Math.random()))
        } else {
          // General flow pattern
          const velocity = params.flowRate * 0.001 * (0.5 + 0.5 * Math.random())
          row.push(velocity)
        }
      }
      velocityField.push(row)
    }
    
    return velocityField
  }
  
  private calculateTurbulenceIntensity(reactor: BioreactorModel, params: BioreactorParameters, re: number): number {
    if (reactor.reactorType.includes('Stirred Tank')) {
      // Power number correlation for stirred tanks
      const powerNumber = re > 10000 ? 6.0 : 12.0 // Rushton turbine
      return Math.min(powerNumber * Math.pow(params.mixingSpeed / 200, 0.75) / 100, 1.0)
    } else if (reactor.reactorType.includes('Airlift')) {
      // Gas holdup effects
      const gasHoldup = 0.1 // Typical for airlift
      return Math.min(gasHoldup * Math.pow(re / 10000, 0.5), 0.8)
    } else {
      // General correlation
      return Math.min(Math.pow(re / 2300, 0.25) * 0.16, 1.0)
    }
  }
  
  private calculateMixingEfficiency(reactor: BioreactorModel, params: BioreactorParameters, re: number): number {
    const baseMixing = 0.5
    
    if (reactor.reactorType.includes('Stirred Tank')) {
      // Mixing time correlation
      const mixingTime = 5.3 * Math.pow(reactor.geometry.volume, 0.33) / Math.pow(params.mixingSpeed / 60, 0.67)
      return Math.min(baseMixing + 0.4 * Math.exp(-mixingTime / 30), 0.95)
    } else if (reactor.reactorType.includes('Airlift')) {
      // Circulation time based
      const circulationTime = reactor.geometry.dimensions?.height || 2.0 / (params.flowRate * 0.01)
      return Math.min(baseMixing + 0.3 * Math.exp(-circulationTime / 60), 0.9)
    } else {
      return Math.min(baseMixing + 0.25 * Math.log(re / 1000), 0.85)
    }
  }
  
  private calculateSherwoodNumber(re: number, sc: number): number {
    // Mass transfer correlation: Sh = 0.023 * Re^0.8 * Sc^0.33
    return 0.023 * Math.pow(re, 0.8) * Math.pow(sc, 0.33)
  }
  
  private calculateMassTransferCoefficient(sh: number, reactor: BioreactorModel): number {
    const diffusivity = 1e-9 // m²/s
    const characteristicLength = Math.pow(reactor.geometry.volume, 1/3) // Cube root of volume
    
    return sh * diffusivity / characteristicLength
  }
  
  private calculateDeadZones(reactor: BioreactorModel, params: BioreactorParameters, turbulence: number): number {
    // Dead zone fraction based on mixing intensity
    const baseDeadZone = 0.15
    const reductionFactor = Math.min(turbulence * 2, 1.0)
    
    return Math.max(baseDeadZone * (1 - reductionFactor), 0.02)
  }
  
  private calculateRTD(reactor: BioreactorModel, params: BioreactorParameters, mixingEff: number): number[] {
    // Residence time distribution - simplified tanks-in-series model
    const meanResidenceTime = reactor.geometry.volume / (params.flowRate / 3600) // hours
    const numberOfTanks = Math.round(mixingEff * 10) // 1-10 tanks
    
    const rtd: number[] = []
    for (let i = 0; i < 20; i++) {
      const time = i * meanResidenceTime / 10
      const normalizedTime = time / meanResidenceTime * numberOfTanks
      const probability = Math.pow(normalizedTime, numberOfTanks - 1) * 
                         Math.exp(-normalizedTime) / this.factorial(numberOfTanks - 1)
      rtd.push(probability)
    }
    
    return rtd
  }
  
  private factorial(n: number): number {
    if (n <= 1) return 1
    return n * this.factorial(n - 1)
  }
  
  // System-specific performance multipliers
  private getSystemSpecificMultiplier(reactor: BioreactorModel, params: BioreactorParameters): number {
    let multiplier = 1.0
    
    // Membrane bioreactor benefits
    if (reactor.reactorType.includes('Membrane')) {
      // Enhanced separation and retention of microorganisms
      multiplier *= 1.15
      
      // pH gradient across membrane
      const phGradient = Math.abs(params.ph - 7.0)
      multiplier *= (1 + 0.05 * phGradient)
    }
    
    // Stirred tank mixing benefits
    if (reactor.reactorType.includes('Stirred Tank')) {
      // Improved mass transfer at optimal mixing
      const optimalMixing = reactor.operating.mixingSpeed?.optimal || 200
      const mixingFactor = 1 - Math.abs(params.mixingSpeed - optimalMixing) / optimalMixing
      multiplier *= (0.8 + 0.4 * Math.max(mixingFactor, 0))
    }
    
    // Photobioreactor light effects
    if (reactor.reactorType.includes('Photobioreactor')) {
      // Temperature effects on photosynthesis
      const optimalPhotoTemp = 25
      const tempDeviation = Math.abs(params.temperature - optimalPhotoTemp)
      multiplier *= Math.exp(-tempDeviation / 15) // Exponential decay
      
      // Light penetration effects (approximated by mixing)
      const lightPenetration = Math.min(params.mixingSpeed / 100, 1.0)
      multiplier *= (0.6 + 0.4 * lightPenetration)
    }
    
    // Airlift circulation benefits
    if (reactor.reactorType.includes('Airlift')) {
      // Natural circulation enhancement
      const flowRate = params.flowRate
      const optimalFlow = reactor.operating.flowRate?.value || 150
      const flowFactor = Math.exp(-Math.pow(flowRate - optimalFlow, 2) / (2 * Math.pow(optimalFlow * 0.4, 2)))
      multiplier *= (0.7 + 0.5 * flowFactor)
    }
    
    // Fractal geometry surface area enhancement
    if (reactor.reactorType.includes('Fractal')) {
      // High surface area benefits
      const surfaceAreaRatio = reactor.geometry.surfaceAreaToVolume || 10
      multiplier *= Math.min(1 + surfaceAreaRatio / 50, 2.0)
      
      // Complexity penalty for mass transfer
      multiplier *= 0.95 // Slight reduction for complex geometry
    }
    
    // Scale effects
    const scaleFactors = {
      'laboratory': 1.1,  // Controlled conditions
      'pilot': 1.0,       // Baseline
      'industrial': 0.9   // Scale-up challenges
    }
    multiplier *= scaleFactors[reactor.geometry.scale] || 1.0
    
    // Electrode configuration effects
    if (reactor.electrodes.configuration === 'multiple') {
      multiplier *= 1.1 // Better current distribution
    } else if (reactor.electrodes.configuration === 'interdigitate') {
      multiplier *= 1.2 // Optimal electrode spacing
    }
    
    return Math.max(multiplier, 0.1) // Prevent negative multipliers
  }
}

// Singleton instance
export const predictionEngine = new MultiFidelityPredictionEngine()