'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Zap, BookOpen, Lightbulb, FlaskConical, TrendingUp, Users, ArrowRight, Activity } from 'lucide-react'
import LCARSButton from '@/components/lcars/LCARSButton'

export default function LandingPage() {
  const router = useRouter()

  const features = [
    {
      id: 'fuel-cell-builder',
      title: 'MFC Design Builder',
      subtitle: 'Engineering Database',
      description: 'Access our comprehensive database of validated microbial fuel cell designs. From low-cost earthen pots to advanced bioreactors.',
      icon: FlaskConical,
      color: 'orange',
      stats: '14+ Designs',
      action: () => router.push('/designs')
    },
    {
      id: 'algal-fuel-cell',
      title: 'Algal Fuel Cell 3D',
      subtitle: 'Advanced Simulator',
      description: 'Professional-grade 3D visualization and modeling of algal-based microbial fuel cells with real-time parameter optimization.',
      icon: Activity,
      color: 'purple',
      stats: 'Real-time 3D',
      action: () => router.push('/algal-fuel-cell')
    },
    {
      id: 'literature-assistant',
      title: 'Research Assistant',
      subtitle: 'Scientific Archives',
      description: 'AI-powered literature analysis. Get instant summaries, key findings, and research recommendations from thousands of papers.',
      icon: BookOpen,
      color: 'cyan',
      stats: '10,000+ Papers',
      action: () => router.push('/research')
    },
    {
      id: 'predictive-modeling',
      title: 'Power Predictions',
      subtitle: 'Quantum Simulations',
      description: 'Advanced AI models predict power output based on your specific conditions. Optimize before you build.',
      icon: TrendingUp,
      color: 'purple',
      stats: '95% Accuracy',
      action: () => router.push('/dashboard')
    },
    {
      id: 'community-insights',
      title: 'Microbial Analytics',
      subtitle: 'Biological Systems',
      description: 'Track and analyze microbial community dynamics. Understand how different species affect power generation.',
      icon: Users,
      color: 'gold',
      stats: 'Real-time Analysis',
      action: () => router.push('/analytics')
    }
  ]

  const visionItems = [
    {
      title: 'Decentralized Power Generation',
      description: 'Enable communities to generate their own sustainable electricity from organic waste.',
      impact: 'Off-grid Solutions'
    },
    {
      title: 'Wastewater Treatment Integration',
      description: 'Combine waste processing with energy generation for maximum efficiency.',
      impact: 'Dual Benefit Systems'
    },
    {
      title: 'Carbon Capture Enhancement',
      description: 'Leverage microbial processes for atmospheric carbon sequestration.',
      impact: 'Climate Positive'
    },
    {
      title: 'Space Exploration Applications',
      description: 'Develop self-sustaining biological power systems for long-duration missions.',
      impact: 'Starfleet Ready'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-lcars-black via-lcars-black to-lcars-orange/10" />
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              backgroundImage: [
                'radial-gradient(circle at 20% 50%, #FF9900 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, #99CCFF 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, #9999CC 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, #FF9900 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* LCARS accent bar */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-2 w-32 bg-lcars-orange rounded-full" />
              <div className="h-2 w-16 bg-lcars-cyan rounded-full" />
              <div className="h-2 w-8 bg-lcars-purple rounded-full" />
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-lcars-orange mb-4 uppercase tracking-wider">
              MESSAi
            </h1>
            <p className="text-2xl md:text-3xl text-lcars-cyan mb-8 uppercase">
              Microbial Energy Systems Science AI
            </p>
            <p className="text-lg text-lcars-tan mb-12 max-w-3xl mx-auto">
              Starfleet-grade technology for sustainable bioelectrochemical systems. 
              Design, predict, and optimize microbial fuel cells with quantum-level precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LCARSButton
                size="lg"
                variant="primary"
                onClick={() => router.push('/designs')}
                className="min-w-[200px]"
              >
                Access Database
              </LCARSButton>
              <LCARSButton
                size="lg"
                variant="secondary"
                onClick={() => router.push('/research')}
                className="min-w-[200px]"
              >
                Research Portal
              </LCARSButton>
            </div>
          </motion.div>

          {/* Animated indicators */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-lcars-orange rounded-full flex justify-center">
              <div className="w-1 h-3 bg-lcars-orange rounded-full mt-2" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="mb-12">
            <div className="flex items-stretch gap-2 mb-8">
              <div className="w-32 h-12 bg-lcars-cyan rounded-l-lcars-lg" />
              <div className="flex-1 h-12 bg-lcars-cyan flex items-center px-6">
                <h2 className="text-2xl font-bold text-lcars-black uppercase tracking-wider">
                  Core Systems
                </h2>
              </div>
              <div className="w-4 h-12 bg-lcars-cyan" />
              <div className="w-24 h-12 bg-lcars-purple rounded-r-lcars" />
            </div>
            <p className="text-lcars-tan text-lg max-w-3xl">
              Advanced bioelectrochemical research tools powered by artificial intelligence 
              and decades of scientific data.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const colorMap = {
                orange: 'bg-lcars-orange border-lcars-orange text-lcars-orange',
                cyan: 'bg-lcars-cyan border-lcars-cyan text-lcars-cyan',
                purple: 'bg-lcars-purple border-lcars-purple text-lcars-purple',
                gold: 'bg-lcars-gold border-lcars-gold text-lcars-gold'
              }
              const colors = colorMap[feature.color as keyof typeof colorMap]

              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`group relative bg-lcars-black border-2 ${colors.split(' ')[1]} rounded-lcars p-6 cursor-pointer hover:shadow-lg transition-all duration-300`}
                  onClick={feature.action}
                >
                  {/* Top accent */}
                  <div className={`absolute top-0 left-0 right-0 h-2 ${colors.split(' ')[0]} rounded-t-lcars`} />
                  
                  <div className="flex items-start gap-4 mt-2">
                    <div className={`p-3 ${colors.split(' ')[0]} rounded-lcars`}>
                      <Icon className="w-8 h-8 text-lcars-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${colors.split(' ')[2]} mb-1 uppercase`}>
                        {feature.title}
                      </h3>
                      <p className="text-sm text-lcars-gray mb-3 uppercase">{feature.subtitle}</p>
                      <p className="text-lcars-tan mb-4">{feature.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${colors.split(' ')[2]}`}>
                          {feature.stats}
                        </span>
                        <ArrowRight className={`w-5 h-5 ${colors.split(' ')[2]} group-hover:translate-x-2 transition-transform`} />
                      </div>
                    </div>
                  </div>

                  {/* Bottom accent */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${colors.split(' ')[0]} rounded-b-lcars opacity-50`} />
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-8 bg-lcars-black bg-opacity-50">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="mb-12">
            <div className="flex items-stretch gap-2 mb-8">
              <div className="w-24 h-12 bg-lcars-purple rounded-l-lcars" />
              <div className="flex-1 h-12 bg-lcars-purple flex items-center px-6">
                <h2 className="text-2xl font-bold text-lcars-black uppercase tracking-wider">
                  Mission Parameters
                </h2>
              </div>
              <div className="w-32 h-12 bg-lcars-purple rounded-r-lcars-lg" />
            </div>
            <p className="text-lcars-tan text-lg max-w-3xl">
              Our vision for the future of sustainable energy and waste management 
              through bioelectrochemical innovation.
            </p>
          </div>

          {/* Vision grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visionItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-lcars-black border border-lcars-gray rounded-lcars p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-2 h-full bg-lcars-gold rounded-full" />
                  <div>
                    <h3 className="text-lg font-bold text-lcars-gold mb-2 uppercase">
                      {item.title}
                    </h3>
                    <p className="text-lcars-tan mb-3">{item.description}</p>
                    <span className="inline-block px-3 py-1 bg-lcars-gold bg-opacity-20 text-lcars-gold text-sm font-bold rounded-lcars uppercase">
                      {item.impact}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-lcars-black border-2 border-lcars-orange rounded-lcars-lg p-12"
          >
            <Zap className="w-16 h-16 text-lcars-orange mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-lcars-orange mb-4 uppercase">
              Begin Your Research Mission
            </h2>
            <p className="text-lcars-tan text-lg mb-8">
              Join the next generation of bioelectrochemical engineers. 
              Access cutting-edge tools and contribute to sustainable energy solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LCARSButton
                size="lg"
                variant="primary"
                onClick={() => router.push('/designs')}
                className="min-w-[200px]"
              >
                Start Building
              </LCARSButton>
              <LCARSButton
                size="lg"
                variant="secondary"
                onClick={() => router.push('/dashboard')}
                className="min-w-[200px]"
              >
                View Analytics
              </LCARSButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-lcars-gray">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lcars-gray text-sm uppercase">
            © Stardate {new Date().getFullYear()}.{Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)} MESSAi Research Platform
          </div>
          <div className="flex gap-6">
            <a href="/about" className="text-lcars-cyan hover:text-lcars-blue uppercase text-sm">About</a>
            <a href="/docs" className="text-lcars-cyan hover:text-lcars-blue uppercase text-sm">Documentation</a>
            <a href="/contact" className="text-lcars-cyan hover:text-lcars-blue uppercase text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}