import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// LCARS-specific utilities
export const lcarsColors = {
  orange: '#FF9900',
  peach: '#FFCC99',
  pink: '#CC99CC',
  purple: '#9999CC',
  blue: '#6699CC',
  cyan: '#99CCFF',
  red: '#CC6666',
  gold: '#FFCC66',
  tan: '#FFCC99',
  black: '#000000',
  gray: '#999999',
  white: '#FFFFFF',
} as const

export type LCARSColor = keyof typeof lcarsColors