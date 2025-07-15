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
  // Electrode Materials
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
      'Carbon fiber',
      'Graphite rod',
      'Graphite plate',
      'Graphite foam',
      'Carbon brush',
      'Carbon nanotubes',
      'Graphene oxide',
      'Stainless steel mesh',
      'Stainless steel 316L',
      'Titanium mesh',
      'Titanium plate',
      'Nickel foam',
      'Copper mesh',
      'Gold electrode',
      'Platinum electrode'
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
      'Carbon cloth plain',
      'Air cathode with Pt',
      'Air cathode Pt-free',
      'Graphite plate',
      'Graphite rod',
      'Carbon felt',
      'Stainless steel',
      'Activated carbon',
      'Manganese dioxide',
      'Iron-based catalyst',
      'Cobalt-based catalyst'
    ],
    default: 'Carbon cloth with Pt'
  },
  {
    id: 'catalyst_loading',
    name: 'Catalyst Loading',
    description: 'Amount of catalyst per unit electrode area',
    unit: 'mg/cm²',
    type: 'number',
    category: 'materials',
    subcategory: 'electrode-materials',
    range: { min: 0, max: 10, typical: 0.5 },
    default: 0.5
  },
  {
    id: 'surface_roughness',
    name: 'Electrode Surface Roughness',
    description: 'Surface roughness factor of electrode material',
    unit: '',
    type: 'number',
    category: 'materials',
    subcategory: 'electrode-materials',
    range: { min: 1, max: 1000, typical: 10 },
    default: 10
  },
  {
    id: 'porosity',
    name: 'Electrode Porosity',
    description: 'Void fraction in electrode material',
    unit: '%',
    type: 'number',
    category: 'materials',
    subcategory: 'electrode-materials',
    range: { min: 10, max: 95, typical: 70 },
    default: 70
  },
  {
    id: 'pore_size',
    name: 'Average Pore Size',
    description: 'Mean pore diameter in electrode material',
    unit: 'μm',
    type: 'number',
    category: 'materials',
    subcategory: 'electrode-materials',
    range: { min: 0.1, max: 100, typical: 10 },
    default: 10
  },
  {
    id: 'electrical_conductivity',
    name: 'Material Electrical Conductivity',
    description: 'Electrical conductivity of electrode material',
    unit: 'S/m',
    type: 'number',
    category: 'materials',
    subcategory: 'electrode-materials',
    range: { min: 1, max: 1e7, typical: 1e4 },
    default: 1e4
  },
  // Electrode Geometry
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
    id: 'electrode_thickness',
    name: 'Electrode Thickness',
    description: 'Thickness of the electrode material',
    unit: 'mm',
    type: 'number',
    category: 'materials',
    subcategory: 'electrode-geometry',
    range: { min: 0.1, max: 10, typical: 1 },
    default: 1
  },
  {
    id: 'electrode_diameter',
    name: 'Electrode Diameter',
    description: 'Diameter for cylindrical electrodes',
    unit: 'cm',
    type: 'number',
    category: 'materials',
    subcategory: 'electrode-geometry',
    range: { min: 0.1, max: 20, typical: 5 },
    default: 5
  },
  {
    id: 'electrode_configuration',
    name: 'Electrode Configuration',
    description: 'Physical arrangement of electrodes',
    unit: '',
    type: 'select',
    category: 'materials',
    subcategory: 'electrode-geometry',
    options: [
      'Parallel plates',
      'Concentric cylinders',
      'Rod in tube',
      'Brush electrode',
      'Mesh configuration',
      'Spiral wound',
      'Stacked plates'
    ],
    default: 'Parallel plates'
  },
  {
    id: 'specific_surface_area',
    name: 'Specific Surface Area',
    description: 'Surface area per unit mass of electrode',
    unit: 'm²/g',
    type: 'number',
    category: 'materials',
    subcategory: 'electrode-geometry',
    range: { min: 1, max: 3000, typical: 100 },
    default: 100
  },
  // Membrane & Separator
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
      'Nafion 212',
      'PEM generic',
      'Ceramic membrane',
      'Ultrafiltration membrane',
      'Microfiltration membrane',
      'Cation exchange membrane',
      'Anion exchange membrane',
      'Bipolar membrane',
      'Salt bridge',
      'Glass frit',
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
  },
  {
    id: 'membrane_conductivity',
    name: 'Membrane Proton Conductivity',
    description: 'Proton conductivity of membrane material',
    unit: 'S/cm',
    type: 'number',
    category: 'materials',
    subcategory: 'membrane-separator',
    range: { min: 1e-4, max: 1e-1, typical: 1e-2 },
    default: 1e-2
  },
  {
    id: 'membrane_water_uptake',
    name: 'Membrane Water Uptake',
    description: 'Water absorption capacity of membrane',
    unit: '%',
    type: 'number',
    category: 'materials',
    subcategory: 'membrane-separator',
    range: { min: 5, max: 50, typical: 20 },
    default: 20
  },
  {
    id: 'membrane_selectivity',
    name: 'Membrane Ion Selectivity',
    description: 'Selectivity for target ions',
    unit: '',
    type: 'number',
    category: 'materials',
    subcategory: 'membrane-separator',
    range: { min: 1, max: 1000, typical: 100 },
    default: 100
  },
  {
    id: 'membrane_pore_size',
    name: 'Membrane Pore Size',
    description: 'Average pore diameter in membrane',
    unit: 'nm',
    type: 'number',
    category: 'materials',
    subcategory: 'membrane-separator',
    range: { min: 0.1, max: 1000, typical: 10 },
    default: 10
  },
  // Structural Materials
  {
    id: 'reactor_material',
    name: 'Reactor Housing Material',
    description: 'Material of reactor container/housing',
    unit: '',
    type: 'select',
    category: 'materials',
    subcategory: 'structural-materials',
    options: [
      'Polycarbonate',
      'Acrylic (PMMA)',
      'Polypropylene',
      'PTFE',
      'PVC',
      'Glass',
      'Stainless steel',
      'Aluminum',
      'Ceramic',
      'PEEK'
    ],
    default: 'Polycarbonate'
  },
  {
    id: 'gasket_material',
    name: 'Gasket Material',
    description: 'Sealing material for reactor joints',
    unit: '',
    type: 'select',
    category: 'materials',
    subcategory: 'structural-materials',
    options: [
      'Silicone rubber',
      'Viton (FKM)',
      'EPDM rubber',
      'NBR rubber',
      'PTFE',
      'Cork',
      'Paper gasket'
    ],
    default: 'Silicone rubber'
  },
  {
    id: 'connector_material',
    name: 'Electrical Connector Material',
    description: 'Material for electrical connections',
    unit: '',
    type: 'select',
    category: 'materials',
    subcategory: 'structural-materials',
    options: [
      'Copper wire',
      'Silver wire',
      'Gold wire',
      'Titanium wire',
      'Stainless steel wire',
      'Carbon fiber',
      'Conductive epoxy'
    ],
    default: 'Copper wire'
  },
  {
    id: 'surface_treatment',
    name: 'Electrode Surface Treatment',
    description: 'Chemical or physical surface modification',
    unit: '',
    type: 'select',
    category: 'materials',
    subcategory: 'surface-properties',
    options: [
      'None',
      'Acid treatment',
      'Heat treatment',
      'Plasma treatment',
      'Chemical etching',
      'Electrochemical activation',
      'Ammonia treatment',
      'Polymer coating'
    ],
    default: 'None'
  },
  {
    id: 'surface_energy',
    name: 'Surface Energy',
    description: 'Surface energy of electrode material',
    unit: 'mJ/m²',
    type: 'number',
    category: 'materials',
    subcategory: 'surface-properties',
    range: { min: 10, max: 500, typical: 100 },
    default: 100
  },
  {
    id: 'contact_angle',
    name: 'Water Contact Angle',
    description: 'Hydrophobicity of electrode surface',
    unit: 'degrees',
    type: 'number',
    category: 'materials',
    subcategory: 'surface-properties',
    range: { min: 0, max: 180, typical: 90 },
    default: 90
  }
]

