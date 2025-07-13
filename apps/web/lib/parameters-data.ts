// MESS Parameter Library Data Structure
// Auto-generated from MESS_PARAMETER_LIBRARY.md

export interface Parameter {
  id: string
  name: string
  description: string
  unit?: string
  range?: {
    min?: number
    max?: number
    typical?: number
  }
  category: string
  subcategory: string
  tags: string[]
  relatedParameters?: string[]
  notes?: string
}

export interface ParameterCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  subcategories: ParameterSubcategory[]
}

export interface ParameterSubcategory {
  id: string
  name: string
  description: string
  parameters: Parameter[]
}

// Main parameter categories with icons and colors
export const parameterCategories: ParameterCategory[] = [
  {
    id: 'environmental',
    name: 'Environmental Parameters',
    icon: '🌍',
    color: 'blue',
    description: 'Atmospheric, ambient, and external conditions affecting MESS operation',
    subcategories: []
  },
  {
    id: 'cell-level',
    name: 'Cell-Level Parameters',
    icon: '🔋',
    color: 'green',
    description: 'Individual electrochemical cell specifications and configurations',
    subcategories: []
  },
  {
    id: 'reactor-level',
    name: 'Reactor-Level Parameters',
    icon: '🏭',
    color: 'purple',
    description: 'Complete system and reactor-scale parameters',
    subcategories: []
  },
  {
    id: 'biological',
    name: 'Biological Parameters',
    icon: '🦠',
    color: 'orange',
    description: 'Microorganisms, biofilms, and biological processes',
    subcategories: []
  },
  {
    id: 'material',
    name: 'Material Parameters',
    icon: '🧱',
    color: 'red',
    description: 'Electrode, membrane, and structural material properties',
    subcategories: []
  },
  {
    id: 'operational',
    name: 'Operational Parameters',
    icon: '⚙️',
    color: 'indigo',
    description: 'Process control, maintenance, and operational settings',
    subcategories: []
  },
  {
    id: 'performance',
    name: 'Performance Parameters',
    icon: '📊',
    color: 'yellow',
    description: 'System output, efficiency, and performance metrics',
    subcategories: []
  },
  {
    id: 'economic',
    name: 'Economic Parameters',
    icon: '💰',
    color: 'emerald',
    description: 'Cost, economics, and financial metrics',
    subcategories: []
  },
  {
    id: 'safety',
    name: 'Safety Parameters',
    icon: '🛡️',
    color: 'rose',
    description: 'Safety limits, hazards, and protective measures',
    subcategories: []
  },
  {
    id: 'monitoring',
    name: 'Monitoring & Control',
    icon: '📡',
    color: 'cyan',
    description: 'Sensors, instrumentation, and control systems',
    subcategories: []
  },
  {
    id: 'application-specific',
    name: 'Application-Specific',
    icon: '🎯',
    color: 'teal',
    description: 'Parameters for specific MESS applications',
    subcategories: []
  },
  {
    id: 'emerging-tech',
    name: 'Emerging Technologies',
    icon: '🚀',
    color: 'violet',
    description: 'Novel materials and cutting-edge technologies',
    subcategories: []
  },
  {
    id: 'integration',
    name: 'Integration & Scaling',
    icon: '🔗',
    color: 'amber',
    description: 'System integration and scale-up parameters',
    subcategories: []
  },
  {
    id: 'modeling',
    name: 'Modeling & Simulation',
    icon: '🖥️',
    color: 'slate',
    description: 'Computational modeling and simulation parameters',
    subcategories: []
  },
  {
    id: 'experimental',
    name: 'Experimental Parameters',
    icon: '🧪',
    color: 'pink',
    description: 'Research, testing, and experimental design parameters',
    subcategories: []
  }
]

// Environmental Parameters - Temperature
const temperatureParameters: Parameter[] = [
  {
    id: 'env-temp-operating',
    name: 'Operating Temperature',
    description: 'Temperature at which the MESS operates',
    unit: '°C',
    range: { min: 4, max: 80, typical: 30 },
    category: 'environmental',
    subcategory: 'temperature',
    tags: ['temperature', 'operating conditions', 'critical'],
    relatedParameters: ['env-temp-ambient', 'perf-temp-coefficient']
  },
  {
    id: 'env-temp-ambient',
    name: 'Ambient Temperature',
    description: 'Environmental temperature surrounding the system',
    unit: '°C',
    range: { min: -50, max: 60, typical: 20 },
    category: 'environmental',
    subcategory: 'temperature',
    tags: ['temperature', 'ambient', 'environment']
  },
  {
    id: 'env-temp-water-bath',
    name: 'Water Bath Temperature',
    description: 'Temperature of water bath for temperature control',
    unit: '°C',
    range: { min: 4, max: 95, typical: 35 },
    category: 'environmental',
    subcategory: 'temperature',
    tags: ['temperature', 'control', 'water bath']
  },
  {
    id: 'env-temp-fluctuation',
    name: 'Temperature Fluctuation',
    description: 'Temporal temperature variation',
    unit: '°C',
    range: { min: 0, max: 20, typical: 2 },
    category: 'environmental',
    subcategory: 'temperature',
    tags: ['temperature', 'stability', 'variation']
  },
  {
    id: 'env-temp-diurnal-range',
    name: 'Diurnal Temperature Range',
    description: 'Day-night temperature difference',
    unit: '°C',
    range: { min: 0, max: 30, typical: 5 },
    category: 'environmental',
    subcategory: 'temperature',
    tags: ['temperature', 'daily cycle', 'variation']
  },
  {
    id: 'env-temp-ramp-rate',
    name: 'Temperature Ramp Rate',
    description: 'Rate of temperature change',
    unit: '°C/min',
    range: { min: 0.1, max: 10, typical: 0.5 },
    category: 'environmental',
    subcategory: 'temperature',
    tags: ['temperature', 'control', 'dynamics']
  }
]

// Environmental Parameters - Humidity
const humidityParameters: Parameter[] = [
  {
    id: 'env-humidity-relative',
    name: 'Relative Humidity',
    description: 'Moisture content in the air as percentage of saturation',
    unit: '%',
    range: { min: 0, max: 100, typical: 60 },
    category: 'environmental',
    subcategory: 'humidity',
    tags: ['humidity', 'moisture', 'air quality']
  },
  {
    id: 'env-humidity-absolute',
    name: 'Absolute Humidity',
    description: 'Water vapor content in air',
    unit: 'g/m³',
    range: { min: 0, max: 50, typical: 10 },
    category: 'environmental',
    subcategory: 'humidity',
    tags: ['humidity', 'moisture', 'absolute']
  },
  {
    id: 'env-humidity-dew-point',
    name: 'Dew Point',
    description: 'Dew point temperature',
    unit: '°C',
    range: { min: -50, max: 50, typical: 15 },
    category: 'environmental',
    subcategory: 'humidity',
    tags: ['humidity', 'condensation', 'dew point']
  },
  {
    id: 'env-humidity-vapor-pressure',
    name: 'Vapor Pressure',
    description: 'Water vapor partial pressure',
    unit: 'kPa',
    range: { min: 0, max: 10, typical: 2.34 },
    category: 'environmental',
    subcategory: 'humidity',
    tags: ['humidity', 'pressure', 'vapor']
  }
]

// Environmental Parameters - Pressure
const pressureParameters: Parameter[] = [
  {
    id: 'env-pressure-atmospheric',
    name: 'Atmospheric Pressure',
    description: 'Ambient atmospheric pressure',
    unit: 'kPa',
    range: { min: 50, max: 110, typical: 101.325 },
    category: 'environmental',
    subcategory: 'pressure',
    tags: ['pressure', 'atmospheric', 'ambient']
  },
  {
    id: 'env-pressure-gauge',
    name: 'Gauge Pressure',
    description: 'Pressure relative to atmospheric',
    unit: 'kPa',
    range: { min: -100, max: 1000, typical: 0 },
    category: 'environmental',
    subcategory: 'pressure',
    tags: ['pressure', 'gauge', 'relative']
  },
  {
    id: 'env-pressure-hydrostatic',
    name: 'Hydrostatic Pressure',
    description: 'Pressure from liquid column',
    unit: 'bar',
    range: { min: 0, max: 1000, typical: 1 },
    category: 'environmental',
    subcategory: 'pressure',
    tags: ['pressure', 'hydrostatic', 'liquid']
  },
  {
    id: 'env-pressure-o2-partial',
    name: 'Oxygen Partial Pressure',
    description: 'Oxygen partial pressure',
    unit: 'kPa',
    range: { min: 0, max: 100, typical: 21.2 },
    category: 'environmental',
    subcategory: 'pressure',
    tags: ['pressure', 'oxygen', 'partial']
  },
  {
    id: 'env-pressure-co2-partial',
    name: 'CO2 Partial Pressure',
    description: 'Carbon dioxide partial pressure',
    unit: 'kPa',
    range: { min: 0, max: 100, typical: 0.04 },
    category: 'environmental',
    subcategory: 'pressure',
    tags: ['pressure', 'CO2', 'partial']
  }
]

// Environmental Parameters - Gas Composition
const gasCompositionParameters: Parameter[] = [
  {
    id: 'env-gas-o2-concentration',
    name: 'Oxygen Concentration',
    description: 'O₂ concentration in gas phase',
    unit: '%',
    range: { min: 0, max: 100, typical: 20.95 },
    category: 'environmental',
    subcategory: 'gas-composition',
    tags: ['oxygen', 'gas', 'concentration']
  },
  {
    id: 'env-gas-co2-concentration',
    name: 'Carbon Dioxide Concentration',
    description: 'CO₂ concentration',
    unit: 'ppm',
    range: { min: 0, max: 50000, typical: 415 },
    category: 'environmental',
    subcategory: 'gas-composition',
    tags: ['CO2', 'gas', 'concentration']
  },
  {
    id: 'env-gas-n2-concentration',
    name: 'Nitrogen Concentration',
    description: 'N₂ concentration',
    unit: '%',
    range: { min: 0, max: 100, typical: 78.08 },
    category: 'environmental',
    subcategory: 'gas-composition',
    tags: ['nitrogen', 'gas', 'concentration']
  },
  {
    id: 'env-gas-h2s-trace',
    name: 'Hydrogen Sulfide Trace',
    description: 'Hydrogen sulfide concentration',
    unit: 'ppm',
    range: { min: 0, max: 1000, typical: 0 },
    category: 'environmental',
    subcategory: 'gas-composition',
    tags: ['H2S', 'trace gas', 'toxic']
  },
  {
    id: 'env-gas-nh3-trace',
    name: 'Ammonia Trace',
    description: 'Ammonia concentration',
    unit: 'ppm',
    range: { min: 0, max: 1000, typical: 0 },
    category: 'environmental',
    subcategory: 'gas-composition',
    tags: ['NH3', 'trace gas', 'ammonia']
  }
]

// Environmental Parameters - Light
const lightParameters: Parameter[] = [
  {
    id: 'env-light-intensity',
    name: 'Light Intensity',
    description: 'Illumination level for photosynthetic or light-sensitive systems',
    unit: 'lux',
    range: { min: 0, max: 100000, typical: 0 },
    category: 'environmental',
    subcategory: 'light',
    tags: ['light', 'illumination', 'photosynthesis']
  },
  {
    id: 'env-light-par',
    name: 'Photosynthetic Active Radiation',
    description: 'PAR for photosynthetic organisms',
    unit: 'μmol/m²/s',
    range: { min: 0, max: 2000, typical: 0 },
    category: 'environmental',
    subcategory: 'light',
    tags: ['PAR', 'photosynthesis', 'light']
  },
  {
    id: 'env-light-solar-irradiance',
    name: 'Total Solar Irradiance',
    description: 'Total solar radiation',
    unit: 'W/m²',
    range: { min: 0, max: 1400, typical: 0 },
    category: 'environmental',
    subcategory: 'light',
    tags: ['solar', 'irradiance', 'light']
  },
  {
    id: 'env-light-duration',
    name: 'Light Duration',
    description: 'Hours of light per day',
    unit: 'h',
    range: { min: 0, max: 24, typical: 0 },
    category: 'environmental',
    subcategory: 'light',
    tags: ['photoperiod', 'light', 'duration']
  },
  {
    id: 'env-light-uv-intensity',
    name: 'UV Light Intensity',
    description: 'UV-A (315-400 nm) intensity',
    unit: 'W/m²',
    range: { min: 0, max: 100, typical: 0 },
    category: 'environmental',
    subcategory: 'light',
    tags: ['UV', 'light', 'radiation']
  }
]

