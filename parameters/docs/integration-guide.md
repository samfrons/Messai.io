# MESS Unified Parameter System - Integration Guide

## Overview

The MESS Unified Parameter System consolidates all parameter definitions, validation rules, compatibility matrices, and integration mappings into a single comprehensive JSON file: `MESS_PARAMETERS_UNIFIED.json`.

## Key Features

- **1,500+ Parameters**: Comprehensive coverage of all MESS system parameters
- **Hierarchical Organization**: 13 major categories with 53 subcategories
- **Built-in Validation**: JSON Schema validation with type checking and range validation
- **Compatibility Matrices**: Material-microbe-environment compatibility rules
- **Integration Mappings**: Direct database field mappings for automated extraction
- **Type Safety**: TypeScript interfaces generated from JSON Schema

## File Structure

```
parameters/
├── MESS_PARAMETERS_UNIFIED.json    # Main unified parameter file
├── MESS_PARAMETER_LIBRARY.md       # Human-readable reference
├── schemas/
│   └── parameter.schema.json       # JSON Schema for validation
├── scripts/
│   ├── unify-parameters.ts         # Builds unified file from sources
│   └── validate-parameters.ts      # Validates parameters
└── docs/
    └── integration-guide.md        # This file
```

## Using the Unified Parameters

### 1. Reading Parameters in TypeScript

```typescript
import parameters from '@/parameters/MESS_PARAMETERS_UNIFIED.json'

// Access all parameters
const allCategories = parameters.categories

// Find specific parameter
function findParameter(parameterId: string) {
  for (const category of parameters.categories) {
    for (const subcategory of category.subcategories) {
      const param = subcategory.parameters.find(p => p.id === parameterId)
      if (param) return param
    }
  }
  return null
}

// Get parameters by category
function getParametersByCategory(categoryId: string) {
  const category = parameters.categories.find(c => c.id === categoryId)
  return category?.subcategories.flatMap(s => s.parameters) || []
}
```

### 2. Parameter Validation

```typescript
import Ajv from 'ajv'
import schema from '@/parameters/schemas/parameter.schema.json'
import parameters from '@/parameters/MESS_PARAMETERS_UNIFIED.json'

const ajv = new Ajv()
const validate = ajv.compile(schema)

// Validate entire parameter file
if (!validate(parameters)) {
  console.error('Invalid parameters:', validate.errors)
}

// Validate individual parameter value
function validateParameterValue(parameterId: string, value: any): boolean {
  const param = findParameter(parameterId)
  if (!param) return false
  
  // Type checking
  if (param.type === 'number' && typeof value !== 'number') return false
  if (param.type === 'string' && typeof value !== 'string') return false
  
  // Range checking for numbers
  if (param.type === 'number' && param.range) {
    if (param.range.min !== undefined && value < param.range.min) return false
    if (param.range.max !== undefined && value > param.range.max) return false
  }
  
  // Options checking for select types
  if (param.type === 'select' && param.options) {
    if (!param.options.includes(value)) return false
  }
  
  return true
}
```

### 3. Database Integration

Use the integration mappings to extract parameters from research papers:

```typescript
const mappings = parameters.integration_mapping.database_field_mappings

// Map extracted parameters to database fields
function mapToDatabase(extractedParams: Record<string, any>) {
  const dbRecord: any = {}
  
  // Direct mappings
  if (extractedParams['power-density']) {
    dbRecord.powerOutput = extractedParams['power-density']
  }
  
  // Nested mappings
  dbRecord.experimentalConditions = {
    temperature: extractedParams[mappings.experimentalConditions.temperature[0]],
    pH: extractedParams[mappings.experimentalConditions.pH[0]],
    substrate: extractedParams[mappings.experimentalConditions.substrate[0]]
  }
  
  return dbRecord
}
```

### 4. Compatibility Checking

