# Laboratory Components Documentation (messai-lab-clean)

## Overview
The messai-lab-clean worktree contains specialized laboratory tools for bioelectrochemical systems design, simulation, and analysis. It extends the clean-messai base with advanced 3D modeling, physics simulations, and laboratory-specific workflows.

## Architecture Principles

### Laboratory-First Design
- Focus on practical laboratory applications
- Real-time simulation capabilities
- Integration with laboratory equipment
- Scientific accuracy and validation

### Component Organization
```
messai-lab-clean/
├── app/
│   ├── tools/
│   │   ├── bioreactor/          # Bioreactor design tool
│   │   └── electroanalytical/   # Electroanalytical analysis
│   └── api/
│       └── lab/                 # Laboratory-specific APIs
├── components/
│   ├── 3d/                      # Advanced 3D visualizations
│   ├── bioreactor/              # Bioreactor components
│   ├── electroanalytical/       # Analysis components
│   └── simulations/             # Physics simulations
├── packages/
│   ├── @messai/lab-core/        # Laboratory business logic
│   └── @messai/lab-ui/          # Lab UI components
└── lib/
    ├── simulations/             # Physics engines
    ├── sensors/                 # Sensor integrations
    └── materials/               # Material databases
```

## Core Laboratory Components

### 1. Bioreactor Design System
**Location**: `components/bioreactor/`, `app/tools/bioreactor/`
**Purpose**: Interactive bioreactor design and optimization

**Key Components**:
- `BioreactorDesigner.tsx` - Main design interface
- `BioreactorPreview3D.tsx` - Real-time 3D preview
- `FlowSimulation.tsx` - Fluid dynamics visualization
- `MaterialSelector.tsx` - Electrode material selection
- `PerformancePredictor.tsx` - Performance estimation

**Features**:
- Drag-and-drop design interface
- Real-time performance predictions
- Material property database
- Export to CAD formats
- Integration with 3D printing

### 2. Electroanalytical Analysis Tools
**Location**: `components/electroanalytical/`, `app/tools/electroanalytical/`
**Purpose**: Advanced electrochemical analysis and visualization

**Key Components**:
- `CyclicVoltammetryAnalyzer.tsx` - CV analysis
- `ImpedanceSpectroscopy.tsx` - EIS analysis
- `ChronoamperometryTool.tsx` - CA analysis
- `DataVisualization.tsx` - Multi-plot visualization
- `SignalProcessor.tsx` - Signal processing tools

**Features**:
- Real-time data acquisition
- Advanced signal processing
- Multi-technique analysis
- Export to research formats
- Integration with potentiostats

### 3. Advanced 3D Visualization
**Location**: `components/3d/`
**Purpose**: Sophisticated 3D modeling and visualization

**Key Components**:
- `AdvancedBioreactorModel.tsx` - Detailed bioreactor models
- `FluidVisualization.tsx` - Flow pattern visualization
- `ElectrodeGeometry.tsx` - Electrode structure modeling
- `ParticleSystem.tsx` - Microbial visualization
- `PhysicsEngine.tsx` - Real-time physics simulation

**Technologies**:
- Three.js for 3D rendering
- React Three Fiber for React integration
- Web Workers for physics calculations
- WebGL shaders for advanced effects

### 4. Physics Simulation Engine
**Location**: `lib/simulations/`
**Purpose**: Real-time physics and fluid dynamics

**Key Modules**:
```typescript
// Fluid dynamics simulation
export class FluidSimulation {
  private solver: NavierStokesSolver
  private boundary: BoundaryConditions
  
  simulate(geometry: ReactorGeometry): FlowField {
    // CFD simulation logic
  }
}

// Electrochemical simulation
export class ElectrochemicalModel {
  private reactions: ReactionKinetics[]
  private diffusion: DiffusionSolver
  
  calculateCurrentDensity(voltage: number): number {
    // Butler-Volmer kinetics
  }
}
```

## Laboratory-Specific APIs

### Bioreactor API
**Base Route**: `/api/lab/bioreactor`

**Endpoints**:
- `POST /design` - Save bioreactor design
- `GET /designs` - List user designs
- `POST /simulate` - Run performance simulation
- `GET /materials` - Get material database
- `POST /export` - Export design files

### Analysis API
**Base Route**: `/api/lab/analysis`

**Endpoints**:
- `POST /cv` - Process CV data
- `POST /eis` - Process EIS data
- `POST /ca` - Process CA data
- `GET /protocols` - Get analysis protocols
- `POST /report` - Generate analysis report