// Cell-Level Parameters - Geometry
const cellGeometryParameters: Parameter[] = [
  {
    id: 'cell-volume-total',
    name: 'Total Cell Volume',
    description: 'Total volume of the electrochemical cell',
    unit: 'mL',
    range: { min: 10, max: 5000, typical: 250 },
    category: 'cell-level',
    subcategory: 'geometry',
    tags: ['volume', 'cell', 'geometry']
  },
  {
    id: 'cell-volume-working',
    name: 'Working Volume',
    description: 'Active/working volume in the cell',
    unit: 'mL',
    range: { min: 5, max: 4500, typical: 200 },
    category: 'cell-level',
    subcategory: 'geometry',
    tags: ['volume', 'working', 'active']
  },
  {
    id: 'cell-diameter',
    name: 'Cell Diameter',
    description: 'Cell diameter (cylindrical cells)',
    unit: 'mm',
    range: { min: 10, max: 500, typical: 80 },
    category: 'cell-level',
    subcategory: 'geometry',
    tags: ['diameter', 'dimension', 'cylindrical']
  },
  {
    id: 'cell-height',
    name: 'Cell Height',
    description: 'Cell height dimension',
    unit: 'mm',
    range: { min: 10, max: 1000, typical: 100 },
    category: 'cell-level',
    subcategory: 'geometry',
    tags: ['height', 'dimension', 'vertical']
  },
  {
    id: 'cell-electrode-spacing',
    name: 'Electrode Spacing',
    description: 'Distance between anode and cathode',
    unit: 'mm',
    range: { min: 1, max: 100, typical: 20 },
    category: 'cell-level',
    subcategory: 'geometry',
    tags: ['spacing', 'electrode', 'separation']
  }
]

// Cell-Level Parameters - Electrode Configuration
const cellElectrodeParameters: Parameter[] = [
  {
    id: 'cell-anode-area',
    name: 'Anode Surface Area',
    description: 'Anode surface area in cell',
    unit: 'cm²',
    range: { min: 0.1, max: 100, typical: 10 },
    category: 'cell-level',
    subcategory: 'electrode',
    tags: ['anode', 'area', 'electrode']
  },
  {
    id: 'cell-cathode-area',
    name: 'Cathode Surface Area',
    description: 'Cathode surface area in cell',
    unit: 'cm²',
    range: { min: 0.1, max: 100, typical: 10 },
    category: 'cell-level',
    subcategory: 'electrode',
    tags: ['cathode', 'area', 'electrode']
  },
  {
    id: 'cell-electrode-thickness',
    name: 'Electrode Thickness',
    description: 'Electrode material thickness',
    unit: 'mm',
    range: { min: 0.1, max: 10, typical: 2 },
    category: 'cell-level',
    subcategory: 'electrode',
    tags: ['thickness', 'electrode', 'dimension']
  },
  {
    id: 'cell-contact-resistance',
    name: 'Contact Resistance',
    description: 'Electrical contact resistance',
    unit: 'mΩ',
    range: { min: 0.1, max: 100, typical: 5 },
    category: 'cell-level',
    subcategory: 'electrode',
    tags: ['resistance', 'contact', 'electrical']
  }
]

// Cell-Level Parameters - Performance
const cellPerformanceParameters: Parameter[] = [
  {
    id: 'cell-ocv',
    name: 'Open Circuit Voltage',
    description: 'Cell OCV with no load',
    unit: 'V',
    range: { min: 0, max: 2, typical: 0.8 },
    category: 'cell-level',
    subcategory: 'performance',
    tags: ['voltage', 'OCV', 'electrical']
  },
  {
    id: 'cell-operating-voltage',
    name: 'Operating Voltage',
    description: 'Cell voltage under load',
    unit: 'V',
    range: { min: 0, max: 1.5, typical: 0.5 },
    category: 'cell-level',
    subcategory: 'performance',
    tags: ['voltage', 'operating', 'electrical']
  },
  {
    id: 'cell-current-density',
    name: 'Current Density',
    description: 'Current per electrode area',
    unit: 'A/m²',
    range: { min: 0, max: 100, typical: 10 },
    category: 'cell-level',
    subcategory: 'performance',
    tags: ['current', 'density', 'electrical']
  },
  {
    id: 'cell-power-density',
    name: 'Power Density',
    description: 'Power per cell volume',
    unit: 'W/m³',
    range: { min: 0, max: 1000, typical: 50 },
    category: 'cell-level',
    subcategory: 'performance',
    tags: ['power', 'density', 'performance']
  },
  {
    id: 'cell-internal-resistance',
    name: 'Internal Resistance',
    description: 'Cell internal resistance',
    unit: 'Ω',
    range: { min: 0.1, max: 1000, typical: 50 },
    category: 'cell-level',
    subcategory: 'performance',
    tags: ['resistance', 'internal', 'electrical']
  }
]

// Biological Parameters - Microorganisms
const microorganismParameters: Parameter[] = [
  {
    id: 'bio-cell-density',
    name: 'Cell Density',
    description: 'Microbial cell concentration',
    unit: 'cells/mL',
    range: { min: 1e6, max: 1e12, typical: 1e9 },
    category: 'biological',
    subcategory: 'microorganisms',
    tags: ['cells', 'density', 'concentration']
  },
  {
    id: 'bio-growth-rate',
    name: 'Growth Rate',
    description: 'Microbial growth rate',
    unit: '1/h',
    range: { min: 0.01, max: 2, typical: 0.2 },
    category: 'biological',
    subcategory: 'microorganisms',
    tags: ['growth', 'rate', 'kinetics']
  },
  {
    id: 'bio-doubling-time',
    name: 'Doubling Time',
    description: 'Cell population doubling time',
    unit: 'h',
    range: { min: 0.5, max: 100, typical: 3.5 },
    category: 'biological',
    subcategory: 'microorganisms',
    tags: ['doubling', 'growth', 'time']
  },
  {
    id: 'bio-viability',
    name: 'Cell Viability',
    description: 'Percentage of viable cells',
    unit: '%',
    range: { min: 0, max: 100, typical: 95 },
    category: 'biological',
    subcategory: 'microorganisms',
    tags: ['viability', 'health', 'cells']
  }
]

// Material Parameters - Anode Materials
const anodeMaterialParameters: Parameter[] = [
  {
    id: 'mat-anode-conductivity',
    name: 'Anode Electrical Conductivity',
    description: 'Electrical conductivity of anode material',
    unit: 'S/m',
    range: { min: 100, max: 1e7, typical: 1e4 },
    category: 'material',
    subcategory: 'anode',
    tags: ['conductivity', 'anode', 'electrical']
  },
  {
    id: 'mat-anode-porosity',
    name: 'Anode Porosity',
    description: 'Porosity of anode material',
    unit: '%',
    range: { min: 0, max: 99, typical: 75 },
    category: 'material',
    subcategory: 'anode',
    tags: ['porosity', 'anode', 'structure']
  },
  {
    id: 'mat-anode-surface-area',
    name: 'Anode Specific Surface Area',
    description: 'Specific surface area of anode',
    unit: 'm²/g',
    range: { min: 0.1, max: 3000, typical: 100 },
    category: 'material',
    subcategory: 'anode',
    tags: ['surface area', 'anode', 'specific']
  },
  {
    id: 'mat-anode-cost',
    name: 'Anode Material Cost',
    description: 'Cost per unit area of anode',
    unit: '$/m²',
    range: { min: 1, max: 10000, typical: 100 },
    category: 'material',
    subcategory: 'anode',
    tags: ['cost', 'anode', 'economic']
  }
]

// Operational Parameters - Process Control
const processControlParameters: Parameter[] = [
  {
    id: 'op-ph-setpoint',
    name: 'pH Setpoint',
    description: 'Target pH for operation',
    unit: '-',
    range: { min: 4, max: 10, typical: 7 },
    category: 'operational',
    subcategory: 'process-control',
    tags: ['pH', 'control', 'setpoint']
  },
  {
    id: 'op-temperature-setpoint',
    name: 'Temperature Setpoint',
    description: 'Target operating temperature',
    unit: '°C',
    range: { min: 15, max: 45, typical: 30 },
    category: 'operational',
    subcategory: 'process-control',
    tags: ['temperature', 'control', 'setpoint']
  },
  {
    id: 'op-flow-rate',
    name: 'Flow Rate',
    description: 'Liquid flow rate through system',
    unit: 'mL/min',
    range: { min: 0, max: 1000, typical: 10 },
    category: 'operational',
    subcategory: 'process-control',
    tags: ['flow', 'rate', 'hydraulic']
  },
  {
    id: 'op-hrt',
    name: 'Hydraulic Retention Time',
    description: 'Average residence time of liquid',
    unit: 'h',
    range: { min: 0.1, max: 240, typical: 24 },
    category: 'operational',
    subcategory: 'process-control',
    tags: ['HRT', 'retention', 'time']
  }
]

// Performance Parameters - System Output
const systemOutputParameters: Parameter[] = [
  {
    id: 'perf-power-output',
    name: 'Power Output',
    description: 'Total system power output',
    unit: 'mW',
    range: { min: 0, max: 10000, typical: 100 },
    category: 'performance',
    subcategory: 'output',
    tags: ['power', 'output', 'performance']
  },
  {
    id: 'perf-power-density-volume',
    name: 'Volumetric Power Density',
    description: 'Power per unit volume',
    unit: 'W/m³',
    range: { min: 0, max: 1000, typical: 50 },
    category: 'performance',
    subcategory: 'output',
    tags: ['power density', 'volumetric', 'performance']
  },
  {
    id: 'perf-power-density-area',
    name: 'Areal Power Density',
    description: 'Power per unit electrode area',
    unit: 'mW/m²',
    range: { min: 0, max: 10000, typical: 500 },
    category: 'performance',
    subcategory: 'output',
    tags: ['power density', 'areal', 'performance']
  },
  {
    id: 'perf-coulombic-efficiency',
    name: 'Coulombic Efficiency',
    description: 'Electron recovery efficiency',
    unit: '%',
    range: { min: 0, max: 100, typical: 60 },
    category: 'performance',
    subcategory: 'efficiency',
    tags: ['efficiency', 'coulombic', 'electrons']
  },
  {
    id: 'perf-energy-efficiency',
    name: 'Energy Efficiency',
    description: 'Overall energy conversion efficiency',
    unit: '%',
    range: { min: 0, max: 100, typical: 40 },
    category: 'performance',
    subcategory: 'efficiency',
    tags: ['efficiency', 'energy', 'conversion']
  }
]

// Material Parameters - Cathode Materials
const cathodeMaterialParameters: Parameter[] = [
  {
    id: 'mat-cathode-conductivity',
    name: 'Cathode Electrical Conductivity',
    description: 'Electrical conductivity of cathode material',
    unit: 'S/m',
    range: { min: 100, max: 1e7, typical: 1e4 },
    category: 'material',
    subcategory: 'cathode',
    tags: ['conductivity', 'cathode', 'electrical']
  },
  {
    id: 'mat-cathode-porosity',
    name: 'Cathode Porosity',
    description: 'Porosity of cathode material',
    unit: '%',
    range: { min: 0, max: 99, typical: 70 },
    category: 'material',
    subcategory: 'cathode',
    tags: ['porosity', 'cathode', 'structure']
  },
  {
    id: 'mat-cathode-surface-area',
    name: 'Cathode Specific Surface Area',
    description: 'Specific surface area of cathode',
    unit: 'm²/g',
    range: { min: 0.1, max: 3000, typical: 50 },
    category: 'material',
    subcategory: 'cathode',
    tags: ['surface area', 'cathode', 'specific']
  },
  {
    id: 'mat-cathode-cost',
    name: 'Cathode Material Cost',
    description: 'Cost per unit area of cathode',
    unit: '$/m²',
    range: { min: 1, max: 10000, typical: 200 },
    category: 'material',
    subcategory: 'cathode',
    tags: ['cost', 'cathode', 'economic']
  }
]

// Material Parameters - Membrane Materials
const membraneMaterialParameters: Parameter[] = [
  {
    id: 'mat-membrane-type',
    name: 'Membrane Type',
    description: 'Type of ion exchange membrane',
    unit: '-',
    category: 'material',
    subcategory: 'membrane',
    tags: ['membrane', 'ion exchange', 'separator'],
    notes: 'Options: PEM, AEM, CEM, bipolar, porous separator'
  },
  {
    id: 'mat-membrane-thickness',
    name: 'Membrane Thickness',
    description: 'Thickness of membrane or separator',
    unit: 'μm',
    range: { min: 10, max: 500, typical: 180 },
    category: 'material',
    subcategory: 'membrane',
    tags: ['thickness', 'membrane', 'dimension']
  },
  {
    id: 'mat-membrane-conductivity',
    name: 'Membrane Ionic Conductivity',
    description: 'Ionic conductivity of membrane',
    unit: 'mS/cm',
    range: { min: 0.1, max: 200, typical: 10 },
    category: 'material',
    subcategory: 'membrane',
    tags: ['conductivity', 'membrane', 'ionic']
  },
  {
    id: 'mat-membrane-selectivity',
    name: 'Membrane Selectivity',
    description: 'Ion selectivity coefficient',
    unit: '-',
    range: { min: 0, max: 1, typical: 0.95 },
    category: 'material',
    subcategory: 'membrane',
    tags: ['selectivity', 'membrane', 'transport']
  }
]

