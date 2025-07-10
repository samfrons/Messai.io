'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { 
  Thermometer, 
  Droplets, 
  Zap, 
  Activity, 
  Beaker, 
  Settings,
  Info,
  RotateCcw
} from 'lucide-react'
import type { ModelStage, ModelParameters } from '@/lib/multi-scale-catalog'
import { 
  multiScaleModels, 
  advancedMaterials, 
  bacterialSpecies,
  getMaterialsByType 
} from '@/lib/multi-scale-catalog'

interface ModelParameterPanelProps {
  stage: ModelStage
  parameters: ModelParameters
  onParameterChange: (params: Partial<ModelParameters>) => void
  className?: string
}

export default function ModelParameterPanel({
  stage,
  parameters,
  onParameterChange,
  className = ''
}: ModelParameterPanelProps) {
  const [selectedMaterial, setSelectedMaterial] = useState('graphene-oxide')
  const [selectedBacteria, setSelectedBacteria] = useState('geobacter-sulfurreducens')
  
  const model = multiScaleModels[stage]
  const anodeMaterials = getMaterialsByType('anode')
  const cathodeMaterials = getMaterialsByType('cathode')
  
  const resetParameters = () => {
    onParameterChange({
      temperature: 25,
      pH: 7.0,
      substrateConcentration: 1.5,
      flowRate: 1.0,
      biofilmThickness: 100,
      currentDensity: 0
    })
  }
  
  const getParameterColor = (value: number, min: number, max: number) => {
    const normalized = (value - min) / (max - min)
    if (normalized < 0.3) return 'text-red-400'
    if (normalized > 0.7) return 'text-green-400'
    return 'text-yellow-400'
  }
  
  const getParameterStatus = (param: keyof ModelParameters) => {
    const ranges = model.parameterRanges
    const value = parameters[param]
    
    if (param === 'currentDensity') return 'text-blue-400' // Calculated value
    
    const range = ranges[param as keyof typeof ranges]
    if (!range) return 'text-gray-400'
    
    if (value < range.min * 0.8 || value > range.max * 1.2) return 'text-red-400'
    if (value < range.min || value > range.max) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <Card className={`bg-slate-800/50 border-blue-400/30 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Model Parameters
        </CardTitle>
        <CardDescription className="text-blue-200">
          Adjust system parameters for {model.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            onClick={resetParameters}
            variant="outline"
            size="sm"
            className="border-blue-400 text-blue-200 hover:bg-blue-500/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Badge variant="outline" className="border-blue-400 text-blue-200">
            {stage}
          </Badge>
        </div>
        
        <Separator className="bg-blue-500/20" />
        
        {/* Environmental Parameters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-medium">
            <Thermometer className="w-4 h-4" />
            Environmental Conditions
          </div>
          
          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-blue-200">Temperature</Label>
              <div className={`text-sm ${getParameterStatus('temperature')}`}>
                {parameters.temperature}°C
              </div>
            </div>
            <Slider
              value={[parameters.temperature]}
              onValueChange={(value) => onParameterChange({ temperature: value[0] })}
              min={model.parameterRanges.temperature.min}
              max={model.parameterRanges.temperature.max}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{model.parameterRanges.temperature.min}°C</span>
              <span>{model.parameterRanges.temperature.max}°C</span>
            </div>
          </div>
          
          {/* pH */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-blue-200">pH</Label>
              <div className={`text-sm ${getParameterStatus('pH')}`}>
                {parameters.pH.toFixed(1)}
              </div>
            </div>
            <Slider
              value={[parameters.pH]}
              onValueChange={(value) => onParameterChange({ pH: value[0] })}
              min={model.parameterRanges.pH.min}
              max={model.parameterRanges.pH.max}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{model.parameterRanges.pH.min}</span>
              <span>{model.parameterRanges.pH.max}</span>
            </div>
          </div>
          
          {/* Substrate Concentration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-blue-200">Substrate Concentration</Label>
              <div className={`text-sm ${getParameterStatus('substrateConcentration')}`}>
                {parameters.substrateConcentration.toFixed(1)} g/L
              </div>
            </div>
            <Slider
              value={[parameters.substrateConcentration]}
              onValueChange={(value) => onParameterChange({ substrateConcentration: value[0] })}
              min={model.parameterRanges.substrateConcentration.min}
              max={model.parameterRanges.substrateConcentration.max}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{model.parameterRanges.substrateConcentration.min}</span>
              <span>{model.parameterRanges.substrateConcentration.max}</span>
            </div>
          </div>
        </div>
        
        <Separator className="bg-blue-500/20" />
        
        {/* Flow Parameters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-medium">
            <Droplets className="w-4 h-4" />
            Flow Conditions
          </div>
          
          {/* Flow Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-blue-200">Flow Rate</Label>
              <div className={`text-sm ${getParameterStatus('flowRate')}`}>
                {parameters.flowRate.toFixed(1)} {model.parameterRanges.flowRate.unit}
              </div>
            </div>
            <Slider
              value={[parameters.flowRate]}
              onValueChange={(value) => onParameterChange({ flowRate: value[0] })}
              min={model.parameterRanges.flowRate.min}
              max={model.parameterRanges.flowRate.max}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{model.parameterRanges.flowRate.min}</span>
              <span>{model.parameterRanges.flowRate.max}</span>
            </div>
          </div>
        </div>
        
        <Separator className="bg-blue-500/20" />
        
        {/* Biological Parameters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-medium">
            <Activity className="w-4 h-4" />
            Biological System
          </div>
          
          {/* Bacterial Species Selection */}
          <div className="space-y-2">
            <Label className="text-blue-200">Bacterial Species</Label>
            <Select value={selectedBacteria} onValueChange={setSelectedBacteria}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {bacterialSpecies.map((species) => (
                  <SelectItem key={species.id} value={species.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: species.visualProperties.color }}
                      />
                      <span className="text-white">{species.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Biofilm Thickness */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-blue-200">Biofilm Thickness</Label>
              <div className={`text-sm ${getParameterStatus('biofilmThickness')}`}>
                {parameters.biofilmThickness} μm
              </div>
            </div>
            <Slider
              value={[parameters.biofilmThickness]}
              onValueChange={(value) => onParameterChange({ biofilmThickness: value[0] })}
              min={model.parameterRanges.biofilmThickness.min}
              max={model.parameterRanges.biofilmThickness.max}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{model.parameterRanges.biofilmThickness.min}</span>
              <span>{model.parameterRanges.biofilmThickness.max}</span>
            </div>
          </div>
        </div>
        
        <Separator className="bg-blue-500/20" />
        
        {/* Material Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-medium">
            <Beaker className="w-4 h-4" />
            Materials
          </div>
          
          {/* Anode Material */}
          <div className="space-y-2">
            <Label className="text-blue-200">Anode Material</Label>
            <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {anodeMaterials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: material.visualProperties.color }}
                      />
                      <span className="text-white">{material.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {material.cost.value} {material.cost.unit}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Material Properties */}
          {selectedMaterial && (
            <div className="bg-slate-700/50 p-3 rounded-lg space-y-2">
              {(() => {
                const material = anodeMaterials.find(m => m.id === selectedMaterial)
                if (!material) return null
                
                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Conductivity:</span>
                      <span className="text-white">
                        {material.conductivity.value.toLocaleString()} {material.conductivity.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Biocompatibility:</span>
                      <span className="text-white">{material.biocompatibility}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Surface Area:</span>
                      <span className="text-white">
                        {material.surfaceArea.value} {material.surfaceArea.unit}
                      </span>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </div>
        
        <Separator className="bg-blue-500/20" />
        
        {/* Current Status */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-medium">
            <Zap className="w-4 h-4" />
            Current Status
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <div className="text-xs text-gray-400">Current Density</div>
              <div className="text-lg font-semibold text-blue-400">
                {parameters.currentDensity.toFixed(1)} mA/cm²
              </div>
            </div>
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <div className="text-xs text-gray-400">Volume</div>
              <div className="text-lg font-semibold text-green-400">
                {model.volume}
              </div>
            </div>
          </div>
        </div>
        
        {/* Parameter Validation */}
        <div className="bg-slate-700/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Info className="w-4 h-4" />
            Parameter Status
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-green-400">Optimal Range</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span className="text-yellow-400">Acceptable Range</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-red-400">Out of Range</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}