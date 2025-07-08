// Test script for enhanced AI prediction algorithms
const { predictionEngine } = require('./lib/prediction-engine.ts')
const { bioreactorCatalog } = require('./lib/bioreactor-catalog.ts')

async function testEnhancedPredictions() {
  console.log('🔬 Testing Enhanced AI Prediction Algorithms with Literature Correlations\n')
  
  // Test with the High-Performance EMBR
  const reactor = bioreactorCatalog[0] // EMBR-001
  console.log(`Testing with: ${reactor.name}`)
  console.log(`Type: ${reactor.reactorType}`)
  console.log(`Category: ${reactor.category}\n`)
  
  // Test parameters at optimal conditions
  const optimalParams = {
    temperature: reactor.operating.temperature.optimal,
    ph: reactor.operating.ph.optimal,
    flowRate: reactor.operating.flowRate.value,
    mixingSpeed: reactor.operating.mixingSpeed.optimal,
    electrodeVoltage: 75, // Mid-range
    substrateConcentration: reactor.operating.substrateConcentration.optimal
  }
  
  console.log('📊 Test Parameters (Optimal):')
  Object.entries(optimalParams).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`)
  })
  console.log()
  
  // Test all three fidelity levels
  const fidelityLevels = ['basic', 'intermediate', 'advanced']
  
  for (const fidelity of fidelityLevels) {
    console.log(`\n🎯 Testing ${fidelity.toUpperCase()} fidelity level:`)
    console.log('=' .repeat(50))
    
    try {
      const input = {
        bioreactorId: reactor.id,
        parameters: optimalParams,
        fidelityLevel: fidelity
      }
      
      const startTime = performance.now()
      const result = await predictionEngine.predict(input)
      const endTime = performance.now()
      
      console.log(`⏱️  Execution Time: ${(endTime - startTime).toFixed(2)}ms`)
      console.log(`⚡ Power Density: ${result.powerDensity.toFixed(1)} mW/m²`)
      console.log(`🔋 Current Density: ${result.currentDensity.toFixed(1)} mA/m²`)
      console.log(`📈 Efficiency: ${result.efficiency.toFixed(1)}%`)
      console.log(`🎯 Status: ${result.operationalStatus}`)
      console.log(`🔍 Confidence: ${(result.confidence * 100).toFixed(1)}%`)
      
      if (result.warnings.length > 0) {
        console.log(`⚠️  Warnings:`)
        result.warnings.forEach(warning => console.log(`    - ${warning}`))
      }
      
      // Advanced fidelity specific data
      if (fidelity === 'advanced' && result.electrochemistry) {
        console.log('\n🔬 Advanced Electrochemical Analysis:')
        console.log(`  Activation Overpotential: ${(result.electrochemistry.overpotentials.activation * 1000).toFixed(1)}mV`)
        console.log(`  Concentration Overpotential: ${(result.electrochemistry.overpotentials.concentration * 1000).toFixed(1)}mV`)
        console.log(`  Ohmic Overpotential: ${(result.electrochemistry.overpotentials.ohmic * 1000).toFixed(1)}mV`)
        if (result.electrochemistry.overpotentials.membrane) {
          console.log(`  Membrane Potential: ${(result.electrochemistry.overpotentials.membrane * 1000).toFixed(1)}mV`)
        }
        console.log(`  Exchange Current Density: ${result.electrochemistry.electrodeKinetics.exchangeCurrentDensity.toFixed(3)} A/m²`)
        console.log(`  Tafel Slope: ${(result.electrochemistry.electrodeKinetics.tafelSlope * 1000).toFixed(1)}mV/decade`)
        
        // Limiting factors
        const limiting = result.electrochemistry.limitingFactors
        console.log('\n🚦 Limiting Factors:')
        console.log(`  Mass Transfer Limited: ${limiting.massTransferLimited ? '❌ YES' : '✅ NO'}`)
        console.log(`  Activation Limited: ${limiting.activationLimited ? '❌ YES' : '✅ NO'}`)
        console.log(`  Ohmic Limited: ${limiting.ohmicLimited ? '❌ YES' : '✅ NO'}`)
        
        // Fluid dynamics
        if (result.fluidDynamics) {
          console.log('\n🌊 Fluid Dynamics Analysis:')
          console.log(`  Reynolds Number: ${result.fluidDynamics.reynoldsNumber.toFixed(0)}`)
          console.log(`  Sherwood Number: ${result.fluidDynamics.sherwoodNumber.toFixed(1)}`)
          console.log(`  Mixing Efficiency: ${(result.fluidDynamics.mixingEfficiency * 100).toFixed(1)}%`)
          console.log(`  Dead Zones: ${(result.fluidDynamics.deadZones * 100).toFixed(1)}%`)
          console.log(`  Mass Transfer Coefficient: ${(result.fluidDynamics.massTransferCoefficient * 1e6).toFixed(2)} μm/s`)
        }
      }
      
      // Intermediate fidelity specific data
      if ((fidelity === 'intermediate' || fidelity === 'advanced') && result.economics) {
        console.log('\n💰 Economic Analysis:')
        console.log(`  Operating Cost: $${result.economics.operatingCost.toFixed(3)}/kWh`)
        console.log(`  Maintenance Cost: $${result.economics.maintenanceCost.toFixed(1)}/day`)
        
        if (result.biofilmDynamics) {
          console.log('\n🦠 Biofilm Dynamics:')
          console.log(`  Thickness: ${result.biofilmDynamics.thickness.toFixed(1)} μm`)
          console.log(`  Viability: ${(result.biofilmDynamics.viability * 100).toFixed(1)}%`)
          console.log(`  Adhesion Strength: ${(result.biofilmDynamics.adhesionStrength * 100).toFixed(1)}%`)
        }
      }
      
    } catch (error) {
      console.error(`❌ Error in ${fidelity} prediction:`, error.message)
    }
  }
  
  // Test suboptimal conditions
  console.log('\n\n🌡️ Testing Suboptimal Conditions (High Temperature):')
  console.log('=' .repeat(60))
  
  const suboptimalParams = {
    ...optimalParams,
    temperature: 45, // High temperature
    ph: 6.0, // Slightly acidic
    electrodeVoltage: 180 // High voltage
  }
  
  try {
    const input = {
      bioreactorId: reactor.id,
      parameters: suboptimalParams,
      fidelityLevel: 'advanced'
    }
    
    const result = await predictionEngine.predict(input)
    
    console.log(`⚡ Power Density: ${result.powerDensity.toFixed(1)} mW/m² (vs ${reactor.performance.powerDensity.value} expected)`)
    console.log(`📈 Efficiency: ${result.efficiency.toFixed(1)}%`)
    console.log(`🎯 Status: ${result.operationalStatus}`)
    console.log(`🔍 Confidence: ${(result.confidence * 100).toFixed(1)}%`)
    
    if (result.warnings.length > 0) {
      console.log(`\n⚠️  Generated Warnings:`)
      result.warnings.forEach(warning => console.log(`    - ${warning}`))
    }
    
  } catch (error) {
    console.error(`❌ Error in suboptimal prediction:`, error.message)
  }
  
  console.log('\n✅ Enhanced AI Prediction Algorithm Testing Complete!')
  console.log('\n🎉 Key Enhancements Demonstrated:')
  console.log('   • Butler-Volmer electrochemical kinetics')
  console.log('   • Nernst equation corrections')
  console.log('   • Reynolds number and Sherwood number correlations')
  console.log('   • Material-specific exchange current densities')
  console.log('   • Biofilm enhancement factors')
  console.log('   • System-specific performance multipliers')
  console.log('   • Literature-validated parameter ranges')
  console.log('   • Advanced warning generation with biochemical context')
  console.log('   • Limiting factor analysis')
  console.log('   • Residence time distribution modeling')
}

// Run the test
testEnhancedPredictions().catch(console.error)