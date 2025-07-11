#!/usr/bin/env npx tsx

import * as fs from 'fs'
import * as path from 'path'
import { z } from 'zod'

/**
 * Unified Parameter System Builder
 * 
 * This script combines all parameter sources into a single comprehensive JSON file:
 * - MESS_PARAMETER_LIBRARY.md (1,500+ parameters)
 * - mess-parameters-json.json (500+ structured parameters)
 * - parameter-ranges.json (validation rules)
 * - parameter-mapping-integration.md (integration mappings)
 */

// Parameter schema for validation
const ParameterSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string().optional(),
  type: z.enum(['number', 'string', 'boolean', 'select', 'array', 'object']),
  range: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  options: z.array(z.string()).optional(),
  default: z.any().optional(),
  description: z.string(),
  dependencies: z.array(z.string()).optional(),
  references: z.array(z.string()).optional(),
  // Validation rules
  validation_rules: z.array(z.string()).optional(),
  typical_range: z.object({
    min: z.number(),
    max: z.number()
  }).optional(),
  outlier_threshold: z.number().optional(),
  // Compatibility
  compatibility: z.object({
    materials: z.array(z.string()).optional(),
    microbes: z.array(z.string()).optional(),
    environments: z.array(z.string()).optional(),
    systemTypes: z.array(z.string()).optional()
  }).optional()
})

const SubcategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  electrodeType: z.enum(['anode', 'cathode', 'both']).optional(),
  parameters: z.array(ParameterSchema)
})

const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  description: z.string(),
  subcategories: z.array(SubcategorySchema)
})

const UnifiedParametersSchema = z.object({
  metadata: z.object({
    version: z.string(),
    lastUpdated: z.string(),
    totalParameters: z.number(),
    majorCategories: z.number(),
    subcategories: z.number(),
    sources: z.object({
      library: z.string(),
      json: z.string(),
      validation: z.string(),
      integration: z.string()
    })
  }),
  categories: z.array(CategorySchema),
  validation_rules: z.record(z.any()),
  compatibility_matrices: z.record(z.any()),
  integration_mapping: z.record(z.any())
})

// Read existing parameter sources
function readParameterSources() {
  const basePath = '/Users/samfrons/Desktop/Messai'
  
  // Read markdown library
  const libraryMd = fs.readFileSync(path.join(basePath, 'MESS_PARAMETER_LIBRARY.md'), 'utf-8')
  
  // Read JSON parameters
  let jsonParams
  try {
    const jsonContent = fs.readFileSync(path.join(basePath, 'mess-parameters-json.json'), 'utf-8')
    // Check if JSON is truncated
    if (!jsonContent.trim().endsWith('}')) {
      console.warn('⚠️  JSON file appears to be truncated, attempting to fix...')
      // For now, we'll use an empty structure
      jsonParams = { messParametersSchema: { categories: [] } }
    } else {
      jsonParams = JSON.parse(jsonContent)
    }
  } catch (error) {
    console.warn('⚠️  Could not parse mess-parameters-json.json, using empty structure')
    jsonParams = { messParametersSchema: { categories: [] } }
  }
  
  // Read validation rules
  const validationRules = JSON.parse(
    fs.readFileSync(path.join(basePath, 'reference/validation/parameter-ranges.json'), 'utf-8')
  )
  
  // Read integration mapping
  const integrationMd = fs.readFileSync(
    path.join(basePath, 'scripts/research/parameter-mapping-integration.md'), 'utf-8'
  )
  
  return { libraryMd, jsonParams, validationRules, integrationMd }
}

