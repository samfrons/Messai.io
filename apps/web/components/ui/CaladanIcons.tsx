import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

// Electrode icon - representing electrode materials
export const ElectrodeIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="electrodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.6"/>
      </linearGradient>
    </defs>
    <rect x="3" y="6" width="4" height="12" rx="2" fill="url(#electrodeGrad)" stroke="currentColor" strokeWidth="0.5"/>
    <rect x="17" y="6" width="4" height="12" rx="2" fill="url(#electrodeGrad)" stroke="currentColor" strokeWidth="0.5"/>
    <path d="M7 12 L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3"/>
    <path d="M10 8 L14 8 M10 16 L14 16" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </svg>
)

// Microbe icon - representing microbial parameters
export const MicrobeIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <radialGradient id="microbeGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3"/>
      </radialGradient>
    </defs>
    <ellipse cx="12" cy="12" rx="8" ry="6" fill="url(#microbeGrad)" stroke="currentColor" strokeWidth="1"/>
    <circle cx="10" cy="10" r="1.5" fill="currentColor" opacity="0.7"/>
    <circle cx="14" cy="14" r="1" fill="currentColor" opacity="0.5"/>
    <circle cx="8" cy="14" r="0.8" fill="currentColor" opacity="0.4"/>
    <circle cx="16" cy="10" r="0.6" fill="currentColor" opacity="0.6"/>
    <path d="M4 12 Q6 8 8 12 Q10 16 12 12" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6"/>
    <path d="M12 12 Q14 8 16 12 Q18 16 20 12" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6"/>
  </svg>
)

// Flow icon - representing flow parameters
export const FlowIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3"/>
        <stop offset="50%" stopColor="currentColor" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3"/>
      </linearGradient>
    </defs>
    <path d="M2 12 L22 12" stroke="url(#flowGrad)" strokeWidth="3" strokeLinecap="round"/>
    <path d="M18 8 L22 12 L18 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="6" cy="12" r="1" fill="currentColor" opacity="0.6">
      <animate attributeName="cx" values="6;16;6" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="10" cy="12" r="0.8" fill="currentColor" opacity="0.4">
      <animate attributeName="cx" values="10;20;10" dur="2.5s" repeatCount="indefinite"/>
    </circle>
  </svg>
)

// Temperature icon - representing thermal parameters
export const TemperatureIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="tempGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
        <stop offset="70%" stopColor="currentColor" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3"/>
      </linearGradient>
    </defs>
    <rect x="10" y="3" width="4" height="14" rx="2" fill="url(#tempGrad)" stroke="currentColor" strokeWidth="1"/>
    <circle cx="12" cy="19" r="3" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
    <rect x="11" y="15" width="2" height="4" fill="currentColor"/>
    <path d="M8 6 L9 6 M8 9 L9 9 M8 12 L9 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M15 6 L16 6 M15 9 L16 9 M15 12 L16 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </svg>
)

// pH icon - representing chemical parameters
export const PhIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <radialGradient id="phGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.2"/>
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="9" fill="url(#phGrad)" stroke="currentColor" strokeWidth="1.5"/>
    <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">pH</text>
    <circle cx="8" cy="8" r="1" fill="currentColor" opacity="0.6"/>
    <circle cx="16" cy="8" r="0.8" fill="currentColor" opacity="0.4"/>
    <circle cx="12" cy="6" r="0.6" fill="currentColor" opacity="0.5"/>
    <path d="M6 12 Q12 8 18 12" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6"/>
  </svg>
)

// Power icon - representing electrical parameters
export const PowerIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="powerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.4"/>
      </linearGradient>
    </defs>
    <path d="M13 2 L7 12 L11 12 L11 22 L17 12 L13 12 Z" fill="url(#powerGrad)" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.8">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
    </circle>
  </svg>
)

// Substrate icon - representing chemical substrates
export const SubstrateIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <radialGradient id="substrateGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.1"/>
      </radialGradient>
    </defs>
    <circle cx="8" cy="8" r="3" fill="url(#substrateGrad)" stroke="currentColor" strokeWidth="1"/>
    <circle cx="16" cy="8" r="2.5" fill="url(#substrateGrad)" stroke="currentColor" strokeWidth="1"/>
    <circle cx="12" cy="16" r="3.5" fill="url(#substrateGrad)" stroke="currentColor" strokeWidth="1"/>
    <circle cx="6" cy="16" r="2" fill="url(#substrateGrad)" stroke="currentColor" strokeWidth="1"/>
    <circle cx="18" cy="16" r="2" fill="url(#substrateGrad)" stroke="currentColor" strokeWidth="1"/>
    <path d="M8 11 L12 13 M16 11 L12 13 M9 16 L15 16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
  </svg>
)

// Tank icon - representing reactor vessels
export const TankIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="tankGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.2"/>
        <stop offset="50%" stopColor="currentColor" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.8"/>
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="12" height="14" rx="2" fill="url(#tankGrad)" stroke="currentColor" strokeWidth="1.5"/>
    <ellipse cx="12" cy="6" rx="6" ry="1.5" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1"/>
    <rect x="8" y="4" width="1" height="3" fill="currentColor"/>
    <rect x="15" y="4" width="1" height="3" fill="currentColor"/>
    <path d="M8 12 L16 12 M8 15 L16 15" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
    <circle cx="10" cy="10" r="0.5" fill="currentColor" opacity="0.7"/>
    <circle cx="14" cy="13" r="0.5" fill="currentColor" opacity="0.5"/>
  </svg>
)

// Sensor icon - representing monitoring equipment
export const SensorIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <radialGradient id="sensorGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.2"/>
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="8" fill="url(#sensorGrad)" stroke="currentColor" strokeWidth="1"/>
    <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
    <path d="M12 4 L12 8 M12 16 L12 20 M4 12 L8 12 M16 12 L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.8">
      <animate attributeName="r" values="1;1.5;1" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
    </circle>
  </svg>
)