'use client'

import React, { useRef, useEffect } from 'react'
import { ElectroanalyticalTechnique } from '@/lib/electroanalytical/electroanalytical-catalog'
import { DataPoint } from './ElectroanalyticalTool'

interface ElectrodeVisualizationProps {
  technique: ElectroanalyticalTechnique
  parameters: { [key: string]: any }
  data: DataPoint[]
  isRunning: boolean
}

export function ElectrodeVisualization({ technique, parameters, data, isRunning }: ElectrodeVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      const { width, height } = canvas.getBoundingClientRect()
      
      ctx.clearRect(0, 0, width, height)
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#1F2937')
      gradient.addColorStop(1, '#111827')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw electrode system
      drawElectrodeSystem(ctx, width, height)
      
      // Draw current technique visualization
      drawTechniqueVisualization(ctx, width, height)
      
      // Draw real-time data overlay
      if (data.length > 0) {
        drawDataOverlay(ctx, width, height)
      }
    }

    const drawElectrodeSystem = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const centerX = width / 2
      const centerY = height / 2

      // Draw solution background
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)' // blue-500 with opacity
      ctx.beginPath()
      ctx.roundRect(50, 100, width - 100, height - 200, 20)
      ctx.fill()

      // Draw solution label
      ctx.fillStyle = '#6B7280'
      ctx.font = '14px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`Electrolyte: ${parameters.electrolyte || 'PBS'}`, centerX, 85)

      // Working electrode (main electrode)
      const workingElectrodeY = height - 150
      ctx.fillStyle = '#374151' // Dark gray for electrode
      ctx.fillRect(centerX - 40, workingElectrodeY, 80, 20)
      
      // Electrode surface texture
      ctx.fillStyle = '#4B5563'
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(centerX - 35 + i * 10, workingElectrodeY + 2, 8, 16)
      }

      // Working electrode label
      ctx.fillStyle = '#D1D5DB'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Working Electrode', centerX, workingElectrodeY + 40)
      ctx.fillText(`Area: ${parameters.electrodeArea || 1} cm²`, centerX, workingElectrodeY + 55)

      // Reference electrode
      const refElectrodeX = centerX + 120
      ctx.fillStyle = '#6B7280'
      ctx.beginPath()
      ctx.arc(refElectrodeX, centerY, 8, 0, 2 * Math.PI)
      ctx.fill()
      
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Ref', refElectrodeX, centerY + 25)

      // Counter electrode
      const counterElectrodeX = centerX - 120
      ctx.fillStyle = '#6B7280'
      ctx.fillRect(counterElectrodeX - 15, centerY - 30, 30, 60)
      
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Counter', counterElectrodeX, centerY + 50)

      // Draw connections
      ctx.strokeStyle = '#4B5563'
      ctx.lineWidth = 2
      
      // Working electrode connection
      ctx.beginPath()
      ctx.moveTo(centerX, workingElectrodeY)
      ctx.lineTo(centerX, workingElectrodeY - 30)
      ctx.stroke()

      // Reference electrode connection
      ctx.beginPath()
      ctx.moveTo(refElectrodeX, centerY - 8)
      ctx.lineTo(refElectrodeX, centerY - 30)
      ctx.stroke()

      // Counter electrode connection
      ctx.beginPath()
      ctx.moveTo(counterElectrodeX, centerY - 30)
      ctx.lineTo(counterElectrodeX, centerY - 50)
      ctx.stroke()
    }

    const drawTechniqueVisualization = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const centerX = width / 2
      const centerY = height / 2

      // Draw technique-specific visualization
      switch (technique.id) {
        case 'cv':
          drawCVVisualization(ctx, centerX, centerY)
          break
        case 'eis':
          drawEISVisualization(ctx, centerX, centerY)
          break
        case 'ca':
          drawCAVisualization(ctx, centerX, centerY)
          break
        case 'dpv':
        case 'swv':
          drawPulseVisualization(ctx, centerX, centerY)
          break
        case 'lsv':
          drawLSVVisualization(ctx, centerX, centerY)
          break
      }

      // Draw potential indicator
      if (data.length > 0) {
        const currentPotential = data[data.length - 1].x
        const normalizedPotential = (currentPotential + 1) / 2 // Normalize to 0-1 range
        
        // Potential bar
        const barX = width - 80
        const barY = 100
        const barHeight = height - 200
        
        ctx.fillStyle = '#374151'
        ctx.fillRect(barX, barY, 20, barHeight)
        
        // Current potential indicator
        const indicatorY = barY + barHeight * (1 - normalizedPotential)
        ctx.fillStyle = '#EF4444'
        ctx.fillRect(barX - 5, indicatorY - 2, 30, 4)
        
        // Labels
        ctx.fillStyle = '#9CA3AF'
        ctx.font = '10px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('Potential', barX + 10, barY - 10)
        ctx.fillText(`${currentPotential.toFixed(2)}V`, barX + 10, indicatorY - 10)
      }
    }

    const drawCVVisualization = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
      // Draw cyclic arrows to show potential sweep
      const radius = 60
      
      // Forward sweep arrow
      ctx.strokeStyle = '#10B981' // green
      ctx.lineWidth = 3
      ctx.setLineDash([])
      
      ctx.beginPath()
      ctx.arc(centerX - 60, centerY - 40, radius / 2, -Math.PI / 4, Math.PI / 4)
      ctx.stroke()
      
      // Arrow head for forward
      drawArrowHead(ctx, centerX - 60 + radius / 2 * Math.cos(Math.PI / 4), 
                   centerY - 40 + radius / 2 * Math.sin(Math.PI / 4), Math.PI / 4)

      // Reverse sweep arrow
      ctx.strokeStyle = '#F59E0B' // amber
      ctx.beginPath()
      ctx.arc(centerX + 60, centerY - 40, radius / 2, 3 * Math.PI / 4, 5 * Math.PI / 4)
      ctx.stroke()
      
      // Arrow head for reverse
      drawArrowHead(ctx, centerX + 60 + radius / 2 * Math.cos(5 * Math.PI / 4), 
                   centerY - 40 + radius / 2 * Math.sin(5 * Math.PI / 4), 5 * Math.PI / 4)

      // Labels
      ctx.fillStyle = '#10B981'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Forward', centerX - 60, centerY - 70)
      
      ctx.fillStyle = '#F59E0B'
      ctx.fillText('Reverse', centerX + 60, centerY - 70)
    }

    const drawEISVisualization = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
      // Draw sine wave to represent AC perturbation
      const amplitude = 20
      const frequency = 0.1
      
      ctx.strokeStyle = '#8B5CF6' // purple
      ctx.lineWidth = 2
      
      ctx.beginPath()
      for (let x = -100; x <= 100; x += 2) {
        const y = amplitude * Math.sin(frequency * x)
        if (x === -100) {
          ctx.moveTo(centerX + x, centerY + y)
        } else {
          ctx.lineTo(centerX + x, centerY + y)
        }
      }
      ctx.stroke()

      // AC amplitude label
      ctx.fillStyle = '#8B5CF6'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`AC: ${parameters.amplitude || 0.01}V`, centerX, centerY - 40)
      
      // Frequency sweep indicator
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px system-ui'
      ctx.fillText('Frequency Sweep', centerX, centerY + 40)
    }

    const drawCAVisualization = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
      // Draw step function
      const stepWidth = 100
      const stepHeight = 30
      
      ctx.strokeStyle = '#3B82F6' // blue
      ctx.lineWidth = 3
      
      ctx.beginPath()
      ctx.moveTo(centerX - stepWidth, centerY)
      ctx.lineTo(centerX - 20, centerY)
      ctx.lineTo(centerX - 20, centerY - stepHeight)
      ctx.lineTo(centerX + stepWidth, centerY - stepHeight)
      ctx.stroke()

      // Step labels
      ctx.fillStyle = '#3B82F6'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Potential Step', centerX, centerY - 50)
      
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px system-ui'
      ctx.fillText(`${parameters.appliedPotential || parameters.stepPotential || 0}V`, centerX + 20, centerY - stepHeight - 10)
    }

    const drawPulseVisualization = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
      // Draw pulse train
      const pulseWidth = 15
      const pulseHeight = 25
      const spacing = 20
      
      ctx.strokeStyle = '#8B5CF6' // purple
      ctx.lineWidth = 2
      
      for (let i = -2; i <= 2; i++) {
        const x = centerX + i * spacing
        
        ctx.beginPath()
        ctx.moveTo(x - pulseWidth / 2, centerY)
        ctx.lineTo(x - pulseWidth / 2, centerY - pulseHeight)
        ctx.lineTo(x + pulseWidth / 2, centerY - pulseHeight)
        ctx.lineTo(x + pulseWidth / 2, centerY)
        ctx.stroke()
      }

      // Pulse parameters
      ctx.fillStyle = '#8B5CF6'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`${technique.abbreviation} Pulses`, centerX, centerY - 40)
      
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px system-ui'
      if (technique.id === 'dpv') {
        ctx.fillText(`Amplitude: ${parameters.pulseAmplitude || 0.05}V`, centerX, centerY + 25)
      } else {
        ctx.fillText(`Freq: ${parameters.frequency || 25}Hz`, centerX, centerY + 25)
      }
    }

    const drawLSVVisualization = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
      // Draw linear sweep
      ctx.strokeStyle = '#10B981' // green
      ctx.lineWidth = 3
      
      ctx.beginPath()
      ctx.moveTo(centerX - 80, centerY + 20)
      ctx.lineTo(centerX + 80, centerY - 20)
      ctx.stroke()

      // Arrow head
      drawArrowHead(ctx, centerX + 80, centerY - 20, -Math.atan(40 / 160))

      // Labels
      ctx.fillStyle = '#10B981'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Linear Sweep', centerX, centerY - 40)
      
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px system-ui'
      ctx.fillText(`${parameters.scanRate || 0.1} V/s`, centerX, centerY + 40)
    }

    const drawDataOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (data.length === 0) return

      const currentData = data[data.length - 1]
      
      // Current reading display
      const infoX = 20
      const infoY = 20
      
      ctx.fillStyle = 'rgba(17, 24, 39, 0.8)'
      ctx.fillRect(infoX, infoY, 200, 100)
      
      ctx.strokeStyle = '#4B5563'
      ctx.lineWidth = 1
      ctx.strokeRect(infoX, infoY, 200, 100)

      ctx.fillStyle = '#F9FAFB'
      ctx.font = 'bold 14px system-ui'
      ctx.textAlign = 'left'
      ctx.fillText('Live Data', infoX + 10, infoY + 20)

      ctx.fillStyle = '#9CA3AF'
      ctx.font = '12px system-ui'
      ctx.fillText(`Potential: ${currentData.x.toFixed(3)} V`, infoX + 10, infoY + 40)
      ctx.fillText(`Current: ${currentData.y.toFixed(2)} µA`, infoX + 10, infoY + 55)
      
      if (currentData.time) {
        ctx.fillText(`Time: ${currentData.time.toFixed(1)} s`, infoX + 10, infoY + 70)
      }
      
      if (technique.id === 'eis' && currentData.z) {
        ctx.fillText(`Frequency: ${formatFrequency(currentData.z)} Hz`, infoX + 10, infoY + 85)
      }

      // Activity indicator
      if (isRunning) {
        const pulse = Math.sin(Date.now() / 200) * 0.5 + 0.5
        ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`
        ctx.beginPath()
        ctx.arc(infoX + 190, infoY + 15, 5, 0, 2 * Math.PI)
        ctx.fill()
      }
    }

    const drawArrowHead = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
      const headLength = 10
      
      ctx.fillStyle = ctx.strokeStyle
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(
        x - headLength * Math.cos(angle - Math.PI / 6),
        y - headLength * Math.sin(angle - Math.PI / 6)
      )
      ctx.lineTo(
        x - headLength * Math.cos(angle + Math.PI / 6),
        y - headLength * Math.sin(angle + Math.PI / 6)
      )
      ctx.closePath()
      ctx.fill()
    }

    const formatFrequency = (freq: number): string => {
      if (freq >= 1000000) return `${(freq / 1000000).toFixed(1)}M`
      if (freq >= 1000) return `${(freq / 1000).toFixed(1)}k`
      return freq.toFixed(1)
    }

    const animate = () => {
      draw()
      if (isRunning) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [technique, parameters, data, isRunning])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-3 rounded-lg mb-4">
        <h3 className="text-lg font-medium text-white mb-2">Electrode System Visualization</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Technique:</span>
            <div className="text-white">{technique.name}</div>
          </div>
          <div>
            <span className="text-gray-400">Temperature:</span>
            <div className="text-white">{parameters.temperature}°C</div>
          </div>
          <div>
            <span className="text-gray-400">Electrode Area:</span>
            <div className="text-white">{parameters.electrodeArea} cm²</div>
          </div>
        </div>
      </div>

      {/* Visualization Canvas */}
      <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ background: 'transparent' }}
        />
      </div>

      {/* Technique Info */}
      <div className="bg-gray-800 p-3 rounded-lg mt-4">
        <h4 className="text-sm font-medium text-white mb-2">Technique Information</h4>
        <div className="text-xs text-gray-400 mb-2">{technique.description}</div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400">Sensitivity:</span>
            <div className="flex items-center">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 mr-1 rounded-full ${
                    i < technique.sensitivity ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <div>
            <span className="text-gray-400">Complexity:</span>
            <div className="flex items-center">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 mr-1 rounded-full ${
                    i < technique.complexity ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-gray-400">Applications:</span>
          <div className="text-xs text-gray-300 mt-1">
            {technique.applications.slice(0, 3).join(' • ')}
          </div>
        </div>
      </div>
    </div>
  )
}