import React from 'react'
import { motion } from 'framer-motion'
import * as CaladanIcons from './CaladanIcons'

interface ParameterCardProps {
  title: string
  value: string | number
  unit?: string
  description?: string
  icon: keyof typeof CaladanIcons
  trend?: 'up' | 'down' | 'stable'
  className?: string
}

export const ParameterCard: React.FC<ParameterCardProps> = ({
  title,
  value,
  unit,
  description,
  icon,
  trend,
  className = ""
}) => {
  const IconComponent = CaladanIcons[icon]
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-500'
      case 'down': return 'text-red-500'
      case 'stable': return 'text-blue-500'
      default: return 'caladan-text-accent'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗'
      case 'down': return '↘'
      case 'stable': return '→'
      default: return ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`caladan-card p-6 hover:glow-caladan transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="caladan-icon-bg">
          <IconComponent size={24} className="caladan-text-accent" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
          </span>
        )}
      </div>
      
      <div className="mb-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
      </div>
      
      <div className="flex items-baseline mb-2">
        <span className="text-2xl font-bold caladan-text-accent">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground ml-1">
            {unit}
          </span>
        )}
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </motion.div>
  )
}

interface ParameterGridProps {
  parameters: Array<{
    title: string
    value: string | number
    unit?: string
    description?: string
    icon: keyof typeof CaladanIcons
    trend?: 'up' | 'down' | 'stable'
  }>
  className?: string
}

export const ParameterGrid: React.FC<ParameterGridProps> = ({ 
  parameters, 
  className = "" 
}) => {
  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {parameters.map((param, index) => (
        <motion.div
          key={param.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <ParameterCard {...param} />
        </motion.div>
      ))}
    </div>
  )
}

// Feature card with Caladan Bio styling
interface FeatureCardProps {
  title: string
  description: string
  icon: keyof typeof CaladanIcons
  highlights?: string[]
  className?: string
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  highlights,
  className = ""
}) => {
  const IconComponent = CaladanIcons[icon]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className={`caladan-card p-8 group cursor-pointer ${className}`}
    >
      <div className="caladan-icon-bg mb-6 group-hover:glow-sm transition-all duration-300">
        <IconComponent size={32} className="caladan-text-accent" />
      </div>
      
      <h3 className="text-xl font-semibold mb-4 group-hover:caladan-text-accent transition-colors">
        {title}
      </h3>
      
      <p className="text-muted-foreground mb-6 leading-relaxed">
        {description}
      </p>
      
      {highlights && highlights.length > 0 && (
        <div className="space-y-2">
          {highlights.map((highlight, index) => (
            <div key={index} className="flex items-center text-sm">
              <div className="w-1.5 h-1.5 rounded-full caladan-bg-medium mr-3" />
              <span className="text-muted-foreground">{highlight}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}