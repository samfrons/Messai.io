// MESS Parameters Data Library
export interface ParameterCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  subcategories?: string[]
}

export interface Parameter {
  id: string
  name: string
  description: string
  unit: string
  type: 'number' | 'string' | 'boolean' | 'select'
  category: string
  subcategory: string
  range?: {
    min?: number
    max?: number
    typical?: number
  }
  default?: any
  options?: string[]
  tags?: string[]
}

// Environmental Parameters
const environmentalParameters: Parameter[] = [
  // Atmospheric Conditions
  {
    id: 'ambient_temperature',
    name: 'Ambient Temperature',
    description: 'Ambient air temperature around the system',
    unit: '°C',
    type: 'number',
    category: 'environmental',
    subcategory: 'atmospheric-conditions',
    range: { min: -50, max: 60, typical: 25 },
    default: 25
  },
  {
    id: 'operating_temperature',
    name: 'Operating Temperature',
    description: 'Cell/reactor operating temperature',
    unit: '°C',
    type: 'number',
    category: 'environmental',
    subcategory: 'atmospheric-conditions',
    range: { min: 4, max: 80, typical: 30 },
    default: 30
  },
  {
    id: 'relative_humidity',
    name: 'Relative Humidity',
    description: 'Relative humidity of the environment',
    unit: '%',
    type: 'number',
    category: 'environmental',
    subcategory: 'atmospheric-conditions',
    range: { min: 10, max: 100, typical: 65 },
    default: 65
  },
  {
    id: 'atmospheric_pressure',
    name: 'Atmospheric Pressure',
    description: 'Atmospheric pressure at operating location',
    unit: 'kPa',
    type: 'number',
    category: 'environmental',
    subcategory: 'atmospheric-conditions',
    range: { min: 80, max: 110, typical: 101.3 },
    default: 101.3
  },
  {
    id: 'temperature_gradient',
    name: 'Temperature Gradient',
    description: 'Temperature variation across reactor volume',
    unit: '°C/cm',
    type: 'number',
    category: 'environmental',
    subcategory: 'atmospheric-conditions',
    range: { min: 0, max: 5, typical: 0.1 },
    default: 0.1
  },
  {
    id: 'thermal_conductivity',
    name: 'Thermal Conductivity',
    description: 'Heat transfer coefficient of reactor materials',
    unit: 'W/m·K',
    type: 'number',
    category: 'environmental',
    subcategory: 'atmospheric-conditions',
    range: { min: 0.1, max: 400, typical: 1.5 },
    default: 1.5
  },
  // Light Conditions
  {
    id: 'light_intensity',
    name: 'Light Intensity',
    description: 'Illumination intensity for photosynthetic processes',
    unit: 'μmol/m²·s',
    type: 'number',
    category: 'environmental',
    subcategory: 'light-conditions',
    range: { min: 0, max: 2000, typical: 100 },
    default: 0
  },
  {
    id: 'photoperiod',
    name: 'Photoperiod',
    description: 'Duration of light exposure per day',
    unit: 'hours',
    type: 'number',
    category: 'environmental',
    subcategory: 'light-conditions',
    range: { min: 0, max: 24, typical: 12 },
    default: 0
  },
  {
    id: 'light_wavelength',
    name: 'Light Wavelength',
    description: 'Dominant wavelength of illumination',
    unit: 'nm',
    type: 'number',
    category: 'environmental',
    subcategory: 'light-conditions',
    range: { min: 400, max: 700, typical: 550 },
    default: 550
  },
  // Vibration & Noise
  {
    id: 'vibration_frequency',
    name: 'Vibration Frequency',
    description: 'Mechanical vibration frequency affecting system',
    unit: 'Hz',
    type: 'number',
    category: 'environmental',
    subcategory: 'mechanical-conditions',
    range: { min: 0, max: 1000, typical: 0 },
    default: 0
  },
  {
    id: 'noise_level',
    name: 'Noise Level',
    description: 'Ambient noise level in operating environment',
    unit: 'dB',
    type: 'number',
    category: 'environmental',
    subcategory: 'mechanical-conditions',
    range: { min: 20, max: 120, typical: 45 },
    default: 45
  },
  // Air Quality
  {
    id: 'oxygen_concentration',
    name: 'Ambient Oxygen Concentration',
    description: 'Oxygen concentration in surrounding air',
    unit: '%',
    type: 'number',
    category: 'environmental',
    subcategory: 'air-quality',
    range: { min: 15, max: 25, typical: 21 },
    default: 21
  },
  {
    id: 'co2_concentration',
    name: 'Ambient CO₂ Concentration',
    description: 'Carbon dioxide concentration in air',
    unit: 'ppm',
    type: 'number',
    category: 'environmental',
    subcategory: 'air-quality',
    range: { min: 300, max: 5000, typical: 400 },
    default: 400
  },
  {
    id: 'air_flow_rate',
    name: 'Air Flow Rate',
    description: 'Ventilation air flow rate around system',
    unit: 'm³/h',
    type: 'number',
    category: 'environmental',
    subcategory: 'air-quality',
    range: { min: 0, max: 1000, typical: 50 },
    default: 50
  }
]

