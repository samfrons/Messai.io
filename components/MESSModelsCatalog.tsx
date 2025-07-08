'use client'

import { useState } from 'react'
import Link from 'next/link'
import { messModelsCatalog, getModelsByCategory, getHighPriorityModels, type MESSModel } from '@/lib/mess-models-catalog'

export default function MESSModelsCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedModel, setSelectedModel] = useState<MESSModel | null>(null)

  const categories = [
    { id: 'all', name: 'All Models', icon: '🔬' },
    { id: 'high-performance', name: 'High Performance', icon: '⚡' },
    { id: 'innovative', name: 'Innovative', icon: '🚀' },
    { id: 'scalable', name: 'Scalable', icon: '📈' },
    { id: 'sustainable', name: 'Sustainable', icon: '♻️' },
    { id: 'specialized', name: 'Specialized', icon: '🎯' }
  ]

  const filteredModels = selectedCategory === 'all' 
    ? messModelsCatalog 
    : getModelsByCategory(selectedCategory as MESSModel['category'])

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1: return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Priority 1</span>
      case 2: return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Priority 2</span>
      case 3: return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Priority 3</span>
      default: return null
    }
  }

  const formatPowerOutput = (model: MESSModel) => {
    const { value, unit } = model.powerOutput
    if (unit === 'W/m³') {
      return `${value} W/m³`
    }
    return `${value.toLocaleString()} ${unit}`
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">MESS Models Catalog</h2>
        <p className="text-gray-600 mb-2">
          High-performing bioelectrochemical system designs identified from 2,800+ research papers
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>📊 11 Models</span>
          <span>🔬 5 Categories</span>
          <span>⚡ Up to 125,000 mW/m²</span>
          <span>🌍 Real-world applications</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedModel(model)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                  {model.name}
                </h3>
                {getPriorityBadge(model.implementationPriority)}
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {model.description}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Power Output</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPowerOutput(model)}
                  </span>
                </div>

                {model.efficiency && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Efficiency</span>
                    <span className="text-sm font-medium text-blue-600">
                      {model.efficiency}%
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Scale</span>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {model.dimensions?.scale || 'Lab'}
                  </span>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex flex-wrap gap-1">
                    {model.specialFeatures.slice(0, 2).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Model Detail Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedModel.name}</h3>
                  <p className="text-gray-600 mt-1">{selectedModel.description}</p>
                </div>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="text-gray-400 hover:text-gray-600"
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
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {formatPowerOutput(selectedModel)}
                    </div>
                    <div className="text-sm text-green-600">Power Output</div>
                    {selectedModel.powerOutput.conditions && (
                      <div className="text-xs text-green-500 mt-1">
                        {selectedModel.powerOutput.conditions}
                      </div>
                    )}
                  </div>
                  {selectedModel.efficiency && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        {selectedModel.efficiency}%
                      </div>
                      <div className="text-sm text-blue-600">Efficiency</div>
                    </div>
                  )}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-lg font-bold text-purple-700 capitalize">
                      {selectedModel.dimensions?.scale || 'Lab'}
                    </div>
                    <div className="text-sm text-purple-600">Scale</div>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Materials</h4>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Anode:</span>
                    <span className="ml-2 text-gray-600">{selectedModel.materials.anode.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Cathode:</span>
                    <span className="ml-2 text-gray-600">{selectedModel.materials.cathode.join(', ')}</span>
                  </div>
                  {selectedModel.materials.membrane && (
                    <div>
                      <span className="font-medium text-gray-700">Membrane:</span>
                      <span className="ml-2 text-gray-600">{selectedModel.materials.membrane}</span>
                    </div>
                  )}
                  {selectedModel.materials.additives && (
                    <div>
                      <span className="font-medium text-gray-700">Additives:</span>
                      <span className="ml-2 text-gray-600">{selectedModel.materials.additives.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Organisms */}
              {selectedModel.organisms && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Organisms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.organisms.map((organism, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                      >
                        {organism}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Features */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Special Features</h4>
                <ul className="space-y-2">
                  {selectedModel.specialFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Applications */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Applications</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedModel.applications.map((app, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>

              {/* Research Highlights */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Research Highlights</h4>
                <ul className="space-y-2">
                  {selectedModel.researchHighlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-600">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cost and Implementation */}
              <div className="grid md:grid-cols-2 gap-6">
                {selectedModel.costRange && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Cost Range</h4>
                    <p className="text-gray-600">{selectedModel.costRange}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Implementation Priority</h4>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(selectedModel.implementationPriority)}
                    <span className="text-sm text-gray-600">
                      {selectedModel.implementationPriority === 1 ? 'Immediate implementation recommended' :
                       selectedModel.implementationPriority === 2 ? 'Secondary implementation phase' :
                       'Future development'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visualization Notes */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">3D Visualization Notes</h4>
                <p className="text-sm text-gray-600">{selectedModel.visualizationNotes}</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <Link
                  href="/docs/mess-models-implementation-guide"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Implementation Guide →
                </Link>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}