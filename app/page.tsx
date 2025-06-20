'use client'

import { useEffect, useState } from 'react'
import MFCDesignCard from '@/components/MFCDesignCard'
import ParameterForm from '@/components/ParameterForm'

interface MFCDesign {
  id: string
  name: string
  type: string
  cost: string
  powerOutput: string
  materials: any
}

export default function HomePage() {
  const [designs, setDesigns] = useState<MFCDesign[]>([])
  const [selectedDesign, setSelectedDesign] = useState<MFCDesign | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockDesigns: MFCDesign[] = [
      {
        id: '1',
        name: "Earthen Pot MFC",
        type: "earthen-pot",
        cost: "$1",
        powerOutput: "100-500 mW/m²",
        materials: {
          container: "Clay pot",
          electrodes: "Carbon cloth",
          separator: "Natural clay membrane"
        }
      },
      {
        id: '2',
        name: "Cardboard MFC",
        type: "cardboard",
        cost: "$0.50",
        powerOutput: "50-200 mW/m²",
        materials: {
          container: "Corrugated cardboard",
          electrodes: "Activated carbon",
          treatment: "Thermal treatment"
        }
      },
      {
        id: '3',
        name: "Mason Jar MFC",
        type: "mason-jar",
        cost: "$10",
        powerOutput: "200-400 mW/m²",
        materials: {
          container: "Glass mason jar",
          electrodes: "Graphite rods",
          separator: "Salt bridge"
        }
      },
      {
        id: '4',
        name: "3D Printed MFC",
        type: "3d-printed",
        cost: "$30",
        powerOutput: "300-750 mW/m²",
        materials: {
          container: "PLA plastic chambers",
          design: "Hexagonal geometry",
          electrodes: "Carbon fiber"
        }
      },
      {
        id: '5',
        name: "Wetland MFC",
        type: "wetland",
        cost: "$100",
        powerOutput: "500-3000 mW/m²",
        materials: {
          container: "Plant bed system",
          electrodes: "Buried carbon electrodes",
          plants: "Aquatic vegetation"
        }
      }
    ]
    
    setTimeout(() => {
      setDesigns(mockDesigns)
      setLoading(false)
    }, 500)
  }, [])

  const handleDesignSelect = (design: MFCDesign) => {
    setSelectedDesign(design)
  }

  const handleExperimentSubmit = async (parameters: any) => {
    // In real app, this would create experiment in database
    console.log('Creating experiment:', { designId: selectedDesign?.id, parameters })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirect to experiment view
    window.location.href = `/experiment/mock-experiment-id`
  }

  const handleCancel = () => {
    setSelectedDesign(null)
  }

  if (selectedDesign) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ParameterForm
          designId={selectedDesign.id}
          designName={selectedDesign.name}
          onSubmit={handleExperimentSubmit}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          MFC Design Catalog
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose from our collection of validated microbial fuel cell designs. 
          Each design is optimized for different cost points and power outputs.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border-2 border-gray-200 p-6 animate-pulse">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                <div className="text-center w-full">
                  <div className="h-6 bg-gray-300 rounded mb-2 w-3/4 mx-auto"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto"></div>
                  </div>
                </div>
                <div className="w-full h-10 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <MFCDesignCard
              key={design.id}
              design={design}
              onSelect={handleDesignSelect}
            />
          ))}
        </div>
      )}

      <div className="mt-16 bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          How it Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold mb-2">Select Design</h3>
            <p className="text-gray-600">Choose from our pre-validated MFC configurations based on your budget and power requirements.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold mb-2">Configure Parameters</h3>
            <p className="text-gray-600">Set your experimental conditions including temperature, pH, and substrate concentration.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold mb-2">Track & Analyze</h3>
            <p className="text-gray-600">Monitor real-time data, get AI predictions, and optimize your microbial fuel cell performance.</p>
          </div>
        </div>
      </div>
    </div>
  )
}