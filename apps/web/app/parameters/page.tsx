'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  parameterCategories, 
  getAllParameters, 
  searchParameters,
  getParametersByCategory,
  getParameterStatistics,
  exportParametersAsJSON,
  exportParametersAsCSV,
  type Parameter,
  type ParameterCategory
} from '@/lib/parameters-data'

export default function ParametersPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedParams, setExpandedParams] = useState<Set<string>>(new Set())
  const [showExportMenu, setShowExportMenu] = useState(false)
  
  // Get statistics
  const stats = useMemo(() => getParameterStatistics(), [])
  
  // Filter parameters based on search and category
  const filteredParameters = useMemo(() => {
    let params = searchQuery ? searchParameters(searchQuery) : getAllParameters()
    
    if (selectedCategory !== 'all') {
      params = params.filter(p => p.category === selectedCategory)
    }
    
    return params
  }, [searchQuery, selectedCategory])
  
  // Group parameters by subcategory for display
  const groupedParameters = useMemo(() => {
    const groups: Record<string, Parameter[]> = {}
    
    filteredParameters.forEach(param => {
      const key = `${param.category}-${param.subcategory}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(param)
    })
    
    return groups
  }, [filteredParameters])
  
  // Toggle parameter expansion
  const toggleExpanded = (paramId: string) => {
    const newExpanded = new Set(expandedParams)
    if (newExpanded.has(paramId)) {
      newExpanded.delete(paramId)
    } else {
      newExpanded.add(paramId)
    }
    setExpandedParams(newExpanded)
  }
  
  // Export functions
  const handleExport = (format: 'json' | 'csv') => {
    const data = format === 'json' 
      ? exportParametersAsJSON(filteredParameters)
      : exportParametersAsCSV(filteredParameters)
    
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mess-parameters-${selectedCategory}-${new Date().toISOString().split('T')[0]}.${format}`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              MESS Parameter Library
            </h1>
            <div className="flex gap-4">
              <Link
                href="/systems"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Systems
              </Link>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Export
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleExport('json')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                    >
                      Export as CSV
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comprehensive reference for all parameters used in Microbial Electrochemical Systems. 
            Browse 1,500+ parameters across 15 major categories with detailed descriptions, units, and typical ranges.
          </p>
          
          {/* Stats Banner */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">1,500+</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Parameters</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">15</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Major Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">150+</div>
                <div className="text-sm text-green-600 dark:text-green-400">Subcategories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.withUnits}</div>
                <div className="text-sm text-orange-600 dark:text-orange-400">With Units</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.withRanges}</div>
                <div className="text-sm text-red-600 dark:text-red-400">With Ranges</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parameters by name, description, unit, or tag..."
              className="w-full px-4 py-3 pl-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All Categories
            </button>
            {parameterCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-600 text-white`
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredParameters.length} parameters
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory !== 'all' && ` in ${parameterCategories.find(c => c.id === selectedCategory)?.name}`}
        </div>
        
        {/* Parameters Grid */}
        <div className="space-y-6">
          {Object.entries(groupedParameters).map(([groupKey, params]) => {
            const [categoryId, subcategory] = groupKey.split('-')
            const category = parameterCategories.find(c => c.id === categoryId)
            
            return (
              <div key={groupKey} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <span className="text-xl">{category?.icon}</span>
                  {category?.name} / {subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {params.map(param => (
                    <div
                      key={param.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                      onClick={() => toggleExpanded(param.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {param.name}
                          </h4>
                          {param.unit && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              [{param.unit}]
                            </span>
                          )}
                        </div>
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedParams.has(param.id) ? 'rotate-180' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      <p className={`text-sm text-gray-600 dark:text-gray-400 mt-2 ${
                        expandedParams.has(param.id) ? '' : 'line-clamp-2'
                      }`}>
                        {param.description}
                      </p>
                      
                      {expandedParams.has(param.id) && (
                        <div className="mt-4 space-y-2">
                          {param.range && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Range: </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                {param.range.min !== undefined && `${param.range.min} - `}
                                {param.range.max !== undefined && param.range.max}
                                {param.range.typical !== undefined && ` (typical: ${param.range.typical})`}
                                {param.unit && ` ${param.unit}`}
                              </span>
                            </div>
                          )}
                          
                          {param.category && (
                            <div className="flex flex-wrap gap-1">
                              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded">
                                {param.category}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Empty State */}
        {filteredParameters.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No parameters found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search query or category filter
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
        
        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Use Parameters in Your Research</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            This comprehensive parameter library helps standardize MESS research and development. 
            Use these parameters to design experiments, configure simulations, and optimize systems.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Design a System
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