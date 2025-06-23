'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, Settings, TrendingUp } from 'lucide-react'
import MFCDashboard3D from '@/components/MFCDashboard3D'

interface Experiment {
  id: string
  name: string
  designName: string
  status: string
  createdAt: string
  lastPower: number
  parameters: {
    temperature: number
    ph: number
    substrateConcentration: number
  }
}

export default function DashboardPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null)
  const [view3D, setView3D] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock experiments data
    const mockExperiments: Experiment[] = [
      {
        id: 'exp-1',
        name: 'Earthen Pot Test #1',
        designName: 'Earthen Pot MFC',
        status: 'running',
        createdAt: '2024-01-15',
        lastPower: 245.6,
        parameters: { temperature: 28.5, ph: 7.1, substrateConcentration: 1.2 }
      },
      {
        id: 'exp-2',
        name: '3D Printed Optimization',
        designName: '3D Printed MFC',
        status: 'running',
        createdAt: '2024-01-12',
        lastPower: 421.8,
        parameters: { temperature: 32.0, ph: 6.8, substrateConcentration: 1.8 }
      },
      {
        id: 'exp-3',
        name: 'Mason Jar Baseline',
        designName: 'Mason Jar MFC',
        status: 'completed',
        createdAt: '2024-01-08',
        lastPower: 312.4,
        parameters: { temperature: 25.5, ph: 7.3, substrateConcentration: 1.0 }
      }
    ]

    setTimeout(() => {
      setExperiments(mockExperiments)
      setLoading(false)
    }, 500)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'setup':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-6 w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-6 bg-gray-300 rounded mb-4 w-1/2"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Experiment Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your MFC experiments</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView3D(!view3D)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              view3D 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="h-4 w-4" />
            3D View
          </motion.button>
          <a
            href="/"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            New Experiment
          </a>
        </div>
      </motion.div>

      {experiments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-gray-500 text-lg mb-4">No experiments yet</div>
          <a
            href="/"
            className="bg-primary text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block"
          >
            Create Your First Experiment
          </a>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* 3D Visualization */}
          {view3D && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">3D Experiment Overview</h2>
                  <p className="text-gray-600 text-sm">Interactive visualization of all experiments</p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">
                    {experiments.filter(e => e.status === 'running').length} active
                  </span>
                </div>
              </div>
              <MFCDashboard3D 
                experiments={experiments}
                selectedExperiment={selectedExperiment}
                onExperimentSelect={setSelectedExperiment}
              />
              {selectedExperiment && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  {(() => {
                    const selected = experiments.find(e => e.id === selectedExperiment)
                    return selected ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-blue-900">{selected.name}</h3>
                          <p className="text-blue-700 text-sm">{selected.designName}</p>
                        </div>
                        <button
                          onClick={() => window.location.href = `/experiment/${selected.id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    ) : null
                  })()} 
                </motion.div>
              )}
            </motion.div>
          )}
          {/* Experiment List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Experiment List</h2>
              <span className="text-sm text-gray-600">{experiments.length} total experiments</span>
            </div>
            {experiments.map((experiment, index) => (
              <motion.div
                key={experiment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-lg border p-6 hover:shadow-md transition-all cursor-pointer ${
                  selectedExperiment === experiment.id 
                    ? 'border-blue-300 shadow-md bg-blue-50' 
                    : 'border-gray-200'
                }`}
                onClick={() => {
                  setSelectedExperiment(experiment.id)
                  window.location.href = `/experiment/${experiment.id}`
                }}
                onMouseEnter={() => setSelectedExperiment(experiment.id)}
              >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {experiment.name}
                  </h3>
                  <p className="text-gray-600">{experiment.designName}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(experiment.status)}`}>
                    {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {experiment.lastPower.toFixed(1)} mW
                    </div>
                    <div className="text-sm text-gray-500">Current Power</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Started:</span>
                  <div className="font-medium">{formatDate(experiment.createdAt)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Temperature:</span>
                  <div className="font-medium">{experiment.parameters.temperature}°C</div>
                </div>
                <div>
                  <span className="text-gray-600">pH Level:</span>
                  <div className="font-medium">{experiment.parameters.ph}</div>
                </div>
                <div>
                  <span className="text-gray-600">Substrate:</span>
                  <div className="font-medium">{experiment.parameters.substrateConcentration} g/L</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Click to view detailed charts and analysis
                  </div>
                  <div className="text-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Active</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {experiments.filter(e => e.status === 'running').length}
          </div>
          <p className="text-sm text-gray-600 mt-1">Running experiments</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Average Power</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {experiments.length > 0 
              ? Math.round(experiments.reduce((sum, e) => sum + e.lastPower, 0) / experiments.length)
              : 0
            } mW
          </div>
          <p className="text-sm text-gray-600 mt-1">Across all experiments</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Peak Power</h3>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {experiments.length > 0 
              ? Math.max(...experiments.map(e => e.lastPower)).toFixed(1)
              : 0
            } mW
          </div>
          <p className="text-sm text-gray-600 mt-1">Highest recorded</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Total</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {experiments.length}
          </div>
          <p className="text-sm text-gray-600 mt-1">All experiments</p>
        </div>
      </motion.div>
    </div>
  )
}