// Biological Parameters
const biologicalParameters: Parameter[] = [
  // Biofilm Properties
  {
    id: 'biofilm_thickness',
    name: 'Biofilm Thickness',
    description: 'Thickness of the microbial biofilm on the electrode surface',
    unit: 'μm',
    type: 'number',
    category: 'biological',
    subcategory: 'biofilm-properties',
    range: { min: 1, max: 500, typical: 50 },
    default: 50
  },
  {
    id: 'biofilm_density',
    name: 'Biofilm Density',
    description: 'Cell density within the biofilm matrix',
    unit: 'cells/cm³',
    type: 'number',
    category: 'biological',
    subcategory: 'biofilm-properties',
    range: { min: 1e8, max: 1e12, typical: 1e10 },
    default: 1e10
  },
  {
    id: 'biofilm_conductivity',
    name: 'Biofilm Conductivity',
    description: 'Electrical conductivity of biofilm matrix',
    unit: 'S/m',
    type: 'number',
    category: 'biological',
    subcategory: 'biofilm-properties',
    range: { min: 1e-6, max: 1e-3, typical: 1e-4 },
    default: 1e-4
  },
  {
    id: 'biofilm_porosity',
    name: 'Biofilm Porosity',
    description: 'Fraction of void space in biofilm structure',
    unit: '',
    type: 'number',
    category: 'biological',
    subcategory: 'biofilm-properties',
    range: { min: 0.1, max: 0.9, typical: 0.7 },
    default: 0.7
  },
  {
    id: 'biofilm_roughness',
    name: 'Biofilm Surface Roughness',
    description: 'Surface roughness coefficient of biofilm',
    unit: 'μm',
    type: 'number',
    category: 'biological',
    subcategory: 'biofilm-properties',
    range: { min: 0.1, max: 50, typical: 5 },
    default: 5
  },
  {
    id: 'biofilm_adhesion_strength',
    name: 'Biofilm Adhesion Strength',
    description: 'Force required to detach biofilm from electrode',
    unit: 'N/m²',
    type: 'number',
    category: 'biological',
    subcategory: 'biofilm-properties',
    range: { min: 10, max: 10000, typical: 1000 },
    default: 1000
  },
  // Microbial Selection
  {
    id: 'microbial_species',
    name: 'Microbial Species',
    description: 'Primary microbial species in the fuel cell',
    unit: '',
    type: 'select',
    category: 'biological',
    subcategory: 'microbial-selection',
    options: [
      'Geobacter sulfurreducens',
      'Shewanella oneidensis',
      'Pseudomonas aeruginosa',
      'Escherichia coli',
      'Clostridium acetobutylicum',
      'Saccharomyces cerevisiae',
      'Desulfovibrio vulgaris',
      'Rhodoferax ferrireducens',
      'Mixed consortium',
      'Anaerobic sludge',
      'Marine sediment',
      'Activated sludge'
    ],
    default: 'Geobacter sulfurreducens'
  },
  {
    id: 'inoculum_concentration',
    name: 'Inoculum Concentration',
    description: 'Initial microbial concentration for startup',
    unit: 'cells/mL',
    type: 'number',
    category: 'biological',
    subcategory: 'microbial-selection',
    range: { min: 1e4, max: 1e9, typical: 1e6 },
    default: 1e6
  },
  {
    id: 'microbial_diversity',
    name: 'Microbial Diversity Index',
    description: 'Shannon diversity index of microbial community',
    unit: '',
    type: 'number',
    category: 'biological',
    subcategory: 'microbial-selection',
    range: { min: 0, max: 5, typical: 2.5 },
    default: 2.5
  },
  {
    id: 'dominant_species_fraction',
    name: 'Dominant Species Fraction',
    description: 'Fraction of dominant microbial species',
    unit: '%',
    type: 'number',
    category: 'biological',
    subcategory: 'microbial-selection',
    range: { min: 10, max: 95, typical: 60 },
    default: 60
  },
  // Substrate Parameters
  {
    id: 'substrate_concentration',
    name: 'Substrate Concentration',
    description: 'Concentration of organic substrate in the feed',
    unit: 'mg/L',
    type: 'number',
    category: 'biological',
    subcategory: 'substrate-parameters',
    range: { min: 100, max: 10000, typical: 1000 },
    default: 1000
  },
  {
    id: 'cod_concentration',
    name: 'COD Concentration',
    description: 'Chemical oxygen demand of the substrate',
    unit: 'mg/L',
    type: 'number',
    category: 'biological',
    subcategory: 'substrate-parameters',
    range: { min: 200, max: 50000, typical: 2000 },
    default: 2000
  },
  {
    id: 'bod_concentration',
    name: 'BOD Concentration',
    description: 'Biological oxygen demand of substrate',
    unit: 'mg/L',
    type: 'number',
    category: 'biological',
    subcategory: 'substrate-parameters',
    range: { min: 100, max: 25000, typical: 1200 },
    default: 1200
  },
  {
    id: 'substrate_type',
    name: 'Substrate Type',
    description: 'Type of organic substrate used',
    unit: '',
    type: 'select',
    category: 'biological',
    subcategory: 'substrate-parameters',
    options: [
      'Acetate',
      'Glucose',
      'Lactate',
      'Propionate',
      'Butyrate',
      'Ethanol',
      'Methanol',
      'Glycerol',
      'Wastewater',
      'Food waste',
      'Agricultural waste',
      'Municipal sludge'
    ],
    default: 'Acetate'
  },
  {
    id: 'substrate_loading_rate',
    name: 'Substrate Loading Rate',
    description: 'Rate of substrate addition to reactor',
    unit: 'kg COD/m³·d',
    type: 'number',
    category: 'biological',
    subcategory: 'substrate-parameters',
    range: { min: 0.1, max: 20, typical: 2 },
    default: 2
  },
  {
    id: 'c_n_ratio',
    name: 'C/N Ratio',
    description: 'Carbon to nitrogen ratio in substrate',
    unit: '',
    type: 'number',
    category: 'biological',
    subcategory: 'substrate-parameters',
    range: { min: 5, max: 50, typical: 20 },
    default: 20
  },
  // Kinetics
  {
    id: 'growth_rate',
    name: 'Microbial Growth Rate',
    description: 'Specific growth rate of microorganisms',
    unit: 'h⁻¹',
    type: 'number',
    category: 'biological',
    subcategory: 'kinetics',
    range: { min: 0.001, max: 0.5, typical: 0.1 },
    default: 0.1
  },
  {
    id: 'substrate_utilization_rate',
    name: 'Substrate Utilization Rate',
    description: 'Rate of substrate consumption by microbes',
    unit: 'mg/L·h',
    type: 'number',
    category: 'biological',
    subcategory: 'kinetics',
    range: { min: 1, max: 1000, typical: 50 },
    default: 50
  },
  {
    id: 'electron_transfer_rate',
    name: 'Electron Transfer Rate',
    description: 'Rate of electron transfer to electrode',
    unit: 'μA/cm²',
    type: 'number',
    category: 'biological',
    subcategory: 'kinetics',
    range: { min: 0.1, max: 100, typical: 10 },
    default: 10
  },
  {
    id: 'doubling_time',
    name: 'Cell Doubling Time',
    description: 'Time required for cell population to double',
    unit: 'hours',
    type: 'number',
    category: 'biological',
    subcategory: 'kinetics',
    range: { min: 1, max: 100, typical: 12 },
    default: 12
  },
  {
    id: 'yield_coefficient',
    name: 'Biomass Yield Coefficient',
    description: 'Biomass produced per unit substrate consumed',
    unit: 'g cells/g substrate',
    type: 'number',
    category: 'biological',
    subcategory: 'kinetics',
    range: { min: 0.1, max: 1.0, typical: 0.5 },
    default: 0.5
  },
  // Metabolic Parameters
  {
    id: 'metabolic_rate',
    name: 'Metabolic Rate',
    description: 'Overall metabolic activity of microorganisms',
    unit: 'μmol O₂/mg·h',
    type: 'number',
    category: 'biological',
    subcategory: 'metabolic-parameters',
    range: { min: 0.1, max: 50, typical: 5 },
    default: 5
  },
  {
    id: 'respiration_rate',
    name: 'Cellular Respiration Rate',
    description: 'Rate of cellular respiration',
    unit: 'mg O₂/L·h',
    type: 'number',
    category: 'biological',
    subcategory: 'metabolic-parameters',
    range: { min: 1, max: 100, typical: 20 },
    default: 20
  },
  {
    id: 'atp_concentration',
    name: 'ATP Concentration',
    description: 'Intracellular ATP concentration',
    unit: 'μM',
    type: 'number',
    category: 'biological',
    subcategory: 'metabolic-parameters',
    range: { min: 1, max: 10, typical: 5 },
    default: 5
  },
  {
    id: 'enzyme_activity',
    name: 'Enzyme Activity',
    description: 'Activity of key metabolic enzymes',
    unit: 'U/mg protein',
    type: 'number',
    category: 'biological',
    subcategory: 'metabolic-parameters',
    range: { min: 0.1, max: 100, typical: 10 },
    default: 10
  }
]

