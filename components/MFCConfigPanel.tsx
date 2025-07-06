'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
    electrode: true,
    microbial: true,
    chamber: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const calculatePowerOutput = () => {
    const basePower = config.electrode.surface * config.microbial.activity * 0.05
    const materialMultiplier = materialMultipliers[config.electrode.material] || 1.0
    return Math.round(basePower * materialMultiplier)
  }

  const calculateEfficiency = () => {
    return Math.round((config.microbial.activity + config.electrode.surface) / 3)
  }

  const calculateCost = () => {
    return Math.round(config.chamber.volume * 10 + config.electrode.surface * 0.1)
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

  const isAdvancedMaterial = (materialId: string) => {
    return !electrodematerials.traditional.find(m => m.id === materialId)
  }

  const getSpeciesInfo = (speciesId: string) => {
    return microbialSpecies.find(s => s.id === speciesId)
  }

  const getChamberMaterialInfo = (materialId: string) => {
    return chamberMaterials.find(m => m.id === materialId)
  }

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">MFC Configuration</h2>
        {selectedComponent && (
          <p className="text-sm text-blue-600">Editing: {selectedComponent}</p>
        )}
      </div>

      {/* Electrode Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection('electrode')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">Electrode Configuration</h3>
          {expandedSections.electrode ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        <AnimatePresence>
          {expandedSections.electrode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 p-4 space-y-4"
            >
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Electrode Material</h4>
                
                {/* Traditional Materials */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Traditional Materials</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {electrodematerials.traditional.map((material) => (
                      <label key={material.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                        <input
                          type="radio"
                          name="electrode-material"
                          value={material.id}
                          checked={config.electrode.material === material.id}
                          onChange={(e) => onConfigChange('electrode', 'material', e.target.value)}
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

                {/* Graphene Materials */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Graphene Materials</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {electrodematerials.graphene.map((material) => (
                      <label key={material.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                        <input
                          type="radio"
                          name="electrode-material"
                          value={material.id}
                          checked={config.electrode.material === material.id}
                          onChange={(e) => onConfigChange('electrode', 'material', e.target.value)}
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

                {/* Carbon Nanotubes Materials */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Carbon Nanotubes Materials</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {electrodematerials.nanotube.map((material) => (
                      <label key={material.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                        <input
                          type="radio"
                          name="electrode-material"
                          value={material.id}
                          checked={config.electrode.material === material.id}
                          onChange={(e) => onConfigChange('electrode', 'material', e.target.value)}
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

                {/* MXene Materials */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">MXene Materials</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {electrodematerials.mxene.map((material) => (
                      <label key={material.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                        <input
                          type="radio"
                          name="electrode-material"
                          value={material.id}
                          checked={config.electrode.material === material.id}
                          onChange={(e) => onConfigChange('electrode', 'material', e.target.value)}
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

                {/* Upcycled Materials */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Upcycled Materials</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {electrodematerials.upcycled.map((material) => (
                      <label key={material.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                        <input
                          type="radio"
                          name="electrode-material"
                          value={material.id}
                          checked={config.electrode.material === material.id}
                          onChange={(e) => onConfigChange('electrode', 'material', e.target.value)}
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
              </div>

              {/* Advanced Material Properties */}
              {isAdvancedMaterial(config.electrode.material) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Advanced Material Properties</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Electron Transfer Rate:</span>
                      <span className="ml-2 text-blue-900">Enhanced</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Biocompatibility:</span>
                      <span className="ml-2 text-blue-900">High</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Stability:</span>
                      <span className="ml-2 text-blue-900">Excellent</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Research Status:</span>
                      <span className="ml-2 text-blue-900">Active</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Surface Area */}
              <div>
                <label htmlFor="surface-area" className="block text-sm font-medium text-gray-700 mb-2">
                  Surface Area (cm²): {config.electrode.surface}
                </label>
                <input
                  id="surface-area"
                  type="range"
                  min="5"
                  max="250"
                  step="5"
                  value={config.electrode.surface}
                  onChange={(e) => onConfigChange('electrode', 'surface', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5 cm²</span>
                  <span>250 cm²</span>
                </div>
              </div>

              {/* Thickness */}
              <div>
                <label htmlFor="thickness" className="block text-sm font-medium text-gray-700 mb-2">
                  Thickness (mm): {config.electrode.thickness}
                </label>
                <input
                  id="thickness"
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={config.electrode.thickness}
                  onChange={(e) => onConfigChange('electrode', 'thickness', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.5 mm</span>
                  <span>5 mm</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Microbial Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection('microbial')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">Microbial Community</h3>
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

              {/* Cell Density */}
              <div>
                <label htmlFor="cell-density" className="block text-sm font-medium text-gray-700 mb-2">
                  Cell Density (10⁸ cells/mL): {config.microbial.density}
                </label>
                <input
                  id="cell-density"
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={config.microbial.density}
                  onChange={(e) => onConfigChange('microbial', 'density', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1×10⁸</span>
                  <span>10×10⁸</span>
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label htmlFor="activity-level" className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Level (%): {config.microbial.activity}
                </label>
                <input
                  id="activity-level"
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={config.microbial.activity}
                  onChange={(e) => onConfigChange('microbial', 'activity', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10%</span>
                  <span>100%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chamber Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => toggleSection('chamber')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">Chamber Configuration</h3>
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
                            <span className="text-green-600">{material.transparency}</span>
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
                <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">
                  Volume (L): {config.chamber.volume}
                </label>
                <input
                  id="volume"
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={config.chamber.volume}
                  onChange={(e) => onConfigChange('chamber', 'volume', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.1 L</span>
                  <span>5 L</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Predicted Performance */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Predicted Performance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Power Output</div>
            <div className="text-2xl font-bold text-green-600">{calculatePowerOutput()} mW</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Efficiency</div>
            <div className="text-2xl font-bold text-blue-600">{calculateEfficiency()}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Est. Cost</div>
            <div className="text-2xl font-bold text-purple-600">${calculateCost()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}