'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UnifiedMESSSystem, getRelatedSystems, standardizePowerOutput } from '@/lib/unified-systems-catalog'
import ParameterForm from './ParameterForm'

interface SystemDetailModalProps {
  system: UnifiedMESSSystem
  onClose: () => void
}

export default function SystemDetailModal({ system, onClose }: SystemDetailModalProps) {
  const [showParameterForm, setShowParameterForm] = useState(false)
  const relatedSystems = getRelatedSystems(system.id, 3)

  // Format power output for display
  const formatPowerOutput = () => {
    const { value, unit, range, conditions } = system.powerOutput
    if (range) return range
    
    // Format large numbers
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k ${unit}`
    }
    return `${value} ${unit}`
  }

  // Get priority badge if applicable
  const getPriorityBadge = () => {
    if (!system.priority) return null
    
    switch (system.priority) {
      case 1: return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 text-xs font-medium rounded-full">Priority 1</span>
      case 2: return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 text-xs font-medium rounded-full">Priority 2</span>
      case 3: return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-xs font-medium rounded-full">Priority 3</span>
      default: return null
    }
  }

  const handleExperimentSubmit = async (parameters: any) => {
    try {
      // Generate unique experiment ID
      const experimentId = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Create experiment data
      const experimentData = {
        id: experimentId,
        name: parameters.name,
        systemId: system.id,
        systemName: system.name,
        systemType: system.systemType,
        status: 'setup',
        createdAt: new Date().toISOString(),
        parameters: parameters,
        stats: {
          totalMeasurements: 0,
          averagePower: 0,
          maxPower: 0,
          efficiency: 0
        }
      }
      
      // Store in localStorage for demo
      const existingExperiments = JSON.parse(localStorage.getItem('messai-experiments') || '[]')
      existingExperiments.push(experimentData)
      localStorage.setItem('messai-experiments', JSON.stringify(existingExperiments))
      
      // Redirect to experiment view
      window.location.href = `/experiment/${experimentId}`
    } catch (error) {
      console.error('Failed to create experiment:', error)
      alert('Failed to create experiment. Please try again.')
    }
  }

  if (showParameterForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <ParameterForm
            designId={system.id}
            designName={system.name}
            designType={system.designType || system.systemType.toLowerCase()}
            onSubmit={handleExperimentSubmit}
            onCancel={() => setShowParameterForm(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{system.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{system.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">System Type:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{system.systemType}</span>
                {getPriorityBadge()}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Performance Metrics */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Performance Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatPowerOutput()}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Power Output</div>
                {system.powerOutput.conditions && (
                  <div className="text-xs text-green-500 dark:text-green-500 mt-1">
                    {system.powerOutput.conditions}
                  </div>
                )}
              </div>
              {system.efficiency && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {system.efficiency}%
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Efficiency</div>
                </div>
              )}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-lg font-bold text-purple-700 dark:text-purple-300 capitalize">
                  {system.scale}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Scale</div>
              </div>
            </div>
          </div>

          {/* Materials */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Materials</h4>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Anode:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{system.materials.anode.join(', ')}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Cathode:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{system.materials.cathode.join(', ')}</span>
              </div>
              {system.materials.membrane && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Membrane:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{system.materials.membrane}</span>
                </div>
              )}
              {system.materials.container && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Container:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{system.materials.container}</span>
                </div>
              )}
              {system.materials.additives && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Additives:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{system.materials.additives.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Organisms */}
          {system.organisms && system.organisms.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Organisms</h4>
              <div className="flex flex-wrap gap-2">
                {system.organisms.map((organism, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded-full"
                  >
                    {organism}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Special Features */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Special Features</h4>
            <ul className="space-y-2">
              {system.specialFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Applications */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Applications</h4>
            <div className="flex flex-wrap gap-2">
              {system.applications.map((app, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                >
                  {app}
                </span>
              ))}
            </div>
          </div>

          {/* Research Highlights */}
          {system.researchHighlights && system.researchHighlights.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Research Highlights</h4>
              <ul className="space-y-2">
                {system.researchHighlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-600 dark:text-gray-400">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cost and Implementation */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Cost Range</h4>
              <p className="text-gray-600 dark:text-gray-400">{system.cost.value}</p>
            </div>
            {system.dimensions && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Dimensions</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {system.dimensions.volume && `Volume: ${system.dimensions.volume}`}
                  {system.dimensions.area && `Area: ${system.dimensions.area}`}
                  {system.dimensions.custom && system.dimensions.custom}
                </p>
              </div>
            )}
          </div>

          {/* Visualization Notes */}
          {system.visualizationNotes && (
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">3D Visualization Notes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{system.visualizationNotes}</p>
            </div>
          )}

          {/* Related Systems */}
          {relatedSystems.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Related Systems</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedSystems.map((related) => (
                  <div
                    key={related.id}
                    className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors"
                    onClick={() => {
                      onClose()
                      setTimeout(() => {
                        // Find and click the related card
                        const cards = document.querySelectorAll('[data-system-id]')
                        cards.forEach(card => {
                          if (card.getAttribute('data-system-id') === related.id) {
                            (card as HTMLElement).click()
                          }
                        })
                      }, 100)
                    }}
                  >
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                      {related.name}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {related.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {system.researchBacked && (
                <Link
                  href={`/research?search=${encodeURIComponent(system.name)}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  View Research Papers →
                </Link>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              {system.isExperimental && (
                <button
                  onClick={() => setShowParameterForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Create Experiment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}