// Biological Parameters - Biofilm
const biofilmParameters: Parameter[] = [
  {
    id: 'bio-biofilm-thickness',
    name: 'Biofilm Thickness',
    description: 'Thickness of electroactive biofilm',
    unit: 'μm',
    range: { min: 1, max: 1000, typical: 100 },
    category: 'biological',
    subcategory: 'biofilm',
    tags: ['biofilm', 'thickness', 'microbial']
  },
  {
    id: 'bio-biofilm-coverage',
    name: 'Biofilm Coverage',
    description: 'Percentage of electrode covered by biofilm',
    unit: '%',
    range: { min: 0, max: 100, typical: 80 },
    category: 'biological',
    subcategory: 'biofilm',
    tags: ['biofilm', 'coverage', 'surface']
  },
  {
    id: 'bio-biofilm-density',
    name: 'Biofilm Density',
    description: 'Dry weight of biofilm per area',
    unit: 'g/m²',
    range: { min: 0.1, max: 100, typical: 10 },
    category: 'biological',
    subcategory: 'biofilm',
    tags: ['biofilm', 'density', 'biomass']
  },
  {
    id: 'bio-biofilm-conductivity',
    name: 'Biofilm Conductivity',
    description: 'Electrical conductivity of biofilm',
    unit: 'mS/cm',
    range: { min: 0.001, max: 10, typical: 0.1 },
    category: 'biological',
    subcategory: 'biofilm',
    tags: ['biofilm', 'conductivity', 'electrical']
  }
]

// Biological Parameters - Substrate
const substrateParameters: Parameter[] = [
  {
    id: 'bio-substrate-concentration',
    name: 'Substrate Concentration',
    description: 'Concentration of primary substrate',
    unit: 'g/L',
    range: { min: 0.1, max: 50, typical: 2 },
    category: 'biological',
    subcategory: 'substrate',
    tags: ['substrate', 'concentration', 'feed']
  },
  {
    id: 'bio-substrate-cod',
    name: 'Chemical Oxygen Demand',
    description: 'COD of substrate solution',
    unit: 'mg/L',
    range: { min: 100, max: 50000, typical: 2000 },
    category: 'biological',
    subcategory: 'substrate',
    tags: ['COD', 'substrate', 'organic']
  },
  {
    id: 'bio-substrate-bod',
    name: 'Biological Oxygen Demand',
    description: 'BOD of substrate solution',
    unit: 'mg/L',
    range: { min: 50, max: 30000, typical: 1000 },
    category: 'biological',
    subcategory: 'substrate',
    tags: ['BOD', 'substrate', 'biodegradable']
  },
  {
    id: 'bio-substrate-type',
    name: 'Substrate Type',
    description: 'Type of organic substrate',
    unit: '-',
    category: 'biological',
    subcategory: 'substrate',
    tags: ['substrate', 'type', 'organic'],
    notes: 'Common: acetate, glucose, wastewater, cellulose'
  }
]

// Reactor-Level Parameters - System Configuration
const reactorSystemParameters: Parameter[] = [
  {
    id: 'reactor-type',
    name: 'Reactor Type',
    description: 'Overall reactor configuration',
    unit: '-',
    category: 'reactor-level',
    subcategory: 'system',
    tags: ['reactor', 'configuration', 'design'],
    notes: 'Single-cell, stack, continuous flow, plug flow'
  },
  {
    id: 'reactor-total-volume',
    name: 'Total Reactor Volume',
    description: 'Complete system volume including all cells',
    unit: 'L',
    range: { min: 0.1, max: 10000, typical: 10 },
    category: 'reactor-level',
    subcategory: 'system',
    tags: ['volume', 'reactor', 'total']
  },
  {
    id: 'reactor-cell-count',
    name: 'Number of Cells',
    description: 'Total number of cells in reactor',
    unit: '-',
    range: { min: 1, max: 1000, typical: 10 },
    category: 'reactor-level',
    subcategory: 'system',
    tags: ['cells', 'count', 'stack']
  },
  {
    id: 'reactor-connection-type',
    name: 'Cell Connection Type',
    description: 'How cells are electrically connected',
    unit: '-',
    category: 'reactor-level',
    subcategory: 'system',
    tags: ['connection', 'electrical', 'configuration'],
    notes: 'Series, parallel, or series-parallel combinations'
  }
]

// Reactor-Level Parameters - Stack Configuration
const reactorStackParameters: Parameter[] = [
  {
    id: 'stack-voltage',
    name: 'Stack Voltage',
    description: 'Total voltage across stack',
    unit: 'V',
    range: { min: 0, max: 100, typical: 5 },
    category: 'reactor-level',
    subcategory: 'stack',
    tags: ['voltage', 'stack', 'electrical']
  },
  {
    id: 'stack-current',
    name: 'Stack Current',
    description: 'Total current from stack',
    unit: 'A',
    range: { min: 0, max: 100, typical: 1 },
    category: 'reactor-level',
    subcategory: 'stack',
    tags: ['current', 'stack', 'electrical']
  },
  {
    id: 'stack-power',
    name: 'Stack Power Output',
    description: 'Total power from stack',
    unit: 'W',
    range: { min: 0, max: 1000, typical: 5 },
    category: 'reactor-level',
    subcategory: 'stack',
    tags: ['power', 'stack', 'output']
  },
  {
    id: 'stack-efficiency',
    name: 'Stack Efficiency',
    description: 'Overall stack efficiency',
    unit: '%',
    range: { min: 0, max: 100, typical: 70 },
    category: 'reactor-level',
    subcategory: 'stack',
    tags: ['efficiency', 'stack', 'performance']
  }
]

// Economic Parameters - Capital Costs
const economicCapitalParameters: Parameter[] = [
  {
    id: 'econ-capex-total',
    name: 'Total Capital Cost',
    description: 'Total capital expenditure',
    unit: '$',
    range: { min: 100, max: 1e9, typical: 10000 },
    category: 'economic',
    subcategory: 'capital',
    tags: ['CAPEX', 'cost', 'investment']
  },
  {
    id: 'econ-capex-per-power',
    name: 'Capital Cost per Watt',
    description: 'CAPEX normalized by power output',
    unit: '$/W',
    range: { min: 10, max: 10000, typical: 1000 },
    category: 'economic',
    subcategory: 'capital',
    tags: ['CAPEX', 'normalized', 'power']
  },
  {
    id: 'econ-electrode-cost',
    name: 'Electrode Cost',
    description: 'Cost of electrode materials',
    unit: '$',
    range: { min: 10, max: 100000, typical: 1000 },
    category: 'economic',
    subcategory: 'capital',
    tags: ['electrode', 'cost', 'materials']
  },
  {
    id: 'econ-installation-cost',
    name: 'Installation Cost',
    description: 'Cost of system installation',
    unit: '$',
    range: { min: 100, max: 1e6, typical: 5000 },
    category: 'economic',
    subcategory: 'capital',
    tags: ['installation', 'cost', 'setup']
  }
]

// Economic Parameters - Operating Costs
const economicOperatingParameters: Parameter[] = [
  {
    id: 'econ-opex-annual',
    name: 'Annual Operating Cost',
    description: 'Yearly operational expenditure',
    unit: '$/year',
    range: { min: 10, max: 1e6, typical: 1000 },
    category: 'economic',
    subcategory: 'operating',
    tags: ['OPEX', 'annual', 'cost']
  },
  {
    id: 'econ-maintenance-cost',
    name: 'Maintenance Cost',
    description: 'Annual maintenance expenditure',
    unit: '$/year',
    range: { min: 10, max: 1e5, typical: 500 },
    category: 'economic',
    subcategory: 'operating',
    tags: ['maintenance', 'cost', 'annual']
  },
  {
    id: 'econ-substrate-cost',
    name: 'Substrate Cost',
    description: 'Cost of substrate per year',
    unit: '$/year',
    range: { min: 0, max: 1e5, typical: 200 },
    category: 'economic',
    subcategory: 'operating',
    tags: ['substrate', 'cost', 'feedstock']
  },
  {
    id: 'econ-labor-cost',
    name: 'Labor Cost',
    description: 'Annual labor costs',
    unit: '$/year',
    range: { min: 0, max: 1e6, typical: 20000 },
    category: 'economic',
    subcategory: 'operating',
    tags: ['labor', 'cost', 'personnel']
  }
]

// Safety Parameters - Operating Limits
const safetyLimitsParameters: Parameter[] = [
  {
    id: 'safety-temp-max',
    name: 'Maximum Temperature',
    description: 'Maximum safe operating temperature',
    unit: '°C',
    range: { min: 20, max: 100, typical: 60 },
    category: 'safety',
    subcategory: 'limits',
    tags: ['temperature', 'maximum', 'safety']
  },
  {
    id: 'safety-pressure-max',
    name: 'Maximum Pressure',
    description: 'Maximum safe operating pressure',
    unit: 'bar',
    range: { min: 1, max: 10, typical: 3 },
    category: 'safety',
    subcategory: 'limits',
    tags: ['pressure', 'maximum', 'safety']
  },
  {
    id: 'safety-voltage-max',
    name: 'Maximum Voltage',
    description: 'Maximum safe voltage',
    unit: 'V',
    range: { min: 1, max: 1000, typical: 50 },
    category: 'safety',
    subcategory: 'limits',
    tags: ['voltage', 'maximum', 'electrical']
  },
  {
    id: 'safety-current-max',
    name: 'Maximum Current',
    description: 'Maximum safe current',
    unit: 'A',
    range: { min: 0.1, max: 100, typical: 10 },
    category: 'safety',
    subcategory: 'limits',
    tags: ['current', 'maximum', 'electrical']
  }
]

// Safety Parameters - Hazards
const safetyHazardsParameters: Parameter[] = [
  {
    id: 'safety-h2-concentration',
    name: 'Hydrogen Concentration',
    description: 'H2 concentration in headspace',
    unit: '%',
    range: { min: 0, max: 100, typical: 0 },
    category: 'safety',
    subcategory: 'hazards',
    tags: ['hydrogen', 'gas', 'explosive']
  },
  {
    id: 'safety-o2-depletion',
    name: 'Oxygen Depletion Level',
    description: 'O2 level below ambient',
    unit: '%',
    range: { min: 0, max: 21, typical: 2 },
    category: 'safety',
    subcategory: 'hazards',
    tags: ['oxygen', 'depletion', 'safety']
  },
  {
    id: 'safety-toxic-gas',
    name: 'Toxic Gas Detection',
    description: 'Presence of toxic gases',
    unit: 'ppm',
    range: { min: 0, max: 1000, typical: 0 },
    category: 'safety',
    subcategory: 'hazards',
    tags: ['toxic', 'gas', 'detection']
  },
  {
    id: 'safety-ph-extreme',
    name: 'Extreme pH Alert',
    description: 'pH outside safe range',
    unit: '-',
    range: { min: 0, max: 14, typical: 7 },
    category: 'safety',
    subcategory: 'hazards',
    tags: ['pH', 'extreme', 'chemical']
  }
]

// Monitoring Parameters - Sensors
const monitoringSensorParameters: Parameter[] = [
  {
    id: 'monitor-ph-sensor',
    name: 'pH Sensor Type',
    description: 'Type of pH measurement sensor',
    unit: '-',
    category: 'monitoring',
    subcategory: 'sensors',
    tags: ['pH', 'sensor', 'measurement'],
    notes: 'Glass electrode, ISFET, optical'
  },
  {
    id: 'monitor-temperature-sensor',
    name: 'Temperature Sensor Type',
    description: 'Type of temperature sensor',
    unit: '-',
    category: 'monitoring',
    subcategory: 'sensors',
    tags: ['temperature', 'sensor', 'RTD'],
    notes: 'PT100, PT1000, thermocouple, thermistor'
  },
  {
    id: 'monitor-do-sensor',
    name: 'Dissolved Oxygen Sensor',
    description: 'DO measurement method',
    unit: '-',
    category: 'monitoring',
    subcategory: 'sensors',
    tags: ['oxygen', 'sensor', 'dissolved'],
    notes: 'Optical, galvanic, polarographic'
  },
  {
    id: 'monitor-conductivity-sensor',
    name: 'Conductivity Sensor',
    description: 'Electrical conductivity measurement',
    unit: '-',
    category: 'monitoring',
    subcategory: 'sensors',
    tags: ['conductivity', 'sensor', 'ionic']
  }
]

