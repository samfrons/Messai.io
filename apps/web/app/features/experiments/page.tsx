import { Button, Card, CardContent, CardHeader, CardTitle } from '@messai/ui'

export default function ExperimentsPage() {
  const phases = [
    {
      title: 'Setup & Planning',
      description: 'Define experimental parameters, select materials, and plan measurement protocols',
      icon: '📋',
      features: ['Protocol templates', 'Material selection', 'Safety checklists', 'Resource planning']
    },
    {
      title: 'Real-time Monitoring',
      description: 'Live data collection with automated alerts and visualization dashboards',
      icon: '📊',
      features: ['Live data streams', 'Automated alerts', 'Multi-sensor support', 'Remote monitoring']
    },
    {
      title: 'Analysis & Insights',
      description: 'AI-powered analysis comparing results with predictions and literature',
      icon: '🔍',
      features: ['Statistical analysis', 'Prediction comparison', 'Performance metrics', 'Trend analysis']
    },
    {
      title: 'Sharing & Publication',
      description: 'Collaborative sharing and publication-ready report generation',
      icon: '📤',
      features: ['Team collaboration', 'Data export', 'Report templates', 'Publication tools']
    }
  ]

  const features = [
    {
      title: 'Complete Lifecycle Management',
      description: 'From initial setup through publication, track every aspect of your experiments',
      icon: '🔄'
    },
    {
      title: 'Multi-sensor Integration',
      description: 'Connect voltage, current, pH, temperature, and custom sensors for comprehensive monitoring',
      icon: '🔌'
    },
    {
      title: 'Collaborative Workspaces',
      description: 'Share experiments with team members, assign roles, and coordinate research efforts',
      icon: '👥'
    },
    {
      title: 'Performance Benchmarking',
      description: 'Compare your results against AI predictions and literature values',
      icon: '📈'
    },
    {
      title: 'Data Export & APIs',
      description: 'Export data in multiple formats or integrate with external analysis tools',
      icon: '💾'
    },
    {
      title: 'Publication Templates',
      description: 'Generate publication-ready figures, tables, and methodology descriptions',
      icon: '📄'
    }
  ]

  const dataTypes = [
    { type: 'Voltage', unit: 'mV', frequency: '1 Hz - 1 kHz', accuracy: '±0.1 mV' },
    { type: 'Current', unit: 'mA', frequency: '1 Hz - 1 kHz', accuracy: '±0.01 mA' },
    { type: 'pH', unit: 'pH units', frequency: '0.1 Hz', accuracy: '±0.02 pH' },
    { type: 'Temperature', unit: '°C', frequency: '0.1 Hz', accuracy: '±0.1 °C' },
    { type: 'Conductivity', unit: 'mS/cm', frequency: '0.1 Hz', accuracy: '±1%' },
    { type: 'Dissolved O₂', unit: 'mg/L', frequency: '0.1 Hz', accuracy: '±0.1 mg/L' }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="section relative">
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-6xl mb-6">🧪</div>
            <h1 className="heading-1 mb-6">Experiment Management Platform</h1>
            <p className="body-large mb-12">
              Complete experiment lifecycle management from setup to publication. 
              Real-time monitoring, collaborative analysis, and seamless data sharing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                Start Experiment
              </Button>
              <Button variant="outline" size="lg">
                View Templates
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Experiment Phases */}
      <section className="section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Experiment Lifecycle</h2>
            <p className="body-large max-w-3xl mx-auto">
              Comprehensive support through every phase of your research process
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {phases.map((phase, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader>
                  <div className="text-4xl mb-4">{phase.icon}</div>
                  <CardTitle className="text-lg">{phase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{phase.description}</p>
                  <ul className="space-y-1">
                    {phase.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center text-xs">
                        <span className="w-1 h-1 bg-primary rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
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
            <h2 className="heading-2 mb-4">Platform Features</h2>
            <p className="body-large max-w-3xl mx-auto">
              Everything you need for professional-grade experiment management
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Collection */}
      <section className="section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Real-time Data Collection</h2>
            <p className="body-large max-w-3xl mx-auto">
              Professional-grade sensor integration with configurable sampling rates and high accuracy
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-border rounded-lg">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium">Parameter</th>
                  <th className="text-left p-4 font-medium">Unit</th>
                  <th className="text-left p-4 font-medium">Frequency Range</th>
                  <th className="text-left p-4 font-medium">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {dataTypes.map((data, idx) => (
                  <tr key={idx} className="border-b border-border last:border-b-0">
                    <td className="p-4 font-medium">{data.type}</td>
                    <td className="p-4 text-muted-foreground">{data.unit}</td>
                    <td className="p-4 text-muted-foreground">{data.frequency}</td>
                    <td className="p-4 text-primary font-medium">{data.accuracy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Collaboration */}
      <section className="section bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="heading-2 mb-8">Team Collaboration</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <div className="text-4xl mb-4">👥</div>
                <h3 className="heading-3 mb-2">Shared Workspaces</h3>
                <p className="text-muted-foreground">
                  Create team workspaces with role-based access control and real-time collaboration
                </p>
              </div>
              <div>
                <div className="text-4xl mb-4">💬</div>
                <h3 className="heading-3 mb-2">Discussion & Notes</h3>
                <p className="text-muted-foreground">
                  Add comments, observations, and discussions directly to experiment data
                </p>
              </div>
              <div>
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="heading-3 mb-2">Public Sharing</h3>
                <p className="text-muted-foreground">
                  Share selected experiments publicly to contribute to the research community
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Research Impact</h2>
            <p className="body-large max-w-3xl mx-auto">
              Researchers using MESSAI experiment platform achieve measurable improvements
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-light text-gradient mb-2">65%</div>
              <div className="font-medium mb-1">Faster Data Analysis</div>
              <div className="text-sm text-muted-foreground">Automated processing and AI insights</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-gradient mb-2">40%</div>
              <div className="font-medium mb-1">Reduced Experiment Time</div>
              <div className="text-sm text-muted-foreground">Better planning and real-time optimization</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-gradient mb-2">3x</div>
              <div className="font-medium mb-1">Collaboration Efficiency</div>
              <div className="text-sm text-muted-foreground">Streamlined team workflows</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-2 mb-4">Start Your Next Experiment</h2>
          <p className="body-large max-w-2xl mx-auto mb-8">
            Join researchers worldwide using MESSAI to streamline their experimental workflows
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Create Experiment
            </Button>
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/20">
              Integration Guide
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}