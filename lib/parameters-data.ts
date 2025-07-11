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

// Function to get all parameters
export function getAllParameters(): Parameter[] {
  return [
    ...temperatureParameters,
    ...humidityParameters,
    ...pressureParameters,
    ...gasCompositionParameters,
    ...lightParameters,
    ...cellGeometryParameters,
    ...cellElectrodeParameters,
    ...cellPerformanceParameters,
    ...microorganismParameters,
    ...anodeMaterialParameters,
    ...cathodeMaterialParameters,
    ...membraneMaterialParameters,
    ...biofilmParameters,
    ...substrateParameters,
    ...processControlParameters,
    ...systemOutputParameters,
    ...reactorSystemParameters,
    ...reactorStackParameters,
    ...economicCapitalParameters,
    ...economicOperatingParameters,
    ...safetyLimitsParameters,
    ...safetyHazardsParameters,
    ...monitoringSensorParameters,
    ...monitoringDataParameters,
    ...applicationWastewaterParameters
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