// Electrical Parameters
const electricalParameters: Parameter[] = [
  // Output Performance
  {
    id: 'cell_voltage',
    name: 'Cell Voltage',
    description: 'Operating voltage of the fuel cell',
    unit: 'V',
    type: 'number',
    category: 'electrical',
    subcategory: 'output-performance',
    range: { min: 0.1, max: 1.2, typical: 0.6 },
    default: 0.6
  },
  {
    id: 'open_circuit_voltage',
    name: 'Open Circuit Voltage',
    description: 'Voltage when no current is flowing',
    unit: 'V',
    type: 'number',
    category: 'electrical',
    subcategory: 'output-performance',
    range: { min: 0.2, max: 1.1, typical: 0.8 },
    default: 0.8
  },
  {
    id: 'current_density',
    name: 'Current Density',
    description: 'Current per unit electrode area',
    unit: 'mA/cm²',
    type: 'number',
    category: 'electrical',
    subcategory: 'output-performance',
    range: { min: 0.1, max: 50, typical: 5 },
    default: 5
  },
  {
    id: 'power_density',
    name: 'Power Density',
    description: 'Power output per unit volume or area',
    unit: 'mW/cm²',
    type: 'number',
    category: 'electrical',
    subcategory: 'output-performance',
    range: { min: 0.01, max: 30, typical: 3 },
    default: 3
  },
  {
    id: 'maximum_power_density',
    name: 'Maximum Power Density',
    description: 'Peak power density achievable by the system',
    unit: 'mW/cm²',
    type: 'number',
    category: 'electrical',
    subcategory: 'output-performance',
    range: { min: 0.1, max: 100, typical: 10 },
    default: 10
  },
  {
    id: 'peak_current',
    name: 'Peak Current',
    description: 'Maximum current output of the system',
    unit: 'mA',
    type: 'number',
    category: 'electrical',
    subcategory: 'output-performance',
    range: { min: 0.1, max: 1000, typical: 50 },
    default: 50
  },
  {
    id: 'voltage_stability',
    name: 'Voltage Stability',
    description: 'Standard deviation of voltage over time',
    unit: 'mV',
    type: 'number',
    category: 'electrical',
    subcategory: 'output-performance',
    range: { min: 1, max: 100, typical: 10 },
    default: 10
  },
  {
    id: 'energy_density',
    name: 'Energy Density',
    description: 'Energy storage capacity per unit volume',
    unit: 'Wh/L',
    type: 'number',
    category: 'electrical',
    subcategory: 'output-performance',
    range: { min: 0.1, max: 50, typical: 5 },
    default: 5
  },
  // Impedance
  {
    id: 'internal_resistance',
    name: 'Internal Resistance',
    description: 'Internal resistance of the fuel cell',
    unit: 'Ω',
    type: 'number',
    category: 'electrical',
    subcategory: 'impedance',
    range: { min: 1, max: 1000, typical: 100 },
    default: 100
  },
  {
    id: 'charge_transfer_resistance',
    name: 'Charge Transfer Resistance',
    description: 'Resistance to electron transfer at electrode interface',
    unit: 'Ω·cm²',
    type: 'number',
    category: 'electrical',
    subcategory: 'impedance',
    range: { min: 0.1, max: 100, typical: 10 },
    default: 10
  },
  {
    id: 'ohmic_resistance',
    name: 'Ohmic Resistance',
    description: 'Resistance due to electrolyte and electrode materials',
    unit: 'Ω·cm²',
    type: 'number',
    category: 'electrical',
    subcategory: 'impedance',
    range: { min: 0.01, max: 10, typical: 1 },
    default: 1
  },
  {
    id: 'diffusion_resistance',
    name: 'Diffusion Resistance',
    description: 'Mass transport resistance in biofilm',
    unit: 'Ω·cm²',
    type: 'number',
    category: 'electrical',
    subcategory: 'impedance',
    range: { min: 0.1, max: 50, typical: 5 },
    default: 5
  },
  {
    id: 'capacitance',
    name: 'Double Layer Capacitance',
    description: 'Electrochemical double layer capacitance',
    unit: 'μF/cm²',
    type: 'number',
    category: 'electrical',
    subcategory: 'impedance',
    range: { min: 1, max: 1000, typical: 100 },
    default: 100
  },
  {
    id: 'impedance_magnitude',
    name: 'Impedance Magnitude',
    description: 'Total impedance magnitude at 1 Hz',
    unit: 'Ω',
    type: 'number',
    category: 'electrical',
    subcategory: 'impedance',
    range: { min: 1, max: 10000, typical: 500 },
    default: 500
  },
  // Efficiency
  {
    id: 'coulombic_efficiency',
    name: 'Coulombic Efficiency',
    description: 'Efficiency of electron capture from substrate',
    unit: '%',
    type: 'number',
    category: 'electrical',
    subcategory: 'efficiency',
    range: { min: 5, max: 95, typical: 60 },
    default: 60
  },
  {
    id: 'energy_efficiency',
    name: 'Energy Efficiency',
    description: 'Overall energy conversion efficiency',
    unit: '%',
    type: 'number',
    category: 'electrical',
    subcategory: 'efficiency',
    range: { min: 1, max: 50, typical: 15 },
    default: 15
  },
  {
    id: 'voltage_efficiency',
    name: 'Voltage Efficiency',
    description: 'Ratio of operating to theoretical voltage',
    unit: '%',
    type: 'number',
    category: 'electrical',
    subcategory: 'efficiency',
    range: { min: 10, max: 90, typical: 50 },
    default: 50
  },
  {
    id: 'faradaic_efficiency',
    name: 'Faradaic Efficiency',
    description: 'Efficiency of electrochemical reactions',
    unit: '%',
    type: 'number',
    category: 'electrical',
    subcategory: 'efficiency',
    range: { min: 20, max: 99, typical: 80 },
    default: 80
  },
  {
    id: 'power_efficiency',
    name: 'Power Efficiency',
    description: 'Electrical power output efficiency',
    unit: '%',
    type: 'number',
    category: 'electrical',
    subcategory: 'efficiency',
    range: { min: 5, max: 70, typical: 25 },
    default: 25
  },
  // Electrochemical Properties
  {
    id: 'redox_potential',
    name: 'Redox Potential',
    description: 'Standard reduction potential of electrode reactions',
    unit: 'V vs SHE',
    type: 'number',
    category: 'electrical',
    subcategory: 'electrochemical-properties',
    range: { min: -1.0, max: 1.0, typical: 0.2 },
    default: 0.2
  },
  {
    id: 'exchange_current_density',
    name: 'Exchange Current Density',
    description: 'Current density at equilibrium potential',
    unit: 'A/cm²',
    type: 'number',
    category: 'electrical',
    subcategory: 'electrochemical-properties',
    range: { min: 1e-8, max: 1e-3, typical: 1e-5 },
    default: 1e-5
  },
  {
    id: 'tafel_slope',
    name: 'Tafel Slope',
    description: 'Slope of Tafel plot for electrode kinetics',
    unit: 'mV/decade',
    type: 'number',
    category: 'electrical',
    subcategory: 'electrochemical-properties',
    range: { min: 30, max: 200, typical: 120 },
    default: 120
  },
  {
    id: 'overpotential',
    name: 'Overpotential',
    description: 'Voltage loss due to kinetic limitations',
    unit: 'mV',
    type: 'number',
    category: 'electrical',
    subcategory: 'electrochemical-properties',
    range: { min: 10, max: 500, typical: 100 },
    default: 100
  },
  {
    id: 'limiting_current',
    name: 'Limiting Current',
    description: 'Maximum current limited by mass transport',
    unit: 'mA/cm²',
    type: 'number',
    category: 'electrical',
    subcategory: 'electrochemical-properties',
    range: { min: 1, max: 100, typical: 20 },
    default: 20
  }
]

