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

interface CompatibilityScore {
  score: number // 0-100
  confidence: number // 0-1
  notes: string[]
  warnings?: string[]
}

interface MaterialCompatibility {
  anode: string
  cathode: string
  organism: string
  membrane?: string
  compatibility: CompatibilityScore
}

// Sample compatibility data - in production this would come from API/database
const compatibilityData: MaterialCompatibility[] = [
  {
    anode: 'Carbon Felt',
    cathode: 'Platinum',
    organism: 'Geobacter sulfurreducens',
    membrane: 'Nafion',
    compatibility: {
      score: 95,
      confidence: 0.9,
      notes: ['Excellent biocompatibility', 'High conductivity', 'Proven combination'],
    }
  },
  {
    anode: 'Graphene Oxide',
    cathode: 'Carbon Cloth',
    organism: 'Shewanella oneidensis',
    compatibility: {
      score: 85,
      confidence: 0.8,
      notes: ['Good electron transfer', 'Cost-effective'],
      warnings: ['May require surface modification']
    }
  },
  {
    anode: 'Stainless Steel',
    cathode: 'MXene',
    organism: 'Mixed Culture',
    compatibility: {
      score: 70,
      confidence: 0.6,
      notes: ['Novel combination', 'High theoretical performance'],
      warnings: ['Limited research data', 'Potential corrosion issues']
    }
  }
]

