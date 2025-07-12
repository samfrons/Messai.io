# AI Predictions Engine Documentation

## Overview
The AI predictions engine is the core machine learning system that provides performance forecasting for bioelectrochemical systems. It combines scientific modeling with advanced ML techniques to deliver accurate, confidence-scored predictions.

## Architecture

### Core Components
```
lib/ai-predictions.ts              # Main prediction engine
packages/@messai/core/src/         # Scientific models
├── power-calculator.ts            # Physics-based calculations
├── electrodes/database.ts         # Material properties
└── microbes/database.ts           # Microbial characteristics
```

### Prediction Flow
```
Input Parameters → Feature Engineering → Model Inference → 
Confidence Calculation → Result Formatting → UI Display
```

## Implementation Details

### 1. Prediction Engine Interface
**Location**: `lib/ai-predictions.ts`

```typescript
export interface PredictionInput {
  // System configuration
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES'
  volume: number                    // L
  electrodeArea: number             // m²
  
  // Materials
  anodeMaterial: string
  cathodeMaterial: string
  membrane?: string
  
  // Operating conditions
  temperature: number               // °C
  pH: number
  substrateConcentration: number    // g/L
  
  // Microbial parameters
  microbialSpecies: string[]
  consortiumType?: 'pure' | 'mixed'
}

export interface PredictionResult {
  powerDensity: {
    value: number                   // mW/m²
    confidence: number              // 0-1
    range: [number, number]         // Confidence interval
  }
  currentDensity: {
    value: number                   // mA/cm²
    confidence: number
    range: [number, number]
  }
  efficiency: {
    coulombic: number               // %
    energy: number                  // %
    confidence: number
  }
  factors: {
    temperature: number             // Contribution factor
    pH: number
    substrate: number
    materials: number
    microbes: number
  }
  recommendations: string[]         // Optimization suggestions
  scientificBasis: string[]         // Reference papers
}
```

### 2. Feature Engineering
**Location**: `lib/features/engineering.ts`

```typescript
export class FeatureEngineer {
  extractFeatures(input: PredictionInput): FeatureVector {
    return {
      // Physical parameters
      volumetricPowerDensity: this.calculateVolumetricRatio(input),
      electrodeSpacing: this.calculateSpacing(input),
      aspectRatio: this.calculateAspectRatio(input),
      
      // Material features
      anodeConductivity: this.getMaterialProperty(input.anodeMaterial, 'conductivity'),
      cathodeCatalysis: this.getCatalyticActivity(input.cathodeMaterial),
      biocompatibility: this.calculateBiocompatibility(input),
      
      // Environmental features
      temperatureFactor: this.applyArrheniusCorrection(input.temperature),
      pHOptimality: this.calculatePHEffect(input.pH),
      substrateKinetics: this.applyMonodKinetics(input.substrateConcentration),
      
      // Microbial features
      speciesDiversity: this.calculateDiversity(input.microbialSpecies),
      electronTransferRate: this.getElectronTransferRate(input.microbialSpecies),
      growthRate: this.getGrowthRate(input.microbialSpecies),
      
      // Interaction terms
      materialMicrobeCompatibility: this.calculateCompatibility(input),
      synergisticEffects: this.calculateSynergy(input)
    }
  }
}
```

### 3. Scientific Models
**Location**: `packages/@messai/core/src/power-calculator.ts`

```typescript
export class PowerCalculator {
  // Arrhenius temperature correction
  private applyTemperatureCorrection(baseRate: number, temperature: number): number {
    const activationEnergy = 35000 // J/mol (typical for bioelectrochemical reactions)
    const gasConstant = 8.314      // J/(mol·K)
    const referenceTemp = 298.15   // K (25°C)
    
    const tempKelvin = temperature + 273.15
    const factor = Math.exp(
      (activationEnergy / gasConstant) * (1/referenceTemp - 1/tempKelvin)
    )
    
    return baseRate * factor
  }
  
  // pH effect using bell curve
  private calculatePHEffect(pH: number): number {
    const optimalPH = 7.0
    const tolerance = 1.5
    
    const deviation = Math.abs(pH - optimalPH)
    if (deviation > tolerance * 2) return 0.1 // Extreme pH
    
    return Math.exp(-Math.pow(deviation / tolerance, 2))
  }
  
  // Monod kinetics for substrate limitation
  private applySubstrateKinetics(concentration: number): number {
    const maxRate = 1.0
    const halfSaturation = 0.5 // g/L
    
    return maxRate * concentration / (halfSaturation + concentration)
  }
}
```

### 4. Machine Learning Models
**Location**: `packages/@messai/ml-core/src/models/`

