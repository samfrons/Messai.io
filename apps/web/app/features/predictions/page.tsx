import { Button, Card, CardContent, CardHeader, CardTitle } from '@messai/ui'

export default function PredictionsPage() {
  const algorithms = [
    {
      name: 'Genetic Algorithm',
      description: 'Multi-objective optimization for complex system configurations',
      accuracy: '94%',
      useCase: 'Electrode optimization'
    },
    {
      name: 'Particle Swarm',
      description: 'Efficient parameter space exploration for operating conditions',
      accuracy: '92%',
      useCase: 'Operating parameters'
    },
    {
      name: 'Gradient Descent',
      description: 'Fine-tuning of continuous variables and material properties',
      accuracy: '96%',
      useCase: 'Material selection'
    },
    {
      name: 'Random Forest',
      description: 'Ensemble learning for robust performance predictions',
      accuracy: '91%',
      useCase: 'Power forecasting'
    }
  ]

  const features = [
    {
      title: 'Performance Predictions',
      description: 'AI models predict power output, efficiency, and stability based on your system configuration',
      icon: '🎯',
      metrics: ['Power density', 'Coulombic efficiency', 'Internal resistance', 'Long-term stability']
    },
    {
      title: 'Multi-objective Optimization',
      description: 'Optimize for multiple goals simultaneously - power, cost, efficiency, and environmental impact',
      icon: '⚖️',
      metrics: ['Pareto optimization', 'Trade-off analysis', 'Constraint handling', 'Sensitivity analysis']
    },
    {
      title: 'Confidence Scoring',
      description: 'Prediction reliability based on training data quality and parameter similarity',
      icon: '📊',
      metrics: ['Data coverage', 'Model uncertainty', 'Validation metrics', 'Confidence intervals']
    },
    {
      title: 'Parameter Sensitivity',
      description: 'Understand which parameters have the greatest impact on system performance',
      icon: '🔍',
      metrics: ['Impact ranking', 'Sensitivity coefficients', 'Critical thresholds', 'Interaction effects']
    }
  ]

  const models = [
    {
      type: 'Power Prediction',
      description: 'Trained on 2,500+ experimental data points',
      performance: '95.2% accuracy',
      inputs: 'Materials, geometry, operating conditions',
      outputs: 'Power density, voltage, current'
    },
    {
      type: 'Efficiency Optimization',
      description: 'Multi-variable regression with ensemble methods',
      performance: '93.8% accuracy',
      inputs: 'System configuration, microorganisms',
      outputs: 'Coulombic efficiency, energy recovery'
    },
    {
      type: 'Stability Forecasting',
      description: 'Time-series analysis for long-term performance',
      performance: '89.5% accuracy',
      inputs: 'Operating history, material degradation',
      outputs: 'Performance decline, maintenance needs'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="section relative">
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-6xl mb-6">🤖</div>
            <h1 className="heading-1 mb-6">AI Predictions Engine</h1>
            <p className="body-large mb-12">
              Machine learning models trained on thousands of research publications and experimental datasets
              to predict system performance and optimize configurations before you build.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                Try Predictions
              </Button>
              <Button variant="outline" size="lg">
                Model Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Prediction Capabilities</h2>
            <p className="body-large max-w-3xl mx-auto">
              Comprehensive AI-driven analysis for every aspect of bioelectrochemical system design
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {features.map((feature, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Key Metrics:</div>
                    <div className="grid grid-cols-2 gap-1">
                      {feature.metrics.map((metric, mIdx) => (
                        <span key={mIdx} className="text-xs bg-muted px-2 py-1 rounded">
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Algorithms */}
      <section className="section bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Optimization Algorithms</h2>
            <p className="body-large max-w-3xl mx-auto">
              State-of-the-art algorithms for different optimization challenges
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {algorithms.map((algorithm, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{algorithm.name}</CardTitle>
                    <span className="text-sm font-bold text-primary">{algorithm.accuracy}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">{algorithm.description}</p>
                  <div className="text-xs">
                    <span className="font-medium">Best for: </span>
                    <span className="text-muted-foreground">{algorithm.useCase}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Model Performance */}
      <section className="section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Prediction Models</h2>
            <p className="body-large max-w-3xl mx-auto">
              Specialized models trained on different aspects of bioelectrochemical systems
            </p>
          </div>

          <div className="space-y-6">
            {models.map((model, idx) => (
              <Card key={idx} className="card-hover">
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-4">
                    <div>
                      <h3 className="font-medium mb-2">{model.type}</h3>
                      <p className="text-muted-foreground text-sm">{model.description}</p>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Performance</div>
                      <div className="text-primary font-bold">{model.performance}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Inputs</div>
                      <div className="text-muted-foreground text-sm">{model.inputs}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Outputs</div>
                      <div className="text-muted-foreground text-sm">{model.outputs}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="section bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Prediction Workflow</h2>
            <p className="body-large max-w-3xl mx-auto">
              Simple steps to get accurate predictions for your system design
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">1</div>
              <h3 className="heading-3 mb-2">Input Parameters</h3>
              <p className="text-muted-foreground">Define your system configuration, materials, and operating conditions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">2</div>
              <h3 className="heading-3 mb-2">AI Analysis</h3>
              <p className="text-muted-foreground">Models analyze your inputs against trained datasets</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">3</div>
              <h3 className="heading-3 mb-2">Get Predictions</h3>
              <p className="text-muted-foreground">Receive performance predictions with confidence intervals</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">4</div>
              <h3 className="heading-3 mb-2">Optimize Design</h3>
              <p className="text-muted-foreground">Use optimization tools to improve your configuration</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-2 mb-4">Start Predicting Performance</h2>
          <p className="body-large max-w-2xl mx-auto mb-8">
            Get instant predictions for your bioelectrochemical system designs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Try Free Predictions
            </Button>
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/20">
              API Access
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}