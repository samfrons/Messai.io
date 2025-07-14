import { Button, Card, CardContent, CardHeader, CardTitle } from '@messai/ui'
import Link from 'next/link'

export default function ModelingLabPage() {
  const capabilities = [
    {
      title: 'Real-time 3D Rendering',
      description: 'Three.js-powered visualization with complete model representation and environmental parameters.',
      icon: '🎮'
    },
    {
      title: 'Biofilm Simulation',
      description: 'Dynamic visualization of microbial community development and electroactive biofilm formation.',
      icon: '🦠'
    },
    {
      title: 'Flow Pattern Analysis',
      description: 'Animated substrate flow, electron transport pathways, and mass transfer visualization.',
      icon: '🌊'
    },
    {
      title: 'Multi-scale Views',
      description: 'Seamlessly zoom from molecular interactions to complete system architecture.',
      icon: '🔍'
    },
    {
      title: 'Material Differentiation',
      description: 'Visual distinction of electrode materials, membranes, and chamber configurations.',
      icon: '⚗️'
    },
    {
      title: 'Cost Analysis Integration',
      description: 'Real-time material costs, efficiency ratings, and ROI calculations overlay.',
      icon: '💰'
    }
  ]

  const modelTypes = [
    {
      name: 'Microfluidic Algal Fuel Cell',
      description: 'Microscope slide chip with magnetic electrodes and hydrogel membrane',
      status: 'Available',
      image: '🔬'
    },
    {
      name: 'Stacked Fuel Cell Array',
      description: 'Series/parallel configurations for increased current and voltage',
      status: 'Available',
      image: '📚'
    },
    {
      name: 'Benchtop Bioreactor',
      description: 'Lab-scale system for experiments and culture cultivation',
      status: 'Available',
      image: '🧪'
    },
    {
      name: 'Industrial Waste-to-Energy',
      description: 'Brewery-focused industrial scale system design',
      status: 'In Development',
      image: '🏭'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="section relative">
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-6xl mb-6">🔬</div>
            <h1 className="heading-1 mb-6">Interactive 3D Modeling Lab</h1>
            <p className="body-large mb-12">
              Visualize, simulate, and optimize bioelectrochemical systems with real-time 3D modeling.
              From molecular interactions to industrial-scale implementations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/lab/3d-modeling">
                <Button variant="primary" size="lg">
                  Launch 3D Lab
                </Button>
              </Link>
              <Link href="/models/3d-showcase">
                <Button variant="outline" size="lg">
                  View Gallery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Advanced Visualization Capabilities</h2>
            <p className="body-large max-w-3xl mx-auto">
              State-of-the-art 3D rendering technology brings bioelectrochemical systems to life
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader>
                  <div className="text-4xl mb-4">{capability.icon}</div>
                  <CardTitle>{capability.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{capability.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Model Catalog */}
      <section className="section bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Model Design Catalog</h2>
            <p className="body-large max-w-3xl mx-auto">
              Growing collection of original multi-scale MESS models in our production pipeline
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {modelTypes.map((model, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{model.image}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      model.status === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {model.status}
                    </span>
                  </div>
                  <CardTitle>{model.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{model.description}</p>
                  {model.status === 'Available' ? (
                    <Link href="/lab/3d-modeling" className="w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        View in 3D
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      Join Waitlist
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="heading-2 mb-4">Digital-First Research</h2>
              <p className="body-large">
                Run time-based experiments on digital models to gain foundational knowledge 
                before expensive and time-consuming real-world system experiments
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="heading-3 mb-2">Rapid Iteration</h3>
                <p className="text-muted-foreground">
                  Test hundreds of configurations in minutes instead of months
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="heading-3 mb-2">Cost Reduction</h3>
                <p className="text-muted-foreground">
                  Minimize material waste and lab time with digital validation
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="heading-3 mb-2">Precision Design</h3>
                <p className="text-muted-foreground">
                  Optimize systems before physical prototyping
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-2 mb-4">Ready to Visualize Your Ideas?</h2>
          <p className="body-large max-w-2xl mx-auto mb-8">
            Start designing and simulating bioelectrochemical systems in 3D
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/lab/3d-modeling">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Start Free Trial
              </Button>
            </Link>
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/20">
              Watch Demo Video
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}