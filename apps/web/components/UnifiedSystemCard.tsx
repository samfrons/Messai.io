'use client'

interface UnifiedSystemCardProps {
  system?: any
  onSelect?: (system: any) => void
}

export default function UnifiedSystemCard({ system, onSelect }: UnifiedSystemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
         onClick={() => onSelect?.(system)}>
      <h3 className="text-lg font-semibold mb-2">{system?.name || 'System Name'}</h3>
      <p className="text-gray-600">{system?.description || 'System Description'}</p>
    </div>
  )
}