// Chemical Parameters
const chemicalParameters: Parameter[] = [
  // Electrolyte Composition
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
  },
  {
    id: 'buffer_type',
    name: 'Buffer Type',
    description: 'Type of pH buffer system used',
    unit: '',
    type: 'select',
    category: 'chemical',
    subcategory: 'electrolyte-composition',
    options: [
      'Phosphate buffer',
      'Tris buffer',
      'HEPES buffer',
      'Carbonate buffer',
      'Acetate buffer',
      'Citrate buffer',
      'No buffer'
    ],
    default: 'Phosphate buffer'
  },
  {
    id: 'ionic_strength',
    name: 'Ionic Strength',
    description: 'Total ionic strength of electrolyte',
    unit: 'M',
    type: 'number',
    category: 'chemical',
    subcategory: 'electrolyte-composition',
    range: { min: 0.001, max: 5, typical: 0.1 },
    default: 0.1
  },
  {
    id: 'dissolved_oxygen',
    name: 'Dissolved Oxygen',
    description: 'Concentration of dissolved oxygen in electrolyte',
    unit: 'mg/L',
    type: 'number',
    category: 'chemical',
    subcategory: 'electrolyte-composition',
    range: { min: 0, max: 15, typical: 8 },
    default: 8
  },
  {
    id: 'total_dissolved_solids',
    name: 'Total Dissolved Solids',
    description: 'Total concentration of dissolved substances',
    unit: 'mg/L',
    type: 'number',
    category: 'chemical',
    subcategory: 'electrolyte-composition',
    range: { min: 100, max: 50000, typical: 5000 },
    default: 5000
  },
  // Ion Concentrations
  {
    id: 'sodium_concentration',
    name: 'Sodium Ion Concentration',
    description: 'Concentration of Na+ ions in solution',
    unit: 'mM',
    type: 'number',
    category: 'chemical',
    subcategory: 'ion-concentrations',
    range: { min: 0, max: 1000, typical: 100 },
    default: 100
  },
  {
    id: 'potassium_concentration',
    name: 'Potassium Ion Concentration',
    description: 'Concentration of K+ ions in solution',
    unit: 'mM',
    type: 'number',
    category: 'chemical',
    subcategory: 'ion-concentrations',
    range: { min: 0, max: 200, typical: 10 },
    default: 10
  },
  {
    id: 'chloride_concentration',
    name: 'Chloride Ion Concentration',
    description: 'Concentration of Cl- ions in solution',
    unit: 'mM',
    type: 'number',
    category: 'chemical',
    subcategory: 'ion-concentrations',
    range: { min: 0, max: 1000, typical: 100 },
    default: 100
  },
  {
    id: 'phosphate_concentration',
    name: 'Phosphate Ion Concentration',
    description: 'Concentration of PO4³⁻ ions in solution',
    unit: 'mM',
    type: 'number',
    category: 'chemical',
    subcategory: 'ion-concentrations',
    range: { min: 0, max: 100, typical: 10 },
    default: 10
  },
  {
    id: 'sulfate_concentration',
    name: 'Sulfate Ion Concentration',
    description: 'Concentration of SO4²⁻ ions in solution',
    unit: 'mM',
    type: 'number',
    category: 'chemical',
    subcategory: 'ion-concentrations',
    range: { min: 0, max: 100, typical: 5 },
    default: 5
  },
  {
    id: 'calcium_concentration',
    name: 'Calcium Ion Concentration',
    description: 'Concentration of Ca²⁺ ions in solution',
    unit: 'mM',
    type: 'number',
    category: 'chemical',
    subcategory: 'ion-concentrations',
    range: { min: 0, max: 50, typical: 2 },
    default: 2
  },
  {
    id: 'magnesium_concentration',
    name: 'Magnesium Ion Concentration',
    description: 'Concentration of Mg²⁺ ions in solution',
    unit: 'mM',
    type: 'number',
    category: 'chemical',
    subcategory: 'ion-concentrations',
    range: { min: 0, max: 30, typical: 1 },
    default: 1
  },
  // Chemical Properties
  {
    id: 'oxidation_reduction_potential',
    name: 'Oxidation-Reduction Potential',
    description: 'ORP of the electrolyte solution',
    unit: 'mV vs SHE',
    type: 'number',
    category: 'chemical',
    subcategory: 'chemical-properties',
    range: { min: -500, max: 500, typical: 0 },
    default: 0
  },
  {
    id: 'chemical_stability',
    name: 'Chemical Stability',
    description: 'Stability of electrolyte composition over time',
    unit: 'days',
    type: 'number',
    category: 'chemical',
    subcategory: 'chemical-properties',
    range: { min: 1, max: 365, typical: 30 },
    default: 30
  },
  {
    id: 'corrosivity',
    name: 'Corrosivity Index',
    description: 'Corrosive potential of electrolyte',
    unit: '',
    type: 'number',
    category: 'chemical',
    subcategory: 'chemical-properties',
    range: { min: 0, max: 10, typical: 3 },
    default: 3
  },
  {
    id: 'viscosity',
    name: 'Dynamic Viscosity',
    description: 'Viscosity of the electrolyte solution',
    unit: 'cP',
    type: 'number',
    category: 'chemical',
    subcategory: 'chemical-properties',
    range: { min: 0.5, max: 10, typical: 1 },
    default: 1
  },
  {
    id: 'surface_tension',
    name: 'Surface Tension',
    description: 'Surface tension of electrolyte solution',
    unit: 'mN/m',
    type: 'number',
    category: 'chemical',
    subcategory: 'chemical-properties',
    range: { min: 20, max: 80, typical: 72 },
    default: 72
  }
]

