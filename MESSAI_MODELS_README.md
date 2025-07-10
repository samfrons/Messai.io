# MESSAi Multi-Scale Models System

## 🚀 Quick Start for AI Agents

### **Essential Commands**
```bash
# Switch to messai-models branch
git checkout messai-models

# Install dependencies (if needed)
npm install --legacy-peer-deps

# Start development server
npm run dev
# Navigate to http://localhost:3003/messai-models

# Build for production
npm run build

# Test API endpoints
curl http://localhost:3003/api/messai-models?action=stages
```

## 📁 **Architecture Overview**

### **File Structure**
```
messai-models/
├── app/
│   ├── messai-models/page.tsx          # Main UI page
│   └── api/messai-models/              # API endpoints
│       ├── route.ts                    # Main API
│       └── [stage]/route.ts            # Stage-specific API
├── components/messai-models/           # React components
│   ├── MultiScaleModel3D.tsx          # 3D visualization engine
│   ├── ModelParameterPanel.tsx        # Parameter controls
│   └── PerformanceMonitor.tsx         # Real-time metrics
├── lib/
│   └── multi-scale-catalog.ts         # Data models & calculations
└── components/ui/                      # UI component library
```

### **Core Components**

#### **1. Multi-Scale Catalog (`lib/multi-scale-catalog.ts`)**
- **4 Model Stages**: micro-scale, voltaic-pile, bench-scale, industrial
- **Advanced Materials**: 3 materials including MXene Ti₃C₂Tₓ
- **Bacterial Species**: 3 species with optimal conditions
- **Kinetics Engine**: Butler-Volmer-Monod calculations
- **Progressive Validation**: Risk assessment system

#### **2. 3D Visualization Engine (`MultiScaleModel3D.tsx`)**
- **High-performance Three.js rendering**
- **Stage-specific 3D models**:
  - Micro-scale: Glass slide with microfluidics
  - Voltaic pile: Stackable cell array
  - Bench-scale: Dual chamber with membrane
  - Industrial: Modular MFC array
- **Real-time animations**: Electron flow, biofilm growth
- **Performance monitoring**: FPS, render time tracking
- **Error boundaries**: Graceful degradation

#### **3. Parameter Control System (`ModelParameterPanel.tsx`)**
- **Environmental controls**: Temperature, pH, substrate
- **Flow parameters**: Flow rate with stage-appropriate units
- **Biological settings**: Bacterial species, biofilm thickness
- **Material selection**: Advanced materials database
- **Real-time validation**: Parameter range checking

#### **4. Performance Monitor (`PerformanceMonitor.tsx`)**
- **Live metrics**: Power density, efficiency, voltage
- **Trend analysis**: Historical data tracking
- **Quality indicators**: Performance thresholds
- **Progress bars**: Visual status display

## 🔧 **Technical Implementation**

### **Model Stages Configuration**
```typescript
// Stage definitions with dimensions and parameters
const multiScaleModels: Record<ModelStage, MultiScaleModel> = {
  'micro-scale': {
    dimensions: { width: 75, height: 25, depth: 3 }, // mm
    volume: '200µL - 1mL',
    parameterRanges: {
      temperature: { min: 15, max: 40, unit: '°C' },
      pH: { min: 6.0, max: 8.5 },
      flowRate: { min: 0.1, max: 10, unit: 'µL/min' }
    }
  },
  // ... other stages
}
```

### **Materials Database**
```typescript
const advancedMaterials: MaterialProperties[] = [
  {
    id: 'mxene-ti3c2',
    name: 'Ti₃C₂Tₓ MXene',
    conductivity: { value: 15000, unit: 'S/m' },
    surfaceArea: { value: 1200, unit: 'm²/g' },
    visualProperties: { color: '#9B59B6', opacity: 0.9 }
  }
]
```

### **Performance Calculations**
```typescript
// Butler-Volmer-Monod kinetics implementation
function calculatePerformance(
  stage: ModelStage,
  parameters: ModelParameters,
  materials: MaterialProperties[],
  bacteria: BacterialSpecies
): PerformanceResults {
  // Temperature factor (Arrhenius)
  const tempFactor = Math.exp(-5000 * (1/(273.15 + T) - 1/298.15))
  
  // pH factor (bell curve)
  const pHFactor = Math.exp(-Math.pow(pH - optimalPH, 2) / 0.5)
  
  // Substrate factor (Monod kinetics)
  const substrateFactor = [S] / (Ks + [S])
  
  return { powerDensity, efficiency, voltage }
}
```

