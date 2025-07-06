'use client'

import dynamic from 'next/dynamic'
import { DesignType } from '@messai/ui'

// Dynamic import of the lightweight 3D component for cards
const MESSModel3DLite = dynamic(
  () => import('@messai/ui').then(mod => mod.MESSModel3DLite),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
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

export default function MFCDesignCard({ design, onSelect }: MFCDesignCardProps) {
  return (
    <div 
      className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(design)}
    >
      {/* 3D Model Preview */}
      <div className="relative h-48 bg-gray-50">
        <MESSModel3DLite 
          design={design.type as DesignType}
          autoRotate={true}
          rotationSpeed={0.005}
        />
        {design.materials.features && (
          <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
            Featured
          </div>
        )}
      </div>
      
      {/* Design Info */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {design.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cost:</span>
            <span className="font-medium text-gray-900">{design.cost}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Power Output:</span>
            <span className="font-medium text-gray-900">{design.powerOutput}</span>
          </div>
        </div>
        
        {/* Key Features */}
        {design.materials.features && (
          <p className="text-sm text-gray-600 mb-4 italic">
            {design.materials.features}
          </p>
        )}
        
        {/* Action Button */}
        <button className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition-colors font-medium">
          View Details
        </button>
      </div>
    </div>
  )
}