# MESSAi Reference System

## Overview

The MESSAi Reference System provides comprehensive documentation, validation, and prediction capabilities for microbial electrochemical systems (MESS). This system integrates 500+ parameters from scientific literature to support research, design, and optimization of bioelectrochemical technologies.

## Quick Start

### API Endpoints

```bash
# Get all parameter categories
curl http://localhost:3001/api/reference/parameters

# Get specific parameter info
curl http://localhost:3001/api/reference/parameters?name=power_density

# Validate a parameter value
curl -X POST http://localhost:3001/api/reference/parameters \
  -H "Content-Type: application/json" \
  -d '{"parameterName": "power_density", "value": 50, "unit": "W/m³"}'

# Check material compatibility
curl -X POST http://localhost:3001/api/reference/materials \
  -H "Content-Type: application/json" \
  -d '{"anodeMaterial": "carbon_cloth", "cathodeMaterial": "platinum"}'

# Get performance prediction
curl -X POST http://localhost:3001/api/reference/predict \
  -H "Content-Type: application/json" \
  -d '{"configuration": {"systemType": "MFC", "anodeMaterial": "carbon_cloth", "cathodeMaterial": "platinum", "temperature": 30, "ph": 7.0}}'
```

### Documentation Access

```bash
# Get documentation index
curl http://localhost:3001/api/reference/documentation

# Get parameter documentation
curl http://localhost:3001/api/reference/documentation?category=electrical&parameter=power-density

# Get material documentation
curl http://localhost:3001/api/reference/documentation?material=carbon-cloth-anode

# Search documentation
curl -X POST http://localhost:3001/api/reference/documentation \
  -H "Content-Type: application/json" \
  -d '{"query": "biofilm conductivity", "categories": ["biological"]}'
```

## System Architecture

```
reference/
├── parameters/           # Parameter documentation
│   ├── electrical/       # Electrical parameters (5 files)
│   ├── biological/       # Biological parameters (5 files)
│   └── materials/        # Material parameters
│       ├── anodes/       # Anode materials (2 files)
│       ├── cathodes/     # Cathode materials (2 files)
│       └── membranes/    # Membrane materials (1 file)
├── design-guides/        # Design optimization guides
│   ├── electrode-optimization.md
│   └── system-configuration.md
├── validation/           # Validation framework
│   ├── parameter-ranges.json
│   └── validation-functions.ts
└── README.md            # This file
```

## Key Features

### 1. Parameter Validation

**Comprehensive Validation Rules:**
- Valid parameter ranges from scientific literature
- Typical operating ranges for practical applications
- Outlier thresholds for data quality control
- Cross-parameter compatibility checks

**Example Validation:**
```typescript
import { validateParameter } from '@/reference/validation/validation-functions'

const result = validateParameter('power_density', 150, 'W/m³')
// Returns: { isValid: true, warnings: ["Value 150 outside typical range [5, 100]"], errors: [], suggestions: [] }
```

### 2. Material Compatibility

**Electrode Material Database:**
- **Anodes**: Carbon cloth, graphite felt, carbon nanotubes, MXenes
- **Cathodes**: Platinum, stainless steel, air cathodes, carbon with Pt catalyst
- **Compatibility Matrix**: Microorganism compatibility, operating conditions
- **Performance Factors**: Based on literature performance data

**Example Compatibility Check:**
```typescript
import { checkMaterialCompatibility } from '@/reference/validation/validation-functions'

const result = checkMaterialCompatibility('carbon_cloth', 'platinum', 'G. sulfurreducens')
// Returns compatibility analysis with warnings, suggestions, and performance notes
```

### 3. Performance Prediction

**Multi-System Support:**
- **MFC**: Power generation and wastewater treatment
- **MEC**: Hydrogen production with applied voltage
- **MDC**: Simultaneous desalination and power generation
- **MES**: Chemical production via electrosynthesis

**Prediction Features:**
- Literature-based performance models
- Material enhancement factors
- Operating condition optimization
- Economic analysis integration
- Confidence scoring for reliability

### 4. Scientific Documentation

**15 Comprehensive Parameter Documents:**
- Electrical parameters (power density, current density, voltage, efficiency, resistance)
- Biological parameters (communities, biofilm, substrates, electron transfer, kinetics)
- Material specifications with preparation methods and performance data
- Design guides for optimization and configuration

## Parameter Categories

### Electrical Parameters (5 documents)
- **Power Density**: 5-100 W/m³ typical, measurement methods, optimization strategies
- **Current Density**: 0.1-10 A/m² typical, electrode area considerations
- **Voltage Output**: 0.2-0.8 V typical, thermodynamic limits, loss analysis
- **Coulombic Efficiency**: 20-90% typical, electron balance calculations
- **Internal Resistance**: 10-1,000 Ω typical, component analysis