// Material Parameters
const materialParameters: Parameter[] = [
  {
    id: 'anode_material',
    name: 'Anode Material',
    description: 'Material composition of the anode electrode',
    unit: '',
    type: 'select',
    category: 'materials',
    subcategory: 'electrode-materials',
    options: [
      'Carbon cloth',
      'Carbon felt',
      'Carbon paper',
      'Graphite rod',
      'Graphite plate',
      'Carbon brush',
      'Stainless steel mesh',
      'Titanium',
      'Nickel foam'
    ],
    default: 'Carbon cloth'
  },
  {
    id: 'cathode_material',
    name: 'Cathode Material',
    description: 'Material composition of the cathode electrode',
    unit: '',
    type: 'select',
    category: 'materials',
    subcategory: 'electrode-materials',
    options: [
      'Carbon cloth with Pt',
      'Carbon cloth with Pt/C',
      'Air cathode',
      'Graphite plate',
      'Carbon felt',
      'Stainless steel',
      'Activated carbon'
    ],
    default: 'Carbon cloth with Pt'
  },
  {
    id: 'electrode_surface_area',
    name: 'Electrode Surface Area',
    description: 'Total surface area of the electrode',
    unit: 'cm²',
    type: 'number',
    category: 'materials',
    subcategory: 'electrode-geometry',
    range: { min: 1, max: 1000, typical: 25 },
    default: 25
  },
  {
    id: 'electrode_spacing',
    name: 'Electrode Spacing',
    description: 'Distance between anode and cathode',
    unit: 'cm',
    type: 'number',
    category: 'materials',
    subcategory: 'electrode-geometry',
    range: { min: 0.5, max: 50, typical: 2 },
    default: 2
  },
  {
    id: 'membrane_type',
    name: 'Membrane Type',
    description: 'Type of proton exchange membrane',
    unit: '',
    type: 'select',
    category: 'materials',
    subcategory: 'membrane-separator',
    options: [
      'Nafion 117',
      'Nafion 115',
      'PEM',
      'Ceramic membrane',
      'Ultrafiltration membrane',
      'Salt bridge',
      'None (single chamber)'
    ],
    default: 'Nafion 117'
  },
  {
    id: 'membrane_thickness',
    name: 'Membrane Thickness',
    description: 'Thickness of the separator membrane',
    unit: 'μm',
    type: 'number',
    category: 'materials',
    subcategory: 'membrane-separator',
    range: { min: 50, max: 500, typical: 183 },
    default: 183
  }
]

