import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const method = searchParams.get('method') || 'cyclic-voltammetry'
    
    // Get method configuration
    const methodConfig = await getMethodConfiguration(method)
    
    return NextResponse.json(methodConfig)
  } catch (error) {
    console.error('Error fetching method configuration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch method configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method, parameters, electrodeConfiguration, solution, optimizationRequest } = body
    
    // Validate required fields
    if (!method || !parameters) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }
    
    // Generate experiment data based on method and parameters
    const experimentData = await generateExperimentData({
      method,
      parameters,
      electrodeConfiguration,
      solution
    })
    
    // If optimization is requested, run parameter optimization
    let optimizationResult = null
    if (optimizationRequest) {
      optimizationResult = await optimizeElectrochemicalParameters({
        method,
        currentParameters: parameters,
        targetMetrics: optimizationRequest.targetMetrics,
        constraints: optimizationRequest.constraints
      })
    }
    
    return NextResponse.json({
      method,
      parameters,
      data: experimentData,
      optimization: optimizationResult,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating experiment data:', error)
    return NextResponse.json(
      { error: 'Failed to generate experiment data' },
      { status: 500 }
    )
  }
}

// Helper functions for electroanalytical methods
async function getMethodConfiguration(method: string) {
  const methodConfigs = {
    'cyclic-voltammetry': {
      name: 'Cyclic Voltammetry',
      description: 'Analyze redox processes and electron transfer kinetics',
      parameters: {
        scanRate: {
          name: 'Scan Rate',
          unit: 'mV/s',
          range: [1, 10000],
          default: 100,
          description: 'Rate of potential change'
        },
        startPotential: {
          name: 'Start Potential',
          unit: 'V',
          range: [-2, 2],
          default: -0.5,
          description: 'Initial potential value'
        },
        endPotential: {
          name: 'End Potential',
          unit: 'V',
          range: [-2, 2],
          default: 0.5,
          description: 'Final potential value'
        },
        cycles: {
          name: 'Number of Cycles',
          unit: '',
          range: [1, 10],
          default: 3,
          description: 'Number of potential cycles'
        }
      },
      applications: [
        'Redox potential determination',
        'Electron transfer kinetics',
        'Catalytic activity assessment',
        'Biofilm electroactivity'
      ]
    },
    
    'chronoamperometry': {
      name: 'Chronoamperometry',
      description: 'Monitor current response over time at fixed potential',
      parameters: {
        appliedPotential: {
          name: 'Applied Potential',
          unit: 'V',
          range: [-2, 2],
          default: 0.2,
          description: 'Fixed potential to apply'
        },
        duration: {
          name: 'Duration',
          unit: 's',
          range: [1, 3600],
          default: 300,
          description: 'Measurement duration'
        },
        samplingRate: {
          name: 'Sampling Rate',
          unit: 'Hz',
          range: [0.1, 1000],
          default: 10,
          description: 'Data acquisition frequency'
        }
      },
      applications: [
        'Diffusion coefficient measurement',
        'Electrode surface area determination',
        'Reaction mechanism study',
        'Biofilm growth monitoring'
      ]
    },
    
    'impedance': {
      name: 'Electrochemical Impedance Spectroscopy',
      description: 'Characterize system resistance and capacitance',
      parameters: {
        startFrequency: {
          name: 'Start Frequency',
          unit: 'Hz',
          range: [0.001, 1000000],
          default: 0.1,
          description: 'Initial frequency'
        },
        endFrequency: {
          name: 'End Frequency',
          unit: 'Hz',
          range: [0.001, 1000000],
          default: 10000,
          description: 'Final frequency'
        },
        amplitude: {
          name: 'AC Amplitude',
          unit: 'mV',
          range: [1, 100],
          default: 10,
          description: 'AC signal amplitude'
        },
        dcBias: {
          name: 'DC Bias',
          unit: 'V',
          range: [-2, 2],
          default: 0,
          description: 'DC offset potential'
        }
      },
      applications: [
        'Internal resistance measurement',
        'Charge transfer resistance',
        'Double layer capacitance',
        'Mass transport analysis'
      ]
    },
    
    'linear-sweep': {
      name: 'Linear Sweep Voltammetry',
      description: 'Single potential sweep for basic electrochemical analysis',
      parameters: {
        startPotential: {
          name: 'Start Potential',
          unit: 'V',
          range: [-2, 2],
          default: -0.5,
          description: 'Initial potential'
        },
        endPotential: {
          name: 'End Potential',
          unit: 'V',
          range: [-2, 2],
          default: 0.5,
          description: 'Final potential'
        },
        scanRate: {
          name: 'Scan Rate',
          unit: 'mV/s',
          range: [1, 10000],
          default: 50,
          description: 'Potential sweep rate'
        }
      },
      applications: [
        'Onset potential determination',
        'Peak current measurement',
        'Baseline electrochemical characterization',
        'Quick performance screening'
      ]
    }
  }
  
  return methodConfigs[method as keyof typeof methodConfigs] || methodConfigs['cyclic-voltammetry']
}

async function generateExperimentData(params: {
  method: string
  parameters: any
  electrodeConfiguration?: string
  solution?: string
}) {
  const { method, parameters } = params
  
  switch (method) {
    case 'cyclic-voltammetry':
      return generateCVData(parameters)
    case 'chronoamperometry':
      return generateCAData(parameters)
    case 'impedance':
      return generateEISData(parameters)
    case 'linear-sweep':
      return generateLSVData(parameters)
    default:
      return generateCVData(parameters)
  }
}

function generateCVData(parameters: any) {
  const { scanRate = 100, startPotential = -0.5, endPotential = 0.5, cycles = 3 } = parameters
  
  const data: Array<{ potential: number; current: number; cycle: number }> = []
  const points = 200
  
  for (let cycle = 1; cycle <= cycles; cycle++) {
    // Forward sweep
    for (let i = 0; i <= points; i++) {
      const potential = startPotential + (endPotential - startPotential) * (i / points)
      const current = calculateCVCurrent(potential, scanRate, cycle)
      data.push({ potential, current, cycle })
    }
    
    // Reverse sweep
    for (let i = points - 1; i >= 0; i--) {
      const potential = startPotential + (endPotential - startPotential) * (i / points)
      const current = calculateCVCurrent(potential, -scanRate, cycle)
      data.push({ potential, current, cycle })
    }
  }
  
  return {
    type: 'cyclic-voltammetry',
    data,
    analysis: {
      anodic_peak: { potential: 0.2, current: 0.8 },
      cathodic_peak: { potential: 0.1, current: -0.6 },
      peak_separation: 0.1,
      reversibility: 'quasi-reversible'
    }
  }
}

function generateCAData(parameters: any) {
  const { appliedPotential = 0.2, duration = 300, samplingRate = 10 } = parameters
  
  const data: Array<{ time: number; current: number }> = []
  const points = duration * samplingRate
  
  for (let i = 0; i <= points; i++) {
    const time = i / samplingRate
    const current = calculateCACurrent(time, appliedPotential)
    data.push({ time, current })
  }
  
  return {
    type: 'chronoamperometry',
    data,
    analysis: {
      initial_current: data[1]?.current || 0,
      steady_state_current: data[data.length - 1]?.current || 0,
      diffusion_coefficient: 2.3e-6,
      electrode_area: 1.0
    }
  }
}

function generateEISData(parameters: any) {
  const { startFrequency = 0.1, endFrequency = 10000, amplitude = 10 } = parameters
  
  const data: Array<{ frequency: number; real: number; imaginary: number; magnitude: number; phase: number }> = []
  const logStart = Math.log10(startFrequency)
  const logEnd = Math.log10(endFrequency)
  const points = 50
  
  for (let i = 0; i <= points; i++) {
    const logFreq = logStart + (logEnd - logStart) * (i / points)
    const frequency = Math.pow(10, logFreq)
    const impedance = calculateEISImpedance(frequency)
    
    data.push({
      frequency,
      real: impedance.real,
      imaginary: impedance.imaginary,
      magnitude: impedance.magnitude,
      phase: impedance.phase
    })
  }
  
  return {
    type: 'impedance',
    data,
    analysis: {
      solution_resistance: 50,
      charge_transfer_resistance: 150,
      double_layer_capacitance: 0.01,
      warburg_coefficient: 0.1
    }
  }
}

function generateLSVData(parameters: any) {
  const { startPotential = -0.5, endPotential = 0.5, scanRate = 50 } = parameters
  
  const data: Array<{ potential: number; current: number }> = []
  const points = 200
  
  for (let i = 0; i <= points; i++) {
    const potential = startPotential + (endPotential - startPotential) * (i / points)
    const current = calculateLSVCurrent(potential, scanRate)
    data.push({ potential, current })
  }
  
  return {
    type: 'linear-sweep',
    data,
    analysis: {
      onset_potential: -0.2,
      peak_potential: 0.2,
      peak_current: 0.9,
      half_wave_potential: 0.15
    }
  }
}

// Current calculation functions (simplified models)
function calculateCVCurrent(potential: number, scanRate: number, cycle: number): number {
  // Simplified Butler-Volmer kinetics with diffusion
  const E0 = 0.15 // Standard potential
  const alpha = 0.5 // Transfer coefficient
  const n = 1 // Number of electrons
  const F = 96485 // Faraday constant
  const R = 8.314 // Gas constant
  const T = 298 // Temperature
  
  const eta = potential - E0
  const i0 = 1e-3 // Exchange current density
  
  // Butler-Volmer equation
  const current = i0 * (
    Math.exp(alpha * n * F * eta / (R * T)) - 
    Math.exp(-(1 - alpha) * n * F * eta / (R * T))
  )
  
  // Add noise and cycle degradation
  const noise = (Math.random() - 0.5) * 0.05
  const degradation = Math.pow(0.95, cycle - 1)
  
  return current * degradation + noise
}

function calculateCACurrent(time: number, potential: number): number {
  // Cottrell equation for diffusion-limited current
  const D = 2e-6 // Diffusion coefficient
  const c = 1e-3 // Concentration
  const A = 1e-4 // Electrode area
  const n = 1 // Number of electrons
  const F = 96485
  
  const cottrell = n * F * A * c * Math.sqrt(D / (Math.PI * time))
  
  // Add exponential decay and noise
  const current = cottrell * Math.exp(-time / 100) + 0.1
  const noise = (Math.random() - 0.5) * 0.02
  
  return Math.max(0, current + noise)
}

function calculateEISImpedance(frequency: number) {
  // Simplified Randles circuit model
  const Rs = 50 // Solution resistance
  const Rct = 150 // Charge transfer resistance
  const Cdl = 0.01 // Double layer capacitance
  const sigma = 100 // Warburg coefficient
  
  const omega = 2 * Math.PI * frequency
  
  // Warburg impedance
  const Zw_real = sigma / Math.sqrt(omega)
  const Zw_imag = -sigma / Math.sqrt(omega)
  
  // Capacitor impedance
  const Zc_imag = -1 / (omega * Cdl)
  
  // Parallel combination of Rct and Cdl in series with Warburg
  const denom_real = Rct + Zw_real
  const denom_imag = Zc_imag + Zw_imag
  const denom_mag_sq = denom_real * denom_real + denom_imag * denom_imag
  
  const Z_real = Rs + (Rct * denom_real + Zc_imag * denom_imag) / denom_mag_sq
  const Z_imag = (Rct * denom_imag - Zc_imag * denom_real) / denom_mag_sq
  
  const magnitude = Math.sqrt(Z_real * Z_real + Z_imag * Z_imag)
  const phase = Math.atan2(Z_imag, Z_real) * 180 / Math.PI
  
  return {
    real: Z_real,
    imaginary: Z_imag,
    magnitude,
    phase
  }
}

function calculateLSVCurrent(potential: number, scanRate: number): number {
  // Peak-shaped current response
  const Ep = 0.2 // Peak potential
  const ip = 0.9 // Peak current
  const width = 0.15 // Peak width
  
  const current = ip * Math.exp(-Math.pow((potential - Ep) / width, 2))
  
  // Add scan rate dependency and noise
  const scanFactor = Math.sqrt(scanRate / 50)
  const noise = (Math.random() - 0.5) * 0.02
  
  return current * scanFactor + noise
}

// ============================================================================
// ELECTROCHEMICAL OPTIMIZATION
// ============================================================================

async function optimizeElectrochemicalParameters(request: {
  method: string
  currentParameters: any
  targetMetrics: any
  constraints: any
}) {
  const { method, currentParameters, targetMetrics, constraints } = request
  
  // Define optimization objectives based on method
  const methodObjectives = {
    'cyclic-voltammetry': {
      primary: 'peak_current',
      secondary: 'reversibility',
      optimize: ['scanRate', 'startPotential', 'endPotential']
    },
    'chronoamperometry': {
      primary: 'steady_state_current',
      secondary: 'signal_stability',
      optimize: ['appliedPotential', 'duration']
    },
    'impedance': {
      primary: 'charge_transfer_resistance',
      secondary: 'solution_resistance',
      optimize: ['startFrequency', 'endFrequency', 'amplitude']
    },
    'linear-sweep': {
      primary: 'peak_current',
      secondary: 'onset_potential',
      optimize: ['scanRate', 'startPotential', 'endPotential']
    }
  }
  
  const methodConfig = methodObjectives[method as keyof typeof methodObjectives]
  if (!methodConfig) {
    throw new Error(`Optimization not supported for method: ${method}`)
  }
  
  // Simple hill-climbing optimization
  let bestParameters = { ...currentParameters }
  let bestScore = await evaluateElectrochemicalPerformance(method, bestParameters, targetMetrics)
  
  const optimizationSteps = []
  const maxIterations = 20
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let improved = false
    
    // Try adjusting each optimizable parameter
    for (const param of methodConfig.optimize) {
      if (!(param in bestParameters)) continue
      
      const currentValue = bestParameters[param]
      const adjustments = getParameterAdjustments(param, currentValue, constraints)
      
      for (const adjustment of adjustments) {
        const testParameters = { ...bestParameters, [param]: adjustment }
        const score = await evaluateElectrochemicalPerformance(method, testParameters, targetMetrics)
        
        if (score > bestScore) {
          bestParameters = testParameters
          bestScore = score
          improved = true
          
          optimizationSteps.push({
            iteration,
            parameter: param,
            oldValue: currentValue,
            newValue: adjustment,
            score
          })
          break
        }
      }
    }
    
    if (!improved) break // Local optimum reached
  }
  
  // Calculate improvements
  const initialScore = await evaluateElectrochemicalPerformance(method, currentParameters, targetMetrics)
  const improvement = ((bestScore - initialScore) / initialScore) * 100
  
  return {
    method,
    optimizedParameters: bestParameters,
    performance: {
      initialScore,
      optimizedScore: bestScore,
      improvement: improvement.toFixed(1) + '%'
    },
    optimizationSteps,
    recommendations: generateElectrochemicalRecommendations(method, bestParameters, currentParameters)
  }
}