### Biological Parameters (5 documents)
- **Microbial Communities**: Species diversity, cell density, quorum sensing
- **Biofilm Properties**: Thickness (10-200 μm), conductivity, EPS content
- **Substrate Utilization**: Concentration effects, kinetics, COD relationships
- **Electron Transfer**: Direct contact, nanowires, mediator-based mechanisms
- **Growth Kinetics**: Growth rates, doubling times, yield coefficients

### Material Parameters (5 documents)
- **Carbon Cloth Anode**: Biocompatibility, surface area, modification methods
- **MXene Ti₃C₂Tₓ Anode**: 2D material properties, synthesis, performance benefits
- **Platinum Cathode**: Catalytic properties, cost analysis, optimization
- **Air Cathode**: Gas diffusion, water management, environmental factors
- **Proton Exchange Membrane**: Transport properties, pretreatment, alternatives

## API Reference

### Parameters API (`/api/reference/parameters`)

**GET Requests:**
- `GET /api/reference/parameters` - List all categories
- `GET /api/reference/parameters?category=electrical` - Get category parameters
- `GET /api/reference/parameters?name=power_density` - Get specific parameter

**POST Requests:**
- Validate single parameter: `{"parameterName": "power_density", "value": 50, "unit": "W/m³"}`
- Validate configuration: `{"configuration": {...}}`

### Materials API (`/api/reference/materials`)

**GET Requests:**
- `GET /api/reference/materials` - List all materials
- `GET /api/reference/materials?type=anode` - Get anode materials
- `GET /api/reference/materials?type=cathode&material=platinum` - Get specific material

**POST Requests:**
- Check compatibility: `{"anodeMaterial": "carbon_cloth", "cathodeMaterial": "platinum", "microorganism": "G. sulfurreducens"}`

### Prediction API (`/api/reference/predict`)

**GET Requests:**
- `GET /api/reference/predict` - Get prediction model information

**POST Requests:**
- Generate prediction: `{"configuration": {"systemType": "MFC", "anodeMaterial": "carbon_cloth", "cathodeMaterial": "platinum", "temperature": 30, "ph": 7.0}}`

### Documentation API (`/api/reference/documentation`)

**GET Requests:**
- `GET /api/reference/documentation` - Documentation index
- `GET /api/reference/documentation?category=electrical&parameter=power-density` - Parameter docs
- `GET /api/reference/documentation?material=carbon-cloth-anode` - Material docs
- `GET /api/reference/documentation?guide=electrode-optimization` - Design guides

**POST Requests:**
- Search documentation: `{"query": "biofilm conductivity", "categories": ["biological"], "limit": 10}`

## Usage Examples

### 1. System Design Workflow

```typescript
// 1. Get available materials
const materials = await fetch('/api/reference/materials').then(r => r.json())

// 2. Check compatibility
const compatibility = await fetch('/api/reference/materials', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    anodeMaterial: 'carbon_cloth',
    cathodeMaterial: 'platinum',
    microorganism: 'G. sulfurreducens'
  })
}).then(r => r.json())

// 3. Validate configuration
const validation = await fetch('/api/reference/parameters', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    configuration: {
      systemType: 'MFC',
      anodeMaterial: 'carbon_cloth',
      cathodeMaterial: 'platinum',
      temperature: 30,
      ph: 7.0
    }
  })
}).then(r => r.json())

// 4. Get performance prediction
const prediction = await fetch('/api/reference/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    configuration: {
      systemType: 'MFC',
      anodeMaterial: 'carbon_cloth',
      cathodeMaterial: 'platinum',
      temperature: 30,
      ph: 7.0
    }
  })
}).then(r => r.json())
```

### 2. Research Data Validation

```typescript
// Validate experimental parameters
const parameters = [
  { name: 'power_density', value: 85, unit: 'W/m³' },
  { name: 'current_density', value: 5.2, unit: 'A/m²' },
  { name: 'voltage_output', value: 0.65, unit: 'V' }
]

for (const param of parameters) {
  const result = await fetch('/api/reference/parameters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(param)
  }).then(r => r.json())
  
  if (!result.validation.isValid) {
    console.log(`Parameter ${param.name}: ${result.validation.errors.join(', ')}`)
  }
}
```

### 3. Documentation Search

```typescript
// Search for biofilm-related information
const searchResults = await fetch('/api/reference/documentation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'biofilm conductivity',
    categories: ['biological'],
    limit: 5
  })
}).then(r => r.json())

searchResults.results.forEach(result => {
  console.log(`${result.category}/${result.file}: ${result.context}`)
})
```

## Integration with MESSAi Platform

### Bioreactor Tool Integration