// Chemical Parameters
const chemicalParameters: Parameter[] = [
  {
    id: 'ph_level',
    name: 'pH Level',
    description: 'pH of the electrolyte solution',
    unit: '',
    type: 'number',
    category: 'chemical',
    subcategory: 'electrolyte-composition',
    range: { min: 4, max: 10, typical: 7 },
    default: 7
  },
  {
    id: 'conductivity',
    name: 'Electrolyte Conductivity',
    description: 'Electrical conductivity of the electrolyte',
    unit: 'mS/cm',
    type: 'number',
    category: 'chemical',
    subcategory: 'electrolyte-composition',
    range: { min: 0.1, max: 100, typical: 10 },
    default: 10
  },
  {
    id: 'buffer_concentration',
    name: 'Buffer Concentration',
    description: 'Concentration of pH buffer in solution',
    unit: 'mM',
    type: 'number',
    category: 'chemical',
    subcategory: 'electrolyte-composition',
    range: { min: 1, max: 200, typical: 50 },
    default: 50
  },
  {
    id: 'salt_concentration',
    name: 'Salt Concentration',
    description: 'Ionic strength of the electrolyte',
    unit: 'g/L',
    type: 'number',
    category: 'chemical',
    subcategory: 'electrolyte-composition',
    range: { min: 0.1, max: 50, typical: 5 },
    default: 5
  }
]

