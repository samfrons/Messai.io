'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Gauge, 
  Battery, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react'

interface PerformanceData {
  powerDensity: number
  efficiency: number
  voltage: number
}

interface PerformanceMonitorProps {
  data: PerformanceData
  className?: string
}

export default function PerformanceMonitor({ data, className = '' }: PerformanceMonitorProps) {
  const [history, setHistory] = useState<PerformanceData[]>([])
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable')
  
  // Update history when data changes
  useEffect(() => {
    setHistory(prev => {
      const newHistory = [...prev, data].slice(-20) // Keep last 20 data points
      
      // Calculate trend
      if (newHistory.length > 2) {
        const recent = newHistory.slice(-3)
        const avgRecent = recent.reduce((sum, d) => sum + d.powerDensity, 0) / recent.length
        const avgPrevious = newHistory.slice(-6, -3).reduce((sum, d) => sum + d.powerDensity, 0) / 3
        
        if (avgRecent > avgPrevious * 1.05) {
          setTrend('up')
        } else if (avgRecent < avgPrevious * 0.95) {
          setTrend('down')
        } else {
          setTrend('stable')
        }
      }
      
      return newHistory
    })
  }, [data])
  
  const getPerformanceStatus = (value: number, type: 'power' | 'efficiency' | 'voltage') => {
    const thresholds = {
      power: { excellent: 1000, good: 500, fair: 100 },
      efficiency: { excellent: 70, good: 50, fair: 30 },
      voltage: { excellent: 0.8, good: 0.5, fair: 0.3 }
    }
    
    const threshold = thresholds[type]
    
    if (value >= threshold.excellent) return { status: 'excellent', color: 'text-green-400', icon: CheckCircle }
    if (value >= threshold.good) return { status: 'good', color: 'text-blue-400', icon: Activity }
    if (value >= threshold.fair) return { status: 'fair', color: 'text-yellow-400', icon: AlertTriangle }
    return { status: 'poor', color: 'text-red-400', icon: XCircle }
  }
  
  const powerStatus = getPerformanceStatus(data.powerDensity, 'power')
  const efficiencyStatus = getPerformanceStatus(data.efficiency, 'efficiency')
  const voltageStatus = getPerformanceStatus(data.voltage, 'voltage')
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down': return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
      default: return <Activity className="w-4 h-4 text-blue-400" />
    }
  }
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'border-green-400/30 bg-green-400/10'
      case 'down': return 'border-red-400/30 bg-red-400/10'
      default: return 'border-blue-400/30 bg-blue-400/10'
    }
  }

  return (
    <Card className={`bg-slate-800/50 border-blue-400/30 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Gauge className="w-5 h-5" />
          Performance Monitor
        </CardTitle>
        <CardDescription className="text-blue-200">
          Real-time system performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Performance Trend */}
        <div className={`p-3 rounded-lg border ${getTrendColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className="text-white font-medium">System Trend</span>
            </div>
            <Badge variant="outline" className="border-current">
              {trend.toUpperCase()}
            </Badge>
          </div>
        </div>
        
        {/* Power Density */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-blue-200">Power Density</span>
            </div>
            <div className="flex items-center gap-2">
              <powerStatus.icon className={`w-4 h-4 ${powerStatus.color}`} />
              <span className={`font-semibold ${powerStatus.color}`}>
                {data.powerDensity.toFixed(1)} mW/m²
              </span>
            </div>
          </div>
          <Progress 
            value={Math.min((data.powerDensity / 2000) * 100, 100)} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0</span>
            <span>2000+ mW/m²</span>
          </div>
        </div>
        
        {/* Efficiency */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-blue-200">Efficiency</span>
            </div>
            <div className="flex items-center gap-2">
              <efficiencyStatus.icon className={`w-4 h-4 ${efficiencyStatus.color}`} />
              <span className={`font-semibold ${efficiencyStatus.color}`}>
                {data.efficiency.toFixed(1)}%
              </span>
            </div>
          </div>
          <Progress 
            value={Math.min(data.efficiency, 100)} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Voltage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-blue-400" />
              <span className="text-blue-200">Voltage</span>
            </div>
            <div className="flex items-center gap-2">
              <voltageStatus.icon className={`w-4 h-4 ${voltageStatus.color}`} />
              <span className={`font-semibold ${voltageStatus.color}`}>
                {data.voltage.toFixed(2)} V
              </span>
            </div>
          </div>
          <Progress 
            value={Math.min((data.voltage / 2.0) * 100, 100)} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0 V</span>
            <span>2.0+ V</span>
          </div>
        </div>
        
        {/* Performance Summary */}
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Performance Summary</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className={`font-semibold ${powerStatus.color}`}>
                {powerStatus.status.toUpperCase()}
              </div>
              <div className="text-gray-400">Power</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${efficiencyStatus.color}`}>
                {efficiencyStatus.status.toUpperCase()}
              </div>
              <div className="text-gray-400">Efficiency</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${voltageStatus.color}`}>
                {voltageStatus.status.toUpperCase()}
              </div>
              <div className="text-gray-400">Voltage</div>
            </div>
          </div>
        </div>
        
        {/* Historical Data */}
        {history.length > 1 && (
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">Historical Metrics</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Average Power:</span>
                <span className="text-white">
                  {(history.reduce((sum, d) => sum + d.powerDensity, 0) / history.length).toFixed(1)} mW/m²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Peak Power:</span>
                <span className="text-white">
                  {Math.max(...history.map(d => d.powerDensity)).toFixed(1)} mW/m²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Peak Efficiency:</span>
                <span className="text-white">
                  {Math.max(...history.map(d => d.efficiency)).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Performance Thresholds */}
        <div className="bg-slate-700/30 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Performance Thresholds</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-green-400">Excellent</span>
              <span className="text-gray-400 ml-auto">≥1000 mW/m², ≥70% eff</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-blue-400">Good</span>
              <span className="text-gray-400 ml-auto">≥500 mW/m², ≥50% eff</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span className="text-yellow-400">Fair</span>
              <span className="text-gray-400 ml-auto">≥100 mW/m², ≥30% eff</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-red-400">Poor</span>
              <span className="text-gray-400 ml-auto">&lt;100 mW/m², &lt;30% eff</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}