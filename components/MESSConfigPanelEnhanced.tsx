'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  Droplets, 
  Settings, 
  Info,
  ChevronDown,
  ChevronRight,
  Plus,
  AlertCircle
} from 'lucide-react'

// Extended interfaces for custom materials
interface CustomElectrodeMaterial {
  name: string
  cost: number
  efficiency: number
  description?: string
}

interface CustomMicrobialSpecies {
  name: string
  efficiency: number
  optimalPH?: [number, number]
  optimalTemp?: number
}

interface EnhancedMESSConfig {
  electrode: {
    material: string
    surface: number
    thickness: number
    isCustom?: boolean
    customMaterial?: CustomElectrodeMaterial
  }
  microbial: {
    density: number
    species: string
    activity: number
    isCustom?: boolean
    customSpecies?: CustomMicrobialSpecies
  }
  chamber: {
    volume: number
    shape: string
    material: string
  }
}

interface MESSConfigPanelEnhancedProps {
  config: EnhancedMESSConfig
  selectedComponent: string | null
  onConfigChange: (component: keyof EnhancedMESSConfig, field: string, value: any) => void
  onCompatibilityWarning?: (warning: string) => void
}

// Compatibility matrix for warnings
const compatibilityMatrix: Record<string, Record<string, { compatible: boolean; warning?: string }>> = {
  'graphene-oxide': {
    'geobacter': { compatible: true },
    'shewanella': { compatible: true },
    'mixed-culture': { compatible: true },
    'custom': { compatible: true, warning: 'Custom species compatibility unverified' }
  },
  'ti3c2tx': {
    'geobacter': { compatible: true },
    'shewanella': { compatible: false, warning: 'MXene may inhibit Shewanella biofilm formation' },
    'mixed-culture': { compatible: true },
    'custom': { compatible: true, warning: 'Test MXene toxicity with custom species' }
  },
  'custom': {
    'geobacter': { compatible: true, warning: 'Verify material biocompatibility' },
    'shewanella': { compatible: true, warning: 'Verify material biocompatibility' },
    'mixed-culture': { compatible: true, warning: 'Test with mixed cultures first' },
    'custom': { compatible: true, warning: 'Both material and species unverified' }
  }
}