```typescript
// Check material-microbe compatibility
function checkCompatibility(material: string, microbe: string): boolean {
  const matrices = parameters.compatibility_matrices
  const materialData = matrices.anode_materials?.[material]
  
  if (!materialData) return false
  
  return materialData.compatible_microbes.includes(microbe)
}

// Get compatible materials for a microbe
function getCompatibleMaterials(microbe: string): string[] {
  const matrices = parameters.compatibility_matrices
  const compatible: string[] = []
  
  for (const [material, data] of Object.entries(matrices.anode_materials || {})) {
    if (data.compatible_microbes.includes(microbe)) {
      compatible.push(material)
    }
  }
  
  return compatible
}
```

### 5. Parameter Extraction from Text

```typescript
// Use extraction patterns for research papers
function extractParameters(text: string) {
  const patterns = parameters.integration_mapping.extraction_patterns
  const extracted: Record<string, any> = {}
  
  // Extract power density
  const powerPattern = new RegExp(patterns.power_density.patterns[0].slice(1, -3), 'gi')
  const powerMatch = text.match(powerPattern)
  if (powerMatch) {
    const [, value, unit] = powerMatch
    const multiplier = patterns.power_density.unit_conversions[unit] || 1
    extracted.power_density = parseFloat(value) * multiplier
  }
  
  return extracted
}
```

## API Integration

### Research Paper Enhancement

```typescript
// Enhance paper with structured parameters
async function enhancePaper(paperId: string) {
  const paper = await getPaper(paperId)
  const extractedParams = extractParameters(paper.abstract + ' ' + paper.fullText)
  
  // Validate extracted parameters
  const validatedParams: Record<string, any> = {}
  for (const [paramId, value] of Object.entries(extractedParams)) {
    if (validateParameterValue(paramId, value)) {
      validatedParams[paramId] = value
    }
  }
  
  // Calculate quality score
  const score = calculateParameterScore(validatedParams)
  
  // Update paper record
  await updatePaper(paperId, {
    extractedParameters: validatedParams,
    parameterQualityScore: score,
    parameterDataVersion: parameters.metadata.version
  })
}
```

### Parameter-Based Search

```typescript
// Search papers by parameter values
async function searchByParameters(criteria: Record<string, any>) {
  const query: any = {}
  
  for (const [paramId, value] of Object.entries(criteria)) {
    const param = findParameter(paramId)
    if (!param) continue
    
    // Build query based on parameter type
    if (param.type === 'number' && typeof value === 'object') {
      // Range query
      query[`extractedParameters.${paramId}`] = {
        gte: value.min,
        lte: value.max
      }
    } else {
      // Exact match
      query[`extractedParameters.${paramId}`] = value
    }
  }
  
  return await searchPapers(query)
}
```

## Best Practices

1. **Always Validate**: Use the schema to validate parameters before storage
2. **Version Tracking**: Store the parameter version with extracted data
3. **Graceful Fallbacks**: Handle missing parameters gracefully
4. **Unit Consistency**: Always convert to standard units using conversion tables
5. **Regular Updates**: Re-run unification script when source files change

## Maintenance

### Updating Parameters

1. Edit source files (MESS_PARAMETER_LIBRARY.md, etc.)
2. Run unification script: `npx tsx parameters/scripts/unify-parameters.ts`
3. Validate result: `npx tsx parameters/scripts/validate-parameters.ts`
4. Update version number if changes are significant
5. Run migrations on existing data if needed

### Adding New Parameters

1. Add to appropriate section in MESS_PARAMETER_LIBRARY.md
2. Follow naming conventions (lowercase, underscores)
3. Include all required fields (unit, type, range, description)
4. Add validation rules if applicable
5. Run unification and validation scripts

## TypeScript Types

Generate TypeScript types from the schema:

```bash
npx json-schema-to-typescript parameters/schemas/parameter.schema.json -o types/parameters.d.ts
```

This creates type-safe interfaces for all parameter structures.