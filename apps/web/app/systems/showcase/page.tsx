'use client'

import { useState } from 'react'
import Link from 'next/link'
import { unifiedSystemsCatalog, getDesignTypeFor3D } from '../../../src/lib/unified-systems-catalog'
import Enhanced3DSystemModal from '../../../components/Enhanced3DSystemModal'

export default function SystemsShowcasePage() {
  const [selectedSystem, setSelectedSystem] = useState(unifiedSystemsCatalog[0])

  const showcaseFeatures = [
    {
      icon: '🎮',
      title: 'Interactive 3D Visualization',
      description: 'Fully interactive 3D models for all 24 systems with real-time customization'
    },
    {
      icon: '🧪',
      title: '15+ Electrode Materials',
      description: 'From traditional carbon to cutting-edge MXenes and quantum-enhanced materials'
    },
    {
      icon: '🦠',
      title: 'Microbial Community Selection',
      description: 'Choose from Geobacter, Shewanella, and engineered species with activity tuning'
    },
    {
      icon: '🏗️',
      title: 'Chamber Customization',
      description: 'Design your reactor with 3 shapes, 3 materials, and adjustable volumes'
    },
    {
      icon: '⚡',
      title: 'Real-time AI Predictions',
      description: 'Live performance calculations as you modify parameters and materials'
    },
    {
      icon: '🔬',
      title: 'Full Experiment Integration',
      description: 'Seamlessly create experiments from your custom configurations'
    }
  ]

  const materialCategories = [
    {
      name: 'Traditional',
      icon: '🔧',
      materials: ['Carbon Cloth', 'Graphite Rod', 'Stainless Steel'],
      efficiency: '60-85%',
      cost: '$3-8'
    },
    {
      name: 'Graphene',
      icon: '💎',
      materials: ['Graphene Oxide', 'rGO', 'Aerogel'],
      efficiency: '150-200%',
      cost: '$25-45'
    },
    {
      name: 'Carbon Nanotubes',
      icon: '🧬',
      materials: ['SWCNT', 'MWCNT', 'CNT/Graphene'],
      efficiency: '140-220%',
      cost: '$30-60'
    },
    {
      name: 'MXenes',
      icon: '⚛️',
      materials: ['Ti₃C₂Tₓ', 'V₂CTₓ', 'Nb₂CTₓ'],
      efficiency: '140-180%',
      cost: '$35-50'
    },
    {
      name: 'Upcycled',
      icon: '♻️',
      materials: ['E-waste Copper', 'PCB Gold', 'Reclaimed'],
      efficiency: '40-110%',
      cost: '$2-12'
    }
  ]

  const performanceExamples = [
    {
      name: 'Quantum MXene System',
      power: '125,000 mW/m²',
      efficiency: '95%',
      features: ['Quantum coherence', 'MXene electrodes', 'CRISPR microbes']
    },
    {
      name: 'Capacitive Stack',
      power: '71,880 mW/m³',
      efficiency: '85%',
      features: ['Stack configuration', 'Capacitive storage', '3D biochar']
    },
    {
      name: 'Plant-Integrated MFC',
      power: '50 mW/m²',
      efficiency: '65%',
      features: ['Living system', 'Photosynthetic O₂', 'Self-sustaining']
    },
    {
      name: 'Budget DIY Setup',
      power: '300 mW/m²',
      efficiency: '70%',
      features: ['Earthen pot', 'Under $5 cost', 'Educational']
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎮 Interactive 3D Bioelectrochemical Systems
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-3xl mx-auto">
            Explore, customize, and build 24 cutting-edge microbial electrochemical systems with 
            full 3D visualization, real-time AI predictions, and comprehensive parameter control.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/systems"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🚀 Start Building
            </Link>
            <button
              onClick={() => setSelectedSystem(unifiedSystemsCatalog[0])}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              🎮 Try Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Complete Customization Platform
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showcaseFeatures.map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Material Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Advanced Electrode Materials
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {materialCategories.map((category, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">
                  {category.name}
                </h3>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {category.materials.map((material, midx) => (
                    <div key={midx}>{material}</div>
                  ))}
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="text-green-600">⚡ {category.efficiency}</div>
                  <div className="text-blue-600">💰 {category.cost}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Examples */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Performance Range Examples
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceExamples.map((example, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {example.name}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="text-2xl font-bold text-green-600">{example.power}</div>
                  <div className="text-lg font-medium text-blue-600">{example.efficiency}</div>
                </div>
                <div className="space-y-1">
                  {example.features.map((feature, fidx) => (
                    <div key={fidx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Try the Interactive Experience
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  🎮 Full 3D Customization
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">🔧</span>
                    <span>Select from 15+ electrode materials with real-time efficiency calculations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">🦠</span>
                    <span>Configure microbial communities with activity level control</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">🏗️</span>
                    <span>Design custom chambers with shape, material, and volume optimization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">⚡</span>
                    <span>Watch AI predictions update in real-time as you modify parameters</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">🔬</span>
                    <span>Create experiments directly from your custom configuration</span>
                  </li>
                </ul>
                
                <div className="mt-6">
                  <button
                    onClick={() => setSelectedSystem(unifiedSystemsCatalog[4])} // Quantum system
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium"
                  >
                    🚀 Launch Interactive Demo
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Systems</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">15+</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Electrode Materials</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">125k</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Max mW/m²</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">∞</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Configurations</div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                    🎯 Performance Range
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-400">
                    From $0.50 DIY builds to $10k+ quantum systems
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Build Your Custom MESS?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Join researchers worldwide using MESSAi's unified platform for advanced bioelectrochemical systems design.
            Full 3D visualization, AI predictions, and experiment integration included.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/systems"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              🎮 Start Customizing
            </Link>
            <Link
              href="/research"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
            >
              📚 Browse Research
            </Link>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      {selectedSystem && (
        <Enhanced3DSystemModal
          system={selectedSystem}
          onClose={() => setSelectedSystem(null)}
        />
      )}
    </div>
  )
}