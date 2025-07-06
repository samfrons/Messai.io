'use client'

import { VanillaThreeScene } from './3d/vanilla-three-scene'

interface MFCConfig {
  electrode: {
    material: string
    surface: number
    thickness: number
  }
  microbial: {
    density: number
    species: string
    activity: number
  }
  chamber: {
    volume: number
    shape: string
    material: string
  }
}

interface MFC3DModelProps {
  config: MFCConfig
  onComponentSelect: (component: string) => void
  selectedComponent: string | null
  designType?: string
}

export default function MFC3DModel({ config, onComponentSelect, selectedComponent, designType }: MFC3DModelProps) {
  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <VanillaThreeScene 
        config={config} 
        onComponentSelect={onComponentSelect}
        selectedComponent={selectedComponent}
        designType={designType}
      />
    </div>
  )
}