// Operational Parameters
const operationalParameters: Parameter[] = [
  // Flow Conditions
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
    id: 'flow_velocity',
    name: 'Flow Velocity',
    description: 'Linear velocity of fluid through reactor',
    unit: 'cm/s',
    type: 'number',
    category: 'operational',
    subcategory: 'flow-conditions',
    range: { min: 0.01, max: 10, typical: 0.1 },
    default: 0.1
  },
  {
    id: 'reynolds_number',
    name: 'Reynolds Number',
    description: 'Dimensionless flow regime indicator',
    unit: '',
    type: 'number',
    category: 'operational',
    subcategory: 'flow-conditions',
    range: { min: 1, max: 10000, typical: 100 },
    default: 100
  },
  {
    id: 'mixing_intensity',
    name: 'Mixing Intensity',
    description: 'Degree of mixing in reactor',
    unit: 'rpm',
    type: 'number',
    category: 'operational',
    subcategory: 'flow-conditions',
    range: { min: 0, max: 500, typical: 100 },
    default: 0
  },
  {
    id: 'recirculation_ratio',
    name: 'Recirculation Ratio',
    description: 'Ratio of recirculated to fresh feed',
    unit: '',
    type: 'number',
    category: 'operational',
    subcategory: 'flow-conditions',
    range: { min: 0, max: 10, typical: 1 },
    default: 0
  },
  // Circuit Conditions
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
    id: 'circuit_configuration',
    name: 'Circuit Configuration',
    description: 'Electrical circuit arrangement',
    unit: '',
    type: 'select',
    category: 'operational',
    subcategory: 'circuit-conditions',
    options: [
      'Single cell',
      'Series connection',
      'Parallel connection',
      'Series-parallel hybrid',
      'Switched array'
    ],
    default: 'Single cell'
  },
  {
    id: 'load_variation',
    name: 'Load Variation Pattern',
    description: 'Pattern of external load changes',
    unit: '',
    type: 'select',
    category: 'operational',
    subcategory: 'circuit-conditions',
    options: [
      'Constant load',
      'Stepped load',
      'Ramped load',
      'Cyclic load',
      'Random load'
    ],
    default: 'Constant load'
  },
  {
    id: 'switching_frequency',
    name: 'Load Switching Frequency',
    description: 'Frequency of load changes',
    unit: 'Hz',
    type: 'number',
    category: 'operational',
    subcategory: 'circuit-conditions',
    range: { min: 0, max: 1000, typical: 0 },
    default: 0
  },
  // Control Parameters
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
      'Recirculation',
      'Semi-continuous',
      'Sequencing batch'
    ],
    default: 'Continuous'
  },
  {
    id: 'control_strategy',
    name: 'Control Strategy',
    description: 'Method of system control',
    unit: '',
    type: 'select',
    category: 'operational',
    subcategory: 'control-parameters',
    options: [
      'Manual control',
      'Feedback control',
      'Feedforward control',
      'PID control',
      'Adaptive control',
      'Model predictive control'
    ],
    default: 'Manual control'
  },
  {
    id: 'sampling_frequency',
    name: 'Data Sampling Frequency',
    description: 'Frequency of data collection',
    unit: 'Hz',
    type: 'number',
    category: 'operational',
    subcategory: 'control-parameters',
    range: { min: 0.001, max: 100, typical: 0.1 },
    default: 0.1
  },
  {
    id: 'startup_time',
    name: 'System Startup Time',
    description: 'Time required for system initialization',
    unit: 'hours',
    type: 'number',
    category: 'operational',
    subcategory: 'control-parameters',
    range: { min: 1, max: 720, typical: 48 },
    default: 48
  },
  {
    id: 'shutdown_procedure',
    name: 'Shutdown Procedure',
    description: 'Method for system shutdown',
    unit: '',
    type: 'select',
    category: 'operational',
    subcategory: 'control-parameters',
    options: [
      'Immediate stop',
      'Gradual reduction',
      'Feed depletion',
      'Controlled drainage',
      'Emergency stop'
    ],
    default: 'Gradual reduction'
  },
  // Maintenance Parameters
  {
    id: 'cleaning_frequency',
    name: 'Cleaning Frequency',
    description: 'How often system is cleaned',
    unit: 'days',
    type: 'number',
    category: 'operational',
    subcategory: 'maintenance-parameters',
    range: { min: 1, max: 365, typical: 30 },
    default: 30
  },
  {
    id: 'electrode_replacement_interval',
    name: 'Electrode Replacement Interval',
    description: 'Time between electrode replacements',
    unit: 'months',
    type: 'number',
    category: 'operational',
    subcategory: 'maintenance-parameters',
    range: { min: 1, max: 60, typical: 12 },
    default: 12
  },
  {
    id: 'membrane_replacement_interval',
    name: 'Membrane Replacement Interval',
    description: 'Time between membrane replacements',
    unit: 'months',
    type: 'number',
    category: 'operational',
    subcategory: 'maintenance-parameters',
    range: { min: 3, max: 120, typical: 24 },
    default: 24
  },
  {
    id: 'calibration_frequency',
    name: 'Sensor Calibration Frequency',
    description: 'How often sensors are calibrated',
    unit: 'days',
    type: 'number',
    category: 'operational',
    subcategory: 'maintenance-parameters',
    range: { min: 1, max: 90, typical: 7 },
    default: 7
  }
]

