'use client'

import React, { useEffect, useRef } from 'react'
import { ElectroanalyticalTechnique } from '@/lib/electroanalytical/electroanalytical-catalog'
import { DataPoint } from './ElectroanalyticalTool'

interface PulseVoltammetryChartProps {
  data: DataPoint[]
  parameters: { [key: string]: any }
  technique: ElectroanalyticalTechnique
  isRunning: boolean
  progress: number
}

export function PulseVoltammetryChart({ data, parameters, technique, isRunning, progress }: PulseVoltammetryChartProps) {
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
      ctx.fillStyle = '#111827'
      ctx.fillRect(0, 0, width, height)

      const margin = { top: 40, right: 40, bottom: 60, left: 80 }
      const chartWidth = width - margin.left - margin.right
      const chartHeight = height - margin.top - margin.bottom

      if (data.length === 0) {
        ctx.fillStyle = '#6B7280'
        ctx.font = '16px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(`Start ${technique.abbreviation} to see voltammogram`, width / 2, height / 2)
        return
      }

      // Calculate scales
      const potentialMin = Math.min(...data.map(d => d.x))
      const potentialMax = Math.max(...data.map(d => d.x))
      const currentMin = Math.min(...data.map(d => d.y))
      const currentMax = Math.max(...data.map(d => d.y))

      const xScale = (pot: number) => margin.left + (pot - potentialMin) / (potentialMax - potentialMin) * chartWidth
      const yScale = (curr: number) => margin.top + (1 - (curr - currentMin) / (currentMax - currentMin)) * chartHeight

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
      ctx.fillText('Potential (V)', width / 2, height - 10)

      ctx.save()
      ctx.translate(15, height / 2)
      ctx.rotate(-Math.PI / 2)
      
      if (technique.id === 'dpv') {
        ctx.fillText('ΔCurrent (µA)', 0, 0)
      } else if (technique.id === 'swv') {
        ctx.fillText('Net Current (µA)', 0, 0)
      } else {
        ctx.fillText('Current (µA)', 0, 0)
      }
      ctx.restore()

      // Title
      ctx.fillStyle = '#F9FAFB'
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`${technique.name}`, width / 2, 25)

      // Draw main voltammogram
      if (data.length > 1) {
        // For SWV, we might have forward and reverse currents
        if (technique.id === 'swv') {
          drawSWVData(ctx, data, xScale, yScale)
        } else {
          drawPulseData(ctx, data, xScale, yScale)
        }

        // Find and mark peaks
        const peaks = findPeaks(data.map(d => d.y))
        markPeaks(ctx, data, peaks, xScale, yScale)

        // Highlight current point
        if (isRunning && data.length > 0) {
          const currentPoint = data[data.length - 1]
          ctx.fillStyle = '#EF4444'
          ctx.beginPath()
          ctx.arc(xScale(currentPoint.x), yScale(currentPoint.y), 5, 0, 2 * Math.PI)
          ctx.fill()
        }
      }

      // Draw baseline
      if (currentMin < 0 && currentMax > 0) {
        const baselineY = yScale(0)
        ctx.strokeStyle = '#6B7280'
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(margin.left, baselineY)
        ctx.lineTo(margin.left + chartWidth, baselineY)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Tick labels
      ctx.font = '12px system-ui'
      ctx.fillStyle = '#9CA3AF'

      for (let i = 0; i <= 5; i++) {
        const x = margin.left + (i / 5) * chartWidth
        const value = potentialMin + (i / 5) * (potentialMax - potentialMin)
        ctx.textAlign = 'center'
        ctx.fillText(value.toFixed(2), x, margin.top + chartHeight + 20)

        const y = margin.top + chartHeight - (i / 5) * chartHeight
        const yValue = currentMin + (i / 5) * (currentMax - currentMin)
        ctx.textAlign = 'right'
        ctx.fillText(yValue.toFixed(1), margin.left - 10, y + 5)
      }

      // Show technique parameters
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '11px system-ui'
      ctx.textAlign = 'left'
      
      const paramText = []
      if (technique.id === 'dpv') {
        paramText.push(`Pulse Amplitude: ${parameters.pulseAmplitude || 0.05} V`)
        paramText.push(`Pulse Width: ${parameters.pulseWidth || 50} ms`)
        paramText.push(`Step Potential: ${parameters.stepPotential || 0.005} V`)
      } else if (technique.id === 'swv') {
        paramText.push(`SW Amplitude: ${parameters.amplitude || 0.025} V`)
        paramText.push(`Frequency: ${parameters.frequency || 25} Hz`)
        paramText.push(`Step Potential: ${parameters.stepPotential || 0.004} V`)
      }
      
      paramText.push(`Range: ${parameters.startPotential} to ${parameters.endPotential} V`)
      paramText.push(`T: ${parameters.temperature}°C`)

      paramText.forEach((text, index) => {
        ctx.fillText(text, margin.left + 10, margin.top + 15 + index * 15)
      })

      // Show peak analysis if peaks found
      if (peaks.length > 0) {
        ctx.fillStyle = '#10B981'
        ctx.font = '11px system-ui'
        ctx.textAlign = 'right'
        
        const peakInfo = [`${peaks.length} peak(s) detected`]
        if (peaks.length >= 2) {
          const peak1 = data[peaks[0]]
          const peak2 = data[peaks[1]]
          const separation = Math.abs(peak2.x - peak1.x)
          peakInfo.push(`Peak separation: ${separation.toFixed(3)} V`)
        }

        peakInfo.forEach((text, index) => {
          ctx.fillText(text, width - margin.right - 10, margin.top + 15 + index * 15)
        })
      }
    }

    const drawPulseData = (ctx: CanvasRenderingContext2D, data: DataPoint[], xScale: Function, yScale: Function) => {
      // Draw main pulse voltammetry curve
      ctx.strokeStyle = '#8B5CF6' // purple-500
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.moveTo(xScale(data[0].x), yScale(data[0].y))

      for (let i = 1; i < data.length; i++) {
        ctx.lineTo(xScale(data[i].x), yScale(data[i].y))
      }

      ctx.stroke()

      // Draw data points
      ctx.fillStyle = '#8B5CF6'
      data.forEach(point => {
        ctx.beginPath()
        ctx.arc(xScale(point.x), yScale(point.y), 2, 0, 2 * Math.PI)
        ctx.fill()
      })
    }

    const drawSWVData = (ctx: CanvasRenderingContext2D, data: DataPoint[], xScale: Function, yScale: Function) => {
      // For SWV, draw net current (could extend to show forward/reverse)
      ctx.strokeStyle = '#3B82F6' // blue-500
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.moveTo(xScale(data[0].x), yScale(data[0].y))

      for (let i = 1; i < data.length; i++) {
        ctx.lineTo(xScale(data[i].x), yScale(data[i].y))
      }

      ctx.stroke()

      // Draw data points with alternating colors to show pulse nature
      data.forEach((point, index) => {
        ctx.fillStyle = index % 2 === 0 ? '#3B82F6' : '#10B981'
        ctx.beginPath()
        ctx.arc(xScale(point.x), yScale(point.y), 2, 0, 2 * Math.PI)
        ctx.fill()
      })
    }

    const findPeaks = (values: number[]): number[] => {
      const peaks: number[] = []
      const threshold = Math.max(...values) * 0.1 // 10% of max as threshold
      
      for (let i = 2; i < values.length - 2; i++) {
        const isLocalMax = values[i] > values[i-1] && 
                          values[i] > values[i+1] && 
                          values[i] > values[i-2] && 
                          values[i] > values[i+2] &&
                          values[i] > threshold
        
        if (isLocalMax) {
          // Check if this peak is far enough from previous peaks
          const tooClose = peaks.some(peakIdx => Math.abs(i - peakIdx) < 5)
          if (!tooClose) {
            peaks.push(i)
          }
        }
      }
      
      return peaks.sort((a, b) => values[b] - values[a]) // Sort by peak height
    }

    const markPeaks = (ctx: CanvasRenderingContext2D, data: DataPoint[], peaks: number[], xScale: Function, yScale: Function) => {
      const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']
      
      peaks.forEach((peakIndex, i) => {
        if (peakIndex < data.length) {
          const peak = data[peakIndex]
          const color = colors[i % colors.length]
          
          // Draw peak marker
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(xScale(peak.x), yScale(peak.y), 6, 0, 2 * Math.PI)
          ctx.fill()
          
          // Draw peak outline
          ctx.strokeStyle = '#1F2937'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(xScale(peak.x), yScale(peak.y), 6, 0, 2 * Math.PI)
          ctx.stroke()
          
          // Peak label
          ctx.fillStyle = color
          ctx.font = '10px system-ui'
          ctx.textAlign = 'center'
          ctx.fillText(
            `P${i + 1}`, 
            xScale(peak.x), 
            yScale(peak.y) - 15
          )
          
          // Peak value
          ctx.fillText(
            `${peak.y.toFixed(1)} µA`, 
            xScale(peak.x), 
            yScale(peak.y) - 25
          )
          
          // Peak potential
          ctx.fillText(
            `${peak.x.toFixed(3)} V`, 
            xScale(peak.x), 
            yScale(peak.y) + 15
          )
        }
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

  const handleExportData = () => {
    if (data.length === 0) return

    const peaks = findPeaks(data.map(d => d.y))
    
    let csvContent = [
      ['Potential (V)', 'Current (µA)', 'Peak?'].join(','),
      ...data.map((point, index) => [
        point.x.toFixed(6),
        point.y.toFixed(6),
        peaks.includes(index) ? 'Yes' : 'No'
      ].join(','))
    ].join('\n')

    // Add peak summary
    if (peaks.length > 0) {
      csvContent += '\n\nPeak Summary:\n'
      csvContent += ['Peak #', 'Potential (V)', 'Current (µA)'].join(',') + '\n'
      peaks.forEach((peakIndex, i) => {
        const peak = data[peakIndex]
        csvContent += [i + 1, peak.x.toFixed(6), peak.y.toFixed(6)].join(',') + '\n'
      })
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${technique.id}_data_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const findPeaks = (values: number[]): number[] => {
    const peaks: number[] = []
    const threshold = Math.max(...values) * 0.1
    
    for (let i = 2; i < values.length - 2; i++) {
      const isLocalMax = values[i] > values[i-1] && 
                        values[i] > values[i+1] && 
                        values[i] > values[i-2] && 
                        values[i] > values[i+2] &&
                        values[i] > threshold
      
      if (isLocalMax) {
        const tooClose = peaks.some(peakIdx => Math.abs(i - peakIdx) < 5)
        if (!tooClose) {
          peaks.push(i)
        }
      }
    }
    
    return peaks.sort((a, b) => values[b] - values[a])
  }

  const peaks = findPeaks(data.map(d => d.y))

  return (
    <div className="h-full flex flex-col">
      {/* Chart Controls */}
      <div className="bg-gray-800 p-3 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Data Points: <span className="text-white">{data.length}</span>
            </div>
            <div className="text-sm text-gray-400">
              Peaks Detected: <span className="text-yellow-400">{peaks.length}</span>
            </div>
            {data.length > 0 && (
              <div className="text-sm text-gray-400">
                Current Potential: <span className="text-purple-400">{data[data.length - 1]?.x.toFixed(3)} V</span>
              </div>
            )}
            {data.length > 0 && (
              <div className="text-sm text-gray-400">
                Current: <span className="text-blue-400">{data[data.length - 1]?.y.toFixed(2)} µA</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportData}
              disabled={data.length === 0}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
            >
              Export {technique.abbreviation} Data
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

      {/* Peak Analysis Panel */}
      {peaks.length > 0 && (
        <div className="bg-gray-800 p-3 rounded-lg mt-4">
          <h3 className="text-sm font-medium text-white mb-2">Peak Analysis</h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            {peaks.slice(0, 6).map((peakIndex, i) => {
              const peak = data[peakIndex]
              const colors = ['text-red-400', 'text-yellow-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-pink-400']
              return (
                <div key={i} className="space-y-1">
                  <div className={`font-medium ${colors[i]}`}>Peak {i + 1}</div>
                  <div className="text-gray-400">Potential: {peak.x.toFixed(3)} V</div>
                  <div className="text-gray-400">Current: {peak.y.toFixed(1)} µA</div>
                </div>
              )
            })}
          </div>
          
          {peaks.length >= 2 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                Peak Separation (P1-P2): <span className="text-white">
                  {Math.abs(data[peaks[1]].x - data[peaks[0]].x).toFixed(3)} V
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Current Ratio (P1/P2): <span className="text-white">
                  {(data[peaks[0]].y / data[peaks[1]].y).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}