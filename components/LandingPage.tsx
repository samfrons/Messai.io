'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import Link from 'next/link'
import { getDemoConfig } from '@/lib/demo-mode'
import { ExternalLink } from 'lucide-react'

// Animated Background Components
function AnimatedStars() {
  const pointsRef = useRef<THREE.Points>(null)
  const [positions] = useState(() => {
    const positions = new Float32Array(5000 * 3)
    for (let i = 0; i < 5000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return positions
  })

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.05
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00d4ff"
        size={0.002}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  )
}

function MicrobeParticles() {
  const groupRef = useRef<THREE.Group>(null)
  const [microbes] = useState(() => 
    Array.from({ length: 50 }, () => ({
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      ],
      velocity: [
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ],
      scale: Math.random() * 0.5 + 0.5
    }))
  )

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const microbe = microbes[i]
        child.position.x += microbe.velocity[0]
        child.position.y += microbe.velocity[1]
        child.position.z += microbe.velocity[2]
        
        // Brownian motion
        microbe.velocity[0] += (Math.random() - 0.5) * 0.001
        microbe.velocity[1] += (Math.random() - 0.5) * 0.001
        microbe.velocity[2] += (Math.random() - 0.5) * 0.001
        
        // Boundary wrapping
        if (Math.abs(child.position.x) > 4) microbe.velocity[0] *= -1
        if (Math.abs(child.position.y) > 4) microbe.velocity[1] *= -1
        if (Math.abs(child.position.z) > 4) microbe.velocity[2] *= -1
      })
    }
  })

  return (
    <group ref={groupRef}>
      {microbes.map((microbe, i) => (
        <mesh
          key={i}
          position={microbe.position as [number, number, number]}
          scale={microbe.scale}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function ElectronFlow() {
  const linesRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.children.forEach((line, i) => {
        const material = (line as THREE.Line).material as THREE.LineBasicMaterial
        material.opacity = Math.sin(state.clock.elapsedTime * 2 + i) * 0.5 + 0.5
      })
    }
  })

  const paths = [
    [[-2, -1, 0], [2, 1, 0]],
    [[-1, -2, 0], [1, 2, 0]],
    [[0, -1.5, -1], [0, 1.5, 1]],
  ]

  return (
    <group ref={linesRef}>
      {paths.map((path, i) => {
        const points = path.map(p => new THREE.Vector3(...p))
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        
        return (
          <line key={i}>
            <bufferGeometry attach="geometry" {...geometry} />
            <lineBasicMaterial color="#00d4ff" transparent opacity={0.8} />
          </line>
        )
      })}
    </group>
  )
}

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.1} />
        <AnimatedStars />
        <MicrobeParticles />
        <ElectronFlow />
      </Canvas>
    </div>
  )
}

// Feature Card Component
interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  animation: React.ReactNode
  cta: string
  delay: number
}

function FeatureCard({ title, description, icon, animation, cta, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 hover:border-blue-400/50 transition-all duration-300">
        {/* Animation Preview */}
        <div className="h-48 mb-6 rounded-lg overflow-hidden bg-gray-800/50">
          {animation}
        </div>
        
        {/* Content */}
        <div className="flex items-center gap-3 mb-4">
          {icon}
          <h3 className="text-xl font-serif text-white">{title}</h3>
        </div>
        
        <p className="text-gray-300 mb-6 leading-relaxed font-serif text-sm">
          {description}
        </p>
        
        <Link 
          href="/platform"
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-medium text-center block"
        >
          {cta}
        </Link>
      </div>
    </motion.div>
  )
}