// Physical Parameters
const physicalParameters: Parameter[] = [
  // Reactor Geometry
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
      'Triple chamber',
      'Multi-chamber',
      'Stacked configuration',
      'Tubular reactor',
      'Upflow reactor'
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
  },
  {
    id: 'reactor_length',
    name: 'Reactor Length',
    description: 'Internal length dimension of reactor',
    unit: 'cm',
    type: 'number',
    category: 'physical',
    subcategory: 'reactor-geometry',
    range: { min: 1, max: 100, typical: 10 },
    default: 10
  },
  {
    id: 'reactor_width',
    name: 'Reactor Width',
    description: 'Internal width dimension of reactor',
    unit: 'cm',
    type: 'number',
    category: 'physical',
    subcategory: 'reactor-geometry',
    range: { min: 1, max: 50, typical: 5 },
    default: 5
  },
  {
    id: 'reactor_height',
    name: 'Reactor Height',
    description: 'Internal height dimension of reactor',
    unit: 'cm',
    type: 'number',
    category: 'physical',
    subcategory: 'reactor-geometry',
    range: { min: 1, max: 50, typical: 5 },
    default: 5
  },
  {
    id: 'wall_thickness',
    name: 'Reactor Wall Thickness',
    description: 'Thickness of reactor walls',
    unit: 'mm',
    type: 'number',
    category: 'physical',
    subcategory: 'reactor-geometry',
    range: { min: 1, max: 50, typical: 5 },
    default: 5
  },
  {
    id: 'surface_area_to_volume',
    name: 'Surface Area to Volume Ratio',
    description: 'Ratio of reactor surface area to volume',
    unit: 'cm⁻¹',
    type: 'number',
    category: 'physical',
    subcategory: 'reactor-geometry',
    range: { min: 0.1, max: 10, typical: 2 },
    default: 2
  },
  // Thermal Properties
  {
    id: 'thermal_mass',
    name: 'Thermal Mass',
    description: 'Heat capacity of reactor system',
    unit: 'J/K',
    type: 'number',
    category: 'physical',
    subcategory: 'thermal-properties',
    range: { min: 100, max: 10000, typical: 1000 },
    default: 1000
  },
  {
    id: 'insulation_factor',
    name: 'Thermal Insulation Factor',
    description: 'Heat retention capability',
    unit: '',
    type: 'number',
    category: 'physical',
    subcategory: 'thermal-properties',
    range: { min: 0.1, max: 10, typical: 1 },
    default: 1
  },
  {
    id: 'heat_transfer_coefficient',
    name: 'Heat Transfer Coefficient',
    description: 'Overall heat transfer coefficient',
    unit: 'W/m²·K',
    type: 'number',
    category: 'physical',
    subcategory: 'thermal-properties',
    range: { min: 1, max: 1000, typical: 100 },
    default: 100
  },
  // Mechanical Properties
  {
    id: 'system_weight',
    name: 'Total System Weight',
    description: 'Total weight of reactor system',
    unit: 'kg',
    type: 'number',
    category: 'physical',
    subcategory: 'mechanical-properties',
    range: { min: 0.1, max: 1000, typical: 10 },
    default: 10
  },
  {
    id: 'pressure_rating',
    name: 'Maximum Pressure Rating',
    description: 'Maximum allowable operating pressure',
    unit: 'bar',
    type: 'number',
    category: 'physical',
    subcategory: 'mechanical-properties',
    range: { min: 1, max: 100, typical: 5 },
    default: 5
  },
  {
    id: 'structural_integrity',
    name: 'Structural Integrity Factor',
    description: 'Mechanical stability rating',
    unit: '',
    type: 'number',
    category: 'physical',
    subcategory: 'mechanical-properties',
    range: { min: 1, max: 10, typical: 8 },
    default: 8
  }
]

