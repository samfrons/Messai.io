# Requirements Specification: MESS Model Configuration

## Problem Statement
Researchers need enhanced configuration capabilities for MESS (Microbial Electrochemical Systems) models to:
- Configure electrode materials beyond the predefined options
- Select and customize microbial communities with specific properties
- Save and reuse successful configurations as presets
- Visualize material choices in the 3D model
- Get real-time performance predictions based on configurations

## Solution Overview
Enhance the existing MFC configuration system within the parameter form workflow to support:
1. Custom electrode materials and microbial species with simplified property inputs
2. Visual material representation in 3D models
3. Preset management with privacy controls and community sharing
4. Real-time AI predictions incorporating material properties
5. Compatibility warnings with educational information
6. Integration of comprehensive MESS parameters from the JSON schema

## Functional Requirements

### 1. Custom Material Configuration
- **FR1.1**: Add "Custom" option to electrode material dropdown in MFCConfigPanel
- **FR1.2**: When "Custom" selected, show input fields for:
  - Material name (required)
  - Cost per cm² (required)
  - Efficiency percentage 0-100% (required)
  - Optional description
- **FR1.3**: Validate custom material inputs:
  - Name: 2-50 characters
  - Cost: $0.01-$1000 per cm²
  - Efficiency: 0-100%
- **FR1.4**: Auto-calculate derived properties based on efficiency:
  - Conductivity: map efficiency to Low/Medium/High/Very High
  - Electron transfer rate: derive from efficiency
  - Biocompatibility: default to "Good" for custom materials

### 2. Custom Microbial Species
- **FR2.1**: Add "Custom Species" option to microbial dropdown
- **FR2.2**: When selected, show inputs for:
  - Species name (required)
  - Efficiency factor 0-100% (required)
  - Optimal pH range (optional, default 6.5-7.5)
  - Optimal temperature (optional, default 30°C)
- **FR2.3**: Validate species inputs similar to materials

### 3. Configuration Presets
- **FR3.1**: Add preset management UI in ParameterForm:
  - Save current configuration button
  - Load preset dropdown
  - Delete preset option (for owned presets)
- **FR3.2**: Preset save dialog:
  - Name (required)
  - Description (optional)
  - Privacy toggle (private/public)
  - Tags for categorization
- **FR3.3**: Store presets with full configuration including custom materials
- **FR3.4**: Community library interface:
  - Browse public presets
  - Filter by tags, performance metrics
  - Copy preset to personal library
  - View preset author and stats

### 4. 3D Visualization Updates
- **FR4.1**: Map electrode materials to distinct Three.js materials:
  - Traditional materials: dark gray/black with rough texture
  - Graphene: dark with slight metallic sheen
  - CNT: very dark with fibrous appearance
  - MXene: metallic with layered effect
  - Custom: color based on efficiency (gradient from brown to silver)
- **FR4.2**: Show biofilm visualization based on microbial selection:
  - Thickness based on cell density
  - Color based on species type
  - Transparency for EPS content
- **FR4.3**: Update materials in real-time as configuration changes

### 5. Enhanced AI Predictions
- **FR5.1**: Integrate material properties into power calculations:
  - Base calculation from efficiency percentage
  - Conductivity bonus factors
  - Biocompatibility multipliers
- **FR5.2**: Include microbial factors:
  - Species-specific efficiency
  - Biofilm effects on power output
  - Metabolic rate influences
- **FR5.3**: Show prediction confidence based on:
  - Known vs custom materials
  - Parameter completeness
  - Historical data availability

### 6. Compatibility System
- **FR6.1**: Implement compatibility matrix for electrode-microbe pairs
- **FR6.2**: Show warnings for suboptimal combinations:
  - Yellow warning icon with hover tooltip
  - Brief explanation of incompatibility
  - Link to learn more
- **FR6.3**: Never block selections, only educate
- **FR6.4**: Track compatibility choices for research insights

### 7. MESS Parameters Integration
- **FR7.1**: Add "Advanced Configuration" expandable section
- **FR7.2**: Organize parameters by categories from JSON:
  - Performance Metrics
  - Electrode Configuration
  - Microbial System
  - Operating Conditions
- **FR7.3**: Show only relevant parameters based on design type
- **FR7.4**: Provide tooltips with parameter descriptions and units

## Technical Requirements

### Database Schema Updates
```prisma
model ConfigurationPreset {
  id          String   @id @default(cuid())
  name        String
  description String?
  config      Json     // Full MFCConfig including custom materials
  isPublic    Boolean  @default(false)
  tags        String[] // Array of tag strings
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  uses        Int      @default(0) // Track popularity
  
  @@index([userId])
  @@index([isPublic])
}

model CustomMaterial {
  id              String   @id @default(cuid())
  name            String
  type            String   // 'electrode' or 'microbe'
  properties      Json     // Custom properties
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  createdAt       DateTime @default(now())
  
  @@unique([userId, name, type])
}
```

