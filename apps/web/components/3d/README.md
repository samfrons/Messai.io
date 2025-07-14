# 3D Modeling Lab Components

This directory contains the Three.js-powered 3D visualization components for MESSAI's bioelectrochemical systems.

## Directory Structure

```
3d/
├── core/           # Core 3D infrastructure
├── bioreactor/     # Bioreactor-specific components
├── biofilm/        # Biofilm simulation components
└── utils/          # Utility functions and helpers
```

## Core Components

### Scene.tsx
Base scene setup with lighting, environment, and controls.

```tsx
import Scene from '@/components/3d/core/Scene'

<Scene debug={false} controls={true} environment={true}>
  {/* Your 3D content */}
</Scene>
```

### Materials.tsx
Material library with physically-based materials for all system components.

Available materials:
- `carbonCloth` - Textured carbon electrode material
- `carbonFelt` - Porous carbon material
- `grapheneOxide` - Semi-transparent layered material
- `mxene` - Metallic conductive material with iridescence
- `platinum` - Highly reflective catalyst
- `stainlessSteel` - Brushed metal appearance
- `copper` - Copper electrode material
- `biofilm` - Organic translucent material
- `electrolyte` - Transparent fluid
- `membrane` - Semi-transparent separator
- `plastic` - Chamber material

## Bioreactor Components

### BioreactorModel.tsx
Main parametric model that adapts based on system configuration.

```tsx
<BioreactorModel
  systemType="MFC"              // MFC | MEC | MDC | MES
  scale="laboratory"            // laboratory | pilot | industrial
  anodeMaterial="carbonCloth"
  cathodeMaterial="platinum"
  onPerformanceUpdate={(data) => console.log(data)}
/>
```

### Chamber.tsx
Configurable chamber component with inlet/outlet ports.

### Electrodes.tsx
Anode and cathode visualization with biofilm growth support.

### Membrane.tsx
Proton exchange membrane with ion flow visualization.

### FlowSystem.tsx
Particle-based flow visualization for substrate, electrons, and ions.

## Biofilm Components

### BiofilmSimulation.tsx
Dynamic biofilm growth simulation with individual bacterial clusters.

```tsx
<BiofilmSimulation
  surfaceWidth={2}
  surfaceHeight={1}
  thickness={0.1}
  growthRate={0.2}
  material={materials.biofilm}
  showGrowthStages={true}
/>
```

## Performance Optimization

1. **Level of Detail (LOD)**: Components use appropriate geometry complexity
2. **Instanced Rendering**: Repeated elements use instancing where possible
3. **Texture Optimization**: Materials use procedural textures to reduce memory
4. **Conditional Rendering**: Flow particles and biofilm only render when visible

## Animation System

Animations use `@react-spring/three` for smooth transitions:
- Scale changes when switching between laboratory/pilot/industrial
- Biofilm growth with pulsing effect
- Flow particle movement with physics
- Ion migration through membranes

## Controls

The 3D scenes use Leva for debug controls:
- Lighting intensity and position
- Flow system parameters
- Biofilm visibility
- Auto-rotation toggle

## Usage Example

```tsx
import Scene from '@/components/3d/core/Scene'
import BioreactorModel from '@/components/3d/bioreactor/BioreactorModel'

export default function MyBioreactor() {
  const [performance, setPerformance] = useState({
    powerOutput: 0,
    efficiency: 0,
    cost: 0
  })

  return (
    <div className="h-[600px]">
      <Scene>
        <BioreactorModel
          systemType="MFC"
          scale="laboratory"
          anodeMaterial="carbonCloth"
          cathodeMaterial="platinum"
          onPerformanceUpdate={setPerformance}
        />
      </Scene>
      
      <div>
        Power: {performance.powerOutput} mW/m²
      </div>
    </div>
  )
}
```

## Material Properties

Materials have associated properties for performance calculations:

```typescript
MATERIAL_PROPERTIES = {
  carbonCloth: {
    conductivity: 95,
    biocompatibility: 90,
    porosity: 85,
    cost: 70,
    durability: 85,
  },
  // ... more materials
}
```

## Future Enhancements

- [ ] VR/AR support
- [ ] Export to GLTF format
- [ ] Advanced particle effects
- [ ] Real-time collaboration
- [ ] Performance recording and playback