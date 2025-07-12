# Requirements Specification: Enhanced MESS Model Examples

## Problem Statement

The MESSAi platform currently has basic definitions for several MESS (Microbial Electrochemical Systems) models but lacks comprehensive 3D visualizations, specialized parameter configurations, and guided experimental workflows for five key system types: lab-on-chip MFC, benchtop bioreactor with fuel cell stack, algal building facade panel, modular wastewater treatment system, and benthic microbial fuel cell. These models exist in the design catalog but need significant enhancement to provide researchers with accurate visual representations, design-specific parameters, and dynamic system behavior visualization.

## Solution Overview

Enhance the existing MESS models with detailed 3D visualizations, specialized parameter panels, sophisticated AI predictions, and real-time animation features. Each model will receive accurate geometric representations, design-specific parameter controls, and guided experimental workflows while maintaining consistency with the existing platform architecture.

## Functional Requirements

### 1. Enhanced 3D Model Visualizations

#### FR1.1: Lab-on-Chip MFC (Microscope Slide Dimensions)
- Implement detailed 3D model showing:
  - Glass slide substrate (75mm × 25mm × 1mm)
  - Microfluidic channels with Y-junction inlet
  - Gold microelectrodes in serpentine pattern
  - Transparent ITO cathode layer
  - Nafion membrane separator
  - Inlet/outlet ports with tubing connections
- Include cross-section view toggle
- Show microbial biofilm development animation
- Visualize electron flow pathways

#### FR1.2: Benchtop Bioreactor with Fuel Cell Stack
- Create comprehensive 3D model featuring:
  - 5L glass bioreactor vessel with ports
  - Magnetic stirrer with variable speed indication
  - External fuel cell stack (5 cells in series)
  - Peristaltic pump connections
  - Gas collection system
  - Temperature control jacket
- Animate fluid circulation patterns
- Show gas bubble formation and collection
- Display stack voltage distribution

#### FR1.3: Algal Building Facade Panel
- Develop architectural-scale 3D model showing:
  - 2m × 1m modular panel array
  - Transparent photobioreactor chambers
  - Integrated electrode arrays
  - Algae growth visualization (green gradient)
  - Mounting framework and connections
  - Weather protection features
- Animate photosynthetic oxygen production
- Show diurnal light/dark cycle effects
- Visualize biofilm thickness variations

#### FR1.4: Modular Wastewater Treatment System
- Build industrial-scale 3D model including:
  - Primary settling tank
  - Aeration chamber with diffusers
  - MFC module array (10 × 10 units)
  - Clarifier with scraper mechanism
  - Effluent discharge system
  - Control panel visualization
- Animate wastewater flow patterns
- Show sludge accumulation and removal
- Display COD reduction gradient

#### FR1.5: Benthic Microbial Fuel Cell
- Create marine deployment 3D model featuring:
  - Sediment layer with texture mapping
  - Water column with transparency
  - Buried anode array (graphite rods)
  - Floating cathode platform
  - Mooring system and cables
  - Data logger housing
- Animate tidal water movement
- Show sediment bioturbation effects
- Visualize oxygen gradient in sediment

### 2. Specialized Parameter Panels

#### FR2.1: Lab-on-Chip Parameter Controls
```typescript
components/lab-on-chip/ParameterControls.tsx
- Channel dimensions (width: 50-500 μm, height: 20-200 μm)
- Flow rate (0.1-10 μL/min)
- Electrode spacing (100-1000 μm)
- Substrate injection mode (continuous/batch)
- Microscopy integration settings
```

#### FR2.2: Benchtop Bioreactor Parameter Controls
```typescript
components/benchtop-bioreactor/ParameterControls.tsx
- Reactor volume (1-10 L)
- Stirring speed (50-500 RPM)
- Temperature control (20-40°C)
- Gas flow rate (0.1-2 L/min)
- HRT (2-48 hours)
- Number of fuel cell stacks (1-10)
```

#### FR2.3: Algal Facade Parameter Controls
```typescript
components/algal-facade/ParameterControls.tsx
- Panel dimensions (1-3 m²)
- Algae species selection
- Light intensity (0-2000 μmol/m²/s)
- CO₂ injection rate (0-5%)
- Nutrient concentration
- Harvesting frequency
```

