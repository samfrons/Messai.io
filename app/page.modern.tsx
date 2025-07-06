'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [message, setMessage] = useState('')

  const designs = [
    {
      id: 'earthen-pot',
      name: 'Earthen Pot MFC',
      description: 'Traditional clay-based design for educational purposes',
      power: '10-50 mW',
      cost: '$5-15',
      icon: '🏺'
    },
    {
      id: 'micro-chip',
      name: 'Micro-chip MFC',
      description: 'Miniaturized design for portable applications',
      power: '1-10 mW',
      cost: '$20-50',
      icon: '💻'
    },
    {
      id: 'wastewater-treatment',
      name: 'Wastewater Treatment',
      description: 'Industrial-scale system for water purification',
      power: '100-500 mW',
      cost: '$500-2000',
      icon: '💧'
    },
    {
      id: 'benthic-fuel-cell',
      name: 'Benthic Fuel Cell',
      description: 'Marine sediment power generation system',
      power: '50-200 mW',
      cost: '$200-800',
      icon: '🌊'
    }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Welcome to MESSAi
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            AI-powered platform for microbial fuel cell research and optimization
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Hero Section */}
          <div className="mb-8 p-8 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-700 rounded-lg">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Accelerate Your MFC Research
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-3xl">
              MESSAi combines advanced AI predictions with comprehensive material databases 
              to help you design and optimize microbial fuel cells faster than ever before.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/designs"
                className="px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium"
              >
                Explore Designs
              </Link>
              <Link 
                href="/dashboard"
                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                AI Predictions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get accurate power output predictions based on your experimental parameters and design choices.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Material Database
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access comprehensive data on electrodes, microbes, and substrates for optimal MFC design.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Real-time Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track experiments, visualize data, and compare performance across different MFC configurations.
              </p>
            </div>
          </div>

          {/* Popular Designs */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Popular MFC Designs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {designs.map((design) => (
                <Link 
                  key={design.id}
                  href={`/designs?type=${design.id}`}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{design.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {design.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {design.description}
                      </p>
                      <div className="flex gap-4 mt-3 text-sm">
                        <span className="text-gray-500 dark:text-gray-500">
                          Power: <span className="text-gray-700 dark:text-gray-300 font-medium">{design.power}</span>
                        </span>
                        <span className="text-gray-500 dark:text-gray-500">
                          Cost: <span className="text-gray-700 dark:text-gray-300 font-medium">{design.cost}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-12 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Ready to optimize your MFC research?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Join researchers worldwide who are accelerating their discoveries with MESSAi's 
              AI-powered predictions and comprehensive material databases.
            </p>
            <Link 
              href="/auth/signup"
              className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium"
            >
              Get Started Free
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Input area (similar to ChatGPT) */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={(e) => {
            e.preventDefault()
            // Handle prediction request
            console.log('Prediction request:', message)
          }} className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about MFC predictions, materials, or designs..."
              className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            MESSAi can help with power predictions, material selection, and experiment design
          </p>
        </div>
      </div>
    </div>
  )
}