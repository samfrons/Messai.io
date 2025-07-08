'use client'

import Link from 'next/link'
import { FileText, LineChart, Search } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            MESSAi Research Engine
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore 2,000+ research papers on Microbial Electrochemical Systems with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Link href="/literature" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <FileText className="h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Literature Database
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Browse comprehensive collection of MES research papers
              </p>
            </div>
          </Link>

          <Link href="/literature/semantic-search" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <Search className="h-12 w-12 text-green-600 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Semantic Search
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered search to find relevant research
              </p>
            </div>
          </Link>

          <Link href="/insights" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <LineChart className="h-12 w-12 text-purple-600 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Research Insights
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Data-driven discoveries from aggregated research
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              About MESSAi Research
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This research engine provides access to a comprehensive database of Microbial Electrochemical Systems literature, 
              with advanced search capabilities and AI-powered insights extraction.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full">
                2,030+ Papers
              </span>
              <span className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full">
                Performance Data Extraction
              </span>
              <span className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full">
                Material Analysis
              </span>
              <span className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full">
                Organism Mapping
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}