// Operational Parameters
const operationalParameters: Parameter[] = [
  {
    id: 'flow_rate',
    name: 'Flow Rate',
    description: 'Flow rate of the electrolyte',
    unit: 'mL/min',
    type: 'number',
    category: 'operational',
    subcategory: 'flow-conditions',
    range: { min: 0.1, max: 100, typical: 5 },
    default: 5
  },
  {
    id: 'hydraulic_retention_time',
    name: 'Hydraulic Retention Time',
    description: 'Average time fluid spends in the reactor',
    unit: 'hours',
    type: 'number',
    category: 'operational',
    subcategory: 'flow-conditions',
    range: { min: 0.5, max: 168, typical: 24 },
    default: 24
  },
  {
    id: 'external_load',
    name: 'External Load',
    description: 'External resistance connected to the circuit',
    unit: 'Ω',
    type: 'number',
    category: 'operational',
    subcategory: 'circuit-conditions',
    range: { min: 10, max: 10000, typical: 1000 },
    default: 1000
  },
  {
    id: 'operation_mode',
    name: 'Operation Mode',
    description: 'Mode of fuel cell operation',
    unit: '',
    type: 'select',
    category: 'operational',
    subcategory: 'control-parameters',
    options: [
      'Batch',
      'Continuous',
      'Fed-batch',
      'Recirculation'
    ],
    default: 'Continuous'
  }
]

