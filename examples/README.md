# MESSAi Examples

This directory contains example configurations and usage patterns for the MESSAi platform.

## Contents

### 1. `experiment-configs.json`
Sample experiment configurations showcasing different MFC designs and parameter combinations:
- Optimal Mason Jar MFC - Educational setup
- High-Performance Benchtop Bioreactor - Advanced research
- Low-Cost Earthen Pot MFC - Sustainable design
- Wastewater Treatment Pilot - Industrial application
- Algal Fuel Cell Research - Photosynthetic MFC

### 2. `api-usage.js`
JavaScript examples demonstrating API interactions:
- Single predictions
- Batch predictions
- Parameter optimization
- Real-time monitoring simulation
- Design comparisons

## Quick Start

### Running API Examples

1. **Install Node.js** (if not already installed)

2. **Run the examples**:
   ```bash
   node examples/api-usage.js
   ```

3. **Run specific examples**:
   ```javascript
   const { getPowerPrediction } = require('./examples/api-usage');
   getPowerPrediction().then(console.log);
   ```

### Using Experiment Configurations

Load configurations in your application:

```javascript
const configs = require('./examples/experiment-configs.json');

// Access specific experiment
const masonJarExperiment = configs.experiments.find(
  exp => exp.id === 'exp-001'
);

// Use parameters for API call
const prediction = await fetch('/api/predictions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(masonJarExperiment.parameters)
});
```

## Example Use Cases

### 1. Educational Laboratory
Use the Mason Jar MFC configuration for teaching:
- Simple materials
- Predictable results
- Low cost ($10)
- 7-day experiments

### 2. Research Projects
High-performance configurations with:
- MXene electrodes
- Precise parameter control
- Extended duration (30+ days)
- Higher power outputs

### 3. Industrial Applications
Wastewater treatment examples:
- Continuous flow systems
- Large-scale deployment
- Real substrate utilization
- Economic viability

### 4. Sustainable Development
Low-cost designs for developing regions:
- Locally sourced materials
- Minimal infrastructure
- Community-scale implementation
- Environmental benefits

## Parameter Ranges

### Temperature
- **Minimum**: 15°C (reduced microbial activity)
- **Optimal**: 25-35°C
- **Maximum**: 40°C (thermal stress)

### pH
- **Acidic**: 6.0-6.5 (some acidophiles)
- **Optimal**: 6.8-7.5
- **Alkaline**: 7.5-8.0 (reduced efficiency)

### Substrate Concentration
- **Low**: 0.5-1.0 g/L (nutrient limited)
- **Optimal**: 1.0-2.0 g/L
- **High**: 2.0-3.0 g/L (potential inhibition)

## Material Selection Guide

### Budget Options (<$5)
- Reclaimed copper wire
- Carbon cloth
- J-cloth separator

### Standard Options ($5-50)
- Graphite plates
- Carbon felt
- Proton exchange membrane

### Premium Options ($50+)
- MXene electrodes
- Graphene aerogel
- CNT-graphene hybrid

## Tips for Experiments

1. **Start Simple**: Begin with mason jar design
2. **Control Variables**: Change one parameter at a time
3. **Monitor Regularly**: Check daily for first week
4. **Document Everything**: Record all observations
5. **Compare Results**: Use AI predictions as baseline

## Troubleshooting

### Low Power Output
- Check electrode connections
- Verify substrate concentration
- Monitor pH drift
- Ensure adequate temperature

### Unstable Readings
- Allow system to stabilize (24-48h)
- Check for air bubbles
- Verify membrane integrity
- Maintain consistent conditions

### No Power Generation
- Test circuit continuity
- Check microbial viability
- Verify anaerobic conditions (anode)
- Replace degraded materials

## Additional Resources

- [API Documentation](../docs/API.md)
- [Development Guide](../docs/DEVELOPMENT.md)
- [Scientific References](../docs/REFERENCES.md)

## Contributing Examples

We welcome new example contributions! Please ensure:
- Realistic parameter values
- Clear documentation
- Tested configurations
- Scientific accuracy

Submit examples via pull request with:
1. Configuration details
2. Expected results
3. Use case description
4. Any special requirements