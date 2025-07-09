'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Filter, X, Beaker, Zap, Settings, Microscope } from 'lucide-react'

interface FilterOptions {
  microbes: string[]
  systemTypes: string[]
  configurations: {
    subtypes: string[]
    scales: string[]
    architectures: string[]
  }
  performanceRanges: {
    powerOutput: { min: number; max: number; unit: string }
    efficiency: { min: number; max: number; unit: string }
  }
  stats: {
    totalPapers: number
    withMicrobeData: number
    withSystemConfig: number
    withPerformanceData: number
  }
  suggestions: {
    commonMicrobes: string[]
    performanceTiers: Array<{ label: string; minPower?: number; maxPower?: number }>
    efficiencyTiers: Array<{ label: string; minEfficiency?: number; maxEfficiency?: number }>
  }
}

interface Filters {
  microbes: string[]
  systemTypes: string[]
  configurations: string[]
  minPower: number | null
  minEfficiency: number | null
  hasFullData: boolean
  sortBy: string
}

interface AdvancedFilterPanelProps {
  onFiltersChange: (filters: Filters) => void
  initialFilters?: Partial<Filters>
}

export default function AdvancedFilterPanel({ onFiltersChange, initialFilters }: AdvancedFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [filters, setFilters] = useState<Filters>({
    microbes: initialFilters?.microbes || [],
    systemTypes: initialFilters?.systemTypes || [],
    configurations: initialFilters?.configurations || [],
    minPower: initialFilters?.minPower ?? null,
    minEfficiency: initialFilters?.minEfficiency ?? null,
    hasFullData: initialFilters?.hasFullData || false,
    sortBy: initialFilters?.sortBy || 'date'
  })

  const [activeTab, setActiveTab] = useState<'microbes' | 'systems' | 'performance' | 'sort'>('microbes')

  // Fetch filter options
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const response = await fetch('/api/papers/filters')
        if (response.ok) {
          const data = await response.json()
          setFilterOptions(data)
        }
      } catch (error) {
        console.error('Error fetching filter options:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterOptions()
  }, [])

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMicrobeToggle = (microbe: string) => {
    setFilters(prev => ({
      ...prev,
      microbes: prev.microbes.includes(microbe)
        ? prev.microbes.filter(m => m !== microbe)
        : [...prev.microbes, microbe]
    }))
  }

  const handleSystemTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      systemTypes: prev.systemTypes.includes(type)
        ? prev.systemTypes.filter(t => t !== type)
        : [...prev.systemTypes, type]
    }))
  }

  const handleConfigurationToggle = (config: string) => {
    setFilters(prev => ({
      ...prev,
      configurations: prev.configurations.includes(config)
        ? prev.configurations.filter(c => c !== config)
        : [...prev.configurations, config]
    }))
  }

  const handlePerformanceTier = (tier: any) => {
    setFilters(prev => ({
      ...prev,
      minPower: tier.minPower ?? null,
      minEfficiency: tier.minEfficiency ?? null
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      microbes: [],
      systemTypes: [],
      configurations: [],
      minPower: null,
      minEfficiency: null,
      hasFullData: false,
      sortBy: 'date'
    })
  }

  const activeFilterCount = 
    filters.microbes.length + 
    filters.systemTypes.length + 
    filters.configurations.length +
    (filters.minPower !== null ? 1 : 0) +
    (filters.minEfficiency !== null ? 1 : 0) +
    (filters.hasFullData ? 1 : 0) +
    (filters.sortBy !== 'date' ? 1 : 0)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
            {activeFilterCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && filterOptions && (
        <div className="p-4">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab('microbes')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'microbes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Microscope className="w-4 h-4" />
              Microbes
            </button>
            <button
              onClick={() => setActiveTab('systems')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'systems' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Beaker className="w-4 h-4" />
              Systems
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'performance' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Zap className="w-4 h-4" />
              Performance
            </button>
            <button
              onClick={() => setActiveTab('sort')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'sort' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              Sort
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {/* Microbes Tab */}
            {activeTab === 'microbes' && (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Filter by microbial species or genera ({filterOptions.stats.withMicrobeData} papers with data)
                </p>
                
                {/* Common microbes */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Common Microbes</h4>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.suggestions.commonMicrobes.map(microbe => (
                      <button
                        key={microbe}
                        onClick={() => handleMicrobeToggle(microbe)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          filters.microbes.includes(microbe)
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        {microbe}
                      </button>
                    ))}
                  </div>
                </div>

                {/* All available microbes */}
                <div>
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">All Available ({filterOptions.microbes.length})</h4>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                      {filterOptions.microbes.map(microbe => (
                        <label key={microbe} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.microbes.includes(microbe)}
                            onChange={() => handleMicrobeToggle(microbe)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 truncate">{microbe}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Systems Tab */}
            {activeTab === 'systems' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Filter by system type and configuration ({filterOptions.stats.withSystemConfig} papers with data)
                </p>

                {/* System Types */}
                <div>
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">System Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.systemTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => handleSystemTypeToggle(type)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          filters.systemTypes.includes(type)
                            ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Configurations */}
                <div>
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Configurations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Subtypes */}
                    {filterOptions.configurations.subtypes.length > 0 && (
                      <div>
                        <h5 className="text-xs text-gray-600 mb-1">Chamber Type</h5>
                        <div className="space-y-1">
                          {filterOptions.configurations.subtypes.map(subtype => (
                            <label key={subtype} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.configurations.includes(subtype)}
                                onChange={() => handleConfigurationToggle(subtype)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{subtype}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scales */}
                    {filterOptions.configurations.scales.length > 0 && (
                      <div>
                        <h5 className="text-xs text-gray-600 mb-1">Scale</h5>
                        <div className="space-y-1">
                          {filterOptions.configurations.scales.map(scale => (
                            <label key={scale} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.configurations.includes(scale)}
                                onChange={() => handleConfigurationToggle(scale)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">{scale}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Filter by performance metrics ({filterOptions.stats.withPerformanceData} papers with data)
                </p>

                {/* Quick Performance Tiers */}
                <div>
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Quick Filters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Power tiers */}
                    <div>
                      <h5 className="text-xs text-gray-600 mb-2">Power Output</h5>
                      <div className="space-y-1">
                        {filterOptions.suggestions.performanceTiers.map((tier, idx) => (
                          <button
                            key={idx}
                            onClick={() => handlePerformanceTier(tier)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              filters.minPower === (tier.minPower ?? null)
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            {tier.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Efficiency tiers */}
                    <div>
                      <h5 className="text-xs text-gray-600 mb-2">Coulombic Efficiency</h5>
                      <div className="space-y-1">
                        {filterOptions.suggestions.efficiencyTiers.map((tier, idx) => (
                          <button
                            key={idx}
                            onClick={() => handlePerformanceTier(tier)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              filters.minEfficiency === (tier.minEfficiency ?? null)
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            {tier.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom ranges */}
                <div>
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Custom Range</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Min Power (mW/m²)</label>
                      <input
                        type="number"
                        value={filters.minPower || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, minPower: e.target.value ? Number(e.target.value) : null }))}
                        placeholder="0"
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Min Efficiency (%)</label>
                      <input
                        type="number"
                        value={filters.minEfficiency || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, minEfficiency: e.target.value ? Number(e.target.value) : null }))}
                        placeholder="0"
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Data completeness */}
                <div>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={filters.hasFullData}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasFullData: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Complete data only</span>
                      <p className="text-xs text-gray-600">Show only papers with full performance and microbe data</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Sort Tab */}
            {activeTab === 'sort' && (
              <div>
                <p className="text-sm text-gray-600 mb-3">Sort results by:</p>
                <div className="space-y-2">
                  {[
                    { value: 'date', label: 'Most Recent', icon: '📅' },
                    { value: 'power', label: 'Highest Power Output', icon: '⚡' },
                    { value: 'efficiency', label: 'Highest Efficiency', icon: '📊' },
                    { value: 'relevance', label: 'Most Relevant', icon: '🎯' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="radio"
                        name="sortBy"
                        value={option.value}
                        checked={filters.sortBy === option.value}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-2xl">{option.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Active Filters</h4>
              <div className="flex flex-wrap gap-2">
                {filters.microbes.map(microbe => (
                  <span key={microbe} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    🦠 {microbe}
                    <button onClick={() => handleMicrobeToggle(microbe)} className="hover:text-green-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.systemTypes.map(type => (
                  <span key={type} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    🔧 {type}
                    <button onClick={() => handleSystemTypeToggle(type)} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.minPower !== null && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    ⚡ Power &gt; {filters.minPower} mW/m²
                    <button onClick={() => setFilters(prev => ({ ...prev, minPower: null }))} className="hover:text-yellow-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}