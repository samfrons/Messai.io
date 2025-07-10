import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // MESSAi Bio-inspired color palette
        gray: {
          50: '#f7f7f8',
          100: '#ececf1',
          200: '#d9d9e3',
          300: '#c5c5d2',
          400: '#acacbe',
          500: '#8e8ea0',
          600: '#565869',
          700: '#40414f',
          800: '#343541',
          900: '#202123',
          950: '#0c0c0d',
        },
        // Bio-inspired theme colors (CSS custom properties)
        'messai-primary': 'var(--color-primary, #1e3a32)',
        'messai-secondary': 'var(--color-secondary, #2d5a47)',
        'messai-accent': 'var(--color-accent, #c2185b)',
        'messai-neutral': 'var(--color-neutral, #f8f9fa)',
        'messai-charcoal': 'var(--color-charcoal, #263238)',
        
        // Bio accent colors
        'bio-algae': 'var(--bio-algae, rgba(45, 90, 71, 0.1))',
        'bio-cellular': 'var(--bio-cellular, rgba(194, 24, 91, 0.08))',
        'bio-growth': 'var(--bio-growth, rgba(76, 175, 80, 0.12))',
        'bio-microscopy': 'var(--bio-microscopy, rgba(255, 248, 225, 0.3))',
        
        // Industry-specific colors
        'industry-wastewater': 'var(--industry-wastewater, #4A9B8E)',
        'industry-energy': 'var(--industry-energy, #FFC107)',
        'industry-manufacturing': 'var(--industry-manufacturing, #7CB342)',
        'industry-environmental': 'var(--industry-environmental, #2D5A47)',
        'industry-space': 'var(--industry-space, #7B1FA2)',
        
        // Data visualization colors
        'viz-performance': 'var(--viz-performance, #4CAF50)',
        'viz-efficiency': 'var(--viz-efficiency, #FF9800)',
        'viz-power': 'var(--viz-power, #F44336)',
        'viz-stability': 'var(--viz-stability, #2196F3)',
        'viz-ph': 'var(--viz-ph, #9C27B0)',
        
        // Preserve existing colors for compatibility
        primary: {
          50: '#e6f7f3',
          100: '#c0ebe0',
          200: '#96dfcb',
          300: '#6cd2b5',
          400: '#3fc5a0',
          500: '#10a37f',
          600: '#0d8f6f',
          700: '#0a7c5f',
          800: '#076850',
          900: '#045440',
        },
        // Surface colors
        surface: {
          light: '#ffffff',
          dark: '#343541',
        },
        // Border colors
        border: {
          DEFAULT: '#e5e7eb',
          light: 'rgba(0, 0, 0, 0.1)',
          dark: 'rgba(255, 255, 255, 0.1)',
        },
        // Semantic colors
        success: {
          light: '#10a37f',
          dark: '#0d8f6f',
        },
        error: {
          light: '#ef4444',
          dark: '#dc2626',
        },
        warning: {
          light: '#f59e0b',
          dark: '#d97706',
        },
        info: {
          light: '#3b82f6',
          dark: '#2563eb',
        },
        // Bio-inspired cream color
        cream: {
          50: '#fefcf0',
          100: '#fff8e1',
          200: '#fff0b3',
          300: '#ffe780',
          400: '#ffdd4d',
          500: '#ffd21a',
          600: '#e6bd00',
          700: '#b39200',
          800: '#806900',
          900: '#4d3f00',
        }
      },
      fontFamily: {
        sans: ['Söhne', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Söhne Mono', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
      },
      fontSize: {
        // ChatGPT-style text sizes
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
      },
      borderRadius: {
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'chat': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        // Bio-inspired gradients
        'hero-gradient': 'var(--gradient-hero, linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 50%, #f0f9f0 100%))',
        'accent-gradient': 'var(--gradient-accent, linear-gradient(90deg, rgba(45, 90, 71, 0.05) 0%, rgba(194, 24, 91, 0.05) 100%))',
        'card-gradient': 'var(--gradient-card, linear-gradient(145deg, #ffffff 0%, #f8fffe 100%))',
        'button-gradient': 'var(--gradient-button, linear-gradient(135deg, #2d5a47 0%, #1e3a32 100%))',
        'bioelectric-gradient': 'var(--gradient-bioelectric, linear-gradient(135deg, #ffc107 0%, #2d5a47 100%))',
        
        // Bio patterns
        'cellular-mesh': 'radial-gradient(circle at 25% 25%, rgba(76, 175, 80, 0.1) 2px, transparent 2px)',
        'biofilm-texture': 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(76, 175, 80, 0.05) 2px, rgba(76, 175, 80, 0.05) 4px)',
        'algae-flow': 'linear-gradient(90deg, transparent 0%, rgba(74, 155, 142, 0.1) 50%, transparent 100%)',
        'microscopy-dots': 'radial-gradient(ellipse at center, rgba(139, 195, 74, 0.15) 0%, transparent 50%)',
        'spore-pattern': 'repeating-radial-gradient(circle, rgba(255, 193, 7, 0.1) 0px, rgba(255, 193, 7, 0.1) 1px, transparent 1px, transparent 8px)',
        'organic-gradient': 'radial-gradient(ellipse at 30% 70%, rgba(45, 90, 71, 0.02) 0%, transparent 50%)',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'organic-float': 'organicFloat 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        organicFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-3px) rotate(1deg)' },
          '66%': { transform: 'translateY(2px) rotate(-1deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config