import { FuelCellType } from './types/fuel-cell-types'

// ============================================================================
// CONTROL SYSTEM SIMULATION ENGINE
// ============================================================================

export interface ControllerConfig {
  enabled: boolean
  type: 'PID' | 'FUZZY' | 'ADAPTIVE' | 'NEURAL'
  setpoint: number
  pidParams: {
    kp: number
    ki: number
    kd: number
  }
  constraints: {
    min: number
    max: number
    rateLimit: number
  }
  deadband?: number
  windup_limit?: number
}

export interface ControlSystemConfig {
  thermal: ControllerConfig
  humidity: ControllerConfig
  pressure: ControllerConfig
  purging: ControllerConfig & {
    strategy: 'TIME_BASED' | 'COMPOSITION_BASED' | 'PERFORMANCE_BASED'
    threshold: number
    interval: number
    duration: number
  }
  airIntake: ControllerConfig
  stackVoltage: ControllerConfig
}

export interface ControlSystemSimulationResult {
  stability: number // 0-1
  performance: number // 0-1
  efficiency: number // %
  responseTime: number // seconds
  overshoot: number // %
  settlingTime: number // seconds
  recommendations: string[]
  timeSeriesData: {
    time: number[]
    temperature: number[]
    humidity: number[]
    pressure: number[]
    power: number[]
  }
}

export interface SystemDisturbance {
  type: 'LOAD_CHANGE' | 'TEMPERATURE_SPIKE' | 'PRESSURE_DROP' | 'HUMIDITY_VARIATION' | 'FUEL_INTERRUPTION'
  magnitude: number // 0-1
  duration: number // seconds
  startTime: number // seconds
}

export interface SimulationParameters {
  duration: number // seconds
  timeStep: number // seconds
  disturbances: SystemDisturbance[]
  nominalConditions: {
    temperature: number
    humidity: number
    pressure: number
    fuelFlow: number
    airFlow: number
  }
}

// ============================================================================
// FUEL CELL SYSTEM MODELS
// ============================================================================

class FuelCellSystemModel {
  private fuelCellType: FuelCellType
  private nominalConditions: SimulationParameters['nominalConditions']
  
  // System state variables
  private temperature: number = 80
  private humidity: number = 100
  private pressure: number = 2.5
  private fuelFlow: number = 5.0
  private airFlow: number = 25.0
  private stackVoltage: number = 50
  private nitrogenFraction: number = 0.1
  
  // System dynamics parameters
  private thermalTimeConstant: number = 60 // seconds
  private humidityTimeConstant: number = 30
  private pressureTimeConstant: number = 10
  private voltageTimeConstant: number = 5
  
  constructor(fuelCellType: FuelCellType, nominalConditions: SimulationParameters['nominalConditions']) {
    this.fuelCellType = fuelCellType
    this.nominalConditions = nominalConditions
    this.initializeSystemParameters()
  }
  
  private initializeSystemParameters() {
    // Set fuel cell specific parameters
    const typeParams = {
      PEM: { thermalTC: 60, humidityTC: 30, pressureTC: 10, voltageTC: 5 },
      SOFC: { thermalTC: 300, humidityTC: 0, pressureTC: 20, voltageTC: 10 },
      PAFC: { thermalTC: 120, humidityTC: 45, pressureTC: 15, voltageTC: 8 },
      MCFC: { thermalTC: 240, humidityTC: 0, pressureTC: 25, voltageTC: 12 },
      AFC: { thermalTC: 45, humidityTC: 25, pressureTC: 8, voltageTC: 4 }
    }
    
    const params = typeParams[this.fuelCellType]
    this.thermalTimeConstant = params.thermalTC
    this.humidityTimeConstant = params.humidityTC
    this.pressureTimeConstant = params.pressureTC
    this.voltageTimeConstant = params.voltageTC
    
    // Initialize state to nominal conditions
    this.temperature = this.nominalConditions.temperature
    this.humidity = this.nominalConditions.humidity
    this.pressure = this.nominalConditions.pressure
    this.fuelFlow = this.nominalConditions.fuelFlow
    this.airFlow = this.nominalConditions.airFlow
  }
  