// Monitoring Parameters - Data Acquisition
const monitoringDataParameters: Parameter[] = [
  {
    id: 'monitor-sampling-rate',
    name: 'Data Sampling Rate',
    description: 'Frequency of data collection',
    unit: 'Hz',
    range: { min: 0.001, max: 1000, typical: 1 },
    category: 'monitoring',
    subcategory: 'data-acquisition',
    tags: ['sampling', 'rate', 'DAQ']
  },
  {
    id: 'monitor-data-storage',
    name: 'Data Storage Capacity',
    description: 'Local data storage capacity',
    unit: 'GB',
    range: { min: 1, max: 1000, typical: 100 },
    category: 'monitoring',
    subcategory: 'data-acquisition',
    tags: ['storage', 'data', 'capacity']
  },
  {
    id: 'monitor-logging-interval',
    name: 'Logging Interval',
    description: 'Time between data logs',
    unit: 's',
    range: { min: 1, max: 3600, typical: 60 },
    category: 'monitoring',
    subcategory: 'data-acquisition',
    tags: ['logging', 'interval', 'recording']
  },
  {
    id: 'monitor-alarm-threshold',
    name: 'Alarm Threshold Count',
    description: 'Number of configured alarms',
    unit: '-',
    range: { min: 0, max: 100, typical: 10 },
    category: 'monitoring',
    subcategory: 'data-acquisition',
    tags: ['alarm', 'threshold', 'alert']
  }
]

// Application-Specific Parameters - Wastewater Treatment
const applicationWastewaterParameters: Parameter[] = [
  {
    id: 'app-ww-cod-removal',
    name: 'COD Removal Efficiency',
    description: 'Chemical oxygen demand removal',
    unit: '%',
    range: { min: 0, max: 100, typical: 85 },
    category: 'application-specific',
    subcategory: 'wastewater',
    tags: ['COD', 'removal', 'efficiency']
  },
  {
    id: 'app-ww-bod-removal',
    name: 'BOD Removal Efficiency',
    description: 'Biological oxygen demand removal',
    unit: '%',
    range: { min: 0, max: 100, typical: 90 },
    category: 'application-specific',
    subcategory: 'wastewater',
    tags: ['BOD', 'removal', 'efficiency']
  },
  {
    id: 'app-ww-nitrogen-removal',
    name: 'Total Nitrogen Removal',
    description: 'TN removal efficiency',
    unit: '%',
    range: { min: 0, max: 100, typical: 70 },
    category: 'application-specific',
    subcategory: 'wastewater',
    tags: ['nitrogen', 'removal', 'TN']
  },
  {
    id: 'app-ww-phosphorus-removal',
    name: 'Total Phosphorus Removal',
    description: 'TP removal efficiency',
    unit: '%',
    range: { min: 0, max: 100, typical: 60 },
    category: 'application-specific',
    subcategory: 'wastewater',
    tags: ['phosphorus', 'removal', 'TP']
  }
]

// Environmental Parameters - Vibration & Mechanical
const vibrationParameters: Parameter[] = [
  {
    id: 'env-vibration-frequency',
    name: 'Vibration Frequency',
    description: 'Vibration frequency applied to system',
    unit: 'Hz',
    range: { min: 0, max: 1000, typical: 0 },
    category: 'environmental',
    subcategory: 'vibration',
    tags: ['vibration', 'frequency', 'mechanical']
  },
  {
    id: 'env-vibration-amplitude',
    name: 'Vibration Amplitude',
    description: 'Vibration amplitude',
    unit: 'mm',
    range: { min: 0, max: 10, typical: 0 },
    category: 'environmental',
    subcategory: 'vibration',
    tags: ['vibration', 'amplitude', 'displacement']
  },
  {
    id: 'env-vibration-acceleration',
    name: 'Vibration Acceleration',
    description: 'Vibration acceleration in g-force',
    unit: 'g',
    range: { min: 0, max: 10, typical: 0 },
    category: 'environmental',
    subcategory: 'vibration',
    tags: ['vibration', 'acceleration', 'g-force']
  },
  {
    id: 'env-mechanical-shock',
    name: 'Mechanical Shock',
    description: 'Mechanical shock magnitude',
    unit: 'g',
    range: { min: 0, max: 100, typical: 0 },
    category: 'environmental',
    subcategory: 'vibration',
    tags: ['shock', 'mechanical', 'impact']
  },
  {
    id: 'env-shear-stress',
    name: 'Shear Stress',
    description: 'Fluid shear stress on biofilm',
    unit: 'Pa',
    range: { min: 0, max: 1000, typical: 0 },
    category: 'environmental',
    subcategory: 'vibration',
    tags: ['shear', 'stress', 'fluid']
  }
]

// Environmental Parameters - Sound & Ultrasound
const soundParameters: Parameter[] = [
  {
    id: 'env-sound-frequency',
    name: 'Sound Frequency',
    description: 'Audible sound frequency',
    unit: 'Hz',
    range: { min: 20, max: 20000, typical: 0 },
    category: 'environmental',
    subcategory: 'sound',
    tags: ['sound', 'frequency', 'audio']
  },
  {
    id: 'env-sound-intensity',
    name: 'Sound Intensity',
    description: 'Sound pressure level',
    unit: 'dB',
    range: { min: 0, max: 140, typical: 30 },
    category: 'environmental',
    subcategory: 'sound',
    tags: ['sound', 'intensity', 'decibel']
  },
  {
    id: 'env-ultrasound-frequency',
    name: 'Ultrasound Frequency',
    description: 'Ultrasonic frequency',
    unit: 'kHz',
    range: { min: 20, max: 1000, typical: 0 },
    category: 'environmental',
    subcategory: 'sound',
    tags: ['ultrasound', 'frequency', 'ultrasonic']
  },
  {
    id: 'env-ultrasound-power',
    name: 'Ultrasound Power',
    description: 'Ultrasonic power density',
    unit: 'W/cm²',
    range: { min: 0, max: 10, typical: 0 },
    category: 'environmental',
    subcategory: 'sound',
    tags: ['ultrasound', 'power', 'intensity']
  },
  {
    id: 'env-ultrasound-duration',
    name: 'Ultrasound Duration',
    description: 'Ultrasound exposure time',
    unit: 'min',
    range: { min: 0, max: 60, typical: 0 },
    category: 'environmental',
    subcategory: 'sound',
    tags: ['ultrasound', 'duration', 'exposure']
  }
]

// Environmental Parameters - Electromagnetic Fields
const electromagneticParameters: Parameter[] = [
  {
    id: 'env-magnetic-field-strength',
    name: 'Magnetic Field Strength',
    description: 'Magnetic field strength',
    unit: 'mT',
    range: { min: 0, max: 1000, typical: 0.05 },
    category: 'environmental',
    subcategory: 'electromagnetic',
    tags: ['magnetic', 'field', 'strength']
  },
  {
    id: 'env-magnetic-field-frequency',
    name: 'Magnetic Field Frequency',
    description: 'AC magnetic field frequency',
    unit: 'Hz',
    range: { min: 0, max: 1000, typical: 0 },
    category: 'environmental',
    subcategory: 'electromagnetic',
    tags: ['magnetic', 'frequency', 'AC']
  },
  {
    id: 'env-electric-field-strength',
    name: 'Electric Field Strength',
    description: 'Electric field strength',
    unit: 'V/m',
    range: { min: 0, max: 10000, typical: 0 },
    category: 'environmental',
    subcategory: 'electromagnetic',
    tags: ['electric', 'field', 'strength']
  },
  {
    id: 'env-em-frequency',
    name: 'Electromagnetic Frequency',
    description: 'EM radiation frequency',
    unit: 'MHz',
    range: { min: 0, max: 3000, typical: 0 },
    category: 'environmental',
    subcategory: 'electromagnetic',
    tags: ['electromagnetic', 'frequency', 'radiation']
  },
  {
    id: 'env-em-power',
    name: 'Electromagnetic Power',
    description: 'EM power density',
    unit: 'W/m²',
    range: { min: 0, max: 1000, typical: 0 },
    category: 'environmental',
    subcategory: 'electromagnetic',
    tags: ['electromagnetic', 'power', 'density']
  }
]

// Biological Parameters - Microbial Kinetics
const microbialKineticsParameters: Parameter[] = [
  {
    id: 'bio-max-growth-rate',
    name: 'Maximum Growth Rate',
    description: 'Maximum specific growth rate (μmax)',
    unit: '1/h',
    range: { min: 0.01, max: 2, typical: 0.2 },
    category: 'biological',
    subcategory: 'kinetics',
    tags: ['growth', 'rate', 'μmax']
  },
  {
    id: 'bio-half-saturation',
    name: 'Half Saturation Constant',
    description: 'Ks for substrate utilization',
    unit: 'g/L',
    range: { min: 0.001, max: 10, typical: 0.1 },
    category: 'biological',
    subcategory: 'kinetics',
    tags: ['Ks', 'saturation', 'Monod']
  },
  {
    id: 'bio-yield-coefficient',
    name: 'Yield Coefficient',
    description: 'Biomass yield from substrate',
    unit: 'g/g',
    range: { min: 0.1, max: 0.8, typical: 0.4 },
    category: 'biological',
    subcategory: 'kinetics',
    tags: ['yield', 'biomass', 'Y']
  },
  {
    id: 'bio-decay-rate',
    name: 'Decay Rate',
    description: 'Endogenous decay rate',
    unit: '1/h',
    range: { min: 0.001, max: 0.1, typical: 0.01 },
    category: 'biological',
    subcategory: 'kinetics',
    tags: ['decay', 'death', 'kd']
  },
  {
    id: 'bio-maintenance-coefficient',
    name: 'Maintenance Coefficient',
    description: 'Maintenance energy requirement',
    unit: '1/h',
    range: { min: 0.001, max: 0.1, typical: 0.02 },
    category: 'biological',
    subcategory: 'kinetics',
    tags: ['maintenance', 'energy', 'm']
  }
]

// Material Parameters - Advanced Carbon Materials
const advancedCarbonParameters: Parameter[] = [
  {
    id: 'mat-graphene-oxide-reduction',
    name: 'Graphene Oxide Reduction Degree',
    description: 'Degree of GO reduction to rGO',
    unit: '%',
    range: { min: 0, max: 100, typical: 80 },
    category: 'material',
    subcategory: 'advanced-carbon',
    tags: ['graphene', 'reduction', 'rGO']
  },
  {
    id: 'mat-graphene-sheet-size',
    name: 'Graphene Sheet Size',
    description: 'Lateral size of graphene sheets',
    unit: 'μm',
    range: { min: 0.1, max: 100, typical: 10 },
    category: 'material',
    subcategory: 'advanced-carbon',
    tags: ['graphene', 'size', 'dimension']
  },
  {
    id: 'mat-cnt-diameter',
    name: 'Carbon Nanotube Diameter',
    description: 'Diameter of carbon nanotubes',
    unit: 'nm',
    range: { min: 1, max: 100, typical: 20 },
    category: 'material',
    subcategory: 'advanced-carbon',
    tags: ['CNT', 'diameter', 'nanotube']
  },
  {
    id: 'mat-cnt-length',
    name: 'Carbon Nanotube Length',
    description: 'Length of carbon nanotubes',
    unit: 'μm',
    range: { min: 0.1, max: 1000, typical: 100 },
    category: 'material',
    subcategory: 'advanced-carbon',
    tags: ['CNT', 'length', 'nanotube']
  },
  {
    id: 'mat-carbon-activation',
    name: 'Carbon Activation Level',
    description: 'Degree of activation for activated carbon',
    unit: 'm²/g',
    range: { min: 500, max: 3000, typical: 1000 },
    category: 'material',
    subcategory: 'advanced-carbon',
    tags: ['activated carbon', 'BET', 'surface area']
  }
]

