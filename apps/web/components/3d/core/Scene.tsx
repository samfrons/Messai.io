'use client'

import { ReactNode, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader, Environment, ContactShadows } from '@react-three/drei'
import { Leva } from 'leva'
import Controls from './Controls'
import Lighting from './Lighting'
import ErrorBoundary from '../utils/ErrorBoundary'
import PerformanceMonitor from '../utils/PerformanceMonitor'

interface SceneProps {
  children: ReactNode
  shadows?: boolean
  environment?: boolean
  controls?: boolean
  debug?: boolean
  className?: string
  enablePerformanceMonitor?: boolean
}

export default function Scene({ 
  children, 
  shadows = true, 
  environment = true, 
  controls = true,
  debug = false,
  className = '',
  enablePerformanceMonitor = debug
}: SceneProps) {
  return (
    <ErrorBoundary>
      <div className={`relative w-full h-full ${className}`}>
        <Canvas
          shadows={shadows}
          camera={{ position: [5, 5, 5], fov: 50 }}
          gl={{ 
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          onCreated={({ gl }) => {
            // Optimize WebGL context
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            gl.shadowMap.enabled = shadows
            gl.shadowMap.type = 2 // PCF shadows
          }}
        >
          <Suspense fallback={null}>
            <Lighting />
            {controls && <Controls />}
            {environment && (
              <color attach="background" args={['#f0f8ff']} />
            )}
            {shadows && (
              <ContactShadows
                position={[0, -0.01, 0]}
                opacity={0.4}
                scale={10}
                blur={2}
                far={10}
              />
            )}
            {children}
          </Suspense>
        </Canvas>
        <Loader />
        <Leva hidden={!debug} />
        {enablePerformanceMonitor && <PerformanceMonitor />}
      </div>
    </ErrorBoundary>
  )
}