## 🎯 **API Endpoints**

### **Main Catalog API** (`/api/messai-models`)
```typescript
// Get all stages
GET /api/messai-models?action=stages

// Get model data
GET /api/messai-models?action=model&stage=micro-scale

// Get materials database
GET /api/messai-models?action=materials

// Calculate performance
POST /api/messai-models
{
  "stage": "micro-scale",
  "parameters": { "temperature": 25, "pH": 7.0, ... },
  "action": "calculate"
}
```

### **Stage-Specific API** (`/api/messai-models/[stage]`)
```typescript
// Get full model data
GET /api/messai-models/micro-scale?detail=full

// Get suitable materials
GET /api/messai-models/micro-scale?detail=materials

// Run simulation
POST /api/messai-models/micro-scale
{
  "parameters": { ... },
  "action": "simulate"
}

// Optimize parameters
POST /api/messai-models/micro-scale
{
  "parameters": { ... },
  "action": "optimize"
}
```

## 🚨 **Common Issues & Solutions**

### **1. 3D Rendering Issues**
```typescript
// Check WebGL support
if (!renderer.capabilities.isWebGL2Available) {
  console.warn('WebGL2 not available, using fallback')
}

// Performance optimization
const adaptiveQuality = fps < 30 ? 'low' : 'high'
particleCount = adaptiveQuality === 'low' ? 100 : 1000
```

### **2. Parameter Validation Errors**
```typescript
// Always validate against model ranges
const model = multiScaleModels[stage]
if (temperature < model.parameterRanges.temperature.min) {
  throw new Error(`Temperature too low for ${stage} stage`)
}
```

### **3. Build Issues**
```bash
# Missing dependencies
npm install @radix-ui/react-tabs @radix-ui/react-slider --legacy-peer-deps

# Module resolution
# Use default import for ErrorBoundary:
import ErrorBoundary from '@/components/ErrorBoundary'
```

### **4. Performance Issues**
```typescript
// Monitor performance
const fps = 1000 / deltaTime
if (fps < 20) {
  // Reduce particle count
  // Disable complex animations
  // Use lower LOD models
}
```

## 🎛️ **Development Workflow**

### **Adding New Model Stage**
1. **Define model in catalog**:
   ```typescript
   // Add to multiScaleModels in multi-scale-catalog.ts
   'new-stage': {
     id: 'new-stage',
     name: 'New Stage Model',
     dimensions: { width: 100, height: 100, depth: 50 },
     // ... other properties
   }
   ```

2. **Create 3D visualization**:
   ```typescript
   // Add case in MultiScaleModel3D.tsx
   case 'new-stage':
     createNewStageModel(group, materials, dimensions)
     break
   ```

3. **Update API validation**:
   ```typescript
   // Add validation in route handlers
   if (stage === 'new-stage') {
     // Stage-specific validation
   }
   ```

4. **Test integration**:
   ```bash
   npm run build
   npm run dev
   # Navigate to /messai-models and test new stage
   ```

### **Adding New Material**
1. **Define material properties**:
   ```typescript
   {
     id: 'new-material',
     name: 'New Material',
     type: 'anode',
     conductivity: { value: 1000, unit: 'S/m' },
     visualProperties: { color: '#FF0000', opacity: 0.8 }
   }
   ```

2. **Add to materials library**:
   ```typescript
   // Update advancedMaterials array
   // Add to material selection dropdowns
   ```

3. **Update calculations**:
   ```typescript
   // Include in performance calculations
   // Add material-specific factors
   ```

### **Performance Optimization Guidelines**
1. **3D Optimization**:
   - Use instanced meshes for repeated elements
   - Implement LOD (Level of Detail) system
   - Monitor FPS and adjust quality dynamically
   - Use object pooling for particles

2. **Memory Management**:
   - Dispose of geometries and materials properly
   - Clear unused textures
   - Monitor memory usage in dev tools

