'use client'

import React, { useEffect, useRef } from 'react'
import { ElectroanalyticalTechnique } from '@/lib/electroanalytical/electroanalytical-catalog'
import { DataPoint } from './ElectroanalyticalTool'

interface ChronoamperometryChartProps {
  data: DataPoint[]
  parameters: { [key: string]: any }
  technique: ElectroanalyticalTechnique
  isRunning: boolean
  progress: number
}

export function ChronoamperometryChart({ data, parameters, technique, isRunning, progress }: ChronoamperometryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cottrelAnalysisCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const drawCharts = () => {
      drawMainChart()
      drawCottrellAnalysis()
    }

    const drawMainChart = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      const { width, height } = canvas.getBoundingClientRect()
      
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#111827'
      ctx.fillRect(0, 0, width, height)

      const margin = { top: 40, right: 40, bottom: 60, left: 80 }
      const chartWidth = width - margin.left - margin.right
      const chartHeight = height - margin.top - margin.bottom

      if (data.length === 0) {
        ctx.fillStyle = '#6B7280'
        ctx.font = '16px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('Start chronoamperometry to see current vs time', width / 2, height / 2)
        return
      }

      // Calculate scales
      const timeMax = Math.max(...data.map(d => d.x))
      const timeMin = 0
      const currentMin = Math.min(...data.map(d => d.y))
      const currentMax = Math.max(...data.map(d => d.y))

      const xScale = (t: number) => margin.left + (t - timeMin) / (timeMax - timeMin) * chartWidth
      const yScale = (i: number) => margin.top + (1 - (i - currentMin) / (currentMax - currentMin)) * chartHeight

      // Draw grid
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])

      for (let i = 0; i <= 10; i++) {
        const x = margin.left + (i / 10) * chartWidth
        ctx.beginPath()
        ctx.moveTo(x, margin.top)
        ctx.lineTo(x, margin.top + chartHeight)
        ctx.stroke()

        const y = margin.top + (i / 10) * chartHeight
        ctx.beginPath()
        ctx.moveTo(margin.left, y)
        ctx.lineTo(margin.left + chartWidth, y)
        ctx.stroke()
      }

      ctx.setLineDash([])

      // Draw axes
      ctx.strokeStyle = '#D1D5DB'
      ctx.lineWidth = 2
      
      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top + chartHeight)
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top)
      ctx.lineTo(margin.left, margin.top + chartHeight)
      ctx.stroke()

      // Labels
      ctx.fillStyle = '#D1D5DB'
      ctx.font = '14px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Time (s)', width / 2, height - 10)

      ctx.save()
      ctx.translate(15, height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('Current (µA)', 0, 0)
      ctx.restore()

      // Title
      ctx.fillStyle = '#F9FAFB'
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`${technique.name} - Current vs Time`, width / 2, 25)

      // Draw current response curve
      if (data.length > 1) {
        // Draw different phases with different colors
        const phases = identifyPhases(data)
        
        phases.forEach((phase, index) => {
          const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B']
          ctx.strokeStyle = colors[index % colors.length]
          ctx.lineWidth = 2

          if (phase.length > 1) {
            ctx.beginPath()
            ctx.moveTo(xScale(phase[0].x), yScale(phase[0].y))

            for (let i = 1; i < phase.length; i++) {
              ctx.lineTo(xScale(phase[i].x), yScale(phase[i].y))
            }

            ctx.stroke()
          }
        })

        // Draw data points
        ctx.fillStyle = '#3B82F6'
        data.forEach(point => {
          ctx.beginPath()
          ctx.arc(xScale(point.x), yScale(point.y), 1.5, 0, 2 * Math.PI)
          ctx.fill()
        })

        // Highlight current point
        if (isRunning && data.length > 0) {
          const currentPoint = data[data.length - 1]
          ctx.fillStyle = '#EF4444'
          ctx.beginPath()
          ctx.arc(xScale(currentPoint.x), yScale(currentPoint.y), 4, 0, 2 * Math.PI)
          ctx.fill()
        }

        // Draw theoretical Cottrell curve if enough data
        if (data.length > 10) {
          drawCottrellFit(ctx, data, xScale, yScale, timeMax)
        }
      }

      // Draw potential step indication
      const stepTime = 1 // Assume step occurs at t=1s
      if (timeMax > stepTime) {
        ctx.strokeStyle = '#F59E0B'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(xScale(stepTime), margin.top)
        ctx.lineTo(xScale(stepTime), margin.top + chartHeight)
        ctx.stroke()
        ctx.setLineDash([])

        // Step label
        ctx.fillStyle = '#F59E0B'
        ctx.font = '12px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('Potential Step', xScale(stepTime), margin.top - 10)
      }

      // Tick labels
      ctx.font = '12px system-ui'
      ctx.fillStyle = '#9CA3AF'

      for (let i = 0; i <= 5; i++) {
        const x = margin.left + (i / 5) * chartWidth
        const value = timeMin + (i / 5) * (timeMax - timeMin)
        ctx.textAlign = 'center'
        ctx.fillText(value.toFixed(1), x, margin.top + chartHeight + 20)

        const y = margin.top + chartHeight - (i / 5) * chartHeight
        const yValue = currentMin + (i / 5) * (currentMax - currentMin)
        ctx.textAlign = 'right'
        ctx.fillText(yValue.toFixed(1), margin.left - 10, y + 5)
      }

      // Show current analysis
      if (data.length > 5) {
        const steadyStateCurrent = calculateSteadyState(data)
        const peakCurrent = Math.max(...data.map(d => d.y))
        
        ctx.fillStyle = '#9CA3AF'
        ctx.font = '11px system-ui'
        ctx.textAlign = 'left'
        
        const infoText = [
          `Peak Current: ${peakCurrent.toFixed(2)} µA`,
          `Steady State: ${steadyStateCurrent.toFixed(2)} µA`,
          `Applied Potential: ${parameters.appliedPotential || parameters.stepPotential || 0} V`,
          `Duration: ${parameters.duration || parameters.stepDuration || 300} s`
        ]

        infoText.forEach((text, index) => {
          ctx.fillText(text, margin.left + 10, margin.top + 15 + index * 15)
        })
      }
    }

    const drawCottrellAnalysis = () => {
      const canvas = cottrelAnalysisCanvasRef.current
      if (!canvas || data.length < 10) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      const { width, height } = canvas.getBoundingClientRect()
      
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#111827'
      ctx.fillRect(0, 0, width, height)

      const margin = { top: 40, right: 40, bottom: 60, left: 80 }
      const chartWidth = width - margin.left - margin.right
      const chartHeight = height - margin.top - margin.bottom

      // Cottrell analysis: current vs 1/sqrt(t)
      const cottrellData = data
        .filter(d => d.x > 1) // Skip initial transient
        .map(d => ({
          x: 1 / Math.sqrt(d.x), // 1/sqrt(t)
          y: d.y, // current
          originalTime: d.x
        }))

      if (cottrellData.length === 0) return

      const xMin = Math.min(...cottrellData.map(d => d.x))
      const xMax = Math.max(...cottrellData.map(d => d.x))
      const yMin = Math.min(...cottrellData.map(d => d.y))
      const yMax = Math.max(...cottrellData.map(d => d.y))

      const xScale = (x: number) => margin.left + (x - xMin) / (xMax - xMin) * chartWidth
      const yScale = (y: number) => margin.top + (1 - (y - yMin) / (yMax - yMin)) * chartHeight

      // Draw grid
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])

      for (let i = 0; i <= 8; i++) {
        const x = margin.left + (i / 8) * chartWidth
        ctx.beginPath()
        ctx.moveTo(x, margin.top)
        ctx.lineTo(x, margin.top + chartHeight)
        ctx.stroke()

        const y = margin.top + (i / 8) * chartHeight
        ctx.beginPath()
        ctx.moveTo(margin.left, y)
        ctx.lineTo(margin.left + chartWidth, y)
        ctx.stroke()
      }

      ctx.setLineDash([])

      // Axes
      ctx.strokeStyle = '#D1D5DB'
      ctx.lineWidth = 2
      
      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top + chartHeight)
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top)
      ctx.lineTo(margin.left, margin.top + chartHeight)
      ctx.stroke()

      // Labels
      ctx.fillStyle = '#D1D5DB'
      ctx.font = '14px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('1/√t (s⁻¹/²)', width / 2, height - 10)

      ctx.save()
      ctx.translate(15, height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('Current (µA)', 0, 0)
      ctx.restore()

      // Title
      ctx.fillStyle = '#F9FAFB'
      ctx.font = 'bold 14px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Cottrell Analysis (I vs 1/√t)', width / 2, 25)

      // Plot data
      ctx.fillStyle = '#10B981'
      cottrellData.forEach(point => {
        ctx.beginPath()
        ctx.arc(xScale(point.x), yScale(point.y), 2, 0, 2 * Math.PI)
        ctx.fill()
      })

      // Linear fit
      const { slope, intercept, r2 } = linearRegression(cottrellData)
      if (r2 > 0.8) { // Only show fit if correlation is good
        ctx.strokeStyle = '#EF4444'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(xScale(xMin), yScale(slope * xMin + intercept))
        ctx.lineTo(xScale(xMax), yScale(slope * xMax + intercept))
        ctx.stroke()

        // Show fit parameters
        ctx.fillStyle = '#9CA3AF'
        ctx.font = '11px system-ui'
        ctx.textAlign = 'left'
        ctx.fillText(`Slope: ${slope.toFixed(2)} µA·s¹/²`, margin.left + 10, margin.top + 20)
        ctx.fillText(`R²: ${r2.toFixed(3)}`, margin.left + 10, margin.top + 35)
        
        // Calculate diffusion coefficient
        const D = calculateDiffusionCoefficient(slope)
        ctx.fillText(`D: ${D.toExponential(2)} cm²/s`, margin.left + 10, margin.top + 50)
      }
    }

    const animate = () => {
      drawCharts()
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
  }, [data, parameters, technique, isRunning, progress])

  // Helper functions
  const identifyPhases = (data: DataPoint[]) => {
    // Simple phase identification - could be more sophisticated
    const phases: DataPoint[][] = []
    if (data.length === 0) return phases

    let currentPhase: DataPoint[] = [data[0]]
    
    for (let i = 1; i < data.length; i++) {
      const timeDiff = data[i].x - data[i-1].x
      if (timeDiff > 10) { // New phase if time gap > 10s
        phases.push(currentPhase)
        currentPhase = [data[i]]
      } else {
        currentPhase.push(data[i])
      }
    }
    
    phases.push(currentPhase)
    return phases
  }

  const calculateSteadyState = (data: DataPoint[]) => {
    if (data.length < 10) return 0
    const lastPoints = data.slice(-Math.min(10, Math.floor(data.length / 4)))
    return lastPoints.reduce((sum, d) => sum + d.y, 0) / lastPoints.length
  }

  const drawCottrellFit = (ctx: CanvasRenderingContext2D, data: DataPoint[], xScale: Function, yScale: Function, timeMax: number) => {
    // Theoretical Cottrell equation: i(t) = (nFAC√D)/(√πt)
    ctx.strokeStyle = '#8B5CF6'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])

    const A = parameters.electrodeArea || 1 // cm²
    const C = 1e-3 // M
    const D = 1e-6 // cm²/s estimated
    const n = 2
    const F = 96485
    const cottrelConstant = (n * F * A * C * Math.sqrt(D)) / Math.sqrt(Math.PI) * 1e6 // µA

    ctx.beginPath()
    let first = true
    for (let t = 1; t <= timeMax; t += timeMax / 100) {
      const theoretical = cottrelConstant / Math.sqrt(t)
      const x = xScale(t)
      const y = yScale(theoretical)
      
      if (first) {
        ctx.moveTo(x, y)
        first = false
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
    ctx.setLineDash([])
  }

  const linearRegression = (data: {x: number, y: number}[]) => {
    const n = data.length
    const sumX = data.reduce((sum, d) => sum + d.x, 0)
    const sumY = data.reduce((sum, d) => sum + d.y, 0)
    const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0)
    const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0)
    const sumY2 = data.reduce((sum, d) => sum + d.y * d.y, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    const meanY = sumY / n
    const ssRes = data.reduce((sum, d) => sum + Math.pow(d.y - (slope * d.x + intercept), 2), 0)
    const ssTot = data.reduce((sum, d) => sum + Math.pow(d.y - meanY, 2), 0)
    const r2 = 1 - (ssRes / ssTot)

    return { slope, intercept, r2 }
  }

  const calculateDiffusionCoefficient = (slope: number) => {
    // From Cottrell equation: slope = nFAC√D/√π
    const n = 2
    const F = 96485 // C/mol
    const A = parameters.electrodeArea || 1 // cm²
    const C = 1e-3 // M
    
    // Convert slope from µA·s¹/² to A·s¹/²
    const slopeA = slope * 1e-6
    
    // D = (slope * √π / (nFAC))²
    const D = Math.pow((slopeA * Math.sqrt(Math.PI)) / (n * F * A * C), 2)
    return D
  }

  const handleExportData = () => {
    if (data.length === 0) return

    const csvContent = [
      ['Time (s)', 'Current (µA)', '1/√t (s⁻¹/²)'].join(','),
      ...data.map(point => [
        point.x.toFixed(3),
        point.y.toFixed(6),
        point.x > 0 ? (1 / Math.sqrt(point.x)).toFixed(6) : '0'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chronoamperometry_data_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chart Controls */}
      <div className="bg-gray-800 p-3 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Time Points: <span className="text-white">{data.length}</span>
            </div>
            {data.length > 0 && (
              <div className="text-sm text-gray-400">
                Current Time: <span className="text-blue-400">{data[data.length - 1]?.x.toFixed(1)} s</span>
              </div>
            )}
            {data.length > 0 && (
              <div className="text-sm text-gray-400">
                Current: <span className="text-green-400">{data[data.length - 1]?.y.toFixed(2)} µA</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportData}
              disabled={data.length === 0}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
            >
              Export CA Data
            </button>
          </div>
        </div>
      </div>

      {/* Charts Container */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Main Chronoamperometry Chart */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ background: '#111827' }}
          />
        </div>

        {/* Cottrell Analysis */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <canvas
            ref={cottrelAnalysisCanvasRef}
            className="w-full h-full"
            style={{ background: '#111827' }}
          />
        </div>
      </div>
    </div>
  )
}