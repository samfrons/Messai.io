// Control System Simulation for Fuel Cells
import { 
  FuelCellConfiguration, 
  ControlSystemParameters, 
  SimulationParameters, 
  SimulationResult,
  FuelCellType 
} from './types/fuel-cell-types'

export interface PIDController {
  kp: number
  ki: number
  kd: number
  setpoint: number
  previousError: number
  integral: number
  lastTime: number
}

export interface SystemState {
  voltage: number
  current: number
  power: number
  temperature: number
  pressure: number
  fuelFlow: number
  airFlow: number
  efficiency: number
}

export interface DisturbanceModel {
  loadStep: (time: number) => number
  temperatureDrift: (time: number) => number
  pressureNoise: (time: number) => number
}

// Main simulation function
export const simulateControlSystem = (
  fuelCellConfig: FuelCellConfiguration,
  controlParams: ControlSystemParameters,
  simParams: SimulationParameters
): SimulationResult => {
  
  const timeSteps = Math.floor(simParams.duration / simParams.timeStep)
  const timeData: number[] = []
  const voltageData: number[] = []
  const currentData: number[] = []
  const powerData: number[] = []
  const temperatureData: number[] = []
  const pressureData: number[] = []
  const efficiencyData: number[] = []
  
  const controlSignals = {
    time: [] as number[],
    fuelFlow: [] as number[],
    airFlow: [] as number[],
    coolingRate: [] as number[]
  }
  
  // Initialize controllers
  const voltageController = createPIDController(
    controlParams.tuning.kp || 1.0,
    controlParams.tuning.ki || 0.1,
    controlParams.tuning.kd || 0.01,
    controlParams.setpoints.voltage || 0.7
  )
  
  const temperatureController = createPIDController(
    controlParams.tuning.kp || 0.5,
    controlParams.tuning.ki || 0.05,
    controlParams.tuning.kd || 0.005,
    controlParams.setpoints.temperature || fuelCellConfig.operatingTemperature
  )
  
  // Initialize system state
  let state: SystemState = {
    voltage: simParams.initialConditions.voltage,
    current: simParams.initialConditions.current,
    power: simParams.initialConditions.voltage * simParams.initialConditions.current,
    temperature: simParams.initialConditions.temperature,
    pressure: simParams.initialConditions.pressure,
    fuelFlow: fuelCellConfig.fuelFlowRate,
    airFlow: fuelCellConfig.airFlowRate,
    efficiency: 50
  }
  
  // Disturbance model
  const disturbances = createDisturbanceModel(simParams.disturbances || {})
  
  // Simulation loop
  for (let i = 0; i < timeSteps; i++) {
    const time = i * simParams.timeStep
    
    // Apply disturbances
    const loadDisturbance = disturbances.loadStep(time)
    const tempDisturbance = disturbances.temperatureDrift(time)
    const pressureDisturbance = disturbances.pressureNoise(time)
    
    // Update system dynamics
    state = updateSystemDynamics(
      state, 
      fuelCellConfig, 
      simParams.timeStep,
      { load: loadDisturbance, temperature: tempDisturbance, pressure: pressureDisturbance }
    )
    
    // Control system response
    const voltageError = voltageController.setpoint - state.voltage
    const temperatureError = temperatureController.setpoint - state.temperature
    
    const fuelFlowControl = updatePIDController(voltageController, voltageError, time)
    const coolingControl = updatePIDController(temperatureController, temperatureError, time)
    
    // Apply control actions with constraints
    state.fuelFlow = Math.max(0.1, Math.min(50, state.fuelFlow + fuelFlowControl * 0.1))
    state.airFlow = state.fuelFlow * 2.0 // Stoichiometric ratio
    const coolingRate = Math.max(0, Math.min(1000, coolingControl))
    
    // Update derived values
    state.power = state.voltage * state.current
    state.efficiency = calculateEfficiency(state, fuelCellConfig.type)
    
    // Store data
    timeData.push(time)
    voltageData.push(state.voltage)
    currentData.push(state.current)
    powerData.push(state.power)
    temperatureData.push(state.temperature)
    pressureData.push(state.pressure)
    efficiencyData.push(state.efficiency)
    
    controlSignals.time.push(time)
    controlSignals.fuelFlow.push(state.fuelFlow)
    controlSignals.airFlow.push(state.airFlow)
    controlSignals.coolingRate.push(coolingRate)
  }
  
  // Calculate performance metrics
  const performance = calculatePerformanceMetrics(
    powerData, 
    efficiencyData, 
    voltageData, 
    timeData,
    controlParams.setpoints
  )
  
  return {
    timeData,
    voltageData,
    currentData,
    powerData,
    temperatureData,
    pressureData,
    efficiencyData,
    controlSignals,
    performance
  }
}

