'use client'

import React, { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Float, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { BioreactorModel, getBioreactorById } from '@/lib/bioreactor-catalog'
import { AdvancedPhysicsEngine } from './AdvancedPhysicsEngine'
import { BioreactorGeometry } from './BioreactorGeometry'
import { FluidVisualization } from './FluidVisualization'
import { ElectrodeSystem } from './ElectrodeSystem'
import { PerformanceOverlay } from './PerformanceOverlay'

interface AdvancedBioreactor3DProps {
  bioreactorId: string
  parameters: BioreactorParameters
  showPhysics?: boolean
  showPerformance?: boolean
  animationSpeed?: number
  onParameterChange?: (parameters: BioreactorParameters) => void
}

interface BioreactorParameters {
  temperature: number
  ph: number
  flowRate: number
  mixingSpeed: number
  electrodeVoltage: number
  substrateConcentration: number
  [key: string]: number
}

interface WebGPUCapabilities {
  isSupported: boolean
  adapter: GPUAdapter | null
  device: GPUDevice | null
}

export default function AdvancedBioreactor3D({
  bioreactorId,
  parameters,
  showPhysics = true,
  showPerformance = true,
  animationSpeed = 1,
  onParameterChange
}: AdvancedBioreactor3DProps) {
  const [bioreactorModel, setBioreactorModel] = useState<BioreactorModel | null>(null)
  const [webgpuCapabilities, setWebgpuCapabilities] = useState<WebGPUCapabilities>({
    isSupported: false,
    adapter: null,
    device: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize WebGPU capabilities
  useEffect(() => {
    const initWebGPU = async () => {
      try {
        if (!navigator.gpu) {
          console.log('WebGPU not supported, falling back to WebGL')
          setWebgpuCapabilities({ isSupported: false, adapter: null, device: null })
          return
        }

        const adapter = await navigator.gpu.requestAdapter({
          powerPreference: 'high-performance'
        })

        if (!adapter) {
          console.log('WebGPU adapter not available, falling back to WebGL')
          setWebgpuCapabilities({ isSupported: false, adapter: null, device: null })
          return
        }

        const device = await adapter.requestDevice({
          requiredFeatures: ['timestamp-query'] as GPUFeatureName[],
          requiredLimits: {
            maxBufferSize: 1024 * 1024 * 1024, // 1GB
            maxComputeWorkgroupStorageSize: 32768
          }
        })

        setWebgpuCapabilities({
          isSupported: true,
          adapter,
          device
        })

        console.log('WebGPU initialized successfully')
      } catch (error) {
        console.error('WebGPU initialization failed:', error)
        setWebgpuCapabilities({ isSupported: false, adapter: null, device: null })
      }
    }

    initWebGPU()
  }, [])

  // Load bioreactor model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true)
        const model = getBioreactorById(bioreactorId)
        
        if (!model) {
          throw new Error(`Bioreactor model '${bioreactorId}' not found`)
        }

        setBioreactorModel(model)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bioreactor model')
        console.error('Error loading bioreactor model:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadModel()
  }, [bioreactorId])

  // Memoized renderer configuration
  const rendererConfig = useMemo(() => {
    return {
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance' as WebGLPowerPreference,
      stencil: false,
      depth: true,
      logarithmicDepthBuffer: true,
      precision: 'highp' as WebGLRenderingContextAttributes['precision']
    }
  }, [])

  // Error handling
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-red-500 p-4 text-center">
          <h3 className="text-lg font-bold mb-2">Error Loading Bioreactor</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading || !bioreactorModel) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-white p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p>Loading advanced bioreactor visualization...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [5, 3, 5], fov: 50 }}
        gl={rendererConfig}
        dpr={Math.min(window.devicePixelRatio, 2)}
        shadows
        className="w-full h-full"
      >
        {/* Advanced lighting setup */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4299e1" />
        <hemisphereLight args={['#ffffff', '#444444', 0.6]} />

        {/* Environment and atmosphere */}
        <Environment preset="studio" />
        <fog attach="fog" args={['#1a1a1a', 10, 50]} />

        {/* Main bioreactor scene */}
        <BioreactorScene
          model={bioreactorModel}
          parameters={parameters}
          webgpuCapabilities={webgpuCapabilities}
          showPhysics={showPhysics}
          showPerformance={showPerformance}
          animationSpeed={animationSpeed}
          onParameterChange={onParameterChange}
        />

        {/* Camera controls */}
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          dampingFactor={0.05}
          enableDamping
          maxPolarAngle={Math.PI / 1.5}
          minDistance={2}
          maxDistance={20}
        />
      </Canvas>

      {/* Performance metrics overlay */}
      {showPerformance && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm font-mono">
            <div className="mb-2 font-bold">{bioreactorModel.name}</div>
            <div>Power: {bioreactorModel.performance.powerDensity.value} {bioreactorModel.performance.powerDensity.unit}</div>
            <div>Efficiency: {bioreactorModel.performance.efficiency.codRemoval}% COD removal</div>
            <div>Temperature: {parameters.temperature}°C</div>
            <div>pH: {parameters.ph}</div>
            <div>WebGPU: {webgpuCapabilities.isSupported ? '✓' : '✗'}</div>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm">
          <div className="mb-2 font-bold">Controls</div>
          <div>Mouse: Rotate view</div>
          <div>Scroll: Zoom</div>
          <div>Shift+Drag: Pan</div>
        </div>
      </div>
    </div>
  )
}

