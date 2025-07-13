'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  Droplets, 
  Settings, 
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface MESSConfig {
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

interface MESSConfigPanelProps {
  config: MESSConfig
  selectedComponent: string | null
  onConfigChange: (component: keyof MESSConfig, field: string, value: any) => void
}

function ElectrodeConfig({ config, onConfigChange }: { 
  config: MESSConfig, 
  onConfigChange: (field: string, value: any) => void 
}) {
  const [expanded, setExpanded] = useState(true)

  const materials = [
    // Traditional Materials
    { value: 'carbon-cloth', label: 'Carbon Cloth', cost: '$5', efficiency: 85, category: 'Traditional', conductivity: 'High' },
    { value: 'graphite', label: 'Graphite Rod', cost: '$2', efficiency: 70, category: 'Traditional', conductivity: 'Medium' },
    { value: 'stainless-steel', label: 'Stainless Steel', cost: '$8', efficiency: 60, category: 'Traditional', conductivity: 'Medium' },
    
    // Graphene-based Materials
    { value: 'graphene-oxide', label: 'Graphene Oxide (GO)', cost: '$45', efficiency: 95, category: 'Graphene', conductivity: 'Very High' },
    { value: 'reduced-graphene-oxide', label: 'Reduced Graphene Oxide (rGO)', cost: '$65', efficiency: 98, category: 'Graphene', conductivity: 'Excellent' },
    { value: 'graphene-carbon-cloth', label: 'Graphene/Carbon Cloth Composite', cost: '$35', efficiency: 92, category: 'Graphene', conductivity: 'Very High' },
    { value: 'graphene-foam', label: 'Graphene Foam', cost: '$120', efficiency: 97, category: 'Graphene', conductivity: 'Excellent' },
    { value: 'graphene-aerogel', label: 'Graphene Aerogel', cost: '$200', efficiency: 99, category: 'Graphene', conductivity: 'Outstanding' },
    
    // Carbon Nanotube Materials
    { value: 'swcnt', label: 'Single-Walled CNT (SWCNT)', cost: '$180', efficiency: 96, category: 'CNT', conductivity: 'Excellent' },
    { value: 'mwcnt', label: 'Multi-Walled CNT (MWCNT)', cost: '$95', efficiency: 93, category: 'CNT', conductivity: 'Very High' },
    { value: 'cnt-carbon-cloth', label: 'CNT/Carbon Cloth Composite', cost: '$55', efficiency: 90, category: 'CNT', conductivity: 'High' },
    { value: 'cnt-graphene', label: 'CNT/Graphene Hybrid', cost: '$220', efficiency: 98, category: 'CNT', conductivity: 'Outstanding' },
    { value: 'cnt-paper', label: 'CNT Paper Electrode', cost: '$85', efficiency: 89, category: 'CNT', conductivity: 'High' },
    
    // MXene Materials  
    { value: 'ti3c2tx', label: 'Ti₃C₂Tₓ MXene', cost: '$150', efficiency: 94, category: 'MXene', conductivity: 'Excellent' },
    { value: 'ti2ctx', label: 'Ti₂CTₓ MXene', cost: '$130', efficiency: 91, category: 'MXene', conductivity: 'Very High' },
    { value: 'mxene-carbon-cloth', label: 'MXene/Carbon Cloth Composite', cost: '$75', efficiency: 88, category: 'MXene', conductivity: 'High' },
    { value: 'mxene-graphene', label: 'MXene/Graphene Composite', cost: '$185', efficiency: 96, category: 'MXene', conductivity: 'Excellent' },
    { value: 'nb2ctx', label: 'Nb₂CTₓ MXene', cost: '$175', efficiency: 93, category: 'MXene', conductivity: 'Very High' },
    { value: 'v2ctx', label: 'V₂CTₓ MXene', cost: '$165', efficiency: 92, category: 'MXene', conductivity: 'Very High' },
    
    // Upcycled Materials
    { value: 'iphone-cord-copper', label: 'iPhone Cord Copper (Raw)', cost: '$0.50', efficiency: 65, category: 'Upcycled', conductivity: 'Medium', pretreatment: 'none' },
    { value: 'iphone-cord-copper-etched', label: 'iPhone Cord Copper (Acid Etched)', cost: '$1.20', efficiency: 78, category: 'Upcycled', conductivity: 'High', pretreatment: 'acid-etch' },
    { value: 'iphone-cord-copper-anodized', label: 'iPhone Cord Copper (Anodized)', cost: '$2.50', efficiency: 82, category: 'Upcycled', conductivity: 'High', pretreatment: 'anodization' },
    { value: 'reclaimed-copper-wire', label: 'Reclaimed Copper Wire (Raw)', cost: '$0.30', efficiency: 60, category: 'Upcycled', conductivity: 'Medium', pretreatment: 'none' },
    { value: 'reclaimed-copper-oxidized', label: 'Reclaimed Copper (Controlled Oxidation)', cost: '$1.80', efficiency: 75, category: 'Upcycled', conductivity: 'High', pretreatment: 'oxidation' },
    { value: 'upcycled-copper-mesh', label: 'Upcycled Copper Mesh (Surface Enhanced)', cost: '$3.20', efficiency: 85, category: 'Upcycled', conductivity: 'Very High', pretreatment: 'surface-enhancement' },
    { value: 'cable-core-composite', label: 'Multi-Cable Core Composite', cost: '$1.00', efficiency: 70, category: 'Upcycled', conductivity: 'Medium-High', pretreatment: 'composite-weaving' },
    { value: 'electroplated-reclaimed', label: 'Electroplated Reclaimed Metal', cost: '$4.50', efficiency: 88, category: 'Upcycled', conductivity: 'Excellent', pretreatment: 'electroplating' }
  ]

  const getMaterialDescription = (materialValue: string) => {
    const descriptions: Record<string, string> = {
      'graphene-oxide': 'Oxygen-functionalized graphene with excellent biocompatibility and electron transfer',
      'reduced-graphene-oxide': 'Chemically reduced GO with restored conductivity and enhanced power density',
      'graphene-carbon-cloth': 'Hybrid electrode combining graphene conductivity with carbon cloth flexibility',
      'graphene-foam': '3D porous graphene structure with high surface area and excellent mass transport',
      'graphene-aerogel': 'Ultra-lightweight 3D graphene network with exceptional electron transfer rates',
      'swcnt': 'High-purity single-walled nanotubes with outstanding electrical conductivity',
      'mwcnt': 'Multi-layered carbon nanotubes offering good conductivity at lower cost',
      'cnt-carbon-cloth': 'CNT-modified carbon cloth with enhanced biofilm attachment',
      'cnt-graphene': 'Synergistic combination of CNT and graphene for maximum performance',
      'cnt-paper': 'Flexible CNT-based paper electrode with good mechanical properties',
      'ti3c2tx': 'Titanium carbide MXene with metallic conductivity and hydrophilic surface',
      'ti2ctx': 'Ti₂C MXene with excellent electrochemical properties and stability',
      'mxene-carbon-cloth': 'MXene-coated carbon cloth combining conductivity with mechanical strength',
      'mxene-graphene': 'MXene/graphene composite with enhanced electron transfer kinetics',
      'nb2ctx': 'Niobium carbide MXene with superior conductivity and corrosion resistance',
      'v2ctx': 'Vanadium carbide MXene offering high conductivity and electrochemical stability',
      'iphone-cord-copper': 'Raw copper recovered from discarded iPhone charging cables - sustainable but limited performance',
      'iphone-cord-copper-etched': 'Acid-etched iPhone copper with increased surface area through controlled corrosion',
      'iphone-cord-copper-anodized': 'Anodized iPhone copper with protective oxide layer for enhanced durability',
      'reclaimed-copper-wire': 'Copper wire salvaged from electronic waste - cost-effective circular economy solution',
      'reclaimed-copper-oxidized': 'Controlled oxidation creates beneficial copper oxide surface for improved biocompatibility',
      'upcycled-copper-mesh': 'Surface-enhanced copper mesh from cable assemblies with maximized active area',
      'cable-core-composite': 'Woven composite of multiple cable cores creating hybrid conductive network',
      'electroplated-reclaimed': 'Reclaimed metal enhanced with thin electroplated coating for optimal performance'
    }
    return descriptions[materialValue] || ''
  }

  const getPretreatmentDescription = (pretreatment: string) => {
    const pretreatments: Record<string, string> = {
      'acid-etch': 'Acid etching to increase surface area and remove oxidation',
      'anodization': 'Electrochemical oxidation for corrosion resistance',
      'oxidation': 'Controlled thermal oxidation for beneficial surface properties',
      'surface-enhancement': 'Mechanical and chemical surface roughening',
      'composite-weaving': 'Strategic arrangement of multiple conductor types',
      'electroplating': 'Thin metal coating for enhanced conductivity and durability'
    }
    return pretreatments[pretreatment] || pretreatment
  }

  const getSurfaceAreaNote = (material: string) => {
    if (!material) return ''
    if (material.includes('aerogel') || material.includes('foam')) return '(Ultra-high surface area)'
    if (material.includes('graphene') || material.includes('cnt')) return '(High effective area)'
    if (material.includes('mxene')) return '(Excellent surface utilization)'
    if (material.includes('mesh') || material.includes('etched')) return '(Enhanced surface area)'
    if (material.includes('upcycled') || material.includes('reclaimed')) return '(Variable surface area)'
    return ''
  }
  
  const getThicknessNote = (material: string) => {
    if (!material) return ''
    if (material.includes('aerogel')) return '(Ultra-thin possible)'
    if (material.includes('mxene')) return '(Atomic-scale layers)'
    if (material.includes('graphene')) return '(Few-layer structure)'
    return ''
  }
  
  const getElectronTransferRate = (material: string) => {
    if (!material) return 'Enhanced'
    if (material.includes('aerogel') || material === 'cnt-graphene') return 'Exceptional (>10⁴ s⁻¹)'
    if (material.includes('graphene') || material.includes('swcnt')) return 'Very High (>10³ s⁻¹)'
    if (material.includes('mxene') || material.includes('mwcnt')) return 'High (>10² s⁻¹)'
    return 'Enhanced'
  }
  
  const getBiocompatibility = (material: string) => {
    if (!material) return 'Moderate'
    if (material === 'graphene-oxide' || material.includes('mxene')) return 'Excellent'
    if (material.includes('graphene') || material.includes('cnt-carbon')) return 'Very Good'
    if (material.includes('cnt')) return 'Good'
    if (material.includes('copper') || material.includes('reclaimed')) return 'Good'
    if (material.includes('oxidized')) return 'Very Good'
    return 'Moderate'
  }
  
  const getStability = (material: string) => {
    if (!material) return 'Good'
    if (material.includes('mxene') || material === 'reduced-graphene-oxide') return 'Excellent'
    if (material.includes('cnt') || material.includes('graphene')) return 'Very Good'
    if (material.includes('anodized') || material.includes('electroplated')) return 'Very Good'
    if (material.includes('copper') || material.includes('reclaimed')) return 'Good'
    return 'Good'
  }
  
  const getResearchStatus = (material: string) => {
    if (!material) return 'Emerging'
    if (material.includes('aerogel') || material === 'cnt-graphene') return 'Cutting-edge'
    if (material.includes('mxene') || material === 'swcnt') return 'Advanced'
    if (material.includes('graphene') || material.includes('cnt')) return 'Established'
    if (material.includes('upcycled') || material.includes('reclaimed')) return 'Sustainable Innovation'
    if (material.includes('iphone-cord') || material.includes('cable-core')) return 'Circular Economy'
    return 'Emerging'
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-red-200 p-3 shadow-sm"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-red-500" />
          <h3 className="text-sm font-semibold text-gray-900">Electrode Configuration</h3>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 space-y-3"
          >
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Electrode Material
              </label>
              <div className="space-y-3">
                {/* Group materials by category */}
                {['Traditional', 'Graphene', 'CNT', 'MXene', 'Upcycled'].map(category => {
                  const categoryMaterials = materials.filter(m => m.category === category)
                  const categoryColors: Record<string, string> = {
                    'Traditional': 'border-gray-200 bg-gray-50',
                    'Graphene': 'border-blue-200 bg-blue-50',
                    'CNT': 'border-green-200 bg-green-50',
                    'MXene': 'border-purple-200 bg-purple-50',
                    'Upcycled': 'border-amber-200 bg-amber-50'
                  }
                  
                  return (
                    <div key={category} className={`p-2 rounded border ${categoryColors[category]}`}>
                      <h4 className="font-medium text-xs text-gray-700 mb-2">
                        {category === 'CNT' ? 'Carbon Nanotubes' : category} Materials
                      </h4>
                      <div className="space-y-1">
                        {categoryMaterials.map((material) => (
                          <label key={material.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="electrode-material"
                              value={material.value}
                              checked={config.electrode.material === material.value}
                              onChange={(e) => onConfigChange('material', e.target.value)}
                              className="form-radio text-red-500"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <span className="text-sm text-gray-900 font-medium">{material.label}</span>
                                <div className="flex gap-1 flex-wrap">
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {material.cost}
                                  </span>
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {material.efficiency}% eff
                                  </span>
                                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                    {material.conductivity}
                                  </span>
                                </div>
                              </div>
                              {/* Add material descriptions for advanced materials */}
                              {category !== 'Traditional' && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {getMaterialDescription(material.value)}
                                </div>
                              )}
                              {/* Add pre-treatment info for upcycled materials */}
                              {category === 'Upcycled' && material.pretreatment && material.pretreatment !== 'none' && (
                                <div className="text-xs text-amber-700 mt-1 font-medium">
                                  Pre-treatment: {getPretreatmentDescription(material.pretreatment)}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surface Area (cm²)
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={config.electrode.surface}
                  onChange={(e) => onConfigChange('surface', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-sm text-gray-600 mt-1">
                  {config.electrode.surface} cm² {getSurfaceAreaNote(config.electrode.material)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thickness (mm)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={config.electrode.thickness}
                  onChange={(e) => onConfigChange('thickness', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-sm text-gray-600 mt-1">
                  {config.electrode.thickness} mm {getThicknessNote(config.electrode.material)}
                </div>
              </div>
            </div>
            
            {/* Advanced material properties */}
            {!['carbon-cloth', 'graphite', 'stainless-steel'].includes(config.electrode.material) && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-sm text-gray-800 mb-2">Advanced Material Properties</h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-600">Electron Transfer Rate:</span>
                    <div className="font-semibold text-green-700">{getElectronTransferRate(config.electrode.material)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Biocompatibility:</span>
                    <div className="font-semibold text-blue-700">{getBiocompatibility(config.electrode.material)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Stability:</span>
                    <div className="font-semibold text-purple-700">{getStability(config.electrode.material)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Research Status:</span>
                    <div className="font-semibold text-orange-700">{getResearchStatus(config.electrode.material)}</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function MicrobialConfig({ config, onConfigChange }: { 
  config: MESSConfig, 
  onConfigChange: (field: string, value: any) => void 
}) {
  const [expanded, setExpanded] = useState(true)

  const species = [
    { value: 'geobacter', label: 'Geobacter sulfurreducens', power: 'High', stability: 'Excellent' },
    { value: 'shewanella', label: 'Shewanella oneidensis', power: 'Medium', stability: 'Good' },
    { value: 'mixed-culture', label: 'Mixed Anaerobic Culture', power: 'Variable', stability: 'High' }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-lg border border-green-200 p-4 shadow-sm"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-green-500" />
          <h3 className="font-semibold text-gray-900">Microbial Community</h3>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dominant Species
              </label>
              <div className="space-y-2">
                {species.map((spec) => (
                  <label key={spec.value} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="microbial-species"
                      value={spec.value}
                      checked={config.microbial.species === spec.value}
                      onChange={(e) => onConfigChange('species', e.target.value)}
                      className="form-radio text-green-500"
                    />
                    <div className="flex-1 flex justify-between">
                      <span className="text-sm text-gray-900">{spec.label}</span>
                      <div className="flex gap-2">
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {spec.power} power
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {spec.stability}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cell Density (M cells/mL)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={config.microbial.density}
                  onChange={(e) => onConfigChange('density', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-sm text-gray-600 mt-1">
                  {config.microbial.density}M cells/mL
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Level (%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={config.microbial.activity}
                  onChange={(e) => onConfigChange('activity', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-sm text-gray-600 mt-1">
                  {config.microbial.activity}%
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ChamberConfig({ config, onConfigChange }: { 
  config: MESSConfig, 
  onConfigChange: (field: string, value: any) => void 
}) {
  const [expanded, setExpanded] = useState(true)

  const shapes = [
    { value: 'rectangular', label: 'Rectangular', efficiency: 85, cost: 'Low' },
    { value: 'cylindrical', label: 'Cylindrical', efficiency: 92, cost: 'Medium' }
  ]

  const materials = [
    { value: 'acrylic', label: 'Acrylic', cost: '$15', transparency: 'High' },
    { value: 'glass', label: 'Glass', cost: '$25', transparency: 'High' },
    { value: 'pvc', label: 'PVC', cost: '$8', transparency: 'None' }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Chamber Configuration</h3>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chamber Shape
              </label>
              <div className="space-y-2">
                {shapes.map((shape) => (
                  <label key={shape.value} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="chamber-shape"
                      value={shape.value}
                      checked={config.chamber.shape === shape.value}
                      onChange={(e) => onConfigChange('shape', e.target.value)}
                      className="form-radio text-blue-500"
                    />
                    <div className="flex-1 flex justify-between">
                      <span className="text-sm text-gray-900">{shape.label}</span>
                      <div className="flex gap-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {shape.efficiency}% eff
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {shape.cost} cost
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chamber Material
              </label>
              <div className="space-y-2">
                {materials.map((material) => (
                  <label key={material.value} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="chamber-material"
                      value={material.value}
                      checked={config.chamber.material === material.value}
                      onChange={(e) => onConfigChange('material', e.target.value)}
                      className="form-radio text-blue-500"
                    />
                    <div className="flex-1 flex justify-between">
                      <span className="text-sm text-gray-900">{material.label}</span>
                      <div className="flex gap-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {material.cost}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {material.transparency}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume (Liters)
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={config.chamber.volume}
                onChange={(e) => onConfigChange('volume', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-sm text-gray-600 mt-1">
                {config.chamber.volume}L
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Advanced performance calculation functions
function calculateAdvancedPowerOutput(config: MFCConfig): number {
  const basePower = config.electrode.surface * config.microbial.activity * 0.05
  
  // Material-specific performance multipliers based on literature
  const materialMultipliers = {
    // Traditional materials (baseline)
    'carbon-cloth': 1.0,
    'graphite': 0.8,
    'stainless-steel': 0.7,
    
    // Graphene materials (high performance)
    'graphene-oxide': 1.8,
    'reduced-graphene-oxide': 2.2,
    'graphene-carbon-cloth': 1.6,
    'graphene-foam': 2.0,
    'graphene-aerogel': 2.5,
    
    // CNT materials (very high performance)
    'swcnt': 2.3,
    'mwcnt': 1.9,
    'cnt-carbon-cloth': 1.7,
    'cnt-graphene': 2.8,
    'cnt-paper': 1.5,
    
    // MXene materials (excellent performance)
    'ti3c2tx': 2.1,
    'ti2ctx': 1.8,
    'mxene-carbon-cloth': 1.6,
    'mxene-graphene': 2.4,
    'nb2ctx': 2.0,
    'v2ctx': 1.9,
    
    // Upcycled materials (sustainable performance)
    'iphone-cord-copper': 0.9,
    'iphone-cord-copper-etched': 1.2,
    'iphone-cord-copper-anodized': 1.3,
    'reclaimed-copper-wire': 0.8,
    'reclaimed-copper-oxidized': 1.1,
    'upcycled-copper-mesh': 1.5,
    'cable-core-composite': 1.0,
    'electroplated-reclaimed': 1.6
  }
  
  const multiplier = materialMultipliers[config.electrode.material as keyof typeof materialMultipliers] || 1.0
  return Math.round(basePower * multiplier)
}

function calculateMaterialEfficiency(config: MFCConfig): number {
  const baseEfficiency = (config.microbial.activity + config.electrode.surface) / 3
  
  // Efficiency bonuses for advanced materials
  const efficiencyBonuses = {
    'carbon-cloth': 0,
    'graphite': -5,
    'stainless-steel': -10,
    'graphene-oxide': 15,
    'reduced-graphene-oxide': 20,
    'graphene-carbon-cloth': 12,
    'graphene-foam': 18,
    'graphene-aerogel': 25,
    'swcnt': 22,
    'mwcnt': 18,
    'cnt-carbon-cloth': 15,
    'cnt-graphene': 28,
    'cnt-paper': 12,
    'ti3c2tx': 20,
    'ti2ctx': 16,
    'mxene-carbon-cloth': 14,
    'mxene-graphene': 24,
    'nb2ctx': 18,
    'v2ctx': 17,
    'iphone-cord-copper': -5,
    'iphone-cord-copper-etched': 8,
    'iphone-cord-copper-anodized': 12,
    'reclaimed-copper-wire': -10,
    'reclaimed-copper-oxidized': 5,
    'upcycled-copper-mesh': 15,
    'cable-core-composite': 0,
    'electroplated-reclaimed': 18
  }
  
  const bonus = efficiencyBonuses[config.electrode.material as keyof typeof efficiencyBonuses] || 0
  return Math.min(95, Math.round(baseEfficiency + bonus))
}

function calculateMaterialCost(config: MFCConfig): number {
  const baseCost = config.chamber.volume * 10
  
  // Material costs per cm² of surface area
  const materialCosts = {
    'carbon-cloth': 0.05,
    'graphite': 0.02,
    'stainless-steel': 0.08,
    'graphene-oxide': 0.45,
    'reduced-graphene-oxide': 0.65,
    'graphene-carbon-cloth': 0.35,
    'graphene-foam': 1.20,
    'graphene-aerogel': 2.00,
    'swcnt': 1.80,
    'mwcnt': 0.95,
    'cnt-carbon-cloth': 0.55,
    'cnt-graphene': 2.20,
    'cnt-paper': 0.85,
    'ti3c2tx': 1.50,
    'ti2ctx': 1.30,
    'mxene-carbon-cloth': 0.75,
    'mxene-graphene': 1.85,
    'nb2ctx': 1.75,
    'v2ctx': 1.65,
    'iphone-cord-copper': 0.005,
    'iphone-cord-copper-etched': 0.012,
    'iphone-cord-copper-anodized': 0.025,
    'reclaimed-copper-wire': 0.003,
    'reclaimed-copper-oxidized': 0.018,
    'upcycled-copper-mesh': 0.032,
    'cable-core-composite': 0.01,
    'electroplated-reclaimed': 0.045
  }
  
  const materialCost = materialCosts[config.electrode.material as keyof typeof materialCosts] || 0.05
  return Math.round(baseCost + (config.electrode.surface * materialCost))
}

export default function MESSConfigPanel({ config, selectedComponent, onConfigChange }: MESSConfigPanelProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Compact header with inline status */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-gray-900">Configuration</h2>
          </div>
          {selectedComponent && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {selectedComponent}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 p-4">

        <ElectrodeConfig 
          config={config}
          onConfigChange={(field, value) => onConfigChange('electrode', field, value)}
        />

        <MicrobialConfig 
          config={config}
          onConfigChange={(field, value) => onConfigChange('microbial', field, value)}
        />

        <ChamberConfig 
          config={config}
          onConfigChange={(field, value) => onConfigChange('chamber', field, value)}
        />
      </div>
      
      {/* Performance metrics at bottom */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-900">Performance</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-gray-600">Power</div>
            <div className="font-semibold text-green-800">
              {calculateAdvancedPowerOutput(config)} mW
            </div>
          </div>
          <div>
            <div className="text-gray-600">Efficiency</div>
            <div className="font-semibold text-blue-800">
              {calculateMaterialEfficiency(config)}%
            </div>
          </div>
          <div>
            <div className="text-gray-600">Cost</div>
            <div className="font-semibold text-purple-800">
              ${calculateMaterialCost(config)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}