// src/types/index.ts
import { z } from "zod";
var SystemTypeSchema = z.enum(["MFC", "MEC", "MDC", "MES"]);
var MESSSystemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: SystemTypeSchema,
  volume: z.number().positive(),
  // L
  electrodeArea: z.number().positive()
  // m²
});
var PerformanceMetricsSchema = z.object({
  powerDensity: z.number().nonnegative(),
  // mW/m²
  currentDensity: z.number().nonnegative(),
  // mA/cm²
  voltage: z.number().nonnegative(),
  // V
  efficiency: z.object({
    coulombic: z.number().min(0).max(100),
    // %
    energy: z.number().min(0).max(100)
    // %
  })
});
var OperatingConditionsSchema = z.object({
  temperature: z.number().min(0).max(100),
  // °C
  pH: z.number().min(0).max(14),
  substrateConcentration: z.number().nonnegative()
  // g/L
});
var MaterialSpecSchema = z.object({
  anode: z.string(),
  cathode: z.string(),
  membrane: z.string().optional()
});
var BaseUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.date()
});

// src/utils/index.ts
var celsiusToKelvin = (celsius) => celsius + 273.15;
var kelvinToCelsius = (kelvin) => kelvin - 273.15;
var concentrationToPH = (hConcentration) => -Math.log10(hConcentration);
var pHToConcentration = (pH) => Math.pow(10, -pH);
var formatScientific = (value, precision = 3) => {
  if (value === 0) return "0";
  const absValue = Math.abs(value);
  if (absValue >= 1e3 || absValue < 1e-3) {
    return value.toExponential(precision);
  }
  return value.toPrecision(precision);
};
var validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
var generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};
var clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};
var lerp = (start, end, factor) => {
  return start + (end - start) * factor;
};

// src/predictions/index.ts
var PowerPredictor = class {
  /**
   * Apply Arrhenius correction for temperature effects
   */
  applyTemperatureCorrection(baseRate, temperature) {
    const activationEnergy = 35e3;
    const tempKelvin = celsiusToKelvin(temperature);
    const referenceTemp = celsiusToKelvin(25);
    const factor = Math.exp(
      activationEnergy / SCIENTIFIC_CONSTANTS.GAS_CONSTANT * (1 / referenceTemp - 1 / tempKelvin)
    );
    return baseRate * factor;
  }
  /**
   * Calculate pH effect using bell curve around optimal pH
   */
  calculatePHEffect(pH, optimalPH = 7) {
    const tolerance = 1.5;
    const deviation = Math.abs(pH - optimalPH);
    if (deviation > tolerance * 2) return 0.1;
    return Math.exp(-Math.pow(deviation / tolerance, 2));
  }
  /**
   * Apply Monod kinetics for substrate limitation
   */
  applySubstrateKinetics(concentration) {
    const maxRate = 1;
    const halfSaturation = 0.5;
    return maxRate * concentration / (halfSaturation + concentration);
  }
  /**
   * Predict basic performance metrics
   */
  predict(conditions, systemType = "MFC") {
    const basePowerDensity = {
      MFC: 100,
      MEC: 150,
      MDC: 80,
      MES: 120
    };
    const basePower = basePowerDensity[systemType];
    const tempFactor = this.applyTemperatureCorrection(1, conditions.temperature);
    const pHFactor = this.calculatePHEffect(conditions.pH);
    const substrateFactor = this.applySubstrateKinetics(conditions.substrateConcentration);
    const correctedPower = basePower * tempFactor * pHFactor * substrateFactor;
    const currentDensity = correctedPower / 0.3;
    const coulombicEfficiency = clamp(60 + pHFactor * 30, 10, 95);
    const energyEfficiency = clamp(coulombicEfficiency * 0.8, 5, 80);
    return {
      powerDensity: Math.max(0, correctedPower),
      currentDensity: Math.max(0, currentDensity),
      voltage: clamp(0.1 + pHFactor * 0.5, 0.05, 0.8),
      efficiency: {
        coulombic: coulombicEfficiency,
        energy: energyEfficiency
      }
    };
  }
};

// src/domains/index.ts
var ELECTRODE_MATERIALS = [
  {
    id: "carbon_cloth",
    name: "Carbon Cloth",
    category: "carbon",
    properties: {
      conductivity: 1e3,
      surfaceArea: 0.5,
      porosity: 75,
      cost: 50
    },
    applications: ["MFC", "MEC", "MDC"]
  },
  {
    id: "graphite_felt",
    name: "Graphite Felt",
    category: "carbon",
    properties: {
      conductivity: 800,
      surfaceArea: 0.3,
      porosity: 85,
      cost: 30
    },
    applications: ["MFC", "MEC"]
  },
  {
    id: "stainless_steel",
    name: "Stainless Steel",
    category: "metal",
    properties: {
      conductivity: 1500,
      surfaceArea: 0.1,
      porosity: 0,
      cost: 20
    },
    applications: ["MEC", "MDC"]
  }
];
var MICROBIAL_SPECIES = [
  {
    id: "geobacter_sulfurreducens",
    species: "sulfurreducens",
    genus: "Geobacter",
    characteristics: {
      electronTransfer: "direct",
      optimalTemp: 30,
      optimalPH: 7,
      growthRate: 0.15,
      powerDensity: 200
    },
    cultivation: {
      medium: "acetate",
      atmosphere: "anaerobic"
    }
  },
  {
    id: "shewanella_oneidensis",
    species: "oneidensis",
    genus: "Shewanella",
    characteristics: {
      electronTransfer: "both",
      optimalTemp: 25,
      optimalPH: 7.2,
      growthRate: 0.25,
      powerDensity: 150
    },
    cultivation: {
      medium: "lactate",
      atmosphere: "facultative"
    }
  }
];
var SYSTEM_DESIGNS = [
  {
    id: "single_chamber_mfc",
    name: "Single Chamber MFC",
    type: "MFC",
    description: "Air cathode microbial fuel cell with single chamber design",
    typicalApplications: ["Wastewater treatment", "Biosensors", "Remote power"],
    performanceRange: {
      powerDensity: [10, 500],
      efficiency: [10, 60]
    }
  },
  {
    id: "dual_chamber_mfc",
    name: "Dual Chamber MFC",
    type: "MFC",
    description: "Two chamber design with proton exchange membrane",
    typicalApplications: ["Research", "Water treatment", "Desalination"],
    performanceRange: {
      powerDensity: [50, 1e3],
      efficiency: [20, 80]
    }
  }
];

// src/index.ts
var SCIENTIFIC_CONSTANTS = {
  FARADAY_CONSTANT: 96485,
  // C/mol
  GAS_CONSTANT: 8.314,
  // J/(mol·K)
  STANDARD_TEMP: 298.15,
  // K (25°C)
  STANDARD_PRESSURE: 101325
  // Pa
};
export {
  BaseUserSchema,
  ELECTRODE_MATERIALS,
  MESSSystemSchema,
  MICROBIAL_SPECIES,
  MaterialSpecSchema,
  OperatingConditionsSchema,
  PerformanceMetricsSchema,
  PowerPredictor,
  SCIENTIFIC_CONSTANTS,
  SYSTEM_DESIGNS,
  SystemTypeSchema,
  celsiusToKelvin,
  clamp,
  concentrationToPH,
  formatScientific,
  generateId,
  kelvinToCelsius,
  lerp,
  pHToConcentration,
  validateEmail
};
//# sourceMappingURL=index.mjs.map