'use client'

import { useControls } from 'leva'

export default function Lighting() {
  const {
    ambientIntensity,
    directionalIntensity,
    directionalPosition,
    spotlightIntensity,
    spotlightPosition,
    spotlightAngle,
  } = useControls('Lighting', {
    ambientIntensity: { value: 0.5, min: 0, max: 2, step: 0.1 },
    directionalIntensity: { value: 1, min: 0, max: 3, step: 0.1 },
    directionalPosition: { value: [10, 10, 5], step: 0.5 },
    spotlightIntensity: { value: 0.8, min: 0, max: 3, step: 0.1 },
    spotlightPosition: { value: [-5, 10, 0], step: 0.5 },
    spotlightAngle: { value: 0.5, min: 0, max: Math.PI / 2, step: 0.01 },
  })

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={directionalPosition}
        intensity={directionalIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <spotLight
        position={spotlightPosition}
        intensity={spotlightIntensity}
        angle={spotlightAngle}
        penumbra={0.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight intensity={0.3} groundColor="#080820" />
    </>
  )
}