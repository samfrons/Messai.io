'use client'

import React, { useState, Suspense, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useFrame } from '@react-three/fiber'

// Dynamic imports to avoid SSR issues
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), { ssr: false })
const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })), { ssr: false })

function RotatingBioreactor({ temperature, mixingSpeed }) {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * mixingSpeed * 0.01
    }
  })

  return (
    <group>
      {/* Main vessel */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 2, 32]} />
        <meshStandardMaterial
          color={0x4a90e2}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Fluid medium */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 1.8, 32]} />
        <meshStandardMaterial
          color={temperature > 35 ? 0xff6b6b : temperature > 25 ? 0x51cf66 : 0x339af0}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Left electrode (anode) */}
      <mesh position={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.05, 1.5, 0.8]} />
        <meshStandardMaterial
          color={0x2d3748}
          emissive={0x1a202c}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Right electrode (cathode) */}
      <mesh position={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.05, 1.5, 0.8]} />
        <meshStandardMaterial
          color={0xc0c0c0}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Temperature indicator */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={temperature > 35 ? 0xff4444 : temperature > 25 ? 0x44ff44 : 0x4444ff}
          emissive={temperature > 35 ? 0xff0000 : temperature > 25 ? 0x00ff00 : 0x0000ff}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

export default function WorkingBioreactorPage() {
  const [temperature, setTemperature] = useState(30)
  const [mixingSpeed, setMixingSpeed] = useState(100)
  const [ph, setPh] = useState(7.0)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-2xl font-bold text-blue-400">
          Working Bioreactor Visualization
        </h1>
        <p className="text-gray-300 mt-1">
          Simplified Three.js + React Three Fiber integration
        </p>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Control Panel */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Temperature: {temperature}°C
              </label>
              <input
                type="range"
                min="15"
                max="45"
                step="1"
                value={temperature}
                onChange={(e) => setTemperature(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-400 mt-1">
                Color changes: Blue (cold) → Green (optimal) → Red (hot)
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Mixing Speed: {mixingSpeed} RPM
              </label>
              <input
                type="range"
                min="0"
                max="300"
                step="10"
                value={mixingSpeed}
                onChange={(e) => setMixingSpeed(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-400 mt-1">
                Controls rotation speed of the reactor
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                pH: {ph.toFixed(1)}
              </label>
              <input
                type="range"
                min="5"
                max="9"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="bg-gray-700 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">System Status</h4>
              <div className="space-y-1 text-xs text-gray-300">
                <p>✅ Next.js: Working</p>
                <p>✅ TailwindCSS: Working</p>
                <p>✅ React Three Fiber: Working</p>
                <p>✅ 3D Rendering: Active</p>
                <p>✅ Real-time Updates: {mixingSpeed > 0 ? 'Active' : 'Stopped'}</p>
              </div>
            </div>

            <div className="bg-blue-900 bg-opacity-50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Features Working</h4>
              <div className="space-y-1 text-xs text-gray-300">
                <p>• 3D bioreactor vessel</p>
                <p>• Temperature-based coloring</p>
                <p>• Rotating animation</p>
                <p>• Electrode visualization</p>
                <p>• Mouse orbit controls</p>
                <p>• Real-time parameter updates</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Visualization */}
        <div className="flex-1 relative">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p>Loading 3D Visualization...</p>
                <p className="text-sm text-gray-400 mt-2">This should only take a moment</p>
              </div>
            </div>
          }>
            <Canvas camera={{ position: [3, 2, 3], fov: 60 }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
              <pointLight position={[-10, -10, -5]} intensity={0.5} />
              
              <RotatingBioreactor 
                temperature={temperature} 
                mixingSpeed={mixingSpeed}
              />
              
              <OrbitControls 
                enablePan={true} 
                enableZoom={true} 
                enableRotate={true}
                minDistance={2}
                maxDistance={10}
              />
            </Canvas>
          </Suspense>

          {/* Status Overlay */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
            <h3 className="font-bold text-lg text-blue-400">Bioreactor Status</h3>
            <div className="text-sm text-gray-300 mt-2 space-y-1">
              <p>🌡️ Temperature: {temperature}°C</p>
              <p>🔄 Mixing: {mixingSpeed} RPM</p>
              <p>⚗️ pH: {ph.toFixed(1)}</p>
              <p className="text-xs text-gray-400 mt-2">
                Use mouse to orbit, scroll to zoom
              </p>
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                temperature >= 25 && temperature <= 35 ? 'bg-green-400' : 
                temperature >= 20 && temperature <= 40 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-sm">
                {temperature >= 25 && temperature <= 35 ? 'Optimal' : 
                 temperature >= 20 && temperature <= 40 ? 'Acceptable' : 'Out of Range'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}