The reference system integrates with the bioreactor design tool:
```typescript
// In bioreactor tool component
import { validateConfiguration, predictPerformance } from '@/reference/validation/validation-functions'

const onConfigurationChange = (config) => {
  const validation = validateConfiguration(config)
  const prediction = predictPerformance(config)
  
  setValidationResults(validation)
  setPerformancePrediction(prediction)
}
```

### Electroanalytical Tool Integration

Performance predictions enhance electroanalytical visualizations:
```typescript
// Real-time prediction updates for 3D models
const updateVisualization = (config) => {
  const prediction = predictPerformance(config)
  
  update3DModel({
    powerDensity: prediction.powerDensity,
    efficiency: prediction.efficiency,
    materialFactors: prediction.materialFactors
  })
}
```

### Parameter Database Integration

All platform predictions use validated parameter ranges:
```typescript
// Platform-wide parameter validation
import { getValidationRules } from '@/reference/validation/validation-functions'

const parameterSchema = getValidationRules()
// Use schema for form validation, API validation, and user guidance
```

## Data Sources and Validation

### Scientific Literature Base

**Primary Sources:**
- Logan, B.E. (2008). Microbial Fuel Cells - foundational MFC research
- Rabaey, K. & Rozendal, R.A. (2010). Microbial electrosynthesis - MES fundamentals
- Wang, H. & Ren, Z.J. (2013). Bioelectrochemical metal recovery - MDC applications
- Anasori, B. et al. (2017). 2D Metal Carbides (MXenes) - advanced materials
- 50+ additional peer-reviewed papers in parameter documentation

**Validation Standards:**
- All parameters must have literature verification
- Ranges based on multiple independent studies
- Confidence scores reflect data availability and consistency
- Outlier detection based on statistical analysis of literature data

### Quality Assurance

**Parameter Validation:**
- Cross-referenced with multiple literature sources
- Validated against experimental databases
- Regular updates with new research findings
- Community contribution and peer review system

**Performance Model Validation:**
- Compared against published experimental results
- Validated across different system types and scales
- Uncertainty quantification and confidence intervals
- Continuous improvement based on platform usage data

## Contributing

### Adding New Parameters

1. **Research Phase**: Gather literature data and establish ranges
2. **Documentation**: Create comprehensive parameter documentation
3. **Validation**: Add parameter to validation-functions.ts
4. **Testing**: Validate against known experimental data
5. **Integration**: Update API endpoints and documentation

### Updating Existing Parameters

1. **Literature Review**: Identify new relevant research
2. **Range Update**: Modify parameter-ranges.json with new data
3. **Documentation Update**: Revise parameter documentation
4. **Validation Testing**: Ensure backwards compatibility
5. **Version Control**: Document changes and version updates

### Material Database Expansion

1. **Material Research**: Comprehensive literature review
2. **Performance Analysis**: Extract quantitative performance data
3. **Compatibility Matrix**: Define microorganism and system compatibility
4. **Documentation Creation**: Full material specification document
5. **API Integration**: Update materials API with new options

## Maintenance and Updates

### Regular Maintenance Tasks

**Monthly:**
- Literature review for new parameter data
- API performance monitoring and optimization
- Documentation accuracy verification
- User feedback integration

**Quarterly:**
- Parameter range validation against new literature
- Prediction model accuracy assessment
- Material database updates
- Performance benchmark updates

**Annually:**
- Comprehensive literature review and systematic update
- Prediction model revalidation and improvement
- Documentation restructuring for improved usability
- Platform integration optimization

### Version Control

**Current Version**: 1.0.0
- Initial comprehensive parameter database
- Complete API implementation
- Full documentation coverage
- Validated prediction models

**Planned Updates**: 1.1.0
- Additional material types (biochar, 2D materials beyond MXenes)
- Enhanced prediction models with machine learning
- Real-time parameter optimization
- Extended literature database

## Support and Documentation

### Getting Help

**Documentation Issues:**
- Check parameter documentation in `reference/parameters/`
- Review design guides in `reference/design-guides/`
- Search documentation via API: `/api/reference/documentation`

**API Issues:**
- Test endpoints with provided curl examples
- Check API response formats in this documentation
- Validate parameter formats against validation schema

**Parameter Questions:**
- Review literature references in parameter documentation
- Check validation rules in `parameter-ranges.json`
- Use material compatibility checking for system design

### Community Resources

**Research Collaboration:**
- Parameter validation community contributions
- Literature review collaboration
- Experimental data sharing protocols
- Peer review system for new additions

**Platform Integration:**
- Developer guides for platform integration
- API client libraries and SDKs
- Example implementations and use cases
- Performance optimization best practices

---

*This reference system represents a collaborative effort to standardize and validate microbial electrochemical systems research. It provides the scientific foundation for the MESSAi platform's predictive capabilities and design optimization tools.*