#### FR2.4: Wastewater Treatment Parameter Controls
```typescript
components/wastewater-treatment/ParameterControls.tsx
- System capacity (100-10,000 L/day)
- Influent COD (200-2000 mg/L)
- HRT (4-24 hours)
- SRT (5-30 days)
- Number of MFC modules (10-100)
- Aeration rate (0-10 L/min)
```

#### FR2.5: Benthic MFC Parameter Controls
```typescript
components/benthic-mfc/ParameterControls.tsx
- Deployment depth (0.5-100 m)
- Sediment type (sand/silt/clay)
- Salinity (0-35 ppt)
- Temperature range (5-30°C)
- Anode burial depth (5-50 cm)
- Tidal amplitude (0-5 m)
```

### 3. Enhanced AI Predictions

#### FR3.1: Sophisticated Prediction Models
Update `lib/ai-predictions.ts` with:
- Substrate-specific degradation kinetics
- Scale-dependent performance factors
- Environmental condition impacts
- Multi-parameter optimization algorithms
- Confidence intervals based on data quality

#### FR3.2: Model-Specific Calculations
```typescript
// Lab-on-chip specific
microfluidicFactor = flowRate * channelEfficiency * biofilmMaturity

// Benchtop bioreactor
reactorFactor = mixingEfficiency * gasTransfer * stackConfiguration

// Algal facade
photosynthesisFactor = lightIntensity * algaeDensity * CO2availability

// Wastewater treatment
treatmentFactor = HRT * microbialDiversity * organicLoading

// Benthic
sedimentFactor = redoxPotential * sulfateReduction * tidalMixing
```

### 4. Real-time Animation Features

#### FR4.1: Flow Visualization
- Implement particle-based flow animation
- Show velocity gradients with color mapping
- Display mixing patterns in reactors
- Animate substrate consumption along flow path

#### FR4.2: Biofilm Growth Animation
- Progressive biofilm thickness increase
- Color changes indicating maturity
- Detachment events visualization
- Spatial heterogeneity representation

#### FR4.3: Gas Production Animation
- Bubble formation at electrode surfaces
- Bubble coalescence and rise
- Gas collection in headspace
- Methane vs CO₂ composition indication

#### FR4.4: Performance Overlay
- Real-time power density heatmap
- Current density distribution
- pH gradient visualization
- Temperature field display

### 5. Experiment Workflow Enhancement

#### FR5.1: Design-Specific Setup Guides
- Interactive setup wizards for each model
- Component assembly animations
- Critical parameter checklists
- Common pitfall warnings

#### FR5.2: Monitoring Protocols
- Recommended sampling frequencies
- Key performance indicators
- Troubleshooting decision trees
- Maintenance schedules

#### FR5.3: Data Analysis Tools
- Model-specific performance metrics
- Comparative analysis across designs
- Efficiency calculations (Coulombic, energy)
- Scale-up projections

## Technical Requirements

### Component Structure
```
components/
├── lab-on-chip/
│   ├── LabOnChip3D.tsx
│   ├── ParameterControls.tsx
│   └── SetupGuide.tsx
├── benchtop-bioreactor/
│   ├── BenchtopBioreactor3D.tsx
│   ├── ParameterControls.tsx
│   └── SetupGuide.tsx
├── algal-facade/
│   ├── AlgalFacade3D.tsx
│   ├── ParameterControls.tsx
│   └── SetupGuide.tsx
├── wastewater-treatment/
│   ├── WastewaterTreatment3D.tsx
│   ├── ParameterControls.tsx
│   └── SetupGuide.tsx
└── benthic-mfc/
    ├── BenthicMFC3D.tsx
    ├── ParameterControls.tsx
    └── SetupGuide.tsx
```

### 3D Model Implementation Pattern
```typescript
// components/3d/vanilla-design-models.tsx extension
case 'lab-on-chip':
  // Glass slide substrate
  const slideGeometry = new THREE.BoxGeometry(7.5, 0.1, 2.5);
  const slideMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.1
  });
  
  // Microfluidic channels
  const channelGeometry = new THREE.TubeGeometry(
    createChannelPath(),
    64,
    0.01,
    8,
    false
  );
  
  // Gold electrodes
  const electrodeGeometry = createSerpentinePattern();
  const electrodeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffd700,
    metalness: 0.9,
    roughness: 0.2
  });
  
  // Animation setup
  setupFlowAnimation(group);
  setupBiofilmGrowth(group);
  break;
```