// Helper functions
const createPIDController = (kp: number, ki: number, kd: number, setpoint: number): PIDController => ({
  kp,
  ki,
  kd,
  setpoint,
  previousError: 0,
  integral: 0,
  lastTime: 0
})

const updatePIDController = (controller: PIDController, error: number, time: number): number => {
  const dt = time - controller.lastTime
  
  if (dt <= 0) return 0
  
  controller.integral += error * dt
  const derivative = (error - controller.previousError) / dt
  
  const output = controller.kp * error + controller.ki * controller.integral + controller.kd * derivative
  
  controller.previousError = error
  controller.lastTime = time
  
  return output
}

const updateSystemDynamics = (
  state: SystemState, 
  config: FuelCellConfiguration, 
  dt: number,
  disturbances: { load: number; temperature: number; pressure: number }
): SystemState => {
  
  // Simplified fuel cell dynamics
  const newState = { ...state }
  
  // Temperature dynamics (first-order with time constant)
  const temperatureTimeConstant = 60 // seconds
  const targetTemp = config.operatingTemperature + disturbances.temperature
  newState.temperature += (targetTemp - state.temperature) * dt / temperatureTimeConstant
  
  // Pressure dynamics
  newState.pressure = config.operatingPressure + disturbances.pressure
  
  // Electrochemical dynamics
  const temperatureFactor = calculateTemperatureFactor(newState.temperature, config.type)
  const flowFactor = calculateFlowFactor(state.fuelFlow, state.airFlow)
  const loadFactor = 1 + disturbances.load
  
  // Voltage-current relationship (simplified polarization curve)
  const openCircuitVoltage = getOpenCircuitVoltage(config.type) * temperatureFactor
  const currentDensity = (state.current / config.activeArea) * loadFactor
  
  // Voltage drops
  const activationLoss = 0.1 * Math.log(currentDensity + 1)
  const ohmicLoss = 0.05 * currentDensity
  const concentrationLoss = currentDensity > 500 ? 0.02 * Math.pow(currentDensity / 500, 2) : 0
  
  newState.voltage = Math.max(0.1, openCircuitVoltage - activationLoss - ohmicLoss - concentrationLoss)
  newState.current = currentDensity * config.activeArea
  
  return newState
}

const createDisturbanceModel = (disturbances: any): DisturbanceModel => ({
  loadStep: (time: number) => {
    // Step load change at t=30s
    if (time > 30 && time < 60) return 0.2
    if (time > 120 && time < 150) return -0.1
    return 0
  },
  
  temperatureDrift: (time: number) => {
    // Sinusoidal temperature variation
    return 2 * Math.sin(0.01 * time)
  },
  
  pressureNoise: (time: number) => {
    // Random pressure noise
    return 0.05 * (Math.random() - 0.5)
  }
})

const calculateTemperatureFactor = (temperature: number, type: FuelCellType): number => {
  const optimalTemp = {
    PEM: 70,
    SOFC: 850,
    PAFC: 200,
    MCFC: 650,
    AFC: 80
  }[type]
  
  const tempDiff = Math.abs(temperature - optimalTemp)
  return Math.max(0.5, 1 - tempDiff / optimalTemp * 0.3)
}

const calculateFlowFactor = (fuelFlow: number, airFlow: number): number => {
  const ratio = airFlow / fuelFlow
  const optimalRatio = 2.0
  return Math.max(0.7, 1 - Math.abs(ratio - optimalRatio) / optimalRatio * 0.2)
}

const getOpenCircuitVoltage = (type: FuelCellType): number => {
  return {
    PEM: 1.0,
    SOFC: 1.1,
    PAFC: 0.95,
    MCFC: 1.05,
    AFC: 1.15
  }[type]
}

const calculateEfficiency = (state: SystemState, type: FuelCellType): number => {
  const maxEfficiency = {
    PEM: 60,
    SOFC: 85,
    PAFC: 55,
    MCFC: 65,
    AFC: 70
  }[type]
  
  // Efficiency decreases with current density and temperature deviation
  const currentFactor = Math.max(0.6, 1 - state.current / 1000 * 0.2)
  const tempFactor = calculateTemperatureFactor(state.temperature, type)
  
  return maxEfficiency * currentFactor * tempFactor
}

