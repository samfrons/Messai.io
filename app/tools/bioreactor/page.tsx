'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function BioreactorTool() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              Bioreactor Design Tool
            </h1>
            <p className="text-xl md:text-2xl font-serif opacity-90 max-w-3xl mx-auto">
              Design next-generation bioelectrochemical systems with advanced modeling and optimization
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tool Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Design Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8"
          >
            <h2 className="text-2xl font-serif font-bold mb-6 text-gray-900 dark:text-white">
              Design Configuration
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  System Type
                </label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Microbial Fuel Cell (MFC)</option>
                  <option>Microbial Electrolysis Cell (MEC)</option>
                  <option>Microbial Desalination Cell (MDC)</option>
                  <option>Microbial Electrosynthesis (MES)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scale
                </label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Laboratory (mL - L)</option>
                  <option>Pilot Scale (10L - 1000L)</option>
                  <option>Industrial (>1000L)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Anode Material
                </label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Carbon Cloth</option>
                  <option>Graphite Felt</option>
                  <option>Carbon Nanotube</option>
                  <option>MXene Ti₃C₂Tₓ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cathode Material
                </label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Copper (Cost-effective)</option>
                  <option>Platinum</option>
                  <option>Carbon with Pt catalyst</option>
                  <option>Stainless Steel</option>
                </select>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-semibold">
                Generate Design
              </button>
            </div>
          </motion.div>

          {/* Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8"
          >
            <h2 className="text-2xl font-serif font-bold mb-6 text-gray-900 dark:text-white">
              3D Preview
            </h2>
            
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">🧬</div>
                <p className="font-serif">3D Model will render here</p>
                <p className="text-sm mt-2">Select configuration to preview</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Expected Power Output:</span>
                <span className="font-semibold text-gray-900 dark:text-white">25.3 mW/m²</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency:</span>
                <span className="font-semibold text-gray-900 dark:text-white">78%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cost Estimate:</span>
                <span className="font-semibold text-gray-900 dark:text-white">$1,250</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-serif font-bold text-center mb-12 text-gray-900 dark:text-white">
            Advanced Design Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚗️</span>
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2 text-gray-900 dark:text-white">Multi-Fidelity Modeling</h3>
              <p className="text-gray-600 dark:text-gray-400">High, medium, and low fidelity models for different design stages</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2 text-gray-900 dark:text-white">Real-time Optimization</h3>
              <p className="text-gray-600 dark:text-gray-400">AI-powered parameter optimization for maximum performance</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2 text-gray-900 dark:text-white">Performance Prediction</h3>
              <p className="text-gray-600 dark:text-gray-400">Science-based predictions for power output and efficiency</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 flex justify-center gap-4"
        >
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            ← Back to Home
          </Link>
          <Link
            href="/tools/electroanalytical"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300"
          >
            Electroanalytical Tools →
          </Link>
        </motion.div>
      </div>
    </div>
  )
}