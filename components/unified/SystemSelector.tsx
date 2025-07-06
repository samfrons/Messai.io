'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

// ============================================================================
// SYSTEM SELECTOR COMPONENT
// ============================================================================

export interface SystemType {
  id: 'microbial' | 'fuel-cell'
  name: string
  description: string
  icon: string
  features: string[]
  applications: string[]
  powerRange: string
  costRange: string
  complexity: 'Low' | 'Medium' | 'High'
  maturity: 'Research' | 'Pilot' | 'Commercial'
}

interface SystemSelectorProps {
  selectedSystem: string | null
  onSystemSelect: (systemId: string) => void
  className?: string
}

const SYSTEM_TYPES: SystemType[] = [
  {
    id: 'microbial',
    name: 'Microbial Electrochemical Systems',
    description: 'Bioelectrochemical systems using microorganisms for energy conversion and environmental applications',
    icon: '🦠',
    features: [
      'Living microbial catalysts',
      'Wastewater treatment',
      'Biohydrogen production',
      'Sustainable materials',
      'Self-sustaining operation'
    ],
    applications: [
      'Wastewater treatment plants',
      'Remote monitoring sensors',
      'Biohydrogen production',
      'Desalination systems',
      'Biosynthesis reactors'
    ],
    powerRange: '1 mW - 50 W/m²',
    costRange: '$10 - $5,000',
    complexity: 'Medium',
    maturity: 'Pilot'
  },
  {
    id: 'fuel-cell',
    name: 'Fuel Cell Systems',
    description: 'Electrochemical devices that convert hydrogen and oxygen into electricity with high efficiency',
    icon: '⚡',
    features: [
      'High efficiency conversion',
      'Zero emissions operation',
      'Rapid response time',
      'Scalable power output',
      'System-level control'
    ],
    applications: [
      'Automotive propulsion',
      'Stationary power generation',
      'Backup power systems',
      'Portable electronics',
      'Space applications'
    ],
    powerRange: '1 W - 100 MW',
    costRange: '$100 - $1M+',
    complexity: 'High',
    maturity: 'Commercial'
  }
]

export default function SystemSelector({ selectedSystem, onSystemSelect, className = '' }: SystemSelectorProps) {
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null)

  const handleSystemSelect = useCallback((systemId: string) => {
    onSystemSelect(systemId)
  }, [onSystemSelect])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Select Electrochemical System Type
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose the type of electrochemical system you want to design and analyze
        </p>
      </div>

      {/* System Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SYSTEM_TYPES.map((system) => (
          <motion.div
            key={system.id}
            className={`
              relative p-6 rounded-lg border cursor-pointer transition-all duration-200
              ${selectedSystem === system.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHoveredSystem(system.id)}
            onHoverEnd={() => setHoveredSystem(null)}
            onClick={() => handleSystemSelect(system.id)}
          >
            {/* Selection indicator */}
            {selectedSystem === system.id && (
              <motion.div
                className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}

            {/* System Icon and Title */}
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">{system.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {system.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {system.description}
                </p>
              </div>
            </div>

            {/* System Specifications */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Power Range:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">{system.powerRange}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Cost Range:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">{system.costRange}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Complexity:</span>
                <span className={`
                  inline-block px-2 py-1 rounded text-xs font-medium
                  ${system.complexity === 'Low' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    system.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }
                `}>
                  {system.complexity}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Maturity:</span>
                <span className={`
                  inline-block px-2 py-1 rounded text-xs font-medium
                  ${system.maturity === 'Research' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                    system.maturity === 'Pilot' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }
                `}>
                  {system.maturity}
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Key Features:</h4>
              <div className="flex flex-wrap gap-1">
                {system.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Applications (shown on hover or selection) */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: (hoveredSystem === system.id || selectedSystem === system.id) ? 'auto' : 0,
                opacity: (hoveredSystem === system.id || selectedSystem === system.id) ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Applications:</h4>
              <ul className="space-y-1">
                {system.applications.map((application, index) => (
                  <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {application}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Selection call-to-action */}
            <motion.div
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: selectedSystem === system.id ? 1 : 0.7 }}
            >
              <span className={`
                text-sm font-medium
                ${selectedSystem === system.id 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
                }
              `}>
                {selectedSystem === system.id ? 'Selected ✓' : 'Click to select'}
              </span>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Comparison Section */}
      {hoveredSystem && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Quick Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Best for:</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {hoveredSystem === 'microbial' 
                  ? 'Environmental applications, research, sustainable energy'
                  : 'High-power applications, transportation, backup power'
                }
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Development Time:</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {hoveredSystem === 'microbial' 
                  ? 'Weeks to months (biological adaptation)'
                  : 'Days to weeks (system integration)'
                }
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Maintenance:</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {hoveredSystem === 'microbial' 
                  ? 'Low (self-sustaining biology)'
                  : 'Medium (system monitoring required)'
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {selectedSystem && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4"
        >
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
            onClick={() => {
              // Navigate to system design page
              console.log(`Navigate to ${selectedSystem} design`)
            }}
          >
            Start Designing
          </button>
          <button
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            onClick={() => onSystemSelect('')}
          >
            Change Selection
          </button>
        </motion.div>
      )}
    </div>
  )
}