import { Button, Card, CardContent, CardHeader, CardTitle } from '@messai/ui'

export default function ParametersPage() {
  const stats = [
    { label: 'Total Parameters', value: '1,500+', description: 'Comprehensive library' },
    { label: 'Categories', value: '150', description: 'Organized classification' },
    { label: 'Material Types', value: '200+', description: 'Electrodes and membranes' },
    { label: 'Microbial Species', value: '100+', description: 'Characterized organisms' }
  ]

  const categories = [
    {
      title: 'Electrode Materials',
      description: 'Comprehensive database of anode and cathode materials with electrochemical properties',
      icon: '⚡',
      parameterCount: 350,
      examples: ['Carbon cloth', 'Platinum', 'Stainless steel', 'Graphite felt']
    },
    {
      title: 'Microbial Communities',
      description: 'Characterized microorganisms with metabolic pathways and electroactivity data',
      icon: '🦠',
      parameterCount: 280,
      examples: ['Geobacter', 'Shewanella', 'Mixed consortia', 'Anaerobic sludge']
    },
    {
      title: 'Membrane Properties',
      description: 'Ion exchange membranes, separators, and selective barrier materials',
      icon: '🧱',
      parameterCount: 180,
      examples: ['Nafion', 'PEM', 'Ceramic', 'Polymer composites']
    },
    {
      title: 'Operating Conditions',
      description: 'Temperature, pH, conductivity, and environmental parameter ranges',
      icon: '🌡️',
      parameterCount: 240,
      examples: ['Temperature profiles', 'pH ranges', 'Salinity levels', 'Pressure conditions']
    },
    {
      title: 'System Configurations',
      description: 'Reactor designs, electrode spacing, and architecture specifications',
      icon: '🏗️',
      parameterCount: 320,
      examples: ['Single chamber', 'Dual chamber', 'Stacked', 'Tubular']
    },
    {
      title: 'Performance Metrics',
      description: 'Power density, efficiency, and operational characteristic measurements',
      icon: '📊',
      parameterCount: 130,
      examples: ['Power density', 'Coulombic efficiency', 'Internal resistance', 'Stability']
    }
  ]

  const features = [
    {
      title: 'Compatibility Matrix',
      description: 'AI-powered predictions for material-microbe-configuration interactions',
      icon: '🔗'
    },
    {
      title: 'Property Calculations',
      description: 'Auto-derived properties from basic inputs using validated models',
      icon: '🧮'
    },
    {
      title: 'Custom Materials',
      description: 'Add and characterize your own materials with collaborative validation',
      icon: '🛠️'
    },
    {
      title: 'Validation Rules',
      description: 'Scientific accuracy enforcement with peer-reviewed data sources',
      icon: '✅'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="section relative">
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-6xl mb-6">⚡</div>
            <h1 className="heading-1 mb-6">MESS Parameters Database</h1>
            <p className="body-large mb-12">
              The world's most comprehensive database of bioelectrochemical systems parameters.
              1,500+ validated parameters across 150 categories for informed system design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                Browse Database
              </Button>
              <Button variant="outline" size="lg">
                Add Materials
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-light text-gradient mb-2">{stat.value}</div>
                <div className="font-medium mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Parameter Categories</h2>
            <p className="body-large max-w-3xl mx-auto">
              Organized collection covering every aspect of bioelectrochemical system design and operation
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{category.icon}</div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {category.parameterCount} params
                    </span>
                  </div>
                  <CardTitle>{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Examples:</div>
                    <div className="flex flex-wrap gap-1">
                      {category.examples.map((example, exIdx) => (
                        <span key={exIdx} className="text-xs bg-muted px-2 py-1 rounded">
                          {example}
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

      {/* Features */}
      <section className="section bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Intelligent Parameter Tools</h2>
            <p className="body-large max-w-3xl mx-auto">
              Beyond storage - smart tools for parameter analysis and system optimization
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <Card key={idx} className="card-hover text-center">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Quality */}
      <section className="section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="heading-2 mb-8">Peer-Reviewed Data Quality</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <div className="text-4xl mb-4">📖</div>
                <h3 className="heading-3 mb-2">Source Validation</h3>
                <p className="text-muted-foreground">
                  All parameters sourced from peer-reviewed publications and validated experimental data
                </p>
              </div>
              <div>
                <div className="text-4xl mb-4">🔬</div>
                <h3 className="heading-3 mb-2">Experimental Verification</h3>
                <p className="text-muted-foreground">
                  Cross-referenced with multiple studies and experimental conditions
                </p>
              </div>
              <div>
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="heading-3 mb-2">Continuous Updates</h3>
                <p className="text-muted-foreground">
                  Regular updates with latest research findings and community contributions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-2 mb-4">Access the Complete Database</h2>
          <p className="body-large max-w-2xl mx-auto mb-8">
            Start designing with validated parameters and contribute to the growing knowledge base
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Browse Parameters
            </Button>
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/20">
              API Documentation
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}