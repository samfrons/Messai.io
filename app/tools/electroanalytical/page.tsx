'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with Three.js
const ElectroanalyticalVisualization = dynamic(
  () => import('@/components/3d/electroanalytical/ElectroanalyticalVisualization'),
  { 
    ssr: false,
    loading: () => (
      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-4">⚡</div>
          <p className="font-serif">Loading Visualization...</p>
        </div>
      </div>
    )
  }
)

export default function ElectroanalyticalTool() {
  const [selectedMethod, setSelectedMethod] = useState('cyclic-voltammetry')
  const [parameters, setParameters] = useState({
    scanRate: 100,
    potentialWindow: [-0.5, 0.5],
    duration: 10,
    frequency: [0.1, 10000]
  })
  const [experimentData, setExperimentData] = useState(null)

  const methods = {
    'cyclic-voltammetry': {
      name: 'Cyclic Voltammetry',
      description: 'Analyze redox processes and electron transfer kinetics',
      parameters: ['Scan Rate', 'Potential Window', 'Number of Cycles']
    },
    'chronoamperometry': {
      name: 'Chronoamperometry',
      description: 'Monitor current response over time at fixed potential',
      parameters: ['Applied Potential', 'Duration', 'Sampling Rate']
    },
    'impedance': {
      name: 'Electrochemical Impedance',
      description: 'Characterize system resistance and capacitance',
      parameters: ['Frequency Range', 'AC Amplitude', 'DC Bias']
    },
    'linear-sweep': {
      name: 'Linear Sweep Voltammetry',
      description: 'Single potential sweep for basic electrochemical analysis',
      parameters: ['Start Potential', 'End Potential', 'Scan Rate']
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              Electroanalytical Interface
            </h1>
            <p className="text-xl md:text-2xl font-serif opacity-90 max-w-3xl mx-auto">
              Advanced electroanalytical techniques for bioelectrochemical system characterization
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Method Selection */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <h2 className="text-2xl font-serif font-bold mb-6 text-gray-900 dark:text-white">
              Analysis Methods
            </h2>
            
            <div className="space-y-3">
              {Object.entries(methods).map(([key, method]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMethod(key)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                    selectedMethod === key
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {method.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {method.description}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <h2 className="text-2xl font-serif font-bold mb-6 text-gray-900 dark:text-white">
              {methods[selectedMethod].name} Setup
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-6">
              {methods[selectedMethod].parameters.map((param, index) => (
                <div key={param}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {param}
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={`Enter ${param.toLowerCase()}`}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Electrode Configuration
                </label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Three-electrode setup</option>
                  <option>Two-electrode setup</option>
                  <option>Working + Reference</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Solution
                </label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Phosphate Buffer (pH 7.0)</option>
                  <option>Acetate Medium</option>
                  <option>Synthetic Wastewater</option>
                  <option>Custom Electrolyte</option>
                </select>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 font-semibold">
                Start Analysis
              </button>
            </div>
          </motion.div>

          {/* Results Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="lg:col-span-1"
          >
            <h2 className="text-2xl font-serif font-bold mb-6 text-gray-900 dark:text-white">
              Real-time Results
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden mb-6">
                <ElectroanalyticalVisualization
                  method={selectedMethod}
                  parameters={parameters}
                  onDataUpdate={(data) => setExperimentData(data)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Peak Current:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Peak Potential:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Charge Transfer:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">--</span>
                </div>
              </div>

              <button className="w-full mt-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                Export Data
              </button>
            </div>
          </motion.div>
        </div>

        {/* Technique Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-serif font-bold text-center mb-12 text-gray-900 dark:text-white">
            Electroanalytical Techniques
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🔄</span>
              </div>
              <h3 className="font-serif font-semibold mb-2 text-gray-900 dark:text-white">Cyclic Voltammetry</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Redox characterization</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">⏱️</span>
              </div>
              <h3 className="font-serif font-semibold mb-2 text-gray-900 dark:text-white">Chronoamperometry</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Time-dependent analysis</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">〰️</span>
              </div>
              <h3 className="font-serif font-semibold mb-2 text-gray-900 dark:text-white">EIS</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Impedance spectroscopy</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📈</span>
              </div>
              <h3 className="font-serif font-semibold mb-2 text-gray-900 dark:text-white">LSV</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Linear sweep voltammetry</p>
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
            href="/tools/bioreactor"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            ← Bioreactor Design
          </Link>
          <Link
            href="/models"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300"
          >
            MESS Models →
          </Link>
        </motion.div>
      </div>
    </div>
  )
}