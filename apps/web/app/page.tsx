import { Button, Card, CardContent, CardHeader, CardTitle } from '@messai/ui'
import { SCIENTIFIC_CONSTANTS, SystemType } from '@messai/core'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FeatureCard, ParameterGrid } from '@/components/ui/ParameterCard'
import { ArrowRight, Zap, FlaskConical } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      title: 'Research Intelligence System',
      description: '3,721+ AI-enhanced papers with extracted performance metrics that inform our prediction engine',
      icon: 'SensorIcon' as const,
      href: '/features/research-intelligence',
      highlights: ['Semantic search across abstracts', 'Citation network analysis', 'AI-powered knowledge graphs']
    },
    {
      title: '3D Modeling Lab',
      description: 'Interactive, real-time bioelectrochemical system visualization with professional rendering',
      icon: 'TankIcon' as const,
      href: '/lab/3d-modeling',
      highlights: ['Real-time Three.js rendering', 'Dynamic biofilm simulation', 'Particle flow visualization']
    },
    {
      title: 'Parameters Database',
      description: '1500+ comprehensive parameters across 150 categories with compatibility matrices',
      icon: 'ElectrodeIcon' as const,
      href: '/features/parameters',
      highlights: ['Advanced material properties', 'Microbe-material compatibility', 'Custom parameter creation']
    },
    {
      title: 'AI Predictions Engine',
      description: 'Machine learning models trained on research data for accurate performance forecasting',
      icon: 'PowerIcon' as const,
      href: '/features/predictions',
      highlights: ['Multi-objective optimization', 'Confidence scoring systems', 'Research-derived algorithms']
    },
    {
      title: 'Experiment Platform',
      description: 'Complete lifecycle management from setup through publication with collaboration tools',
      icon: 'FlowIcon' as const,
      href: '/features/experiments',
      highlights: ['Real-time monitoring dashboards', 'Team collaboration workspace', 'Research-ready data export']
    },
    {
      title: 'Microfluidic Systems',
      description: 'Specialized microfluidic algae bioreactor models with Caladan Bio aesthetic',
      icon: 'MicrobeIcon' as const,
      href: '/lab/3d-modeling',
      highlights: ['Microfluidic channel design', 'Algae culture simulation', 'Co-laminar flow patterns']
    }
  ]

  const sampleParameters = [
    {
      title: 'Power Output',
      value: 245.6,
      unit: 'mW',
      description: 'Current system power generation',
      icon: 'PowerIcon' as const,
      trend: 'up' as const
    },
    {
      title: 'Temperature',
      value: 28.5,
      unit: '°C',
      description: 'Reactor operating temperature',
      icon: 'TemperatureIcon' as const,
      trend: 'stable' as const
    },
    {
      title: 'pH Level',
      value: 7.1,
      unit: '',
      description: 'Electrolyte acidity/alkalinity',
      icon: 'PhIcon' as const,
      trend: 'stable' as const
    },
    {
      title: 'Flow Rate',
      value: 1.2,
      unit: 'mL/min',
      description: 'Substrate flow velocity',
      icon: 'FlowIcon' as const,
      trend: 'down' as const
    },
    {
      title: 'Substrate Conc.',
      value: 1.8,
      unit: 'g/L',
      description: 'Organic matter concentration',
      icon: 'SubstrateIcon' as const,
      trend: 'up' as const
    },
    {
      title: 'Cell Density',
      value: 2.4,
      unit: '×10⁶/mL',
      description: 'Microbial population density',
      icon: 'MicrobeIcon' as const,
      trend: 'stable' as const
    }
  ]

  return (
    <div className="min-h-screen caladan-bg-dark">
      {/* Hero Section with Caladan Bio aesthetic */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden caladan-bg-dark">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, hsl(var(--caladan-accent)) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, hsl(var(--caladan-medium)) 0%, transparent 50%),
                             radial-gradient(circle at 40% 40%, hsl(var(--caladan-light)) 0%, transparent 50%)`
          }} />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-light mb-6 text-white">
              MESSAI
              <span className="block text-2xl md:text-3xl caladan-text-accent font-normal mt-2">
                Microbial Electrochemical Systems AI
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Democratizing microbial electrochemical systems research with AI-powered tools,
              comprehensive databases, and collaborative experimentation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/lab/3d-modeling">
                <button className="caladan-button">
                  Launch 3D Lab
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </Link>
              <Link href="/features/3d-modeling">
                <button className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 border border-white/20 text-white hover:bg-white/10">
                  View Demo
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Stats with Caladan Bio styling */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-light caladan-text-accent">3,721+</div>
              <div className="text-sm text-gray-400">Research Papers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light caladan-text-accent">1,500+</div>
              <div className="text-sm text-gray-400">Parameters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light caladan-text-accent">95%</div>
              <div className="text-sm text-gray-400">Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light caladan-text-accent">150+</div>
              <div className="text-sm text-gray-400">Active Researchers</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with FeatureCard components */}
      <section className="section relative bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-light mb-4 caladan-text-accent">Platform Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to accelerate bioelectrochemical systems research,
              from literature analysis to experimental validation
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Link key={feature.href} href={feature.href}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <FeatureCard {...feature} />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Parameters Section */}
      <section className="section relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-light mb-4 caladan-text-accent">Live System Parameters</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Real-time monitoring of bioelectrochemical system performance with custom parameter visualization
            </p>
          </motion.div>

          <ParameterGrid parameters={sampleParameters} />
        </div>
      </section>

      {/* CTA Section with Caladan Bio styling */}
      <section className="section relative caladan-bg-medium">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-light mb-4 text-white">Ready to Transform Your Research?</h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-8">
              Join researchers worldwide using MESSAI to accelerate bioelectrochemical systems innovation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/lab/3d-modeling">
                <button className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 bg-white text-gray-900 hover:bg-gray-100">
                  Schedule Demo
                </button>
              </Link>
              <Link href="/features/3d-modeling">
                <button className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 border border-white/20 text-white hover:bg-white/10">
                  Read Documentation
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}