// Main Landing Page Component
export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const demoConfig = getDemoConfig()

  // Feature animations (simplified for now)
  const bioreactorAnimation = (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="w-24 h-24 border-4 border-blue-400 rounded-full relative"
      >
        <div className="absolute inset-2 border-2 border-green-400 rounded-full" />
        <div className="absolute inset-4 bg-green-400 rounded-full opacity-50" />
      </motion.div>
    </div>
  )

  const electroanalyticalAnimation = (
    <div className="w-full h-full p-4">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <motion.path
          d="M10,50 Q50,20 100,50 T190,50"
          stroke="#00d4ff"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  )

  const libraryAnimation = (
    <div className="w-full h-full p-4 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.2, duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          className="h-3 bg-gradient-to-r from-blue-400 to-green-400 rounded mb-2"
          style={{ width: `${60 + Math.random() * 40}%` }}
        />
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      <div className="motion-reduce:hidden">
        <AnimatedBackground />
      </div>
      
      {/* Hero Section */}
      <motion.section 
        style={{ y }}
        className="relative z-10 min-h-screen flex items-center justify-center px-6"
      >
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
              href="/platform"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
            >
              Explore the Platform
            </Link>
            
            {demoConfig.isDemo ? (
              <a
                href={`${demoConfig.productionUrl}/auth/signup`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-lg hover:border-white/50 hover:bg-white/10 transition-all duration-300 font-semibold text-lg backdrop-blur-sm inline-flex items-center justify-center"
              >
                Create Account
                <ExternalLink className="w-5 h-5 ml-2" />
              </a>
            ) : (
              <Link
                href="/auth/signup"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-lg hover:border-white/50 hover:bg-white/10 transition-all duration-300 font-semibold text-lg backdrop-blur-sm"
              >
                Create Account
              </Link>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Vision Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-white">
                Empowering Scientific Discovery
              </h2>
              <p className="text-lg font-serif text-gray-300 mb-6 leading-relaxed">
                MESSAi bridges the gap between biological systems and technological innovation, 
                providing researchers with unprecedented tools to design, simulate, and optimize 
                microbial electrochemical systems.
              </p>
              <p className="text-lg font-serif text-gray-300 leading-relaxed">
                From university laboratories to industrial applications, our platform accelerates 
                research with AI-powered predictions, comprehensive material databases, and 
                advanced visualization capabilities.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-xl blur-2xl" />
              <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
                <Canvas camera={{ position: [0, 0, 3] }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <mesh>
                    <cylinderGeometry args={[1, 1, 2, 32]} />
                    <meshStandardMaterial color="#22c55e" transparent opacity={0.7} />
                  </mesh>
                  <ElectronFlow />
                </Canvas>
              </div>
            </div>
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
              Three Pillars of Innovation
            </h2>
            <p className="text-lg font-serif text-gray-300 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with scientific rigor to deliver 
              comprehensive tools for bioelectrochemical research.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              title="Bioreactor Design Tool"
              description="Design next-generation bioreactors with multi-fidelity modeling capabilities. Real-time parameter optimization with advanced physics simulation and comprehensive materials database."
              icon={<div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">🧬</div>}
              animation={bioreactorAnimation}
              cta="Start Designing"
              delay={0}
            />

            <FeatureCard
              title="Electroanalytical Interface"
              description="Advanced electroanalytical techniques with real-time data simulation. Multiple analytical methods including voltammetry, impedance spectroscopy, and chronoamperometry."
              icon={<div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">⚡</div>}
              animation={electroanalyticalAnimation}
              cta="Analyze Data"
              delay={0.2}
            />

            <FeatureCard
              title="Research Library"
              description="AI-enhanced research database with verified scientific literature. Collaborative research tools with AI-powered insights and comprehensive data verification."
              icon={<div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">📚</div>}
              animation={libraryAnimation}
              cta="Browse Library"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Technology Showcase */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">
              Powered by Advanced Technology
            </h2>
            <p className="text-lg font-serif text-gray-300 max-w-3xl mx-auto">
              Built on cutting-edge web technologies with scientific accuracy at its core.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: "WebGL 3D", desc: "Real-time visualization" },
              { name: "AI Predictions", desc: "Machine learning models" },
              { name: "Material Database", desc: "Comprehensive library" },
              { name: "Scientific Accuracy", desc: "Peer-reviewed data" }
            ].map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 text-center hover:border-blue-400/50 transition-all duration-300"
              >
                <h3 className="text-lg font-serif font-semibold text-white mb-2">{tech.name}</h3>
                <p className="text-sm text-gray-400 font-serif">{tech.desc}</p>
              </motion.div>
            ))}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-2xl mx-auto">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
                <h3 className="text-xl font-serif font-semibold text-white mb-4">Demo Access</h3>
                <p className="text-gray-300 font-serif mb-6">Explore all features immediately</p>
                <Link
                  href="/platform"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-semibold block text-center"
                >
                  Launch Demo
                </Link>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
                <h3 className="text-xl font-serif font-semibold text-white mb-4">Full Platform</h3>
                <p className="text-gray-300 font-serif mb-6">Personal account with data saving</p>
                {demoConfig.isDemo ? (
                  <a
                    href={`${demoConfig.productionUrl}/auth/signup`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 border-2 border-white/30 text-white rounded-lg hover:border-white/50 hover:bg-white/10 transition-all duration-300 font-semibold backdrop-blur-sm inline-flex items-center justify-center"
                  >
                    Create Account
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                ) : (
                  <Link
                    href="/auth/signup"
                    className="w-full py-3 border-2 border-white/30 text-white rounded-lg hover:border-white/50 hover:bg-white/10 transition-all duration-300 font-semibold backdrop-blur-sm block text-center"
                  >
                    Create Account
                  </Link>
                )}
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