// Material Parameters - MXene Materials
const mxeneParameters: Parameter[] = [
  {
    id: 'mat-mxene-conductivity',
    name: 'MXene Electrical Conductivity',
    description: 'Electrical conductivity of MXene',
    unit: 'S/m',
    range: { min: 1000, max: 20000, typical: 10000 },
    category: 'material',
    subcategory: 'mxene',
    tags: ['MXene', 'conductivity', 'electrical']
  },
  {
    id: 'mat-mxene-hydrophilicity',
    name: 'MXene Hydrophilicity',
    description: 'Water contact angle of MXene',
    unit: '°',
    range: { min: 0, max: 90, typical: 30 },
    category: 'material',
    subcategory: 'mxene',
    tags: ['MXene', 'hydrophilic', 'contact angle']
  },
  {
    id: 'mat-mxene-interlayer-spacing',
    name: 'MXene Interlayer Spacing',
    description: 'Distance between MXene layers',
    unit: 'nm',
    range: { min: 0.1, max: 5, typical: 1 },
    category: 'material',
    subcategory: 'mxene',
    tags: ['MXene', 'interlayer', 'spacing']
  },
  {
    id: 'mat-mxene-oxidation-resistance',
    name: 'MXene Oxidation Resistance',
    description: 'Resistance to oxidation in air',
    unit: 'h',
    range: { min: 1, max: 1000, typical: 24 },
    category: 'material',
    subcategory: 'mxene',
    tags: ['MXene', 'oxidation', 'stability']
  }
]

// Operational Parameters - Flow Control
const flowControlParameters: Parameter[] = [
  {
    id: 'op-flow-control-mode',
    name: 'Flow Control Mode',
    description: 'Flow control strategy',
    unit: '-',
    category: 'operational',
    subcategory: 'flow-control',
    tags: ['flow', 'control', 'mode'],
    notes: 'Manual, PID, cascade, or adaptive control'
  },
  {
    id: 'op-flow-setpoint',
    name: 'Flow Setpoint',
    description: 'Target flow rate',
    unit: 'L/h',
    range: { min: 0, max: 1000, typical: 10 },
    category: 'operational',
    subcategory: 'flow-control',
    tags: ['flow', 'setpoint', 'target']
  },
  {
    id: 'op-pump-capacity',
    name: 'Pump Capacity',
    description: 'Maximum pump flow rate',
    unit: 'L/h',
    range: { min: 0, max: 10000, typical: 100 },
    category: 'operational',
    subcategory: 'flow-control',
    tags: ['pump', 'capacity', 'maximum']
  },
  {
    id: 'op-flow-accuracy',
    name: 'Flow Control Accuracy',
    description: 'Flow control precision',
    unit: '%',
    range: { min: 0.1, max: 10, typical: 2 },
    category: 'operational',
    subcategory: 'flow-control',
    tags: ['flow', 'accuracy', 'precision']
  }
]

// Operational Parameters - Mixing Control
const mixingControlParameters: Parameter[] = [
  {
    id: 'op-mixer-speed',
    name: 'Mixer Speed',
    description: 'Mixer rotation speed',
    unit: 'rpm',
    range: { min: 0, max: 2000, typical: 200 },
    category: 'operational',
    subcategory: 'mixing',
    tags: ['mixer', 'speed', 'rpm']
  },
  {
    id: 'op-mixer-power',
    name: 'Mixing Power',
    description: 'Power input for mixing',
    unit: 'W/m³',
    range: { min: 0, max: 1000, typical: 50 },
    category: 'operational',
    subcategory: 'mixing',
    tags: ['mixing', 'power', 'energy']
  },
  {
    id: 'op-mixing-time',
    name: 'Mixing Time',
    description: 'Time for complete mixing',
    unit: 's',
    range: { min: 1, max: 3600, typical: 60 },
    category: 'operational',
    subcategory: 'mixing',
    tags: ['mixing', 'time', 'homogenization']
  },
  {
    id: 'op-reynolds-mixing',
    name: 'Mixing Reynolds Number',
    description: 'Reynolds number for mixing',
    unit: '-',
    range: { min: 1, max: 100000, typical: 10000 },
    category: 'operational',
    subcategory: 'mixing',
    tags: ['Reynolds', 'mixing', 'turbulence']
  }
]

// Performance Parameters - Efficiency Metrics
const efficiencyMetricsParameters: Parameter[] = [
  {
    id: 'perf-voltage-efficiency',
    name: 'Voltage Efficiency',
    description: 'Ratio of operating to theoretical voltage',
    unit: '%',
    range: { min: 0, max: 100, typical: 70 },
    category: 'performance',
    subcategory: 'efficiency',
    tags: ['voltage', 'efficiency', 'electrical']
  },
  {
    id: 'perf-faradaic-efficiency',
    name: 'Faradaic Efficiency',
    description: 'Efficiency of electron transfer',
    unit: '%',
    range: { min: 0, max: 100, typical: 85 },
    category: 'performance',
    subcategory: 'efficiency',
    tags: ['faradaic', 'efficiency', 'electrons']
  },
  {
    id: 'perf-substrate-conversion',
    name: 'Substrate Conversion',
    description: 'Fraction of substrate converted',
    unit: '%',
    range: { min: 0, max: 100, typical: 80 },
    category: 'performance',
    subcategory: 'efficiency',
    tags: ['substrate', 'conversion', 'utilization']
  },
  {
    id: 'perf-cod-to-current',
    name: 'COD to Current Efficiency',
    description: 'Conversion of COD to electrical current',
    unit: '%',
    range: { min: 0, max: 100, typical: 50 },
    category: 'performance',
    subcategory: 'efficiency',
    tags: ['COD', 'current', 'conversion']
  }
]

// Reactor-Level Parameters - Flow Distribution
const reactorFlowParameters: Parameter[] = [
  {
    id: 'reactor-manifold-type',
    name: 'Manifold Type',
    description: 'Flow distribution manifold design',
    unit: '-',
    category: 'reactor-level',
    subcategory: 'flow-distribution',
    tags: ['manifold', 'flow', 'distribution'],
    notes: 'Z-type, U-type, parallel, or custom'
  },
  {
    id: 'reactor-inlet-diameter',
    name: 'Inlet Diameter',
    description: 'Main inlet pipe diameter',
    unit: 'mm',
    range: { min: 5, max: 100, typical: 25 },
    category: 'reactor-level',
    subcategory: 'flow-distribution',
    tags: ['inlet', 'diameter', 'pipe']
  },
  {
    id: 'reactor-flow-uniformity',
    name: 'Flow Uniformity',
    description: 'Flow distribution uniformity',
    unit: '%',
    range: { min: 50, max: 100, typical: 90 },
    category: 'reactor-level',
    subcategory: 'flow-distribution',
    tags: ['flow', 'uniformity', 'distribution']
  },
  {
    id: 'reactor-pressure-drop',
    name: 'Manifold Pressure Drop',
    description: 'Pressure drop across manifold',
    unit: 'kPa',
    range: { min: 0, max: 100, typical: 5 },
    category: 'reactor-level',
    subcategory: 'flow-distribution',
    tags: ['pressure drop', 'manifold', 'hydraulic']
  }
]

// Economic Parameters - Revenue & Payback
const economicRevenueParameters: Parameter[] = [
  {
    id: 'econ-electricity-price',
    name: 'Electricity Price',
    description: 'Price of electricity generated',
    unit: '$/kWh',
    range: { min: 0.01, max: 1, typical: 0.1 },
    category: 'economic',
    subcategory: 'revenue',
    tags: ['electricity', 'price', 'revenue']
  },
  {
    id: 'econ-treatment-credit',
    name: 'Treatment Credit',
    description: 'Revenue from wastewater treatment',
    unit: '$/m³',
    range: { min: 0, max: 10, typical: 0.5 },
    category: 'economic',
    subcategory: 'revenue',
    tags: ['treatment', 'credit', 'revenue']
  },
  {
    id: 'econ-payback-period',
    name: 'Payback Period',
    description: 'Time to recover investment',
    unit: 'years',
    range: { min: 0.5, max: 50, typical: 5 },
    category: 'economic',
    subcategory: 'revenue',
    tags: ['payback', 'ROI', 'investment']
  },
  {
    id: 'econ-net-present-value',
    name: 'Net Present Value',
    description: 'NPV of the project',
    unit: '$',
    range: { min: -1e6, max: 1e9, typical: 100000 },
    category: 'economic',
    subcategory: 'revenue',
    tags: ['NPV', 'value', 'financial']
  }
]

// Application-Specific Parameters - Hydrogen Production
const applicationHydrogenParameters: Parameter[] = [
  {
    id: 'app-h2-production-rate',
    name: 'Hydrogen Production Rate',
    description: 'Rate of H2 generation',
    unit: 'L/L/d',
    range: { min: 0, max: 100, typical: 10 },
    category: 'application-specific',
    subcategory: 'hydrogen',
    tags: ['hydrogen', 'production', 'rate']
  },
  {
    id: 'app-h2-yield',
    name: 'Hydrogen Yield',
    description: 'H2 yield from substrate',
    unit: 'mol H2/mol substrate',
    range: { min: 0, max: 12, typical: 4 },
    category: 'application-specific',
    subcategory: 'hydrogen',
    tags: ['hydrogen', 'yield', 'efficiency']
  },
  {
    id: 'app-h2-purity',
    name: 'Hydrogen Purity',
    description: 'Purity of produced hydrogen',
    unit: '%',
    range: { min: 50, max: 100, typical: 95 },
    category: 'application-specific',
    subcategory: 'hydrogen',
    tags: ['hydrogen', 'purity', 'quality']
  },
  {
    id: 'app-h2-energy-efficiency',
    name: 'H2 Energy Efficiency',
    description: 'Energy efficiency of H2 production',
    unit: '%',
    range: { min: 0, max: 100, typical: 60 },
    category: 'application-specific',
    subcategory: 'hydrogen',
    tags: ['hydrogen', 'energy', 'efficiency']
  }
]

// Application-Specific Parameters - Desalination
const applicationDesalinationParameters: Parameter[] = [
  {
    id: 'app-desal-salt-removal',
    name: 'Salt Removal Efficiency',
    description: 'Removal of dissolved salts',
    unit: '%',
    range: { min: 0, max: 100, typical: 90 },
    category: 'application-specific',
    subcategory: 'desalination',
    tags: ['salt', 'removal', 'desalination']
  },
  {
    id: 'app-desal-tds-reduction',
    name: 'TDS Reduction',
    description: 'Total dissolved solids reduction',
    unit: '%',
    range: { min: 0, max: 100, typical: 85 },
    category: 'application-specific',
    subcategory: 'desalination',
    tags: ['TDS', 'reduction', 'desalination']
  },
  {
    id: 'app-desal-water-recovery',
    name: 'Water Recovery Rate',
    description: 'Fraction of water recovered',
    unit: '%',
    range: { min: 0, max: 100, typical: 70 },
    category: 'application-specific',
    subcategory: 'desalination',
    tags: ['water', 'recovery', 'desalination']
  },
  {
    id: 'app-desal-energy-consumption',
    name: 'Desalination Energy Use',
    description: 'Energy per volume desalinated',
    unit: 'kWh/m³',
    range: { min: 0, max: 10, typical: 2 },
    category: 'application-specific',
    subcategory: 'desalination',
    tags: ['energy', 'consumption', 'desalination']
  }
]

// Emerging Technology Parameters - Bioprinting
const emergingBioprintingParameters: Parameter[] = [
  {
    id: 'emerging-bioprint-resolution',
    name: 'Bioprinting Resolution',
    description: '3D printing resolution for bioelectrodes',
    unit: 'μm',
    range: { min: 10, max: 1000, typical: 100 },
    category: 'emerging-tech',
    subcategory: 'bioprinting',
    tags: ['bioprinting', '3D printing', 'resolution']
  },
  {
    id: 'emerging-bioprint-speed',
    name: 'Bioprinting Speed',
    description: 'Speed of bioprinting process',
    unit: 'mm/s',
    range: { min: 0.1, max: 100, typical: 10 },
    category: 'emerging-tech',
    subcategory: 'bioprinting',
    tags: ['bioprinting', 'speed', 'fabrication']
  },
  {
    id: 'emerging-bioprint-viability',
    name: 'Cell Viability Post-Printing',
    description: 'Cell survival after bioprinting',
    unit: '%',
    range: { min: 0, max: 100, typical: 85 },
    category: 'emerging-tech',
    subcategory: 'bioprinting',
    tags: ['bioprinting', 'viability', 'cells']
  },
  {
    id: 'emerging-bioink-viscosity',
    name: 'Bioink Viscosity',
    description: 'Viscosity of bioink material',
    unit: 'Pa·s',
    range: { min: 0.001, max: 1000, typical: 1 },
    category: 'emerging-tech',
    subcategory: 'bioprinting',
    tags: ['bioink', 'viscosity', 'material']
  }
]

