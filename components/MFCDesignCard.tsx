'use client'

import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with Three.js
const Design3DPreview = dynamic(
  () => import('./DesignSpecific3DModels').then(mod => ({ default: mod.Design3DPreview })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-lcars-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
)

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
  
  // Map design types to LCARS color classes
  const getDesignColorClasses = (type: string) => {
    const colorMap: { [key: string]: { bg: string, border: string, text: string, shadow: string } } = {
      'earthen-pot': { 
        bg: 'bg-lcars-orange', 
        border: 'border-lcars-orange', 
        text: 'text-lcars-orange',
        shadow: 'hover:shadow-lcars-orange/50'
      },
      'cardboard': { 
        bg: 'bg-lcars-tan', 
        border: 'border-lcars-tan', 
        text: 'text-lcars-tan',
        shadow: 'hover:shadow-lcars-tan/50'
      },
      'mason-jar': { 
        bg: 'bg-lcars-cyan', 
        border: 'border-lcars-cyan', 
        text: 'text-lcars-cyan',
        shadow: 'hover:shadow-lcars-cyan/50'
      },
      '3d-printed': { 
        bg: 'bg-lcars-blue', 
        border: 'border-lcars-blue', 
        text: 'text-lcars-blue',
        shadow: 'hover:shadow-lcars-blue/50'
      },
      'wetland': { 
        bg: 'bg-lcars-success', 
        border: 'border-lcars-success', 
        text: 'text-lcars-success',
        shadow: 'hover:shadow-lcars-success/50'
      },
      'micro-chip': { 
        bg: 'bg-lcars-purple', 
        border: 'border-lcars-purple', 
        text: 'text-lcars-purple',
        shadow: 'hover:shadow-lcars-purple/50'
      },
      'isolinear-chip': { 
        bg: 'bg-lcars-pink', 
        border: 'border-lcars-pink', 
        text: 'text-lcars-pink',
        shadow: 'hover:shadow-lcars-pink/50'
      },
      'benchtop-bioreactor': { 
        bg: 'bg-lcars-gold', 
        border: 'border-lcars-gold', 
        text: 'text-lcars-gold',
        shadow: 'hover:shadow-lcars-gold/50'
      },
      'wastewater-treatment': { 
        bg: 'bg-lcars-cyan', 
        border: 'border-lcars-cyan', 
        text: 'text-lcars-cyan',
        shadow: 'hover:shadow-lcars-cyan/50'
      },
      'brewery-processing': { 
        bg: 'bg-lcars-orange', 
        border: 'border-lcars-orange', 
        text: 'text-lcars-orange',
        shadow: 'hover:shadow-lcars-orange/50'
      },
      'architectural-facade': { 
        bg: 'bg-lcars-purple', 
        border: 'border-lcars-purple', 
        text: 'text-lcars-purple',
        shadow: 'hover:shadow-lcars-purple/50'
      },
      'benthic-fuel-cell': { 
        bg: 'bg-lcars-blue', 
        border: 'border-lcars-blue', 
        text: 'text-lcars-blue',
        shadow: 'hover:shadow-lcars-blue/50'
      },
      'kitchen-sink': { 
        bg: 'bg-lcars-tan', 
        border: 'border-lcars-tan', 
        text: 'text-lcars-tan',
        shadow: 'hover:shadow-lcars-tan/50'
      }
    }
    return colorMap[type] || { 
      bg: 'bg-lcars-orange', 
      border: 'border-lcars-orange', 
      text: 'text-lcars-orange',
      shadow: 'hover:shadow-lcars-orange/50'
    }
  }
  
  const colorClasses = getDesignColorClasses(design.type)
  
  return (
    <div 
      className={`group relative bg-lcars-black border-2 ${colorClasses.border} rounded-lcars p-4 cursor-pointer hover:shadow-lg ${colorClasses.shadow} transition-all duration-200 transform hover:scale-105`}
      onClick={() => onSelect(design)}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-2 ${colorClasses.bg} rounded-t-lcars`} />
      
      <div className="flex flex-col items-center space-y-4 pt-4">
        <div className="relative">
          {hasNew3DModel ? (
            <div className="w-full h-24 bg-lcars-black border border-lcars-gray rounded-lcars overflow-hidden">
              <Design3DPreview designType={design.type} />
            </div>
          ) : (
            <div className={`p-4 bg-lcars-black border ${colorClasses.border} rounded-lcars`}>
              {LegacyMFCIcons[design.type as keyof typeof LegacyMFCIcons] || LegacyMFCIcons['earthen-pot']}
            </div>
          )}
          
          {hasNew3DModel && (
            <div className="absolute top-1 right-1 bg-lcars-purple text-lcars-black text-xs px-2 py-1 rounded-full font-bold">
              3D
            </div>
          )}
        </div>
        
        <div className="text-center w-full">
          <h3 className={`text-lg font-bold ${colorClasses.text} mb-2 uppercase tracking-wider`}>
            {design.name}
          </h3>
          
          {/* LCARS-style data display */}
          <div className="space-y-1 text-sm mb-3">
            <div className="flex items-center justify-between bg-lcars-black bg-opacity-50 px-3 py-1 rounded">
              <span className="text-lcars-gray uppercase text-xs">Cost Index:</span>
              <span className={`font-bold ${colorClasses.text}`}>{design.cost}</span>
            </div>
            <div className="flex items-center justify-between bg-lcars-black bg-opacity-50 px-3 py-1 rounded">
              <span className="text-lcars-gray uppercase text-xs">Power Output:</span>
              <span className={`font-bold ${colorClasses.text}`}>{design.powerOutput}</span>
            </div>
          </div>
          
          {/* Show key features for new designs */}
          {hasNew3DModel && design.materials.features && (
            <div className="mt-2 text-xs text-lcars-tan italic px-2">
              {design.materials.features}
            </div>
          )}
        </div>
        
        <button className={`w-full ${colorClasses.bg} text-lcars-black py-3 px-4 rounded-lcars hover:opacity-80 transition-opacity font-bold uppercase tracking-wider`}>
          {hasNew3DModel ? 'Access 3D Schema' : 'Select Configuration'}
        </button>
      </div>
      
      {/* Bottom accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${colorClasses.bg} rounded-b-lcars opacity-50`} />
    </div>
  )
}