  public step(
    dt: number,
    controlInputs: {
      thermalControl: number
      humidityControl: number
      pressureControl: number
      airFlowControl: number
      purgeSignal: boolean
    },
    disturbance?: SystemDisturbance
  ): {
    temperature: number
    humidity: number
    pressure: number
    stackVoltage: number
    power: number
    efficiency: number
  } {
    // Apply disturbances
    let tempDisturbance = 0
    let pressureDisturbance = 0
    let humidityDisturbance = 0
    
    if (disturbance) {
      switch (disturbance.type) {
        case 'TEMPERATURE_SPIKE':
          tempDisturbance = disturbance.magnitude * 20 // up to 20°C spike
          break
        case 'PRESSURE_DROP':
          pressureDisturbance = -disturbance.magnitude * 0.5 // up to 0.5 bar drop
          break
        case 'HUMIDITY_VARIATION':
          humidityDisturbance = disturbance.magnitude * 30 // up to 30% variation
          break
      }
    }
    
    // First-order system dynamics with control inputs
    const tempSetpoint = this.nominalConditions.temperature + controlInputs.thermalControl + tempDisturbance
    this.temperature += (dt / this.thermalTimeConstant) * (tempSetpoint - this.temperature)
    
    if (this.fuelCellType !== 'SOFC' && this.fuelCellType !== 'MCFC') {
      const humiditySetpoint = this.nominalConditions.humidity + controlInputs.humidityControl + humidityDisturbance
      this.humidity += (dt / this.humidityTimeConstant) * (humiditySetpoint - this.humidity)
      this.humidity = Math.max(0, Math.min(100, this.humidity))
    }
    
    const pressureSetpoint = this.nominalConditions.pressure + controlInputs.pressureControl + pressureDisturbance
    this.pressure += (dt / this.pressureTimeConstant) * (pressureSetpoint - this.pressure)
    this.pressure = Math.max(0.1, this.pressure)
    
    // Air flow affects nitrogen accumulation
    this.airFlow = this.nominalConditions.airFlow + controlInputs.airFlowControl
    
    // Nitrogen accumulation model
    const nitrogenGeneration = 0.001 * dt // Simplified nitrogen crossover
    const nitrogenRemoval = controlInputs.purgeSignal ? 0.8 * this.nitrogenFraction : 0.02 * this.nitrogenFraction
    this.nitrogenFraction += nitrogenGeneration - nitrogenRemoval
    this.nitrogenFraction = Math.max(0, Math.min(1, this.nitrogenFraction))
    
    // Calculate performance based on operating conditions
    const { power, efficiency, voltage } = this.calculatePerformance()
    
    return {
      temperature: this.temperature,
      humidity: this.humidity,
      pressure: this.pressure,
      stackVoltage: voltage,
      power,
      efficiency
    }
  }
  
  private calculatePerformance(): { power: number; efficiency: number; voltage: number } {
    // Simplified fuel cell performance model
    const optimalConditions = this.getOptimalConditions()
    
    // Temperature factor
    const tempFactor = this.calculateTemperatureFactor(this.temperature, optimalConditions.temperature)
    
    // Pressure factor
    const pressureFactor = Math.max(0, (this.pressure - 1) * 0.02)
    
    // Humidity factor (for low-temp fuel cells)
    let humidityFactor = 0
    if (this.fuelCellType === 'PEM' || this.fuelCellType === 'PAFC' || this.fuelCellType === 'AFC') {
      const humidityDeviation = Math.abs(this.humidity - optimalConditions.humidity) / 100
      humidityFactor = -humidityDeviation * 0.1
    }
    
    // Nitrogen contamination factor
    const nitrogenPenalty = -this.nitrogenFraction * 0.3
    
    // Base performance
    const baseVoltage = this.getBaseVoltage()
    const voltage = baseVoltage * (1 + tempFactor + pressureFactor + humidityFactor + nitrogenPenalty)
    const current = 50 // Simplified current calculation
    const power = Math.max(0, voltage * current)
    
    const baseEfficiency = this.getBaseEfficiency()
    const efficiency = baseEfficiency * (1 + tempFactor + pressureFactor + humidityFactor + nitrogenPenalty)
    
    return {
      power: Math.max(0, power),
      efficiency: Math.max(0, Math.min(100, efficiency * 100)),
      voltage: Math.max(0, voltage)
    }
  }
  
