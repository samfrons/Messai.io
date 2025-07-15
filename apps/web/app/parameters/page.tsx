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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set())
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
  
  // Toggle functions
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleSubcategory = (subcategoryKey: string) => {
    const newExpanded = new Set(expandedSubcategories)
    if (newExpanded.has(subcategoryKey)) {
      newExpanded.delete(subcategoryKey)
    } else {
      newExpanded.add(subcategoryKey)
    }
    setExpandedSubcategories(newExpanded)
  }

  const toggleParameter = (paramId: string) => {
    const newExpanded = new Set(expandedParams)
    if (newExpanded.has(paramId)) {
      newExpanded.delete(paramId)
    } else {
      newExpanded.add(paramId)
    }
    setExpandedParams(newExpanded)
  }

  // Legacy function name for backward compatibility
  const toggleExpanded = toggleParameter
  
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
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-serif text-black">
              MESS Parameter Library
            </h1>
            <div className="flex gap-4">
              <Link
                href="/systems"
                className="px-4 py-2 bg-black text-white hover:opacity-80 transition-opacity"
              >
                Browse Systems
              </Link>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-4 py-2 bg-white border border-gray-200 text-black hover:bg-black/5 transition-colors"
                >
                  Export
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border border-gray-200">
                    <button
                      onClick={() => handleExport('json')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                    >
                      Export as CSV
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-black opacity-60 mb-4">
            Comprehensive reference for all parameters used in Microbial Electrochemical Systems. 
            Browse {stats.total}+ parameters across {parameterCategories.length} major categories with detailed descriptions, units, and typical ranges.
          </p>
          
          {/* Stats Banner */}
          <div className="bg-white p-6 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-2xl font-bold text-black">{stats.total}</div>
                <div className="text-sm text-black opacity-60">Total Parameters</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black">{parameterCategories.length}</div>
                <div className="text-sm text-black opacity-60">Major Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black">{stats.withRanges}</div>
                <div className="text-sm text-black opacity-60">With Ranges</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black">{stats.withUnits}</div>
                <div className="text-sm text-black opacity-60">With Units</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black">{stats.byType.number}</div>
                <div className="text-sm text-black opacity-60">Numeric Params</div>
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
              className="w-full px-4 py-3 pl-10 text-black bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
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
              className={`px-4 py-2 font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-black text-white'
                  : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {parameterCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-4 text-sm text-black opacity-60">
          Showing {filteredParameters.length} parameters
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory !== 'all' && ` in ${parameterCategories.find(c => c.id === selectedCategory)?.name}`}
        </div>
        
        {/* Accordion Interface */}
        <div className="space-y-4">
          {selectedCategory === 'all' ? (
            // Show all categories as accordions
            parameterCategories.map(category => {
              const categoryParams = getParametersByCategory(category.id).filter(param => 
                searchQuery ? searchParameters(searchQuery).includes(param) : true
              )
              
              if (categoryParams.length === 0) return null
              
              const subcategoryGroups = categoryParams.reduce((groups, param) => {
                const key = param.subcategory
                if (!groups[key]) groups[key] = []
                groups[key].push(param)
                return groups
              }, {} as Record<string, Parameter[]>)
              
              return (
                <div key={category.id} className="bg-white border border-gray-200 overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 flex items-center justify-center bg-black/10 rounded text-black" dangerouslySetInnerHTML={{ __html: category.icon }} />
                      <div>
                        <h2 className="text-xl font-serif text-black">{category.name}</h2>
                        <p className="text-sm text-black opacity-60">{categoryParams.length} parameters</p>
                      </div>
                    </div>
                    <svg 
                      className={`w-6 h-6 text-black opacity-40 transition-transform duration-200 ${
                        expandedCategories.has(category.id) ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Category Content */}
                  {expandedCategories.has(category.id) && (
                    <div className="border-t border-gray-200">
                      {Object.entries(subcategoryGroups).map(([subcategoryKey, params]) => {
                        const subcategoryFullKey = `${category.id}-${subcategoryKey}`
                        
                        return (
                          <div key={subcategoryKey} className="border-b border-gray-100 last:border-b-0">
                            {/* Subcategory Header */}
                            <button
                              onClick={() => toggleSubcategory(subcategoryFullKey)}
                              className="w-full px-8 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                            >
                              <div>
                                <h3 className="text-lg font-semibold text-black">
                                  {subcategoryKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </h3>
                                <p className="text-sm text-black opacity-60">{params.length} parameters</p>
                              </div>
                              <svg 
                                className={`w-5 h-5 text-black opacity-40 transition-transform duration-200 ${
                                  expandedSubcategories.has(subcategoryFullKey) ? 'rotate-180' : ''
                                }`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            {/* Parameters List */}
                            {expandedSubcategories.has(subcategoryFullKey) && (
                              <div className="px-8 pb-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                  {params.map(param => (
                                    <div
                                      key={param.id}
                                      className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200 cursor-pointer group"
                                      onClick={() => toggleParameter(param.id)}
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                            {param.name}
                                          </h4>
                                          <div className="flex items-center gap-2 mt-1">
                                            {param.unit && (
                                              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded">
                                                {param.unit}
                                              </span>
                                            )}
                                            {param.range && (param.range.min !== undefined || param.range.max !== undefined) && (
                                              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-medium">
                                                {param.range.min !== undefined && param.range.max !== undefined 
                                                  ? `${param.range.min}-${param.range.max}`
                                                  : param.range.min !== undefined 
                                                  ? `≥${param.range.min}`
                                                  : `≤${param.range.max}`
                                                }
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <svg 
                                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                            expandedParams.has(param.id) ? 'rotate-180' : ''
                                          }`} 
                                          fill="none" 
                                          stroke="currentColor" 
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </div>
                                      
                                      <p className={`text-sm text-slate-600 dark:text-slate-300 ${
                                        expandedParams.has(param.id) ? '' : 'line-clamp-2'
                                      }`}>
                                        {param.description}
                                      </p>
                                      
                                      {expandedParams.has(param.id) && (
                                        <div className="mt-4 space-y-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                                          {param.range && (
                                            <div className="space-y-2">
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Range:</span>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                  {param.range.min !== undefined && param.range.max !== undefined 
                                                    ? `${param.range.min} - ${param.range.max}`
                                                    : param.range.min !== undefined 
                                                    ? `≥ ${param.range.min}`
                                                    : param.range.max !== undefined 
                                                    ? `≤ ${param.range.max}`
                                                    : 'No range specified'
                                                  }
                                                  {param.unit && ` ${param.unit}`}
                                                </span>
                                              </div>
                                              {param.range.typical !== undefined && (
                                                <div className="flex items-center gap-2">
                                                  <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Typical:</span>
                                                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {param.range.typical} {param.unit}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                          
                                          <div className="flex flex-wrap gap-1">
                                            <span className="px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded font-medium">
                                              {param.category}
                                            </span>
                                            {param.subcategory && (
                                              <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded">
                                                {param.subcategory.replace(/-/g, ' ')}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            // Show single category
            (() => {
              const category = parameterCategories.find(c => c.id === selectedCategory)!
              const categoryParams = filteredParameters
              const subcategoryGroups = categoryParams.reduce((groups, param) => {
                const key = param.subcategory
                if (!groups[key]) groups[key] = []
                groups[key].push(param)
                return groups
              }, {} as Record<string, Parameter[]>)
              
              return (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
                  <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 flex items-center justify-center bg-black/10 rounded text-black" dangerouslySetInnerHTML={{ __html: category.icon }} />
                      <div>
                        <h2 className="text-xl font-serif text-black">{category.name}</h2>
                        <p className="text-sm text-black opacity-60">{categoryParams.length} parameters</p>
                      </div>
                    </div>
                  </div>
                  
                  {Object.entries(subcategoryGroups).map(([subcategoryKey, params]) => (
                    <div key={subcategoryKey} className="border-b border-slate-100 dark:border-slate-700/50 last:border-b-0">
                      <div className="px-8 py-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                          {subcategoryKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                          {params.map(param => (
                            <div
                              key={param.id}
                              className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200 cursor-pointer group"
                              onClick={() => toggleParameter(param.id)}
                            >
                              {/* Same parameter content as above */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                    {param.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {param.unit && (
                                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded">
                                        {param.unit}
                                      </span>
                                    )}
                                    {param.range && (param.range.min !== undefined || param.range.max !== undefined) && (
                                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-medium">
                                        {param.range.min !== undefined && param.range.max !== undefined 
                                          ? `${param.range.min}-${param.range.max}`
                                          : param.range.min !== undefined 
                                          ? `≥${param.range.min}`
                                          : `≤${param.range.max}`
                                        }
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <svg 
                                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                    expandedParams.has(param.id) ? 'rotate-180' : ''
                                  }`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                              
                              <p className={`text-sm text-slate-600 dark:text-slate-300 ${
                                expandedParams.has(param.id) ? '' : 'line-clamp-2'
                              }`}>
                                {param.description}
                              </p>
                              
                              {expandedParams.has(param.id) && (
                                <div className="mt-4 space-y-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                                  {param.range && (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Range:</span>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                          {param.range.min !== undefined && param.range.max !== undefined 
                                            ? `${param.range.min} - ${param.range.max}`
                                            : param.range.min !== undefined 
                                            ? `≥ ${param.range.min}`
                                            : param.range.max !== undefined 
                                            ? `≤ ${param.range.max}`
                                            : 'No range specified'
                                          }
                                          {param.unit && ` ${param.unit}`}
                                        </span>
                                      </div>
                                      {param.range.typical !== undefined && (
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Typical:</span>
                                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                            {param.range.typical} {param.unit}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-1">
                                    <span className="px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded font-medium">
                                      {param.category}
                                    </span>
                                    {param.subcategory && (
                                      <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded">
                                        {param.subcategory.replace(/-/g, ' ')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()
          )}
        </div>
        
        {/* Empty State */}
        {filteredParameters.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No parameters found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Try adjusting your search query or category filter to find the parameters you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
        
        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-12 text-white text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-30 translate-y-30"></div>
          </div>
          
          <div className="relative">
            <h2 className="text-3xl font-bold mb-4">Ready to use these parameters?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90 leading-relaxed">
              This comprehensive parameter library helps standardize MESS research and development. 
              Use these validated parameters to design experiments, configure simulations, and optimize bioelectrochemical systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/"
                className="px-8 py-4 bg-white text-emerald-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[200px]"
              >
                Design a System
              </Link>
              <Link
                href="/research"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-bold min-w-[200px]"
              >
                Browse Research
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}