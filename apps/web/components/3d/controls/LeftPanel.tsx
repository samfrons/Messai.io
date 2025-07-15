'use client'

import { useState } from 'react'
import { Button } from '@messai/ui'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Settings, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react'
import ParameterControls from './ParameterControls'

interface LeftPanelProps {
  isCollapsed?: boolean
  onCollapseToggle?: () => void
  modelPresets: Array<{
    id: string
    name: string
    type: string
    description?: string
    systemType?: string
    scale?: string
    anode?: string
    cathode?: string
  }>
  selectedModel: {
    id: string
    name: string
    type: string
    description?: string
    systemType?: string
    scale?: string
    anode?: string
    cathode?: string
  }
  setSelectedModel: (model: {
    id: string
    name: string
    type: string
    description?: string
    systemType?: string
    scale?: string
    anode?: string
    cathode?: string
  }) => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  showBiofilm: boolean
  setShowBiofilm: (show: boolean) => void
  viewMode: 'model' | 'biofilm'
  setViewMode: (mode: 'model' | 'biofilm') => void
  parameters: Record<string, number>
  handleParameterChange: (param: string, value: number) => void
  performanceData: {
    powerOutput: number
    efficiency: number
    cost: number
  }
}

export default function LeftPanel({
  isCollapsed = false,
  onCollapseToggle,
  modelPresets,
  selectedModel,
  setSelectedModel,
  isPlaying,
  setIsPlaying,
  showBiofilm,
  setShowBiofilm,
  viewMode,
  setViewMode,
  parameters,
  handleParameterChange,
  performanceData
}: LeftPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string>('models')

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section)
  }

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 p-2 flex flex-col items-center space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCollapseToggle}
          className="w-12 h-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        
        <div className="w-full h-px bg-gray-200"></div>
        
        {/* Quick controls */}
        <div className="space-y-2 w-full">
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-8 p-0"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-8 p-0"
            onClick={() => setShowBiofilm(!showBiofilm)}
          >
            {showBiofilm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-8 p-0"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="w-full h-px bg-gray-200"></div>
        
        {/* Model indicators */}
        <div className="flex flex-col items-center space-y-2 w-full">
          {modelPresets.slice(0, 3).map((preset, index) => (
            <button
              key={preset.id}
              onClick={() => setSelectedModel(preset)}
              className={`w-12 h-8 rounded border-2 transition-all ${
                selectedModel.id === preset.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xs font-medium text-gray-700">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Model Controls</h3>
            <p className="text-sm text-gray-600">Configure and control your 3D model</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCollapseToggle}
            className="p-1"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Model Selection */}
          <div>
            <button
              onClick={() => toggleSection('models')}
              className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded"
            >
              <h4 className="font-medium text-gray-900">Model Presets</h4>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                expandedSection === 'models' ? 'rotate-90' : ''
              }`} />
            </button>
            
            {expandedSection === 'models' && (
              <div className="mt-3 space-y-2">
                {modelPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedModel(preset)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedModel.id === preset.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{preset.name}</div>
                    <div className="text-sm text-gray-600">
                      {preset.type === 'microfluidic' 
                        ? preset.description 
                        : `${preset.systemType} • ${preset.scale}`
                      }
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Controls */}
          <div>
            <button
              onClick={() => toggleSection('view')}
              className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded"
            >
              <h4 className="font-medium text-gray-900">View Mode</h4>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                expandedSection === 'view' ? 'rotate-90' : ''
              }`} />
            </button>
            
            {expandedSection === 'view' && (
              <div className="mt-3 space-y-2">
                <Button
                  variant={viewMode === 'model' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full"
                  onClick={() => setViewMode('model')}
                >
                  System Model
                </Button>
                <Button
                  variant={viewMode === 'biofilm' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full"
                  onClick={() => setViewMode('biofilm')}
                >
                  Biofilm Growth
                </Button>
              </div>
            )}
          </div>

          {/* Animation Controls */}
          <div>
            <button
              onClick={() => toggleSection('controls')}
              className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded"
            >
              <h4 className="font-medium text-gray-900">Animation Controls</h4>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                expandedSection === 'controls' ? 'rotate-90' : ''
              }`} />
            </button>
            
            {expandedSection === 'controls' && (
              <div className="mt-3 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowBiofilm(!showBiofilm)}
                >
                  {showBiofilm ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showBiofilm ? 'Hide' : 'Show'} Biofilm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset View
                </Button>
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          <div>
            <button
              onClick={() => toggleSection('performance')}
              className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded"
            >
              <h4 className="font-medium text-gray-900">Performance Metrics</h4>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                expandedSection === 'performance' ? 'rotate-90' : ''
              }`} />
            </button>
            
            {expandedSection === 'performance' && (
              <div className="mt-3 p-4 bg-green-50 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Power Output:</span>
                    <span className="font-medium">{performanceData.powerOutput} mW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Efficiency:</span>
                    <span className="font-medium">{performanceData.efficiency}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Est. Cost:</span>
                    <span className="font-medium">${performanceData.cost}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Parameter Controls */}
          <div>
            <button
              onClick={() => toggleSection('parameters')}
              className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded"
            >
              <h4 className="font-medium text-gray-900">Live Parameters</h4>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                expandedSection === 'parameters' ? 'rotate-90' : ''
              }`} />
            </button>
            
            {expandedSection === 'parameters' && (
              <div className="mt-3">
                <ParameterControls
                  onParameterChange={handleParameterChange}
                  initialValues={parameters}
                />
              </div>
            )}
          </div>

          {/* Model Info */}
          <div>
            <button
              onClick={() => toggleSection('info')}
              className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded"
            >
              <h4 className="font-medium text-gray-900">Model Information</h4>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                expandedSection === 'info' ? 'rotate-90' : ''
              }`} />
            </button>
            
            {expandedSection === 'info' && (
              <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                <div className="space-y-1 text-sm">
                  {selectedModel.type === 'microfluidic' ? (
                    <>
                      <div>
                        <span className="text-blue-700">Type:</span>{' '}
                        <span className="font-medium">Microfluidic</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Culture:</span>{' '}
                        <span className="font-medium">Algae Bioreactor</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Flow:</span>{' '}
                        <span className="font-medium">Co-laminar</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Material:</span>{' '}
                        <span className="font-medium">PDMS/Glass</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-blue-700">Type:</span>{' '}
                        <span className="font-medium">{selectedModel.systemType}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Scale:</span>{' '}
                        <span className="font-medium capitalize">{selectedModel.scale}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Anode:</span>{' '}
                        <span className="font-medium">{selectedModel.anode}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Cathode:</span>{' '}
                        <span className="font-medium">{selectedModel.cathode}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}