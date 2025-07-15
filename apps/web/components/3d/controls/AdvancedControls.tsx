'use client'

import { useState } from 'react'
import { Button } from '@messai/ui'
import { 
  Settings, 
  Download, 
  Upload, 
  Save, 
  RotateCcw, 
  Maximize, 
  Minimize,
  Layers,
  Sliders,
  BarChart3,
  Zap,
  Atom,
  Microscope
} from 'lucide-react'

interface AdvancedControlsProps {
  isCollapsed?: boolean
  onCollapseToggle?: () => void
  selectedModel?: {
    id: string
    name: string
    type: string
    systemType?: string
    scale?: string
    anode?: string
    cathode?: string
  }
  onExportData?: () => void
  onImportData?: () => void
  onSaveConfiguration?: () => void
  onResetView?: () => void
}

export default function AdvancedControls({
  isCollapsed = false,
  onCollapseToggle,
  selectedModel,
  onExportData,
  onImportData,
  onSaveConfiguration,
  onResetView
}: AdvancedControlsProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'materials' | 'export'>('analysis')
  const [showLayers, setShowLayers] = useState<Record<string, boolean>>({
    electrodes: true,
    biofilm: true,
    electrolyte: true,
    membrane: false,
    flow: true
  })
  const [analysisMode, setAnalysisMode] = useState<'performance' | 'efficiency' | 'cost'>('performance')

  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'materials', label: 'Materials', icon: <Atom className="w-4 h-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="w-4 h-4" /> }
  ]

  const layerControls = [
    { key: 'electrodes', label: 'Electrodes', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-600' },
    { key: 'biofilm', label: 'Biofilm', icon: <Microscope className="w-4 h-4" />, color: 'text-green-600' },
    { key: 'electrolyte', label: 'Electrolyte', icon: <Layers className="w-4 h-4" />, color: 'text-blue-600' },
    { key: 'membrane', label: 'Membrane', icon: <Layers className="w-4 h-4" />, color: 'text-purple-600' },
    { key: 'flow', label: 'Flow Paths', icon: <Layers className="w-4 h-4" />, color: 'text-cyan-600' }
  ]

  const handleLayerToggle = (layer: string) => {
    setShowLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
  }

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-l border-gray-200 p-2 flex flex-col items-center space-y-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCollapseToggle}
          className="w-8 h-8 p-0"
        >
          <Maximize className="w-4 h-4" />
        </Button>
        <div className="w-full h-px bg-gray-200"></div>
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
          <BarChart3 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
          <Download className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Advanced Controls</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCollapseToggle}
            className="p-1"
          >
            <Minimize className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'analysis' | 'materials' | 'export')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'analysis' && (
          <div className="p-4 space-y-6">
            {/* Analysis Mode */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Analysis Mode</h4>
              <div className="space-y-2">
                {[
                  { key: 'performance', label: 'Performance Analysis', desc: 'Power output & efficiency' },
                  { key: 'efficiency', label: 'Energy Efficiency', desc: 'Coulombic & energy efficiency' },
                  { key: 'cost', label: 'Cost Analysis', desc: 'Material & operational costs' }
                ].map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => setAnalysisMode(mode.key as 'performance' | 'efficiency' | 'cost')}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      analysisMode === mode.key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{mode.label}</div>
                    <div className="text-sm text-gray-600">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Layer Visibility */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Layer Visibility</h4>
              <div className="space-y-2">
                {layerControls.map((layer) => (
                  <div key={layer.key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className={layer.color}>{layer.icon}</div>
                      <span className="text-sm text-gray-700">{layer.label}</span>
                    </div>
                    <button
                      onClick={() => handleLayerToggle(layer.key)}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        showLayers[layer.key] ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        showLayers[layer.key] ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* View Controls */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">View Controls</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" onClick={onResetView}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset View
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Layers className="w-4 h-4 mr-2" />
                  Cross Section
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Sliders className="w-4 h-4 mr-2" />
                  Measurements
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="p-4 space-y-6">
            {/* Material Properties */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Material Properties</h4>
              <div className="space-y-4">
                {selectedModel?.type === 'bioreactor' && (
                  <>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900 mb-2">Anode: {selectedModel.anode}</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Conductivity:</span>
                          <span>95 S/cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Biocompatibility:</span>
                          <span>90%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Porosity:</span>
                          <span>85%</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900 mb-2">Cathode: {selectedModel.cathode}</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Conductivity:</span>
                          <span>85 S/cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Catalytic Activity:</span>
                          <span>60%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Durability:</span>
                          <span>90%</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Materials
                </Button>
              </div>
            </div>

            {/* System Configuration */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">System Configuration</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">
                    Type: {selectedModel?.systemType || 'Microfluidic'}
                  </div>
                  <div className="text-sm text-blue-700">
                    Scale: {selectedModel?.scale || 'Laboratory'}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Atom className="w-4 h-4 mr-2" />
                  Customize Configuration
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="p-4 space-y-6">
            {/* Export Options */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Export Data</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" onClick={onExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Parameters
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export 3D Model
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Performance Data
                </Button>
              </div>
            </div>

            {/* Import Options */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Import Data</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" onClick={onImportData}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Configuration
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Parameters
                </Button>
              </div>
            </div>

            {/* Save Configuration */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Save Configuration</h4>
              <div className="space-y-2">
                <Button variant="primary" size="sm" className="w-full" onClick={onSaveConfiguration}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Current Setup
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save as Template
                </Button>
              </div>
            </div>

            {/* Export Formats */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Export Formats</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• JSON - Configuration data</div>
                <div>• CSV - Parameter values</div>
                <div>• STL - 3D model geometry</div>
                <div>• PDF - Analysis report</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}