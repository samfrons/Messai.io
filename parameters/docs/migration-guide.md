# Migration Guide - Unified Parameter System

## Overview

This guide helps you migrate from the previous parameter system (separate JSON files) to the new unified parameter system.

## What's Changed

### Before (Multiple Files)
- `mess-parameters-json.json` - 500+ parameters
- `parameter-ranges.json` - Validation rules
- `parameter-mapping-integration.md` - Integration docs
- Manual parameter extraction and validation

### After (Unified System)
- `MESS_PARAMETERS_UNIFIED.json` - 1,500+ parameters with everything integrated
- JSON Schema validation
- Built-in compatibility checking
- Automated extraction patterns

## Migration Steps

### 1. Update Import Statements

**Before:**
```typescript
import messParams from '@/mess-parameters-json.json'
import validationRules from '@/reference/validation/parameter-ranges.json'
```

**After:**
```typescript
import parameters from '@/parameters/MESS_PARAMETERS_UNIFIED.json'
```

### 2. Update Parameter Access

**Before:**
```typescript
// Access parameters from JSON file
const powerDensity = messParams.messParametersSchema.categories
  .find(c => c.id === 'performance-metrics')
  ?.subcategories.find(s => s.id === 'electrical-output')
  ?.parameters.find(p => p.id === 'power-density')

// Access validation rules separately
const powerValidation = validationRules.categories.electrical.power_density
```

**After:**
```typescript
// Everything in one place
import { findParameter } from '@/lib/parameters'

const powerDensity = findParameter('power_density')
// Includes validation rules, ranges, compatibility, etc.
```

### 3. Update Validation Logic

**Before:**
```typescript
function validatePower(value: number): boolean {
  const rule = validationRules.categories.electrical.power_density
  return value >= rule.valid_range.min && value <= rule.valid_range.max
}
```

**After:**
```typescript
import { validateParameterValue } from '@/lib/parameters'

function validatePower(value: number): boolean {
  return validateParameterValue('power_density', value)
}
```

### 4. Update API Endpoints

**Before:**
```typescript
// app/api/parameters/route.ts
export async function GET() {
  const params = await import('@/mess-parameters-json.json')
  return Response.json(params.messParametersSchema)
}
```

**After:**
```typescript
// app/api/parameters/route.ts
import parameters from '@/parameters/MESS_PARAMETERS_UNIFIED.json'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  
  if (category) {
    const categoryData = parameters.categories.find(c => c.id === category)
    return Response.json(categoryData || null)
  }
  
  return Response.json({
    metadata: parameters.metadata,
    categories: parameters.categories.map(c => ({
      id: c.id,
      name: c.name,
      parameterCount: c.subcategories.reduce((sum, s) => sum + s.parameters.length, 0)
    }))
  })
}
```

### 5. Update Components

**Before:**
```typescript
// components/ParameterForm.tsx
import messParams from '@/mess-parameters-json.json'

export function ParameterForm() {
  const categories = messParams.messParametersSchema.categories
  // ...
}
```

**After:**
```typescript
// components/ParameterForm.tsx
import parameters from '@/parameters/MESS_PARAMETERS_UNIFIED.json'
import { validateParameterValue } from '@/lib/parameters'

export function ParameterForm() {
  const categories = parameters.categories
  
  const handleParameterChange = (paramId: string, value: any) => {
    if (!validateParameterValue(paramId, value)) {
      // Show validation error
      return
    }
    // Process valid value
  }
  // ...
}
```

## Utility Functions

Create these helper functions in `lib/parameters.ts`:

```typescript
import parameters from '@/parameters/MESS_PARAMETERS_UNIFIED.json'

export function findParameter(parameterId: string) {
  for (const category of parameters.categories) {
    for (const subcategory of category.subcategories) {
      const param = subcategory.parameters.find(p => p.id === parameterId)
      if (param) return param
    }
  }
  return null
}

export function getParametersByCategory(categoryId: string) {
  const category = parameters.categories.find(c => c.id === categoryId)
  return category?.subcategories.flatMap(s => s.parameters) || []
}

export function validateParameterValue(parameterId: string, value: any): boolean {
  const param = findParameter(parameterId)
  if (!param) return false
  
  // Type checking
  if (param.type === 'number' && typeof value !== 'number') return false
  if (param.type === 'string' && typeof value !== 'string') return false
  if (param.type === 'boolean' && typeof value !== 'boolean') return false
  
  // Range checking
  if (param.type === 'number' && param.range) {
    if (param.range.min !== undefined && value < param.range.min) return false
    if (param.range.max !== undefined && value > param.range.max) return false
  }
  
  // Options checking
  if (param.type === 'select' && param.options) {
    if (!param.options.includes(value)) return false
  }
  
  return true
}

export function getParameterValidationMessage(parameterId: string, value: any): string | null {
  const param = findParameter(parameterId)
  if (!param) return 'Unknown parameter'
  
  if (!validateParameterValue(parameterId, value)) {
    if (param.type === 'number' && param.range) {
      return `Value must be between ${param.range.min} and ${param.range.max} ${param.unit || ''}`
    }
    if (param.type === 'select' && param.options) {
      return `Value must be one of: ${param.options.join(', ')}`
    }
    return `Invalid ${param.type} value`
  }
  
  return null
}
```

## Database Migration

If you have existing data using old parameter IDs, run this migration:

```typescript
// scripts/migrate-parameters.ts
import prisma from '@/lib/db'
import parameters from '@/parameters/MESS_PARAMETERS_UNIFIED.json'

// Mapping of old IDs to new IDs
const ID_MAPPINGS: Record<string, string> = {
  'power-density': 'power_density',
  'current-density': 'current_density',
  'coulombic-efficiency': 'coulombic_efficiency',
  // Add more mappings as needed
}

async function migrateParameters() {
  // Get all papers with extracted parameters
  const papers = await prisma.researchPaper.findMany({
    where: {
      extractedParameters: { not: null }
    }
  })
  
  for (const paper of papers) {
    const oldParams = JSON.parse(paper.extractedParameters || '{}')
    const newParams: Record<string, any> = {}
    
    // Migrate to new parameter IDs
    for (const [oldId, value] of Object.entries(oldParams)) {
      const newId = ID_MAPPINGS[oldId] || oldId
      newParams[newId] = value
    }
    
    // Update with new version
    await prisma.researchPaper.update({
      where: { id: paper.id },
      data: {
        extractedParameters: JSON.stringify(newParams),
        parameterDataVersion: parameters.metadata.version
      }
    })
  }
  
  console.log(`Migrated ${papers.length} papers to new parameter system`)
}
```

## Testing Migration

1. **Unit Tests**: Update parameter IDs in tests
2. **Integration Tests**: Verify API responses match new structure
3. **Visual Tests**: Check parameter forms display correctly
4. **Data Validation**: Ensure migrated data passes new validation

## Rollback Plan

If issues arise:

1. Keep backup of old parameter files
2. Use feature flag to switch between old/new system
3. Maintain compatibility layer during transition
4. Test thoroughly in staging before production

## Timeline

1. **Week 1**: Update imports and basic functionality
2. **Week 2**: Migrate components and API endpoints
3. **Week 3**: Run data migration and testing
4. **Week 4**: Deploy and monitor

## Support

- Check `parameters/docs/integration-guide.md` for usage examples
- Run validation script to verify data integrity
- Open issues for migration problems