### Equipment Integration API
**Base Route**: `/api/lab/equipment`

**Endpoints**:
- `GET /devices` - List connected devices
- `POST /calibrate` - Device calibration
- `POST /measure` - Start measurement
- `GET /status` - Equipment status

## Scientific Databases

### Electrode Materials Database
**Location**: `packages/@messai/lab-core/src/materials/`

```typescript
export interface ElectrodeMaterial {
  id: string
  name: string
  category: 'carbon' | 'metal' | 'nanomaterial' | 'composite'
  properties: {
    conductivity: number      // S/cm
    surfaceArea: number       // m²/g
    porosity: number          // %
    stability: number         // pH range
    cost: number             // $/m²
  }
  applications: string[]
  references: string[]       // DOI links
}
```

### Microbial Database
**Location**: `packages/@messai/lab-core/src/microbes/`

```typescript
export interface MicrobialSpecies {
  id: string
  species: string
  genus: string
  characteristics: {
    electronTransfer: 'direct' | 'mediated' | 'both'
    optimalTemp: number       // °C
    optimalPH: number
    growthRate: number        // h⁻¹
    powerDensity: number      // mW/m²
  }
  cultivation: {
    medium: string
    supplements: string[]
    atmosphere: 'aerobic' | 'anaerobic'
  }
}
```

## Advanced Features

### Real-Time Sensor Integration
**Location**: `lib/sensors/`

**Supported Sensors**:
- pH sensors (continuous monitoring)
- Dissolved oxygen sensors
- Temperature sensors
- Voltage/current meters
- Flow rate sensors

**Integration Pattern**:
```typescript
export class SensorManager {
  private sensors: Map<string, Sensor>
  
  async connectSensor(config: SensorConfig): Promise<void> {
    // WebUSB or Serial API integration
  }
  
  startDataAcquisition(callback: DataCallback): void {
    // Real-time data streaming
  }
}
```

### CAD Integration
**Location**: `lib/cad/`

**Export Formats**:
- STL for 3D printing
- STEP for CAD software
- OBJ for visualization
- SVG for 2D drawings

### Performance Optimization

#### 3D Rendering
- Level-of-detail (LOD) system
- Frustum culling
- Instanced rendering for repeated elements
- Web Workers for physics calculations

#### Data Processing
- Streaming data analysis
- Background processing for large datasets
- Caching for material properties
- Lazy loading of 3D models

## Testing Strategy

### Laboratory Testing
```typescript
// Integration tests for equipment
describe('Potentiostat Integration', () => {
  it('should acquire CV data correctly', async () => {
    const potentiostat = new MockPotentiostat()
    const data = await potentiostat.runCV({
      startVoltage: -0.5,
      endVoltage: 0.5,
      scanRate: 0.1
    })
    expect(data.peaks.length).toBeGreaterThan(0)
  })
})
```

### Simulation Testing
```typescript
// Physics simulation validation
describe('Fluid Simulation', () => {
  it('should conserve mass', () => {
    const simulation = new FluidSimulation()
    const result = simulation.run(testGeometry)
    expect(result.massBalance).toBeCloseTo(0, 5)
  })
})
```

## Performance Monitoring

### Simulation Performance
- Frames per second for 3D rendering
- Calculation time for physics simulations
- Memory usage for large datasets
- Network latency for real-time data

### Equipment Integration
- Connection stability
- Data acquisition rate
- Calibration drift
- Error recovery time

## Development Workflow

### Local Development
```bash
cd messai-lab-clean
npm install
npm run dev:lab  # Port 3001
```

### Simulation Development
1. Create physics model in `lib/simulations/`
2. Add visualization in `components/3d/`
3. Create UI controls
4. Add validation tests
5. Performance optimization

### Equipment Integration
1. Define sensor interface
2. Implement driver in `lib/sensors/`
3. Create calibration procedure
4. Add real-time visualization
5. Error handling and recovery

## Integration with Core Platform

### Shared Components
- Authentication from core platform
- Database client from `@messai/core`
- Common UI components
- Error handling patterns

### Data Flow
```
Laboratory Equipment → Sensor APIs → Real-time Processing → 
Database Storage → Visualization → Analysis Tools
```

### Extension Points
- Plugin system for new equipment
- Custom analysis algorithms
- Material property extensions
- Export format plugins

---

*This documentation guides development of laboratory tools and scientific simulation features in the messai-lab-clean worktree.*