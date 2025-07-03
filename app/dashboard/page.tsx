'use client'

import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Eye, Settings, TrendingUp, AlertCircle, Mail, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
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

function DashboardContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null)
  const [view3D, setView3D] = useState(true)
  const [loading, setLoading] = useState(true)
  
  const justVerified = searchParams.get('verified') === 'true'
  const needsVerification = searchParams.get('verify') === 'required'
  const isUnverified = !session?.user?.emailVerified && process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === 'true'

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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Email verification banner */}
      {(isUnverified || needsVerification) && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              <strong>Email verification required.</strong> Please verify your email to access all features.
            </p>
          </div>
          <Link
            href="/auth/verify-request"
            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
          >
            <Mail className="h-4 w-4" />
            Resend verification
          </Link>
        </div>
      )}
      
      {/* Success message for just verified users */}
      {justVerified && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-800">
              <strong>Email verified successfully!</strong> You now have full access to all MESSAi features.
            </p>
          </div>
        </div>
      )}
      
      {/* Compact header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Experiment Dashboard</h1>
            <p className="text-sm text-gray-600">Monitor and manage your MFC experiments</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView3D(!view3D)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
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
              className="bg-blue-600 text-white px-3 py-2 text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              New Experiment
            </a>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">

        {experiments.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="text-gray-500 text-lg mb-4">No experiments yet</div>
              <a
                href="/"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block"
              >
                Create Your First Experiment
              </a>
            </motion.div>
          </div>
        ) : (
          <div className="h-full flex flex-col lg:flex-row">
            {/* Left: 3D Visualization */}
            {view3D && (
              <div className="w-full lg:w-3/5 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col min-h-[400px] lg:min-h-0">
                <div className="p-3 lg:p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base lg:text-lg font-semibold text-gray-900">3D Experiment Overview</h2>
                      <p className="text-xs lg:text-sm text-gray-600">Interactive visualization</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-xs lg:text-sm text-gray-600">
                        {experiments.filter(e => e.status === 'running').length} active
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <MFCDashboard3D 
                    experiments={experiments}
                    selectedExperiment={selectedExperiment}
                    onExperimentSelect={setSelectedExperiment}
                  />
                </div>
                {selectedExperiment && (
                  <div className="p-3 lg:p-4 border-t border-gray-200 bg-blue-50 flex-shrink-0">
                    {(() => {
                      const selected = experiments.find(e => e.id === selectedExperiment)
                      return selected ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-blue-900 text-sm">{selected.name}</h3>
                            <p className="text-blue-700 text-xs">{selected.designName}</p>
                          </div>
                          <button
                            onClick={() => window.location.href = `/experiment/${selected.id}`}
                            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                          >
                            View Details
                          </button>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}
              </div>
            )}
            
            {/* Right: Experiment List */}
            <div className={`${view3D ? 'w-full lg:w-2/5' : 'w-full'} bg-white flex flex-col min-h-0`}>
              <div className="p-3 lg:p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900">Experiments</h2>
                  <span className="text-xs lg:text-sm text-gray-600">{experiments.length} total</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-2 lg:space-y-3">
                {experiments.map((experiment, index) => (
                  <motion.div
                    key={experiment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-lg p-3 lg:p-4 hover:shadow-md transition-all cursor-pointer ${
                      selectedExperiment === experiment.id 
                        ? 'border-blue-300 shadow-md bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => {
                      setSelectedExperiment(experiment.id)
                      window.location.href = `/experiment/${experiment.id}`
                    }}
                    onMouseEnter={() => setSelectedExperiment(experiment.id)}
                  >
                    <div className="flex items-start justify-between mb-2 lg:mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-xs lg:text-sm mb-1 truncate">
                          {experiment.name}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">{experiment.designName}</p>
                      </div>
                      <div className="text-right ml-2 lg:ml-3 flex-shrink-0">
                        <div className="text-sm lg:text-lg font-bold text-blue-600">
                          {experiment.lastPower.toFixed(1)} mW
                        </div>
                        <span className={`px-1 lg:px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(experiment.status)}`}>
                          {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 lg:gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">Started:</span>
                        <div className="font-medium truncate">{formatDate(experiment.createdAt)}</div>
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
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}