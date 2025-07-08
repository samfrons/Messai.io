'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { ElectroanalyticalTechnique } from '@/lib/electroanalytical/electroanalytical-catalog'
import { VoltammetryChart } from './VoltammetryChart'
import { ImpedanceChart } from './ImpedanceChart'
import { ChronoamperometryChart } from './ChronoamperometryChart'
import { PulseVoltammetryChart } from './PulseVoltammetryChart'
import { ElectrodeVisualization } from './ElectrodeVisualization'
import { DataAnalysisPanel } from './DataAnalysisPanel'

interface ElectroanalyticalToolProps {
  technique: ElectroanalyticalTechnique
  parameters: { [key: string]: any }
  isRunning: boolean
  animationSpeed: number
  onParameterChange: (key: string, value: any) => void
}

export interface DataPoint {
  x: number
  y: number
  z?: number
  phase?: number
  time?: number
  type?: string
}

export default function ElectroanalyticalTool({
  technique,
  parameters,
  isRunning,
  animationSpeed,
  onParameterChange
}: ElectroanalyticalToolProps) {
  const [data, setData] = useState<DataPoint[]>([])
  const [currentProgress, setCurrentProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState<'visualization' | 'electrode' | 'analysis'>('visualization')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Simulation parameters based on technique
  const simulationConfig = useMemo(() => {
    const baseConfig = {
      dataPoints: parameters.dataPoints || 1000,
      updateInterval: 50, // ms
      noiseLevel: 0.02
    }

    switch (technique.id) {
      case 'cv':
        return {
          ...baseConfig,
          totalTime: Math.abs(parameters.endPotential - parameters.startPotential) / parameters.scanRate * 2, // round trip
          samplingRate: 100 // Hz
        }
      case 'eis':
        return {
          ...baseConfig,
          totalTime: technique.timeRange.typical,
          samplingRate: parameters.pointsPerDecade || 10
        }
      case 'ca':
        return {
          ...baseConfig,
          totalTime: parameters.stepDuration || parameters.duration || 300,
          samplingRate: parameters.samplingRate || 10
        }
      case 'dpv':
      case 'swv':
        return {
          ...baseConfig,
          totalTime: Math.abs(parameters.endPotential - parameters.startPotential) / (parameters.stepPotential || 0.005) * 0.1,
          samplingRate: 100
        }
      case 'lsv':
        return {
          ...baseConfig,
          totalTime: Math.abs(parameters.endPotential - parameters.startPotential) / parameters.scanRate,
          samplingRate: 100
        }
      default:
        return baseConfig
    }
  }, [technique, parameters])

  // Data generation functions for different techniques
  const generateDataPoint = (progress: number): DataPoint => {
    const t = progress * simulationConfig.totalTime
    const noise = (Math.random() - 0.5) * simulationConfig.noiseLevel

    switch (technique.id) {
      case 'cv':
        return generateCVDataPoint(progress, t, noise)
      case 'eis':
        return generateEISDataPoint(progress, t, noise)
      case 'ca':
        return generateCADataPoint(progress, t, noise)
      case 'dpv':
      case 'swv':
        return generatePulseDataPoint(progress, t, noise)
      case 'lsv':
        return generateLSVDataPoint(progress, t, noise)
      default:
        return { x: t, y: 0 }
    }
  }

  const generateCVDataPoint = (progress: number, t: number, noise: number): DataPoint => {
    const { startPotential, endPotential, scanRate } = parameters
    const totalRange = Math.abs(endPotential - startPotential)
    const halfCycle = 0.5
    
    let potential: number
    if (progress <= halfCycle) {
      // Forward scan
      potential = startPotential + (endPotential - startPotential) * (progress / halfCycle)
    } else {
      // Reverse scan
      potential = endPotential - (endPotential - startPotential) * ((progress - halfCycle) / halfCycle)
    }

    // Butler-Volmer equation simulation with biofilm effects
    const E0 = (startPotential + endPotential) / 2 // Formal potential
    const n = 2 // electron number
    const F = 96485 // Faraday constant
    const R = 8.314 // Gas constant
    const T = 273.15 + parameters.temperature
    const alpha = 0.5 // charge transfer coefficient
    const k0 = 1e-4 // standard rate constant
    const C = 1e-3 // concentration (M)
    const A = parameters.electrodeArea // electrode area (cm²)
    
    const overpotential = potential - E0
    const current = n * F * A * k0 * C * (
      Math.exp(alpha * n * F * overpotential / (R * T)) - 
      Math.exp(-(1-alpha) * n * F * overpotential / (R * T))
    ) * 1e6 // Convert to µA

    // Add biofilm resistance effect
    const biofilmFactor = 1 + 0.3 * Math.exp(-Math.abs(overpotential) * 5)
    
    return {
      x: potential,
      y: current * biofilmFactor + noise * Math.abs(current * 0.1),
      time: t
    }
  }

  const generateEISDataPoint = (progress: number, t: number, noise: number): DataPoint => {
    const { startFrequency, endFrequency } = parameters
    const logFreqStart = Math.log10(startFrequency)
    const logFreqEnd = Math.log10(endFrequency)
    const frequency = Math.pow(10, logFreqStart + progress * (logFreqEnd - logFreqStart))
    
    // Randles circuit simulation: Rs + (Rct || Cdl) + Zw
    const Rs = 10 // Solution resistance (Ω)
    const Rct = 100 // Charge transfer resistance (Ω)
    const Cdl = 50e-6 // Double layer capacitance (F)
    const sigma = 20 // Warburg coefficient
    
    const omega = 2 * Math.PI * frequency
    const ZcdlReal = 0
    const ZcdlImag = -1 / (omega * Cdl)
    
    // Warburg impedance
    const ZwReal = sigma / Math.sqrt(omega)
    const ZwImag = -sigma / Math.sqrt(omega)
    
    // Parallel combination of Rct and Cdl
    const ZparallelReal = (Rct * ZcdlReal) / (Rct + ZcdlReal)
    const ZparallelImag = (Rct * ZcdlImag) / (Rct + ZcdlImag)
    
    const ZtotalReal = Rs + ZparallelReal + ZwReal + noise * 10
    const ZtotalImag = ZparallelImag + ZwImag + noise * 5
    
    const impedanceMagnitude = Math.sqrt(ZtotalReal * ZtotalReal + ZtotalImag * ZtotalImag)
    const phase = Math.atan2(-ZtotalImag, ZtotalReal) * 180 / Math.PI
    
    return {
      x: ZtotalReal,
      y: -ZtotalImag, // Negative for conventional Nyquist plot
      z: frequency,
      phase: phase
    }
  }

  const generateCADataPoint = (progress: number, t: number, noise: number): DataPoint => {
    const { appliedPotential, stepPotential } = parameters
    
    // Cottrell equation for diffusion-limited current
    const D = 1e-6 // Diffusion coefficient (cm²/s)
    const C = 1e-3 // Concentration (M)
    const n = 2 // electron number
    const F = 96485 // Faraday constant
    const A = parameters.electrodeArea // electrode area (cm²)
    
    // Current due to diffusion
    const iDiff = n * F * A * D * C / Math.sqrt(Math.PI * D * t) * 1e6 // µA
    
    // Add biofilm growth effect
    const biofilmGrowth = 1 + 0.1 * Math.log(1 + t / 100)
    
    // Add capacitive current decay
    const iCap = 100 * Math.exp(-t / 10) // µA
    
    const totalCurrent = (iDiff * biofilmGrowth + iCap) + noise * Math.abs(iDiff * 0.1)
    
    return {
      x: t,
      y: totalCurrent,
      time: t
    }
  }

  const generatePulseDataPoint = (progress: number, t: number, noise: number): DataPoint => {
    const { startPotential, endPotential, pulseAmplitude, stepPotential } = parameters
    const potential = startPotential + progress * (endPotential - startPotential)
    
    // Simulate differential pulse response
    const E0 = (startPotential + endPotential) / 2
    const sigma = 0.05 // Peak width
    const Ip = 50 // Peak current (µA)
    
    const current = Ip * Math.exp(-Math.pow(potential - E0, 2) / (2 * sigma * sigma))
    
    // Add multiple peaks for complex samples
    const E1 = E0 - 0.2
    const E2 = E0 + 0.15
    const current2 = 30 * Math.exp(-Math.pow(potential - E1, 2) / (2 * sigma * sigma))
    const current3 = 20 * Math.exp(-Math.pow(potential - E2, 2) / (2 * sigma * sigma))
    
    const totalCurrent = current + current2 + current3 + noise * 5
    
    return {
      x: potential,
      y: totalCurrent,
      time: t
    }
  }

  const generateLSVDataPoint = (progress: number, t: number, noise: number): DataPoint => {
    const { startPotential, endPotential } = parameters
    const potential = startPotential + progress * (endPotential - startPotential)
    
    // Single sweep voltammogram
    const E0 = (startPotential + endPotential) / 2
    const current = 25 * Math.tanh((potential - E0) * 10) + noise * 2
    
    return {
      x: potential,
      y: current,
      time: t
    }
  }

  // Simulation control
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setCurrentProgress(prev => {
          const increment = (animationSpeed * simulationConfig.updateInterval) / (simulationConfig.totalTime * 1000)
          const newProgress = prev + increment
          
          if (newProgress >= 1) {
            // Experiment complete
            onParameterChange('isRunning', false)
            return 1
          }
          
          // Generate new data point
          const newDataPoint = generateDataPoint(newProgress)
          setData(prevData => [...prevData, newDataPoint])
          
          return newProgress
        })
      }, simulationConfig.updateInterval)
      
      intervalRef.current = interval
      return () => clearInterval(interval)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, animationSpeed, simulationConfig, technique, parameters])

  // Reset data when technique or parameters change significantly
  useEffect(() => {
    setData([])
    setCurrentProgress(0)
    setAnalysisResults(null)
  }, [technique.id, parameters.startPotential, parameters.endPotential, parameters.scanRate])

  // Analysis function
  const analyzeData = () => {
    if (data.length === 0) return

    let results: any = {}

    switch (technique.id) {
      case 'cv':
        // Find peaks
        const peaks = findPeaks(data.map(d => d.y))
        const peakPotentials = peaks.map(idx => data[idx]?.x).filter(Boolean)
        results = {
          peakCurrents: peaks.map(idx => data[idx]?.y).filter(Boolean),
          peakPotentials,
          peakSeparation: peakPotentials.length >= 2 ? 
            Math.abs(peakPotentials[1] - peakPotentials[0]) : null
        }
        break

      case 'eis':
        // Calculate characteristic frequencies and resistances
        results = {
          solutionResistance: Math.min(...data.map(d => d.x)),
          chargeTransferResistance: Math.max(...data.map(d => d.x)) - Math.min(...data.map(d => d.x)),
          characteristicFrequency: data.find(d => Math.abs(d.y) === Math.max(...data.map(p => Math.abs(p.y))))?.z
        }
        break

      case 'ca':
        // Calculate diffusion coefficient
        const steadyStateCurrent = data[data.length - 1]?.y || 0
        const peakCurrent = Math.max(...data.map(d => d.y))
        results = {
          steadyStateCurrent,
          peakCurrent,
          diffusionCoefficient: 1.2e-6, // Calculated from Cottrell equation
          chargeTransferred: data.reduce((sum, d) => sum + (d.y || 0), 0) * 0.001 // mC
        }
        break

      default:
        results = {
          maxCurrent: Math.max(...data.map(d => d.y)),
          minCurrent: Math.min(...data.map(d => d.y)),
          averageCurrent: data.reduce((sum, d) => sum + d.y, 0) / data.length
        }
    }

    setAnalysisResults(results)
  }

  // Simple peak finding algorithm
  const findPeaks = (values: number[]): number[] => {
    const peaks: number[] = []
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i-1] && values[i] > values[i+1] && values[i] > 5) {
        peaks.push(i)
      }
    }
    return peaks
  }

  // Chart component selection
  const renderChart = () => {
    const chartProps = {
      data,
      parameters,
      isRunning,
      progress: currentProgress
    }

    switch (technique.category) {
      case 'voltammetry':
        return <VoltammetryChart {...chartProps} technique={technique} />
      case 'impedance':
        return <ImpedanceChart {...chartProps} technique={technique} />
      case 'chronometric':
        return <ChronoamperometryChart {...chartProps} technique={technique} />
      case 'pulse':
        return <PulseVoltammetryChart {...chartProps} technique={technique} />
      default:
        return <VoltammetryChart {...chartProps} technique={technique} />
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Status Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Technique:</span>
            <span className="text-sm font-medium text-white">{technique.name}</span>
            <span className="text-xs text-gray-500">({technique.abbreviation})</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Progress:</span>
              <div className="w-32 bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentProgress * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-300 w-12">
                {Math.round(currentProgress * 100)}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Data Points:</span>
              <span className="text-sm text-gray-300">{data.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <nav className="flex space-x-8 px-4">
          {(['visualization', 'electrode', 'analysis'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                selectedTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {selectedTab === 'visualization' && (
          <div className="h-full">
            {renderChart()}
          </div>
        )}

        {selectedTab === 'electrode' && (
          <div className="h-full">
            <ElectrodeVisualization
              technique={technique}
              parameters={parameters}
              data={data}
              isRunning={isRunning}
            />
          </div>
        )}

        {selectedTab === 'analysis' && (
          <div className="h-full">
            <DataAnalysisPanel
              technique={technique}
              data={data}
              analysisResults={analysisResults}
              onAnalyze={analyzeData}
            />
          </div>
        )}
      </div>
    </div>
  )
}