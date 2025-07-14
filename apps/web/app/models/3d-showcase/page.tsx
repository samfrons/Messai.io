'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Scene from '@/components/3d/core/Scene'
import BioreactorModel from '@/components/3d/bioreactor/BioreactorModel'
import BiofilmSimulation from '@/components/3d/biofilm/BiofilmSimulation'
import { useMaterials } from '@/components/3d/core/Materials'

const showcaseModels = [
  {
    id: 'single-chamber-mfc',
    name: 'Single Chamber MFC',
    description: 'Air cathode microbial fuel cell for wastewater treatment',
    systemType: 'MFC' as const,
    scale: 'laboratory' as const,
    anode: 'carbonCloth',
    cathode: 'stainlessSteel',
  },
  {
    id: 'dual-chamber-mec',
    name: 'Dual Chamber MEC',
    description: 'Hydrogen production system with proton exchange membrane',
    systemType: 'MEC' as const,
    scale: 'pilot' as const,
    anode: 'graphiteFelt',
    cathode: 'platinum',
  },
  {
    id: 'three-chamber-mdc',
    name: 'Three Chamber MDC',
    description: 'Desalination cell with anion and cation exchange membranes',
    systemType: 'MDC' as const,
    scale: 'laboratory' as const,
    anode: 'carbonNanotube',
    cathode: 'carbonCloth',
  },
  {
    id: 'mes-bioreactor',
    name: 'MES Bioreactor',
    description: 'Microbial electrosynthesis for CO₂ reduction',
    systemType: 'MES' as const,
    scale: 'laboratory' as const,
    anode: 'mxeneTi3C2Tx',
    cathode: 'copper',
  },
]

export default function ModelShowcase() {
  const [selectedModel, setSelectedModel] = useState(showcaseModels[0])
  const [showBiofilm, setShowBiofilm] = useState(false)
  const [viewMode, setViewMode] = useState<'model' | 'biofilm' | 'flow'>('model')
  const materials = useMaterials()
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              3D Model Showcase
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Interactive 3D visualization of microbial electrochemical systems
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Model Selection */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Select Model
              </h2>
              
              <div className="space-y-3">
                {showcaseModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedModel.id === model.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {model.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {model.description}
                    </p>
                  </button>
                ))}
              </div>
              
              {/* View Mode Toggle */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                  Visualization Mode
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setViewMode('model')}
                    className={`w-full py-2 px-4 rounded-lg ${
                      viewMode === 'model'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    System Model
                  </button>
                  <button
                    onClick={() => setViewMode('biofilm')}
                    className={`w-full py-2 px-4 rounded-lg ${
                      viewMode === 'biofilm'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Biofilm Growth
                  </button>
                  <button
                    onClick={() => setViewMode('flow')}
                    className={`w-full py-2 px-4 rounded-lg ${
                      viewMode === 'flow'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Flow Patterns
                  </button>
                </div>
              </div>
              
              {/* Options */}
              <div className="mt-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showBiofilm}
                    onChange={(e) => setShowBiofilm(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Show Biofilm Layer
                  </span>
                </label>
              </div>
            </motion.div>
          </div>

          {/* 3D Viewer */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="h-[600px] relative">
                <Scene debug controls environment>
                  {viewMode === 'model' && (
                    <BioreactorModel
                      systemType={selectedModel.systemType}
                      scale={selectedModel.scale}
                      anodeMaterial={selectedModel.anode}
                      cathodeMaterial={selectedModel.cathode}
                    />
                  )}
                  
                  {viewMode === 'biofilm' && (
                    <BiofilmSimulation
                      surfaceWidth={2}
                      surfaceHeight={1}
                      thickness={0.1}
                      growthRate={0.2}
                      material={materials.biofilm}
                      showGrowthStages
                    />
                  )}
                  
                  {viewMode === 'flow' && (
                    <BioreactorModel
                      systemType={selectedModel.systemType}
                      scale={selectedModel.scale}
                      anodeMaterial={selectedModel.anode}
                      cathodeMaterial={selectedModel.cathode}
                    />
                  )}
                </Scene>
              </div>
              
              {/* Model Info */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  {selectedModel.name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedModel.systemType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Scale:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                      {selectedModel.scale}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Anode:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedModel.anode}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Cathode:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedModel.cathode}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            3D Visualization Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Interactive Controls
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Rotate, zoom, and pan to explore models from any angle
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🦠</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Biofilm Simulation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Watch biofilm growth and microbial community development
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💧</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Flow Visualization
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                See substrate flow and electron transfer in real-time
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex justify-center gap-4"
        >
          <Link
            href="/models"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            ← Back to Models
          </Link>
          <Link
            href="/tools/bioreactor"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
          >
            Design Your Own →
          </Link>
        </motion.div>
      </div>
    </div>
  )
}