'use client'

import { useState, useEffect } from 'react'
import { Button } from '@messai/ui'
import { ChevronDown, ChevronUp, Activity, Zap, Thermometer, Beaker } from 'lucide-react'

interface ParameterControlsProps {
  onParameterChange: (param: string, value: number) => void
  initialValues?: Record<string, number>
}

export default function ParameterControls({ 
  onParameterChange, 
  initialValues = {} 
}: ParameterControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [parameters, setParameters] = useState({
    temperature: initialValues.temperature || 25,
    pH: initialValues.pH || 7.0,
    flowRate: initialValues.flowRate || 1.0,
    voltage: initialValues.voltage || 0.5,
    conductivity: initialValues.conductivity || 1000,
    biomass: initialValues.biomass || 0.7,
    ...initialValues
  })

  // Live parameter monitoring simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setParameters(prev => ({
        ...prev,
        voltage: prev.voltage + (Math.random() - 0.5) * 0.05,
        biomass: Math.max(0.1, Math.min(1.0, prev.biomass + (Math.random() - 0.5) * 0.02))
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleParameterChange = (param: string, value: number) => {
    setParameters(prev => ({ ...prev, [param]: value }))
    onParameterChange(param, value)
  }

  const parameterGroups = [
    {
      title: 'Environmental',
      icon: <Thermometer className="w-4 h-4" />,
      params: [
        { key: 'temperature', label: 'Temperature', value: parameters.temperature, unit: '°C', min: 15, max: 40, step: 0.5 },
        { key: 'pH', label: 'pH Level', value: parameters.pH, unit: '', min: 5, max: 9, step: 0.1 },
        { key: 'conductivity', label: 'Conductivity', value: parameters.conductivity, unit: 'μS/cm', min: 100, max: 5000, step: 50 }
      ]
    },
    {
      title: 'Flow Dynamics',
      icon: <Activity className="w-4 h-4" />,
      params: [
        { key: 'flowRate', label: 'Flow Rate', value: parameters.flowRate, unit: 'mL/min', min: 0.1, max: 5.0, step: 0.1 },
        { key: 'pressure', label: 'Pressure', value: parameters.pressure || 101.3, unit: 'kPa', min: 95, max: 110, step: 0.1 }
      ]
    },
    {
      title: 'Electrochemical',
      icon: <Zap className="w-4 h-4" />,
      params: [
        { key: 'voltage', label: 'Output Voltage', value: parameters.voltage, unit: 'V', min: 0, max: 1.5, step: 0.01, readOnly: true },
        { key: 'current', label: 'Current', value: parameters.current || 0.25, unit: 'mA', min: 0, max: 2, step: 0.01, readOnly: true }
      ]
    },
    {
      title: 'Biological',
      icon: <Beaker className="w-4 h-4" />,
      params: [
        { key: 'biomass', label: 'Biomass Density', value: parameters.biomass, unit: 'g/L', min: 0.1, max: 2.0, step: 0.1, readOnly: true },
        { key: 'substrate', label: 'Substrate Conc.', value: parameters.substrate || 1.5, unit: 'g/L', min: 0.1, max: 5.0, step: 0.1 }
      ]
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div 
        className="p-4 border-b border-gray-200 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Live Parameters</h3>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-6">
          {parameterGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                {group.icon}
                {group.title}
              </div>
              
              <div className="space-y-3">
                {group.params.map((param) => (
                  <div key={param.key} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">{param.label}</label>
                      <span className="text-sm font-mono text-gray-900">
                        {param.value.toFixed(param.step < 0.1 ? 2 : 1)}{param.unit}
                      </span>
                    </div>
                    
                    {param.readOnly ? (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${((param.value - param.min) / (param.max - param.min)) * 100}%` 
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={param.value}
                        onChange={(e) => handleParameterChange(param.key, parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #10b981 0%, #10b981 ${((param.value - param.min) / (param.max - param.min)) * 100}%, #e5e7eb ${((param.value - param.min) / (param.max - param.min)) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Reset
              </Button>
              <Button variant="primary" size="sm" className="flex-1">
                Export Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}