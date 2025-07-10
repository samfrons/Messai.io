/**
 * MESSAi Theme Hook
 * Easy theme switching and customization for the bio-inspired design system
 */

import { useState, useEffect } from 'react'
import { createTheme, type ThemeStyle, type MESSAiTheme, industryThemes } from '@/lib/themes/refined-bio-theme'

export const useTheme = () => {
  const [currentStyle, setCurrentStyle] = useState<ThemeStyle>('refined')
  const [currentIndustry, setCurrentIndustry] = useState<string | null>(null)
  const [theme, setTheme] = useState<MESSAiTheme>(createTheme('refined'))

  // Apply theme changes
  useEffect(() => {
    let newTheme: MESSAiTheme
    
    if (currentIndustry && industryThemes[currentIndustry as keyof typeof industryThemes]) {
      newTheme = industryThemes[currentIndustry as keyof typeof industryThemes]
    } else {
      newTheme = createTheme(currentStyle)
    }
    
    setTheme(newTheme)
    
    // Apply CSS custom properties to document root
    const root = document.documentElement
    root.style.setProperty('--color-primary', newTheme.brand.primary)
    root.style.setProperty('--color-secondary', newTheme.brand.secondary)
    root.style.setProperty('--color-accent', newTheme.brand.accent)
    root.style.setProperty('--color-neutral', newTheme.brand.neutral)
    root.style.setProperty('--color-charcoal', newTheme.brand.charcoal)
    
    // Bio accent colors
    root.style.setProperty('--bio-algae', newTheme.bioAccents.algae)
    root.style.setProperty('--bio-cellular', newTheme.bioAccents.cellular)
    root.style.setProperty('--bio-growth', newTheme.bioAccents.growth)
    root.style.setProperty('--bio-microscopy', newTheme.bioAccents.microscopy)
    
    // Gradients
    root.style.setProperty('--gradient-hero', newTheme.gradients.hero)
    root.style.setProperty('--gradient-accent', newTheme.gradients.accent)
    root.style.setProperty('--gradient-card', newTheme.gradients.card)
    root.style.setProperty('--gradient-button', newTheme.gradients.button)
    root.style.setProperty('--gradient-bioelectric', newTheme.gradients.bioelectric)
    
    // Industry colors
    root.style.setProperty('--industry-wastewater', newTheme.industries.wastewater)
    root.style.setProperty('--industry-energy', newTheme.industries.energy)
    root.style.setProperty('--industry-manufacturing', newTheme.industries.manufacturing)
    root.style.setProperty('--industry-environmental', newTheme.industries.environmental)
    root.style.setProperty('--industry-space', newTheme.industries.space)
    
    // Data visualization colors
    root.style.setProperty('--viz-performance', newTheme.dataViz.performance)
    root.style.setProperty('--viz-efficiency', newTheme.dataViz.efficiency)
    root.style.setProperty('--viz-power', newTheme.dataViz.power)
    root.style.setProperty('--viz-stability', newTheme.dataViz.stability)
    root.style.setProperty('--viz-ph', newTheme.dataViz.pH)
    
  }, [currentStyle, currentIndustry])

  const switchStyle = (style: ThemeStyle) => {
    setCurrentStyle(style)
    setCurrentIndustry(null) // Clear industry theme when switching styles
  }

  const switchIndustry = (industry: string | null) => {
    setCurrentIndustry(industry)
  }

  const resetTheme = () => {
    setCurrentStyle('refined')
    setCurrentIndustry(null)
  }

  // Helper functions for component styling
  const getCardClass = (variant: 'primary' | 'microscopy' | 'biofilm' = 'primary') => {
    return theme.components.card[variant]
  }

  const getButtonClass = (variant: 'primary' | 'secondary' | 'bioelectric' | 'cellular' = 'primary') => {
    return theme.components.button[variant]
  }

  const getBadgeClass = (variant: 'algae' | 'bacterial' | 'biofilm' | 'performance' = 'algae') => {
    return theme.components.badge[variant]
  }

  // Quick style presets
  const applyPreset = (preset: 'scientific' | 'vibrant' | 'minimal' | 'wastewater' | 'energy') => {
    switch (preset) {
      case 'scientific':
        switchStyle('refined')
        break
      case 'vibrant':
        switchStyle('bold')
        break
      case 'minimal':
        switchStyle('minimal')
        break
      case 'wastewater':
        switchIndustry('wastewater')
        break
      case 'energy':
        switchIndustry('energy')
        break
    }
  }

  return {
    theme,
    currentStyle,
    currentIndustry,
    switchStyle,
    switchIndustry,
    resetTheme,
    applyPreset,
    // Helper functions
    getCardClass,
    getButtonClass,
    getBadgeClass,
    // Theme info
    availableStyles: ['refined', 'bold', 'minimal'] as ThemeStyle[],
    availableIndustries: ['wastewater', 'energy', 'environmental'],
    isCustomTheme: currentIndustry !== null,
  }
}

// Theme context for app-wide theme management
import { createContext, useContext, ReactNode } from 'react'

interface ThemeContextType {
  theme: MESSAiTheme
  currentStyle: ThemeStyle
  currentIndustry: string | null
  switchStyle: (style: ThemeStyle) => void
  switchIndustry: (industry: string | null) => void
  resetTheme: () => void
  applyPreset: (preset: string) => void
  getCardClass: (variant?: 'primary' | 'microscopy' | 'biofilm') => string
  getButtonClass: (variant?: 'primary' | 'secondary' | 'bioelectric' | 'cellular') => string
  getBadgeClass: (variant?: 'algae' | 'bacterial' | 'biofilm' | 'performance') => string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const themeData = useTheme()
  
  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

export default useTheme