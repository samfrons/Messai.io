'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stats } from '@react-three/drei'
import { SimpleVisualization } from '@/components/SimpleVisualization'
import { FluidVisualization } from '@/components/bioreactor/FluidVisualization'
import { ElectrodeSystem } from '@/components/bioreactor/ElectrodeSystem'
import { bioreactorCatalog } from '@/lib/bioreactor-catalog'

export default function Test3DPage() {
  const testModel = bioreactorCatalog[0]
  const testParameters = {
    temperature: 30,
    ph: 7.0,
    flowRate: 10,
    mixingSpeed: 100,
    electrodeVoltage: 1.5,
    substrateConcentration: 2.0,
    showVectors: true,
    showConcentration: true,
    showBiofilm: true
  }

  return (
    <div className="w-screen h-screen bg-gray-900">
      <div className="h-full grid grid-cols-3 gap-4 p-4">
        {/* SimpleVisualization Test */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-white text-lg mb-2">SimpleVisualization</h2>
          <div className="h-[calc(100%-2rem)] relative">
            <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Suspense fallback={null}>
                <SimpleVisualization
                  bioreactorType="Test Reactor"
                  parameters={testParameters}
                />
                <OrbitControls enableDamping />
                <Environment preset="studio" />
                <gridHelper args={[10, 10, 0x444444, 0x222222]} />
              </Suspense>
              <Stats />
            </Canvas>
          </div>
        </div>

        {/* FluidVisualization Test */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-white text-lg mb-2">FluidVisualization</h2>
          <div className="h-[calc(100%-2rem)] relative">
            <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Suspense fallback={null}>
                <FluidVisualization
                  model={testModel}
                  parameters={testParameters}
                  physicsEngine={null}
                  animationSpeed={1}
                />
                <OrbitControls enableDamping />
                <Environment preset="studio" />
                <gridHelper args={[10, 10, 0x444444, 0x222222]} />
              </Suspense>
              <Stats />
            </Canvas>
          </div>
        </div>

        {/* ElectrodeSystem Test */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-white text-lg mb-2">ElectrodeSystem</h2>
          <div className="h-[calc(100%-2rem)] relative">
            <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Suspense fallback={null}>
                <ElectrodeSystem
                  model={testModel}
                  parameters={testParameters}
                  webgpuSupported={false}
                />
                <OrbitControls enableDamping />
                <Environment preset="studio" />
                <gridHelper args={[10, 10, 0x444444, 0x222222]} />
              </Suspense>
              <Stats />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  )
}