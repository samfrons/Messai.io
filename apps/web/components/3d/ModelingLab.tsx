'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@messai/ui'
import { Play, Pause, RotateCcw, Eye, EyeOff, Settings } from 'lucide-react'
import LeftPanel from './controls/LeftPanel'
import AdvancedControls from './controls/AdvancedControls'
import PerformanceDashboard from './controls/PerformanceDashboard'

// Dynamic imports to avoid SSR issues
const Scene = dynamic(() => import('./core/Scene'), { ssr: false })
const BioreactorModel = dynamic(() => import('./bioreactor/BioreactorModel'), { ssr: false })
const BiofilmSimulation = dynamic(() => import('./biofilm/BiofilmSimulation'), { ssr: false })
const AlgaeBioreactorFuelCell = dynamic(() => import('./microfluidic/AlgaeBioreactorFuelCell'), { ssr: false })

const modelPresets = [
  {
    id: 'microfluidic-algae',
    name: 'Microfluidic Algae Cell',
    type: 'microfluidic',
    description: 'High-precision algae bioreactor with Caladan Bio aesthetic',
  },
  {
    id: 'single-mfc',
    name: 'Single Chamber MFC',
    type: 'bioreactor',
    systemType: 'MFC' as const,
    scale: 'laboratory' as const,
    anode: 'carbonCloth',
    cathode: 'stainlessSteel',
  },
  {
    id: 'dual-mec',
    name: 'Dual Chamber MEC',
    type: 'bioreactor',
    systemType: 'MEC' as const,
    scale: 'pilot' as const,
    anode: 'carbonFelt',
    cathode: 'platinum',
  },
  {
    id: 'triple-mdc',
    name: 'Triple Chamber MDC',
    type: 'bioreactor',
    systemType: 'MDC' as const,
    scale: 'laboratory' as const,
    anode: 'grapheneOxide',
    cathode: 'carbonCloth',
  },
]

export default function ModelingLab() {
  const [selectedModel, setSelectedModel] = useState(modelPresets[0])
  const [isPlaying, setIsPlaying] = useState(true)
  const [showBiofilm, setShowBiofilm] = useState(false)
  const [viewMode, setViewMode] = useState<'model' | 'biofilm'>('model')
  const [parameters, setParameters] = useState({
    temperature: 25,
    pH: 7.0,
    flowRate: 1.0,
    voltage: 0.5,
    current: 0.25,
    conductivity: 1000,
    biomass: 0.7
  })
  const [performanceData, setPerformanceData] = useState({
    powerOutput: 45.2,
    efficiency: 42.8,
    cost: 125.50,
    voltage: 0.5,
    current: 0.25,
    temperature: 25,
    pH: 7.0,
    timestamp: Date.now()
  })
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  const handleParameterChange = (param: string, value: number) => {
    setParameters(prev => ({ ...prev, [param]: value }))
  }

  const handlePerformanceUpdate = (data: { powerOutput: number; efficiency: number; cost: number }) => {
    setPerformanceData(prev => ({ ...prev, ...data }))
  }

  const handleExportData = () => {
    const data = {
      model: selectedModel,
      parameters,
      performanceData,
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `messai-model-${selectedModel.id}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            if (data.model) setSelectedModel(data.model)
            if (data.parameters) setParameters(data.parameters)
            if (data.performanceData) setPerformanceData(data.performanceData)
          } catch (error) {
            console.error('Error importing data:', error)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleSaveConfiguration = () => {
    // This would typically save to a backend
    console.log('Saving configuration:', { selectedModel, parameters, performanceData })
  }

  const handleResetView = () => {
    // This would reset the 3D camera view
    console.log('Resetting view')
  }

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <LeftPanel
        isCollapsed={leftPanelCollapsed}
        onCollapseToggle={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
        modelPresets={modelPresets}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        showBiofilm={showBiofilm}
        setShowBiofilm={setShowBiofilm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        parameters={parameters}
        handleParameterChange={handleParameterChange}
        performanceData={performanceData}
      />

      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading 3D visualization...</p>
              </div>
            </div>
          }
        >
          <Scene controls environment shadows debug>
            {viewMode === 'model' && selectedModel.type === 'microfluidic' && (
              <AlgaeBioreactorFuelCell
                scale={1.5}
                showFlow={isPlaying}
                showAlgae={showBiofilm}
                animate={isPlaying}
              />
            )}
            
            {viewMode === 'model' && selectedModel.type === 'bioreactor' && (
              <BioreactorModel
                systemType={selectedModel.systemType}
                scale={selectedModel.scale}
                anodeMaterial={selectedModel.anode}
                cathodeMaterial={selectedModel.cathode}
                onPerformanceUpdate={handlePerformanceUpdate}
              />
            )}
            
            {viewMode === 'biofilm' && (
              <BiofilmSimulation
                surfaceWidth={2}
                surfaceHeight={1}
                thickness={0.1}
                growthRate={isPlaying ? 0.2 : 0}
                showGrowthStages
              />
            )}
          </Scene>
        </Suspense>
        
        {/* Overlay UI */}
        <div className="absolute top-4 left-4">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <div className="text-sm text-gray-600">
              View: <span className="font-medium capitalize">{viewMode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col">
        <AdvancedControls
          isCollapsed={rightPanelCollapsed}
          onCollapseToggle={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          selectedModel={selectedModel}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onSaveConfiguration={handleSaveConfiguration}
          onResetView={handleResetView}
        />
        
        {!rightPanelCollapsed && (
          <div className="w-80 bg-white border-l border-gray-200 border-t p-4 overflow-y-auto">
            <PerformanceDashboard
              performanceData={performanceData}
              systemType={selectedModel.systemType}
            />
          </div>
        )}
      </div>
    </div>
  )
}