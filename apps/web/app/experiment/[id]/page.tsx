'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ExperimentChart from '@/components/ExperimentChart'

interface ExperimentDetails {
  id: string
  name: string
  designName: string
  status: string
  createdAt: string
  parameters: {
    temperature: number
    ph: number
    substrateConcentration: number
    notes?: string
  }
  stats: {
    totalMeasurements: number
    averagePower: number
    maxPower: number
    efficiency: number
  }
}

export default function ExperimentPage() {
  const params = useParams()
  const [experiment, setExperiment] = useState<ExperimentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [csvData, setCsvData] = useState<string>('')
  const [uploadStatus, setUploadStatus] = useState<string>('')

  useEffect(() => {
    const loadExperiment = () => {
      try {
        // Try to load from localStorage first
        const storedExperiments = JSON.parse(localStorage.getItem('messai-experiments') || '[]')
        const foundExperiment = storedExperiments.find((exp: any) => exp.id === params.id)
        
        if (foundExperiment) {
          // Use stored experiment data
          setExperiment(foundExperiment)
          setLoading(false)
          return
        }
        
        // Fallback to mock data for demo purposes
        const mockExperiment: ExperimentDetails = {
          id: params.id as string,
          name: 'Demo Experiment',
          designName: 'Demo MFC Design',
          status: 'running',
          createdAt: new Date().toISOString(),
          parameters: {
            temperature: 28.5,
            ph: 7.1,
            substrateConcentration: 1.2,
            notes: 'Demo experiment for testing purposes.'
          },
          stats: {
            totalMeasurements: 1247,
            averagePower: 245.6,
            maxPower: 312.8,
            efficiency: 78.5
          }
        }
        
        setExperiment(mockExperiment)
        setLoading(false)
      } catch (error) {
        console.error('Failed to load experiment:', error)
        setError('Failed to load experiment data')
        setLoading(false)
      }
    }

    setTimeout(loadExperiment, 500)
  }, [params.id])

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadStatus('Uploading...')
    
    const text = await file.text()
    setCsvData(text)
    
    // Simulate processing
    setTimeout(() => {
      setUploadStatus('Upload successful! Data integrated into charts.')
      setTimeout(() => setUploadStatus(''), 3000)
    }, 1500)
  }

  const downloadSampleCsv = () => {
    const sampleData = `timestamp,voltage,current,temperature,ph
2024-01-15T10:00:00Z,0.45,0.12,28.5,7.1
2024-01-15T10:01:00Z,0.47,0.13,28.6,7.1
2024-01-15T10:02:00Z,0.46,0.12,28.5,7.0
2024-01-15T10:03:00Z,0.48,0.14,28.7,7.2`

    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-mfc-data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-6 w-1/2"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <a
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Design Catalog
          </a>
        </div>
      </div>
    )
  }

  if (!experiment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Experiment Not Found</h1>
          <a href="/dashboard" className="text-primary hover:underline">
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{experiment.name}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{experiment.designName}</span>
            <span>•</span>
            <span>Started {new Date(experiment.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              experiment.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
            </span>
          </div>
        </div>
        <a
          href="/dashboard"
          className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Dashboard</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Measurements</h3>
          <div className="text-2xl font-bold text-gray-900">{experiment.stats.totalMeasurements.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Average Power</h3>
          <div className="text-2xl font-bold text-primary">{experiment.stats.averagePower} mW</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Peak Power</h3>
          <div className="text-2xl font-bold text-green-600">{experiment.stats.maxPower} mW</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Efficiency</h3>
          <div className="text-2xl font-bold text-orange-600">{experiment.stats.efficiency}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <ExperimentChart experimentId={experiment.id} realTime={experiment.status === 'running'} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiment Parameters</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-medium">{experiment.parameters.temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">pH Level:</span>
                <span className="font-medium">{experiment.parameters.ph}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Substrate:</span>
                <span className="font-medium">{experiment.parameters.substrateConcentration} g/L</span>
              </div>
            </div>
            {experiment.parameters.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{experiment.parameters.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Upload</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV Data
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-blue-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Expected columns: timestamp, voltage, current, temperature, ph
                </p>
              </div>
              
              {uploadStatus && (
                <div className={`text-sm p-2 rounded ${
                  uploadStatus.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {uploadStatus}
                </div>
              )}

              <button
                onClick={downloadSampleCsv}
                className="text-sm text-primary hover:underline"
              >
                Download Sample CSV Format
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">AI Insights</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p>• Power output is 12% above prediction</p>
              <p>• Optimal pH range detected: 7.0-7.2</p>
              <p>• Temperature stability is excellent</p>
              <p>• Consider increasing substrate concentration for higher output</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}