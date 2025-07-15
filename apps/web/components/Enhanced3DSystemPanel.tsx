'use client'

interface Enhanced3DSystemPanelProps {
  system?: any
  isOpen?: boolean
  onClose?: () => void
}

export default function Enhanced3DSystemPanel({ system, isOpen, onClose }: Enhanced3DSystemPanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{system?.name || 'System Panel'}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
          <p className="text-gray-500">3D System Panel Component</p>
        </div>
      </div>
    </div>
  )
}