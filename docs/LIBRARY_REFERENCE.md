# MESSAI Library Reference

This document provides comprehensive documentation for all 12 library files created to support the MESSAI platform functionality. Each library is fully implemented with complete TypeScript interfaces, functions, and utilities.

## Table of Contents

- [Core Libraries](#core-libraries)
- [Authentication & Security](#authentication--security)  
- [Scientific Computing](#scientific-computing)
- [Research & Academic](#research--academic)
- [Type Definitions](#type-definitions)
- [Usage Examples](#usage-examples)
- [Integration Guide](#integration-guide)

## Core Libraries

### 1. Demo Mode Utilities

**File**: `apps/web/src/lib/demo-mode.ts`

**Purpose**: Provides demo mode functionality with state management, mock data generation, and user experience utilities.

#### Key Features
- Demo mode state management with persistence
- Mock data generation for development and demonstrations
- User preference handling
- Demo mode indicators and overlays

#### Key Functions

```typescript
// Toggle demo mode on/off
function toggleDemoMode(): boolean

// Check if currently in demo mode  
function isDemoMode(): boolean

// Generate mock experiment data
function generateMockExperiment(): ExperimentData

// Get demo-specific UI messages
function getDemoMessages(): DemoMessages
```

#### Usage Example
```typescript
import { toggleDemoMode, isDemoMode, generateMockExperiment } from '@/lib/demo-mode';

// Check demo mode status
if (isDemoMode()) {
  const mockData = generateMockExperiment();
  // Use mock data for UI
}

// Toggle demo mode
const isEnabled = toggleDemoMode();
```

### 2. Database Connection Utilities

**File**: `apps/web/src/lib/db.ts`

**Purpose**: Centralized database connection management, query utilities, and error handling for the MESSAI platform.

#### Key Features
- Prisma client initialization and management
- Connection pooling configuration
- Query helpers and utilities
- Transaction management
- Error handling and logging

#### Key Functions

```typescript
// Get configured database client
function getDbClient(): PrismaClient

// Execute query with error handling
async function safeQuery<T>(query: () => Promise<T>): Promise<T | null>

// Transaction wrapper
async function withTransaction<T>(fn: (tx: PrismaTransactionClient) => Promise<T>): Promise<T>

// Health check for database connection
async function checkDbHealth(): Promise<boolean>
```

#### Usage Example
```typescript
import { getDbClient, safeQuery, withTransaction } from '@/lib/db';

const db = getDbClient();

// Safe query execution
const experiments = await safeQuery(() => 
  db.experiment.findMany({ where: { userId: userId } })
);

// Transaction example
await withTransaction(async (tx) => {
  await tx.experiment.create({ data: experimentData });
  await tx.result.createMany({ data: resultsData });
});
```

### 3. Advanced Database Utilities

**File**: `apps/web/src/lib/database-utils.ts`

**Purpose**: Advanced database operations, query builders, data validation, and performance optimization utilities.

#### Key Features
- Dynamic query building
- Data validation and sanitization
- Batch operations for performance
- Database migration helpers
- Performance monitoring and optimization

#### Key Functions

```typescript
// Build dynamic queries with filters
function buildQuery(filters: QueryFilters): QueryBuilder

// Batch insert operations
async function batchInsert<T>(table: string, data: T[]): Promise<number>

// Data validation before database operations
function validateExperimentData(data: ExperimentData): ValidationResult

// Performance metrics collection
async function collectQueryMetrics<T>(query: () => Promise<T>): Promise<QueryResult<T>>
```

#### Usage Example
```typescript
import { buildQuery, batchInsert, validateExperimentData } from '@/lib/database-utils';

// Dynamic query building
const query = buildQuery({
  filters: { status: 'active', type: 'MFC' },
  sort: { field: 'createdAt', order: 'desc' },
  pagination: { page: 1, limit: 10 }
});

// Batch operations
const insertCount = await batchInsert('experiments', experimentArray);

// Data validation
const validation = validateExperimentData(newExperiment);
if (validation.isValid) {
  // Proceed with database operation
}
```

## Authentication & Security

### 4. NextAuth Configuration

**File**: `apps/web/src/lib/auth/auth-options.ts`

**Purpose**: Complete NextAuth.js configuration with OAuth providers, session management, and user profile handling.

#### Key Features
- Google OAuth integration
- GitHub OAuth integration  
- Session management and persistence
- User profile handling
- Role-based access control (RBAC)
- JWT token configuration

#### Key Configuration

```typescript
// OAuth providers configuration
const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
  GitHubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  })
];

// Session configuration
const session = {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 days
};

// Callbacks for session and JWT handling
const callbacks = {
  async session({ session, token }) {
    // Customize session object
  },
  async jwt({ token, user, account }) {
    // Handle JWT token
  }
};
```

#### Usage Example
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

// Get user session in server components
const session = await getServerSession(authOptions);

// Check authentication status
if (session?.user) {
  const userEmail = session.user.email;
  const userName = session.user.name;
}
```

## Scientific Computing

### 5. Fuel Cell Predictions Engine

**File**: `apps/web/src/lib/fuel-cell-predictions.ts`

**Purpose**: AI-powered performance prediction system for microbial electrochemical systems with multi-factor analysis.

#### Key Features
- Multi-factor prediction algorithms
- Confidence scoring and uncertainty quantification
- Temperature, pH, and substrate optimization
- Design-specific performance multipliers
- Historical data integration
- Machine learning model interfaces

#### Key Functions

```typescript
// Main prediction function
async function predictPerformance(params: PredictionParameters): Promise<PredictionResult>

// Optimize parameters for maximum performance
async function optimizeParameters(constraints: OptimizationConstraints): Promise<OptimizedParameters>

// Calculate confidence scores
function calculateConfidence(prediction: PredictionResult, historicalData: HistoricalData[]): ConfidenceScore

// Multi-objective optimization
async function multiObjectiveOptimization(objectives: Objective[]): Promise<ParetoFront>
```

#### Prediction Parameters
```typescript
interface PredictionParameters {
  temperature: number;        // °C
  ph: number;                // pH scale
  substrateConcentration: number; // mg/L
  designType: MFCDesignType;
  electrodeConfig: ElectrodeConfig;
  operatingConditions: OperatingConditions;
}
```

#### Usage Example
```typescript
import { predictPerformance, optimizeParameters } from '@/lib/fuel-cell-predictions';

// Performance prediction
const prediction = await predictPerformance({
  temperature: 28.5,
  ph: 7.1,
  substrateConcentration: 1200,
  designType: 'dual-chamber',
  electrodeConfig: { anode: 'carbon-cloth', cathode: 'platinum' },
  operatingConditions: { resistance: 1000 }
});

// Parameter optimization
const optimized = await optimizeParameters({
  objective: 'maximize-power',
  constraints: {
    temperatureRange: [20, 35],
    phRange: [6.5, 8.0],
    budget: 1000
  }
});
```

### 6. MESS Parameters Database

**File**: `apps/web/src/lib/parameters-data.ts`

**Purpose**: Comprehensive library of 1500+ MESS parameters across 150 categories with validation and auto-derived properties.

#### Key Features
- 1500+ parameters across microbial electrochemical systems
- 150+ parameter categories
- Validation rules and constraints
- Auto-derived property calculations
- Material compatibility matrices
- Performance benchmarks

#### Parameter Categories
- **Physical Properties**: Conductivity, porosity, surface area
- **Chemical Properties**: pH tolerance, substrate affinity
- **Biological Properties**: Microbial species, growth rates
- **Operational Parameters**: Temperature, flow rates, retention time
- **Economic Factors**: Material costs, maintenance requirements

#### Key Functions

```typescript
// Get parameters by category
function getParametersByCategory(category: ParameterCategory): Parameter[]

// Validate parameter combinations
function validateParameterSet(parameters: ParameterSet): ValidationResult

// Calculate derived properties
function calculateDerivedProperties(baseParameters: BaseParameters): DerivedProperties

// Get material compatibility matrix
function getMaterialCompatibility(materials: Material[]): CompatibilityMatrix
```

#### Usage Example
```typescript
import { 
  getParametersByCategory, 
  validateParameterSet, 
  calculateDerivedProperties 
} from '@/lib/parameters-data';

// Get electrode parameters
const electrodeParams = getParametersByCategory('electrodes');

// Validate parameter combination
const validation = validateParameterSet({
  anode: 'carbon-cloth',
  cathode: 'platinum',
  separator: 'nafion',
  electrolyte: 'phosphate-buffer'
});

// Calculate system properties
const properties = calculateDerivedProperties({
  surfaceArea: 100, // cm²
  porosity: 0.7,
  conductivity: 0.05 // S/cm
});
```

### 7. Unified Systems Catalog

**File**: `apps/web/src/lib/unified-systems-catalog.ts`

**Purpose**: Complete catalog of 13 MFC designs with specifications, cost analysis, and performance metrics.

#### Key Features
- 13 pre-configured MFC designs
- Detailed technical specifications
- Cost analysis and ROI calculations  
- Performance benchmarks
- Scale-specific configurations (lab, pilot, industrial)
- Material requirements and sourcing

#### Available Systems
1. **Mason Jar MFC** - Educational/demonstration
2. **H-Type Dual Chamber** - Laboratory research
3. **Single Chamber Air Cathode** - Simplified design
4. **Tubular MFC** - Continuous flow
5. **Stacked MFC** - Increased voltage
6. **Sediment MFC** - Environmental applications
7. **Plant-MFC** - Bio-integrated systems
8. **Microfluidic MFC** - Microscale research
9. **Membrane-less MFC** - Cost-effective design
10. **Biofilm Reactor** - Specialized microbiology
11. **Wastewater Treatment MFC** - Industrial scale
12. **Benchtop Bioreactor** - Laboratory automation
13. **Industrial Waste-to-Energy** - Commercial deployment

#### Key Functions

```typescript
// Get all available systems
function getAllSystems(): MFCSystem[]

// Filter systems by criteria
function filterSystems(criteria: FilterCriteria): MFCSystem[]

// Get detailed system specifications
function getSystemDetails(systemId: string): SystemDetails

// Calculate system costs
function calculateSystemCost(system: MFCSystem, scale: Scale): CostAnalysis

// Compare multiple systems
function compareSystems(systemIds: string[]): SystemComparison
```

#### Usage Example
```typescript
import { 
  getAllSystems, 
  filterSystems, 
  calculateSystemCost,
  compareSystems 
} from '@/lib/unified-systems-catalog';

// Get all available systems
const allSystems = getAllSystems();

// Filter for laboratory scale systems
const labSystems = filterSystems({
  scale: 'laboratory',
  maxCost: 5000,
  powerRange: [10, 100] // mW
});

// Cost analysis
const costAnalysis = calculateSystemCost('h-type-dual-chamber', 'pilot');

// Compare systems
const comparison = compareSystems(['mason-jar', 'single-chamber', 'h-type']);
```

### 8. Control System Simulation

**File**: `apps/web/src/lib/control-system-simulation.ts`

**Purpose**: Advanced control system simulation with PID controllers, feedback loops, and real-time system dynamics.

#### Key Features
- PID controller implementation
- System dynamics modeling
- Real-time simulation engine
- Feedback loop analysis
- Disturbance rejection
- Control parameter optimization

#### Key Functions

```typescript
// PID controller implementation
class PIDController {
  setSetpoint(setpoint: number): void
  update(processVariable: number, deltaTime: number): number
  tune(kp: number, ki: number, kd: number): void
}

// System simulation
async function simulateSystem(model: SystemModel, duration: number): Promise<SimulationResult>

// Control loop analysis
function analyzeControlLoop(controller: PIDController, plant: PlantModel): AnalysisResult

// Real-time simulation
function startRealTimeSimulation(config: SimulationConfig): SimulationHandle
```

#### Usage Example
```typescript
import { PIDController, simulateSystem, analyzeControlLoop } from '@/lib/control-system-simulation';

// Create PID controller for pH control
const phController = new PIDController();
phController.tune(2.0, 0.1, 0.05); // Kp, Ki, Kd
phController.setSetpoint(7.0); // Target pH

// Simulate system response
const simulation = await simulateSystem({
  type: 'mfc-system',
  parameters: { volume: 1.0, flowRate: 10 }, // L, mL/min
  disturbances: { substrate: 'step' }
}, 3600); // 1 hour simulation

// Control loop analysis
const analysis = analyzeControlLoop(phController, mfcPlantModel);
```

### 9. Fuel Cell Optimization

**File**: `apps/web/src/lib/fuel-cell-optimization.ts`

**Purpose**: Multi-objective optimization algorithms including genetic algorithms, particle swarm optimization, and gradient descent methods.

#### Key Features
- Genetic algorithm implementation
- Particle swarm optimization
- Gradient descent methods
- Multi-objective optimization
- Constraint handling
- Pareto front analysis

#### Key Functions

```typescript
// Genetic algorithm optimization
async function geneticAlgorithm(config: GAConfig): Promise<OptimizationResult>

// Particle swarm optimization
async function particleSwarmOptimization(config: PSOConfig): Promise<OptimizationResult>

// Multi-objective optimization
async function multiObjectiveOptimization(objectives: Objective[]): Promise<ParetoFront>

// Constraint handling
function applyConstraints(solution: Solution, constraints: Constraint[]): Solution
```

#### Usage Example
```typescript
import { 
  geneticAlgorithm, 
  particleSwarmOptimization, 
  multiObjectiveOptimization 
} from '@/lib/fuel-cell-optimization';

// Genetic algorithm for parameter optimization
const gaResult = await geneticAlgorithm({
  populationSize: 100,
  generations: 50,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  objective: maximizePowerOutput,
  constraints: [
    { parameter: 'temperature', min: 20, max: 35 },
    { parameter: 'ph', min: 6.0, max: 8.0 }
  ]
});

// Multi-objective optimization
const paretoFront = await multiObjectiveOptimization([
  { name: 'power', weight: 0.6, maximize: true },
  { name: 'cost', weight: 0.4, maximize: false }
]);
```

## Research & Academic

### 10. Citation Verification System

**File**: `apps/web/src/lib/citation-verifier.ts`

**Purpose**: Academic citation verification with DOI validation, CrossRef integration, and research paper metadata management.

#### Key Features
- DOI validation and resolution
- CrossRef API integration
- Citation format validation
- Metadata extraction and normalization
- Duplicate detection
- Citation network analysis

#### Key Functions

```typescript
// Validate and resolve DOI
async function validateDOI(doi: string): Promise<DOIValidationResult>

// Search CrossRef database
async function searchCrossRef(query: string): Promise<SearchResult[]>

// Extract citation metadata
async function extractMetadata(citation: string): Promise<CitationMetadata>

// Detect duplicate citations
function detectDuplicates(citations: Citation[]): DuplicateGroup[]

// Format citation in various styles
function formatCitation(metadata: CitationMetadata, style: CitationStyle): string
```

#### Usage Example
```typescript
import { 
  validateDOI, 
  searchCrossRef, 
  extractMetadata, 
  formatCitation 
} from '@/lib/citation-verifier';

// Validate DOI
const doiResult = await validateDOI('10.1016/j.bioelechem.2023.108123');

// Search for papers
const searchResults = await searchCrossRef('microbial fuel cell graphene electrode');

// Extract metadata from citation string
const metadata = await extractMetadata(
  'Liu, H., et al. (2023). Enhanced performance of microbial fuel cells. Bioelectrochemistry, 149, 108123.'
);

// Format citation in APA style
const apaCitation = formatCitation(metadata, 'APA');
```

### 11. Web Scraping Integration

**File**: `apps/web/src/lib/zen-browser.ts`

**Purpose**: Web scraping and automated data extraction for research papers, technical specifications, and scientific data.

#### Key Features
- Research paper extraction from academic websites
- Technical specification scraping
- Automated data collection and parsing
- Content extraction and cleaning
- Rate limiting and respectful scraping
- Error handling and retry mechanisms

#### Key Functions

```typescript
// Extract research paper data
async function extractPaperData(url: string): Promise<PaperData>

// Scrape technical specifications
async function scrapeTechnicalSpecs(url: string): Promise<TechnicalSpecs>

// Batch URL processing
async function processBatchUrls(urls: string[]): Promise<BatchResult[]>

// Content cleaning and normalization
function cleanExtractedContent(content: string): CleanedContent
```

#### Usage Example
```typescript
import { 
  extractPaperData, 
  scrapeTechnicalSpecs, 
  processBatchUrls 
} from '@/lib/zen-browser';

// Extract paper data
const paperData = await extractPaperData('https://doi.org/10.1016/j.example');

// Scrape technical specifications
const specs = await scrapeTechnicalSpecs('https://manufacturer.com/electrode-specs');

// Batch processing
const batchResults = await processBatchUrls([
  'https://paper1.com',
  'https://paper2.com',
  'https://paper3.com'
]);
```

## Type Definitions

### 12. Fuel Cell Type Definitions

**File**: `apps/web/src/lib/types/fuel-cell-types.ts`

**Purpose**: Comprehensive TypeScript definitions for fuel cell systems, ensuring type safety across the entire platform.

#### Key Type Categories

##### System Types
```typescript
// Main fuel cell system types
type FuelCellType = 'MFC' | 'MEC' | 'MDC' | 'MES' | 'PEMFC' | 'SOFC';

// Design configurations
type DesignType = 'single-chamber' | 'dual-chamber' | 'tubular' | 'stacked' | 'microfluidic';

// Operational modes
type OperationalMode = 'continuous' | 'batch' | 'fed-batch' | 'recycling';
```

##### Component Types
```typescript
// Electrode specifications
interface ElectrodeConfig {
  anode: ElectrodeMaterial;
  cathode: ElectrodeMaterial;
  surface_area: number; // cm²
  spacing: number; // cm
  coating?: CoatingMaterial;
}

// Material definitions
interface Material {
  id: string;
  name: string;
  type: MaterialType;
  properties: MaterialProperties;
  cost_per_unit: number;
  availability: AvailabilityStatus;
}
```

##### Measurement Types
```typescript
// Performance metrics
interface PerformanceMetrics {
  power_density: number; // mW/m²
  current_density: number; // mA/m²
  voltage: number; // V
  efficiency: number; // %
  coulombic_efficiency: number; // %
}

// Environmental conditions
interface EnvironmentalConditions {
  temperature: number; // °C
  ph: number;
  dissolved_oxygen: number; // mg/L
  conductivity: number; // mS/cm
  salinity?: number; // ppt
}
```

##### Prediction Types
```typescript
// Prediction input parameters
interface PredictionInput {
  system_config: SystemConfiguration;
  operating_conditions: OperatingConditions;
  environmental_params: EnvironmentalParameters;
  duration: number; // hours
}

// Prediction results
interface PredictionResult {
  predicted_performance: PerformanceMetrics;
  confidence_interval: ConfidenceInterval;
  optimization_suggestions: OptimizationSuggestion[];
  uncertainty_analysis: UncertaintyAnalysis;
}
```

#### Usage Example
```typescript
import type { 
  FuelCellSystem, 
  PredictionInput, 
  PerformanceMetrics,
  ElectrodeConfig 
} from '@/lib/types/fuel-cell-types';

// Define system configuration
const systemConfig: FuelCellSystem = {
  id: 'mfc-001',
  type: 'MFC',
  design: 'dual-chamber',
  electrodes: {
    anode: 'carbon-cloth',
    cathode: 'platinum-carbon',
    surface_area: 25,
    spacing: 2.0
  },
  volume: 100, // mL
  operational_mode: 'continuous'
};

// Type-safe prediction input
const predictionInput: PredictionInput = {
  system_config: systemConfig,
  operating_conditions: {
    flow_rate: 10, // mL/min
    hydraulic_retention_time: 24, // hours
    external_resistance: 1000 // Ω
  },
  environmental_params: {
    temperature: 25,
    ph: 7.0,
    substrate_concentration: 1000 // mg/L
  },
  duration: 168 // 1 week
};
```

## Usage Examples

### Integration Patterns

#### 1. Complete Experiment Workflow
```typescript
import { predictPerformance } from '@/lib/fuel-cell-predictions';
import { getSystemDetails } from '@/lib/unified-systems-catalog';
import { validateParameterSet } from '@/lib/parameters-data';
import { getDbClient } from '@/lib/db';

async function runExperimentWorkflow(systemId: string, parameters: ExperimentParameters) {
  // 1. Get system configuration
  const systemConfig = getSystemDetails(systemId);
  
  // 2. Validate parameters
  const validation = validateParameterSet(parameters);
  if (!validation.isValid) {
    throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
  }
  
  // 3. Run prediction
  const prediction = await predictPerformance({
    ...parameters,
    designType: systemConfig.type
  });
  
  // 4. Save to database
  const db = getDbClient();
  const experiment = await db.experiment.create({
    data: {
      systemId,
      parameters,
      prediction,
      status: 'planned'
    }
  });
  
  return { experiment, prediction };
}
```

#### 2. Optimization Pipeline
```typescript
import { geneticAlgorithm } from '@/lib/fuel-cell-optimization';
import { calculateSystemCost } from '@/lib/unified-systems-catalog';
import { simulateSystem } from '@/lib/control-system-simulation';

async function optimizeSystemDesign(objectives: OptimizationObjective[]) {
  // 1. Multi-objective optimization
  const optimization = await geneticAlgorithm({
    objectives,
    constraints: [
      { parameter: 'cost', max: 10000 },
      { parameter: 'power', min: 50 }
    ]
  });
  
  // 2. Simulate optimal design
  const simulation = await simulateSystem(optimization.bestSolution, 3600);
  
  // 3. Cost analysis
  const costAnalysis = calculateSystemCost(optimization.bestSolution, 'pilot');
  
  return {
    optimizedDesign: optimization.bestSolution,
    simulationResults: simulation,
    costAnalysis
  };
}
```

## Integration Guide

### 1. Import Patterns
```typescript
// Individual imports (recommended)
import { predictPerformance } from '@/lib/fuel-cell-predictions';
import { getDbClient } from '@/lib/db';

// Namespace imports for large modules
import * as ParamsData from '@/lib/parameters-data';
import * as SystemsCatalog from '@/lib/unified-systems-catalog';
```

### 2. Error Handling
```typescript
import { safeQuery } from '@/lib/db';

// All library functions include comprehensive error handling
try {
  const result = await predictPerformance(parameters);
} catch (error) {
  if (error instanceof PredictionError) {
    // Handle prediction-specific errors
  } else {
    // Handle general errors
  }
}
```

### 3. Type Safety
```typescript
import type { PredictionResult, SystemConfiguration } from '@/lib/types/fuel-cell-types';

// All functions are fully typed
const prediction: PredictionResult = await predictPerformance(input);
const config: SystemConfiguration = getSystemDetails(systemId);
```

### 4. Performance Considerations
```typescript
// Use batch operations for better performance
import { batchInsert } from '@/lib/database-utils';
import { processBatchUrls } from '@/lib/zen-browser';

// Batch database operations
await batchInsert('experiments', experimentArray);

// Batch web scraping
const results = await processBatchUrls(urlArray);
```

---

**Library Reference Last Updated**: 2025-07-13  
**Total Library Files**: 12  
**Total Functions**: 100+  
**Type Definitions**: 50+  
**Status**: All libraries fully implemented and documented