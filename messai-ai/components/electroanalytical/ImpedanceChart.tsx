'use client'

import React, { useEffect, useRef } from 'react'
import { ElectroanalyticalTechnique } from '@/lib/electroanalytical/electroanalytical-catalog'
import { DataPoint } from './ElectroanalyticalTool'

interface ImpedanceChartProps {
  data: DataPoint[]
  parameters: { [key: string]: any }
  technique: ElectroanalyticalTechnique
  isRunning: boolean
  progress: number
}

export function ImpedanceChart({ data, parameters, technique, isRunning, progress }: ImpedanceChartProps) {
  const nyquistCanvasRef = useRef<HTMLCanvasElement>(null)
  const bodeCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const drawCharts = () => {
      drawNyquistPlot()
      drawBodePlot()
    }

    const drawNyquistPlot = () => {
      const canvas = nyquistCanvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      const { width, height } = canvas.getBoundingClientRect()
      
      // Clear canvas
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
        ctx.fillText('Start EIS to see Nyquist plot', width / 2, height / 2)
        return
      }

      // Calculate scales for Nyquist plot (Z' vs -Z'')
      const zRealMin = Math.min(...data.map(d => d.x))
      const zRealMax = Math.max(...data.map(d => d.x))
      const zImagMin = Math.min(...data.map(d => d.y))
      const zImagMax = Math.max(...data.map(d => d.y))

      const xScale = (x: number) => margin.left + (x - zRealMin) / (zRealMax - zRealMin) * chartWidth
      const yScale = (y: number) => margin.top + (1 - (y - zImagMin) / (zImagMax - zImagMin)) * chartHeight

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
      ctx.fillText("Z' (Ω)", width / 2, height - 10)

      ctx.save()
      ctx.translate(15, height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText("-Z'' (Ω)", 0, 0)
      ctx.restore()

      // Title
      ctx.fillStyle = '#F9FAFB'
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Nyquist Plot', width / 2, 25)

      // Draw Nyquist curve
      if (data.length > 1) {
        ctx.strokeStyle = '#8B5CF6' // purple-500
        ctx.lineWidth = 3

        ctx.beginPath()
        ctx.moveTo(xScale(data[0].x), yScale(data[0].y))

        for (let i = 1; i < data.length; i++) {
          ctx.lineTo(xScale(data[i].x), yScale(data[i].y))
        }

        ctx.stroke()

        // Draw frequency markers
        const frequencyColors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']
        data.forEach((point, index) => {
          if (index % Math.max(1, Math.floor(data.length / 20)) === 0) {
            const colorIndex = Math.floor(index / data.length * frequencyColors.length)
            ctx.fillStyle = frequencyColors[colorIndex] || '#3B82F6'
            ctx.beginPath()
            ctx.arc(xScale(point.x), yScale(point.y), 4, 0, 2 * Math.PI)
            ctx.fill()

            // Frequency label
            if (point.z) {
              ctx.fillStyle = '#9CA3AF'
              ctx.font = '10px system-ui'
              ctx.textAlign = 'center'
              ctx.fillText(formatFrequency(point.z), xScale(point.x), yScale(point.y) - 8)
            }
          }
        })

        // Current point
        if (isRunning && data.length > 0) {
          const currentPoint = data[data.length - 1]
          ctx.fillStyle = '#EF4444'
          ctx.beginPath()
          ctx.arc(xScale(currentPoint.x), yScale(currentPoint.y), 6, 0, 2 * Math.PI)
          ctx.fill()
        }
      }

      // Tick labels
      ctx.font = '12px system-ui'
      ctx.fillStyle = '#9CA3AF'

      for (let i = 0; i <= 5; i++) {
        const x = margin.left + (i / 5) * chartWidth
        const value = zRealMin + (i / 5) * (zRealMax - zRealMin)
        ctx.textAlign = 'center'
        ctx.fillText(value.toFixed(0), x, margin.top + chartHeight + 20)

        const y = margin.top + chartHeight - (i / 5) * chartHeight
        const yValue = zImagMin + (i / 5) * (zImagMax - zImagMin)
        ctx.textAlign = 'right'
        ctx.fillText(yValue.toFixed(0), margin.left - 10, y + 5)
      }
    }

    const drawBodePlot = () => {
      const canvas = bodeCanvasRef.current
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

      if (data.length === 0) {
        ctx.fillStyle = '#6B7280'
        ctx.font = '16px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('Start EIS to see Bode plots', width / 2, height / 2)
        return
      }

      // Split canvas for magnitude and phase plots
      const plotHeight = (height - 100) / 2
      const margin = { top: 30, right: 40, bottom: 40, left: 80 }

      // Calculate scales
      const frequencies = data.map(d => d.z || 1).filter(f => f > 0)
      const logFreqMin = Math.log10(Math.min(...frequencies))
      const logFreqMax = Math.log10(Math.max(...frequencies))
      
      const magnitudes = data.map(d => Math.sqrt(d.x * d.x + d.y * d.y))
      const logMagMin = Math.log10(Math.min(...magnitudes))
      const logMagMax = Math.log10(Math.max(...magnitudes))
      
      const phases = data.map(d => d.phase || 0)
      const phaseMin = Math.min(...phases)
      const phaseMax = Math.max(...phases)

      const xScale = (freq: number) => margin.left + (Math.log10(freq) - logFreqMin) / (logFreqMax - logFreqMin) * (width - margin.left - margin.right)
      const magScale = (mag: number) => margin.top + (1 - (Math.log10(mag) - logMagMin) / (logMagMax - logMagMin)) * plotHeight
      const phaseScale = (phase: number) => margin.top + plotHeight + 50 + (1 - (phase - phaseMin) / (phaseMax - phaseMin)) * plotHeight

      // Draw magnitude plot
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])

      // Grid for magnitude
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + (i / 5) * plotHeight
        ctx.beginPath()
        ctx.moveTo(margin.left, y)
        ctx.lineTo(width - margin.right, y)
        ctx.stroke()
      }

      // Grid for phase
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + plotHeight + 50 + (i / 5) * plotHeight
        ctx.beginPath()
        ctx.moveTo(margin.left, y)
        ctx.lineTo(width - margin.right, y)
        ctx.stroke()
      }

      ctx.setLineDash([])

      // Draw magnitude curve
      ctx.strokeStyle = '#3B82F6'
      ctx.lineWidth = 2
      ctx.beginPath()

      let first = true
      data.forEach(point => {
        if (point.z && point.z > 0) {
          const x = xScale(point.z)
          const mag = Math.sqrt(point.x * point.x + point.y * point.y)
          const y = magScale(mag)
          
          if (first) {
            ctx.moveTo(x, y)
            first = false
          } else {
            ctx.lineTo(x, y)
          }
        }
      })
      ctx.stroke()

      // Draw phase curve
      ctx.strokeStyle = '#10B981'
      ctx.lineWidth = 2
      ctx.beginPath()

      first = true
      data.forEach(point => {
        if (point.z && point.z > 0 && point.phase !== undefined) {
          const x = xScale(point.z)
          const y = phaseScale(point.phase)
          
          if (first) {
            ctx.moveTo(x, y)
            first = false
          } else {
            ctx.lineTo(x, y)
          }
        }
      })
      ctx.stroke()

      // Labels and titles
      ctx.fillStyle = '#F9FAFB'
      ctx.font = 'bold 14px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Bode Plot - Magnitude', width / 2, 20)

      ctx.fillStyle = '#3B82F6'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'left'
      ctx.fillText('|Z| (Ω)', margin.left + 10, margin.top + 20)

      ctx.fillStyle = '#10B981'
      ctx.fillText('Phase (°)', margin.left + 10, margin.top + plotHeight + 70)

      ctx.fillStyle = '#D1D5DB'
      ctx.textAlign = 'center'
      ctx.fillText('Frequency (Hz)', width / 2, height - 10)
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

  const formatFrequency = (freq: number): string => {
    if (freq >= 1000000) return `${(freq / 1000000).toFixed(1)}M`
    if (freq >= 1000) return `${(freq / 1000).toFixed(1)}k`
    return freq.toFixed(1)
  }

  const handleExportData = () => {
    if (data.length === 0) return

    const csvContent = [
      ['Frequency (Hz)', "Z' (Ω)", "-Z'' (Ω)", 'Phase (°)', '|Z| (Ω)'].join(','),
      ...data.map(point => {
        const magnitude = Math.sqrt(point.x * point.x + point.y * point.y)
        return [
          (point.z || 0).toFixed(3),
          point.x.toFixed(6),
          point.y.toFixed(6),
          (point.phase || 0).toFixed(2),
          magnitude.toFixed(6)
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eis_data_${new Date().toISOString().slice(0, 10)}.csv`
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
              Frequency Points: <span className="text-white">{data.length}</span>
            </div>
            {data.length > 0 && (
              <div className="text-sm text-gray-400">
                Current Freq: <span className="text-purple-400">{formatFrequency(data[data.length - 1]?.z || 0)} Hz</span>
              </div>
            )}
            {data.length > 0 && (
              <div className="text-sm text-gray-400">
                |Z|: <span className="text-blue-400">
                  {Math.sqrt(Math.pow(data[data.length - 1]?.x || 0, 2) + Math.pow(data[data.length - 1]?.y || 0, 2)).toFixed(1)} Ω
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportData}
              disabled={data.length === 0}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
            >
              Export EIS Data
            </button>
          </div>
        </div>
      </div>

      {/* Charts Container */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Nyquist Plot */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <canvas
            ref={nyquistCanvasRef}
            className="w-full h-full"
            style={{ background: '#111827' }}
          />
        </div>

        {/* Bode Plot */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <canvas
            ref={bodeCanvasRef}
            className="w-full h-full"
            style={{ background: '#111827' }}
          />
        </div>
      </div>

      {/* EIS Analysis Info */}
      <div className="bg-gray-800 p-3 rounded-lg mt-4">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Frequency Range:</span>
            <div className="text-white">
              {parameters.startFrequency ? formatFrequency(parameters.startFrequency) : '100k'} - {parameters.endFrequency ? formatFrequency(parameters.endFrequency) : '0.1'} Hz
            </div>
          </div>
          <div>
            <span className="text-gray-400">AC Amplitude:</span>
            <div className="text-white">{parameters.amplitude || 0.01} V</div>
          </div>
          <div>
            <span className="text-gray-400">DC Potential:</span>
            <div className="text-white">{parameters.dcPotential || 0} V</div>
          </div>
          <div>
            <span className="text-gray-400">Points/Decade:</span>
            <div className="text-white">{parameters.pointsPerDecade || 10}</div>
          </div>
        </div>
      </div>
    </div>
  )
}