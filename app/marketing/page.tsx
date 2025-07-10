/**
 * MESSAi Marketing Homepage
 * Revolutionary landing page celebrating the magic of microbial systems
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useThemeContext } from '@/hooks/useTheme'

export default function MarketingHome() {
  const { theme, getCardClass, getButtonClass } = useThemeContext()
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)

  const stats = [
    {
      id: 'papers',
      number: '3,721',
      label: 'Verified Research Papers',
      description: 'Comprehensive database of peer-reviewed bioelectrochemical research',
      icon: '📚',
      color: 'text-teal-600'
    },
    {
      id: 'materials',
      number: '27+',
      label: 'Electrode Materials',
      description: 'Curated database of anode and cathode materials with performance data',
      icon: '⚡',
      color: 'text-green-600'
    },
    {
      id: 'ai',
      number: 'AI',
      label: 'Powered Predictions',
      description: 'Machine learning models for system optimization and performance prediction',
      icon: '🧠',
      color: 'text-pink-600'
    }
  ]

  const capabilities = [
    {
      title: 'Research Discovery',
      description: 'Access the world\'s largest curated database of bioelectrochemical research with AI-powered insights and analysis.',
      icon: '🔬',
      features: ['3,721 verified papers', 'AI content analysis', 'Advanced filtering', 'Performance extraction'],
      gradient: 'from-teal-500 to-green-500'
    },
    {
      title: 'System Design',
      description: 'Interactive 3D modeling and optimization tools for designing next-generation microbial electrochemical systems.',
      icon: '⚙️',
      features: ['3D visualization', 'Material selection', 'Performance prediction', 'Scale optimization'],
      gradient: 'from-green-500 to-blue-500'
    },
    {
      title: 'Commercial Scale',
      description: 'Bridge the gap from laboratory research to commercial deployment with comprehensive scale-up tools.',
      icon: '🏭',
      features: ['Economic analysis', 'Scale-up modeling', 'Deployment planning', 'ROI calculations'],
      gradient: 'from-blue-500 to-purple-500'
    }
  ]

  const industries = [
    {
      name: 'Wastewater Treatment',
      description: 'Transform waste into energy while cleaning water',
      impact: '50% energy reduction',
      icon: '🌊',
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      name: 'Renewable Energy',
      description: 'Biological batteries that never stop producing',
      impact: '24/7 power generation',
      icon: '⚡',
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700'
    },
    {
      name: 'Bio-Manufacturing',
      description: 'Microbes as tiny factories for valuable chemicals',
      impact: '90% process efficiency',
      icon: '🧫',
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      name: 'Environmental Remediation',
      description: 'Clean up contamination with living systems',
      impact: '100% natural process',
      icon: '🌱',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    }
  ]

  return (
    <div>
      {/* Hero Section - Clean with Subtle Bio Touches */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Subtle Organic Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(circle at 25% 75%, rgba(45, 90, 71, 0.4) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(194, 24, 91, 0.3) 0%, transparent 50%)'
            }}
          ></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            {/* Revolutionary Headline */}
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-50 to-green-50 border border-teal-200 rounded-full mb-6">
                <span className="text-sm font-medium text-teal-700">🚀 First-of-its-kind platform</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-gray-900 via-teal-700 to-gray-900 bg-clip-text text-transparent">
                  Unlock the Magic of
                </span>
                <br />
                <span className="text-gray-900">Microbial Systems</span>
              </h1>
            </div>
            
            {/* Mission Statement */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
              The world's first comprehensive platform for bioelectrochemical research and development.
              <br />
              <span className="text-teal-700 font-semibold">From scientific discovery to commercial deployment.</span>
            </p>
            
            {/* Credibility Statement */}
            <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-12">
              Built on 3,721 verified research papers, powered by AI, and designed to unlock 
              the untapped potential of microbes and conductive materials working together.
            </p>
            
            {/* Elegant CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/research"
                className={`${getButtonClass('primary')} px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-teal-200/50`}
              >
                🔬 Explore Research Database
              </Link>
              <Link
                href="/demo"
                className={`${getButtonClass('secondary')} px-8 py-4 rounded-xl font-semibold`}
              >
                ⚡ Try Interactive Demo
              </Link>
            </div>

            {/* Stats Grid with Bio Styling */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className={`${getCardClass('primary')} p-6 text-center group cursor-pointer`}
                  onMouseEnter={() => setHoveredStat(stat.id)}
                  onMouseLeave={() => setHoveredStat(null)}
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className={`text-4xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.number}
                  </div>
                  <div className="text-gray-900 font-medium mb-2">{stat.label}</div>
                  {hoveredStat === stat.id && (
                    <div className="text-sm text-gray-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {stat.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Research Database Showcase */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Built on Scientific Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access the world's largest curated database of bioelectrochemical research,
              enhanced with AI analysis and predictive modeling. Start with solid science.
            </p>
          </div>
          
          {/* Feature Preview */}
          <div className={`${getCardClass('biofilm')} p-8 max-w-4xl mx-auto`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🧬 Real Research, Real Results
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Every paper in our database is verified with DOI, PubMed, or arXiv identification. 
                  Our AI extracts performance data, materials information, and key insights to accelerate your research.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                    AI-powered content analysis and summarization
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Performance metrics extraction and validation
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                    Advanced filtering by materials, organisms, and performance
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 mb-2">Research Database Preview</div>
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-teal-200 to-transparent rounded"></div>
                  <div className="h-4 bg-gradient-to-r from-green-200 to-transparent rounded w-4/5"></div>
                  <div className="h-4 bg-gradient-to-r from-pink-200 to-transparent rounded w-3/5"></div>
                </div>
                <div className="mt-4 flex justify-between text-xs text-gray-500">
                  <span>3,721 papers</span>
                  <span>AI analyzed</span>
                  <span>Performance data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars: Discover, Design, Scale */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              From Lab Bench to Commercial Scale
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The complete journey from scientific discovery to commercial deployment,
              all in one unified platform designed for breakthrough innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <div key={capability.title} className={`${getCardClass('primary')} p-8 group hover:shadow-xl`}>
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${capability.gradient} rounded-xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    {capability.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{capability.title}</h3>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {capability.description}
                </p>
                
                <div className="space-y-2">
                  {capability.features.map((feature) => (
                    <div key={feature} className="flex items-center text-sm text-gray-600">
                      <div className={`w-1.5 h-1.5 bg-gradient-to-r ${capability.gradient} rounded-full mr-3`}></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Applications */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              🌍 Microbes Everywhere
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bioelectrochemical systems are revolutionizing industries worldwide.
              Discover how microbes and materials are changing everything.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {industries.map((industry) => (
              <div key={industry.name} className={`bg-white rounded-xl p-6 border-l-4 hover:shadow-lg transition-all duration-300 group ${industry.color.replace('bg-', 'border-l-').split(' ')[0]}`}>
                <div className="flex items-start">
                  <div className="text-3xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    {industry.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{industry.name}</h3>
                    <p className="text-gray-600 mb-3">{industry.description}</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${industry.color}`}>
                      ⚡ {industry.impact}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-green-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Pioneer the Future?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Join researchers and innovators worldwide who are using MESSAi to unlock 
            the magic of microbial systems. From curiosity to commercial success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/research"
              className={`${getButtonClass('bioelectric')} px-8 py-4 rounded-xl font-semibold text-lg`}
            >
              🚀 Start Your Journey
            </Link>
            <Link
              href="/marketing/contact"
              className={`${getButtonClass('secondary')} px-8 py-4 rounded-xl font-semibold text-lg`}
            >
              💬 Talk to Our Team
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            Join the microbial revolution. Make the impossible inevitable.
          </p>
        </div>
      </section>
    </div>
  )
}