'use client'

import { useState } from 'react'
import { Parameter, unitConversions } from '@/lib/parameters-data'

interface ParameterCardProps {
  parameter: Parameter
  expanded?: boolean
  onToggle?: () => void
  showConversions?: boolean
}

export default function ParameterCard({ 
  parameter, 
  expanded = false, 
  onToggle,
  showConversions = true 
}: ParameterCardProps) {
  const [showConverter, setShowConverter] = useState(false)
  const [convertValue, setConvertValue] = useState('')
  
  // Check if unit conversions are available for this parameter
  const hasConversions = () => {
    if (!parameter.unit) return false
    
    // Temperature conversions
    if (parameter.unit === '°C' || parameter.unit === '°F' || parameter.unit === 'K') return true
    
    // Power conversions
    if (parameter.unit === 'mW' || parameter.unit === 'W' || 
        parameter.unit === 'mW/m²' || parameter.unit === 'W/m²') return true
    
    // Pressure conversions
    if (parameter.unit === 'kPa' || parameter.unit === 'psi' || 
        parameter.unit === 'bar') return true
    
    return false
  }
  
  // Perform unit conversion
  const convertUnit = (value: number, fromUnit: string, toUnit: string): number => {
    // Temperature conversions
    if (fromUnit === '°C' && toUnit === '°F') return unitConversions.temperature.celsiusToFahrenheit(value)
    if (fromUnit === '°F' && toUnit === '°C') return unitConversions.temperature.fahrenheitToCelsius(value)
    if (fromUnit === '°C' && toUnit === 'K') return unitConversions.temperature.celsiusToKelvin(value)
    if (fromUnit === 'K' && toUnit === '°C') return unitConversions.temperature.kelvinToCelsius(value)
    
    // Power conversions
    if (fromUnit === 'mW' && toUnit === 'W') return unitConversions.power.mWToW(value)
    if (fromUnit === 'W' && toUnit === 'mW') return unitConversions.power.WTomW(value)
    if (fromUnit === 'mW/m²' && toUnit === 'W/m²') return unitConversions.power.mWm2ToWm2(value)
    if (fromUnit === 'W/m²' && toUnit === 'mW/m²') return unitConversions.power.Wm2TomWm2(value)
    
    // Pressure conversions
    if (fromUnit === 'kPa' && toUnit === 'psi') return unitConversions.pressure.kPaToPsi(value)
    if (fromUnit === 'psi' && toUnit === 'kPa') return unitConversions.pressure.psiToKPa(value)
    if (fromUnit === 'kPa' && toUnit === 'bar') return unitConversions.pressure.kPaToBar(value)
    if (fromUnit === 'bar' && toUnit === 'kPa') return unitConversions.pressure.barToKPa(value)
    
    return value
  }
  
  // Get available conversion units
  const getConversionOptions = (unit: string): string[] => {
    switch (unit) {
      case '°C': return ['°F', 'K']
      case '°F': return ['°C', 'K']
      case 'K': return ['°C', '°F']
      case 'mW': return ['W']
      case 'W': return ['mW']
      case 'mW/m²': return ['W/m²']
      case 'W/m²': return ['mW/m²']
      case 'kPa': return ['psi', 'bar']
      case 'psi': return ['kPa', 'bar']
      case 'bar': return ['kPa', 'psi']
      default: return []
    }
  }
  
  // Get color based on parameter category
  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      environmental: 'border-blue-300 dark:border-blue-700',
      'cell-level': 'border-green-300 dark:border-green-700',
      'reactor-level': 'border-purple-300 dark:border-purple-700',
      biological: 'border-orange-300 dark:border-orange-700',
      material: 'border-red-300 dark:border-red-700',
      operational: 'border-indigo-300 dark:border-indigo-700',
      performance: 'border-yellow-300 dark:border-yellow-700',
      economic: 'border-emerald-300 dark:border-emerald-700',
      safety: 'border-rose-300 dark:border-rose-700',
      monitoring: 'border-cyan-300 dark:border-cyan-700'
    }
    return colors[parameter.category] || 'border-gray-300 dark:border-gray-700'
  }
  
  return (
    <div
      className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${getCategoryColor()}`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {parameter.name}
          </h4>
          {parameter.unit && (
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              [{parameter.unit}]
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showConversions && hasConversions() && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowConverter(!showConverter)
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Unit converter"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          )}
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${
              expanded ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <p className={`text-sm text-gray-600 dark:text-gray-400 mt-2 ${
        expanded ? '' : 'line-clamp-2'
      }`}>
        {parameter.description}
      </p>
      
      {expanded && (
        <div className="mt-4 space-y-3">
          {parameter.range && (
            <div className="text-sm bg-gray-50 dark:bg-gray-800 rounded p-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Range: </span>
              <span className="text-gray-600 dark:text-gray-400">
                {parameter.range.min !== undefined && `${parameter.range.min} - `}
                {parameter.range.max !== undefined && parameter.range.max}
                {parameter.range.typical !== undefined && ` (typical: ${parameter.range.typical})`}
                {parameter.unit && ` ${parameter.unit}`}
              </span>
            </div>
          )}
          
          {parameter.notes && (
            <div className="text-sm bg-blue-50 dark:bg-blue-900/20 rounded p-2">
              <span className="font-medium text-blue-700 dark:text-blue-300">Note: </span>
              <span className="text-blue-600 dark:text-blue-400">{parameter.notes}</span>
            </div>
          )}
          
          {showConverter && hasConversions() && parameter.unit && (
            <div 
              className="bg-gray-50 dark:bg-gray-800 rounded p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unit Converter
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={convertValue}
                  onChange={(e) => setConvertValue(e.target.value)}
                  placeholder={`Enter ${parameter.unit}`}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{parameter.unit}</span>
              </div>
              {convertValue && !isNaN(Number(convertValue)) && (
                <div className="mt-2 space-y-1">
                  {getConversionOptions(parameter.unit).map(toUnit => {
                    const converted = convertUnit(Number(convertValue), parameter.unit!, toUnit)
                    return (
                      <div key={toUnit} className="text-sm text-gray-600 dark:text-gray-400">
                        = {converted.toFixed(2)} {toUnit}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
          
          {parameter.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {parameter.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {parameter.relatedParameters && parameter.relatedParameters.length > 0 && (
            <div className="text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Related: </span>
              <span className="text-gray-600 dark:text-gray-400">
                {parameter.relatedParameters.join(', ')}
              </span>
            </div>
          )}
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span>Category: {parameter.category}</span>
            <span>ID: {parameter.id}</span>
          </div>
        </div>
      )}
    </div>
  )
}