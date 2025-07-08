export interface ElectroanalyticalTechnique {
  id: string
  name: string
  abbreviation: string
  description: string
  category: 'voltammetry' | 'impedance' | 'chronometric' | 'pulse'
  applications: string[]
  parameters: {
    [key: string]: {
      name: string
      unit: string
      min: number
      max: number
      default: number
      description: string
    }
  }
  dataTypes: string[]
  timeRange: {
    min: number // seconds
    max: number // seconds
    typical: number // seconds
  }
  voltageRange: {
    min: number // V
    max: number // V
  }
  sensitivity: number // relative scale 1-10
  complexity: number // relative scale 1-10
}

export const electroanalyticalCatalog: ElectroanalyticalTechnique[] = [
  {
    id: 'cv',
    name: 'Cyclic Voltammetry',
    abbreviation: 'CV',
    description: 'Electrochemical technique that measures current response to a linearly varying potential',
    category: 'voltammetry',
    applications: [
      'Biofilm characterization',
      'Electron transfer kinetics',
      'Redox potential determination',
      'Electrode surface analysis',
      'Mediator studies'
    ],
    parameters: {
      startPotential: {
        name: 'Start Potential',
        unit: 'V',
        min: -2.0,
        max: 2.0,
        default: -0.6,
        description: 'Initial potential for the scan'
      },
      endPotential: {
        name: 'End Potential', 
        unit: 'V',
        min: -2.0,
        max: 2.0,
        default: 0.4,
        description: 'Final potential for the scan'
      },
      scanRate: {
        name: 'Scan Rate',
        unit: 'V/s',
        min: 0.001,
        max: 10.0,
        default: 0.1,
        description: 'Rate of potential change'
      },
      numberOfScans: {
        name: 'Number of Scans',
        unit: 'cycles',
        min: 1,
        max: 100,
        default: 3,
        description: 'Number of CV cycles to perform'
      }
    },
    dataTypes: ['potential', 'current', 'time'],
    timeRange: { min: 10, max: 3600, typical: 120 },
    voltageRange: { min: -2.0, max: 2.0 },
    sensitivity: 7,
    complexity: 5
  },
  {
    id: 'eis',
    name: 'Electrochemical Impedance Spectroscopy',
    abbreviation: 'EIS',
    description: 'Technique that measures impedance over a range of frequencies to characterize electrode processes',
    category: 'impedance',
    applications: [
      'Biofilm resistance measurement',
      'Charge transfer resistance',
      'Double layer capacitance',
      'Mass transport analysis',
      'Electrode degradation monitoring'
    ],
    parameters: {
      dcPotential: {
        name: 'DC Potential',
        unit: 'V',
        min: -1.0,
        max: 1.0,
        default: 0.0,
        description: 'DC bias potential'
      },
      acAmplitude: {
        name: 'AC Amplitude',
        unit: 'V',
        min: 0.001,
        max: 0.1,
        default: 0.01,
        description: 'AC perturbation amplitude'
      },
      startFrequency: {
        name: 'Start Frequency',
        unit: 'Hz',
        min: 0.01,
        max: 1000000,
        default: 100000,
        description: 'Starting frequency for sweep'
      },
      endFrequency: {
        name: 'End Frequency',
        unit: 'Hz',
        min: 0.01,
        max: 1000000,
        default: 0.1,
        description: 'Ending frequency for sweep'
      },
      pointsPerDecade: {
        name: 'Points per Decade',
        unit: 'points',
        min: 5,
        max: 20,
        default: 10,
        description: 'Number of measurement points per frequency decade'
      }
    },
    dataTypes: ['frequency', 'impedance_real', 'impedance_imaginary', 'phase'],
    timeRange: { min: 60, max: 1800, typical: 300 },
    voltageRange: { min: -1.0, max: 1.0 },
    sensitivity: 9,
    complexity: 8
  },
  {
    id: 'ca',
    name: 'Chronoamperometry',
    abbreviation: 'CA',
    description: 'Technique that measures current response to a potential step as a function of time',
    category: 'chronometric',
    applications: [
      'Diffusion coefficient measurement',
      'Biofilm growth monitoring',
      'Substrate consumption analysis',
      'Electrode kinetics',
      'Mass transport studies'
    ],
    parameters: {
      initialPotential: {
        name: 'Initial Potential',
        unit: 'V',
        min: -2.0,
        max: 2.0,
        default: 0.0,
        description: 'Starting potential before step'
      },
      stepPotential: {
        name: 'Step Potential',
        unit: 'V',
        min: -2.0,
        max: 2.0,
        default: 0.3,
        description: 'Potential after the step'
      },
      stepDuration: {
        name: 'Step Duration',
        unit: 's',
        min: 1,
        max: 3600,
        default: 300,
        description: 'Duration of the potential step'
      },
      samplingRate: {
        name: 'Sampling Rate',
        unit: 'Hz',
        min: 0.1,
        max: 1000,
        default: 10,
        description: 'Data collection frequency'
      }
    },
    dataTypes: ['time', 'current', 'potential'],
    timeRange: { min: 1, max: 3600, typical: 300 },
    voltageRange: { min: -2.0, max: 2.0 },
    sensitivity: 6,
    complexity: 4
  },
  {
    id: 'dpv',
    name: 'Differential Pulse Voltammetry',
    abbreviation: 'DPV',
    description: 'Pulse technique that provides enhanced sensitivity for trace analysis',
    category: 'pulse',
    applications: [
      'Trace mediator detection',
      'Low concentration analysis',
      'Multiple species identification',
      'Enhanced sensitivity measurements',
      'Biomarker detection'
    ],
    parameters: {
      startPotential: {
        name: 'Start Potential',
        unit: 'V',
        min: -2.0,
        max: 2.0,
        default: -0.5,
        description: 'Initial potential for the scan'
      },
      endPotential: {
        name: 'End Potential',
        unit: 'V',
        min: -2.0,
        max: 2.0,
        default: 0.5,
        description: 'Final potential for the scan'
      },
      pulseAmplitude: {
        name: 'Pulse Amplitude',
        unit: 'V',
        min: 0.001,
        max: 0.1,
        default: 0.05,
        description: 'Amplitude of the differential pulse'
      },
      pulseWidth: {
        name: 'Pulse Width',
        unit: 'ms',
        min: 1,
        max: 1000,
        default: 50,
        description: 'Duration of each pulse'
      },
      stepPotential: {
        name: 'Step Potential',
        unit: 'V',
        min: 0.001,
        max: 0.1,
        default: 0.005,
        description: 'Potential increment between pulses'
      }
    },
    dataTypes: ['potential', 'current_difference', 'time'],
    timeRange: { min: 30, max: 600, typical: 120 },
    voltageRange: { min: -2.0, max: 2.0 },
    sensitivity: 9,
    complexity: 6
  },
  {
    id: 'swv',
    name: 'Square Wave Voltammetry',
    abbreviation: 'SWV',
    description: 'Fast pulse technique combining high sensitivity with rapid analysis',
    category: 'pulse',
    applications: [
      'Rapid screening',
      'Multi-analyte detection',
      'High-throughput analysis',
      'Real-time monitoring',
      'Process control'
    ],
    parameters: {
      startPotential: {
        name: 'Start Potential',
        unit: 'V',
        min: -2.0,
        max: 2.0,
        default: -0.5,
        description: 'Initial potential for the scan'
      },
      endPotential: {
        name: 'End Potential',
        unit: 'V',
        min: -2.0,
        max: 2.0,
        default: 0.5,
        description: 'Final potential for the scan'
      },
      frequency: {
        name: 'Frequency',
        unit: 'Hz',
        min: 1,
        max: 1000,
        default: 25,
        description: 'Square wave frequency'
      },
      amplitude: {
        name: 'SW Amplitude',
        unit: 'V',
        min: 0.001,
        max: 0.1,
        default: 0.025,
        description: 'Square wave amplitude'
      },
      stepPotential: {
        name: 'Step Potential',
        unit: 'V',
        min: 0.001,
        max: 0.02,
        default: 0.004,
        description: 'Potential increment'
      }
    },
    dataTypes: ['potential', 'forward_current', 'reverse_current', 'net_current'],
    timeRange: { min: 10, max: 300, typical: 60 },
    voltageRange: { min: -2.0, max: 2.0 },
    sensitivity: 8,
    complexity: 7
  },
  {
    id: 'lsv',
    name: 'Linear Sweep Voltammetry',
    abbreviation: 'LSV',
    description: 'Single potential sweep technique for basic electrochemical characterization',
    category: 'voltammetry',
    applications: [
      'Redox potential screening',
      'Electrode material testing',
      'Basic electrochemical analysis',
      'Potential window determination',
      'Background characterization'
    ],
    parameters: {
      startPotential: {
        name: 'Start Potential',
        unit: 'V',
        min: -2.0,
        max: 2.0,
        default: -0.6,
        description: 'Initial potential for the sweep'
      },
      endPotential: {
        name: 'End Potential',
        unit: 'V',
        min: -2.0,
        max: 2.0,
        default: 0.6,
        description: 'Final potential for the sweep'
      },
      scanRate: {
        name: 'Scan Rate',
        unit: 'V/s',
        min: 0.001,
        max: 10.0,
        default: 0.1,
        description: 'Rate of potential change'
      }
    },
    dataTypes: ['potential', 'current', 'time'],
    timeRange: { min: 5, max: 1200, typical: 60 },
    voltageRange: { min: -2.0, max: 2.0 },
    sensitivity: 5,
    complexity: 3
  }
]

// Helper functions for technique selection and filtering
export function getTechniqueById(id: string): ElectroanalyticalTechnique | undefined {
  return electroanalyticalCatalog.find(technique => technique.id === id)
}

export function getTechniquesByCategory(category: string): ElectroanalyticalTechnique[] {
  return electroanalyticalCatalog.filter(technique => technique.category === category)
}

export function getTechniquesByApplication(application: string): ElectroanalyticalTechnique[] {
  return electroanalyticalCatalog.filter(technique => 
    technique.applications.some(app => 
      app.toLowerCase().includes(application.toLowerCase())
    )
  )
}