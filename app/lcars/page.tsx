'use client'

import { useState } from 'react'
import Link from 'next/link'
import UnifiedDashboard from '@/components/unified/UnifiedDashboard'
import { getDemoConfig } from '@/lib/demo-mode'
import { ExternalLink } from 'lucide-react'

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [message, setMessage] = useState('')
  const demoConfig = getDemoConfig()

  // In production mode (messai.io), redirect to marketing page
  if (!demoConfig.isDemo && typeof window !== 'undefined') {
    // This would be handled by Vercel rewrites, but adding for clarity
    if (window.location.hostname === 'messai.io') {
      window.location.href = '/marketing'
    }
  }

  const electrochemicalSystems = [
    {
      id: 'microbial',
      name: 'Microbial Electrochemical Systems',
      description: 'Bioelectrochemical systems using microorganisms',
      power: '1 mW - 50 W/m²',
      cost: '$10 - $5,000',
      icon: '🦠',
      maturity: 'Pilot Scale'
    },
    {
      id: 'fuel-cell',
      name: 'Fuel Cell Systems', 
      description: 'High-efficiency electrochemical energy conversion',
      power: '1 W - 100 MW',
      cost: '$100 - $1M+',
      icon: '⚡',
      maturity: 'Commercial'
    }
  ]

  if (showDashboard) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                MESSAi - Unified Electrochemical Systems Platform
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Design and optimize both microbial and fuel cell systems
              </p>
            </div>
            <button
              onClick={() => setShowDashboard(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <UnifiedDashboard />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="px-6 py-4">
          {/* Demo Mode Banner */}
          {demoConfig.isDemo && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎭</span>
                <div>
                  <div className="text-sm font-medium text-purple-900">MESSAi Demo Platform</div>
                  <div className="text-xs text-purple-700">
                    You're viewing the demo version. Visit{' '}
                    <a 
                      href={demoConfig.productionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium underline hover:text-purple-800"
                    >
                      messai.io
                    </a>
                    {' '}for the full platform with personal accounts.
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Welcome to MESSAi
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            AI-powered platform for electrochemical systems research and optimization
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Hero Section */}
          <div className="mb-8 p-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Unified Electrochemical Systems Platform
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-3xl">
              MESSAi now supports both microbial electrochemical systems and fuel cell design. 
              Use advanced AI predictions, multi-fidelity modeling, and comprehensive material databases 
              to accelerate your research across all electrochemical technologies.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDashboard(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
              >
                Launch Platform
              </button>
              <Link 
                href="/systems"
                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Browse Systems
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Multi-Fidelity Modeling
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from basic, intermediate, or advanced modeling complexity based on your computational needs and analysis requirements.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Unified Material Database
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access comprehensive data on electrodes, membranes, catalysts, and biological materials for both microbial and fuel cell systems.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                3D Visualization & Control
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Interactive 3D models with gas flow visualization, temperature gradients, and control system design tools.
              </p>
            </div>
          </div>

          {/* System Types */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Supported Electrochemical Systems
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {electrochemicalSystems.map((system) => (
                <div 
                  key={system.id}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{system.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {system.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {system.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-500">Power Range:</span>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{system.power}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-500">Cost Range:</span>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{system.cost}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-500">Maturity Level:</span>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{system.maturity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-12 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Ready to accelerate your electrochemical systems research?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Join researchers worldwide who are using MESSAi's unified platform for both microbial and fuel cell systems design. 
              Get AI-powered predictions, advanced modeling, and comprehensive material databases.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowDashboard(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
              >
                Try Platform Now
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              {demoConfig.isDemo ? (
                <a
                  href={`${demoConfig.productionUrl}/auth/signup`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Create Account at messai.io
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              ) : (
                <Link 
                  href="/auth/signup"
                  className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Input area (similar to ChatGPT) */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={(e) => {
            e.preventDefault()
            // Handle prediction request
            if (message.trim()) {
              setShowDashboard(true)
              setMessage('')
            }
          }} className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about fuel cell stacks, microbial systems, materials, or design optimization..."
              className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
              disabled={!message.trim()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            MESSAi supports both microbial electrochemical systems and fuel cell design with AI-powered predictions
          </p>
        </div>
      </div>
    </div>
  )
}