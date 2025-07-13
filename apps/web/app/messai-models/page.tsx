'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Play, Pause, RotateCcw, Settings, Info } from 'lucide-react'
import MultiScaleModel3D from '@/components/messai-models/MultiScaleModel3D'
import ModelParameterPanel from '@/components/messai-models/ModelParameterPanel'
import PerformanceMonitor from '@/components/messai-models/PerformanceMonitor'
import { multiScaleModels } from '@/lib/multi-scale-catalog'
import type { ModelStage, ModelParameters } from '@/lib/multi-scale-catalog'

export default function MessaiModelsPage() {
  const [selectedStage, setSelectedStage] = useState<ModelStage>('micro-scale')
  const [isAnimating, setIsAnimating] = useState(true)
  const [parameters, setParameters] = useState<ModelParameters>({
    temperature: 25,
    pH: 7.0,
    substrateConcentration: 1.5,
    flowRate: 1.0,
    biofilmThickness: 100,
    currentDensity: 0
  })
  const [performanceData, setPerformanceData] = useState({
    powerDensity: 0,
    efficiency: 0,
    voltage: 0
  })

  const currentModel = multiScaleModels[selectedStage]

  const handleParameterChange = (newParams: Partial<ModelParameters>) => {
    setParameters(prev => ({ ...prev, ...newParams }))
  }

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  const resetView = () => {
    setParameters({
      temperature: 25,
      pH: 7.0,
      substrateConcentration: 1.5,
      flowRate: 1.0,
      biofilmThickness: 100,
      currentDensity: 0
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Multi-Scale MESS Models
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Progressive scaling approach from microscopic testing to industrial deployment
            with four distinct stages of microbial electrochemical systems
          </p>
        </div>

        {/* Stage Selection */}
        <Card className="bg-black/40 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-white">Model Stages</CardTitle>
            <CardDescription className="text-blue-200">
              Select a scale to explore detailed 3D visualization and parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedStage} onValueChange={(value) => setSelectedStage(value as ModelStage)}>
              <TabsList className="grid w-full grid-cols-4 bg-slate-800">
                <TabsTrigger value="micro-scale" className="text-white">
                  Micro-Scale
                  <Badge variant="secondary" className="ml-2">75×25mm</Badge>
                </TabsTrigger>
                <TabsTrigger value="voltaic-pile" className="text-white">
                  Voltaic Pile
                  <Badge variant="secondary" className="ml-2">150×200mm</Badge>
                </TabsTrigger>
                <TabsTrigger value="bench-scale" className="text-white">
                  Bench-Scale
                  <Badge variant="secondary" className="ml-2">250×200mm</Badge>
                </TabsTrigger>
                <TabsTrigger value="industrial" className="text-white">
                  Industrial
                  <Badge variant="secondary" className="ml-2">Modular</Badge>
                </TabsTrigger>
              </TabsList>

              {/* Model Details */}
              <div className="mt-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-blue-400/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        {currentModel.name}
                      </CardTitle>
                      <CardDescription className="text-blue-200">
                        {currentModel.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Purpose:</span>
                          <p className="text-white">{currentModel.purpose}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Volume:</span>
                          <p className="text-white">{currentModel.volume}</p>
                        </div>
                      </div>
                      <Separator className="bg-blue-500/20" />
                      <div>
                        <span className="text-gray-400">Key Features:</span>
                        <ul className="mt-2 space-y-1">
                          {currentModel.keyFeatures.map((feature, index) => (
                            <li key={index} className="text-blue-200 text-sm flex items-start gap-2">
                              <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Controls */}
                  <Card className="bg-slate-800/50 border-blue-400/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={toggleAnimation}
                          variant="outline"
                          size="sm"
                          className="border-blue-400 text-blue-200 hover:bg-blue-500/20"
                        >
                          {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          {isAnimating ? 'Pause' : 'Play'}
                        </Button>
                        <Button
                          onClick={resetView}
                          variant="outline"
                          size="sm"
                          className="border-blue-400 text-blue-200 hover:bg-blue-500/20"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                      <PerformanceMonitor data={performanceData} />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* 3D Visualization and Parameters */}
              <TabsContent value={selectedStage} className="mt-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* 3D Model */}
                  <div className="lg:col-span-2">
                    <Card className="bg-black/60 border-blue-500/30">
                      <CardHeader>
                        <CardTitle className="text-white">3D Visualization</CardTitle>
                        <CardDescription className="text-blue-200">
                          Interactive model with real-time animations
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="h-[600px] rounded-lg overflow-hidden">
                          <MultiScaleModel3D
                            stage={selectedStage}
                            parameters={parameters}
                            isAnimating={isAnimating}
                            onPerformanceUpdate={setPerformanceData}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Parameter Panel */}
                  <div>
                    <ModelParameterPanel
                      stage={selectedStage}
                      parameters={parameters}
                      onParameterChange={handleParameterChange}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}