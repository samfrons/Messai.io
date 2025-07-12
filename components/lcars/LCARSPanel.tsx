'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface LCARSPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'light'
  cornerStyle?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'all' | 'none'
  border?: boolean
}

const LCARSPanel = forwardRef<HTMLDivElement, LCARSPanelProps>(
  ({ className, variant = 'dark', cornerStyle = 'all', border = true, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-lcars-black text-lcars-orange',
      secondary: 'bg-lcars-black text-lcars-cyan',
      dark: 'bg-lcars-black text-lcars-tan',
      light: 'bg-lcars-gray bg-opacity-10 text-lcars-white',
    }

    const cornerClasses = {
      'top-left': 'rounded-tl-lcars-lg',
      'top-right': 'rounded-tr-lcars-lg',
      'bottom-left': 'rounded-bl-lcars-lg',
      'bottom-right': 'rounded-br-lcars-lg',
      'all': 'rounded-lcars-lg',
      'none': '',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          variants[variant],
          cornerClasses[cornerStyle],
          border && 'border-2 border-lcars-orange',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

LCARSPanel.displayName = 'LCARSPanel'

export default LCARSPanel