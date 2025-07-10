/**
 * MESSAi Refined Bio-Inspired Theme System
 * Sophisticated, scientific, and elegant design that celebrates microbial systems
 */

export type ThemeStyle = 'refined' | 'bold' | 'minimal'

export interface MESSAiTheme {
  // Professional foundation with bio accents
  brand: {
    primary: string
    secondary: string
    accent: string
    neutral: string
    charcoal: string
  }
  
  // Elegant bio touches
  bioAccents: {
    algae: string
    cellular: string
    growth: string
    microscopy: string
  }
  
  // Professional gradients (subtle, not rainbow)
  gradients: {
    hero: string
    accent: string
    card: string
    button: string
    bioelectric: string
  }
  
  // Typography - Scientific but approachable
  typography: {
    hero: string
    section: string
    body: string
    caption: string
    scientific: string
  }
  
  // Animation preferences
  animations: {
    duration: string
    easing: string
    hover: string
  }
  
  // Component styles
  components: {
    card: {
      primary: string
      microscopy: string
      biofilm: string
    }
    button: {
      primary: string
      secondary: string
      bioelectric: string
      cellular: string
    }
    badge: {
      algae: string
      bacterial: string
      biofilm: string
      performance: string
    }
  }
  
  // Industry-specific colors
  industries: {
    wastewater: string
    energy: string
    manufacturing: string
    environmental: string
    space: string
  }
  
  // Scientific data visualization colors
  dataViz: {
    performance: string
    efficiency: string
    power: string
    stability: string
    pH: string
  }
}

const refinedBioTheme: MESSAiTheme = {
  brand: {
    primary: '#1e3a32',        // Deep forest (sophisticated, not bright)
    secondary: '#2d5a47',      // Rich algae green (muted, elegant)
    accent: '#c2185b',         // Refined pink (sophisticated, not neon)
    neutral: '#f8f9fa',        // Clean lab white
    charcoal: '#263238',       // Professional dark
  },
  
  bioAccents: {
    algae: 'rgba(45, 90, 71, 0.1)',      // Subtle teal overlay
    cellular: 'rgba(194, 24, 91, 0.08)',  // Gentle pink tint
    growth: 'rgba(76, 175, 80, 0.12)',   // Soft green highlight
    microscopy: 'rgba(255, 248, 225, 0.3)', // Warm lab lighting
  },
  
  gradients: {
    hero: 'linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 50%, #f0f9f0 100%)',
    accent: 'linear-gradient(90deg, rgba(45, 90, 71, 0.05) 0%, rgba(194, 24, 91, 0.05) 100%)',
    card: 'linear-gradient(145deg, #ffffff 0%, #f8fffe 100%)',
    button: 'linear-gradient(135deg, #2d5a47 0%, #1e3a32 100%)',
    bioelectric: 'linear-gradient(135deg, #ffc107 0%, #2d5a47 100%)',
  },
  
  typography: {
    hero: 'text-5xl md:text-6xl font-bold tracking-tight text-gray-900',
    section: 'text-3xl md:text-4xl font-semibold text-gray-800',
    body: 'text-lg leading-relaxed text-gray-700',
    caption: 'text-sm text-gray-600 font-medium',
    scientific: 'font-mono text-sm text-gray-500 tracking-wider',
  },
  
  animations: {
    duration: '500ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    hover: 'hover:scale-105 hover:shadow-xl transition-all duration-300',
  },
  
  components: {
    card: {
      primary: 'bg-white/95 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300',
      microscopy: 'bg-gradient-to-br from-cream-50 to-green-50/30 border border-green-200/50 rounded-xl',
      biofilm: 'bg-gradient-to-br from-green-50/50 to-teal-50/50 border border-green-200/30 rounded-2xl',
    },
    button: {
      primary: 'bg-gradient-to-r from-teal-600 to-green-600 text-white hover:from-teal-700 hover:to-green-700 transition-all duration-300',
      secondary: 'border-2 border-teal-600 text-teal-700 hover:bg-teal-50 transition-all duration-300',
      bioelectric: 'bg-gradient-to-r from-amber-500 to-green-600 text-white hover:shadow-lg hover:shadow-amber-200/50 transition-all duration-300',
      cellular: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105 transition-all duration-300',
    },
    badge: {
      algae: 'bg-teal-50 text-teal-700 border border-teal-200/50',
      bacterial: 'bg-purple-50 text-purple-700 border border-purple-200/50',
      biofilm: 'bg-green-50 text-green-700 border border-green-200/50',
      performance: 'bg-blue-50 text-blue-700 border border-blue-200/50',
    }
  },
  
  industries: {
    wastewater: '#4A9B8E',     // Clean algae green
    energy: '#FFC107',         // Bio-electric gold
    manufacturing: '#7CB342',  // Growth green
    environmental: '#2D5A47',  // Deep forest
    space: '#7B1FA2',          // Extreme organism purple
  },
  
  dataViz: {
    performance: '#4CAF50',    // Growth green for good performance
    efficiency: '#FF9800',     // Energy amber for efficiency
    power: '#F44336',         // Power red for intensity
    stability: '#2196F3',     // Stability blue
    pH: '#9C27B0',           // pH purple
  }
}