async function evaluateElectrochemicalPerformance(
  method: string, 
  parameters: any, 
  targetMetrics: any
): Promise<number> {
  // Generate simulated data for the parameters
  const simulatedData = await generateExperimentData({ method, parameters })
  
  let score = 0
  
  switch (method) {
    case 'cyclic-voltammetry':
      // Evaluate based on peak current, reversibility, etc.
      const peakCurrent = simulatedData.analysis.anodic_peak.current
      const reversibility = simulatedData.analysis.peak_separation
      
      score += Math.abs(peakCurrent) * 100 // Higher current is better
      score += Math.max(0, 100 - reversibility * 1000) // Lower peak separation is better
      break
      
    case 'chronoamperometry':
      // Evaluate based on steady-state current and stability
      const steadyStateCurrent = simulatedData.analysis.steady_state_current
      const initialCurrent = simulatedData.analysis.initial_current
      const stability = steadyStateCurrent / initialCurrent
      
      score += steadyStateCurrent * 1000
      score += stability * 50
      break
      
    case 'impedance':
      // Evaluate based on resistance values
      const chargeTransferR = simulatedData.analysis.charge_transfer_resistance
      const solutionR = simulatedData.analysis.solution_resistance
      
      score += Math.max(0, 500 - chargeTransferR) // Lower is better
      score += Math.max(0, 200 - solutionR) // Lower is better
      break
      
    case 'linear-sweep':
      // Evaluate based on peak current and onset potential
      const peakCurrentLSV = simulatedData.analysis.peak_current
      const onsetPotential = simulatedData.analysis.onset_potential
      
      score += peakCurrentLSV * 100
      score += Math.max(0, 100 + onsetPotential * 200) // Earlier onset is better (more negative)
      break
  }
  
  // Apply target metric weights if provided
  if (targetMetrics) {
    // Adjust score based on how well we meet targets
    // This is a simplified implementation
  }
  
  return Math.max(0, score)
}

