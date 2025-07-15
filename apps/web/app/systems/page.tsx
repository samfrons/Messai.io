'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  unifiedSystemsCatalog, 
  getSystemsByCategory, 
  getSystemsByScale,
  getSystemsByCostCategory,
  getHighPerformanceSystems,
  searchSystems,
  sortByPowerOutput,
  sortByPopularity,
  sortByCost,
  type UnifiedMESSSystem 
} from '../../src/lib/unified-systems-catalog'
import UnifiedSystemCard from '../../components/UnifiedSystemCard'
import Enhanced3DSystemPanel from '../../components/Enhanced3DSystemPanel'

export default function SystemsPage() {
  const searchParams = useSearchParams()
  const [selectedSystem, setSelectedSystem] = useState<UnifiedMESSSystem | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    category: 'all',
    scale: 'all',
    cost: 'all',
    purpose: 'all', // experimental, research, both
    powerThreshold: 0
  })
  const [sortBy, setSortBy] = useState<'popularity' | 'power' | 'cost'>('popularity')

  // Initialize filters from URL parameters
  useEffect(() => {
    const purpose = searchParams.get('purpose')
    if (purpose === 'experimental' || purpose === 'research') {
      setFilters(prev => ({ ...prev, purpose }))
    }
  }, [searchParams])

  // Filter and sort systems
  const filteredSystems = useMemo(() => {
    let systems = [...unifiedSystemsCatalog]

    // Search filter
    if (searchQuery) {
      systems = searchSystems(searchQuery)
    }

    // Category filter
    if (filters.category !== 'all') {
      systems = systems.filter(s => s.category === filters.category)
    }

    // Scale filter
    if (filters.scale !== 'all') {
      systems = systems.filter(s => s.scale === filters.scale)
    }

    // Cost filter
    if (filters.cost !== 'all') {
      systems = systems.filter(s => s.cost.category === filters.cost)
    }

    // Purpose filter
    if (filters.purpose === 'experimental') {
      systems = systems.filter(s => s.isExperimental)
    } else if (filters.purpose === 'research') {
      systems = systems.filter(s => s.researchBacked)
    }

    // Power threshold filter
    if (filters.powerThreshold > 0) {
      systems = getHighPerformanceSystems(filters.powerThreshold).filter(s => 
        systems.includes(s)
      )
    }

    // Sort
    switch (sortBy) {
      case 'power':
        return sortByPowerOutput(systems)
      case 'cost':
        return sortByCost(systems)
      case 'popularity':
      default:
        return sortByPopularity(systems)
    }
  }, [searchQuery, filters, sortBy])

  // Count systems by various attributes for display
  const systemCounts = useMemo(() => {
    return {
      total: unifiedSystemsCatalog.length,
      experimental: unifiedSystemsCatalog.filter(s => s.isExperimental).length,
      research: unifiedSystemsCatalog.filter(s => s.researchBacked).length,
      highPerformance: getHighPerformanceSystems(1000).length,
      scales: {
        micro: getSystemsByScale('micro').length,
        lab: getSystemsByScale('lab').length,
        pilot: getSystemsByScale('pilot').length,
        industrial: getSystemsByScale('industrial').length
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              MESS Systems Catalog
            </h1>
            <div className="flex gap-4">
              <Link
                href="/docs/mess-models-implementation-guide"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📖 Implementation Guide
              </Link>
              <Link
                href="/demo/experiments"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🧪 Demo Experiments
              </Link>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Explore our comprehensive catalog of microbial electrochemical systems. 
            From DIY educational designs to cutting-edge research models with record-breaking performance.
          </p>
          
          {/* Stats Banner */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{systemCounts.total}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Systems</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{systemCounts.experimental}</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Experimental</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{systemCounts.research}</div>
                <div className="text-sm text-green-600 dark:text-green-400">Research Models</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">125,000</div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Max mW/m²</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">{systemCounts.highPerformance}</div>
                <div className="text-sm text-red-600 dark:text-red-400">High Performance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search systems by name, description, or tags..."
              className="w-full px-4 py-3 pl-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="experimental">Experimental</option>
              <option value="high-performance">High Performance</option>
              <option value="innovative">Innovative</option>
              <option value="scalable">Scalable</option>
              <option value="sustainable">Sustainable</option>
              <option value="specialized">Specialized</option>
            </select>

            {/* Scale Filter */}
            <select
              value={filters.scale}
              onChange={(e) => setFilters({ ...filters, scale: e.target.value })}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Scales</option>
              <option value="micro">Micro ({systemCounts.scales.micro})</option>
              <option value="lab">Lab ({systemCounts.scales.lab})</option>
              <option value="pilot">Pilot ({systemCounts.scales.pilot})</option>
              <option value="industrial">Industrial ({systemCounts.scales.industrial})</option>
            </select>

            {/* Cost Filter */}
            <select
              value={filters.cost}
              onChange={(e) => setFilters({ ...filters, cost: e.target.value })}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Costs</option>
              <option value="ultra-low">Ultra Low (&lt;$10)</option>
              <option value="low">Low ($10-$100)</option>
              <option value="medium">Medium ($100-$1k)</option>
              <option value="high">High ($1k-$5k)</option>
              <option value="very-high">Very High (&gt;$5k)</option>
            </select>

            {/* Purpose Filter */}
            <select
              value={filters.purpose}
              onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Purposes</option>
              <option value="experimental">Experimental Only</option>
              <option value="research">Research Models</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="popularity">Sort by Popularity</option>
              <option value="power">Sort by Power Output</option>
              <option value="cost">Sort by Cost</option>
            </select>
          </div>

          {/* Power Threshold Slider */}
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Min Power Output:
            </label>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={filters.powerThreshold}
              onChange={(e) => setFilters({ ...filters, powerThreshold: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[100px] text-right">
              {filters.powerThreshold === 0 ? 'Any' : `${filters.powerThreshold} mW/m²`}
            </span>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredSystems.length} of {systemCounts.total} systems
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {/* Systems Grid - Responsive Layout */}
        {panelOpen && selectedSystem ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Systems List - sidebar when panel is open */}
            <div className="xl:col-span-1">
              <div className="grid grid-cols-1 gap-4">
                {filteredSystems.map((system) => (
                  <UnifiedSystemCard
                    key={system.id}
                    system={system}
                    onClick={() => {
                      setSelectedSystem(system)
                      setPanelOpen(true)
                    }}
                    isSelected={selectedSystem?.id === system.id}
                  />
                ))}
              </div>
            </div>
            
            {/* System Panel - takes most of the page */}
            <div className="xl:col-span-3">
              <Enhanced3DSystemPanel
                system={selectedSystem}
                onClose={() => {
                  setPanelOpen(false)
                  setSelectedSystem(null)
                }}
              />
            </div>
          </div>
        ) : (
          /* Full width grid when no panel is open */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSystems.map((system) => (
              <UnifiedSystemCard
                key={system.id}
                system={system}
                onClick={() => {
                  setSelectedSystem(system)
                  setPanelOpen(true)
                }}
                isSelected={selectedSystem?.id === system.id}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredSystems.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No systems found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilters({
                  category: 'all',
                  scale: 'all',
                  cost: 'all',
                  purpose: 'all',
                  powerThreshold: 0
                })
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Build Your MESS?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Choose from our experimental designs to start building, or explore research models 
            for cutting-edge performance. Use AI predictions to optimize your system.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Use AI Assistant
            </Link>
            <Link
              href="/research"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
            >
              Browse Research
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}