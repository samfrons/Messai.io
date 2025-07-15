'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Gauge, 
  Battery, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react'

interface PerformanceData {
  powerOutput: number
  efficiency: number
  cost: number
  voltage: number
  current: number
  temperature: number
  pH: number
  timestamp: number
}

interface PerformanceDashboardProps {
  performanceData: PerformanceData
  systemType?: 'MFC' | 'MEC' | 'MDC' | 'MES'
  onOptimizationSuggestion?: (suggestion: string) => void
}

export default function PerformanceDashboard({ 
  performanceData
}: PerformanceDashboardProps) {
  const [historicalData, setHistoricalData] = useState<PerformanceData[]>([])
  const [alerts, setAlerts] = useState<Array<{type: 'warning' | 'error' | 'success', message: string}>>([])
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('1h')

  // Simulate historical data and alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = { ...performanceData, timestamp: Date.now() }
      setHistoricalData(prev => [...prev.slice(-49), newData])
      
      // Generate alerts based on performance data
      const newAlerts = []
      if (performanceData.efficiency < 30) {
        newAlerts.push({ type: 'warning' as const, message: 'Low efficiency detected' })
      }
      if (performanceData.temperature > 35) {
        newAlerts.push({ type: 'error' as const, message: 'Temperature above optimal range' })
      }
      if (performanceData.pH < 6.5 || performanceData.pH > 8.5) {
        newAlerts.push({ type: 'warning' as const, message: 'pH outside optimal range' })
      }
      if (performanceData.powerOutput > 80) {
        newAlerts.push({ type: 'success' as const, message: 'Excellent power output achieved' })
      }
      
      setAlerts(newAlerts)
    }, 3000)

    return () => clearInterval(interval)
  }, [performanceData])

  const getPerformanceColor = (value: number, type: 'power' | 'efficiency' | 'cost') => {
    if (type === 'power') {
      return value > 70 ? 'text-green-600' : value > 40 ? 'text-yellow-600' : 'text-red-600'
    }
    if (type === 'efficiency') {
      return value > 60 ? 'text-green-600' : value > 30 ? 'text-yellow-600' : 'text-red-600'
    }
    if (type === 'cost') {
      return value > 70 ? 'text-green-600' : value > 40 ? 'text-yellow-600' : 'text-red-600'
    }
    return 'text-gray-600'
  }

  const getPerformanceIcon = (value: number, type: 'power' | 'efficiency' | 'cost') => {
    const color = getPerformanceColor(value, type)
    if (type === 'power') return <Zap className={`w-4 h-4 ${color}`} />
    if (type === 'efficiency') return <Gauge className={`w-4 h-4 ${color}`} />
    if (type === 'cost') return <DollarSign className={`w-4 h-4 ${color}`} />
    return <Activity className={`w-4 h-4 ${color}`} />
  }

  const optimizationSuggestions = [
    { condition: performanceData.efficiency < 40, suggestion: 'Consider increasing electrolyte conductivity' },
    { condition: performanceData.temperature > 30, suggestion: 'Implement cooling system for optimal temperature' },
    { condition: performanceData.pH < 6.8, suggestion: 'Add pH buffer to maintain neutral conditions' },
    { condition: performanceData.powerOutput < 50, suggestion: 'Check electrode surface area and biofilm formation' }
  ]

  const currentSuggestions = optimizationSuggestions.filter(s => s.condition)

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getPerformanceIcon(performanceData.powerOutput, 'power')}
              <span className="text-sm font-medium text-gray-700">Power Output</span>
            </div>
            <div className="flex items-center gap-1">
              {performanceData.powerOutput > 50 ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {performanceData.powerOutput.toFixed(1)}
            <span className="text-sm font-normal text-gray-500 ml-1">mW</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(performanceData.powerOutput, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getPerformanceIcon(performanceData.efficiency, 'efficiency')}
              <span className="text-sm font-medium text-gray-700">Efficiency</span>
            </div>
            <div className="flex items-center gap-1">
              {performanceData.efficiency > 40 ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {performanceData.efficiency.toFixed(1)}
            <span className="text-sm font-normal text-gray-500 ml-1">%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(performanceData.efficiency, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Battery className="w-4 h-4 text-gray-600" />
          <h4 className="font-medium text-gray-900">System Status</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Voltage:</span>
            <span className="font-medium">{performanceData.voltage.toFixed(2)}V</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Current:</span>
            <span className="font-medium">{performanceData.current.toFixed(2)}mA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Temperature:</span>
            <span className="font-medium">{performanceData.temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">pH:</span>
            <span className="font-medium">{performanceData.pH.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">Performance Trend</h4>
          </div>
          <div className="flex gap-1">
            {['1h', '24h', '7d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as '1h' | '24h' | '7d')}
                className={`px-2 py-1 text-xs rounded ${
                  timeRange === range 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        {/* Simple trend visualization */}
        <div className="h-20 bg-gray-50 rounded flex items-end justify-between px-2 py-2">
          {historicalData.slice(-20).map((data, index) => (
            <div
              key={index}
              className="bg-blue-500 w-2 rounded-t transition-all duration-300"
              style={{ height: `${(data.powerOutput / 100) * 60}px` }}
            />
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h4 className="font-medium text-gray-900">System Alerts</h4>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded bg-gray-50">
                {alert.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                <span className="text-sm text-gray-700">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimization Suggestions */}
      {currentSuggestions.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <h4 className="font-medium text-gray-900">Optimization Suggestions</h4>
          </div>
          <div className="space-y-2">
            {currentSuggestions.map((suggestion, index) => (
              <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                <div className="text-blue-900 font-medium">💡 Suggestion {index + 1}</div>
                <div className="text-blue-700">{suggestion.suggestion}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost Analysis */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="w-4 h-4 text-gray-600" />
          <h4 className="font-medium text-gray-900">Cost Analysis</h4>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Material Cost:</span>
            <span className="font-medium">${(performanceData.cost * 0.6).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Operation Cost:</span>
            <span className="font-medium">${(performanceData.cost * 0.3).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Maintenance:</span>
            <span className="font-medium">${(performanceData.cost * 0.1).toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between items-center font-medium">
              <span>Total Cost:</span>
              <span>${performanceData.cost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Runtime Statistics */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-gray-600" />
          <h4 className="font-medium text-gray-900">Runtime Statistics</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">24.5</div>
            <div className="text-gray-600">Hours Runtime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">98.2</div>
            <div className="text-gray-600">% Uptime</div>
          </div>
        </div>
      </div>
    </div>
  )
}