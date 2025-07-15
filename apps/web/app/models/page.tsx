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
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-cream py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="heading-1 text-black mb-6">
              MESS Models
            </h1>
            <p className="body-large text-black opacity-60 max-w-3xl mx-auto">
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
          <h2 className="heading-2 text-black mb-4">
            Optimized System Configurations
          </h2>
          <p className="body-large text-black opacity-60 max-w-3xl mx-auto">
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
              className="bg-white border border-gray-200 hover:border-black/20 transition-all duration-300"
            >
              {/* Model Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{model.image}</div>
                  <div>
                    <h3 className="text-xl font-serif text-black">
                      {model.name}
                    </h3>
                    <p className="text-sm text-black opacity-60 font-medium">
                      {model.type}
                    </p>
                  </div>
                </div>
                <p className="text-black opacity-60 text-sm">
                  {model.description}
                </p>
              </div>

              {/* Specifications */}
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-black opacity-60">Scale:</span>
                  <span className="text-sm font-medium text-black">{model.scale}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-black opacity-60">Anode:</span>
                  <span className="text-sm font-medium text-black">{model.anode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-black opacity-60">Cathode:</span>
                  <span className="text-sm font-medium text-black">{model.cathode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-black opacity-60">Power Output:</span>
                  <span className="text-sm font-semibold text-black">{model.power}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-black opacity-60">Efficiency:</span>
                  <span className="text-sm font-semibold text-black">{model.efficiency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-black opacity-60">Est. Cost:</span>
                  <span className="text-sm font-semibold text-black">{model.cost}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 space-y-2">
                <button className="w-full btn-primary">
                  Use This Model
                </button>
                <button className="w-full py-2 border border-gray-200 text-black hover:bg-black/5 transition-colors text-sm">
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
          <h3 className="heading-3 text-black mb-8">
            Browse by Category
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-white text-black border border-gray-200 hover:bg-black/5 transition-colors">
              Fuel Cells (MFC)
            </button>
            <button className="px-6 py-3 bg-white text-black border border-gray-200 hover:bg-black/5 transition-colors">
              Electrolysis (MEC)
            </button>
            <button className="px-6 py-3 bg-white text-black border border-gray-200 hover:bg-black/5 transition-colors">
              Desalination (MDC)
            </button>
            <button className="px-6 py-3 bg-white text-black border border-gray-200 hover:bg-black/5 transition-colors">
              Electrosynthesis (MES)
            </button>
          </div>
        </motion.div>

        {/* 3D Showcase CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-white border border-gray-200 p-8">
            <h3 className="heading-3 text-black mb-4">
              🚀 New: Interactive 3D Model Showcase
            </h3>
            <p className="mb-6 max-w-2xl mx-auto text-black opacity-60">
              Explore our bioelectrochemical systems in stunning 3D. Rotate, zoom, and visualize 
              biofilm growth, flow patterns, and system components in real-time.
            </p>
            <Link
              href="/models/3d-showcase"
              className="inline-block px-8 py-3 bg-black text-white hover:opacity-80 transition-opacity font-semibold"
            >
              View 3D Showcase
            </Link>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-8 text-center"
        >
          <div className="bg-gradient-to-r from-caladan-accent/10 to-caladan-medium/10 rounded-xl p-8 border border-white/10">
            <h3 className="caladan-heading-3 mb-4 text-white">
              Need a Custom Configuration?
            </h3>
            <p className="caladan-body text-gray-300 mb-6 max-w-2xl mx-auto">
              Our design tools can help you create optimized configurations for your specific requirements. 
              Start with a template or build from scratch with our guided design process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tools/bioreactor"
                className="caladan-button font-semibold"
              >
                Design Custom System
              </Link>
              <Link
                href="/research"
                className="px-8 py-3 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 transition-colors font-semibold"
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
            className="px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
          >
            ← Electroanalytical
          </Link>
          <Link
            href="/"
            className="caladan-button"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}