// Performance Monitoring Parameters
const monitoringParameters: Parameter[] = [
  // Real-time Monitoring
  {
    id: 'voltage_monitoring_interval',
    name: 'Voltage Monitoring Interval',
    description: 'Frequency of voltage measurements',
    unit: 'seconds',
    type: 'number',
    category: 'monitoring',
    subcategory: 'real-time-monitoring',
    range: { min: 1, max: 3600, typical: 60 },
    default: 60
  },
  {
    id: 'current_monitoring_interval',
    name: 'Current Monitoring Interval',
    description: 'Frequency of current measurements',
    unit: 'seconds',
    type: 'number',
    category: 'monitoring',
    subcategory: 'real-time-monitoring',
    range: { min: 1, max: 3600, typical: 60 },
    default: 60
  },
  {
    id: 'temperature_monitoring_interval',
    name: 'Temperature Monitoring Interval',
    description: 'Frequency of temperature measurements',
    unit: 'seconds',
    type: 'number',
    category: 'monitoring',
    subcategory: 'real-time-monitoring',
    range: { min: 10, max: 3600, typical: 300 },
    default: 300
  },
  {
    id: 'ph_monitoring_interval',
    name: 'pH Monitoring Interval',
    description: 'Frequency of pH measurements',
    unit: 'minutes',
    type: 'number',
    category: 'monitoring',
    subcategory: 'real-time-monitoring',
    range: { min: 1, max: 1440, typical: 60 },
    default: 60
  },
  // Data Logging
  {
    id: 'data_storage_capacity',
    name: 'Data Storage Capacity',
    description: 'Amount of data that can be stored',
    unit: 'MB',
    type: 'number',
    category: 'monitoring',
    subcategory: 'data-logging',
    range: { min: 1, max: 10000, typical: 1000 },
    default: 1000
  },
  {
    id: 'data_backup_frequency',
    name: 'Data Backup Frequency',
    description: 'How often data is backed up',
    unit: 'hours',
    type: 'number',
    category: 'monitoring',
    subcategory: 'data-logging',
    range: { min: 1, max: 168, typical: 24 },
    default: 24
  },
  {
    id: 'alarm_threshold_voltage',
    name: 'Voltage Alarm Threshold',
    description: 'Voltage level that triggers alarm',
    unit: 'V',
    type: 'number',
    category: 'monitoring',
    subcategory: 'alarm-settings',
    range: { min: 0.1, max: 1.5, typical: 0.3 },
    default: 0.3
  },
  {
    id: 'alarm_threshold_temperature',
    name: 'Temperature Alarm Threshold',
    description: 'Temperature that triggers alarm',
    unit: '°C',
    type: 'number',
    category: 'monitoring',
    subcategory: 'alarm-settings',
    range: { min: 40, max: 100, typical: 60 },
    default: 60
  }
]

