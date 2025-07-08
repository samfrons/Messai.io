import { useEffect, useCallback } from 'react'

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const { key, ctrl = false, shift = false, alt = false, handler } = shortcut
      
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt
      ) {
        event.preventDefault()
        handler()
        break
      }
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Common shortcuts for the fuel cell system
export const fuelCellShortcuts = {
  switchToConfig: { key: '1', ctrl: true, description: 'Switch to Config view' },
  switchTo3D: { key: '2', ctrl: true, description: 'Switch to 3D view' },
  switchToSplit: { key: '3', ctrl: true, description: 'Switch to Split view' },
  switchToControl: { key: '4', ctrl: true, description: 'Switch to Control view' },
  switchToHIL: { key: '5', ctrl: true, description: 'Switch to HIL view' },
  switchToOptimize: { key: '6', ctrl: true, description: 'Switch to Optimize view' },
  switchToCompare: { key: '7', ctrl: true, description: 'Switch to Compare view' },
  runPrediction: { key: 'p', ctrl: true, description: 'Run prediction' },
  runSimulation: { key: 's', ctrl: true, description: 'Run simulation' },
  startOptimization: { key: 'o', ctrl: true, description: 'Start optimization' },
  toggleAdvanced: { key: 'a', ctrl: true, description: 'Toggle advanced options' },
  help: { key: '?', description: 'Show help' }
}