function ElectrodeConfig({ 
  config, 
  onConfigChange,
  onCompatibilityCheck
}: { 
  config: EnhancedMESSConfig, 
  onConfigChange: (field: string, value: any) => void,
  onCompatibilityCheck: (material: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customMaterial, setCustomMaterial] = useState<CustomElectrodeMaterial>({
    name: '',
    cost: 0,
    efficiency: 50,
    description: ''
  })

  const materials = [
    // Traditional Materials
    { value: 'carbon-cloth', label: 'Carbon Cloth', cost: '$5', efficiency: 85, category: 'Traditional', conductivity: 'High' },
    { value: 'graphite', label: 'Graphite Rod', cost: '$2', efficiency: 70, category: 'Traditional', conductivity: 'Medium' },
    { value: 'stainless-steel', label: 'Stainless Steel', cost: '$8', efficiency: 60, category: 'Traditional', conductivity: 'Medium' },
    
    // Graphene-based Materials
    { value: 'graphene-oxide', label: 'Graphene Oxide (GO)', cost: '$45', efficiency: 95, category: 'Graphene', conductivity: 'Very High' },
    { value: 'reduced-graphene-oxide', label: 'Reduced Graphene Oxide (rGO)', cost: '$65', efficiency: 98, category: 'Graphene', conductivity: 'Excellent' },
    { value: 'graphene-foam', label: 'Graphene Foam', cost: '$120', efficiency: 97, category: 'Graphene', conductivity: 'Excellent' },
    { value: 'graphene-aerogel', label: 'Graphene Aerogel', cost: '$200', efficiency: 99, category: 'Graphene', conductivity: 'Outstanding' },
    
    // MXene Materials  
    { value: 'ti3c2tx', label: 'Ti₃C₂Tₓ MXene', cost: '$150', efficiency: 94, category: 'MXene', conductivity: 'Excellent' },
    { value: 'ti2ctx', label: 'Ti₂CTₓ MXene', cost: '$130', efficiency: 91, category: 'MXene', conductivity: 'Very High' },
    
    // Custom option
    { value: 'custom', label: 'Custom Material...', cost: 'Variable', efficiency: 0, category: 'Custom', conductivity: 'Variable' }
  ]

  const handleMaterialChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomForm(true)
      onConfigChange('isCustom', true)
    } else {
      setShowCustomForm(false)
      onConfigChange('isCustom', false)
      onConfigChange('material', value)
      onCompatibilityCheck(value)
    }
  }

  const handleSaveCustomMaterial = () => {
    if (customMaterial.name && customMaterial.cost > 0 && customMaterial.efficiency >= 0 && customMaterial.efficiency <= 100) {
      onConfigChange('material', 'custom')
      onConfigChange('customMaterial', customMaterial)
      onConfigChange('isCustom', true)
      onCompatibilityCheck('custom')
      setShowCustomForm(false)
    }
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConductivityColor = (conductivity: string) => {
    const colors: Record<string, string> = {
      'Outstanding': 'text-purple-600',
      'Excellent': 'text-blue-600',
      'Very High': 'text-green-600',
      'High': 'text-yellow-600',
      'Medium': 'text-orange-600',
      'Variable': 'text-gray-600'
    }
    return colors[conductivity] || 'text-gray-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="font-medium text-gray-900">Electrode Configuration</span>
        </div>
        {expanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material
                </label>
                <select
                  value={config.electrode.material}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {materials.map((mat) => (
                    <option key={mat.value} value={mat.value}>
                      {mat.label} - {mat.cost} ({mat.efficiency}% efficiency)
                    </option>
                  ))}
                </select>
                
                {/* Material info display */}
                {!showCustomForm && config.electrode.material && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Efficiency:</span>
                      <span className={getEfficiencyColor(
                        materials.find(m => m.value === config.electrode.material)?.efficiency || 0
                      )}>
                        {materials.find(m => m.value === config.electrode.material)?.efficiency || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-600">Conductivity:</span>
                      <span className={getConductivityColor(
                        materials.find(m => m.value === config.electrode.material)?.conductivity || 'Unknown'
                      )}>
                        {materials.find(m => m.value === config.electrode.material)?.conductivity || 'Unknown'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Material Form */}
              <AnimatePresence>
                {showCustomForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-blue-50 rounded-md space-y-3"
                  >
                    <h4 className="font-medium text-sm text-gray-900">Define Custom Material</h4>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Material Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customMaterial.name}
                        onChange={(e) => setCustomMaterial({ ...customMaterial, name: e.target.value })}
                        placeholder="e.g., Modified Carbon Felt"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Cost per cm² ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={customMaterial.cost}
                          onChange={(e) => setCustomMaterial({ ...customMaterial, cost: parseFloat(e.target.value) || 0 })}
                          min="0.01"
                          max="1000"
                          step="0.01"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Efficiency (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={customMaterial.efficiency}
                          onChange={(e) => setCustomMaterial({ ...customMaterial, efficiency: parseFloat(e.target.value) || 0 })}
                          min="0"
                          max="100"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        value={customMaterial.description}
                        onChange={(e) => setCustomMaterial({ ...customMaterial, description: e.target.value })}
                        placeholder="Brief description of material properties..."
                        rows={2}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setShowCustomForm(false)
                          onConfigChange('material', materials[0].value)
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveCustomMaterial}
                        disabled={!customMaterial.name || customMaterial.cost <= 0}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save Material
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Surface Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surface Area (cm²)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="1000"
                    value={config.electrode.surface}
                    onChange={(e) => onConfigChange('surface', Number(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={config.electrode.surface}
                    onChange={(e) => onConfigChange('surface', Number(e.target.value))}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Thickness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thickness (mm)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={config.electrode.thickness}
                    onChange={(e) => onConfigChange('thickness', Number(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={config.electrode.thickness}
                    onChange={(e) => onConfigChange('thickness', Number(e.target.value))}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MicrobialConfig({ 
  config, 
  onConfigChange,
  onCompatibilityCheck
}: { 
  config: EnhancedMESSConfig, 
  onConfigChange: (field: string, value: any) => void,
  onCompatibilityCheck: (species: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customSpecies, setCustomSpecies] = useState<CustomMicrobialSpecies>({
    name: '',
    efficiency: 50,
    optimalPH: [6.5, 7.5],
    optimalTemp: 30
  })

  const species = [
    { 
      value: 'geobacter', 
      label: 'Geobacter sulfurreducens', 
      power: 'High', 
      stability: 'Excellent',
      description: 'Efficient direct electron transfer via nanowires'
    },
    { 
      value: 'shewanella', 
      label: 'Shewanella oneidensis', 
      power: 'Medium', 
      stability: 'Good',
      description: 'Versatile with multiple electron transfer pathways'
    },
    { 
      value: 'mixed-culture', 
      label: 'Mixed Anaerobic Culture', 
      power: 'Variable', 
      stability: 'High',
      description: 'Robust consortium from wastewater'
    },
    { 
      value: 'custom', 
      label: 'Custom Species...', 
      power: 'Variable', 
      stability: 'Unknown',
      description: 'Define your own microbial species'
    }
  ]

  const handleSpeciesChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomForm(true)
      onConfigChange('isCustom', true)
    } else {
      setShowCustomForm(false)
      onConfigChange('isCustom', false)
      onConfigChange('species', value)
      onCompatibilityCheck(value)
    }
  }

  const handleSaveCustomSpecies = () => {
    if (customSpecies.name && customSpecies.efficiency >= 0 && customSpecies.efficiency <= 100) {
      onConfigChange('species', 'custom')
      onConfigChange('customSpecies', customSpecies)
      onConfigChange('isCustom', true)
      onCompatibilityCheck('custom')
      setShowCustomForm(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Droplets className="w-5 h-5 text-green-500" />
          <span className="font-medium text-gray-900">Microbial Configuration</span>
        </div>
        {expanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species
                </label>
                <select
                  value={config.microbial.species}
                  onChange={(e) => handleSpeciesChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {species.map((sp) => (
                    <option key={sp.value} value={sp.value}>
                      {sp.label}
                    </option>
                  ))}
                </select>
                
                {/* Species info */}
                {!showCustomForm && config.microbial.species && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <p className="text-gray-600">
                      {species.find(s => s.value === config.microbial.species)?.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Custom Species Form */}
              <AnimatePresence>
                {showCustomForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-green-50 rounded-md space-y-3"
                  >
                    <h4 className="font-medium text-sm text-gray-900">Define Custom Species</h4>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Species Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customSpecies.name}
                        onChange={(e) => setCustomSpecies({ ...customSpecies, name: e.target.value })}
                        placeholder="e.g., Rhodopseudomonas palustris"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Efficiency Factor (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={customSpecies.efficiency}
                        onChange={(e) => setCustomSpecies({ ...customSpecies, efficiency: parseFloat(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Optimal pH Range
                        </label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={customSpecies.optimalPH?.[0] || 6.5}
                            onChange={(e) => setCustomSpecies({ 
                              ...customSpecies, 
                              optimalPH: [parseFloat(e.target.value) || 6.5, customSpecies.optimalPH?.[1] || 7.5] 
                            })}
                            min="4"
                            max="11"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="number"
                            value={customSpecies.optimalPH?.[1] || 7.5}
                            onChange={(e) => setCustomSpecies({ 
                              ...customSpecies, 
                              optimalPH: [customSpecies.optimalPH?.[0] || 6.5, parseFloat(e.target.value) || 7.5] 
                            })}
                            min="4"
                            max="11"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Optimal Temp (°C)
                        </label>
                        <input
                          type="number"
                          value={customSpecies.optimalTemp}
                          onChange={(e) => setCustomSpecies({ ...customSpecies, optimalTemp: parseFloat(e.target.value) || 30 })}
                          min="4"
                          max="50"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setShowCustomForm(false)
                          onConfigChange('species', species[0].value)
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveCustomSpecies}
                        disabled={!customSpecies.name}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save Species
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cell Density */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cell Density (× 10⁹ cells/mL)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={config.microbial.density}
                    onChange={(e) => onConfigChange('density', Number(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={config.microbial.density}
                    onChange={(e) => onConfigChange('density', Number(e.target.value))}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Level (%)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={config.microbial.activity}
                    onChange={(e) => onConfigChange('activity', Number(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={config.microbial.activity}
                    onChange={(e) => onConfigChange('activity', Number(e.target.value))}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChamberConfig({ config, onConfigChange }: { 
  config: EnhancedMESSConfig, 
  onConfigChange: (field: string, value: any) => void 
}) {
  const [expanded, setExpanded] = useState(true)

  const shapes = [
    { value: 'rectangular', label: 'Rectangular', efficiency: 85 },
    { value: 'cylindrical', label: 'Cylindrical', efficiency: 92 },
  ]

  const materials = [
    { value: 'acrylic', label: 'Acrylic', cost: '$15' },
    { value: 'glass', label: 'Glass', cost: '$25' },
    { value: 'pvc', label: 'PVC', cost: '$8' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-gray-900">Chamber Configuration</span>
        </div>
        {expanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-4 border-t border-gray-100">
              {/* Shape */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shape
                </label>
                <select
                  value={config.chamber.shape}
                  onChange={(e) => onConfigChange('shape', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {shapes.map((shape) => (
                    <option key={shape.value} value={shape.value}>
                      {shape.label} ({shape.efficiency}% efficiency)
                    </option>
                  ))}
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material
                </label>
                <select
                  value={config.chamber.material}
                  onChange={(e) => onConfigChange('material', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {materials.map((mat) => (
                    <option key={mat.value} value={mat.value}>
                      {mat.label} - {mat.cost}
                    </option>
                  ))}
                </select>
              </div>

              {/* Volume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume (L)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={config.chamber.volume}
                    onChange={(e) => onConfigChange('volume', Number(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={config.chamber.volume}
                    onChange={(e) => onConfigChange('volume', Number(e.target.value))}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MESSConfigPanelEnhanced({ 
  config, 
  selectedComponent, 
  onConfigChange,
  onCompatibilityWarning
}: MESSConfigPanelEnhancedProps) {
  // Check compatibility between electrode and microbe
  const checkCompatibility = () => {
    const material = config.electrode.isCustom ? 'custom' : config.electrode.material
    const species = config.microbial.isCustom ? 'custom' : config.microbial.species
    
    const compatibility = compatibilityMatrix[material]?.[species]
    if (compatibility?.warning && onCompatibilityWarning) {
      onCompatibilityWarning(compatibility.warning)
    }
  }

  const handleElectrodeChange = (field: string, value: any) => {
    onConfigChange('electrode', field, value)
    if (field === 'material' || field === 'isCustom') {
      checkCompatibility()
    }
  }

  const handleMicrobialChange = (field: string, value: any) => {
    onConfigChange('microbial', field, value)
    if (field === 'species' || field === 'isCustom') {
      checkCompatibility()
    }
  }

  const handleChamberChange = (field: string, value: any) => {
    onConfigChange('chamber', field, value)
  }

  return (
    <div className="space-y-4">
      {/* Compatibility Warning */}
      {compatibilityMatrix[config.electrode.material]?.[config.microbial.species]?.warning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Compatibility Notice</p>
            <p>{compatibilityMatrix[config.electrode.material]?.[config.microbial.species]?.warning}</p>
          </div>
        </div>
      )}

      <ElectrodeConfig 
        config={config} 
        onConfigChange={handleElectrodeChange}
        onCompatibilityCheck={() => checkCompatibility()}
      />
      
      <MicrobialConfig 
        config={config} 
        onConfigChange={handleMicrobialChange}
        onCompatibilityCheck={() => checkCompatibility()}
      />
      
      <ChamberConfig 
        config={config} 
        onConfigChange={handleChamberChange}
      />
    </div>
  )
}