export default function EnhancedParametersPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compatibility'>('grid')
  const [selectedMaterials, setSelectedMaterials] = useState({
    anode: '',
    cathode: '',
    organism: '',
    membrane: ''
  })
  const [compareMode, setCompareMode] = useState(false)
  const [compareParams, setCompareParams] = useState<Set<string>>(new Set())
  
  // Get statistics
  const stats = useMemo(() => getParameterStatistics(), [])
  
  // Filter parameters
  const filteredParameters = useMemo(() => {
    let params = searchQuery ? searchParameters(searchQuery) : getAllParameters()
    
    if (selectedCategory !== 'all') {
      params = params.filter(p => p.category === selectedCategory)
    }
    
    return params
  }, [searchQuery, selectedCategory])
  
  // Group parameters for display
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
  
  // Calculate compatibility
  const calculateCompatibility = () => {
    const { anode, cathode, organism } = selectedMaterials
    if (!anode || !cathode || !organism) return null
    
    // Find exact match or calculate based on similar combinations
    const exactMatch = compatibilityData.find(
      c => c.anode === anode && c.cathode === cathode && c.organism === organism
    )
    
    if (exactMatch) return exactMatch.compatibility
    
    // Calculate based on partial matches (simplified for demo)
    const partialMatches = compatibilityData.filter(
      c => c.anode === anode || c.cathode === cathode || c.organism === organism
    )
    
    if (partialMatches.length > 0) {
      const avgScore = partialMatches.reduce((sum, m) => sum + m.compatibility.score, 0) / partialMatches.length
      return {
        score: Math.round(avgScore * 0.8), // Reduce confidence for estimated scores
        confidence: 0.5,
        notes: ['Estimated based on similar combinations'],
        warnings: ['No exact match found - results are estimated']
      }
    }
    
    return {
      score: 50,
      confidence: 0.3,
      notes: ['Novel combination - requires experimental validation'],
      warnings: ['No data available for this combination']
    }
  }
  
  const currentCompatibility = calculateCompatibility()
  
  // Material options (would come from database)
  const materialOptions = {
    anode: ['Carbon Felt', 'Carbon Cloth', 'Graphene Oxide', 'Carbon Paper', 'Stainless Steel', 'Titanium Mesh'],
    cathode: ['Platinum', 'Carbon Cloth', 'MXene', 'Activated Carbon', 'Stainless Steel'],
    organism: ['Geobacter sulfurreducens', 'Shewanella oneidensis', 'Mixed Culture', 'E. coli', 'Pseudomonas aeruginosa'],
    membrane: ['Nafion', 'CMI-7000', 'AMI-7001', 'None (Membrane-less)', 'Salt Bridge']
  }
  
  // Toggle parameter comparison
  const toggleCompareParam = (paramId: string) => {
    const newCompare = new Set(compareParams)
    if (newCompare.has(paramId)) {
      newCompare.delete(paramId)
    } else {
      if (newCompare.size < 5) { // Limit to 5 parameters
        newCompare.add(paramId)
      }
    }
    setCompareParams(newCompare)
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Enhanced MESS Parameter Database
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  compareMode 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {compareMode ? 'Exit Compare' : 'Compare Mode'}
              </button>
              <Link
                href="/parameters"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Classic View
              </Link>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            Advanced parameter management with material compatibility analysis and comparison tools
          </p>
          
          {/* Stats with Progress Bars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Database Coverage</div>
              <div className="text-2xl font-bold text-blue-600">1,500+</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Validated Parameters</div>
              <div className="text-2xl font-bold text-green-600">{stats.withRanges}</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Material Combinations</div>
              <div className="text-2xl font-bold text-purple-600">450+</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">AI Predictions</div>
              <div className="text-2xl font-bold text-orange-600">280</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* View Mode Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setViewMode('grid')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'grid'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Parameter Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'table'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('compatibility')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'compatibility'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Compatibility Matrix
              </button>
            </nav>
          </div>
        </div>
        
        {/* Search and Filters */}
        {viewMode !== 'compatibility' && (
          <div className="mb-6 space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parameters..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {parameterCategories.slice(0, 8).map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Content based on view mode */}
        {viewMode === 'grid' && (
          <div className="space-y-6">
            {compareMode && compareParams.size > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-blue-800">
                    {compareParams.size} parameters selected for comparison
                  </p>
                  <button
                    onClick={() => {/* Implement comparison view */}}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View Comparison
                  </button>
                </div>
              </div>
            )}
            
            {Object.entries(groupedParameters).map(([groupKey, params]) => {
              const [categoryId, subcategory] = groupKey.split('-')
              const category = parameterCategories.find(c => c.id === categoryId)
              
              return (
                <div key={groupKey} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">{category?.icon}</span>
                    {category?.name} / {subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {params.map(param => (
                      <div
                        key={param.id}
                        className={`border rounded-lg p-4 transition-all ${
                          compareParams.has(param.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{param.name}</h4>
                            {param.unit && (
                              <span className="text-sm text-gray-500">[{param.unit}]</span>
                            )}
                          </div>
                          {compareMode && (
                            <input
                              type="checkbox"
                              checked={compareParams.has(param.id)}
                              onChange={() => toggleCompareParam(param.id)}
                              className="mt-1"
                            />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{param.description}</p>
                        
                        {param.range && (
                          <div className="text-xs text-gray-500">
                            Range: {param.range.min} - {param.range.max}
                            {param.range.typical && ` (typical: ${param.range.typical})`}
                            {param.unit && ` ${param.unit}`}
                          </div>
                        )}
                        
                        {param.category && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                              {param.category}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parameter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredParameters.map(param => (
                    <tr key={param.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {param.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {param.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {param.unit || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {param.range ? `${param.range.min}-${param.range.max}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {param.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {viewMode === 'compatibility' && (
          <div className="space-y-6">
            {/* Material Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Materials & Organisms
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anode Material
                  </label>
                  <select
                    value={selectedMaterials.anode}
                    onChange={(e) => setSelectedMaterials({ ...selectedMaterials, anode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select anode...</option>
                    {materialOptions.anode.map(material => (
                      <option key={material} value={material}>{material}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cathode Material
                  </label>
                  <select
                    value={selectedMaterials.cathode}
                    onChange={(e) => setSelectedMaterials({ ...selectedMaterials, cathode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select cathode...</option>
                    {materialOptions.cathode.map(material => (
                      <option key={material} value={material}>{material}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organism/Culture
                  </label>
                  <select
                    value={selectedMaterials.organism}
                    onChange={(e) => setSelectedMaterials({ ...selectedMaterials, organism: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select organism...</option>
                    {materialOptions.organism.map(organism => (
                      <option key={organism} value={organism}>{organism}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membrane (Optional)
                  </label>
                  <select
                    value={selectedMaterials.membrane}
                    onChange={(e) => setSelectedMaterials({ ...selectedMaterials, membrane: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select membrane...</option>
                    {materialOptions.membrane.map(membrane => (
                      <option key={membrane} value={membrane}>{membrane}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Compatibility Results */}
            {currentCompatibility && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Compatibility Analysis
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Score Gauge */}
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-32 h-32">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke={currentCompatibility.score >= 80 ? '#10b981' : currentCompatibility.score >= 60 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${currentCompatibility.score * 3.51} 351.86`}
                          strokeDashoffset="87.96"
                          strokeLinecap="round"
                          transform="rotate(-90 64 64)"
                        />
                      </svg>
                      <div className="absolute">
                        <div className="text-3xl font-bold">{currentCompatibility.score}%</div>
                        <div className="text-sm text-gray-500">Compatibility</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm text-gray-600">Confidence Level</div>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${currentCompatibility.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes and Warnings */}
                  <div className="col-span-2 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Analysis Notes</h4>
                      <ul className="space-y-1">
                        {currentCompatibility.notes.map((note, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-600">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {currentCompatibility.warnings && currentCompatibility.warnings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Warnings</h4>
                        <ul className="space-y-1">
                          {currentCompatibility.warnings.map((warning, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-gray-600">{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Find Research Papers
                      </button>
                      <button className="ml-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                        Save Combination
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Known Combinations Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Validated Material Combinations
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Anode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cathode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organism
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        References
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {compatibilityData.map((combo, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {combo.anode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {combo.cathode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {combo.organism}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {combo.compatibility.score}%
                            </div>
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  combo.compatibility.score >= 80 ? 'bg-green-500' :
                                  combo.compatibility.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${combo.compatibility.score}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          <button className="hover:underline">View Papers</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}