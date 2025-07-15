'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react'

interface PerformanceStats {
  fps: number
  drawCalls: number
  triangles: number
  performance: 'good' | 'fair' | 'poor'
}

interface PerformanceMonitorProps {
  enabled?: boolean
  onPerformanceChange?: (stats: PerformanceStats) => void
}

export default function PerformanceMonitor({ 
  enabled = true, 
  onPerformanceChange 
}: PerformanceMonitorProps) {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    drawCalls: 0,
    triangles: 0,
    performance: 'good'
  })
  
  const [frameCount, setFrameCount] = useState(0)
  const [lastTime, setLastTime] = useState(Date.now())

  useEffect(() => {
    if (!enabled) return
    
    let animationId: number
    
    const updateStats = () => {
      setFrameCount(prev => prev + 1)
      
      // Calculate FPS every 60 frames
      if (frameCount % 60 === 0) {
        const now = Date.now()
        const delta = now - lastTime
        const fps = Math.round(60000 / delta)
        
        // Simulate WebGL stats (since we can't access them outside Canvas)
        const drawCalls = Math.floor(Math.random() * 20) + 10
        const triangles = Math.floor(Math.random() * 5000) + 1000
        
        // Determine performance level
        let performance: 'good' | 'fair' | 'poor' = 'good'
        if (fps < 30) performance = 'poor'
        else if (fps < 50) performance = 'fair'
        
        const newStats = {
          fps,
          drawCalls,
          triangles,
          performance
        }
        
        setStats(newStats)
        onPerformanceChange?.(newStats)
        setLastTime(now)
      }
      
      animationId = requestAnimationFrame(updateStats)
    }
    
    animationId = requestAnimationFrame(updateStats)
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [enabled, frameCount, lastTime, onPerformanceChange])

  if (!enabled) return null

  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-2 rounded text-xs font-mono">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="w-3 h-3" />
        <span>Performance Monitor</span>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span>FPS:</span>
          <span className={`font-bold ${
            stats.fps >= 50 ? 'text-green-400' : 
            stats.fps >= 30 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {stats.fps}
          </span>
          {stats.performance === 'good' && <CheckCircle className="w-3 h-3 text-green-400" />}
          {stats.performance === 'fair' && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
          {stats.performance === 'poor' && <AlertTriangle className="w-3 h-3 text-red-400" />}
        </div>
        
        <div>
          <span>Draw Calls: </span>
          <span className="text-blue-400">{stats.drawCalls}</span>
        </div>
        
        <div>
          <span>Triangles: </span>
          <span className="text-purple-400">{stats.triangles.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

