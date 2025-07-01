import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lcars: {
          // Main LCARS Colors
          orange: '#FF9900',
          peach: '#FFCC99',
          pink: '#CC99CC',
          purple: '#9999CC',
          blue: '#6699CC',
          cyan: '#99CCFF',
          red: '#CC6666',
          gold: '#FFCC66',
          tan: '#FFCC99',
          // UI Colors
          black: '#000000',
          gray: '#999999',
          white: '#FFFFFF',
          // Semantic Colors
          primary: '#FF9900',
          secondary: '#99CCFF',
          danger: '#CC6666',
          success: '#99CC99',
          warning: '#FFCC66',
        }
      },
      fontFamily: {
        lcars: ['Antonio', 'Arial Narrow', 'sans-serif'],
      },
      borderRadius: {
        'lcars': '20px',
        'lcars-lg': '40px',
      },
      animation: {
        'lcars-blink': 'lcars-blink 1s infinite',
        'lcars-sweep': 'lcars-sweep 2s ease-in-out infinite',
      },
      keyframes: {
        'lcars-blink': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0.3' },
        },
        'lcars-sweep': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config