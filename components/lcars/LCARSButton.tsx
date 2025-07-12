'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface LCARSButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success'
  size?: 'sm' | 'md' | 'lg'
  rounded?: 'left' | 'right' | 'both' | 'none'
}

const LCARSButton = forwardRef<HTMLButtonElement, LCARSButtonProps>(
  ({ className, variant = 'primary', size = 'md', rounded = 'both', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-lcars-orange hover:bg-lcars-peach',
      secondary: 'bg-lcars-cyan hover:bg-lcars-blue',
      danger: 'bg-lcars-red hover:bg-lcars-pink',
      warning: 'bg-lcars-gold hover:bg-lcars-tan',
      success: 'bg-lcars-success hover:opacity-80',
    }

    const sizes = {
      sm: 'h-8 px-4 text-sm',
      md: 'h-12 px-6 text-base',
      lg: 'h-16 px-8 text-lg',
    }

    const roundedStyles = {
      left: 'rounded-l-lcars rounded-r-none',
      right: 'rounded-r-lcars rounded-l-none',
      both: 'rounded-lcars',
      none: 'rounded-none',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'font-lcars uppercase tracking-wider text-lcars-black font-bold transition-all duration-200',
          'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          roundedStyles[rounded],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

LCARSButton.displayName = 'LCARSButton'

export default LCARSButton