```typescript
// Neural network for performance prediction
export class PerformancePredictionModel {
  private model: tf.LayersModel
  
  async loadModel(modelPath: string): Promise<void> {
    this.model = await tf.loadLayersModel(modelPath)
  }
  
  async predict(features: FeatureVector): Promise<MLPrediction> {
    const inputTensor = tf.tensor2d([features.values])
    const prediction = this.model.predict(inputTensor) as tf.Tensor
    const result = await prediction.data()
    
    inputTensor.dispose()
    prediction.dispose()
    
    return {
      powerDensity: result[0],
      currentDensity: result[1],
      efficiency: result[2],
      uncertainty: result[3]
    }
  }
}
```

## Confidence Calculation

### Uncertainty Quantification
```typescript
export class ConfidenceCalculator {
  calculateConfidence(prediction: Prediction, features: FeatureVector): number {
    const factors = {
      // Model uncertainty (epistemic)
      modelUncertainty: this.calculateModelUncertainty(features),
      
      // Data uncertainty (aleatoric)  
      dataUncertainty: this.calculateDataUncertainty(features),
      
      // Feature quality
      featureQuality: this.assessFeatureQuality(features),
      
      // Scientific validation
      scientificSupport: this.getScientificSupport(features)
    }
    
    // Weighted combination
    return this.combineUncertainties(factors)
  }
  
  private calculateModelUncertainty(features: FeatureVector): number {
    // Distance from training data distribution
    const distance = this.calculateMahalanobisDistance(features)
    return Math.exp(-distance / this.uncertaintyScale)
  }
}
```

## Validation and Testing

### Model Validation
```typescript
describe('Predictions Engine', () => {
  it('should predict within known ranges', async () => {
    const input: PredictionInput = {
      systemType: 'MFC',
      volume: 1.0,
      electrodeArea: 0.1,
      anodeMaterial: 'carbon_cloth',
      cathodeMaterial: 'platinum',
      temperature: 30,
      pH: 7.0,
      substrateConcentration: 1.0,
      microbialSpecies: ['Geobacter sulfurreducens']
    }
    
    const result = await predictPerformance(input)
    
    // Validate against literature ranges
    expect(result.powerDensity.value).toBeGreaterThan(0)
    expect(result.powerDensity.value).toBeLessThan(5000) // mW/m²
    expect(result.powerDensity.confidence).toBeGreaterThan(0.5)
  })
  
  it('should handle extreme conditions gracefully', async () => {
    const extremeInput = {
      ...baseInput,
      temperature: 80, // Extreme temperature
      pH: 2.0          // Extreme pH
    }
    
    const result = await predictPerformance(extremeInput)
    expect(result.powerDensity.confidence).toBeLessThan(0.3)
  })
})
```

### Cross-Validation with Research Papers
```typescript
export class ResearchValidation {
  async validateAgainstPapers(): Promise<ValidationReport> {
    const papers = await this.getValidationPapers()
    const results = []
    
    for (const paper of papers) {
      const predicted = await this.predictFromPaper(paper)
      const actual = this.extractActualResults(paper)
      
      const accuracy = this.calculateAccuracy(predicted, actual)
      results.push({ paper: paper.doi, accuracy })
    }
    
    return this.generateReport(results)
  }
}
```

## Performance Optimization

### Caching Strategy
```typescript
export class PredictionCache {
  private cache = new Map<string, CachedPrediction>()
  
  async getPrediction(input: PredictionInput): Promise<PredictionResult> {
    const key = this.generateCacheKey(input)
    const cached = this.cache.get(key)
    
    if (cached && !this.isExpired(cached)) {
      return cached.result
    }
    
    const result = await this.computePrediction(input)
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      ttl: 3600000 // 1 hour
    })
    
    return result
  }
}
```

### Batch Processing
```typescript
export class BatchPredictor {
  async predictBatch(inputs: PredictionInput[]): Promise<PredictionResult[]> {
    const batchSize = 32
    const results = []
    
    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize)
      const batchResults = await this.processBatch(batch)
      results.push(...batchResults)
    }
    
    return results
  }
}
```

## Integration Points

### Research System Integration
- Validate predictions against research paper data
- Use research trends to improve models
- Incorporate new findings automatically
- Generate confidence based on literature support

### Laboratory System Integration
- Real-time predictions during experiments
- Optimization suggestions for equipment settings
- Performance forecasting for experiments
- Anomaly detection for unusual readings

### API Integration
**Endpoint**: `/api/predictions`

```typescript
POST /api/predictions/single      // Single prediction
POST /api/predictions/batch       // Batch predictions
GET  /api/predictions/models      // Available models
POST /api/predictions/validate    // Validate against known data
GET  /api/predictions/confidence  // Confidence metrics
```

## Future Enhancements

### Advanced Models
- Ensemble methods combining multiple models
- Time series predictions for long-term performance
- Transfer learning for new system types
- Bayesian neural networks for uncertainty quantification

### Real-Time Features
- Streaming predictions for live data
- Online learning from new experiments
- Adaptive models that improve with usage
- Real-time model updates

---

*This documentation provides comprehensive guidance for understanding, implementing, and extending the AI predictions engine.*