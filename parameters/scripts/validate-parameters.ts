#!/usr/bin/env npx tsx

import * as fs from 'fs'
import * as path from 'path'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

/**
 * Parameter Validation Script
 * 
 * Validates the unified parameter file against the JSON Schema
 * and performs additional consistency checks
 */

async function validateParameters() {
  console.log('Starting parameter validation...\n')
  
  try {
    // Load schema and parameters
    const schemaPath = path.join(__dirname, '../schemas/parameter.schema.json')
    const parametersPath = path.join(__dirname, '../MESS_PARAMETERS_UNIFIED.json')
    
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))
    const parameters = JSON.parse(fs.readFileSync(parametersPath, 'utf-8'))
    
    // Initialize AJV with formats
    const ajv = new Ajv({ allErrors: true })
    addFormats(ajv)
    
    // Compile and validate
    const validate = ajv.compile(schema)
    const valid = validate(parameters)
    
    if (valid) {
      console.log('✅ JSON Schema validation passed!')
    } else {
      console.error('❌ JSON Schema validation failed:')
      console.error(JSON.stringify(validate.errors, null, 2))
      process.exit(1)
    }
    
    // Additional validation checks
    console.log('\nPerforming additional validation checks...\n')
    
    // 1. Check parameter ID uniqueness
    const parameterIds = new Set<string>()
    let duplicates = 0
    
    parameters.categories.forEach((category: any) => {
      category.subcategories.forEach((subcategory: any) => {
        subcategory.parameters.forEach((param: any) => {
          if (parameterIds.has(param.id)) {
            console.warn(`⚠️  Duplicate parameter ID: ${param.id}`)
            duplicates++
          }
          parameterIds.add(param.id)
        })
      })
    })
    
    if (duplicates === 0) {
      console.log(`✅ All ${parameterIds.size} parameter IDs are unique`)
    } else {
      console.error(`❌ Found ${duplicates} duplicate parameter IDs`)
    }
    
    // 2. Check range consistency
    let rangeIssues = 0
    parameters.categories.forEach((category: any) => {
      category.subcategories.forEach((subcategory: any) => {
        subcategory.parameters.forEach((param: any) => {
          if (param.range && param.range.min >= param.range.max) {
            console.warn(`⚠️  Invalid range for ${param.id}: min=${param.range.min}, max=${param.range.max}`)
            rangeIssues++
          }
          
          if (param.typical_range && param.range) {
            if (param.typical_range.min < param.range.min || param.typical_range.max > param.range.max) {
              console.warn(`⚠️  Typical range outside valid range for ${param.id}`)
              rangeIssues++
            }
          }
        })
      })
    })
    
    if (rangeIssues === 0) {
      console.log('✅ All parameter ranges are valid')
    } else {
      console.error(`❌ Found ${rangeIssues} range consistency issues`)
    }
    
    // 3. Check validation rules coverage
    let paramsWithValidation = 0
    let paramsWithCompatibility = 0
    
    parameters.categories.forEach((category: any) => {
      category.subcategories.forEach((subcategory: any) => {
        subcategory.parameters.forEach((param: any) => {
          if (param.validation_rules && param.validation_rules.length > 0) {
            paramsWithValidation++
          }
          if (param.compatibility) {
            paramsWithCompatibility++
          }
        })
      })
    })
    
    const validationCoverage = (paramsWithValidation / parameterIds.size * 100).toFixed(1)
    const compatibilityCoverage = (paramsWithCompatibility / parameterIds.size * 100).toFixed(1)
    
    console.log(`📊 Validation rules coverage: ${validationCoverage}% (${paramsWithValidation}/${parameterIds.size})`)
    console.log(`📊 Compatibility coverage: ${compatibilityCoverage}% (${paramsWithCompatibility}/${parameterIds.size})`)
    
    // 4. Check metadata consistency
    const actualParams = parameterIds.size
    const claimedParams = parameters.metadata.totalParameters
    
    if (actualParams === claimedParams) {
      console.log(`✅ Metadata parameter count matches actual count (${actualParams})`)
    } else {
      console.warn(`⚠️  Metadata claims ${claimedParams} parameters but found ${actualParams}`)
    }
    
    // 5. Category statistics
    console.log('\n📊 Category Statistics:')
    parameters.categories.forEach((category: any) => {
      const paramCount = category.subcategories.reduce((sum: number, sub: any) => 
        sum + sub.parameters.length, 0
      )
      console.log(`   ${category.name}: ${paramCount} parameters in ${category.subcategories.length} subcategories`)
    })
    
    // Summary
    console.log('\n✨ Validation Summary:')
    console.log(`   Total Parameters: ${parameterIds.size}`)
    console.log(`   Categories: ${parameters.categories.length}`)
    console.log(`   Schema Version: ${parameters.metadata.version}`)
    console.log(`   Last Updated: ${parameters.metadata.lastUpdated}`)
    
    if (duplicates === 0 && rangeIssues === 0) {
      console.log('\n✅ All validation checks passed!')
    } else {
      console.log('\n⚠️  Some validation issues found. Please review warnings above.')
    }
    
  } catch (error) {
    console.error('❌ Error during validation:', error)
    process.exit(1)
  }
}

// Run validation
validateParameters()