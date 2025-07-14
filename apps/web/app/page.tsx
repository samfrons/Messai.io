import { Button, Card, CardContent, CardHeader, CardTitle } from '@messai/ui'
import { SCIENTIFIC_CONSTANTS, SystemType } from '@messai/core'
import { Header } from '../../../components/Header'
import Link from 'next/link'

export default function HomePage() {
  const features = [
    {
      title: 'Research Intelligence System',
      description: '3,721+ AI-enhanced papers with extracted performance metrics',
      icon: '📚',
      href: '/features/research-intelligence',
      highlights: ['Semantic search', 'Citation networks', 'Knowledge graphs']
    },
    {
      title: '3D Modeling Lab',
      description: 'Interactive, real-time bioelectrochemical system visualization',
      icon: '🔬',
      href: '/features/3d-modeling',
      highlights: ['Real-time rendering', 'Biofilm simulation', 'Flow patterns']
    },
    {
      title: 'Parameters Database',
      description: '1500+ comprehensive parameters across 150 categories',
      icon: '⚡',
      href: '/features/parameters',
      highlights: ['Material properties', 'Compatibility matrix', 'Custom materials']
    },
    {
      title: 'AI Predictions Engine',
      description: 'Machine learning models trained on research data',
      icon: '🤖',
      href: '/features/predictions',
      highlights: ['Performance predictions', 'Multi-objective optimization', 'Confidence scoring']
    },
    {
      title: 'Experiment Platform',
      description: 'Complete lifecycle from setup to publication',
      icon: '🧪',
      href: '/features/experiments',
      highlights: ['Real-time monitoring', 'Team collaboration', 'Data export']
    },
    {
      title: 'Model Design Catalog',
      description: 'Growing collection of original multi-scale MESS models',
      icon: '🏗️',
      href: '/features/catalog',
      highlights: ['Microfluidic designs', 'Industrial systems', 'Custom configurations']
    }
  ]

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute inset-0 geometric-bg" />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <h1 className="heading-1 text-gradient mb-6">
            MESSAI Platform
          </h1>
          <p className="body-large max-w-3xl mx-auto mb-12">
            Democratizing microbial electrochemical systems research with AI-powered tools,
            comprehensive databases, and collaborative experimentation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-light text-gradient">3,721+</div>
              <div className="text-sm text-muted-foreground">Research Papers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-gradient">1,500+</div>
              <div className="text-sm text-muted-foreground">Parameters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-gradient">95%</div>
              <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-gradient">150+</div>
              <div className="text-sm text-muted-foreground">Active Researchers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Platform Features</h2>
            <p className="body-large max-w-3xl mx-auto">
              Everything you need to accelerate bioelectrochemical systems research,
              from literature analysis to experimental validation
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link key={feature.href} href={feature.href} className="group">
                <Card className="h-full card-hover cursor-pointer">
                  <CardHeader>
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <CardTitle className="group-hover:text-gradient transition-all duration-200">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section relative bg-gradient-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-2 mb-4">Ready to Transform Your Research?</h2>
          <p className="body-large max-w-2xl mx-auto mb-8">
            Join researchers worldwide using MESSAI to accelerate bioelectrochemical systems innovation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Schedule Demo
            </Button>
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/20">
              Read Documentation
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}