// Safety Parameters
const safetyParameters: Parameter[] = [
  // Safety Limits
  {
    id: 'maximum_operating_temperature',
    name: 'Maximum Operating Temperature',
    description: 'Safety limit for operating temperature',
    unit: '°C',
    type: 'number',
    category: 'safety',
    subcategory: 'safety-limits',
    range: { min: 40, max: 120, typical: 80 },
    default: 80
  },
  {
    id: 'maximum_operating_pressure',
    name: 'Maximum Operating Pressure',
    description: 'Safety limit for operating pressure',
    unit: 'bar',
    type: 'number',
    category: 'safety',
    subcategory: 'safety-limits',
    range: { min: 1, max: 50, typical: 10 },
    default: 10
  },
  {
    id: 'gas_detection_threshold',
    name: 'Gas Detection Threshold',
    description: 'Concentration threshold for gas detection',
    unit: 'ppm',
    type: 'number',
    category: 'safety',
    subcategory: 'safety-limits',
    range: { min: 1, max: 10000, typical: 100 },
    default: 100
  },
  {
    id: 'emergency_shutdown_time',
    name: 'Emergency Shutdown Time',
    description: 'Time to complete emergency shutdown',
    unit: 'seconds',
    type: 'number',
    category: 'safety',
    subcategory: 'emergency-procedures',
    range: { min: 1, max: 300, typical: 30 },
    default: 30
  },
  {
    id: 'safety_interlock_status',
    name: 'Safety Interlock Status',
    description: 'Status of safety interlock systems',
    unit: '',
    type: 'select',
    category: 'safety',
    subcategory: 'safety-systems',
    options: [
      'Active',
      'Inactive',
      'Bypass mode',
      'Maintenance mode'
    ],
    default: 'Active'
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
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/><path d="M12 3v18"/><path d="M3 12h18"/></svg>',
    color: 'violet',
    subcategories: ['electrode-materials', 'electrode-geometry', 'membrane-separator', 'structural-materials', 'surface-properties']
  },
  {
    id: 'chemical',
    name: 'Chemical',
    description: 'Electrolyte composition, pH, and chemical properties',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2v2.5A2.5 2.5 0 0 0 11.5 7h1A2.5 2.5 0 0 0 15 4.5V2"/><path d="M9 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2"/><path d="m12 12 2 2-2 2-2-2 2-2z"/></svg>',
    color: 'rose',
    subcategories: ['electrolyte-composition', 'ion-concentrations', 'chemical-properties']
  },
  {
    id: 'operational',
    name: 'Operational',
    description: 'Operating conditions, flow parameters, and control settings',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    color: 'slate',
    subcategories: ['flow-conditions', 'circuit-conditions', 'control-parameters', 'maintenance-parameters']
  },
  {
    id: 'physical',
    name: 'Physical',
    description: 'Reactor geometry, dimensions, and structural parameters',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    color: 'indigo',
    subcategories: ['reactor-geometry', 'thermal-properties', 'mechanical-properties']
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    description: 'Data acquisition, logging, and real-time monitoring parameters',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 0-8-3-8-8s3-8 8-8 8 3 8 8-3 8-8 8z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/><path d="M17 7l2 2-2 2"/></svg>',
    color: 'cyan',
    subcategories: ['real-time-monitoring', 'data-logging', 'alarm-settings']
  },
  {
    id: 'safety',
    name: 'Safety',
    description: 'Safety limits, emergency procedures, and protection systems',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
    color: 'red',
    subcategories: ['safety-limits', 'emergency-procedures', 'safety-systems']
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
  ...physicalParameters,
  ...monitoringParameters,
  ...safetyParameters
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