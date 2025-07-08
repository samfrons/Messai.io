'use client'

import dynamic from 'next/dynamic'
import { UnifiedMESSSystem, standardizePowerOutput, getDesignTypeFor3D } from '@/lib/unified-systems-catalog'
import { DesignType } from '@messai/ui'

// Dynamic import of the lightweight 3D component for cards
const MESSModel3DLite = dynamic(
  () => import('@messai/ui').then(mod => mod.MESSModel3DLite),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
)

interface UnifiedSystemCardProps {
  system: UnifiedMESSSystem
  onClick: (system: UnifiedMESSSystem) => void
  isSelected?: boolean
}

export default function UnifiedSystemCard({ system, onClick, isSelected }: UnifiedSystemCardProps) {
  // Format power output for display
  const formatPowerOutput = () => {
    const { value, unit, range } = system.powerOutput
    if (range) return range
    
    // Format large numbers
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k ${unit}`
    }
    return `${value} ${unit}`
  }

  // Get category badge color
  const getCategoryColor = () => {
    switch (system.category) {
      case 'experimental': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
      case 'high-performance': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
      case 'innovative': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
      case 'scalable': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
      case 'sustainable': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
      case 'specialized': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  // Get scale icon
  const getScaleIcon = () => {
    switch (system.scale) {
      case 'micro': return '🔬'
      case 'lab': return '🧪'
      case 'pilot': return '🏭'
      case 'industrial': return '🏗️'
      default: return '📊'
    }
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

  return (
    <div 
      className={`group bg-white dark:bg-gray-800 border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 shadow-lg' 
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
      }`}
      onClick={() => onClick(system)}
    >
      {/* 3D Model Preview */}
      <div className="relative h-48 bg-gray-50 dark:bg-gray-900">
        <div className="absolute inset-2 flex items-center justify-center text-xs text-gray-500">
          Debug: {getDesignTypeFor3D(system)}
        </div>
        <MESSModel3DLite 
          design={getDesignTypeFor3D(system) as DesignType}
          autoRotate={true}
          rotationSpeed={0.005}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs font-medium rounded">
            🎮 Interactive 3D
          </span>
          <div className="flex gap-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor()}`}>
              {system.category}
            </span>
            {system.researchBacked && (
              <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 text-xs font-medium rounded-full">
                Research
              </span>
            )}
          </div>
        </div>
        
        {getPriorityBadge() && (
          <div className="absolute top-2 right-2">
            {getPriorityBadge()}
          </div>
        )}
      </div>
      
      {/* System Info */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {system.name}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {system.description}
        </p>
        
        {/* Key Metrics */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-500">Power Output</span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatPowerOutput()}
            </span>
          </div>

          {system.efficiency && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-500">Efficiency</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {system.efficiency}%
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-500">Cost</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {system.cost.value}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-500">Scale</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {system.scale}
            </span>
          </div>
        </div>

        {/* Special Features - Show 2 */}
        {system.specialFeatures.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {system.specialFeatures.slice(0, 2).map((feature, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                >
                  {feature}
                </span>
              ))}
              {system.specialFeatures.length > 2 && (
                <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                  +{system.specialFeatures.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
          <span>🎮 Configure & Build</span>
          {system.isExperimental && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
        </button>

        {/* Customization Features Badge */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            ⚙️ 3D Visualization • 🧪 Material Selection • 🦠 Microbial Config
          </span>
        </div>
      </div>
    </div>
  )
}