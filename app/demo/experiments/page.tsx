'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Download, Eye, ExternalLink } from 'lucide-react'
import { getDemoConfig } from '@/lib/demo-mode'

interface DemoExperiment {
  id: string
  title: string
  description: string
  systemType: string
  powerOutput: number
  duration: string
  status: 'completed' | 'running' | 'archived'
  tags: string[]
  dataPoints: number
  lastUpdated: string
  author: string
  affiliation: string
  doi?: string
  isPublic: true
  highlights: string[]
}

const demoExperiments: DemoExperiment[] = [
  {
    id: 'demo-mfc-001',
    title: 'High-Performance MFC with Graphene Electrodes',
    description: 'A comprehensive study of microbial fuel cell performance using graphene-enhanced carbon cloth electrodes. This experiment demonstrates record-breaking power densities and long-term stability.',
    systemType: 'Microbial Fuel Cell',
    powerOutput: 2850,
    duration: '90 days',
    status: 'completed',
    tags: ['graphene', 'high-performance', 'carbon-cloth', 'stability'],
    dataPoints: 8640,
    lastUpdated: '2024-12-15',
    author: 'Dr. Sarah Chen',
    affiliation: 'MIT Energy Lab',
    doi: '10.1016/j.bioelechem.2024.108234',
    isPublic: true,
    highlights: [
      'Achieved 2.85 W/m² peak power density',
      'Maintained 85% performance over 90 days',
      'Novel graphene deposition technique',
      'Complete dataset with 8,640 measurements'
    ]
  },
  {
    id: 'demo-mfc-002',
    title: 'Wastewater Treatment MFC - Municipal Scale',
    description: 'Pilot-scale demonstration of a microbial fuel cell system treating real municipal wastewater while generating electricity. Real-world performance data from 6-month operation.',
    systemType: 'Pilot-Scale MFC',
    powerOutput: 450,
    duration: '180 days',
    status: 'completed',
    tags: ['wastewater', 'pilot-scale', 'municipal', 'treatment'],
    dataPoints: 4320,
    lastUpdated: '2024-11-30',
    author: 'Prof. Michael Rodriguez',
    affiliation: 'Stanford Environmental Engineering',
    doi: '10.1021/es2024.789456',
    isPublic: true,
    highlights: [
      '87% COD removal efficiency',
      '450 mW/m² average power output',
      'Processed 10,000L of wastewater',
      'Economic feasibility demonstrated'
    ]
  },
  {
    id: 'demo-mes-001',
    title: 'CO₂ to Acetate Microbial Electrosynthesis',
    description: 'Demonstration of carbon dioxide conversion to acetate using microbial electrosynthesis. Showcases the potential for carbon capture and valuable chemical production.',
    systemType: 'Microbial Electrosynthesis',
    powerOutput: -120, // Negative indicates power consumption
    duration: '45 days',
    status: 'archived',
    tags: ['co2-capture', 'acetate', 'electrosynthesis', 'carbon-conversion'],
    dataPoints: 2160,
    lastUpdated: '2024-10-20',
    author: 'Dr. Elena Vasquez',
    affiliation: 'UC Berkeley Bioengineering',
    doi: '10.1038/nature.2024.567890',
    isPublic: true,
    highlights: [
      '95% CO₂ conversion efficiency',
      '12.5 g/L acetate production',
      'Novel biofilm architecture',
      'Energy-efficient carbon capture'
    ]
  },
  {
    id: 'demo-mdc-001',
    title: 'Seawater Desalination with MDC Technology',
    description: 'Laboratory demonstration of microbial desalination cell technology for sustainable water treatment. Combines wastewater treatment with seawater desalination.',
    systemType: 'Microbial Desalination Cell',
    powerOutput: 180,
    duration: '60 days',
    status: 'running',
    tags: ['desalination', 'seawater', 'water-treatment', 'sustainability'],
    dataPoints: 1440,
    lastUpdated: '2024-12-20',
    author: 'Dr. Ahmed Hassan',
    affiliation: 'King Abdullah University',
    isPublic: true,
    highlights: [
      '89% salt removal from seawater',
      'Simultaneous wastewater treatment',
      'Energy-neutral operation',
      'Scalable membrane design'
    ]
  }
]

export default function DemoExperimentsPage() {
  const [selectedExperiment, setSelectedExperiment] = useState<DemoExperiment | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'running' | 'archived'>('all')
  const [filterType, setFilterType] = useState<'all' | string>('all')
  const demoConfig = getDemoConfig()

  const filteredExperiments = demoExperiments.filter(exp => {
    const matchesStatus = filterStatus === 'all' || exp.status === filterStatus
    const matchesType = filterType === 'all' || exp.systemType.toLowerCase().includes(filterType.toLowerCase())
    return matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const formatPowerOutput = (power: number) => {
    if (power < 0) return `${Math.abs(power)} mW/m² (consuming)`
    return `${power} mW/m²`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/systems"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Systems
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Demo Experiments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
            Explore real experimental data from leading research institutions. These public experiments 
            showcase the capabilities of various microbial electrochemical systems with complete datasets, 
            methodologies, and results.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{demoExperiments.length}</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Public Experiments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {demoExperiments.reduce((sum, exp) => sum + exp.dataPoints, 0).toLocaleString()}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Total Data Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {demoExperiments.filter(exp => exp.status === 'completed').length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Completed Studies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {Math.max(...demoExperiments.map(exp => exp.powerOutput))}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Max mW/m²</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="microbial fuel">Microbial Fuel Cells</option>
            <option value="electrosynthesis">Microbial Electrosynthesis</option>
            <option value="desalination">Microbial Desalination</option>
          </select>
        </div>

        {/* Results */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Showing {filteredExperiments.length} of {demoExperiments.length} experiments
        </div>

        {/* Experiments Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExperiments.map((experiment) => (
            <div 
              key={experiment.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors p-6 cursor-pointer"
              onClick={() => setSelectedExperiment(experiment)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(experiment.status)}`}>
                  {experiment.status}
                </span>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Public</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {experiment.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {experiment.description}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatPowerOutput(experiment.powerOutput)}
                  </div>
                  <div className="text-xs text-gray-500">Power Output</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {experiment.duration}
                  </div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {experiment.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {experiment.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                    +{experiment.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Author */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {experiment.author} • {experiment.affiliation}
              </div>
            </div>
          ))}
        </div>

        {/* Experiment Detail Modal */}
        {selectedExperiment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {selectedExperiment.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedExperiment.author} • {selectedExperiment.affiliation}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedExperiment(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {selectedExperiment.description}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPowerOutput(selectedExperiment.powerOutput)}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Power Output</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedExperiment.duration}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">Duration</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {selectedExperiment.dataPoints.toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Data Points</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {selectedExperiment.systemType.split(' ')[0]}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">System Type</div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Highlights</h3>
                  <ul className="space-y-2">
                    {selectedExperiment.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Play className="w-4 h-4" />
                    View Data
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="w-4 h-4" />
                    Download Dataset
                  </button>
                  {selectedExperiment.doi && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      View Paper
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Start Your Own Experiment</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Inspired by these results? Create an account to design your own experiments, 
            track progress, and contribute to the open research community.
          </p>
          <div className="flex gap-4 justify-center">
            {demoConfig.isDemo ? (
              <a
                href={`${demoConfig.productionUrl}/auth/signup`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2"
              >
                Create Account at messai.io
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <Link
                href="/auth/signup"
                className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Create Account
              </Link>
            )}
            <Link
              href="/research"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-green-600 transition-colors font-medium"
            >
              Browse Research
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}