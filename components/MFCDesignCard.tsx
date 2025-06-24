'use client'

import { Design3DPreview } from './DesignSpecific3DModels'

interface MFCDesign {
  id: string
  name: string
  type: string
  cost: string
  powerOutput: string
  materials: any
}

interface MFCDesignCardProps {
  design: MFCDesign
  onSelect: (design: MFCDesign) => void
}

const LegacyMFCIcons = {
  'earthen-pot': (
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      <ellipse cx="50" cy="85" rx="35" ry="8" fill="#8B4513" opacity="0.3"/>
      <path d="M20 80 Q20 40 50 40 Q80 40 80 80 L75 85 Q75 88 50 88 Q25 88 25 85 Z" fill="#D2691E"/>
      <rect x="15" y="50" width="4" height="15" fill="#333" rx="2"/>
      <rect x="81" y="50" width="4" height="15" fill="#333" rx="2"/>
      <circle cx="17" cy="47" r="2" fill="#FF6B6B"/>
      <circle cx="83" cy="47" r="2" fill="#4ECDC4"/>
    </svg>
  ),
  'cardboard': (
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      <rect x="15" y="30" width="70" height="40" fill="#D4A574" stroke="#8B7355" strokeWidth="2"/>
      <path d="M15 30 L85 30 L85 70 L15 70 Z" fill="none" stroke="#8B7355" strokeWidth="1" strokeDasharray="2,2"/>
      <rect x="10" y="45" width="6" height="10" fill="#333" rx="1"/>
      <rect x="84" y="45" width="6" height="10" fill="#333" rx="1"/>
      <circle cx="13" cy="42" r="1.5" fill="#FF6B6B"/>
      <circle cx="87" cy="42" r="1.5" fill="#4ECDC4"/>
    </svg>
  ),
  'mason-jar': (
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      <rect x="25" y="25" width="50" height="8" fill="#C0C0C0"/>
      <rect x="28" y="33" width="44" height="50" fill="#E6F3FF" stroke="#B0C4DE" strokeWidth="2" rx="3"/>
      <rect x="20" y="50" width="8" height="15" fill="#333" rx="2"/>
      <rect x="72" y="50" width="8" height="15" fill="#333" rx="2"/>
      <line x1="32" y1="75" x2="68" y2="75" stroke="#87CEEB" strokeWidth="2"/>
      <circle cx="24" cy="47" r="2" fill="#FF6B6B"/>
      <circle cx="76" cy="47" r="2" fill="#4ECDC4"/>
    </svg>
  ),
  '3d-printed': (
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      <polygon points="50,20 70,35 70,65 50,80 30,65 30,35" fill="#4A90E2" stroke="#2E5984" strokeWidth="2"/>
      <polygon points="50,25 65,37 65,63 50,75 35,63 35,37" fill="#6BB6FF" opacity="0.7"/>
      <rect x="18" y="45" width="6" height="15" fill="#333" rx="2"/>
      <rect x="76" y="45" width="6" height="15" fill="#333" rx="2"/>
      <circle cx="21" cy="42" r="2" fill="#FF6B6B"/>
      <circle cx="79" cy="42" r="2" fill="#4ECDC4"/>
    </svg>
  ),
  'wetland': (
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      <rect x="10" y="60" width="80" height="25" fill="#8FBC8F" rx="3"/>
      <path d="M25 60 Q30 45 35 60 Q40 45 45 60" stroke="#228B22" strokeWidth="3" fill="none"/>
      <path d="M55 60 Q60 45 65 60 Q70 45 75 60" stroke="#228B22" strokeWidth="3" fill="none"/>
      <rect x="15" y="70" width="4" height="10" fill="#333"/>
      <rect x="81" y="70" width="4" height="10" fill="#333"/>
      <circle cx="17" cy="67" r="2" fill="#FF6B6B"/>
      <circle cx="83" cy="67" r="2" fill="#4ECDC4"/>
    </svg>
  )
}

// New design types that have 3D models
const new3DDesigns = [
  'micro-chip',
  'isolinear-chip', 
  'benchtop-bioreactor',
  'wastewater-treatment',
  'brewery-processing',
  'architectural-facade',
  'benthic-fuel-cell',
  'kitchen-sink'
]

export default function MFCDesignCard({ design, onSelect }: MFCDesignCardProps) {
  const hasNew3DModel = new3DDesigns.includes(design.type)
  
  return (
    <div 
      className="bg-white rounded-lg border-2 border-gray-200 p-6 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
      onClick={() => onSelect(design)}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {hasNew3DModel ? (
            <div className="w-full h-20 bg-gray-900 rounded-lg overflow-hidden">
              <Design3DPreview designType={design.type} />
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              {LegacyMFCIcons[design.type as keyof typeof LegacyMFCIcons] || LegacyMFCIcons['earthen-pot']}
            </div>
          )}
          
          {hasNew3DModel && (
            <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              3D
            </div>
          )}
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{design.name}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cost:</span>
              <span className="font-medium text-green-600">{design.cost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Power:</span>
              <span className="font-medium text-primary">{design.powerOutput}</span>
            </div>
          </div>
          
          {/* Show key features for new designs */}
          {hasNew3DModel && design.materials.features && (
            <div className="mt-2 text-xs text-gray-500 italic">
              {design.materials.features}
            </div>
          )}
        </div>
        
        <button className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
          {hasNew3DModel ? 'Explore 3D Model' : 'Select Design'}
        </button>
      </div>
    </div>
  )
}