const boldBioTheme: MESSAiTheme = {
  ...refinedBioTheme,
  brand: {
    ...refinedBioTheme.brand,
    accent: '#e91e63',         // More vibrant pink
    primary: '#0d7377',        // Brighter teal
  },
  gradients: {
    ...refinedBioTheme.gradients,
    hero: 'linear-gradient(135deg, #4CAF50 0%, #e91e63 50%, #00D4FF 100%)',
    bioelectric: 'linear-gradient(135deg, #FF6B35 0%, #4CAF50 100%)',
  }
}

const minimalTheme: MESSAiTheme = {
  ...refinedBioTheme,
  bioAccents: {
    algae: 'rgba(0, 0, 0, 0.02)',
    cellular: 'rgba(0, 0, 0, 0.02)',
    growth: 'rgba(0, 0, 0, 0.02)',
    microscopy: 'rgba(0, 0, 0, 0.02)',
  },
  gradients: {
    hero: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
    accent: 'linear-gradient(90deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.01) 100%)',
    card: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)',
    button: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
    bioelectric: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
  }
}

export const createTheme = (style: ThemeStyle = 'refined'): MESSAiTheme => {
  switch(style) {
    case 'refined':
      return refinedBioTheme
    case 'bold':
      return boldBioTheme
    case 'minimal':
      return minimalTheme
    default:
      return refinedBioTheme
  }
}

// Bio-inspired CSS patterns for backgrounds
export const bioPatterns = {
  cellularMesh: 'radial-gradient(circle at 25% 25%, rgba(76, 175, 80, 0.1) 2px, transparent 2px)',
  biofilmTexture: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(76, 175, 80, 0.05) 2px, rgba(76, 175, 80, 0.05) 4px)',
  algaeFlow: 'linear-gradient(90deg, transparent 0%, rgba(74, 155, 142, 0.1) 50%, transparent 100%)',
  microscopeDots: 'radial-gradient(ellipse at center, rgba(139, 195, 74, 0.15) 0%, transparent 50%)',
  sporePattern: 'repeating-radial-gradient(circle, rgba(255, 193, 7, 0.1) 0px, rgba(255, 193, 7, 0.1) 1px, transparent 1px, transparent 8px)',
  organicGradient: 'radial-gradient(ellipse at 30% 70%, rgba(45, 90, 71, 0.02) 0%, transparent 50%)',
}

// Industry-specific theme variants
export const industryThemes = {
  wastewater: {
    ...refinedBioTheme,
    brand: { ...refinedBioTheme.brand, primary: '#4A9B8E', secondary: '#26A69A' },
    gradients: { ...refinedBioTheme.gradients, hero: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 50%, #80CBC4 100%)' }
  },
  energy: {
    ...refinedBioTheme,
    brand: { ...refinedBioTheme.brand, primary: '#FFC107', secondary: '#FF8F00' },
    gradients: { ...refinedBioTheme.gradients, hero: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFD54F 100%)' }
  },
  environmental: {
    ...refinedBioTheme,
    brand: { ...refinedBioTheme.brand, primary: '#2D5A47', secondary: '#388E3C' },
    gradients: { ...refinedBioTheme.gradients, hero: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 50%, #A5D6A7 100%)' }
  }
}

export default refinedBioTheme