### API Endpoints
- `POST /api/presets` - Save configuration preset
- `GET /api/presets` - List user's presets
- `GET /api/presets/community` - Browse public presets
- `PUT /api/presets/:id` - Update preset
- `DELETE /api/presets/:id` - Delete preset
- `POST /api/presets/:id/use` - Increment usage counter

### Component Updates
1. **MFCConfigPanel.tsx**:
   - Add custom material UI components
   - Integrate MESS parameters
   - Show compatibility warnings

2. **ParameterForm.tsx**:
   - Add preset management toolbar
   - Pass material config to MESSModel3D
   - Update prediction calculations

3. **MESSModel3D.tsx**:
   - Accept materialOverrides prop
   - Implement material mapping system
   - Update materials based on config

### State Management
```typescript
interface EnhancedMFCConfig extends MFCConfig {
  customMaterials?: {
    electrode?: CustomElectrodeMaterial;
    microbe?: CustomMicrobialSpecies;
  };
  advancedParameters?: {
    [categoryId: string]: {
      [parameterId: string]: number | string;
    };
  };
}

interface CustomElectrodeMaterial {
  name: string;
  cost: number;
  efficiency: number;
  description?: string;
}

interface CustomMicrobialSpecies {
  name: string;
  efficiency: number;
  optimalPH?: [number, number];
  optimalTemp?: number;
}
```

## Implementation Hints

### Material Visualization Mapping
```typescript
const materialToThreeJS = (materialId: string, efficiency?: number) => {
  const materialMap = {
    'carbon-cloth': { color: 0x1a1a1a, roughness: 0.9, metalness: 0.1 },
    'graphene': { color: 0x0a0a0a, roughness: 0.3, metalness: 0.7 },
    'cnt': { color: 0x050505, roughness: 0.4, metalness: 0.5 },
    'mxene': { color: 0x2a2a4a, roughness: 0.2, metalness: 0.8 },
    'custom': { 
      color: lerpColor(0x8B4513, 0xC0C0C0, efficiency / 100),
      roughness: 0.5,
      metalness: efficiency / 200
    }
  };
  return materialMap[materialId] || materialMap['custom'];
};
```

### Compatibility Matrix
```typescript
const compatibilityMatrix = {
  'graphene': {
    'geobacter': { compatible: true, efficiency: 1.2 },
    'shewanella': { compatible: true, efficiency: 1.0 },
    'custom': { compatible: true, efficiency: 0.9, warning: 'Unverified combination' }
  },
  // ... more combinations
};
```

### Preset Validation
```typescript
const presetSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
  config: z.object({
    electrode: z.object({
      material: z.string(),
      surface: z.number().min(1).max(1000),
      thickness: z.number().min(0.1).max(10)
    }),
    // ... rest of config
  }),
  isPublic: z.boolean(),
  tags: z.array(z.string()).max(5)
});
```

## Acceptance Criteria

1. **Custom Materials**:
   - [ ] Users can create custom electrode materials with name, cost, and efficiency
   - [ ] Custom materials appear in dropdown with "(Custom)" suffix
   - [ ] Validation prevents invalid inputs
   - [ ] Custom materials persist across sessions

2. **Preset Management**:
   - [ ] Users can save current configuration as named preset
   - [ ] Saved presets appear in dropdown for quick loading
   - [ ] Public presets visible in community library
   - [ ] Preset usage tracked and displayed

3. **3D Visualization**:
   - [ ] Different materials show distinct visual appearance
   - [ ] Biofilm visualization reflects microbial configuration
   - [ ] Materials update within 100ms of configuration change
   - [ ] No performance degradation with material switching

4. **AI Predictions**:
   - [ ] Power predictions incorporate material efficiency
   - [ ] Custom materials produce reasonable predictions
   - [ ] Confidence indicators show for custom vs known materials
   - [ ] Predictions update in real-time

5. **Compatibility**:
   - [ ] Warnings appear for incompatible combinations
   - [ ] Warnings are educational, not blocking
   - [ ] Warning dismissal is remembered per session
   - [ ] Compatibility data helps improve predictions

6. **MESS Parameters**:
   - [ ] Advanced section shows relevant parameters
   - [ ] Parameters organized by category
   - [ ] Units and ranges clearly displayed
   - [ ] Parameter changes affect predictions

## Assumptions
- Users primarily need basic properties for custom materials (not detailed scientific measurements)
- Community preset sharing will encourage collaboration
- Visual material differences aid understanding more than photorealistic accuracy
- The existing 80+ predefined materials cover most use cases
- Compatibility warnings should educate rather than restrict experimentation
- The MESS parameters JSON provides authoritative parameter definitions

## Future Enhancements
- Import/export presets as JSON files
- Preset versioning and forking
- Machine learning to suggest optimal configurations
- Integration with laboratory equipment for real measurements
- Collaborative preset editing
- Performance benchmarking against real experiments