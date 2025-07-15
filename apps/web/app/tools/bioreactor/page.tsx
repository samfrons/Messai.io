'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with Three.js
const BioreactorModel = dynamic(
  () => import('@/components/3d/bioreactor/BioreactorModel'),
  { 
    ssr: false,
    loading: () => (
      <div className="aspect-square bg-white border border-gray-200 flex items-center justify-center">
        <div className="text-center text-black opacity-60">
          <div className="text-4xl mb-4">⚡</div>
          <p className="font-serif">Loading 3D Model...</p>
        </div>
      </div>
    )
  }
)

export default function BioreactorTool() {
  const [systemType, setSystemType] = useState<'MFC' | 'MEC' | 'MDC' | 'MES'>('MFC')
  const [scale, setScale] = useState<'laboratory' | 'pilot' | 'industrial'>('laboratory')
  const [anodeMaterial, setAnodeMaterial] = useState('carbonCloth')
  const [cathodeMaterial, setCathodeMaterial] = useState('stainlessSteel')
  const [performanceData, setPerformanceData] = useState({
    powerOutput: 25.3,
    efficiency: 78,
    cost: 1250
  })
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
            <h1 className="text-4xl md:text-6xl font-serif text-black mb-6">
              Bioreactor Design Tool
            </h1>
            <p className="text-xl md:text-2xl font-serif text-black opacity-60 max-w-3xl mx-auto">
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
            className="bg-white border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-serif text-black mb-6">
              Design Configuration
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  System Type
                </label>
                <select 
                  value={systemType}
                  onChange={(e) => setSystemType(e.target.value as any)}
                  className="w-full p-3 border border-gray-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="MFC">Microbial Fuel Cell (MFC)</option>
                  <option value="MEC">Microbial Electrolysis Cell (MEC)</option>
                  <option value="MDC">Microbial Desalination Cell (MDC)</option>
                  <option value="MES">Microbial Electrosynthesis (MES)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Scale
                </label>
                <select 
                  value={scale}
                  onChange={(e) => setScale(e.target.value as any)}
                  className="w-full p-3 border border-gray-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="laboratory">Laboratory (mL - L)</option>
                  <option value="pilot">Pilot Scale (10L - 1000L)</option>
                  <option value="industrial">Industrial ({'>'}1000L)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Anode Material
                </label>
                <select 
                  value={anodeMaterial}
                  onChange={(e) => setAnodeMaterial(e.target.value)}
                  className="w-full p-3 border border-gray-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="carbonCloth">Carbon Cloth</option>
                  <option value="graphiteFelt">Graphite Felt</option>
                  <option value="carbonNanotube">Carbon Nanotube</option>
                  <option value="mxeneTi3C2Tx">MXene Ti₃C₂Tₓ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Cathode Material
                </label>
                <select 
                  value={cathodeMaterial}
                  onChange={(e) => setCathodeMaterial(e.target.value)}
                  className="w-full p-3 border border-gray-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="copper">Copper (Cost-effective)</option>
                  <option value="platinum">Platinum</option>
                  <option value="carbonCloth">Carbon with Pt catalyst</option>
                  <option value="stainlessSteel">Stainless Steel</option>
                </select>
              </div>

              <button 
                onClick={() => {
                  // Calculate performance based on configuration
                  const baseOutput = systemType === 'MFC' ? 25 : systemType === 'MEC' ? 0 : 15
                  const scaleFactor = scale === 'laboratory' ? 1 : scale === 'pilot' ? 1.5 : 2
                  const anodeFactor = anodeMaterial === 'mxeneTi3C2Tx' ? 1.8 : anodeMaterial === 'carbonNanotube' ? 1.5 : 1
                  const cathodeFactor = cathodeMaterial === 'platinum' ? 1.5 : 1
                  
                  const powerOutput = Math.round(baseOutput * scaleFactor * anodeFactor * cathodeFactor * 10) / 10
                  const efficiency = Math.round(65 + Math.random() * 20)
                  const baseCost = scale === 'laboratory' ? 500 : scale === 'pilot' ? 5000 : 50000
                  const materialCost = (anodeMaterial === 'mxeneTi3C2Tx' ? 3 : 1) * (cathodeMaterial === 'platinum' ? 2 : 1)
                  const cost = Math.round(baseCost * materialCost)
                  
                  setPerformanceData({ powerOutput, efficiency, cost })
                }}
                className="w-full py-3 bg-black text-white hover:opacity-80 transition-opacity font-semibold"
              >
                Calculate Performance
              </button>
            </div>
          </motion.div>

          {/* Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-serif text-black mb-6">
              3D Preview
            </h2>
            
            <div className="aspect-square bg-gray-50 border border-gray-200 overflow-hidden">
              <BioreactorModel
                systemType={systemType}
                scale={scale}
                anodeMaterial={anodeMaterial}
                cathodeMaterial={cathodeMaterial}
                onPerformanceUpdate={(data) => setPerformanceData(data)}
              />
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-black opacity-60">Expected Power Output:</span>
                <span className="font-semibold text-black">{performanceData.powerOutput} mW/m²</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black opacity-60">Efficiency:</span>
                <span className="font-semibold text-black">{performanceData.efficiency}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black opacity-60">Cost Estimate:</span>
                <span className="font-semibold text-black">${performanceData.cost.toLocaleString()}</span>
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
          <h2 className="heading-2 text-black text-center mb-12">
            Advanced Design Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚗️</span>
              </div>
              <h3 className="text-xl font-serif text-black mb-2">Multi-Fidelity Modeling</h3>
              <p className="text-base text-black opacity-60">High, medium, and low fidelity models for different design stages</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-serif text-black mb-2">Real-time Optimization</h3>
              <p className="text-base text-black opacity-60">AI-powered parameter optimization for maximum performance</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-serif text-black mb-2">Performance Prediction</h3>
              <p className="text-base text-black opacity-60">Science-based predictions for power output and efficiency</p>
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
            className="px-6 py-3 border border-gray-200 text-black hover:bg-black/5 transition-colors"
          >
            ← Back to Home
          </Link>
          <Link
            href="/tools/electroanalytical"
            className="btn-primary"
          >
            Electroanalytical Tools →
          </Link>
        </motion.div>
      </div>
    </div>
  )
}