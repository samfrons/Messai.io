'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FuelCellType } from '@/lib/types/fuel-cell-types'

// ============================================================================
// INTERFACES
// ============================================================================

interface ControlSystemVisualizationProps {
  timeSeriesData?: {
    time: number[]
    temperature: number[]
    humidity: number[]
    pressure: number[]
    power: number[]
  } | null
  fuelCellType: FuelCellType
  isSimulating?: boolean
  className?: string
}

interface ChartConfig {
  parameter: keyof ControlSystemVisualizationProps['timeSeriesData']
  label: string
  unit: string
  color: string
  min?: number
  max?: number
}

// ============================================================================
// CHART CONFIGURATIONS
// ============================================================================

const CHART_CONFIGS: ChartConfig[] = [
  {
    parameter: 'temperature',
    label: 'Temperature',
    unit: '°C',
    color: '#ef4444',
    min: 0,
    max: 1000
  },
  {
    parameter: 'humidity',
    label: 'Humidity',
    unit: '%',
    color: '#3b82f6',
    min: 0,
    max: 100
  },
  {
    parameter: 'pressure',
    label: 'Pressure',
    unit: 'bar',
    color: '#10b981',
    min: 0,
    max: 20
  },
  {
    parameter: 'power',
    label: 'Power',
    unit: 'W',
    color: '#f59e0b',
    min: 0
  }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ControlSystemVisualization({
  timeSeriesData,
  fuelCellType,
  isSimulating = false,
  className = ''
}: ControlSystemVisualizationProps) {
  const [selectedChart, setSelectedChart] = useState<string>('temperature')
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('grid')
  const [playbackTime, setPlaybackTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Filter charts based on fuel cell type
  const availableCharts = useMemo(() => {
    return CHART_CONFIGS.filter(config => {
      // Hide humidity for high-temperature fuel cells
      if (config.parameter === 'humidity' && (fuelCellType === 'SOFC' || fuelCellType === 'MCFC')) {
        return false
      }
      return true
    })
  }, [fuelCellType])

  // Playback animation
  useEffect(() => {
    if (!isPlaying || !timeSeriesData?.time.length) return

    const interval = setInterval(() => {
      setPlaybackTime(prev => {
        const maxTime = timeSeriesData.time[timeSeriesData.time.length - 1]
        if (prev >= maxTime) {
          setIsPlaying(false)
          return 0
        }
        return prev + 0.5
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isPlaying, timeSeriesData])

  const handlePlayback = () => {
    if (!timeSeriesData?.time.length) return
    setIsPlaying(!isPlaying)
  }

  const handleTimeSeek = (time: number) => {
    setPlaybackTime(time)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Control System Visualization
        </h3>
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'single' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Single
            </button>
          </div>

          {/* Playback Controls */}
          {timeSeriesData && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayback}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={() => {
                  setPlaybackTime(0)
                  setIsPlaying(false)
                }}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                ⏹️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isSimulating && (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-gray-600 dark:text-gray-400">Running simulation...</div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!timeSeriesData && !isSimulating && (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">📊</div>
            <div>Run a simulation to view control system behavior</div>
          </div>
        </div>
      )}

      {/* Chart Display */}
      {timeSeriesData && !isSimulating && (
        <>
          {/* Single Chart Mode */}
          {viewMode === 'single' && (
            <div className="space-y-4">
              {/* Chart Selection */}
              <div className="flex gap-2 flex-wrap">
                {availableCharts.map(config => (
                  <button
                    key={config.parameter}
                    onClick={() => setSelectedChart(config.parameter)}
                    className={`px-3 py-2 text-sm rounded transition-colors ${
                      selectedChart === config.parameter
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>

              {/* Large Chart */}
              <div className="h-96">
                <TimeSeriesChart
                  config={availableCharts.find(c => c.parameter === selectedChart)!}
                  data={timeSeriesData}
                  playbackTime={playbackTime}
                  onTimeSeek={handleTimeSeek}
                  height={384}
                />
              </div>
            </div>
          )}

          {/* Grid Mode */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCharts.map(config => (
                <div key={config.parameter} className="h-64">
                  <TimeSeriesChart
                    config={config}
                    data={timeSeriesData}
                    playbackTime={playbackTime}
                    onTimeSeek={handleTimeSeek}
                    height={256}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Playback Timeline */}
          {timeSeriesData.time.length > 0 && (
            <PlaybackTimeline
              timeData={timeSeriesData.time}
              currentTime={playbackTime}
              onTimeChange={handleTimeSeek}
            />
          )}
        </>
      )}
    </div>
  )
}

// ============================================================================
// CHART COMPONENT
// ============================================================================

interface TimeSeriesChartProps {
  config: ChartConfig
  data: {
    time: number[]
    temperature: number[]
    humidity: number[]
    pressure: number[]
    power: number[]
  }
  playbackTime: number
  onTimeSeek: (time: number) => void
  height: number
}

function TimeSeriesChart({ config, data, playbackTime, onTimeSeek, height }: TimeSeriesChartProps) {
  const chartData = data[config.parameter] as number[]
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">No data available</div>
      </div>
    )
  }

  // Calculate chart dimensions and scaling
  const padding = 40
  const chartWidth = 800
  const chartHeight = height - padding * 2

  const minValue = config.min !== undefined ? config.min : Math.min(...chartData)
  const maxValue = config.max !== undefined ? config.max : Math.max(...chartData)
  const valueRange = maxValue - minValue || 1

  const minTime = Math.min(...data.time)
  const maxTime = Math.max(...data.time)
  const timeRange = maxTime - minTime || 1

  // Create SVG path
  const pathData = chartData.map((value, index) => {
    const x = ((data.time[index] - minTime) / timeRange) * chartWidth
    const y = chartHeight - ((value - minValue) / valueRange) * chartHeight
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  // Current position indicator
  const currentIndex = data.time.findIndex(time => time >= playbackTime)
  const currentX = currentIndex >= 0 
    ? ((data.time[currentIndex] - minTime) / timeRange) * chartWidth 
    : 0

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">{config.label}</h4>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Current: {currentIndex >= 0 ? chartData[currentIndex]?.toFixed(1) : '--'} {config.unit}
        </div>
      </div>
      
      <div className="relative" style={{ height: height - 60 }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth + padding * 2} ${height}`}
          className="overflow-visible"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left - padding
            const timeProgress = x / chartWidth
            const newTime = minTime + timeProgress * timeRange
            onTimeSeek(Math.max(minTime, Math.min(maxTime, newTime)))
          }}
        >
          {/* Grid lines */}
          <g stroke="#e5e7eb" strokeWidth="1" opacity="0.5">
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
              <line
                key={`h-${ratio}`}
                x1={padding}
                y1={padding + ratio * chartHeight}
                x2={padding + chartWidth}
                y2={padding + ratio * chartHeight}
              />
            ))}
            {/* Vertical grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
              <line
                key={`v-${ratio}`}
                x1={padding + ratio * chartWidth}
                y1={padding}
                x2={padding + ratio * chartWidth}
                y2={padding + chartHeight}
              />
            ))}
          </g>

          {/* Data line */}
          <path
            d={pathData}
            fill="none"
            stroke={config.color}
            strokeWidth="2"
            transform={`translate(${padding}, ${padding})`}
          />

          {/* Current time indicator */}
          <line
            x1={padding + currentX}
            y1={padding}
            x2={padding + currentX}
            y2={padding + chartHeight}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="4,4"
          />

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <text
              key={`y-${ratio}`}
              x={padding - 10}
              y={padding + (1 - ratio) * chartHeight + 5}
              textAnchor="end"
              fontSize="12"
              fill="currentColor"
              className="text-gray-600 dark:text-gray-400"
            >
              {(minValue + ratio * valueRange).toFixed(1)}
            </text>
          ))}

          {/* X-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <text
              key={`x-${ratio}`}
              x={padding + ratio * chartWidth}
              y={padding + chartHeight + 20}
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
              className="text-gray-600 dark:text-gray-400"
            >
              {(minTime + ratio * timeRange).toFixed(0)}s
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}

// ============================================================================
// PLAYBACK TIMELINE
// ============================================================================

interface PlaybackTimelineProps {
  timeData: number[]
  currentTime: number
  onTimeChange: (time: number) => void
}

function PlaybackTimeline({ timeData, currentTime, onTimeChange }: PlaybackTimelineProps) {
  const minTime = Math.min(...timeData)
  const maxTime = Math.max(...timeData)
  const timeRange = maxTime - minTime || 1
  
  const progress = ((currentTime - minTime) / timeRange) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Timeline</span>
        <span>{currentTime.toFixed(1)}s / {maxTime.toFixed(1)}s</span>
      </div>
      
      <div className="relative">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${progress}%` }}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        
        <input
          type="range"
          min={minTime}
          max={maxTime}
          step={0.1}
          value={currentTime}
          onChange={(e) => onTimeChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}