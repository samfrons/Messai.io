import { z } from 'zod';

declare const SystemTypeSchema: z.ZodEnum<["MFC", "MEC", "MDC", "MES"]>;
type SystemType = z.infer<typeof SystemTypeSchema>;
declare const MESSSystemSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["MFC", "MEC", "MDC", "MES"]>;
    volume: z.ZodNumber;
    electrodeArea: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "MFC" | "MEC" | "MDC" | "MES";
    id: string;
    name: string;
    volume: number;
    electrodeArea: number;
}, {
    type: "MFC" | "MEC" | "MDC" | "MES";
    id: string;
    name: string;
    volume: number;
    electrodeArea: number;
}>;
type MESSSystem = z.infer<typeof MESSSystemSchema>;
declare const PerformanceMetricsSchema: z.ZodObject<{
    powerDensity: z.ZodNumber;
    currentDensity: z.ZodNumber;
    voltage: z.ZodNumber;
    efficiency: z.ZodObject<{
        coulombic: z.ZodNumber;
        energy: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        coulombic: number;
        energy: number;
    }, {
        coulombic: number;
        energy: number;
    }>;
}, "strip", z.ZodTypeAny, {
    powerDensity: number;
    currentDensity: number;
    voltage: number;
    efficiency: {
        coulombic: number;
        energy: number;
    };
}, {
    powerDensity: number;
    currentDensity: number;
    voltage: number;
    efficiency: {
        coulombic: number;
        energy: number;
    };
}>;
type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
declare const OperatingConditionsSchema: z.ZodObject<{
    temperature: z.ZodNumber;
    pH: z.ZodNumber;
    substrateConcentration: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    temperature: number;
    pH: number;
    substrateConcentration: number;
}, {
    temperature: number;
    pH: number;
    substrateConcentration: number;
}>;
type OperatingConditions = z.infer<typeof OperatingConditionsSchema>;
declare const MaterialSpecSchema: z.ZodObject<{
    anode: z.ZodString;
    cathode: z.ZodString;
    membrane: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    anode: string;
    cathode: string;
    membrane?: string | undefined;
}, {
    anode: string;
    cathode: string;
    membrane?: string | undefined;
}>;
type MaterialSpec = z.infer<typeof MaterialSpecSchema>;
declare const BaseUserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    createdAt: Date;
}, {
    id: string;
    email: string;
    createdAt: Date;
}>;
type BaseUser = z.infer<typeof BaseUserSchema>;

/**
 * Convert Celsius to Kelvin
 */
declare const celsiusToKelvin: (celsius: number) => number;
/**
 * Convert Kelvin to Celsius
 */
declare const kelvinToCelsius: (kelvin: number) => number;
/**
 * Calculate pH from hydrogen ion concentration
 */
declare const concentrationToPH: (hConcentration: number) => number;
/**
 * Calculate hydrogen ion concentration from pH
 */
declare const pHToConcentration: (pH: number) => number;
/**
 * Format scientific values with appropriate precision
 */
declare const formatScientific: (value: number, precision?: number) => string;
/**
 * Validate email format
 */
declare const validateEmail: (email: string) => boolean;
/**
 * Generate unique identifier
 */
declare const generateId: () => string;
/**
 * Clamp value between min and max
 */
declare const clamp: (value: number, min: number, max: number) => number;
/**
 * Linear interpolation
 */
declare const lerp: (start: number, end: number, factor: number) => number;

/**
 * Basic power prediction using simplified bioelectrochemical models
 */
declare class PowerPredictor {
    /**
     * Apply Arrhenius correction for temperature effects
     */
    private applyTemperatureCorrection;
    /**
     * Calculate pH effect using bell curve around optimal pH
     */
    private calculatePHEffect;
    /**
     * Apply Monod kinetics for substrate limitation
     */
    private applySubstrateKinetics;
    /**
     * Predict basic performance metrics
     */
    predict(conditions: OperatingConditions, systemType?: 'MFC' | 'MEC' | 'MDC' | 'MES'): PerformanceMetrics;
}

/**
 * Electrode material database
 */
interface ElectrodeMaterial {
    id: string;
    name: string;
    category: 'carbon' | 'metal' | 'nanomaterial' | 'composite';
    properties: {
        conductivity: number;
        surfaceArea: number;
        porosity: number;
        cost: number;
    };
    applications: string[];
}
declare const ELECTRODE_MATERIALS: ElectrodeMaterial[];
/**
 * Microbial species database
 */
interface MicrobialSpecies {
    id: string;
    species: string;
    genus: string;
    characteristics: {
        electronTransfer: 'direct' | 'mediated' | 'both';
        optimalTemp: number;
        optimalPH: number;
        growthRate: number;
        powerDensity: number;
    };
    cultivation: {
        medium: string;
        atmosphere: 'aerobic' | 'anaerobic' | 'facultative';
    };
}
declare const MICROBIAL_SPECIES: MicrobialSpecies[];
/**
 * System design templates
 */
interface SystemDesign {
    id: string;
    name: string;
    type: 'MFC' | 'MEC' | 'MDC' | 'MES';
    description: string;
    typicalApplications: string[];
    performanceRange: {
        powerDensity: [number, number];
        efficiency: [number, number];
    };
}
declare const SYSTEM_DESIGNS: SystemDesign[];

declare const SCIENTIFIC_CONSTANTS: {
    readonly FARADAY_CONSTANT: 96485;
    readonly GAS_CONSTANT: 8.314;
    readonly STANDARD_TEMP: 298.15;
    readonly STANDARD_PRESSURE: 101325;
};

export { type BaseUser, BaseUserSchema, ELECTRODE_MATERIALS, type ElectrodeMaterial, type MESSSystem, MESSSystemSchema, MICROBIAL_SPECIES, type MaterialSpec, MaterialSpecSchema, type MicrobialSpecies, type OperatingConditions, OperatingConditionsSchema, type PerformanceMetrics, PerformanceMetricsSchema, PowerPredictor, SCIENTIFIC_CONSTANTS, SYSTEM_DESIGNS, type SystemDesign, type SystemType, SystemTypeSchema, celsiusToKelvin, clamp, concentrationToPH, formatScientific, generateId, kelvinToCelsius, lerp, pHToConcentration, validateEmail };