function getParameterAdjustments(parameter: string, currentValue: number, constraints: any): number[] {
  const adjustmentFactors = [-0.2, -0.1, 0.1, 0.2] // ±20%, ±10%
  const adjustments: number[] = []
  
  for (const factor of adjustmentFactors) {
    const newValue = currentValue * (1 + factor)
    
    // Apply constraints if provided
    if (constraints && constraints[parameter]) {
      const { min, max } = constraints[parameter]
      if (newValue >= min && newValue <= max) {
        adjustments.push(newValue)
      }
    } else {
      // Apply default reasonable bounds
      const bounds = getDefaultParameterBounds(parameter)
      if (newValue >= bounds.min && newValue <= bounds.max) {
        adjustments.push(newValue)
      }
    }
  }
  
  return adjustments
}

function getDefaultParameterBounds(parameter: string): { min: number; max: number } {
  const bounds = {
    scanRate: { min: 1, max: 10000 },
    startPotential: { min: -2, max: 2 },
    endPotential: { min: -2, max: 2 },
    appliedPotential: { min: -2, max: 2 },
    duration: { min: 1, max: 3600 },
    samplingRate: { min: 0.1, max: 1000 },
    startFrequency: { min: 0.001, max: 1000000 },
    endFrequency: { min: 0.001, max: 1000000 },
    amplitude: { min: 1, max: 100 },
    dcBias: { min: -2, max: 2 }
  }
  
  return bounds[parameter as keyof typeof bounds] || { min: 0, max: 1000 }
}

