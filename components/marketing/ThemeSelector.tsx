/**
 * Theme Selector Component
 * Easy theme switching for testing different styles
 */

'use client'

import { useState } from 'react'
import { useThemeContext } from '@/hooks/useTheme'

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentStyle, currentIndustry, switchStyle, switchIndustry, applyPreset, availableStyles, availableIndustries } = useThemeContext()

  const presets = [
    { id: 'scientific', name: 'Scientific', description: 'Refined and professional', color: 'bg-gray-100' },
    { id: 'vibrant', name: 'Vibrant', description: 'Bold and energetic', color: 'bg-gradient-to-r from-green-400 to-pink-500' },
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple', color: 'bg-white border-2 border-gray-200' },
    { id: 'wastewater', name: 'Wastewater', description: 'Industry-specific', color: 'bg-blue-100' },
    { id: 'energy', name: 'Energy', description: 'Bio-electric theme', color: 'bg-yellow-100' },
  ]

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-all duration-300 z-50 group"
        title="Theme Settings"
      >
        <svg className="w-6 h-6 text-gray-600 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Theme Settings</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Current Theme Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-1">Current Theme</div>
        <div className="font-medium text-gray-900">
          {currentIndustry ? `${currentIndustry} Industry` : `${currentStyle} Style`}
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-3">Quick Presets</div>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`p-3 rounded-lg border border-gray-200 hover:border-teal-300 transition-all duration-200 text-left group ${
                (preset.id === currentStyle && !currentIndustry) || preset.id === currentIndustry
                  ? 'ring-2 ring-teal-500 border-teal-300'
                  : ''
              }`}
            >
              <div className={`w-full h-4 rounded mb-2 ${preset.color}`}></div>
              <div className="text-sm font-medium text-gray-900 group-hover:text-teal-700">
                {preset.name}
              </div>
              <div className="text-xs text-gray-500">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Base Styles */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Base Styles</div>
        <div className="flex gap-2">
          {availableStyles.map((style) => (
            <button
              key={style}
              onClick={() => switchStyle(style)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                currentStyle === style && !currentIndustry
                  ? 'bg-teal-100 border-teal-300 text-teal-700'
                  : 'border-gray-200 text-gray-600 hover:border-teal-200 hover:text-teal-600'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Industry Themes */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Industry Themes</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => switchIndustry(null)}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              !currentIndustry
                ? 'bg-gray-100 border-gray-300 text-gray-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            None
          </button>
          {availableIndustries.map((industry) => (
            <button
              key={industry}
              onClick={() => switchIndustry(industry)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors capitalize ${
                currentIndustry === industry
                  ? 'bg-teal-100 border-teal-300 text-teal-700'
                  : 'border-gray-200 text-gray-600 hover:border-teal-200 hover:text-teal-600'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          💡 Try different themes to see how the bio-inspired design adapts to various use cases and aesthetics.
        </div>
      </div>
    </div>
  )
}