  private getOptimalConditions() {
    const optimal = {
      PEM: { temperature: 80, humidity: 100 },
      SOFC: { temperature: 750, humidity: 0 },
      PAFC: { temperature: 200, humidity: 85 },
      MCFC: { temperature: 650, humidity: 0 },
      AFC: { temperature: 70, humidity: 95 }
    }
    return optimal[this.fuelCellType]
  }
  
  private getBaseVoltage(): number {
    const voltages = { PEM: 0.7, SOFC: 0.8, PAFC: 0.75, MCFC: 0.85, AFC: 0.9 }
    return voltages[this.fuelCellType] * 50 // 50 cells
  }
  
  private getBaseEfficiency(): number {
    const efficiencies = { PEM: 0.50, SOFC: 0.60, PAFC: 0.45, MCFC: 0.55, AFC: 0.65 }
    return efficiencies[this.fuelCellType]
  }
  
  private calculateTemperatureFactor(temp: number, optimal: number): number {
    const deviation = Math.abs(temp - optimal)
    return Math.max(-0.5, -deviation / optimal * 0.3)
  }
  
  public getState() {
    return {
      temperature: this.temperature,
      humidity: this.humidity,
      pressure: this.pressure,
      fuelFlow: this.fuelFlow,
      airFlow: this.airFlow,
      stackVoltage: this.stackVoltage,
      nitrogenFraction: this.nitrogenFraction
    }
  }
}

// ============================================================================
// PID CONTROLLER
// ============================================================================

class PIDController {
  private kp: number
  private ki: number
  private kd: number
  private setpoint: number
  private integral: number = 0
  private previousError: number = 0
  private constraints: { min: number; max: number; rateLimit: number }
  private previousOutput: number = 0
  
  constructor(
    kp: number,
    ki: number,
    kd: number,
    setpoint: number,
    constraints: { min: number; max: number; rateLimit: number }
  ) {
    this.kp = kp
    this.ki = ki
    this.kd = kd
    this.setpoint = setpoint
    this.constraints = constraints
  }
  
  public update(processVariable: number, dt: number): number {
    const error = this.setpoint - processVariable
    
    // Proportional term
    const proportional = this.kp * error
    
    // Integral term with windup protection
    this.integral += error * dt
    const maxIntegral = (this.constraints.max - this.constraints.min) / this.ki
    this.integral = Math.max(-maxIntegral, Math.min(maxIntegral, this.integral))
    const integralTerm = this.ki * this.integral
    
    // Derivative term
    const derivative = (error - this.previousError) / dt
    const derivativeTerm = this.kd * derivative
    
    // Calculate output
    let output = proportional + integralTerm + derivativeTerm
    
    // Apply constraints
    output = Math.max(this.constraints.min, Math.min(this.constraints.max, output))
    
    // Apply rate limiting
    const maxChange = this.constraints.rateLimit * dt
    const deltaOutput = output - this.previousOutput
    if (Math.abs(deltaOutput) > maxChange) {
      output = this.previousOutput + Math.sign(deltaOutput) * maxChange
    }
    
    this.previousError = error
    this.previousOutput = output
    
    return output
  }
  
  public setSetpoint(setpoint: number): void {
    this.setpoint = setpoint
  }
  
  public reset(): void {
    this.integral = 0
    this.previousError = 0
    this.previousOutput = 0
  }
}

// ============================================================================
// CONTROL SYSTEM SIMULATION ENGINE
// ============================================================================

