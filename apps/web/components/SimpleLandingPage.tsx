'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { getDemoConfig } from '@/lib/demo-mode'
import { ExternalLink } from 'lucide-react'

export default function SimpleLandingPage() {
  const demoConfig = getDemoConfig()

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl sm:text-6xl md:text-8xl font-serif font-bold mb-6 bg-gradient-to-r from-blue-400 via-white to-green-400 bg-clip-text text-transparent"
          >
            MESSAi
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-4xl font-serif mb-8 text-gray-200"
          >
            Revolutionizing Bioelectrochemical Research
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl font-serif text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Where biology meets technology. Advanced AI-powered platform for designing, 
            analyzing, and optimizing microbial electrochemical systems.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center px-4"
          >
            <Link
              href="/tools/bioreactor"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
            >
              Explore the Tools
            </Link>
            
            <Link
              href="/models"
              className="px-8 py-4 border-2 border-white/30 text-white rounded-lg hover:border-white/50 hover:bg-white/10 transition-all duration-300 font-semibold text-lg backdrop-blur-sm"
            >
              Browse Models
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">
              Open Scientific Tools
            </h2>
            <p className="text-lg font-serif text-gray-300 max-w-3xl mx-auto">
              Open-source platform combining cutting-edge technology with scientific rigor to deliver 
              comprehensive tools for bioelectrochemical research.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 hover:border-blue-400/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">🧬</div>
                  <h3 className="text-xl font-serif text-white">Bioreactor Design Tool</h3>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed font-serif text-sm">
                  Design next-generation bioreactors with multi-fidelity modeling capabilities. 
                  Real-time parameter optimization with advanced physics simulation and comprehensive materials database.
                </p>
                
                <Link 
                  href="/tools/bioreactor"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-medium text-center block"
                >
                  Start Designing
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 hover:border-blue-400/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">⚡</div>
                  <h3 className="text-xl font-serif text-white">Electroanalytical Interface</h3>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed font-serif text-sm">
                  Advanced electroanalytical techniques with real-time data simulation. 
                  Multiple analytical methods including voltammetry, impedance spectroscopy, and chronoamperometry.
                </p>
                
                <Link 
                  href="/tools/electroanalytical"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-medium text-center block"
                >
                  Analyze Data
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 hover:border-blue-400/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">📚</div>
                  <h3 className="text-xl font-serif text-white">Research Library</h3>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed font-serif text-sm">
                  AI-enhanced research database with verified scientific literature. 
                  Collaborative research tools with AI-powered insights and comprehensive data verification.
                </p>
                
                <Link 
                  href="/literature"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-medium text-center block"
                >
                  Browse Library
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 hover:border-blue-400/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">🏗️</div>
                  <h3 className="text-xl font-serif text-white">MESS Models</h3>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed font-serif text-sm">
                  Pre-configured microbial electrochemical system templates. 
                  Explore laboratory, pilot, and industrial scale designs with optimized material combinations.
                </p>
                
                <Link 
                  href="/models"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-medium text-center block"
                >
                  Browse Models
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-white">
              Ready to Transform Your Research?
            </h2>
            <p className="text-lg font-serif text-gray-300 mb-12 leading-relaxed">
              Join researchers worldwide who are accelerating their bioelectrochemical systems 
              research with MESSAi's comprehensive platform.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
                <h3 className="text-xl font-serif font-semibold text-white mb-4">Design Tools</h3>
                <p className="text-gray-300 font-serif mb-6">Advanced bioreactor and electroanalytical tools</p>
                <Link
                  href="/tools/bioreactor"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-semibold block text-center"
                >
                  Start Designing
                </Link>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
                <h3 className="text-xl font-serif font-semibold text-white mb-4">MESS Models</h3>
                <p className="text-gray-300 font-serif mb-6">Pre-configured system examples and templates</p>
                <Link
                  href="/models"
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 font-semibold block text-center"
                >
                  Browse Models
                </Link>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
                <h3 className="text-xl font-serif font-semibold text-white mb-4">Research Library</h3>
                <p className="text-gray-300 font-serif mb-6">Curated scientific literature and data</p>
                <Link
                  href="/literature"
                  className="w-full py-3 border-2 border-white/30 text-white rounded-lg hover:border-white/50 hover:bg-white/10 transition-all duration-300 font-semibold backdrop-blur-sm block text-center"
                >
                  Browse Library
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 font-serif">
            © 2024 MESSAi. Advancing bioelectrochemical research through innovation.
          </p>
        </div>
      </footer>
    </div>
  )
}