3. **Calculation Optimization**:
   - Cache expensive calculations
   - Use worker threads for heavy computations
   - Implement progressive loading

## 🔒 **Security & Best Practices**

### **Input Validation**
```typescript
// Always validate API inputs
const parameterSchema = z.object({
  temperature: z.number().min(15).max(40),
  pH: z.number().min(6).max(8.5),
  substrateConcentration: z.number().min(0.1).max(20)
})

// Validate before processing
const validatedParams = parameterSchema.parse(input)
```

### **Error Handling**
```typescript
// Wrap components in error boundaries
<ErrorBoundary context="MultiScaleModel3D">
  <MultiScaleModel3D stage={stage} parameters={parameters} />
</ErrorBoundary>

// Handle API errors gracefully
try {
  const response = await fetch('/api/messai-models')
  if (!response.ok) throw new Error('API request failed')
} catch (error) {
  console.error('Model loading failed:', error)
  // Show fallback UI
}
```

### **Performance Monitoring**
```typescript
// Track key metrics
const performanceMetrics = {
  fps: frameRate,
  renderTime: deltaTime,
  memoryUsage: renderer.info.memory,
  drawCalls: renderer.info.render.calls
}

// Alert on performance degradation
if (performanceMetrics.fps < 20) {
  console.warn('Performance degradation detected')
}
```

## 📝 **Testing Strategy**

### **Unit Tests**
```typescript
// Test calculations
describe('calculatePerformance', () => {
  it('should return valid performance metrics', () => {
    const result = calculatePerformance(
      'micro-scale',
      mockParameters,
      mockMaterials,
      mockBacteria
    )
    expect(result.powerDensity).toBeGreaterThan(0)
    expect(result.efficiency).toBeLessThanOrEqual(100)
  })
})
```

### **Integration Tests**
```typescript
// Test API endpoints
describe('/api/messai-models', () => {
  it('should return stage data', async () => {
    const response = await fetch('/api/messai-models?action=stages')
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(4)
  })
})
```

### **E2E Tests**
```typescript
// Test user workflows
describe('Multi-Scale Models Page', () => {
  it('should load and render 3D model', () => {
    cy.visit('/messai-models')
    cy.get('[data-testid="3d-canvas"]').should('be.visible')
    cy.get('[data-testid="stage-tabs"]').should('exist')
  })
})
```

## 🚀 **Deployment & Production**

### **Build Optimization**
```bash
# Optimize for production
npm run build

# Analyze bundle size
npm run analyze

# Environment variables
NEXT_PUBLIC_ENABLE_3D=true
NEXT_PUBLIC_DEBUG_PERFORMANCE=false
```

### **Monitoring**
```typescript
// Production monitoring
if (process.env.NODE_ENV === 'production') {
  // Track errors
  window.addEventListener('error', (event) => {
    analytics.track('3d_render_error', {
      message: event.message,
      filename: event.filename
    })
  })
  
  // Track performance
  setInterval(() => {
    if (fps < 30) {
      analytics.track('performance_degradation', { fps })
    }
  }, 5000)
}
```

## 📚 **Advanced Features**

### **Model Comparison**
```typescript
// Compare different stages
const comparison = compareModels(['micro-scale', 'bench-scale'], parameters)
// Returns performance comparison data
```

### **Parameter Optimization**
```typescript
// Auto-optimize parameters
const optimized = optimizeParameters(stage, baseParameters)
// Returns optimized parameter set
```

### **Export/Import Configurations**
```typescript
// Export current configuration
const config = exportConfiguration()
// Import saved configuration
loadConfiguration(config)
```

---

## 🎯 **Success Metrics**

- ✅ All 4 model stages render correctly
- ✅ 3D visualization maintains >30 FPS
- ✅ Parameter validation works properly
- ✅ API endpoints respond correctly
- ✅ Error handling works gracefully
- ✅ Build completes successfully
- ✅ Navigation integration functional

**Status**: ✅ **FULLY IMPLEMENTED AND FUNCTIONAL**

This system provides a comprehensive foundation for multi-scale MESS model visualization and analysis with enterprise-grade performance and reliability.