// Parse markdown tables to extract parameters
function parseMarkdownTable(tableText: string): any[] {
  const lines = tableText.trim().split('\n')
  if (lines.length < 3) return []
  
  // Extract headers
  const headers = lines[0].split('|').map(h => h.trim()).filter(h => h)
  
  // Skip separator line
  const dataLines = lines.slice(2)
  
  return dataLines.map(line => {
    const values = line.split('|').map(v => v.trim()).filter(v => v)
    const obj: any = {}
    headers.forEach((header, i) => {
      const key = header.toLowerCase().replace(/\s+/g, '_')
      obj[key] = values[i] || ''
    })
    return obj
  })
}

// Convert MESS_PARAMETER_LIBRARY.md to structured JSON
function convertLibraryToJSON(libraryMd: string) {
  const categories: any[] = []
  
  // Split by major sections (## 2. Environmental Parameters, etc.)
  const majorSections = libraryMd.split(/^## \d+\. /m).slice(1)
  
  majorSections.forEach(section => {
    const lines = section.split('\n')
    const categoryName = lines[0].trim()
    
    // Skip introduction and appendices
    if (categoryName.includes('Introduction') || categoryName.includes('Appendices')) {
      return
    }
    
    const categoryId = categoryName.toLowerCase().replace(/[&\s]+/g, '-').replace(/-+/g, '-')
    
    const category = {
      id: categoryId,
      name: categoryName,
      description: '',
      subcategories: []
    }
    
    // Find subcategories (### 2.1 Atmospheric & Ambient Conditions)
    const subcategorySections = section.split(/^### \d+\.\d+ /m).slice(1)
    
    subcategorySections.forEach(subSection => {
      const subLines = subSection.split('\n')
      const subcategoryName = subLines[0].trim()
      const subcategoryId = subcategoryName.toLowerCase().replace(/[&\s]+/g, '-').replace(/-+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      const subcategory: any = {
        id: subcategoryId,
        name: subcategoryName,
        parameters: []
      }
      
      // Find parameter tables
      const tableMatches = subSection.match(/\|[^|]+\|[^|]+\|[\s\S]*?\n(?=\n[^|]|$)/g)
      
      if (tableMatches) {
        tableMatches.forEach(tableText => {
          const params = parseMarkdownTable(tableText)
          params.forEach(param => {
            // Convert markdown parameter to our schema
            const parameter = {
              id: param.parameter?.replace(/`/g, '').toLowerCase().replace(/[\s\-\.]/g, '_').replace(/[^a-z0-9_]/g, '') || '',
              name: param.parameter?.replace(/`/g, '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || '',
              unit: param.unit || undefined,
              type: param.type || 'number',
              description: param.description || '',
              range: param.range ? parseRange(param.range) : undefined,
              default: param.default ? parseDefault(param.default, param.type) : undefined
            }
            
            if (parameter.id) {
              subcategory.parameters.push(parameter)
            }
          })
        })
      }
      
      if (subcategory.parameters.length > 0) {
        category.subcategories.push(subcategory)
      }
    })
    
    if (category.subcategories.length > 0) {
      categories.push(category)
    }
  })
  
  return categories
}

// Parse range string like "-50 to 60" or "0-100"
function parseRange(rangeStr: string): { min?: number; max?: number } {
  const match = rangeStr.match(/(-?\d+(?:\.\d+)?)\s*(?:to|-)\s*(-?\d+(?:\.\d+)?)/)
  if (match) {
    return {
      min: parseFloat(match[1]),
      max: parseFloat(match[2])
    }
  }
  return {}
}

// Parse default value based on type
function parseDefault(defaultStr: string, type: string): any {
  if (type === 'number') {
    return parseFloat(defaultStr)
  } else if (type === 'boolean') {
    return defaultStr.toLowerCase() === 'true'
  }
  return defaultStr
}

// Merge validation rules into parameters
function mergeValidationRules(categories: any[], validationRules: any) {
  categories.forEach(category => {
    category.subcategories.forEach((subcategory: any) => {
      subcategory.parameters.forEach((param: any) => {
        // Find matching validation rule
        const ruleKey = Object.keys(validationRules.categories)
          .flatMap(cat => Object.keys(validationRules.categories[cat]))
          .find(key => key === param.id || key.replace(/_/g, '-') === param.id)
        
        if (ruleKey) {
          const categoryKey = Object.keys(validationRules.categories).find(cat => 
            validationRules.categories[cat][ruleKey]
          )
          
          if (categoryKey) {
            const rule = validationRules.categories[categoryKey][ruleKey]
            param.validation_rules = rule.validation_rules
            param.typical_range = rule.typical_range
            param.outlier_threshold = rule.outlier_threshold
          }
        }
      })
    })
  })
  
  return categories
}

// Merge existing JSON parameters
function mergeJsonParameters(categories: any[], jsonParams: any) {
  // Add any missing parameters from json file
  jsonParams.messParametersSchema.categories.forEach((jsonCategory: any) => {
    let category = categories.find(c => c.id === jsonCategory.id)
    
    if (!category) {
      // Add entire category if missing
      category = {
        id: jsonCategory.id,
        name: jsonCategory.name,
        icon: jsonCategory.icon,
        description: jsonCategory.description,
        subcategories: []
      }
      categories.push(category)
    } else {
      // Update icon if present
      if (jsonCategory.icon) {
        category.icon = jsonCategory.icon
      }
    }
    
    jsonCategory.subcategories.forEach((jsonSubcat: any) => {
      let subcategory = category.subcategories.find((s: any) => s.id === jsonSubcat.id)
      
      if (!subcategory) {
        subcategory = {
          id: jsonSubcat.id,
          name: jsonSubcat.name,
          parameters: []
        }
        category.subcategories.push(subcategory)
      }
      
      // Copy electrode type if present
      if (jsonSubcat.electrodeType) {
        subcategory.electrodeType = jsonSubcat.electrodeType
      }
      
      // Merge parameters
      jsonSubcat.parameters.forEach((jsonParam: any) => {
        let param = subcategory.parameters.find((p: any) => p.id === jsonParam.id)
        
        if (!param) {
          subcategory.parameters.push(jsonParam)
        } else {
          // Merge additional fields
          if (jsonParam.options) param.options = jsonParam.options
          if (jsonParam.properties) param.properties = jsonParam.properties
          if (jsonParam.pattern) param.pattern = jsonParam.pattern
        }
      })
    })
  })
  
  return categories
}

// Add compatibility matrices
function addCompatibilityMatrices(validationRules: any) {
  return validationRules.compatibility_rules || {}
}

// Create integration mappings
function createIntegrationMappings() {
  return {
    "database_field_mappings": {
      "powerOutput": ["power-density", "power_density_volumetric", "electrical-output.power"],
      "efficiency": ["coulombic-efficiency", "energy-recovery", "efficiency.coulombic"],
      "experimentalConditions": {
        "temperature": ["operating_temperature", "temperature", "environmental.temperature"],
        "pH": ["ph", "ph_setpoint", "environmental.ph"],
        "duration": ["operation_duration", "experiment_duration"],
        "substrate": ["substrate-concentration", "cod-content", "substrate.concentration"]
      },
      "reactorConfiguration": {
        "volume": ["volume", "cell_volume", "reactor_volume"],
        "design": ["chamber-type", "cell_type", "reactor_design"],
        "dimensions": ["geometry", "dimensions", "reactor_dimensions"]
      },
      "electrodeSpecifications": {
        "anodeArea": ["anode-area", "anode_surface_area"],
        "cathodeArea": ["cathode-area", "cathode_surface_area"],
        "spacing": ["anode-cathode-distance", "electrode-spacing"],
        "modifications": ["anode-modifications", "cathode-modifications"]
      }
    },
    "extraction_patterns": {
      "power_density": {
        "patterns": [
          "/(\\d+(?:\\.\\d+)?)\\s*(?:±\\s*\\d+(?:\\.\\d+)?)?\\s*(mW\\/m[²2]|W\\/m[²2])/gi",
          "/power\\s+density[:\\s]+(\\d+(?:\\.\\d+)?)/gi"
        ],
        "unit_conversions": {
          "mW/m²": 1,
          "W/m²": 1000,
          "mW/cm²": 10000,
          "W/m³": 1
        }
      },
      "efficiency": {
        "patterns": [
          "/(\\d+(?:\\.\\d+)?)\\s*(?:±\\s*\\d+(?:\\.\\d+)?)?\\s*%\\s*(?:coulombic|CE|energy)/gi",
          "/efficiency[:\\s]+(\\d+(?:\\.\\d+)?)/gi"
        ]
      }
    },
    "quality_scoring": {
      "parameter_weights": {
        "performance_metrics": 0.25,
        "electrode_configuration": 0.20,
        "operating_conditions": 0.15,
        "biological_parameters": 0.15,
        "material_properties": 0.15,
        "monitoring_data": 0.10
      },
      "completeness_thresholds": {
        "excellent": 0.80,
        "good": 0.60,
        "fair": 0.40,
        "poor": 0.20
      }
    }
  }
}

// Count total parameters
function countParameters(categories: any[]): number {
  return categories.reduce((total, category) => {
    return total + category.subcategories.reduce((catTotal: number, subcat: any) => {
      return catTotal + subcat.parameters.length
    }, 0)
  }, 0)
}

// Main unification function
async function unifyParameters() {
  console.log('Starting parameter unification...')
  
  try {
    // Read all sources
    const { libraryMd, jsonParams, validationRules, integrationMd } = readParameterSources()
    console.log('✓ Read all parameter sources')
    
    // Convert library to JSON
    let categories = convertLibraryToJSON(libraryMd)
    console.log(`✓ Converted ${categories.length} categories from MESS_PARAMETER_LIBRARY.md`)
    
    // Merge validation rules
    categories = mergeValidationRules(categories, validationRules)
    console.log('✓ Merged validation rules')
    
    // Merge JSON parameters
    categories = mergeJsonParameters(categories, jsonParams)
    console.log('✓ Merged existing JSON parameters')
    
    // Count parameters
    const totalParameters = countParameters(categories)
    const totalSubcategories = categories.reduce((total, cat) => total + cat.subcategories.length, 0)
    
    // Create unified structure
    const unifiedParameters = {
      metadata: {
        version: "2.0.0",
        lastUpdated: new Date().toISOString().split('T')[0],
        totalParameters,
        majorCategories: categories.length,
        subcategories: totalSubcategories,
        sources: {
          library: "MESS_PARAMETER_LIBRARY.md v1.0.0",
          json: "mess-parameters-json.json v1.0.0",
          validation: "parameter-ranges.json v1.0.0",
          integration: "parameter-mapping-integration.md v1.0.0"
        }
      },
      categories,
      validation_rules: validationRules.categories || {},
      compatibility_matrices: addCompatibilityMatrices(validationRules),
      integration_mapping: createIntegrationMappings()
    }
    
    // Validate structure
    const validated = UnifiedParametersSchema.parse(unifiedParameters)
    console.log('✓ Validated unified structure')
    
    // Write unified file
    const outputPath = '/Users/samfrons/Desktop/Messai/parameters/MESS_PARAMETERS_UNIFIED.json'
    fs.writeFileSync(outputPath, JSON.stringify(validated, null, 2))
    console.log(`✓ Written unified parameters to ${outputPath}`)
    
    // Summary
    console.log('\n📊 Unification Summary:')
    console.log(`   Total Parameters: ${totalParameters}`)
    console.log(`   Major Categories: ${categories.length}`)
    console.log(`   Subcategories: ${totalSubcategories}`)
    console.log(`   File Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`)
    
  } catch (error) {
    console.error('❌ Error during unification:', error)
    process.exit(1)
  }
}

// Run unification
unifyParameters()