// Physical Parameters
const physicalParameters: Parameter[] = [
  {
    id: 'reactor_volume',
    name: 'Reactor Volume',
    description: 'Total internal volume of the reactor',
    unit: 'mL',
    type: 'number',
    category: 'physical',
    subcategory: 'reactor-geometry',
    range: { min: 1, max: 10000, typical: 100 },
    default: 100
  },
  {
    id: 'chamber_configuration',
    name: 'Chamber Configuration',
    description: 'Number and arrangement of reactor chambers',
    unit: '',
    type: 'select',
    category: 'physical',
    subcategory: 'reactor-geometry',
    options: [
      'Single chamber',
      'Dual chamber',
      'Multi-chamber',
      'Stacked'
    ],
    default: 'Dual chamber'
  },
  {
    id: 'aspect_ratio',
    name: 'Aspect Ratio',
    description: 'Length to diameter ratio of the reactor',
    unit: '',
    type: 'number',
    category: 'physical',
    subcategory: 'reactor-geometry',
    range: { min: 0.5, max: 10, typical: 2 },
    default: 2
  }
]

// Parameter Categories
export const parameterCategories: ParameterCategory[] = [
  {
    id: 'environmental',
    name: 'Environmental',
    description: 'Environmental conditions and atmospheric parameters',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M8 12h8M12 8v8"/></svg>',
    color: 'emerald',
    subcategories: ['atmospheric-conditions', 'light-conditions', 'mechanical-conditions', 'air-quality']
  },
  {
    id: 'biological',
    name: 'Biological',
    description: 'Microbial activity, biofilm formation, and biological processes',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M8 8h8v8H8z"/><path d="M10 10h4v4h-4z"/></svg>',
    color: 'teal',
    subcategories: ['biofilm-properties', 'microbial-selection', 'substrate-parameters', 'kinetics', 'metabolic-parameters']
  },
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Electrical performance, output, and impedance characteristics',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    color: 'amber',
    subcategories: ['output-performance', 'impedance', 'efficiency', 'electrochemical-properties']
  },
  {
    id: 'materials',
    name: 'Materials',
    description: 'Electrode materials, membranes, and physical components',
    icon: '🔬',
    color: 'purple',
    subcategories: ['electrode-materials', 'electrode-geometry', 'membrane-separator']
  },
  {
    id: 'chemical',
    name: 'Chemical',
    description: 'Electrolyte composition, pH, and chemical properties',
    icon: '⚗️',
    color: 'red',
    subcategories: ['electrolyte-composition']
  },
  {
    id: 'operational',
    name: 'Operational',
    description: 'Operating conditions, flow parameters, and control settings',
    icon: '⚙️',
    color: 'gray',
    subcategories: ['flow-conditions', 'circuit-conditions', 'control-parameters']
  },
  {
    id: 'physical',
    name: 'Physical',
    description: 'Reactor geometry, dimensions, and structural parameters',
    icon: '📐',
    color: 'indigo',
    subcategories: ['reactor-geometry']
  }
]

