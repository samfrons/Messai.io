'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const messModels = [
  {
    id: 'lab-mfc',
    name: 'Laboratory MFC',
    type: 'Microbial Fuel Cell',
    scale: 'Laboratory (500mL)',
    anode: 'Carbon Cloth',
    cathode: 'Copper (Cost-effective)',
    power: '15.2 mW/m²',
    efficiency: '72%',
    cost: '$180',
    description: 'Standard laboratory-scale MFC for research and education',
    image: '🧪'
  },
  {
    id: 'pilot-mec',
    name: 'Pilot MEC System',
    type: 'Microbial Electrolysis Cell',
    scale: 'Pilot Scale (50L)',
    anode: 'Graphite Felt',
    cathode: 'Stainless Steel',
    power: '28.7 mW/m²',
    efficiency: '85%',
    cost: '$2,400',
    description: 'Hydrogen production system for pilot-scale testing',
    image: '⚡'
  },
  {
    id: 'industrial-mdc',
    name: 'Industrial MDC',
    type: 'Microbial Desalination Cell',
    scale: 'Industrial (1000L)',
    anode: 'MXene Ti₃C₂Tₓ',
    cathode: 'Platinum on Carbon',
    power: '45.3 mW/m²',
    efficiency: '91%',
    cost: '$15,000',
    description: 'Large-scale water treatment with energy recovery',
    image: '🏭'
  },
  {
    id: 'benthic-mfc',
    name: 'Benthic MFC',
    type: 'Sediment Fuel Cell',
    scale: 'Field Application',
    anode: 'Carbon Nanotube',
    cathode: 'Copper Mesh',
    power: '8.5 mW/m²',
    efficiency: '58%',
    cost: '$350',
    description: 'Environmental monitoring in aquatic sediments',
    image: '🌊'
  },
  {
    id: 'algae-bioreactor',
    name: 'Algal Bioreactor',
    type: 'Algal Fuel Cell',
    scale: 'Research (2L)',
    anode: 'Reduced Graphene Oxide',
    cathode: 'Copper Wire Mesh',
    power: '22.1 mW/m²',
    efficiency: '76%',
    cost: '$520',
    description: 'Advanced algae-based bioelectricity generation',
    image: '🦠'
  },
  {
    id: 'mes-reactor',
    name: 'MES Bioreactor',
    type: 'Microbial Electrosynthesis',
    scale: 'Laboratory (1L)',
    anode: 'MWCNT on Carbon',
    cathode: 'Copper Foam',
    power: '32.4 mW/m²',
    efficiency: '88%',
    cost: '$780',
    description: 'Chemical production from CO₂ and electricity',
    image: '⚗️'
  }
]

export default function MESSModels() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              MESS Models
            </h1>
            <p className="text-xl md:text-2xl font-serif opacity-90 max-w-3xl mx-auto">
              Pre-configured microbial electrochemical system templates for rapid prototyping
            </p>
          </motion.div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-serif font-bold mb-4 text-gray-900 dark:text-white">
            Optimized System Configurations
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Each model represents a carefully optimized configuration based on scientific literature 
            and real-world performance data. Choose a template to start your design or customize further.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {messModels.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Model Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{model.image}</div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
                      {model.name}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {model.type}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {model.description}
                </p>
              </div>

              {/* Specifications */}
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Scale:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{model.scale}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Anode:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{model.anode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cathode:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{model.cathode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Power Output:</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">{model.power}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency:</span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{model.efficiency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Est. Cost:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{model.cost}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 space-y-2">
                <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-semibold">
                  Use This Model
                </button>
                <button className="w-full py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-serif font-bold mb-8 text-gray-900 dark:text-white">
            Browse by Category
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              Fuel Cells (MFC)
            </button>
            <button className="px-6 py-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
              Electrolysis (MEC)
            </button>
            <button className="px-6 py-3 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
              Desalination (MDC)
            </button>
            <button className="px-6 py-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors">
              Electrosynthesis (MES)
            </button>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl p-8">
            <h3 className="text-2xl font-serif font-bold mb-4 text-gray-900 dark:text-white">
              Need a Custom Configuration?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Our design tools can help you create optimized configurations for your specific requirements. 
              Start with a template or build from scratch with our guided design process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tools/bioreactor"
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-semibold"
              >
                Design Custom System
              </Link>
              <Link
                href="/research"
                className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold"
              >
                Browse Research
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-16 flex justify-center gap-4"
        >
          <Link
            href="/tools/electroanalytical"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            ← Electroanalytical
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}