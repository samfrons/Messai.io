'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FuelCellType } from '@/lib/types/fuel-cell-types'
import { FuelCellPredictionResult, FuelCellModelingEngine } from '@/lib/fuel-cell-predictions'

// ============================================================================
// INTERFACES
// ============================================================================

interface ComparativeAnalysisProps {
  className?: string
}

interface SystemConfiguration {
  id: string
  name: string
  fuelCellType: FuelCellType
  cellCount: number
  activeArea: number
  operatingTemperature: number
  operatingPressure: number
  humidity: number
  fuelFlowRate: number
  airFlowRate: number
  anodeCatalyst?: string
  cathodeCatalyst?: string
  membraneType?: string
  color: string
}

interface ComparisonMetrics {
  power: number
  efficiency: number
  powerDensity: number
  voltage: number
  current: number
  fuelUtilization: number
  cost: number
  durability: number
}

interface ComparisonResult {
  systemId: string
  systemName: string
  prediction: FuelCellPredictionResult
  metrics: ComparisonMetrics
  rank: {
    power: number
    efficiency: number
    cost: number
    overall: number
  }
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

const DEFAULT_SYSTEMS: SystemConfiguration[] = [
  {
    id: 'pem-standard',
    name: 'Standard PEM',
    fuelCellType: 'PEM',
    cellCount: 50,
    activeArea: 100,
    operatingTemperature: 80,
    operatingPressure: 2.5,
    humidity: 100,
    fuelFlowRate: 5,
    airFlowRate: 25,
    anodeCatalyst: 'pt-c',
    cathodeCatalyst: 'pt-c',
    membraneType: 'nafion',
    color: '#3b82f6'
  },
  {
    id: 'pem-optimized',
    name: 'Optimized PEM',
    fuelCellType: 'PEM',
    cellCount: 80,
    activeArea: 150,
    operatingTemperature: 75,
    operatingPressure: 3.5,
    humidity: 95,
    fuelFlowRate: 8,
    airFlowRate: 40,
    anodeCatalyst: 'pt-alloy',
    cathodeCatalyst: 'pt-alloy',
    membraneType: 'pfsa',
    color: '#10b981'
  },
  {
    id: 'sofc-standard',
    name: 'Standard SOFC',
    fuelCellType: 'SOFC',
    cellCount: 30,
    activeArea: 200,
    operatingTemperature: 750,
    operatingPressure: 1.5,
    humidity: 0,
    fuelFlowRate: 10,
    airFlowRate: 50,
    anodeCatalyst: 'ni-based',
    cathodeCatalyst: 'ni-based',
    membraneType: 'ceramic',
    color: '#ef4444'
  }
]

const COMPARISON_CRITERIA = [
  { id: 'power', label: 'Power Output', unit: 'W', icon: '⚡' },
  { id: 'efficiency', label: 'Efficiency', unit: '%', icon: '📈' },
  { id: 'powerDensity', label: 'Power Density', unit: 'W/cm²', icon: '📊' },
  { id: 'cost', label: 'System Cost', unit: '$', icon: '💰' },
  { id: 'durability', label: 'Expected Lifetime', unit: 'hours', icon: '🛡️' }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ComparativeAnalysis({ className = '' }: ComparativeAnalysisProps) {
  const [systems, setSystems] = useState<SystemConfiguration[]>(DEFAULT_SYSTEMS)
  const [selectedSystems, setSelectedSystems] = useState<string[]>(DEFAULT_SYSTEMS.map(s => s.id))
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'chart' | 'radar' | 'details'>('table')
  const [sortBy, setSortBy] = useState<keyof ComparisonMetrics>('power')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Calculate comparisons when systems or selections change
  useEffect(() => {
    if (selectedSystems.length > 0) {
      calculateComparisons()
    }
  }, [selectedSystems])

  const calculateComparisons = useCallback(async () => {
    setIsCalculating(true)
    
    try {
      const results: ComparisonResult[] = []
      
      for (const systemId of selectedSystems) {
        const system = systems.find(s => s.id === systemId)
        if (!system) continue
        
        // Get prediction
        const prediction = await FuelCellModelingEngine.getPrediction({
          fuelCellType: system.fuelCellType,
          cellCount: system.cellCount,
          activeArea: system.activeArea,
          operatingTemperature: system.operatingTemperature,
          operatingPressure: system.operatingPressure,
          humidity: system.humidity,
          fuelFlowRate: system.fuelFlowRate,
          airFlowRate: system.airFlowRate,
          anodeCatalyst: system.anodeCatalyst,
          cathodeCatalyst: system.cathodeCatalyst,
          membraneType: system.membraneType,
          modelFidelity: 'INTERMEDIATE'
        })
        
        // Calculate additional metrics
        const cost = calculateSystemCost(system)
        const durability = estimateDurability(system)
        
        results.push({
          systemId: system.id,
          systemName: system.name,
          prediction,
          metrics: {
            power: prediction.predictedPower,
            efficiency: prediction.efficiency,
            powerDensity: prediction.powerDensity,
            voltage: prediction.voltage,
            current: prediction.current,
            fuelUtilization: prediction.fuelUtilization,
            cost,
            durability
          },
          rank: { power: 0, efficiency: 0, cost: 0, overall: 0 } // Will calculate ranks next
        })
      }
      
      // Calculate rankings
      const rankedResults = calculateRankings(results)
      setComparisonResults(rankedResults)
      
    } catch (error) {
      console.error('Comparison calculation error:', error)
    } finally {
      setIsCalculating(false)
    }
  }, [selectedSystems, systems])

  const calculateRankings = (results: ComparisonResult[]): ComparisonResult[] => {
    // Sort by each metric and assign ranks
    const powerRanked = [...results].sort((a, b) => b.metrics.power - a.metrics.power)
    const efficiencyRanked = [...results].sort((a, b) => b.metrics.efficiency - a.metrics.efficiency)
    const costRanked = [...results].sort((a, b) => a.metrics.cost - b.metrics.cost) // Lower cost is better
    
    return results.map(result => {
      const powerRank = powerRanked.findIndex(r => r.systemId === result.systemId) + 1
      const efficiencyRank = efficiencyRanked.findIndex(r => r.systemId === result.systemId) + 1
      const costRank = costRanked.findIndex(r => r.systemId === result.systemId) + 1
      
      return {
        ...result,
        rank: {
          power: powerRank,
          efficiency: efficiencyRank,
          cost: costRank,
          overall: Math.round((powerRank + efficiencyRank + costRank) / 3)
        }
      }
    })
  }

  const calculateSystemCost = (system: SystemConfiguration): number => {
    const baseCost = 1000
    const cellCost = 50 * system.cellCount
    const areaCost = 10 * system.activeArea
    
    const catalystCosts: Record<string, number> = {
      'pt-c': 100,
      'pt-alloy': 80,
      'non-pgm': 20,
      'ni-based': 10
    }
    
    const anodeCost = (system.anodeCatalyst ? catalystCosts[system.anodeCatalyst] || 50 : 50) * system.activeArea
    const cathodeCost = (system.cathodeCatalyst ? catalystCosts[system.cathodeCatalyst] || 50 : 50) * system.activeArea
    
    return baseCost + cellCost + areaCost + anodeCost + cathodeCost
  }

  const estimateDurability = (system: SystemConfiguration): number => {
    let baseDurability = 40000 // hours
    
    // Adjust based on fuel cell type
    const durabilityFactors: Record<FuelCellType, number> = {
      PEM: 1.0,
      SOFC: 1.5,
      PAFC: 0.8,
      MCFC: 0.9,
      AFC: 0.7
    }
    
    baseDurability *= durabilityFactors[system.fuelCellType]
    
    // Temperature effects
    if (system.fuelCellType === 'PEM' && system.operatingTemperature > 80) {
      baseDurability *= 0.9
    }
    
    return baseDurability
  }

  const handleSystemToggle = (systemId: string) => {
    setSelectedSystems(prev =>
      prev.includes(systemId)
        ? prev.filter(id => id !== systemId)
        : [...prev, systemId]
    )
  }

  const handleAddSystem = () => {
    const newSystem: SystemConfiguration = {
      id: `custom-${Date.now()}`,
      name: `Custom System ${systems.length - 2}`,
      fuelCellType: 'PEM',
      cellCount: 50,
      activeArea: 100,
      operatingTemperature: 80,
      operatingPressure: 2.5,
      humidity: 100,
      fuelFlowRate: 5,
      airFlowRate: 25,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }
    setSystems([...systems, newSystem])
    setSelectedSystems([...selectedSystems, newSystem.id])
  }

  const handleSort = (metric: keyof ComparisonMetrics) => {
    if (sortBy === metric) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(metric)
      setSortOrder('desc')
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Fuel Cell System Comparison
        </h2>
        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: 'table', label: 'Table', icon: '📊' },
              { id: 'chart', label: 'Chart', icon: '📈' },
              { id: 'radar', label: 'Radar', icon: '🎯' },
              { id: 'details', label: 'Details', icon: '📋' }
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setViewMode(view.id as any)}
                className={`px-3 py-1 rounded text-sm transition-colors flex items-center gap-1 ${
                  viewMode === view.id
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <span>{view.icon}</span>
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* System Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Systems to Compare
          </h3>
          <button
            onClick={handleAddSystem}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            + Add System
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {systems.map(system => (
            <SystemCard
              key={system.id}
              system={system}
              isSelected={selectedSystems.includes(system.id)}
              onToggle={() => handleSystemToggle(system.id)}
              onEdit={(updates) => {
                setSystems(systems.map(s => s.id === system.id ? { ...s, ...updates } : s))
              }}
            />
          ))}
        </div>
      </div>

      {/* Results Display */}
      {comparisonResults.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'table' && (
              <ComparisonTable
                results={comparisonResults}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            )}
            
            {viewMode === 'chart' && (
              <ComparisonChart
                results={comparisonResults}
                systems={systems}
              />
            )}
            
            {viewMode === 'radar' && (
              <RadarChart
                results={comparisonResults}
                systems={systems}
              />
            )}
            
            {viewMode === 'details' && (
              <DetailedComparison
                results={comparisonResults}
                systems={systems}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Loading State */}
      {isCalculating && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-gray-600 dark:text-gray-400">Calculating comparisons...</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SYSTEM CARD COMPONENT
// ============================================================================

interface SystemCardProps {
  system: SystemConfiguration
  isSelected: boolean
  onToggle: () => void
  onEdit: (updates: Partial<SystemConfiguration>) => void
}

function SystemCard({ system, isSelected, onToggle, onEdit }: SystemCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className={`p-4 border rounded-lg transition-all ${
      isSelected 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className={`w-5 h-5 rounded border-2 transition-colors ${
              isSelected 
                ? 'bg-blue-500 border-blue-500' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {isSelected && (
              <svg className="w-3 h-3 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: system.color }}
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {system.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {system.fuelCellType}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>

      {/* System Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <div>{system.cellCount} cells × {system.activeArea} cm²</div>
        <div>{system.operatingTemperature}°C, {system.operatingPressure} bar</div>
      </div>

      {/* Edit Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2"
          >
            <input
              type="text"
              value={system.name}
              onChange={(e) => onEdit({ name: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              placeholder="System name"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={system.cellCount}
                onChange={(e) => onEdit({ cellCount: parseInt(e.target.value) || 1 })}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                placeholder="Cells"
              />
              <input
                type="number"
                value={system.activeArea}
                onChange={(e) => onEdit({ activeArea: parseFloat(e.target.value) || 1 })}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                placeholder="Area"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// COMPARISON TABLE
// ============================================================================

interface ComparisonTableProps {
  results: ComparisonResult[]
  sortBy: keyof ComparisonMetrics
  sortOrder: 'asc' | 'desc'
  onSort: (metric: keyof ComparisonMetrics) => void
}

function ComparisonTable({ results, sortBy, sortOrder, onSort }: ComparisonTableProps) {
  const sortedResults = [...results].sort((a, b) => {
    const aValue = a.metrics[sortBy]
    const bValue = b.metrics[sortBy]
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-gray-100">
              System
            </th>
            {COMPARISON_CRITERIA.map(criterion => (
              <th
                key={criterion.id}
                className="px-4 py-3 text-center font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onSort(criterion.id as keyof ComparisonMetrics)}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{criterion.icon}</span>
                  <span>{criterion.label}</span>
                  {sortBy === criterion.id && (
                    <span className="text-xs">
                      {sortOrder === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </div>
              </th>
            ))}
            <th className="px-4 py-3 text-center font-medium text-gray-900 dark:text-gray-100">
              Overall Rank
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedResults.map((result, index) => (
            <tr key={result.systemId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                {result.systemName}
              </td>
              <td className="px-4 py-3 text-center">
                {result.metrics.power.toFixed(1)} W
                <div className="text-xs text-gray-500">#{result.rank.power}</div>
              </td>
              <td className="px-4 py-3 text-center">
                {result.metrics.efficiency.toFixed(1)}%
                <div className="text-xs text-gray-500">#{result.rank.efficiency}</div>
              </td>
              <td className="px-4 py-3 text-center">
                {result.metrics.powerDensity.toFixed(3)} W/cm²
              </td>
              <td className="px-4 py-3 text-center">
                ${result.metrics.cost.toFixed(0)}
                <div className="text-xs text-gray-500">#{result.rank.cost}</div>
              </td>
              <td className="px-4 py-3 text-center">
                {(result.metrics.durability / 1000).toFixed(1)}k hrs
              </td>
              <td className="px-4 py-3 text-center">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                  result.rank.overall === 1 ? 'bg-yellow-400 text-yellow-900' :
                  result.rank.overall === 2 ? 'bg-gray-300 text-gray-700' :
                  result.rank.overall === 3 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {result.rank.overall}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// COMPARISON CHART
// ============================================================================

interface ComparisonChartProps {
  results: ComparisonResult[]
  systems: SystemConfiguration[]
}

function ComparisonChart({ results, systems }: ComparisonChartProps) {
  const metrics = ['power', 'efficiency', 'powerDensity'] as const
  const selectedMetric = 'power' // Could be made dynamic

  const maxValue = Math.max(...results.map(r => r.metrics[selectedMetric]))
  const chartHeight = 300
  const barWidth = 60
  const spacing = 20

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Performance Comparison
      </h3>
      
      <div className="overflow-x-auto">
        <svg
          width={results.length * (barWidth + spacing) + spacing}
          height={chartHeight + 60}
          className="min-w-full"
        >
          {/* Y-axis */}
          <line
            x1="40"
            y1="20"
            x2="40"
            y2={chartHeight + 20}
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-300 dark:text-gray-600"
          />
          
          {/* Bars */}
          {results.map((result, index) => {
            const system = systems.find(s => s.id === result.systemId)!
            const barHeight = (result.metrics[selectedMetric] / maxValue) * chartHeight
            const x = 60 + index * (barWidth + spacing)
            const y = chartHeight + 20 - barHeight
            
            return (
              <g key={result.systemId}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={system.color}
                  opacity={0.8}
                  className="hover:opacity-100 transition-opacity"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="currentColor"
                  className="text-gray-600 dark:text-gray-400"
                >
                  {result.metrics[selectedMetric].toFixed(1)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 40}
                  textAnchor="middle"
                  fontSize="12"
                  fill="currentColor"
                  className="text-gray-600 dark:text-gray-400"
                >
                  {system.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// ============================================================================
// RADAR CHART
// ============================================================================

interface RadarChartProps {
  results: ComparisonResult[]
  systems: SystemConfiguration[]
}

function RadarChart({ results, systems }: RadarChartProps) {
  const metrics = [
    { key: 'power', label: 'Power', max: Math.max(...results.map(r => r.metrics.power)) },
    { key: 'efficiency', label: 'Efficiency', max: 100 },
    { key: 'powerDensity', label: 'Power Density', max: Math.max(...results.map(r => r.metrics.powerDensity)) },
    { key: 'fuelUtilization', label: 'Fuel Util.', max: 100 },
    { key: 'voltage', label: 'Voltage', max: Math.max(...results.map(r => r.metrics.voltage)) }
  ]

  const centerX = 200
  const centerY = 200
  const radius = 150
  const angleStep = (2 * Math.PI) / metrics.length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Multi-Criteria Analysis
      </h3>
      
      <svg width="400" height="400" className="mx-auto">
        {/* Grid lines */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
          <g key={scale}>
            {metrics.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2
              const x = centerX + Math.cos(angle) * radius * scale
              const y = centerY + Math.sin(angle) * radius * scale
              const nextAngle = ((i + 1) % metrics.length) * angleStep - Math.PI / 2
              const nextX = centerX + Math.cos(nextAngle) * radius * scale
              const nextY = centerY + Math.sin(nextAngle) * radius * scale
              
              return (
                <line
                  key={i}
                  x1={x}
                  y1={y}
                  x2={nextX}
                  y2={nextY}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              )
            })}
          </g>
        ))}
        
        {/* Axes */}
        {metrics.map((metric, i) => {
          const angle = i * angleStep - Math.PI / 2
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius
          
          return (
            <g key={metric.key}>
              <line
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#9ca3af"
                strokeWidth="1"
              />
              <text
                x={x + Math.cos(angle) * 20}
                y={y + Math.sin(angle) * 20}
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                className="text-gray-600 dark:text-gray-400"
              >
                {metric.label}
              </text>
            </g>
          )
        })}
        
        {/* Data polygons */}
        {results.map((result, resultIndex) => {
          const system = systems.find(s => s.id === result.systemId)!
          const points = metrics.map((metric, i) => {
            const angle = i * angleStep - Math.PI / 2
            const value = result.metrics[metric.key as keyof ComparisonMetrics] as number
            const normalizedValue = Math.min(value / metric.max, 1)
            const x = centerX + Math.cos(angle) * radius * normalizedValue
            const y = centerY + Math.sin(angle) * radius * normalizedValue
            return `${x},${y}`
          }).join(' ')
          
          return (
            <polygon
              key={result.systemId}
              points={points}
              fill={system.color}
              fillOpacity="0.2"
              stroke={system.color}
              strokeWidth="2"
            />
          )
        })}
      </svg>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4">
        {results.map(result => {
          const system = systems.find(s => s.id === result.systemId)!
          return (
            <div key={result.systemId} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: system.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {system.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// DETAILED COMPARISON
// ============================================================================

interface DetailedComparisonProps {
  results: ComparisonResult[]
  systems: SystemConfiguration[]
}

function DetailedComparison({ results, systems }: DetailedComparisonProps) {
  return (
    <div className="space-y-6">
      {results.map(result => {
        const system = systems.find(s => s.id === result.systemId)!
        
        return (
          <div key={result.systemId} className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: system.color }}
                />
                {system.name}
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Overall Rank: #{result.rank.overall}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {COMPARISON_CRITERIA.map(criterion => (
                <div key={criterion.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {criterion.icon} {criterion.label}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {criterion.id === 'cost' 
                      ? `$${result.metrics[criterion.id as keyof ComparisonMetrics].toFixed(0)}`
                      : criterion.id === 'durability'
                      ? `${(result.metrics[criterion.id as keyof ComparisonMetrics] / 1000).toFixed(1)}k hrs`
                      : `${result.metrics[criterion.id as keyof ComparisonMetrics].toFixed(
                          criterion.id === 'powerDensity' ? 3 : 1
                        )} ${criterion.unit}`
                    }
                  </div>
                  {result.rank[criterion.id as keyof typeof result.rank] && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Rank #{result.rank[criterion.id as keyof typeof result.rank]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                System Configuration
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div>Type: {system.fuelCellType}</div>
                <div>Cells: {system.cellCount}</div>
                <div>Area: {system.activeArea} cm²</div>
                <div>Temp: {system.operatingTemperature}°C</div>
                <div>Pressure: {system.operatingPressure} bar</div>
                <div>Fuel Flow: {system.fuelFlowRate} L/min</div>
                <div>Air Flow: {system.airFlowRate} L/min</div>
                {system.humidity > 0 && <div>Humidity: {system.humidity}%</div>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}