const calculatePerformanceMetrics = (
  powerData: number[], 
  efficiencyData: number[], 
  voltageData: number[], 
  timeData: number[],
  setpoints: any
) => {
  const averagePower = powerData.reduce((sum, p) => sum + p, 0) / powerData.length
  const averageEfficiency = efficiencyData.reduce((sum, e) => sum + e, 0) / efficiencyData.length
  
  // Calculate stability index (coefficient of variation)
  const powerStdDev = Math.sqrt(
    powerData.reduce((sum, p) => sum + Math.pow(p - averagePower, 2), 0) / powerData.length
  )
  const stabilityIndex = 1 - (powerStdDev / averagePower)
  
  // Calculate response time (time to reach 90% of setpoint after step change)
  const responseTime = calculateResponseTime(voltageData, timeData, setpoints.voltage || 0.7)
  
  return {
    averagePower: Math.round(averagePower * 100) / 100,
    averageEfficiency: Math.round(averageEfficiency * 100) / 100,
    stabilityIndex: Math.round(stabilityIndex * 1000) / 1000,
    responseTime: Math.round(responseTime * 100) / 100
  }
}

const calculateResponseTime = (voltageData: number[], timeData: number[], setpoint: number): number => {
  const target = setpoint * 0.9
  
  for (let i = 1; i < voltageData.length; i++) {
    if (Math.abs(voltageData[i] - setpoint) <= Math.abs(setpoint - target)) {
      return timeData[i]
    }
  }
  
  return timeData[timeData.length - 1] // Return simulation duration if not reached
}

// Advanced control algorithms
export const designMPCController = (
  fuelCellConfig: FuelCellConfiguration,
  constraints: any
) => {
  // Model Predictive Control design
  // This would involve more complex optimization algorithms
  return {
    predictionHorizon: 10,
    controlHorizon: 5,
    weights: {
      voltage: 1.0,
      efficiency: 0.5,
      control_effort: 0.1
    },
    constraints
  }
}

export const designAdaptiveController = (
  systemIdentificationData: any
) => {
  // Adaptive control design based on system identification
  return {
    adaptationRate: 0.01,
    forgettingFactor: 0.95,
    initialGains: { kp: 1.0, ki: 0.1, kd: 0.01 }
  }
}

// Simulation presets for common scenarios
export const SIMULATION_PRESETS = {
  STARTUP_SEQUENCE: {
    duration: 300,
    timeStep: 1,
    initialConditions: {
      temperature: 25,
      pressure: 1.0,
      voltage: 0.3,
      current: 0.1
    },
    disturbances: {
      loadChanges: [
        { time: 60, value: 0.5 },
        { time: 180, value: 1.0 }
      ]
    }
  },
  LOAD_FOLLOWING: {
    duration: 600,
    timeStep: 1,
    initialConditions: {
      temperature: 70,
      pressure: 1.5,
      voltage: 0.7,
      current: 10
    },
    disturbances: {
      loadChanges: [
        { time: 100, value: 0.3 },
        { time: 200, value: -0.2 },
        { time: 300, value: 0.4 },
        { time: 400, value: -0.3 },
        { time: 500, value: 0.2 }
      ]
    }
  },
  THERMAL_CYCLING: {
    duration: 1200,
    timeStep: 2,
    initialConditions: {
      temperature: 70,
      pressure: 1.5,
      voltage: 0.7,
      current: 15
    },
    disturbances: {
      temperatureVariations: [
        { time: 200, value: 10 },
        { time: 400, value: -15 },
        { time: 600, value: 20 },
        { time: 800, value: -10 },
        { time: 1000, value: 5 }
      ]
    }
  },
  PRESSURE_VARIATIONS: {
    duration: 400,
    timeStep: 1,
    initialConditions: {
      temperature: 70,
      pressure: 1.5,
      voltage: 0.7,
      current: 12
    },
    disturbances: {
      pressureVariations: [
        { time: 50, value: 0.5 },
        { time: 150, value: -0.3 },
        { time: 250, value: 0.8 },
        { time: 350, value: -0.4 }
      ]
    }
  }
}

// Main simulation engine class
export class ControlSystemSimulationEngine {
  private fuelCellConfig: FuelCellConfiguration
  private controlParams: ControlSystemParameters
  
  constructor(config: FuelCellConfiguration, controlParams: ControlSystemParameters) {
    this.fuelCellConfig = config
    this.controlParams = controlParams
  }
  
  simulate(simParams: SimulationParameters): SimulationResult {
    return simulateControlSystem(this.fuelCellConfig, this.controlParams, simParams)
  }
  
  runPreset(presetName: keyof typeof SIMULATION_PRESETS): SimulationResult {
    const preset = SIMULATION_PRESETS[presetName]
    return this.simulate(preset)
  }
  
  updateConfiguration(config: Partial<FuelCellConfiguration>): void {
    this.fuelCellConfig = { ...this.fuelCellConfig, ...config }
  }
  
  updateControlParameters(params: Partial<ControlSystemParameters>): void {
    this.controlParams = { ...this.controlParams, ...params }
  }
  
  getConfiguration(): FuelCellConfiguration {
    return { ...this.fuelCellConfig }
  }
  
  getControlParameters(): ControlSystemParameters {
    return { ...this.controlParams }
  }
}