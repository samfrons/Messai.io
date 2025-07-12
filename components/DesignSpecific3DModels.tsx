'use client'

import dynamic from 'next/dynamic'
import { VanillaDesignModels } from './3d/vanilla-design-models'

interface Design3DModelProps {
  designType: string
  scale?: number
  showLabels?: boolean
}

export default function DesignSpecific3DModel({ designType, scale = 1, showLabels = false }: Design3DModelProps) {
  return (
    <VanillaDesignModels 
      designType={designType}
      scale={scale}
      showLabels={showLabels}
    />
  )
}

// Dynamic import of simplified version for fallback
const SimplifiedDesign3D = dynamic(() => import('./SimplifiedDesign3D'), {
  ssr: false
})

// Wrapper component for use in design cards
export function Design3DPreview({ designType }: { designType: string }) {
  return (
    <div className="w-full h-24 bg-gray-900 rounded-lg overflow-hidden">
      <VanillaDesignModels 
        designType={designType}
        scale={0.8}
        showLabels={false}
        autoRotate={true}
      />
    </div>
  )
}