export class ControlSystemSimulationEngine {
  public static async simulate(
    config: ControlSystemConfig,
    fuelCellType: FuelCellType,
    parameters: SimulationParameters
  ): Promise<ControlSystemSimulationResult> {
    const startTime = Date.now()
    
    // Initialize system model
    const systemModel = new FuelCellSystemModel(fuelCellType, parameters.nominalConditions)
    
    // Initialize controllers
    const controllers = {
      thermal: config.thermal.enabled ? new PIDController(
        config.thermal.pidParams.kp,
        config.thermal.pidParams.ki,
        config.thermal.pidParams.kd,
        config.thermal.setpoint,
        config.thermal.constraints
      ) : null,
      
      humidity: config.humidity.enabled ? new PIDController(
        config.humidity.pidParams.kp,
        config.humidity.pidParams.ki,
        config.humidity.pidParams.kd,
        config.humidity.setpoint,
        config.humidity.constraints
      ) : null,
      
      pressure: config.pressure.enabled ? new PIDController(
        config.pressure.pidParams.kp,
        config.pressure.pidParams.ki,
        config.pressure.pidParams.kd,
        config.pressure.setpoint,
        config.pressure.constraints
      ) : null,
      
      airIntake: config.airIntake.enabled ? new PIDController(
        config.airIntake.pidParams.kp,
        config.airIntake.pidParams.ki,
        config.airIntake.pidParams.kd,
        config.airIntake.setpoint,
        config.airIntake.constraints
      ) : null
    }
    
    // Simulation arrays
    const timeData: number[] = []
    const temperatureData: number[] = []
    const humidityData: number[] = []
    const pressureData: number[] = []
    const powerData: number[] = []
    
    let currentTime = 0
    let purgeActive = false
    let purgeTimer = 0
    
    // Performance metrics tracking
    let maxOvershoot = 0
    let settlingTime = parameters.duration
    let responseTime = parameters.duration
    let steadyStateReached = false
    
    // Run simulation
    while (currentTime < parameters.duration) {
      // Check for disturbances
      const activeDisturbance = parameters.disturbances.find(d => 
        currentTime >= d.startTime && currentTime <= d.startTime + d.duration
      )
      
      // Update controllers
      const systemState = systemModel.getState()
      
      const thermalControl = controllers.thermal ? 
        controllers.thermal.update(systemState.temperature, parameters.timeStep) : 0
      const humidityControl = controllers.humidity ? 
        controllers.humidity.update(systemState.humidity, parameters.timeStep) : 0
      const pressureControl = controllers.pressure ? 
        controllers.pressure.update(systemState.pressure, parameters.timeStep) : 0
      const airFlowControl = controllers.airIntake ? 
        controllers.airIntake.update(systemState.airFlow, parameters.timeStep) : 0
      
      // Purging logic
      if (config.purging.enabled) {
        if (config.purging.strategy === 'COMPOSITION_BASED') {
          if (systemState.nitrogenFraction > config.purging.threshold && !purgeActive) {
            purgeActive = true
            purgeTimer = 0
          }
        } else if (config.purging.strategy === 'TIME_BASED') {
          if (currentTime % config.purging.interval < parameters.timeStep) {
            purgeActive = true
            purgeTimer = 0
          }
        }
        
        if (purgeActive) {
          purgeTimer += parameters.timeStep
          if (purgeTimer >= config.purging.duration) {
            purgeActive = false
          }
        }
      }
      
      // Step system model
      const result = systemModel.step(
        parameters.timeStep,
        {
          thermalControl,
          humidityControl,
          pressureControl,
          airFlowControl,
          purgeSignal: purgeActive
        },
        activeDisturbance
      )
      
      // Track performance metrics
      const tempError = Math.abs(result.temperature - config.thermal.setpoint)
      if (tempError > maxOvershoot) {
        maxOvershoot = tempError
      }
      
      if (!steadyStateReached && tempError < 0.02 * config.thermal.setpoint) {
        steadyStateReached = true
        settlingTime = currentTime
      }
      
      if (responseTime === parameters.duration && tempError < 0.63 * config.thermal.setpoint) {
        responseTime = currentTime
      }
      
      // Store data
      timeData.push(currentTime)
      temperatureData.push(result.temperature)
      humidityData.push(result.humidity)
      pressureData.push(result.pressure)
      powerData.push(result.power)
      
      currentTime += parameters.timeStep
    }
    
    // Calculate performance metrics
    const stability = this.calculateStability(temperatureData, pressureData)
    const performance = this.calculatePerformance(powerData)
    const efficiency = powerData.length > 0 ? powerData[powerData.length - 1] / Math.max(...powerData) * 100 : 0
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(config, fuelCellType, {
      stability,
      performance,
      maxOvershoot,
      settlingTime,
      responseTime
    })
    
    return {
      stability,
      performance,
      efficiency,
      responseTime,
      overshoot: (maxOvershoot / config.thermal.setpoint) * 100,
      settlingTime,
      recommendations,
      timeSeriesData: {
        time: timeData,
        temperature: temperatureData,
        humidity: humidityData,
        pressure: pressureData,
        power: powerData
      }
    }
  }
  
