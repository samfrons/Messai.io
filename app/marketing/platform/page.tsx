/**
 * Platform Overview Page
 * Detailed look at MESSAi's capabilities and features
 */

'use client'

import Link from 'next/link'
import { useThemeContext } from '@/hooks/useTheme'

export default function PlatformPage() {
  const { getCardClass, getButtonClass } = useThemeContext()

  const features = [
    {
      category: 'Research Engine',
      icon: '🔬',
      description: 'The world\'s most comprehensive bioelectrochemical research database',
      capabilities: [
        {
          title: 'Verified Paper Database',
          detail: '3,721 peer-reviewed papers with DOI/PubMed verification',
          metric: '3,721 papers'
        },
        {
          title: 'AI Content Analysis',
          detail: 'Automated extraction of performance data and key insights',
          metric: '32% AI processed'
        },
        {
          title: 'Advanced Filtering',
          detail: 'Search by materials, organisms, performance, and system types',
          metric: '18 filter categories'
        },
        {
          title: 'Performance Extraction',
          detail: 'Power density, efficiency, and operating conditions',
          metric: '850+ datasets'
        }
      ]
    },
    {
      category: 'Design Studio',
      icon: '⚙️',
      description: 'Interactive 3D modeling and system optimization tools',
      capabilities: [
        {
          title: '3D Visualization',
          detail: 'Interactive models of MFC, MEC, MDC, and MES systems',
          metric: '13 system types'
        },
        {
          title: 'Material Selection',
          detail: 'Comprehensive database of electrodes and membranes',
          metric: '27+ materials'
        },
        {
          title: 'Performance Prediction',
          detail: 'AI-powered predictions based on research data',
          metric: 'ML powered'
        },
        {
          title: 'Configuration Builder',
          detail: 'Design custom systems with real-time feedback',
          metric: 'Real-time'
        }
      ]
    },
    {
      category: 'Scale-Up Toolkit',
      icon: '🏭',
      description: 'Bridge the gap from laboratory to commercial deployment',
      capabilities: [
        {
          title: 'Economic Analysis',
          detail: 'ROI calculations and cost optimization models',
          metric: 'Full economics'
        },
        {
          title: 'Scale Modeling',
          detail: 'Lab bench to pilot to industrial scale simulation',
          metric: '3 scale levels'
        },
        {
          title: 'Deployment Planning',
          detail: 'Implementation roadmaps and risk assessment',
          metric: 'Step-by-step'
        },
        {
          title: 'Industry Integration',
          detail: 'Sector-specific optimization and requirements',
          metric: '5+ industries'
        }
      ]
    }
  ]

  const workflows = [
    {
      step: 1,
      title: 'Research Discovery',
      description: 'Start with the world\'s largest bioelectrochemical research database',
      actions: ['Search 3,721 verified papers', 'Filter by performance metrics', 'Extract key insights with AI']
    },
    {
      step: 2,
      title: 'System Design',
      description: 'Use interactive 3D tools to design your optimal system',
      actions: ['Select materials and configuration', 'Predict performance with AI', 'Optimize for your requirements']
    },
    {
      step: 3,
      title: 'Scale & Deploy',
      description: 'Bridge from lab bench to commercial deployment',
      actions: ['Analyze economics and ROI', 'Plan scale-up strategy', 'Deploy with confidence']
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-green-50/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              The Complete <span className="text-teal-600">Microbial Systems</span> Platform
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              From research discovery to commercial deployment - everything you need 
              to unlock the magic of bioelectrochemical systems in one unified platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className={`${getButtonClass('primary')} px-8 py-4 rounded-xl font-semibold text-lg`}
              >
                🚀 Try Interactive Demo
              </Link>
              <Link
                href="/research"
                className={`${getButtonClass('secondary')} px-8 py-4 rounded-xl font-semibold text-lg`}
              >
                📚 Browse Research Database
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Three Integrated Engines
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              MESSAi combines research, design, and deployment tools into a seamless workflow 
              that accelerates innovation from curiosity to commercial success.
            </p>
          </div>

          <div className="space-y-20">
            {features.map((feature, index) => (
              <div key={feature.category} className={`${getCardClass('primary')} p-8 lg:p-12`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-4">{feature.icon}</div>
                      <div>
                        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                          {feature.category}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {feature.capabilities.map((capability) => (
                        <div key={capability.title} className="bg-white/50 rounded-xl p-4 border border-gray-100">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {capability.title}
                            </h4>
                            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                              {capability.metric}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {capability.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Your Innovation Workflow
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow the proven path from scientific discovery to commercial deployment. 
              Each step builds on verified research and validated methodologies.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {workflows.map((workflow, index) => (
              <div key={workflow.step} className="relative">
                <div className={`${getCardClass('primary')} p-8 text-center`}>
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-6">
                    {workflow.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {workflow.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {workflow.description}
                  </p>
                  <div className="space-y-2">
                    {workflow.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Connecting Arrow */}
                {index < workflows.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-teal-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-green-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Research?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Join the researchers and innovators using MESSAi to accelerate their 
            bioelectrochemical systems from concept to commercial reality.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/demo"
              className={`${getButtonClass('bioelectric')} px-8 py-4 rounded-xl font-semibold text-lg`}
            >
              🚀 Start Free Trial
            </Link>
            <Link
              href="/marketing/contact"
              className={`${getButtonClass('secondary')} px-8 py-4 rounded-xl font-semibold text-lg`}
            >
              💬 Schedule Demo
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">3,721</div>
              <div className="text-gray-600">Research Papers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">27+</div>
              <div className="text-gray-600">Materials Database</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">AI</div>
              <div className="text-gray-600">Powered Insights</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}