// All parameters combined
const allParameters: Parameter[] = [
  ...environmentalParameters,
  ...biologicalParameters,
  ...electricalParameters,
  ...materialParameters,
  ...chemicalParameters,
  ...operationalParameters,
  ...physicalParameters
]

// Utility functions
export const getAllParameters = (): Parameter[] => {
  return allParameters
}

export const getParameterById = (id: string): Parameter | undefined => {
  return getAllParameters().find(param => param.id === id)
}

export const getParametersByCategory = (categoryId: string): Parameter[] => {
  return allParameters.filter(param => param.category === categoryId)
}

export const validateParameterValue = (parameter: Parameter, value: any): boolean => {
  switch (parameter.type) {
    case 'number':
      const numValue = Number(value)
      if (isNaN(numValue)) return false
      if (parameter.range?.min !== undefined && numValue < parameter.range.min) return false
      if (parameter.range?.max !== undefined && numValue > parameter.range.max) return false
      return true
    case 'select':
      return parameter.options ? parameter.options.includes(value) : false
    case 'boolean':
      return typeof value === 'boolean'
    case 'string':
      return typeof value === 'string' && value.length > 0
    default:
      return false
  }
}

// Additional utility functions for the UI
export const getParameterStatistics = () => {
  const allParams = getAllParameters()
  return {
    total: allParams.length,
    withUnits: allParams.filter(p => p.unit && p.unit !== '').length,
    withRanges: allParams.filter(p => p.range).length,
    byCategory: parameterCategories.map(cat => ({
      category: cat.name,
      count: allParams.filter(p => p.category === cat.id).length
    })),
    byType: {
      number: allParams.filter(p => p.type === 'number').length,
      select: allParams.filter(p => p.type === 'select').length,
      boolean: allParams.filter(p => p.type === 'boolean').length,
      string: allParams.filter(p => p.type === 'string').length
    }
  }
}

export const searchParameters = (query: string): Parameter[] => {
  const lowercaseQuery = query.toLowerCase()
  return getAllParameters().filter(param => 
    param.name.toLowerCase().includes(lowercaseQuery) ||
    param.description.toLowerCase().includes(lowercaseQuery) ||
    param.unit.toLowerCase().includes(lowercaseQuery) ||
    param.category.toLowerCase().includes(lowercaseQuery) ||
    param.subcategory.toLowerCase().includes(lowercaseQuery) ||
    (param.tags && param.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
  )
}

export const exportParametersAsJSON = (parameters?: Parameter[]): string => {
  return JSON.stringify(parameters || getAllParameters(), null, 2)
}

export const exportParametersAsCSV = (parameters?: Parameter[]): string => {
  const params = parameters || getAllParameters()
  const headers = ['Category', 'Subcategory', 'Name', 'Description', 'Unit', 'Type', 'Min', 'Max', 'Typical', 'Default']
  const rows = params.map(param => [
    param.category,
    param.subcategory,
    param.name,
    param.description,
    param.unit,
    param.type,
    param.range?.min?.toString() || '',
    param.range?.max?.toString() || '',
    param.range?.typical?.toString() || '',
    param.default?.toString() || ''
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}