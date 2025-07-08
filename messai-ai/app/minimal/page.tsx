'use client'

import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamic imports to avoid SSR issues
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), { ssr: false })
const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })), { ssr: false })

function BasicBioreactor() {
  return (
    <group>
      {/* Main vessel */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 2, 32]} />
        <meshPhysicalMaterial
          color={0x4a90e2}
          transparent
          opacity={0.3}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Electrodes */}
      <mesh position={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.05, 1.5, 0.8]} />
        <meshStandardMaterial color={0x2d3748} />
      </mesh>
      
      <mesh position={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.05, 1.5, 0.8]} />
        <meshStandardMaterial color={0xc0c0c0} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

export default function MinimalBioreactorPage() {
  const [temperature, setTemperature] = useState(30)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-2xl font-bold text-blue-400">
          Minimal Bioreactor Test
        </h1>
        <p className="text-gray-300 mt-1">
          Testing basic Three.js + Next.js integration
        </p>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Control Panel */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4">
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
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>✅ Next.js: Working</p>
            <p>✅ TailwindCSS: Working</p>
            <p>⏳ Three.js: Testing...</p>
          </div>
        </div>

        {/* 3D Visualization */}
        <div className="flex-1 relative">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p>Loading 3D Scene...</p>
              </div>
            </div>
          }>
            <Canvas camera={{ position: [3, 2, 3], fov: 60 }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <BasicBioreactor />
              <OrbitControls enablePan enableZoom enableRotate />
            </Canvas>
          </Suspense>

          {/* Status */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
            <h3 className="font-bold text-lg text-blue-400">Status</h3>
            <p className="text-sm text-gray-300">Temperature: {temperature}°C</p>
            <p className="text-xs text-gray-400 mt-2">If you see a 3D cylinder, Three.js is working!</p>
          </div>
        </div>
      </div>
    </div>
  )
}