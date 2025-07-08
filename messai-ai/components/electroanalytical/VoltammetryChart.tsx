'use client'

import React, { useEffect, useRef } from 'react'
import { ElectroanalyticalTechnique } from '@/lib/electroanalytical/electroanalytical-catalog'
import { DataPoint } from './ElectroanalyticalTool'

interface VoltammetryChartProps {
  data: DataPoint[]
  parameters: { [key: string]: any }
  technique: ElectroanalyticalTechnique
  isRunning: boolean
  progress: number
}

export function VoltammetryChart({ data, parameters, technique, isRunning, progress }: VoltammetryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect()
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#111827' // bg-gray-900
      ctx.fillRect(0, 0, width, height)

      // Chart margins
      const margin = { top: 40, right: 40, bottom: 60, left: 80 }
      const chartWidth = width - margin.left - margin.right
      const chartHeight = height - margin.top - margin.bottom

      if (data.length === 0) {
        // Show empty state
        ctx.fillStyle = '#6B7280' // text-gray-400
        ctx.font = '16px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('Start experiment to see data', width / 2, height / 2)
        return
      }

      // Calculate scales
      const xMin = Math.min(...data.map(d => d.x))
      const xMax = Math.max(...data.map(d => d.x))
      const yMin = Math.min(...data.map(d => d.y))
      const yMax = Math.max(...data.map(d => d.y))

      const xScale = (x: number) => margin.left + (x - xMin) / (xMax - xMin) * chartWidth
      const yScale = (y: number) => margin.top + (1 - (y - yMin) / (yMax - yMin)) * chartHeight

      // Draw grid
      ctx.strokeStyle = '#374151' // border-gray-600
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])

      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = margin.left + (i / 10) * chartWidth
        ctx.beginPath()
        ctx.moveTo(x, margin.top)
        ctx.lineTo(x, margin.top + chartHeight)
        ctx.stroke()
      }

      // Horizontal grid lines
      for (let i = 0; i <= 10; i++) {
        const y = margin.top + (i / 10) * chartHeight
        ctx.beginPath()
        ctx.moveTo(margin.left, y)
        ctx.lineTo(margin.left + chartWidth, y)
        ctx.stroke()
      }

      ctx.setLineDash([])

      // Draw axes
      ctx.strokeStyle = '#D1D5DB' // border-gray-300
      ctx.lineWidth = 2
      
      // X-axis
      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top + chartHeight)
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight)
      ctx.stroke()

      // Y-axis
      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top)
      ctx.lineTo(margin.left, margin.top + chartHeight)
      ctx.stroke()

      // Draw axis labels
      ctx.fillStyle = '#D1D5DB'
      ctx.font = '14px system-ui'
      ctx.textAlign = 'center'

      // X-axis label
      ctx.fillText('Potential (V)', width / 2, height - 10)

      // Y-axis label
      ctx.save()
      ctx.translate(15, height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('Current (µA)', 0, 0)
      ctx.restore()

      // Draw tick labels
      ctx.font = '12px system-ui'
      ctx.fillStyle = '#9CA3AF' // text-gray-400

      // X-axis ticks
      for (let i = 0; i <= 5; i++) {
        const x = margin.left + (i / 5) * chartWidth
        const value = xMin + (i / 5) * (xMax - xMin)
        ctx.textAlign = 'center'
        ctx.fillText(value.toFixed(2), x, margin.top + chartHeight + 20)
      }

      // Y-axis ticks
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + chartHeight - (i / 5) * chartHeight
        const value = yMin + (i / 5) * (yMax - yMin)
        ctx.textAlign = 'right'
        ctx.fillText(value.toFixed(1), margin.left - 10, y + 5)
      }

      // Draw title
      ctx.fillStyle = '#F9FAFB' // text-white
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`${technique.name} - ${technique.abbreviation}`, width / 2, 25)

      // Draw data line
      if (data.length > 1) {
        ctx.strokeStyle = '#3B82F6' // blue-500
        ctx.lineWidth = 2
        ctx.setLineDash([])

        ctx.beginPath()
        ctx.moveTo(xScale(data[0].x), yScale(data[0].y))

        for (let i = 1; i < data.length; i++) {
          ctx.lineTo(xScale(data[i].x), yScale(data[i].y))
        }

        ctx.stroke()

        // Draw data points
        ctx.fillStyle = '#3B82F6'
        for (const point of data) {
          ctx.beginPath()
          ctx.arc(xScale(point.x), yScale(point.y), 2, 0, 2 * Math.PI)
          ctx.fill()
        }

        // Highlight current point if running
        if (isRunning && data.length > 0) {
          const currentPoint = data[data.length - 1]
          ctx.fillStyle = '#EF4444' // red-500
          ctx.beginPath()
          ctx.arc(xScale(currentPoint.x), yScale(currentPoint.y), 4, 0, 2 * Math.PI)
          ctx.fill()
        }
      }

      // Draw technique-specific annotations
      if (technique.id === 'cv' && data.length > 10) {
        // Show scan direction arrows
        const midPoint = Math.floor(data.length / 2)
        if (midPoint < data.length - 1) {
          const p1 = data[midPoint - 1]
          const p2 = data[midPoint]
          const p3 = data[midPoint + 1]

          // Forward scan arrow
          drawArrow(ctx, xScale(p1.x), yScale(p1.y), xScale(p2.x), yScale(p2.y), '#10B981')
          
          // Reverse scan arrow if available
          if (data.length > midPoint + 2) {
            drawArrow(ctx, xScale(p2.x), yScale(p2.y), xScale(p3.x), yScale(p3.y), '#F59E0B')
          }
        }
      }

      // Draw peak markers for pulse techniques
      if ((technique.id === 'dpv' || technique.id === 'swv') && data.length > 5) {
        const peaks = findPeaks(data.map(d => d.y))
        ctx.fillStyle = '#EF4444' // red-500
        ctx.font = '10px system-ui'
        ctx.textAlign = 'center'

        peaks.forEach((peakIndex) => {
          if (peakIndex < data.length) {
            const peak = data[peakIndex]
            const x = xScale(peak.x)
            const y = yScale(peak.y)
            
            // Draw peak marker
            ctx.beginPath()
            ctx.arc(x, y, 6, 0, 2 * Math.PI)
            ctx.fill()
            
            // Draw peak label
            ctx.fillText(`${peak.y.toFixed(1)} µA`, x, y - 15)
          }
        })
      }

      // Show experimental parameters
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '11px system-ui'
      ctx.textAlign = 'left'
      const paramText = []
      
      if (technique.id === 'cv') {
        paramText.push(`Scan Rate: ${parameters.scanRate} V/s`)
        paramText.push(`Range: ${parameters.startPotential} to ${parameters.endPotential} V`)
      } else if (technique.id === 'lsv') {
        paramText.push(`Scan Rate: ${parameters.scanRate} V/s`)
        paramText.push(`Range: ${parameters.startPotential} to ${parameters.endPotential} V`)
      }
      
      paramText.push(`T: ${parameters.temperature}°C`)
      paramText.push(`Area: ${parameters.electrodeArea} cm²`)

      paramText.forEach((text, index) => {
        ctx.fillText(text, margin.left + 10, margin.top + 15 + index * 15)
      })
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
  }, [data, parameters, technique, isRunning, progress])

  // Helper function to draw arrows
  const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) => {
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const headLength = 8

    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 2

    // Draw arrow line
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    // Draw arrow head
    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.closePath()
    ctx.fill()
  }

  // Simple peak finding algorithm
  const findPeaks = (values: number[]): number[] => {
    const peaks: number[] = []
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i-1] && values[i] > values[i+1] && values[i] > Math.max(...values) * 0.1) {
        peaks.push(i)
      }
    }
    return peaks
  }

  const handleExportData = () => {
    if (data.length === 0) return

    const csvContent = [
      ['Potential (V)', 'Current (µA)', 'Time (s)'].join(','),
      ...data.map(point => [point.x.toFixed(6), point.y.toFixed(6), (point.time || 0).toFixed(3)].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${technique.id}_data_${new Date().toISOString().slice(0, 10)}.csv`
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
              Data Points: <span className="text-white">{data.length}</span>
            </div>
            {data.length > 0 && (
              <div className="text-sm text-gray-400">
                Current: <span className="text-blue-400">{data[data.length - 1]?.y.toFixed(2)} µA</span>
              </div>
            )}
            {data.length > 0 && (
              <div className="text-sm text-gray-400">
                Potential: <span className="text-green-400">{data[data.length - 1]?.x.toFixed(3)} V</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportData}
              disabled={data.length === 0}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ background: '#111827' }}
        />
      </div>
    </div>
  )
}