function generateElectrochemicalRecommendations(
  method: string, 
  optimizedParams: any, 
  originalParams: any
): Array<{ parameter: string; change: string; reasoning: string }> {
  const recommendations = []
  
  for (const [param, optimizedValue] of Object.entries(optimizedParams)) {
    const originalValue = originalParams[param]
    if (originalValue !== optimizedValue) {
      const change = optimizedValue > originalValue ? 'increased' : 'decreased'
      const percentage = Math.abs(((optimizedValue as number - originalValue) / originalValue) * 100).toFixed(1)
      
      recommendations.push({
        parameter: param,
        change: `${change} by ${percentage}%`,
        reasoning: getParameterRecommendationReasoning(method, param, change)
      })
    }
  }
  
  return recommendations
}

function getParameterRecommendationReasoning(
  method: string, 
  parameter: string, 
  change: string
): string {
  const reasonings = {
    'cyclic-voltammetry': {
      scanRate: change === 'increased' 
        ? 'Higher scan rate improves peak current response' 
        : 'Lower scan rate improves peak resolution',
      startPotential: 'Adjusted to capture full redox window',
      endPotential: 'Optimized for complete electron transfer characterization'
    },
    'chronoamperometry': {
      appliedPotential: change === 'increased' 
        ? 'Higher potential drives more complete reaction' 
        : 'Lower potential reduces side reactions',
      duration: 'Optimized for steady-state current measurement'
    },
    'impedance': {
      startFrequency: 'Adjusted to capture low-frequency processes',
      endFrequency: 'Optimized for high-frequency resistance measurement',
      amplitude: 'Balanced for signal quality and linearity'
    },
    'linear-sweep': {
      scanRate: 'Optimized for peak current and resolution',
      startPotential: 'Adjusted for baseline establishment',
      endPotential: 'Set to capture full oxidation range'
    }
  }
  
  const methodReasons = reasonings[method as keyof typeof reasonings] || {}
  return methodReasons[parameter as keyof typeof methodReasons] || 'Parameter adjusted for improved performance'
}