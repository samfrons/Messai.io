// Performance monitoring utility for Three.js applications
export class PerformanceMonitor {
  private frameCount = 0
  private lastTime = performance.now()
  private fps = 0
  private avgFrameTime = 0
  private frameTimeHistory: number[] = []
  private maxHistorySize = 60

  update(): { fps: number; frameTime: number } {
    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    
    this.frameCount++
    this.frameTimeHistory.push(deltaTime)
    
    if (this.frameTimeHistory.length > this.maxHistorySize) {
      this.frameTimeHistory.shift()
    }

    // Calculate FPS every second
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
      this.frameCount = 0
      this.lastTime = currentTime
    }

    // Calculate average frame time
    if (this.frameTimeHistory.length > 0) {
      const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0)
      this.avgFrameTime = sum / this.frameTimeHistory.length
    }

    return {
      fps: this.fps,
      frameTime: Math.round(this.avgFrameTime * 100) / 100
    }
  }

  getMetrics() {
    return {
      fps: this.fps,
      frameTime: this.avgFrameTime,
      drawCalls: (window as any).drawCalls || 0,
      triangles: (window as any).triangles || 0,
      memory: this.getMemoryUsage()
    }
  }

  private getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      }
    }
    return null
  }

  // Utility to check if performance is degraded
  isPerformanceDegraded(targetFPS: number = 30): boolean {
    return this.fps > 0 && this.fps < targetFPS
  }

  // Get performance recommendations
  getRecommendations(): string[] {
    const recommendations: string[] = []
    
    if (this.fps < 30 && this.fps > 0) {
      recommendations.push('Consider reducing particle count or geometry complexity')
    }
    
    if (this.avgFrameTime > 20) {
      recommendations.push('Frame time is high - optimize render loop')
    }
    
    const memory = this.getMemoryUsage()
    if (memory && memory.used / memory.total > 0.8) {
      recommendations.push('High memory usage detected - consider disposing unused resources')
    }
    
    return recommendations
  }
}

// React hook for performance monitoring
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

export function usePerformanceMonitor(enabled = true) {
  const monitor = useRef(new PerformanceMonitor())
  const [metrics, setMetrics] = useState({
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    memory: null as any
  })

  useFrame(() => {
    if (!enabled) return
    
    const { fps, frameTime } = monitor.current.update()
    
    // Update metrics every 10 frames to reduce overhead
    if (Math.random() < 0.1) {
      setMetrics(monitor.current.getMetrics())
    }
  })

  return {
    metrics,
    isPerformanceDegraded: monitor.current.isPerformanceDegraded.bind(monitor.current),
    getRecommendations: monitor.current.getRecommendations.bind(monitor.current)
  }
}

// Component to display performance metrics
export function PerformanceDisplay({ metrics }: { metrics: any }) {
  return (
    <div className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono">
      <div>FPS: {metrics.fps}</div>
      <div>Frame Time: {metrics.frameTime}ms</div>
      <div>Draw Calls: {metrics.drawCalls}</div>
      <div>Triangles: {metrics.triangles}</div>
      {metrics.memory && (
        <>
          <div>Memory: {metrics.memory.used}/{metrics.memory.total}MB</div>
        </>
      )}
    </div>
  )
}