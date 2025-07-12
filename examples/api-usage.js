/**
 * MESSAi API Usage Examples
 * 
 * This file demonstrates how to interact with the MESSAi API
 * for predictions and experiment management.
 */

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3003/api';
const API_KEY = process.env.MESSAI_API_KEY; // Optional for future auth

// Helper function for API calls
async function callAPI(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${API_KEY}` // For future auth
    }
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Example 1: Get Power Prediction
async function getPowerPrediction() {
  console.log('Example 1: Getting Power Prediction\n');

  const experimentParams = {
    temperature: 28.5,
    ph: 7.1,
    substrateConcentration: 1.2,
    designType: 'benchtop-bioreactor'
  };

  try {
    const result = await callAPI('/predictions', 'POST', experimentParams);
    
    console.log('Input Parameters:', experimentParams);
    console.log('Predicted Power:', result.predictedPower, 'mW/m²');
    console.log('Confidence Interval:', result.confidenceInterval);
    console.log('Contributing Factors:', result.factors);
    console.log('\n---\n');
    
    return result;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 2: Batch Predictions
async function getBatchPredictions() {
  console.log('Example 2: Batch Predictions for Parameter Optimization\n');

  const designs = ['mason-jar', 'benchtop-bioreactor', '3d-printed'];
  const temperatures = [20, 25, 30, 35];
  const predictions = [];

  for (const design of designs) {
    for (const temp of temperatures) {
      const params = {
        temperature: temp,
        ph: 7.0,
        substrateConcentration: 1.5,
        designType: design
      };

      try {
        const result = await callAPI('/predictions', 'POST', params);
        predictions.push({
          design,
          temperature: temp,
          power: result.predictedPower
        });
      } catch (error) {
        console.error(`Error for ${design} at ${temp}°C:`, error.message);
      }
    }
  }

  // Display results as a table
  console.table(predictions);
  console.log('\n---\n');

  return predictions;
}

// Example 3: Parameter Optimization
async function findOptimalParameters(designType) {
  console.log(`Example 3: Finding Optimal Parameters for ${designType}\n`);

  const parameterRanges = {
    temperature: { min: 15, max: 40, step: 5 },
    ph: { min: 6.0, max: 8.0, step: 0.5 },
    substrate: { min: 0.5, max: 3.0, step: 0.5 }
  };

  let bestResult = null;
  let maxPower = 0;

  // Test all combinations
  for (let temp = parameterRanges.temperature.min; 
       temp <= parameterRanges.temperature.max; 
       temp += parameterRanges.temperature.step) {
    
    for (let ph = parameterRanges.ph.min; 
         ph <= parameterRanges.ph.max; 
         ph += parameterRanges.ph.step) {
      
      for (let substrate = parameterRanges.substrate.min; 
           substrate <= parameterRanges.substrate.max; 
           substrate += parameterRanges.substrate.step) {
        
        const params = {
          temperature: temp,
          ph: ph,
          substrateConcentration: substrate,
          designType: designType
        };

        try {
          const result = await callAPI('/predictions', 'POST', params);
          
          if (result.predictedPower > maxPower) {
            maxPower = result.predictedPower;
            bestResult = { params, power: result.predictedPower };
          }
        } catch (error) {
          // Skip failed predictions
        }
      }
    }
  }

  console.log('Optimal Parameters Found:');
  console.log('Parameters:', bestResult.params);
  console.log('Maximum Power:', bestResult.power, 'mW/m²');
  console.log('\n---\n');

  return bestResult;
}

// Example 4: Real-time Monitoring Simulation
async function simulateRealTimeMonitoring(duration = 10) {
  console.log(`Example 4: Simulating Real-time Monitoring for ${duration} seconds\n`);

  const baseParams = {
    temperature: 30,
    ph: 7.0,
    substrateConcentration: 1.5,
    designType: 'benchtop-bioreactor'
  };

  const readings = [];
  const startTime = Date.now();

  const interval = setInterval(async () => {
    // Simulate parameter fluctuations
    const currentParams = {
      ...baseParams,
      temperature: baseParams.temperature + (Math.random() - 0.5) * 2,
      ph: baseParams.ph + (Math.random() - 0.5) * 0.2,
      substrateConcentration: baseParams.substrateConcentration + (Math.random() - 0.5) * 0.3
    };

    try {
      const result = await callAPI('/predictions', 'POST', currentParams);
      
      const reading = {
        timestamp: new Date().toISOString(),
        temperature: currentParams.temperature.toFixed(1),
        ph: currentParams.ph.toFixed(2),
        substrate: currentParams.substrateConcentration.toFixed(2),
        power: result.predictedPower.toFixed(1)
      };

      readings.push(reading);
      console.log(`[${reading.timestamp}] Power: ${reading.power} mW/m²`);

      if (Date.now() - startTime >= duration * 1000) {
        clearInterval(interval);
        console.log('\nMonitoring Complete. Summary:');
        console.table(readings);
      }
    } catch (error) {
      console.error('Monitoring error:', error.message);
    }
  }, 1000);
}

// Example 5: Design Comparison
async function compareDesigns() {
  console.log('Example 5: Comparing All Available Designs\n');

  const standardParams = {
    temperature: 30,
    ph: 7.0,
    substrateConcentration: 1.5
  };

  const designs = [
    'earthen-pot', 'cardboard', 'mason-jar', '3d-printed',
    'wetland', 'micro-chip', 'isolinear-chip', 'benchtop-bioreactor',
    'wastewater-treatment', 'brewery-processing', 'architectural-facade',
    'benthic-fuel-cell', 'kitchen-sink'
  ];

  const comparisons = [];

  for (const design of designs) {
    try {
      const result = await callAPI('/predictions', 'POST', {
        ...standardParams,
        designType: design
      });

      comparisons.push({
        design,
        predictedPower: result.predictedPower,
        confidenceLower: result.confidenceInterval.lower,
        confidenceUpper: result.confidenceInterval.upper,
        efficiency: ((result.predictedPower / 500) * 100).toFixed(1) + '%'
      });
    } catch (error) {
      console.error(`Error for ${design}:`, error.message);
    }
  }

  // Sort by predicted power
  comparisons.sort((a, b) => b.predictedPower - a.predictedPower);

  console.log('Design Performance Ranking:');
  console.table(comparisons);

  return comparisons;
}

// Main execution
async function main() {
  console.log('MESSAi API Usage Examples');
  console.log('========================\n');

  try {
    // Run examples
    await getPowerPrediction();
    await getBatchPredictions();
    await findOptimalParameters('mason-jar');
    await compareDesigns();
    
    // Uncomment to run real-time monitoring
    // await simulateRealTimeMonitoring(10);

  } catch (error) {
    console.error('Main execution error:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}

// Export functions for use in other scripts
module.exports = {
  callAPI,
  getPowerPrediction,
  getBatchPredictions,
  findOptimalParameters,
  simulateRealTimeMonitoring,
  compareDesigns
};