### Animation System
```typescript
// lib/animation-system.ts
interface AnimationConfig {
  flowRate: number;
  particleCount: number;
  biofilmGrowthRate: number;
  gasProductionRate: number;
}

class MESSAnimationSystem {
  private particles: THREE.Points[];
  private biofilmMeshes: THREE.Mesh[];
  private gasBubbles: THREE.Sphere[];
  
  updateFlow(deltaTime: number): void {
    // Update particle positions based on flow field
  }
  
  updateBiofilm(deltaTime: number): void {
    // Scale biofilm meshes based on growth rate
  }
  
  updateGasProduction(deltaTime: number): void {
    // Create and animate gas bubbles
  }
}
```

### Enhanced Prediction Integration
```typescript
// lib/ai-predictions.ts additions
export const modelSpecificFactors = {
  'lab-on-chip': {
    baseMultiplier: 0.3,
    scaleFactors: {
      channelWidth: (width: number) => Math.log10(width / 100),
      flowRate: (rate: number) => Math.sqrt(rate / 1),
      electrodeSpacing: (spacing: number) => 1000 / spacing
    }
  },
  'benchtop-bioreactor': {
    baseMultiplier: 3.5,
    scaleFactors: {
      volume: (vol: number) => Math.cbrt(vol / 5),
      mixing: (rpm: number) => rpm / 200,
      stackNumber: (n: number) => n * 0.85
    }
  },
  // ... other models
};
```

## Implementation Patterns and Hints

### 1. 3D Model Creation Pattern
- Use Three.js primitive geometries as building blocks
- Apply physically-based materials for realism
- Implement LOD (Level of Detail) for performance
- Use instanced meshes for repeated elements
- Add ambient occlusion for depth perception

### 2. Parameter Panel Pattern
- Follow algal-fuel-cell component structure
- Use React hooks for state management
- Implement real-time validation
- Provide tooltips with scientific explanations
- Include unit conversion utilities

### 3. Animation Implementation
- Use requestAnimationFrame for smooth updates
- Implement particle pooling for performance
- Use shaders for complex effects
- Add performance toggles for low-end devices
- Synchronize with prediction updates

### 4. Integration with Existing System
- Extend vanilla-design-models.tsx cases
- Add to designSpecificParams in predictions
- Update experiment page conditional rendering
- Maintain LCARS theme consistency
- Use existing API patterns

## Acceptance Criteria

- [ ] All 5 MESS models have detailed 3D representations in vanilla-design-models.tsx
- [ ] Each model has specialized parameter controls following algal-fuel-cell pattern
- [ ] AI predictions include sophisticated model-specific calculations
- [ ] Real-time animations for flow, biofilm, and gas production implemented
- [ ] Cross-section views available for all models
- [ ] Performance remains smooth on standard hardware (>30 FPS)
- [ ] Mobile-responsive parameter panels
- [ ] Setup guides accessible from experiment workflow
- [ ] All animations can be toggled for performance
- [ ] Existing functionality preserved and enhanced
- [ ] TypeScript types properly defined
- [ ] Component tests written for parameter validation

## Assumptions

- WebGL 2.0 support available in target browsers
- Users have basic understanding of MESS principles
- Scientific accuracy takes precedence over visual effects
- Performance optimizations may simplify animations
- Parameter ranges based on published literature
- Animation features optional for low-end devices
- Existing experiment tracking system sufficient
- No backend API changes required initially

## Dependencies

- Three.js and existing 3D infrastructure
- Current parameter configuration system
- AI prediction engine
- Experiment workflow components
- LCARS design system
- TypeScript definitions
- React hooks and state management
- WebGL-capable browsers

## Migration Strategy

### Phase 1: 3D Model Implementation (Week 1-2)
- Implement detailed 3D models for all 5 types
- Add basic material properties and lighting
- Test rendering performance

### Phase 2: Parameter Panels (Week 2-3)
- Create specialized parameter controls
- Integrate with existing configuration system
- Add validation and tooltips

### Phase 3: Animation Features (Week 3-4)
- Implement flow visualization
- Add biofilm growth animation
- Create gas production effects

### Phase 4: AI Integration (Week 4-5)
- Update prediction models
- Add model-specific calculations
- Validate against literature data

### Phase 5: Testing and Polish (Week 5-6)
- Performance optimization
- Mobile responsiveness
- User testing and refinement
- Documentation updates

This comprehensive enhancement will transform the existing MESS models into sophisticated, interactive tools that provide researchers with detailed insights into system behavior and performance optimization opportunities.