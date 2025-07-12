'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface LCARSSidebarItem {
  label: string
  color?: 'orange' | 'cyan' | 'purple' | 'red' | 'gold' | 'pink' | 'blue'
  onClick?: () => void
  active?: boolean
}

interface LCARSSidebarProps extends HTMLAttributes<HTMLDivElement> {
  items: LCARSSidebarItem[]
  position?: 'left' | 'right'
}

const LCARSSidebar = forwardRef<HTMLDivElement, LCARSSidebarProps>(
  ({ className, items, position = 'left', ...props }, ref) => {
    const colorClasses = {
      orange: 'bg-lcars-orange',
      cyan: 'bg-lcars-cyan',
      purple: 'bg-lcars-purple',
      red: 'bg-lcars-red',
      gold: 'bg-lcars-gold',
      pink: 'bg-lcars-pink',
      blue: 'bg-lcars-blue',
    }

    const roundedClasses = position === 'left' 
      ? 'rounded-r-lcars' 
      : 'rounded-l-lcars'

    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
        {/* Top cap */}
        <div className={cn(
          'h-24 bg-lcars-orange',
          position === 'left' ? 'rounded-tr-lcars-lg' : 'rounded-tl-lcars-lg'
        )} />
        
        {/* Menu items */}
        <div className="flex-1 flex flex-col gap-2">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={cn(
                'h-12 px-6 font-lcars uppercase tracking-wider text-lcars-black font-bold',
                'transition-all duration-200 hover:opacity-80 active:scale-95',
                roundedClasses,
                colorClasses[item.color || 'cyan'],
                item.active && 'animate-lcars-blink'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        
        {/* Bottom cap */}
        <div className={cn(
          'h-32 bg-lcars-purple',
          position === 'left' ? 'rounded-br-lcars-lg' : 'rounded-bl-lcars-lg'
        )} />
      </div>
    )
  }
)

LCARSSidebar.displayName = 'LCARSSidebar'

export default LCARSSidebar