// Main bioreactor scene component
function BioreactorScene({
  model,
  parameters,
  webgpuCapabilities,
  showPhysics,
  showPerformance,
  animationSpeed,
  onParameterChange
}: {
  model: BioreactorModel
  parameters: BioreactorParameters
  webgpuCapabilities: WebGPUCapabilities
  showPhysics: boolean
  showPerformance: boolean
  animationSpeed: number
  onParameterChange?: (parameters: BioreactorParameters) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const physicsEngineRef = useRef<AdvancedPhysicsEngine | null>(null)
  const { scene, gl } = useThree()

  // Initialize physics engine
  useEffect(() => {
    if (webgpuCapabilities.isSupported && webgpuCapabilities.device) {
      physicsEngineRef.current = new AdvancedPhysicsEngine(webgpuCapabilities.device)
    }

    return () => {
      if (physicsEngineRef.current) {
        physicsEngineRef.current.dispose()
        physicsEngineRef.current = null
      }
    }
  }, [webgpuCapabilities])

  // Animation loop
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Update physics simulation
      if (physicsEngineRef.current && showPhysics) {
        physicsEngineRef.current.update(delta * animationSpeed, parameters)
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Bioreactor geometry */}
      <BioreactorGeometry
        model={model}
        parameters={parameters}
        animationSpeed={animationSpeed}
      />

      {/* Electrode system */}
      <ElectrodeSystem
        model={model}
        parameters={parameters}
        webgpuSupported={webgpuCapabilities.isSupported}
      />

      {/* Fluid visualization */}
      {showPhysics && (
        <FluidVisualization
          model={model}
          parameters={parameters}
          physicsEngine={physicsEngineRef.current}
          animationSpeed={animationSpeed}
        />
      )}

      {/* Performance overlay in 3D space */}
      {showPerformance && (
        <PerformanceOverlay
          model={model}
          parameters={parameters}
          position={[0, (model.geometry.dimensions?.height || 2) + 1, 0]}
        />
      )}

      {/* Model label */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <Text
          position={[0, (model.geometry.dimensions?.height || 2) + 2, 0]}
          fontSize={0.3}
          color="#4299e1"
          anchorX="center"
          anchorY="middle"
        >
          {model.name}
        </Text>
      </Float>
    </group>
  )
}