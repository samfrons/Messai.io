import { Button, Card, CardContent, CardHeader, CardTitle } from '@messai/ui'

export default function CatalogPage() {
  const models = [
    {
      title: 'Microfluidic Algal Fuel Cell',
      description: 'Microscope slide chip with magnetic electrodes and hydrogel top layer membrane',
      status: 'Available',
      complexity: 'Research',
      powerRange: '0.1-5 mW',
      applications: ['Lab research', 'Education', 'Proof of concept'],
      icon: '🔬',
      features: ['Magnetic electrodes', 'Hydrogel membrane', 'Microscale design', 'Real-time imaging']
    },
    {
      title: 'Stacked Fuel Cell Slide Pile',
      description: 'Series or parallel configurations to increase current and/or voltage output',
      status: 'Available',
      complexity: 'Intermediate',
      powerRange: '1-50 mW',
      applications: ['Small devices', 'Sensor networks', 'Educational demos'],
      icon: '📚',
      features: ['Modular design', 'Scalable output', 'Easy assembly', 'Series/parallel modes']
    },
    {
      title: 'Benchtop Bioelectrochemical Reactor',
      description: 'Lab experiments and culture cultivation with comprehensive monitoring',
      status: 'Available',
      complexity: 'Professional',
      powerRange: '10-500 mW',
      applications: ['Lab experiments', 'Culture development', 'Performance testing'],
      icon: '🧪',
      features: ['Multi-sensor monitoring', 'Temperature control', 'pH regulation', 'Gas management']
    },
    {
      title: 'Industrial Waste-to-Energy System',
      description: 'Brewery-focused industrial scale waste treatment and energy recovery',
      status: 'In Development',
      complexity: 'Industrial',
      powerRange: '1-100 kW',
      applications: ['Waste treatment', 'Industrial energy', 'Environmental remediation'],
      icon: '🏭',
      features: ['Continuous operation', 'Waste processing', 'Energy recovery', 'Process automation']
    }
  ]

  const designPhases = [
    {
      phase: 'Conceptual Design',
      description: 'Initial system architecture and component selection',
      duration: '2-4 weeks',
      deliverables: ['System specifications', '3D concepts', 'Material selection']
    },
    {
      phase: 'Digital Prototyping',
      description: 'Virtual testing and optimization using 3D modeling lab',
      duration: '4-6 weeks',
      deliverables: ['3D models', 'Performance simulations', 'Optimization results']
    },
    {
      phase: 'Physical Validation',
      description: 'Laboratory testing and performance verification',
      duration: '6-12 weeks',
      deliverables: ['Prototype testing', 'Performance data', 'Design refinements']
    },
    {
      phase: 'Production Ready',
      description: 'Final design documentation and manufacturing specifications',
      duration: '2-4 weeks',
      deliverables: ['Manufacturing specs', 'Assembly guides', 'Quality protocols']
    }
  ]

  const customization = [
    {
      category: 'Scale & Size',
      options: ['Microscale (μL)', 'Laboratory (mL)', 'Pilot (L)', 'Industrial (m³)'],
      icon: '📏'
    },
    {
      category: 'Configuration',
      options: ['Single chamber', 'Dual chamber', 'Stacked', 'Tubular', 'Spiral'],
      icon: '🔧'
    },
    {
      category: 'Materials',
      options: ['Carbon cloth', 'Stainless steel', 'Platinum', 'Custom alloys'],
      icon: '🧱'
    },
    {
      category: 'Applications',
      options: ['Wastewater treatment', 'Biosensors', 'Energy generation', 'Research'],
      icon: '🎯'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="section relative">
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-6xl mb-6">🏗️</div>
            <h1 className="heading-1 mb-6">Model Design Catalog</h1>
            <p className="body-large mb-12">
              Growing collection of original multi-scale MESS models in our production pipeline.
              From microscale research tools to industrial-scale energy systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                Browse Models
              </Button>
              <Button variant="outline" size="lg">
                Request Custom Design
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Model Catalog */}
      <section className="section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Available Models</h2>
            <p className="body-large max-w-3xl mx-auto">
              Proven designs ready for implementation or customization
            </p>
          </div>

          <div className="space-y-8">
            {models.map((model, idx) => (
              <Card key={idx} className="card-hover">
                <CardContent className="p-6">
                  <div className="grid gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{model.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-light">{model.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              model.status === 'Available' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {model.status}
                            </span>
                          </div>
                          <p className="text-muted-foreground mb-4">{model.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {model.features.map((feature, fIdx) => (
                              <span key={fIdx} className="text-xs bg-muted px-2 py-1 rounded">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-4">
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-1">Complexity Level</div>
                          <div className="text-muted-foreground">{model.complexity}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">Power Range</div>
                          <div className="text-primary font-medium">{model.powerRange}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">Applications</div>
                          <div className="text-muted-foreground text-sm">{model.applications.join(', ')}</div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          disabled={model.status !== 'Available'}
                        >
                          {model.status === 'Available' ? 'View Details' : 'Join Waitlist'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Design Process */}
      <section className="section bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Custom Design Process</h2>
            <p className="body-large max-w-3xl mx-auto">
              From concept to production-ready designs through our proven development pipeline
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {designPhases.map((phase, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm mb-4">
                    {idx + 1}
                  </div>
                  <CardTitle className="text-lg">{phase.phase}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{phase.description}</p>
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Duration: {phase.duration}</div>
                    <div className="text-xs font-medium">Deliverables:</div>
                    <ul className="space-y-1">
                      {phase.deliverables.map((item, dIdx) => (
                        <li key={dIdx} className="text-xs text-muted-foreground flex items-center">
                          <span className="w-1 h-1 bg-primary rounded-full mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customization Options */}
      <section className="section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Customization Options</h2>
            <p className="body-large max-w-3xl mx-auto">
              Tailor any design to your specific requirements and applications
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {customization.map((category, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader>
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.options.map((option, oIdx) => (
                      <li key={oIdx} className="flex items-center text-sm">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        {option}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Request Process */}
      <section className="section bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="heading-2 mb-8">Request Custom Design</h2>
            <p className="body-large mb-12">
              Our design team works with you to create specialized bioelectrochemical systems
            </p>
            
            <div className="grid gap-8 md:grid-cols-3 mb-12">
              <div>
                <div className="text-4xl mb-4">📝</div>
                <h3 className="heading-3 mb-2">Submit Requirements</h3>
                <p className="text-muted-foreground">
                  Describe your application, constraints, and performance targets
                </p>
              </div>
              <div>
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="heading-3 mb-2">Consultation Call</h3>
                <p className="text-muted-foreground">
                  Discuss feasibility, timeline, and technical approach with our team
                </p>
              </div>
              <div>
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="heading-3 mb-2">Development Starts</h3>
                <p className="text-muted-foreground">
                  Begin the design process with regular updates and milestone reviews
                </p>
              </div>
            </div>

            <Button variant="primary" size="lg">
              Start Custom Design Request
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-2 mb-4">Build Your Next System</h2>
          <p className="body-large max-w-2xl mx-auto mb-8">
            From proven designs to completely custom solutions for your research needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Download Specifications
            </Button>
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/20">
              Contact Design Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}