// Emerging Technology Parameters - Nanomaterials
const emergingNanomaterialParameters: Parameter[] = [
  {
    id: 'emerging-nano-particle-size',
    name: 'Nanoparticle Size',
    description: 'Average nanoparticle diameter',
    unit: 'nm',
    range: { min: 1, max: 1000, typical: 50 },
    category: 'emerging-tech',
    subcategory: 'nanomaterials',
    tags: ['nanoparticle', 'size', 'diameter']
  },
  {
    id: 'emerging-nano-surface-area',
    name: 'Nano Surface Area',
    description: 'Specific surface area of nanomaterial',
    unit: 'm²/g',
    range: { min: 10, max: 3000, typical: 500 },
    category: 'emerging-tech',
    subcategory: 'nanomaterials',
    tags: ['nanomaterial', 'surface area', 'specific']
  },
  {
    id: 'emerging-nano-conductivity',
    name: 'Nano Conductivity Enhancement',
    description: 'Conductivity increase from nanomaterials',
    unit: 'fold',
    range: { min: 1, max: 1000, typical: 10 },
    category: 'emerging-tech',
    subcategory: 'nanomaterials',
    tags: ['nanomaterial', 'conductivity', 'enhancement']
  },
  {
    id: 'emerging-nano-stability',
    name: 'Nanomaterial Stability',
    description: 'Stability duration of nanomaterials',
    unit: 'days',
    range: { min: 1, max: 1000, typical: 90 },
    category: 'emerging-tech',
    subcategory: 'nanomaterials',
    tags: ['nanomaterial', 'stability', 'duration']
  }
]

// Integration Parameters - System Integration
const integrationSystemParameters: Parameter[] = [
  {
    id: 'integration-grid-connection',
    name: 'Grid Connection Voltage',
    description: 'Voltage for grid integration',
    unit: 'V',
    range: { min: 110, max: 480, typical: 240 },
    category: 'integration',
    subcategory: 'system',
    tags: ['grid', 'voltage', 'connection']
  },
  {
    id: 'integration-power-quality',
    name: 'Power Quality Factor',
    description: 'Quality of power output',
    unit: '-',
    range: { min: 0, max: 1, typical: 0.95 },
    category: 'integration',
    subcategory: 'system',
    tags: ['power', 'quality', 'factor']
  },
  {
    id: 'integration-response-time',
    name: 'System Response Time',
    description: 'Response to load changes',
    unit: 's',
    range: { min: 0.001, max: 100, typical: 1 },
    category: 'integration',
    subcategory: 'system',
    tags: ['response', 'time', 'dynamics']
  },
  {
    id: 'integration-automation-level',
    name: 'Automation Level',
    description: 'Degree of system automation',
    unit: '%',
    range: { min: 0, max: 100, typical: 70 },
    category: 'integration',
    subcategory: 'system',
    tags: ['automation', 'control', 'level']
  }
]

// Integration Parameters - Scale-up
const integrationScaleupParameters: Parameter[] = [
  {
    id: 'integration-scale-factor',
    name: 'Scale-up Factor',
    description: 'Scale increase from lab to pilot',
    unit: '-',
    range: { min: 1, max: 10000, typical: 100 },
    category: 'integration',
    subcategory: 'scaleup',
    tags: ['scale', 'factor', 'pilot']
  },
  {
    id: 'integration-reynolds-scale',
    name: 'Reynolds Number at Scale',
    description: 'Reynolds number at larger scale',
    unit: '-',
    range: { min: 1, max: 1e6, typical: 10000 },
    category: 'integration',
    subcategory: 'scaleup',
    tags: ['Reynolds', 'scale', 'flow']
  },
  {
    id: 'integration-mixing-scale',
    name: 'Mixing Time at Scale',
    description: 'Mixing time at larger scale',
    unit: 's',
    range: { min: 1, max: 3600, typical: 300 },
    category: 'integration',
    subcategory: 'scaleup',
    tags: ['mixing', 'time', 'scale']
  },
  {
    id: 'integration-performance-retention',
    name: 'Performance Retention',
    description: 'Performance retained after scale-up',
    unit: '%',
    range: { min: 0, max: 100, typical: 80 },
    category: 'integration',
    subcategory: 'scaleup',
    tags: ['performance', 'retention', 'scale']
  }
]

// Modeling Parameters - Simulation
const modelingSimulationParameters: Parameter[] = [
  {
    id: 'model-time-step',
    name: 'Simulation Time Step',
    description: 'Time step for numerical simulation',
    unit: 's',
    range: { min: 0.001, max: 3600, typical: 1 },
    category: 'modeling',
    subcategory: 'simulation',
    tags: ['simulation', 'time step', 'numerical']
  },
  {
    id: 'model-convergence-criteria',
    name: 'Convergence Criteria',
    description: 'Convergence tolerance for simulation',
    unit: '-',
    range: { min: 1e-10, max: 0.01, typical: 1e-6 },
    category: 'modeling',
    subcategory: 'simulation',
    tags: ['convergence', 'tolerance', 'simulation']
  },
  {
    id: 'model-mesh-size',
    name: 'Mesh Size',
    description: 'Finite element mesh size',
    unit: 'mm',
    range: { min: 0.01, max: 100, typical: 1 },
    category: 'modeling',
    subcategory: 'simulation',
    tags: ['mesh', 'size', 'FEM']
  },
  {
    id: 'model-iterations',
    name: 'Maximum Iterations',
    description: 'Maximum solver iterations',
    unit: '-',
    range: { min: 10, max: 10000, typical: 1000 },
    category: 'modeling',
    subcategory: 'simulation',
    tags: ['iterations', 'solver', 'maximum']
  }
]

// Modeling Parameters - Kinetic Models
const modelingKineticParameters: Parameter[] = [
  {
    id: 'model-monod-constant',
    name: 'Monod Constant',
    description: 'Half-saturation constant for Monod kinetics',
    unit: 'g/L',
    range: { min: 0.001, max: 10, typical: 0.1 },
    category: 'modeling',
    subcategory: 'kinetics',
    tags: ['Monod', 'kinetics', 'Ks']
  },
  {
    id: 'model-inhibition-constant',
    name: 'Inhibition Constant',
    description: 'Substrate inhibition constant',
    unit: 'g/L',
    range: { min: 0.1, max: 100, typical: 10 },
    category: 'modeling',
    subcategory: 'kinetics',
    tags: ['inhibition', 'Ki', 'kinetics']
  },
  {
    id: 'model-activation-energy',
    name: 'Activation Energy',
    description: 'Activation energy for reactions',
    unit: 'kJ/mol',
    range: { min: 10, max: 200, typical: 50 },
    category: 'modeling',
    subcategory: 'kinetics',
    tags: ['activation', 'energy', 'Arrhenius']
  },
  {
    id: 'model-reaction-order',
    name: 'Reaction Order',
    description: 'Order of reaction kinetics',
    unit: '-',
    range: { min: 0, max: 3, typical: 1 },
    category: 'modeling',
    subcategory: 'kinetics',
    tags: ['reaction', 'order', 'kinetics']
  }
]

// Experimental Parameters - Measurement
const experimentalMeasurementParameters: Parameter[] = [
  {
    id: 'exp-measurement-frequency',
    name: 'Measurement Frequency',
    description: 'Frequency of data collection',
    unit: 'Hz',
    range: { min: 0.001, max: 1000, typical: 1 },
    category: 'experimental',
    subcategory: 'measurement',
    tags: ['measurement', 'frequency', 'sampling']
  },
  {
    id: 'exp-measurement-accuracy',
    name: 'Measurement Accuracy',
    description: 'Accuracy of measurements',
    unit: '%',
    range: { min: 0.01, max: 10, typical: 1 },
    category: 'experimental',
    subcategory: 'measurement',
    tags: ['accuracy', 'measurement', 'precision']
  },
  {
    id: 'exp-calibration-interval',
    name: 'Calibration Interval',
    description: 'Time between calibrations',
    unit: 'days',
    range: { min: 1, max: 365, typical: 30 },
    category: 'experimental',
    subcategory: 'measurement',
    tags: ['calibration', 'interval', 'maintenance']
  },
  {
    id: 'exp-data-points',
    name: 'Data Points per Test',
    description: 'Number of data points collected',
    unit: '-',
    range: { min: 10, max: 100000, typical: 1000 },
    category: 'experimental',
    subcategory: 'measurement',
    tags: ['data', 'points', 'collection']
  }
]

// Experimental Parameters - Test Conditions
const experimentalTestParameters: Parameter[] = [
  {
    id: 'exp-test-duration',
    name: 'Test Duration',
    description: 'Duration of experimental test',
    unit: 'h',
    range: { min: 0.1, max: 10000, typical: 24 },
    category: 'experimental',
    subcategory: 'test-conditions',
    tags: ['test', 'duration', 'time']
  },
  {
    id: 'exp-replicate-count',
    name: 'Number of Replicates',
    description: 'Number of experimental replicates',
    unit: '-',
    range: { min: 1, max: 20, typical: 3 },
    category: 'experimental',
    subcategory: 'test-conditions',
    tags: ['replicates', 'statistics', 'experiments']
  },
  {
    id: 'exp-control-type',
    name: 'Control Type',
    description: 'Type of experimental control',
    unit: '-',
    category: 'experimental',
    subcategory: 'test-conditions',
    tags: ['control', 'experiment', 'type'],
    notes: 'Positive, negative, or blank control'
  },
  {
    id: 'exp-randomization',
    name: 'Randomization Applied',
    description: 'Whether randomization is used',
    unit: '-',
    category: 'experimental',
    subcategory: 'test-conditions',
    tags: ['randomization', 'design', 'statistics'],
    notes: 'True or false'
  }
]

// Cell-Level Parameters - Micro-Scale Test Cells
const cellMicroScaleParameters: Parameter[] = [
  {
    id: 'cell-slide-length',
    name: 'Microscope Slide Length',
    description: 'Length of microscope slide test cell',
    unit: 'mm',
    range: { min: 50, max: 100, typical: 75 },
    category: 'cell-level',
    subcategory: 'micro-scale',
    tags: ['microscope', 'slide', 'dimension']
  },
  {
    id: 'cell-slide-width',
    name: 'Microscope Slide Width',
    description: 'Width of microscope slide test cell',
    unit: 'mm',
    range: { min: 20, max: 30, typical: 25 },
    category: 'cell-level',
    subcategory: 'micro-scale',
    tags: ['microscope', 'slide', 'dimension']
  },
  {
    id: 'cell-chamber-volume',
    name: 'Micro Chamber Volume',
    description: 'Working chamber volume in microfluidic cell',
    unit: 'μL',
    range: { min: 100, max: 1000, typical: 500 },
    category: 'cell-level',
    subcategory: 'micro-scale',
    tags: ['chamber', 'volume', 'microfluidic']
  },
  {
    id: 'cell-channel-width',
    name: 'Microfluidic Channel Width',
    description: 'Width of microfluidic channels',
    unit: 'μm',
    range: { min: 50, max: 1000, typical: 200 },
    category: 'cell-level',
    subcategory: 'micro-scale',
    tags: ['microfluidic', 'channel', 'width']
  },
  {
    id: 'cell-channel-depth',
    name: 'Microfluidic Channel Depth',
    description: 'Depth of microfluidic channels',
    unit: 'μm',
    range: { min: 20, max: 500, typical: 100 },
    category: 'cell-level',
    subcategory: 'micro-scale',
    tags: ['microfluidic', 'channel', 'depth']
  }
]

// Cell-Level Parameters - Cell Materials
const cellMaterialsParameters: Parameter[] = [
  {
    id: 'cell-wall-thickness',
    name: 'Cell Wall Thickness',
    description: 'Thickness of cell housing walls',
    unit: 'mm',
    range: { min: 2, max: 20, typical: 5 },
    category: 'cell-level',
    subcategory: 'materials',
    tags: ['wall', 'thickness', 'housing']
  },
  {
    id: 'cell-material-transparency',
    name: 'Material Transparency',
    description: 'Optical transparency of cell material',
    unit: '%',
    range: { min: 0, max: 100, typical: 90 },
    category: 'cell-level',
    subcategory: 'materials',
    tags: ['transparency', 'optical', 'material']
  },
  {
    id: 'cell-chemical-resistance',
    name: 'Chemical Resistance Rating',
    description: 'Resistance to chemical attack',
    unit: '-',
    range: { min: 1, max: 10, typical: 8 },
    category: 'cell-level',
    subcategory: 'materials',
    tags: ['chemical', 'resistance', 'durability']
  },
  {
    id: 'cell-temperature-limit',
    name: 'Maximum Temperature',
    description: 'Maximum operating temperature for cell material',
    unit: '°C',
    range: { min: 20, max: 200, typical: 80 },
    category: 'cell-level',
    subcategory: 'materials',
    tags: ['temperature', 'limit', 'material']
  },
  {
    id: 'cell-pressure-rating',
    name: 'Pressure Rating',
    description: 'Maximum pressure rating for cell',
    unit: 'bar',
    range: { min: 1, max: 50, typical: 5 },
    category: 'cell-level',
    subcategory: 'materials',
    tags: ['pressure', 'rating', 'maximum']
  }
]

