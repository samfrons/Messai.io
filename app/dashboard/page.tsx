'use client'

import { useEffect, useState } from 'react'

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Experiment Dashboard</h1>
        <a
          href="/"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          New Experiment
        </a>
      </div>

      {experiments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No experiments yet</div>
          <a
            href="/"
            className="bg-primary text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block"
          >
            Create Your First Experiment
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {experiments.map((experiment) => (
            <div
              key={experiment.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = `/experiment/${experiment.id}`}
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
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Experiments</h3>
          <div className="text-3xl font-bold text-primary">
            {experiments.filter(e => e.status === 'running').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Power</h3>
          <div className="text-3xl font-bold text-green-600">
            {experiments.length > 0 
              ? Math.round(experiments.reduce((sum, e) => sum + e.lastPower, 0) / experiments.length)
              : 0
            } mW
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Experiments</h3>
          <div className="text-3xl font-bold text-gray-900">
            {experiments.length}
          </div>
        </div>
      </div>
    </div>
  )
}