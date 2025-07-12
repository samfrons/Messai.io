'use client'

// This component is now just a wrapper for vanilla Three.js implementation
import { VanillaDesignModels } from './3d/vanilla-design-models'

interface SimplifiedDesign3DProps {
  designType: string
}

export default function SimplifiedDesign3D({ designType }: SimplifiedDesign3DProps) {
  return (
    <VanillaDesignModels 
      designType={designType}
      scale={0.5}
      showLabels={false}
      autoRotate={true}
    />
  )
}