// Performance Parameters - Power Output Metrics
const performancePowerMetrics: Parameter[] = [
  {
    id: 'perf-power-density-normalized',
    name: 'Normalized Power Density',
    description: 'Power per kg of catalyst',
    unit: 'W/kg',
    range: { min: 0, max: 500, typical: 20 },
    category: 'performance',
    subcategory: 'power-metrics',
    tags: ['power', 'normalized', 'catalyst']
  },
  {
    id: 'perf-maximum-power-point',
    name: 'Maximum Power Point',
    description: 'Peak power output of system',
    unit: 'W',
    range: { min: 0, max: 10000, typical: 10 },
    category: 'performance',
    subcategory: 'power-metrics',
    tags: ['power', 'maximum', 'peak']
  },
  {
    id: 'perf-power-stability',
    name: 'Power Stability',
    description: 'Power degradation rate over time',
    unit: '%/d',
    range: { min: -10, max: 0, typical: -0.5 },
    category: 'performance',
    subcategory: 'power-metrics',
    tags: ['power', 'stability', 'degradation']
  },
  {
    id: 'perf-short-circuit-current',
    name: 'Short Circuit Current',
    description: 'Current at zero voltage',
    unit: 'A',
    range: { min: 0, max: 100, typical: 1 },
    category: 'performance',
    subcategory: 'power-metrics',
    tags: ['current', 'short circuit', 'electrical']
  },
  {
    id: 'perf-fill-factor',
    name: 'Fill Factor',
    description: 'Ratio of max power to product of Isc and Voc',
    unit: '-',
    range: { min: 0, max: 1, typical: 0.7 },
    category: 'performance',
    subcategory: 'power-metrics',
    tags: ['fill factor', 'efficiency', 'electrical']
  }
]

// Performance Parameters - Chemical Production
const performanceChemicalParameters: Parameter[] = [
  {
    id: 'perf-ch4-production-rate',
    name: 'Methane Production Rate',
    description: 'Rate of methane generation',
    unit: 'L/m²/d',
    range: { min: 0, max: 50, typical: 5 },
    category: 'performance',
    subcategory: 'chemical-production',
    tags: ['methane', 'production', 'biogas']
  },
  {
    id: 'perf-ch4-content',
    name: 'Methane Content in Biogas',
    description: 'Percentage of CH4 in biogas',
    unit: '%',
    range: { min: 0, max: 100, typical: 65 },
    category: 'performance',
    subcategory: 'chemical-production',
    tags: ['methane', 'biogas', 'content']
  },
  {
    id: 'perf-biogas-yield',
    name: 'Biogas Yield',
    description: 'Biogas produced per gram substrate',
    unit: 'L/g',
    range: { min: 0, max: 1, typical: 0.5 },
    category: 'performance',
    subcategory: 'chemical-production',
    tags: ['biogas', 'yield', 'production']
  },
  {
    id: 'perf-product-selectivity',
    name: 'Product Selectivity',
    description: 'Selectivity for target product',
    unit: '%',
    range: { min: 0, max: 100, typical: 80 },
    category: 'performance',
    subcategory: 'chemical-production',
    tags: ['selectivity', 'product', 'efficiency']
  },
  {
    id: 'perf-production-rate',
    name: 'Volumetric Production Rate',
    description: 'Product generation rate per volume',
    unit: 'g/L/h',
    range: { min: 0, max: 10, typical: 1 },
    category: 'performance',
    subcategory: 'chemical-production',
    tags: ['production', 'rate', 'volumetric']
  }
]

// Performance Parameters - Treatment Efficiency
const performanceTreatmentParameters: Parameter[] = [
  {
    id: 'perf-toc-removal',
    name: 'Total Organic Carbon Removal',
    description: 'TOC removal efficiency',
    unit: '%',
    range: { min: 0, max: 100, typical: 75 },
    category: 'performance',
    subcategory: 'treatment',
    tags: ['TOC', 'removal', 'organic']
  },
  {
    id: 'perf-specific-removal-rate',
    name: 'Specific Removal Rate',
    description: 'Pollutant removal per electrode area',
    unit: 'g/m²/d',
    range: { min: 0, max: 100, typical: 20 },
    category: 'performance',
    subcategory: 'treatment',
    tags: ['removal', 'rate', 'specific']
  },
  {
    id: 'perf-ammonia-recovery',
    name: 'Ammonia Recovery Efficiency',
    description: 'Recovery of ammonia from wastewater',
    unit: '%',
    range: { min: 0, max: 100, typical: 80 },
    category: 'performance',
    subcategory: 'treatment',
    tags: ['ammonia', 'recovery', 'nutrient']
  },
  {
    id: 'perf-metal-removal',
    name: 'Heavy Metal Removal',
    description: 'Removal efficiency for heavy metals',
    unit: '%',
    range: { min: 0, max: 100, typical: 90 },
    category: 'performance',
    subcategory: 'treatment',
    tags: ['metal', 'removal', 'heavy metal']
  },
  {
    id: 'perf-pathogen-reduction',
    name: 'Pathogen Log Reduction',
    description: 'Log reduction of pathogens',
    unit: 'log',
    range: { min: 0, max: 6, typical: 3 },
    category: 'performance',
    subcategory: 'treatment',
    tags: ['pathogen', 'reduction', 'disinfection']
  }
]

// Operational Parameters - Batch Operation
const operationalBatchParameters: Parameter[] = [
  {
    id: 'op-batch-volume',
    name: 'Batch Volume',
    description: 'Volume of each batch',
    unit: 'L',
    range: { min: 0.1, max: 10000, typical: 10 },
    category: 'operational',
    subcategory: 'batch',
    tags: ['batch', 'volume', 'operation']
  },
  {
    id: 'op-batch-duration',
    name: 'Batch Duration',
    description: 'Time for one batch cycle',
    unit: 'h',
    range: { min: 1, max: 1000, typical: 24 },
    category: 'operational',
    subcategory: 'batch',
    tags: ['batch', 'duration', 'cycle']
  },
  {
    id: 'op-fill-time',
    name: 'Fill Time',
    description: 'Time to fill reactor',
    unit: 'min',
    range: { min: 1, max: 60, typical: 5 },
    category: 'operational',
    subcategory: 'batch',
    tags: ['fill', 'time', 'batch']
  },
  {
    id: 'op-drain-time',
    name: 'Drain Time',
    description: 'Time to empty reactor',
    unit: 'min',
    range: { min: 1, max: 60, typical: 5 },
    category: 'operational',
    subcategory: 'batch',
    tags: ['drain', 'time', 'batch']
  },
  {
    id: 'op-idle-time',
    name: 'Idle Time',
    description: 'Time between batches',
    unit: 'min',
    range: { min: 0, max: 1440, typical: 30 },
    category: 'operational',
    subcategory: 'batch',
    tags: ['idle', 'time', 'batch']
  }
]

// Operational Parameters - Continuous Operation
const operationalContinuousParameters: Parameter[] = [
  {
    id: 'op-dilution-rate',
    name: 'Dilution Rate',
    description: 'Flow rate divided by reactor volume',
    unit: '1/h',
    range: { min: 0.001, max: 10, typical: 0.042 },
    category: 'operational',
    subcategory: 'continuous',
    tags: ['dilution', 'rate', 'continuous']
  },
  {
    id: 'op-recycle-ratio',
    name: 'Recycle Ratio',
    description: 'Ratio of recycle to feed flow',
    unit: '-',
    range: { min: 0, max: 10, typical: 0 },
    category: 'operational',
    subcategory: 'continuous',
    tags: ['recycle', 'ratio', 'flow']
  },
  {
    id: 'op-steady-state-criteria',
    name: 'Steady State Criteria',
    description: 'Allowable variation for steady state',
    unit: '%',
    range: { min: 0.1, max: 10, typical: 1 },
    category: 'operational',
    subcategory: 'continuous',
    tags: ['steady state', 'criteria', 'stability']
  },
  {
    id: 'op-startup-time',
    name: 'Startup Time',
    description: 'Time to reach steady state',
    unit: 'h',
    range: { min: 1, max: 1000, typical: 72 },
    category: 'operational',
    subcategory: 'continuous',
    tags: ['startup', 'time', 'steady state']
  }
]

// Operational Parameters - Startup & Shutdown
const operationalStartupParameters: Parameter[] = [
  {
    id: 'op-inoculum-volume',
    name: 'Inoculum Volume',
    description: 'Percentage of reactor volume as inoculum',
    unit: '%',
    range: { min: 1, max: 50, typical: 10 },
    category: 'operational',
    subcategory: 'startup',
    tags: ['inoculum', 'volume', 'startup']
  },
  {
    id: 'op-acclimation-time',
    name: 'Acclimation Time',
    description: 'Time for microbial adaptation',
    unit: 'd',
    range: { min: 1, max: 60, typical: 7 },
    category: 'operational',
    subcategory: 'startup',
    tags: ['acclimation', 'adaptation', 'startup']
  },
  {
    id: 'op-initial-substrate',
    name: 'Initial Substrate Concentration',
    description: 'Starting substrate level',
    unit: 'g/L',
    range: { min: 0.1, max: 10, typical: 1 },
    category: 'operational',
    subcategory: 'startup',
    tags: ['substrate', 'initial', 'startup']
  },
  {
    id: 'op-flush-cycles',
    name: 'System Flush Cycles',
    description: 'Number of flush cycles during shutdown',
    unit: '-',
    range: { min: 0, max: 10, typical: 3 },
    category: 'operational',
    subcategory: 'startup',
    tags: ['flush', 'shutdown', 'cycles']
  },
  {
    id: 'op-storage-temperature',
    name: 'Storage Temperature',
    description: 'Temperature for system storage',
    unit: '°C',
    range: { min: -80, max: 40, typical: 4 },
    category: 'operational',
    subcategory: 'startup',
    tags: ['storage', 'temperature', 'preservation']
  }
]

// Material Parameters - Metal-Based Cathodes
const metalCathodeParameters: Parameter[] = [
  {
    id: 'mat-pt-loading',
    name: 'Platinum Loading',
    description: 'Amount of Pt catalyst on cathode',
    unit: 'mg/cm²',
    range: { min: 0.01, max: 5, typical: 0.5 },
    category: 'material',
    subcategory: 'metal-cathode',
    tags: ['platinum', 'loading', 'catalyst']
  },
  {
    id: 'mat-pt-particle-size',
    name: 'Pt Particle Size',
    description: 'Size of platinum nanoparticles',
    unit: 'nm',
    range: { min: 1, max: 100, typical: 5 },
    category: 'material',
    subcategory: 'metal-cathode',
    tags: ['platinum', 'particle', 'size']
  },
  {
    id: 'mat-ni-foam-porosity',
    name: 'Nickel Foam Porosity',
    description: 'Porosity of nickel foam cathode',
    unit: '%',
    range: { min: 80, max: 98, typical: 95 },
    category: 'material',
    subcategory: 'metal-cathode',
    tags: ['nickel', 'foam', 'porosity']
  },
  {
    id: 'mat-cu-surface-enhancement',
    name: 'Copper Surface Enhancement',
    description: 'Surface area increase factor for Cu cathode',
    unit: '-',
    range: { min: 1, max: 1000, typical: 10 },
    category: 'material',
    subcategory: 'metal-cathode',
    tags: ['copper', 'surface', 'enhancement']
  }
]

// Material Parameters - Metal Oxide Cathodes
const metalOxideParameters: Parameter[] = [
  {
    id: 'mat-mno2-crystal-structure',
    name: 'MnO2 Crystal Structure',
    description: 'Crystal phase of manganese dioxide',
    unit: '-',
    category: 'material',
    subcategory: 'metal-oxide',
    tags: ['MnO2', 'crystal', 'structure'],
    notes: 'α, β, γ, δ, or amorphous'
  },
  {
    id: 'mat-fe-oxide-phase',
    name: 'Iron Oxide Phase',
    description: 'Phase of iron oxide catalyst',
    unit: '-',
    category: 'material',
    subcategory: 'metal-oxide',
    tags: ['iron oxide', 'phase', 'catalyst'],
    notes: 'Fe2O3, Fe3O4, or FeOOH'
  },
  {
    id: 'mat-co-oxide-phase',
    name: 'Cobalt Oxide Phase',
    description: 'Phase of cobalt oxide catalyst',
    unit: '-',
    category: 'material',
    subcategory: 'metal-oxide',
    tags: ['cobalt oxide', 'phase', 'catalyst'],
    notes: 'CoO, Co3O4, or CoOOH'
  },
  {
    id: 'mat-oxide-particle-size',
    name: 'Metal Oxide Particle Size',
    description: 'Average particle size of metal oxide',
    unit: 'nm',
    range: { min: 5, max: 500, typical: 50 },
    category: 'material',
    subcategory: 'metal-oxide',
    tags: ['metal oxide', 'particle', 'size']
  }
]

