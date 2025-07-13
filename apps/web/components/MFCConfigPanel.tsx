'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MFCConfig {
  anode: {
    material: string
    surface: number
    thickness: number
  }
  cathode: {
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

interface MFCConfigPanelProps {
  config: MFCConfig
  selectedComponent: string | null
  onConfigChange: (component: keyof MFCConfig, field: string, value: any) => void
}

// Material data with detailed properties
const electrodematerials = {
  traditional: [
    { id: 'carbon-cloth', name: 'Carbon Cloth', efficiency: 85, cost: 5, description: 'Standard carbon cloth electrode' },
    { id: 'graphite', name: 'Graphite Rod', efficiency: 70, cost: 3, description: 'Traditional graphite electrode' },
    { id: 'stainless-steel', name: 'Stainless Steel', efficiency: 60, cost: 8, description: 'Corrosion-resistant metal electrode' },
  ],
  graphene: [
    { id: 'graphene-oxide', name: 'Graphene Oxide', efficiency: 150, cost: 25, description: 'High surface area graphene oxide' },
    { id: 'reduced-graphene-oxide', name: 'Reduced Graphene Oxide', efficiency: 180, cost: 35, description: 'Conductive rGO electrode' },
    { id: 'graphene-aerogel', name: 'Graphene Aerogel', efficiency: 200, cost: 45, description: '3D porous graphene structure' },
  ],
  nanotube: [
    { id: 'swcnt', name: 'Single-Walled CNT', efficiency: 160, cost: 50, description: 'Pristine single-walled carbon nanotubes' },
    { id: 'mwcnt', name: 'Multi-Walled CNT', efficiency: 140, cost: 30, description: 'Multi-walled carbon nanotubes' },
    { id: 'cnt-graphene', name: 'CNT/Graphene Hybrid', efficiency: 220, cost: 60, description: 'Synergistic CNT-graphene composite' },
  ],
  mxene: [
    { id: 'ti3c2tx', name: 'Ti₃C₂Tₓ MXene', efficiency: 180, cost: 40, description: 'Titanium carbide MXene with metallic conductivity' },
    { id: 'v2ctx', name: 'V₂CTₓ MXene', efficiency: 160, cost: 35, description: 'Vanadium carbide MXene electrode' },
    { id: 'nb2ctx', name: 'Nb₂CTₓ MXene', efficiency: 140, cost: 50, description: 'Niobium carbide MXene material' },
  ],
  upcycled: [
    { id: 'iphone-copper-raw', name: 'iPhone Cord Copper (Raw)', efficiency: 40, cost: 2, description: 'Untreated copper from electronic waste' },
    { id: 'pcb-gold-plated', name: 'PCB Gold-Plated', efficiency: 90, cost: 12, description: 'Gold-plated circuits from PCBs' },
    { id: 'electroplated-reclaimed', name: 'Electroplated Reclaimed Metal', efficiency: 110, cost: 8, description: 'Electroplated surface treatment on reclaimed metals' },
  ]
}

const microbialSpecies = [
  { id: 'geobacter', name: 'Geobacter sulfurreducens', power: 'High power', stability: 'Excellent' },
  { id: 'shewanella', name: 'Shewanella oneidensis', power: 'Medium power', stability: 'Good' },
  { id: 'pseudomonas', name: 'Pseudomonas aeruginosa', power: 'Low power', stability: 'Fair' },
]

const chamberShapes = [
  { id: 'rectangular', name: 'Rectangular', description: 'Standard rectangular chamber' },
  { id: 'cylindrical', name: 'Cylindrical', description: 'Cylindrical chamber design' },
  { id: 'hexagonal', name: 'Hexagonal', description: 'Hexagonal chamber for optimization' },
]

const chamberMaterials = [
  { id: 'acrylic', name: 'Acrylic', cost: 15, transparency: 'High', description: 'Clear acrylic chamber' },
  { id: 'glass', name: 'Glass', cost: 25, transparency: 'High', description: 'Borosilicate glass chamber' },
  { id: 'plastic', name: 'Plastic', cost: 8, transparency: 'Medium', description: 'Polycarbonate plastic chamber' },
]

// Material performance multipliers
const materialMultipliers: Record<string, number> = {
  'carbon-cloth': 1.0,
  'graphite': 0.8,
  'stainless-steel': 0.7,
  'graphene-oxide': 1.8,
  'reduced-graphene-oxide': 2.2,
  'graphene-aerogel': 2.5,
  'swcnt': 2.0,
  'mwcnt': 1.7,
  'cnt-graphene': 2.8,
  'ti3c2tx': 2.1,
  'v2ctx': 1.9,
  'nb2ctx': 1.6,
  'iphone-copper-raw': 0.5,
  'pcb-gold-plated': 1.1,
  'electroplated-reclaimed': 1.3,
}

export default function MFCConfigPanel({ config, selectedComponent, onConfigChange }: MFCConfigPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    anode: true,
    cathode: true,
    microbial: true,
    chamber: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const calculatePower = () => {
    const anodeMaterial = materialMultipliers[config.anode.material] || 1.0
    const cathodeMaterial = materialMultipliers[config.cathode.material] || 1.0
    const basePower = (config.anode.surface + config.cathode.surface) * config.microbial.activity * 0.025
    return Math.round(basePower * anodeMaterial * cathodeMaterial)
  }

  const calculateEfficiency = () => {
    return Math.round((config.microbial.activity + (config.anode.surface + config.cathode.surface) / 2) / 3)
  }

  const calculateCost = () => {
    const anodeCost = getMaterialInfo(config.anode.material)?.cost || 0
    const cathodeCost = getMaterialInfo(config.cathode.material)?.cost || 0
    return Math.round(config.chamber.volume * 10 + anodeCost + cathodeCost)
  }

  const getMaterialInfo = (materialId: string) => {
    const allMaterials = [
      ...electrodematerials.traditional,
      ...electrodematerials.graphene,
      ...electrodematerials.nanotube,
      ...electrodematerials.mxene,
      ...electrodematerials.upcycled
    ]
    return allMaterials.find(m => m.id === materialId)
  }

  const getSpeciesInfo = (speciesId: string) => {
    return microbialSpecies.find(s => s.id === speciesId)
  }

  const getChamberMaterialInfo = (materialId: string) => {
    return chamberMaterials.find(m => m.id === materialId)
  }

  const renderElectrodeSection = (type: 'anode' | 'cathode') => {
    const electrodeConfig = config[type]
    const isHighlighted = selectedComponent === type

    return (
      <div className={`bg-white rounded-lg border shadow-sm ${isHighlighted ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
        <button
          onClick={() => toggleSection(type)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {type} Configuration
            {isHighlighted && <span className="ml-2 text-sm text-blue-600">(Selected)</span>}
          </h3>
          {expandedSections[type] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        <AnimatePresence>
          {expandedSections[type] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 p-4 space-y-4"
            >
              {/* Material Selection */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{type.charAt(0).toUpperCase() + type.slice(1)} Material</h4>
                
                {/* Traditional Materials */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Traditional Materials</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {electrodematerials.traditional.map((material) => (
                      <label key={material.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                        <input
                          type="radio"
                          name={`${type}-material`}
                          value={material.id}
                          checked={electrodeConfig.material === material.id}
                          onChange={(e) => onConfigChange(type, 'material', e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{material.name}</span>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-green-600">{material.efficiency}% eff</span>
                              <span className="text-gray-600">${material.cost}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">{material.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Advanced Materials */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Advanced Materials</h5>
                  <div className="space-y-3">
                    {/* Graphene */}
                    <div>
                      <h6 className="text-xs font-medium text-purple-700 mb-1">Graphene Materials</h6>
                      <div className="grid grid-cols-1 gap-2">
                        {electrodematerials.graphene.map((material) => (
                          <label key={material.id} className="flex items-center space-x-3 p-2 border border-purple-200 rounded hover:bg-purple-50">
                            <input
                              type="radio"
                              name={`${type}-material`}
                              value={material.id}
                              checked={electrodeConfig.material === material.id}
                              onChange={(e) => onConfigChange(type, 'material', e.target.value)}
                              className="w-4 h-4 text-purple-600"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{material.name}</span>
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="text-green-600">{material.efficiency}% eff</span>
                                  <span className="text-gray-600">${material.cost}</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">{material.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Carbon Nanotubes */}
                    <div>
                      <h6 className="text-xs font-medium text-blue-700 mb-1">Carbon Nanotubes</h6>
                      <div className="grid grid-cols-1 gap-2">
                        {electrodematerials.nanotube.map((material) => (
                          <label key={material.id} className="flex items-center space-x-3 p-2 border border-blue-200 rounded hover:bg-blue-50">
                            <input
                              type="radio"
                              name={`${type}-material`}
                              value={material.id}
                              checked={electrodeConfig.material === material.id}
                              onChange={(e) => onConfigChange(type, 'material', e.target.value)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{material.name}</span>
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="text-green-600">{material.efficiency}% eff</span>
                                  <span className="text-gray-600">${material.cost}</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">{material.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* MXenes */}
                    <div>
                      <h6 className="text-xs font-medium text-orange-700 mb-1">MXene Materials</h6>
                      <div className="grid grid-cols-1 gap-2">
                        {electrodematerials.mxene.map((material) => (
                          <label key={material.id} className="flex items-center space-x-3 p-2 border border-orange-200 rounded hover:bg-orange-50">
                            <input
                              type="radio"
                              name={`${type}-material`}
                              value={material.id}
                              checked={electrodeConfig.material === material.id}
                              onChange={(e) => onConfigChange(type, 'material', e.target.value)}
                              className="w-4 h-4 text-orange-600"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{material.name}</span>
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="text-green-600">{material.efficiency}% eff</span>
                                  <span className="text-gray-600">${material.cost}</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">{material.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Upcycled */}
                    <div>
                      <h6 className="text-xs font-medium text-green-700 mb-1">Upcycled Materials</h6>
                      <div className="grid grid-cols-1 gap-2">
                        {electrodematerials.upcycled.map((material) => (
                          <label key={material.id} className="flex items-center space-x-3 p-2 border border-green-200 rounded hover:bg-green-50">
                            <input
                              type="radio"
                              name={`${type}-material`}
                              value={material.id}
                              checked={electrodeConfig.material === material.id}
                              onChange={(e) => onConfigChange(type, 'material', e.target.value)}
                              className="w-4 h-4 text-green-600"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{material.name}</span>
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="text-green-600">{material.efficiency}% eff</span>
                                  <span className="text-gray-600">${material.cost}</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">{material.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Surface Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surface Area: {electrodeConfig.surface} cm²
                </label>
                <input
                  type="range"
                  min="5"
                  max="250"
                  value={electrodeConfig.surface}
                  onChange={(e) => onConfigChange(type, 'surface', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 cm²</span>
                  <span>250 cm²</span>
                </div>
              </div>

              {/* Thickness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thickness: {electrodeConfig.thickness} mm
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={electrodeConfig.thickness}
                  onChange={(e) => onConfigChange(type, 'thickness', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5 mm</span>
                  <span>10 mm</span>
                </div>
              </div>

              {/* Material Info */}
              {getMaterialInfo(electrodeConfig.material) && (
                <div className="bg-gray-50 p-3 rounded">
                  <h5 className="font-medium text-gray-900 mb-1">Material Properties</h5>
                  <div className="text-sm text-gray-600">
                    <p>Efficiency: {getMaterialInfo(electrodeConfig.material)?.efficiency}%</p>
                    <p>Cost: ${getMaterialInfo(electrodeConfig.material)?.cost}</p>
                    <p>{getMaterialInfo(electrodeConfig.material)?.description}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 max-h-full overflow-y-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">MFC Configuration</h2>
        {selectedComponent && (
          <p className="text-sm text-blue-600">Editing: {selectedComponent}</p>
        )}
      </div>

      {/* Anode Configuration */}
      {renderElectrodeSection('anode')}

      {/* Cathode Configuration */}
      {renderElectrodeSection('cathode')}

      {/* Microbial Configuration */}
      <div className={`bg-white rounded-lg border shadow-sm ${selectedComponent === 'microbial' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
        <button
          onClick={() => toggleSection('microbial')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            Microbial Configuration
            {selectedComponent === 'microbial' && <span className="ml-2 text-sm text-blue-600">(Selected)</span>}
          </h3>
          {expandedSections.microbial ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        <AnimatePresence>
          {expandedSections.microbial && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 p-4 space-y-4"
            >
              {/* Species Selection */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Microbial Species</h4>
                <div className="space-y-2">
                  {microbialSpecies.map((species) => (
                    <label key={species.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                      <input
                        type="radio"
                        name="microbial-species"
                        value={species.id}
                        checked={config.microbial.species === species.id}
                        onChange={(e) => onConfigChange('microbial', 'species', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{species.name}</span>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-green-600">{species.power}</span>
                            <span className="text-gray-600">{species.stability}</span>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Density */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cell Density: {config.microbial.density} × 10⁸ cells/mL
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={config.microbial.density}
                  onChange={(e) => onConfigChange('microbial', 'density', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 × 10⁸</span>
                  <span>20 × 10⁸</span>
                </div>
              </div>

              {/* Activity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metabolic Activity: {config.microbial.activity}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={config.microbial.activity}
                  onChange={(e) => onConfigChange('microbial', 'activity', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Species Info */}
              {getSpeciesInfo(config.microbial.species) && (
                <div className="bg-gray-50 p-3 rounded">
                  <h5 className="font-medium text-gray-900 mb-1">Species Properties</h5>
                  <div className="text-sm text-gray-600">
                    <p>Power Output: {getSpeciesInfo(config.microbial.species)?.power}</p>
                    <p>Stability: {getSpeciesInfo(config.microbial.species)?.stability}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chamber Configuration */}
      <div className={`bg-white rounded-lg border shadow-sm ${selectedComponent === 'chamber' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
        <button
          onClick={() => toggleSection('chamber')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            Chamber Configuration
            {selectedComponent === 'chamber' && <span className="ml-2 text-sm text-blue-600">(Selected)</span>}
          </h3>
          {expandedSections.chamber ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        <AnimatePresence>
          {expandedSections.chamber && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 p-4 space-y-4"
            >
              {/* Shape Selection */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Chamber Shape</h4>
                <div className="space-y-2">
                  {chamberShapes.map((shape) => (
                    <label key={shape.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                      <input
                        type="radio"
                        name="chamber-shape"
                        value={shape.id}
                        checked={config.chamber.shape === shape.id}
                        onChange={(e) => onConfigChange('chamber', 'shape', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{shape.name}</span>
                        <p className="text-xs text-gray-500">{shape.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Material Selection */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Chamber Material</h4>
                <div className="space-y-2">
                  {chamberMaterials.map((material) => (
                    <label key={material.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                      <input
                        type="radio"
                        name="chamber-material"
                        value={material.id}
                        checked={config.chamber.material === material.id}
                        onChange={(e) => onConfigChange('chamber', 'material', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{material.name}</span>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-blue-600">{material.transparency}</span>
                            <span className="text-gray-600">${material.cost}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{material.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Volume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume: {config.chamber.volume} L
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={config.chamber.volume}
                  onChange={(e) => onConfigChange('chamber', 'volume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.1 L</span>
                  <span>10 L</span>
                </div>
              </div>

              {/* Material Info */}
              {getChamberMaterialInfo(config.chamber.material) && (
                <div className="bg-gray-50 p-3 rounded">
                  <h5 className="font-medium text-gray-900 mb-1">Material Properties</h5>
                  <div className="text-sm text-gray-600">
                    <p>Transparency: {getChamberMaterialInfo(config.chamber.material)?.transparency}</p>
                    <p>Cost: ${getChamberMaterialInfo(config.chamber.material)?.cost}</p>
                    <p>{getChamberMaterialInfo(config.chamber.material)?.description}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Performance Predictions */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Predictions</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{calculatePower()}</div>
            <div className="text-xs text-gray-600">mW/m² Power</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{calculateEfficiency()}%</div>
            <div className="text-xs text-gray-600">Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">${calculateCost()}</div>
            <div className="text-xs text-gray-600">Est. Cost</div>
          </div>
        </div>
      </div>
    </div>
  )
}