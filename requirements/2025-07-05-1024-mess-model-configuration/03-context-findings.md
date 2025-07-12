# Context Findings

## Files That Need Modification

### Core Configuration Files
1. **`/components/MFCConfigPanel.tsx`**
   - Add "Custom" option to material dropdowns
   - Add input fields for custom material properties
   - Implement preset save/load functionality
   - Add custom microbe species support

2. **`/components/ParameterForm.tsx`**
   - Pass configuration to MESSModel3D for visual updates
   - Add preset management UI (save/load/delete buttons)
   - Update AI prediction integration with enhanced calculations

3. **`/packages/ui/src/3d/MESSModel3D.tsx`**
   - Accept configuration props for material visualization
   - Update materials based on electrode/microbe selection
   - Add visual indicators for custom materials

4. **`/lib/ai-predictions.ts`**
   - Enhance prediction calculations with material-specific factors
   - Add support for custom material properties in calculations
   - Include microbial community effects

### New Files to Create
1. **`/lib/configuration-presets.ts`**
   - Preset management logic (CRUD operations)
   - Validation for custom materials
   - Default preset definitions

2. **`/components/PresetManager.tsx`**
   - UI component for managing saved presets
   - Modal or dropdown for preset selection
   - Import/export functionality

3. **`/prisma/schema.prisma`** (modify)
   - Add ConfigurationPreset model
   - Link to User model for saved presets

## Patterns to Follow

### Material Definition Pattern
```typescript
interface ElectrodeMaterial {
  value: string;
  label: string;
  category: 'traditional' | 'graphene' | 'cnt' | 'mxene' | 'upcycled' | 'custom';
  cost: number;
  efficiency: number;
  conductivity: string;
  // For custom materials
  isCustom?: boolean;
  customProperties?: {
    electronTransferRate?: string;
    biocompatibility?: string;
    stability?: string;
    surfaceArea?: number;
  };
}
```

### Preset Storage Pattern
```typescript
interface ConfigurationPreset {
  id: string;
  name: string;
  description?: string;
  config: MFCConfig;
  customMaterials?: ElectrodeMaterial[];
  customMicrobes?: MicrobialSpecies[];
  createdAt: Date;
  isPublic?: boolean;
}
```

### Real-time Update Pattern
```typescript
// In ParameterForm
useEffect(() => {
  const predictions = calculateAdvancedPredictions(mfcConfig, parameters);
  setPredictedPower(predictions.power);
}, [mfcConfig, parameters]);
```

### 3D Material Update Pattern
```typescript
// Pass to MESSModel3D
<MESSModel3D
  design={designType}
  materialOverrides={{
    electrode: getElectrodeMaterial(mfcConfig.electrode.material),
    biofilm: getMicrobialVisuals(mfcConfig.microbial.species)
  }}
  onClick={handleComponentSelect}
/>
```

## Similar Features Analyzed

### User Settings Management
- Uses Prisma model with JSON fields for complex data
- API routes handle CRUD operations
- Zod validation for input data
- localStorage for quick access

### Experiment Configuration
- Stores parameters as JSON in database
- Uses localStorage for draft/temporary storage
- Form validation with controlled inputs
- Real-time preview calculations

### Material Library System
- Predefined materials with consistent structure
- Category-based organization
- Visual feedback with colors/icons
- Property calculations based on material type

## Technical Constraints

1. **Database**: Currently using SQLite, JSON fields for complex data
2. **Validation**: Must validate custom material properties (ranges, formats)
3. **Performance**: Real-time updates need debouncing for 3D renders
4. **Storage Limits**: localStorage has 5-10MB limit per origin
5. **Material Properties**: Must ensure custom materials have required fields for calculations

## Integration Points

1. **Authentication**: Preset saving requires user authentication
2. **3D Rendering**: Material changes trigger re-renders
3. **AI Predictions**: Custom materials need conversion to prediction factors
4. **Export/Import**: JSON format for sharing configurations
5. **Validation**: Both client and server-side validation needed

## Implementation Order

1. Extend MFCConfigPanel with custom material UI
2. Create preset management system
3. Update 3D visualization with material mapping
4. Enhance AI predictions with material factors
5. Add database schema for persistent storage
6. Implement import/export functionality