// Material Parameters - Air Cathodes
const airCathodeParameters: Parameter[] = [
  {
    id: 'mat-gdl-thickness',
    name: 'Gas Diffusion Layer Thickness',
    description: 'Thickness of GDL',
    unit: 'μm',
    range: { min: 100, max: 1000, typical: 300 },
    category: 'material',
    subcategory: 'air-cathode',
    tags: ['GDL', 'thickness', 'gas diffusion']
  },
  {
    id: 'mat-ptfe-loading',
    name: 'PTFE Loading',
    description: 'PTFE content in GDL',
    unit: 'wt%',
    range: { min: 0, max: 60, typical: 30 },
    category: 'material',
    subcategory: 'air-cathode',
    tags: ['PTFE', 'loading', 'hydrophobic']
  },
  {
    id: 'mat-catalyst-loading',
    name: 'Catalyst Loading',
    description: 'Total catalyst loading on air cathode',
    unit: 'mg/cm²',
    range: { min: 0.1, max: 10, typical: 2 },
    category: 'material',
    subcategory: 'air-cathode',
    tags: ['catalyst', 'loading', 'air cathode']
  },
  {
    id: 'mat-ionomer-content',
    name: 'Ionomer Content',
    description: 'Ionomer in catalyst layer',
    unit: 'wt%',
    range: { min: 0, max: 50, typical: 20 },
    category: 'material',
    subcategory: 'air-cathode',
    tags: ['ionomer', 'content', 'catalyst layer']
  }
]

// Material Parameters - Ion Exchange Membranes
const ionExchangeParameters: Parameter[] = [
  {
    id: 'mat-pem-conductivity',
    name: 'PEM Conductivity',
    description: 'Proton conductivity of membrane',
    unit: 'S/cm',
    range: { min: 0.001, max: 0.2, typical: 0.08 },
    category: 'material',
    subcategory: 'ion-exchange',
    tags: ['PEM', 'conductivity', 'proton']
  },
  {
    id: 'mat-pem-water-uptake',
    name: 'PEM Water Uptake',
    description: 'Water absorption of membrane',
    unit: '%',
    range: { min: 5, max: 50, typical: 20 },
    category: 'material',
    subcategory: 'ion-exchange',
    tags: ['PEM', 'water', 'absorption']
  },
  {
    id: 'mat-aem-iec',
    name: 'AEM Ion Exchange Capacity',
    description: 'Ion exchange capacity of AEM',
    unit: 'meq/g',
    range: { min: 0.5, max: 3, typical: 1.5 },
    category: 'material',
    subcategory: 'ion-exchange',
    tags: ['AEM', 'IEC', 'capacity']
  },
  {
    id: 'mat-bpm-voltage',
    name: 'Bipolar Membrane Voltage',
    description: 'Water dissociation voltage for BPM',
    unit: 'V',
    range: { min: 0.8, max: 2, typical: 1.2 },
    category: 'material',
    subcategory: 'ion-exchange',
    tags: ['BPM', 'voltage', 'water splitting']
  }
]

// Material Parameters - Porous Separators
const porousSeparatorParameters: Parameter[] = [
  {
    id: 'mat-separator-pore-size',
    name: 'Separator Pore Size',
    description: 'Average pore size of separator',
    unit: 'μm',
    range: { min: 0.01, max: 10, typical: 0.5 },
    category: 'material',
    subcategory: 'separator',
    tags: ['pore size', 'separator', 'membrane']
  },
  {
    id: 'mat-separator-porosity',
    name: 'Separator Porosity',
    description: 'Porosity of separator membrane',
    unit: '%',
    range: { min: 20, max: 80, typical: 40 },
    category: 'material',
    subcategory: 'separator',
    tags: ['porosity', 'separator', 'membrane']
  },
  {
    id: 'mat-separator-hydrophobicity',
    name: 'Separator Hydrophobicity',
    description: 'Water contact angle of separator',
    unit: '°',
    range: { min: 0, max: 180, typical: 120 },
    category: 'material',
    subcategory: 'separator',
    tags: ['hydrophobicity', 'contact angle', 'separator']
  },
  {
    id: 'mat-separator-thickness',
    name: 'Separator Thickness',
    description: 'Thickness of porous separator',
    unit: 'μm',
    range: { min: 10, max: 500, typical: 100 },
    category: 'material',
    subcategory: 'separator',
    tags: ['thickness', 'separator', 'dimension']
  }
]

// Biological Parameters - Specific Organisms
const specificOrganismParameters: Parameter[] = [
  {
    id: 'bio-geobacter-temperature',
    name: 'Geobacter Optimal Temperature',
    description: 'Optimal growth temperature for Geobacter',
    unit: '°C',
    range: { min: 25, max: 35, typical: 30 },
    category: 'biological',
    subcategory: 'organisms',
    tags: ['Geobacter', 'temperature', 'optimal']
  },
  {
    id: 'bio-shewanella-ph',
    name: 'Shewanella Optimal pH',
    description: 'Optimal pH for Shewanella',
    unit: '-',
    range: { min: 6.5, max: 8, typical: 7.5 },
    category: 'biological',
    subcategory: 'organisms',
    tags: ['Shewanella', 'pH', 'optimal']
  },
  {
    id: 'bio-pseudomonas-phenazine',
    name: 'Pseudomonas Phenazine Production',
    description: 'Phenazine mediator production by Pseudomonas',
    unit: '-',
    category: 'biological',
    subcategory: 'organisms',
    tags: ['Pseudomonas', 'phenazine', 'mediator'],
    notes: 'True or false'
  },
  {
    id: 'bio-clostridium-h2-yield',
    name: 'Clostridium H2 Yield',
    description: 'Hydrogen yield from glucose by Clostridium',
    unit: 'mol/mol',
    range: { min: 1, max: 4, typical: 2.5 },
    category: 'biological',
    subcategory: 'organisms',
    tags: ['Clostridium', 'hydrogen', 'yield']
  }
]

// Biological Parameters - Substrate Utilization
const substrateUtilizationParameters: Parameter[] = [
  {
    id: 'bio-substrate-uptake-rate',
    name: 'Substrate Uptake Rate',
    description: 'Specific substrate uptake rate',
    unit: 'g/g/h',
    range: { min: 0.01, max: 10, typical: 1 },
    category: 'biological',
    subcategory: 'substrate-utilization',
    tags: ['substrate', 'uptake', 'rate']
  },
  {
    id: 'bio-substrate-affinity',
    name: 'Substrate Affinity',
    description: 'Affinity for substrate',
    unit: 'L/g/h',
    range: { min: 0.1, max: 100, typical: 10 },
    category: 'biological',
    subcategory: 'substrate-utilization',
    tags: ['substrate', 'affinity', 'kinetics']
  },
  {
    id: 'bio-substrate-inhibition',
    name: 'Substrate Inhibition Constant',
    description: 'Substrate inhibition concentration',
    unit: 'g/L',
    range: { min: 0.1, max: 100, typical: 10 },
    category: 'biological',
    subcategory: 'substrate-utilization',
    tags: ['substrate', 'inhibition', 'kinetics']
  }
]

// Function to get all parameters
export function getAllParameters(): Parameter[] {
  return [
    ...temperatureParameters,
    ...humidityParameters,
    ...pressureParameters,
    ...gasCompositionParameters,
    ...lightParameters,
    ...vibrationParameters,
    ...soundParameters,
    ...electromagneticParameters,
    ...cellGeometryParameters,
    ...cellElectrodeParameters,
    ...cellPerformanceParameters,
    ...cellMicroScaleParameters,
    ...cellMaterialsParameters,
    ...microorganismParameters,
    ...microbialKineticsParameters,
    ...specificOrganismParameters,
    ...substrateUtilizationParameters,
    ...anodeMaterialParameters,
    ...cathodeMaterialParameters,
    ...membraneMaterialParameters,
    ...advancedCarbonParameters,
    ...mxeneParameters,
    ...metalCathodeParameters,
    ...metalOxideParameters,
    ...airCathodeParameters,
    ...ionExchangeParameters,
    ...porousSeparatorParameters,
    ...biofilmParameters,
    ...substrateParameters,
    ...processControlParameters,
    ...flowControlParameters,
    ...mixingControlParameters,
    ...operationalBatchParameters,
    ...operationalContinuousParameters,
    ...operationalStartupParameters,
    ...systemOutputParameters,
    ...efficiencyMetricsParameters,
    ...performancePowerMetrics,
    ...performanceChemicalParameters,
    ...performanceTreatmentParameters,
    ...reactorSystemParameters,
    ...reactorStackParameters,
    ...reactorFlowParameters,
    ...economicCapitalParameters,
    ...economicOperatingParameters,
    ...economicRevenueParameters,
    ...safetyLimitsParameters,
    ...safetyHazardsParameters,
    ...monitoringSensorParameters,
    ...monitoringDataParameters,
    ...applicationWastewaterParameters,
    ...applicationHydrogenParameters,
    ...applicationDesalinationParameters,
    ...emergingBioprintingParameters,
    ...emergingNanomaterialParameters,
    ...integrationSystemParameters,
    ...integrationScaleupParameters,
    ...modelingSimulationParameters,
    ...modelingKineticParameters,
    ...experimentalMeasurementParameters,
    ...experimentalTestParameters
  ]
}

// Function to search parameters
export function searchParameters(query: string): Parameter[] {
  const lowerQuery = query.toLowerCase()
  return getAllParameters().filter(param => 
    param.name.toLowerCase().includes(lowerQuery) ||
    param.description.toLowerCase().includes(lowerQuery) ||
    param.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    (param.unit && param.unit.toLowerCase().includes(lowerQuery))
  )
}

// Function to get parameters by category
export function getParametersByCategory(categoryId: string): Parameter[] {
  return getAllParameters().filter(param => param.category === categoryId)
}

// Function to get parameters by subcategory
export function getParametersBySubcategory(categoryId: string, subcategoryId: string): Parameter[] {
  return getAllParameters().filter(param => 
    param.category === categoryId && param.subcategory === subcategoryId
  )
}

// Function to get related parameters
export function getRelatedParameters(parameterId: string): Parameter[] {
  const param = getAllParameters().find(p => p.id === parameterId)
  if (!param || !param.relatedParameters) return []
  
  return param.relatedParameters
    .map(id => getAllParameters().find(p => p.id === id))
    .filter(Boolean) as Parameter[]
}

// Unit conversion utilities
export const unitConversions = {
  temperature: {
    celsiusToFahrenheit: (c: number) => (c * 9/5) + 32,
    fahrenheitToCelsius: (f: number) => (f - 32) * 5/9,
    celsiusToKelvin: (c: number) => c + 273.15,
    kelvinToCelsius: (k: number) => k - 273.15
  },
  power: {
    mWToW: (mw: number) => mw / 1000,
    WTomW: (w: number) => w * 1000,
    mWm2ToWm2: (mw: number) => mw / 1000,
    Wm2TomWm2: (w: number) => w * 1000
  },
  pressure: {
    kPaToPsi: (kpa: number) => kpa * 0.145038,
    psiToKPa: (psi: number) => psi / 0.145038,
    kPaToBar: (kpa: number) => kpa / 100,
    barToKPa: (bar: number) => bar * 100
  }
}

// Export functions for CSV/JSON
export function exportParametersAsJSON(parameters: Parameter[]): string {
  return JSON.stringify(parameters, null, 2)
}

export function exportParametersAsCSV(parameters: Parameter[]): string {
  const headers = ['ID', 'Name', 'Description', 'Unit', 'Min', 'Max', 'Typical', 'Category', 'Subcategory', 'Tags']
  const rows = parameters.map(p => [
    p.id,
    p.name,
    p.description,
    p.unit || '',
    p.range?.min || '',
    p.range?.max || '',
    p.range?.typical || '',
    p.category,
    p.subcategory,
    p.tags.join('; ')
  ])
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
}

// Statistics
export function getParameterStatistics() {
  const allParams = getAllParameters()
  const byCategory = parameterCategories.map(cat => ({
    category: cat.name,
    count: allParams.filter(p => p.category === cat.id).length
  }))
  
  return {
    total: allParams.length,
    byCategory,
    withUnits: allParams.filter(p => p.unit).length,
    withRanges: allParams.filter(p => p.range).length,
    withRelated: allParams.filter(p => p.relatedParameters && p.relatedParameters.length > 0).length
  }
}