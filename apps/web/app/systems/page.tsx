'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
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

function SystemsContent() {
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
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-serif text-black">
              MESS Systems Catalog
            </h1>
            <div className="flex gap-4">
              <Link
                href="/docs/mess-models-implementation-guide"
                className="px-4 py-2 bg-black text-white hover:opacity-80 transition-opacity"
              >
                📖 Implementation Guide
              </Link>
              <Link
                href="/demo/experiments"
                className="px-4 py-2 bg-white border border-gray-200 text-black hover:bg-black/5 transition-colors"
              >
                🧪 Demo Experiments
              </Link>
            </div>
          </div>
          <p className="text-black opacity-60 mb-4">
            Explore our comprehensive catalog of microbial electrochemical systems. 
            From DIY educational designs to cutting-edge research models with record-breaking performance.
          </p>
          
          {/* Stats Banner */}
          <div className="bg-white p-6 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-2xl font-bold text-black">{systemCounts.total}</div>
                <div className="text-sm text-black opacity-60">Total Systems</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black">{systemCounts.experimental}</div>
                <div className="text-sm text-black opacity-60">Experimental</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black">{systemCounts.research}</div>
                <div className="text-sm text-black opacity-60">Research Models</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black">125,000</div>
                <div className="text-sm text-black opacity-60">Max mW/m²</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black">{systemCounts.highPerformance}</div>
                <div className="text-sm text-black opacity-60">High Performance</div>
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
              className="w-full px-4 py-3 pl-10 text-black bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
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
              className="px-4 py-2 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
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
              className="px-4 py-2 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
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
              className="px-4 py-2 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
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
              className="px-4 py-2 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Purposes</option>
              <option value="experimental">Experimental Only</option>
              <option value="research">Research Models</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="popularity">Sort by Popularity</option>
              <option value="power">Sort by Power Output</option>
              <option value="cost">Sort by Cost</option>
            </select>
          </div>

          {/* Power Threshold Slider */}
          <div className="flex items-center gap-4 p-4 bg-white border border-gray-200">
            <label className="text-sm font-medium text-black whitespace-nowrap">
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
            <span className="text-sm font-medium text-black min-w-[100px] text-right">
              {filters.powerThreshold === 0 ? 'Any' : `${filters.powerThreshold} mW/m²`}
            </span>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-black opacity-60">
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
            <h3 className="mt-2 text-sm font-medium text-black">No systems found</h3>
            <p className="mt-1 text-sm text-black opacity-60">
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
              className="mt-4 px-4 py-2 bg-black text-white hover:opacity-80 transition-opacity"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-white border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-serif text-black mb-4">Ready to Build Your MESS?</h2>
          <p className="mb-6 max-w-2xl mx-auto text-black opacity-60">
            Choose from our experimental designs to start building, or explore research models 
            for cutting-edge performance. Use AI predictions to optimize your system.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-black text-white hover:opacity-80 transition-opacity font-medium"
            >
              Use AI Assistant
            </Link>
            <Link
              href="/research"
              className="px-6 py-3 bg-white border-2 border-gray-200 text-black hover:bg-black/5 transition-colors font-medium"
            >
              Browse Research
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 w-96 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SystemsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SystemsContent />
    </Suspense>
  )
}