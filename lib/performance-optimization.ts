// Performance optimization utilities for fuel cell components

import { memo } from 'react'
import { debounce, throttle } from 'lodash'

// ============================================================================
// MEMOIZATION HELPERS
// ============================================================================

export const memoizeComponent = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(Component, propsAreEqual)
}

// Custom comparison function for complex objects
export const deepPropsComparison = <P extends object>(
  prevProps: P,
  nextProps: P,
  keysToCheck?: (keyof P)[]
): boolean => {
  const keys = keysToCheck || (Object.keys(prevProps) as (keyof P)[])
  
  return keys.every(key => {
    const prevValue = prevProps[key]
    const nextValue = nextProps[key]
    
    if (prevValue === nextValue) return true
    
    if (
      typeof prevValue === 'object' &&
      typeof nextValue === 'object' &&
      prevValue !== null &&
      nextValue !== null
    ) {
      return JSON.stringify(prevValue) === JSON.stringify(nextValue)
    }
    
    return false
  })
}

// ============================================================================
// DEBOUNCING AND THROTTLING
// ============================================================================

export const createDebouncedHandler = <T extends (...args: any[]) => any>(
  handler: T,
  delay: number = 300
): T => {
  return debounce(handler, delay) as T
}

export const createThrottledHandler = <T extends (...args: any[]) => any>(
  handler: T,
  delay: number = 100
): T => {
  return throttle(handler, delay) as T
}

// ============================================================================
// LAZY LOADING HELPERS
// ============================================================================

export const lazyLoadComponent = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>
) => {
  return import('react').then(({ lazy }) => lazy(importFn))
}

// ============================================================================
// CALCULATION CACHING
// ============================================================================

interface CacheEntry<T> {
  value: T
  timestamp: number
}

class CalculationCache<K, V> {
  private cache = new Map<string, CacheEntry<V>>()
  private maxAge: number
  private maxSize: number

  constructor(maxAge: number = 5 * 60 * 1000, maxSize: number = 100) {
    this.maxAge = maxAge
    this.maxSize = maxSize
  }

  private getKey(key: K): string {
    return JSON.stringify(key)
  }

  get(key: K): V | undefined {
    const keyStr = this.getKey(key)
    const entry = this.cache.get(keyStr)
    
    if (!entry) return undefined
    
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(keyStr)
      return undefined
    }
    
    return entry.value
  }

  set(key: K, value: V): void {
    const keyStr = this.getKey(key)
    
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0]
      this.cache.delete(oldestKey)
    }
    
    this.cache.set(keyStr, {
      value,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

// Global caches for expensive calculations
export const predictionCache = new CalculationCache<any, any>(5 * 60 * 1000, 50)
export const optimizationCache = new CalculationCache<any, any>(10 * 60 * 1000, 20)

// ============================================================================
// VIRTUALIZATION HELPERS
// ============================================================================

export interface VirtualizedListConfig {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export const calculateVisibleRange = (
  scrollTop: number,
  config: VirtualizedListConfig,
  totalItems: number
): { start: number; end: number } => {
  const { itemHeight, containerHeight, overscan = 5 } = config
  
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const end = Math.min(totalItems, start + visibleCount + overscan * 2)
  
  return { start, end }
}

// ============================================================================
// WEB WORKER UTILITIES
// ============================================================================

export const createWorkerForHeavyCalculation = <I, O>(
  workerScript: string
): ((input: I) => Promise<O>) => {
  return (input: I): Promise<O> => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(workerScript)
      
      worker.onmessage = (event) => {
        resolve(event.data as O)
        worker.terminate()
      }
      
      worker.onerror = (error) => {
        reject(error)
        worker.terminate()
      }
      
      worker.postMessage(input)
    })
  }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export const measurePerformance = async <T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> => {
  const start = performance.now()
  
  try {
    const result = await fn()
    const duration = performance.now() - start
    
    if (duration > 100) {
      console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`)
    }
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    console.error(`Performance error: ${name} failed after ${duration.toFixed(2)}ms`, error)
    throw error
  }
}

// ============================================================================
// BATCH UPDATES
// ============================================================================

export class BatchUpdateManager<T> {
  private updates: T[] = []
  private timeoutId: NodeJS.Timeout | null = null
  private batchSize: number
  private delay: number
  private processBatch: (batch: T[]) => void

  constructor(
    processBatch: (batch: T[]) => void,
    batchSize: number = 10,
    delay: number = 100
  ) {
    this.processBatch = processBatch
    this.batchSize = batchSize
    this.delay = delay
  }

  add(update: T): void {
    this.updates.push(update)
    
    if (this.updates.length >= this.batchSize) {
      this.flush()
    } else {
      this.scheduleFlush()
    }
  }

  private scheduleFlush(): void {
    if (this.timeoutId) return
    
    this.timeoutId = setTimeout(() => {
      this.flush()
    }, this.delay)
  }

  flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    
    if (this.updates.length === 0) return
    
    const batch = this.updates.splice(0, this.batchSize)
    this.processBatch(batch)
    
    if (this.updates.length > 0) {
      this.scheduleFlush()
    }
  }

  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    this.updates = []
  }
}

// ============================================================================
// MEMORY OPTIMIZATION
// ============================================================================

export const releaseUnusedMemory = (): void => {
  // Clear caches
  predictionCache.clear()
  optimizationCache.clear()
  
  // Trigger garbage collection if available (requires --expose-gc flag)
  if (typeof global !== 'undefined' && 'gc' in global) {
    (global as any).gc()
  }
}

// Monitor memory usage
export const monitorMemoryUsage = (threshold: number = 100 * 1024 * 1024): void => {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (performance as any)) {
    const checkMemory = () => {
      const memory = (performance as any).memory
      const usedMemory = memory.usedJSHeapSize
      
      if (usedMemory > threshold) {
        console.warn(`High memory usage detected: ${(usedMemory / 1024 / 1024).toFixed(2)} MB`)
        releaseUnusedMemory()
      }
    }
    
    // Check every minute
    setInterval(checkMemory, 60 * 1000)
  }
}