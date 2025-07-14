'use client'

import { useState, useEffect } from 'react'

/**
 * Hook for managing loading states
 */
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState)
  
  return {
    isLoading,
    setLoading: setIsLoading,
    withLoading: async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
      setIsLoading(true)
      try {
        const result = await asyncFn()
        return result
      } finally {
        setIsLoading(false)
      }
    }
  }
}

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}