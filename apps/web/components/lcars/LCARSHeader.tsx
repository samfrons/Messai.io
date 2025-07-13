'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface LCARSHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  color?: 'orange' | 'cyan' | 'purple' | 'red' | 'gold'
}

const LCARSHeader = forwardRef<HTMLDivElement, LCARSHeaderProps>(
  ({ className, title, subtitle, color = 'orange', ...props }, ref) => {
    const colorClasses = {
      orange: 'bg-lcars-orange',
      cyan: 'bg-lcars-cyan',
      purple: 'bg-lcars-purple',
      red: 'bg-lcars-red',
      gold: 'bg-lcars-gold',
    }

    return (
      <div ref={ref} className={cn('flex items-stretch', className)} {...props}>
        {/* Left cap */}
        <div className={cn('w-32 rounded-l-lcars-lg', colorClasses[color])} />
        
        {/* Main bar */}
        <div className={cn('flex-1 flex items-center px-8', colorClasses[color])}>
          <div>
            <h1 className="text-2xl md:text-3xl font-lcars font-bold text-lcars-black uppercase tracking-wider">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm md:text-base font-lcars text-lcars-black opacity-80 uppercase">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Right decorative elements */}
        <div className="flex items-stretch gap-2">
          <div className={cn('w-4', colorClasses[color])} />
          <div className={cn('w-24 rounded-r-lcars-lg', colorClasses[color])} />
        </div>
      </div>
    )
  }
)

LCARSHeader.displayName = 'LCARSHeader'

export default LCARSHeader