  private static calculateStability(temperatureData: number[], pressureData: number[]): number {
    if (temperatureData.length < 2) return 0
    
    // Calculate variance in the last 20% of the simulation (steady state)
    const steadyStateStart = Math.floor(temperatureData.length * 0.8)
    const steadyStateTemp = temperatureData.slice(steadyStateStart)
    const steadyStatePressure = pressureData.slice(steadyStateStart)
    
    const tempVariance = this.calculateVariance(steadyStateTemp)
    const pressureVariance = this.calculateVariance(steadyStatePressure)
    
    // Normalize variances and combine
    const tempStability = Math.max(0, 1 - tempVariance / 100)
    const pressureStability = Math.max(0, 1 - pressureVariance / 10)
    
    return (tempStability + pressureStability) / 2
  }
  
  private static calculatePerformance(powerData: number[]): number {
    if (powerData.length === 0) return 0
    
    const maxPower = Math.max(...powerData)
    const avgPower = powerData.reduce((sum, p) => sum + p, 0) / powerData.length
    
    return avgPower / maxPower
  }
  
  private static calculateVariance(data: number[]): number {
    if (data.length === 0) return 0
    
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length
  }
  
  private static generateRecommendations(
    config: ControlSystemConfig,
    fuelCellType: FuelCellType,
    metrics: {
      stability: number
      performance: number
      maxOvershoot: number
      settlingTime: number
      responseTime: number
    }
  ): string[] {
    const recommendations: string[] = []
    
    // Stability recommendations
    if (metrics.stability < 0.7) {
      recommendations.push('Consider reducing controller gains to improve stability')
      if (config.thermal.pidParams.kp > 1.0) {
        recommendations.push('Thermal controller Kp may be too high')
      }
    }
    
    // Performance recommendations
    if (metrics.performance < 0.8) {
      recommendations.push('System performance below optimal - check setpoints')
    }
    
    // Response time recommendations
    if (metrics.responseTime > 30) {
      recommendations.push('Slow response time - consider increasing proportional gain')
    }
    
    // Fuel cell specific recommendations
    if (fuelCellType === 'PEM' && !config.humidity.enabled) {
      recommendations.push('Enable humidity control for PEM fuel cells')
    }
    
    if (fuelCellType === 'SOFC' && config.thermal.setpoint < 700) {
      recommendations.push('SOFC operating temperature may be too low')
    }
    
    // Purging recommendations
    if (!config.purging.enabled) {
      recommendations.push('Consider enabling nitrogen purging for better performance')
    }
    
    return recommendations
  }
}

// ============================================================================
// SIMULATION PRESETS
// ============================================================================

export const SIMULATION_PRESETS = {
  BASIC_TEST: {
    duration: 120, // 2 minutes
    timeStep: 0.1,
    disturbances: [],
    nominalConditions: {
      temperature: 80,
      humidity: 100,
      pressure: 2.5,
      fuelFlow: 5.0,
      airFlow: 25.0
    }
  },
  
  LOAD_STEP: {
    duration: 180,
    timeStep: 0.1,
    disturbances: [
      {
        type: 'LOAD_CHANGE' as const,
        magnitude: 0.3,
        duration: 60,
        startTime: 60
      }
    ],
    nominalConditions: {
      temperature: 80,
      humidity: 100,
      pressure: 2.5,
      fuelFlow: 5.0,
      airFlow: 25.0
    }
  },
  
  THERMAL_DISTURBANCE: {
    duration: 240,
    timeStep: 0.1,
    disturbances: [
      {
        type: 'TEMPERATURE_SPIKE' as const,
        magnitude: 0.5,
        duration: 30,
        startTime: 90
      }
    ],
    nominalConditions: {
      temperature: 80,
      humidity: 100,
      pressure: 2.5,
      fuelFlow: 5.0,
      airFlow: 25.0
    }
  },
  
  COMPREHENSIVE: {
    duration: 300,
    timeStep: 0.1,
    disturbances: [
      {
        type: 'TEMPERATURE_SPIKE' as const,
        magnitude: 0.3,
        duration: 20,
        startTime: 60
      },
      {
        type: 'PRESSURE_DROP' as const,
        magnitude: 0.4,
        duration: 30,
        startTime: 150
      },
      {
        type: 'HUMIDITY_VARIATION' as const,
        magnitude: 0.2,
        duration: 40,
        startTime: 220
      }
    ],
    nominalConditions: {
      temperature: 80,
      humidity: 100,
      pressure: 2.5,
      fuelFlow: 5.0,
      airFlow: 25.0
    }
  }
} as const