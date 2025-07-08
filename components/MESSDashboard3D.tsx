'use client'

import { VanillaDashboard3D } from './3d/vanilla-dashboard-3d'

interface ExperimentData {
  id: string
  name: string
  designName: string
  status: string
  lastPower: number
  parameters: {
    temperature: number
    ph: number
    substrateConcentration: number
  }
}

interface MFCDashboard3DProps {
  experiments: ExperimentData[]
  selectedExperiment?: string | null
  onExperimentSelect?: (id: string) => void
}

export default function MFCDashboard3D({ experiments, selectedExperiment, onExperimentSelect }: MFCDashboard3DProps) {
  return (
    <VanillaDashboard3D 
      experiments={experiments}
      selectedExperiment={selectedExperiment}
      onExperimentSelect={onExperimentSelect}
    />
  )
}