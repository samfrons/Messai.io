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
      },
      {
        id: '6',
        name: "Micro MFC Chip",
        type: "micro-chip",
        cost: "$5",
        powerOutput: "10-50 mW/m²",
        materials: {
          container: "1cm³ silicon microchamber",
          electrodes: "Gold microelectrodes",
          separator: "Nafion membrane",
          features: "Lab-on-chip design"
        }
      },
      {
        id: '7',
        name: "Isolinear Bio-Chip",
        type: "isolinear-chip", 
        cost: "$25",
        powerOutput: "80-200 mW/m²",
        materials: {
          container: "Microscope slide form factor",
          electrodes: "Transparent ITO electrodes",
          design: "Star Trek inspired geometry",
          features: "Optical monitoring ports"
        }
      },
      {
        id: '8',
        name: "Benchtop Bioreactor MFC",
        type: "benchtop-bioreactor",
        cost: "$350",
        powerOutput: "1-5 W/m²",
        materials: {
          container: "Stirred tank reactor (5L)",
          electrodes: "High-surface graphite felt",
          monitoring: "pH, DO, temperature sensors",
          features: "Continuous flow operation"
        }
      },
      {
        id: '9',
        name: "Wastewater Treatment MFC",
        type: "wastewater-treatment",
        cost: "$2,500",
        powerOutput: "2-10 W/m²",
        materials: {
          container: "Modular tank system (500L)",
          electrodes: "Stainless steel mesh arrays",
          separator: "Ceramic membrane",
          features: "BOD removal + power generation"
        }
      },
      {
        id: '10',
        name: "Brewery Processing MFC",
        type: "brewery-processing",
        cost: "$1,800",
        powerOutput: "3-8 W/m²",
        materials: {
          container: "Food-grade stainless steel",
          electrodes: "Carbon brush anodes",
          substrate: "Brewery wastewater",
          features: "CIP-compatible design"
        }
      },
      {
        id: '11',
        name: "BioFacade Power Cell",
        type: "architectural-facade",
        cost: "$5,000",
        powerOutput: "10-50 W/m²",
        materials: {
          container: "Building-integrated panels",
          electrodes: "Flexible carbon composites",
          substrate: "Urban wastewater",
          features: "Weather-resistant, modular"
        }
      },
      {
        id: '12',
        name: "Benthic Sediment MFC",
        type: "benthic-fuel-cell",
        cost: "$150",
        powerOutput: "5-25 W/m²",
        materials: {
          container: "Marine-grade housing",
          electrodes: "Corrosion-resistant titanium",
          substrate: "Ocean/lake sediments",
          features: "Long-term deployment"
        }
      },
      {
        id: '13',
        name: "Kitchen Sink Bio-Cell",
        type: "kitchen-sink",
        cost: "$85",
        powerOutput: "100-500 mW/m²",
        materials: {
          container: "Under-sink installation",
          electrodes: "Food-safe carbon mesh",
          substrate: "Organic kitchen waste",
          features: "Garbage disposal integration"
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
    if (!selectedDesign) return
    
    try {
      // Generate unique experiment ID
      const experimentId = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // In real app, this would create experiment in database
      // Creating experiment: { 
      //   id: experimentId,
      //   designId: selectedDesign.id, 
      //   designType: selectedDesign.type,
      //   parameters 
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Store experiment data in localStorage for demo purposes
      const experimentData = {
        id: experimentId,
        name: parameters.name,
        designName: selectedDesign.name,
        designType: selectedDesign.type,
        status: 'setup',
        createdAt: new Date().toISOString(),
        parameters: parameters,
        stats: {
          totalMeasurements: 0,
          averagePower: 0,
          maxPower: 0,
          efficiency: 0
        }
      }
      
      // Store in localStorage
      const existingExperiments = JSON.parse(localStorage.getItem('messai-experiments') || '[]')
      existingExperiments.push(experimentData)
      localStorage.setItem('messai-experiments', JSON.stringify(existingExperiments))
      
      // Redirect to experiment view
      window.location.href = `/experiment/${experimentId}`
    } catch (error) {
      console.error('Failed to create experiment:', error)
      alert('Failed to create experiment. Please try again.')
    }
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
          designType={selectedDesign.type}
          onSubmit={handleExperimentSubmit}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* LCARS Header Section */}
      <div className="mb-8">
        <div className="flex items-stretch gap-2 mb-4">
          <div className="w-32 h-16 bg-lcars-orange rounded-l-lcars-lg" />
          <div className="flex-1 h-16 bg-lcars-orange flex items-center px-6">
            <h1 className="text-2xl font-bold text-lcars-black uppercase tracking-wider">
              MFC Design Database
            </h1>
          </div>
          <div className="w-4 h-16 bg-lcars-orange" />
          <div className="w-24 h-16 bg-lcars-cyan rounded-r-lcars" />
        </div>
        <div className="bg-lcars-black bg-opacity-50 border border-lcars-cyan rounded-lcars p-4">
          <p className="text-lcars-cyan font-medium uppercase">
            Access Starfleet Microbial Fuel Cell Research Database
          </p>
          <p className="text-lcars-tan text-sm mt-2">
            Select design configuration for detailed analysis and deployment parameters
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-lcars-black border-2 border-lcars-gray rounded-lcars p-6 animate-pulse">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-lcars-gray bg-opacity-30 rounded-lcars"></div>
                <div className="text-center w-full">
                  <div className="h-6 bg-lcars-gray bg-opacity-30 rounded mb-2 w-3/4 mx-auto"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-lcars-gray bg-opacity-30 rounded w-1/2 mx-auto"></div>
                    <div className="h-4 bg-lcars-gray bg-opacity-30 rounded w-2/3 mx-auto"></div>
                  </div>
                </div>
                <div className="w-full h-10 bg-lcars-gray bg-opacity-30 rounded-lcars"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {designs.map((design) => (
            <MFCDesignCard
              key={design.id}
              design={design}
              onSelect={handleDesignSelect}
            />
          ))}
        </div>
      )}

      {/* LCARS Info Panel */}
      <div className="mt-8">
        <div className="flex items-stretch gap-2 mb-4">
          <div className="w-24 h-12 bg-lcars-purple rounded-l-lcars" />
          <div className="flex-1 h-12 bg-lcars-purple flex items-center px-6">
            <h2 className="text-lg font-bold text-lcars-black uppercase">
              Operational Procedures
            </h2>
          </div>
          <div className="w-32 h-12 bg-lcars-purple rounded-r-lcars-lg" />
        </div>
        <div className="bg-lcars-black bg-opacity-50 border border-lcars-purple rounded-lcars p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-lcars-gold text-lcars-black rounded-lcars flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                01
              </div>
              <h3 className="text-lg font-bold text-lcars-gold mb-2 uppercase">Select Design</h3>
              <p className="text-lcars-tan text-sm">Choose from our pre-validated MFC configurations based on your budget and power requirements.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-lcars-cyan text-lcars-black rounded-lcars flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                02
              </div>
              <h3 className="text-lg font-bold text-lcars-cyan mb-2 uppercase">Configure Parameters</h3>
              <p className="text-lcars-tan text-sm">Set your experimental conditions including temperature, pH, and substrate concentration.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-lcars-orange text-lcars-black rounded-lcars flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                03
              </div>
              <h3 className="text-lg font-bold text-lcars-orange mb-2 uppercase">Track & Analyze</h3>
              <p className="text-lcars-tan text-sm">Monitor real-time data, get AI predictions, and optimize your microbial fuel cell performance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}