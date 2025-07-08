import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard, Html } from '@react-three/drei'
import * as THREE from 'three'
import { BioreactorModel } from '@/lib/bioreactor-catalog'

interface PerformanceOverlayProps {
  model: BioreactorModel
  parameters: {
    temperature: number
    ph: number
    flowRate: number
    mixingSpeed: number
    electrodeVoltage: number
    substrateConcentration: number
  }
  position: [number, number, number]
}

export function PerformanceOverlay({ model, parameters, position }: PerformanceOverlayProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Calculate real-time performance metrics
  const performanceMetrics = useMemo(() => {
    return calculatePerformanceMetrics(model, parameters)
  }, [model, parameters])

  // Animation for metric updates
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Main performance display */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Html
          transform
          occlude
          distanceFactor={10}
          position={[0, 0, 0]}
          style={{
            width: '300px',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg border border-blue-500 font-mono text-sm">
            <h3 className="text-lg font-bold mb-3 text-blue-400">{model.name}</h3>
            
            {/* Real-time metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricDisplay
                label="Power"
                value={performanceMetrics.currentPower}
                unit="mW/m²"
                optimal={model.performance.powerDensity.value}
                color="text-green-400"
              />
              
              <MetricDisplay
                label="Current"
                value={performanceMetrics.currentDensity}
                unit="mA/m²"
                optimal={model.performance.currentDensity.value}
                color="text-yellow-400"
              />
              
              <MetricDisplay
                label="Efficiency"
                value={performanceMetrics.efficiency}
                unit="%"
                optimal={model.performance.efficiency.codRemoval || 90}
                color="text-blue-400"
              />
              
              <MetricDisplay
                label="Health"
                value={performanceMetrics.systemHealth}
                unit="%"
                optimal={100}
                color="text-purple-400"
              />
            </div>

            {/* Operating conditions */}
            <div className="mt-3 pt-3 border-t border-gray-600">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">T:</span> {parameters.temperature.toFixed(1)}°C
                </div>
                <div>
                  <span className="text-gray-400">pH:</span> {parameters.ph.toFixed(1)}
                </div>
                <div>
                  <span className="text-gray-400">V:</span> {parameters.electrodeVoltage.toFixed(1)}V
                </div>
              </div>
            </div>

            {/* Performance indicators */}
            <div className="mt-3 flex justify-between items-center">
              <StatusIndicator
                status={performanceMetrics.operationalStatus}
                label="Status"
              />
              <EfficiencyBar value={performanceMetrics.efficiency} />
            </div>
          </div>
        </Html>
      </Billboard>

      {/* 3D Performance Visualization */}
      <PerformanceVisualization3D
        metrics={performanceMetrics}
        model={model}
        position={[0, -1, 0]}
      />

      {/* Warning indicators */}
      {performanceMetrics.warnings.length > 0 && (
        <WarningIndicators
          warnings={performanceMetrics.warnings}
          position={[0, 0.5, 0]}
        />
      )}
    </group>
  )
}

function MetricDisplay({ 
  label, 
  value, 
  unit, 
  optimal, 
  color 
}: {
  label: string
  value: number
  unit: string
  optimal: number
  color: string
}) {
  const percentage = (value / optimal) * 100
  const isGood = percentage >= 80

  return (
    <div className="flex flex-col">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`${color} font-bold`}>
        {value.toFixed(1)} <span className="text-xs text-gray-400">{unit}</span>
      </div>
      <div className="text-xs">
        <span className={isGood ? 'text-green-400' : 'text-red-400'}>
          {percentage.toFixed(0)}% of optimal
        </span>
      </div>
    </div>
  )
}

function StatusIndicator({ status, label }: { status: string; label: string }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'optimal': return 'text-green-400'
      case 'good': return 'text-yellow-400'
      case 'warning': return 'text-orange-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusDot = (status: string) => {
    switch (status.toLowerCase()) {
      case 'optimal': return '●'
      case 'good': return '●'
      case 'warning': return '⚠'
      case 'critical': return '●'
      default: return '○'
    }
  }

  return (
    <div className="flex items-center gap-1">
      <span className={`${getStatusColor(status)} text-lg`}>
        {getStatusDot(status)}
      </span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  )
}

function EfficiencyBar({ value }: { value: number }) {
  const percentage = Math.min(Math.max(value, 0), 100)
  const barColor = percentage >= 80 ? 'bg-green-400' : percentage >= 60 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Eff:</span>
      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-300">{percentage.toFixed(0)}%</span>
    </div>
  )
}

function PerformanceVisualization3D({ 
  metrics, 
  model, 
  position 
}: {
  metrics: any
  model: BioreactorModel
  position: [number, number, number]
}) {
  const visualizationRef = useRef<THREE.Group>(null)

  // Create 3D bar chart for performance metrics
  const performanceBars = useMemo(() => {
    const bars = []
    const metricKeys = ['currentPower', 'currentDensity', 'efficiency', 'systemHealth']
    const metricLabels = ['Power', 'Current', 'Efficiency', 'Health']
    const colors = [0x00ff00, 0xffff00, 0x00ffff, 0xff00ff]

    metricKeys.forEach((key, index) => {
      const value = metrics[key]
      const normalizedValue = Math.min(value / 100, 2) // Scale to reasonable height
      const barHeight = Math.max(normalizedValue, 0.1)

      bars.push(
        <group key={`bar-${index}`} position={[(index - 1.5) * 0.3, 0, 0]}>
          {/* Bar */}
          <mesh position={[0, barHeight / 2, 0]}>
            <boxGeometry args={[0.1, barHeight, 0.1]} />
            <meshStandardMaterial
              color={colors[index]}
              emissive={colors[index]}
              emissiveIntensity={0.2}
              transparent
              opacity={0.8}
            />
          </mesh>
          
          {/* Label */}
          <Text
            position={[0, -0.2, 0]}
            fontSize={0.08}
            color={colors[index]}
            anchorX="center"
            anchorY="middle"
          >
            {metricLabels[index]}
          </Text>
          
          {/* Value */}
          <Text
            position={[0, barHeight + 0.1, 0]}
            fontSize={0.06}
            color="white"
            anchorX="center"
            anchorY="bottom"
          >
            {value.toFixed(0)}
          </Text>
        </group>
      )
    })

    return bars
  }, [metrics])

  useFrame((state, delta) => {
    if (visualizationRef.current) {
      // Gentle rotation
      visualizationRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group ref={visualizationRef} position={position} scale={[0.5, 0.5, 0.5]}>
      {performanceBars}
      
      {/* Base platform */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 16]} />
        <meshStandardMaterial
          color={0x333333}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  )
}

function WarningIndicators({ 
  warnings, 
  position 
}: {
  warnings: string[]
  position: [number, number, number]
}) {
  const warningRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (warningRef.current) {
      // Pulsing animation for warnings
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1
      warningRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group ref={warningRef} position={position}>
      {warnings.map((warning, index) => (
        <Billboard key={`warning-${index}`} follow position={[0, index * 0.3, 0]}>
          <Html
            transform
            distanceFactor={8}
            style={{
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            <div className="bg-red-900 bg-opacity-90 text-red-200 px-3 py-1 rounded-lg border border-red-500 text-sm font-mono">
              <span className="text-red-400 mr-2">⚠</span>
              {warning}
            </div>
          </Html>
        </Billboard>
      ))}
    </group>
  )
}

// Performance calculation functions
function calculatePerformanceMetrics(model: BioreactorModel, parameters: any) {
  const metrics = {
    currentPower: 0,
    currentDensity: 0,
    efficiency: 0,
    systemHealth: 0,
    operationalStatus: 'unknown',
    warnings: [] as string[]
  }

  // Calculate current power based on parameters
  metrics.currentPower = calculateCurrentPower(model, parameters)
  
  // Calculate current density
  metrics.currentDensity = calculateCurrentDensity(model, parameters)
  
  // Calculate efficiency
  metrics.efficiency = calculateEfficiency(model, parameters)
  
  // Calculate system health
  metrics.systemHealth = calculateSystemHealth(model, parameters)
  
  // Determine operational status
  metrics.operationalStatus = determineOperationalStatus(metrics)
  
  // Check for warnings
  metrics.warnings = checkWarnings(model, parameters, metrics)

  return metrics
}

function calculateCurrentPower(model: BioreactorModel, parameters: any): number {
  const basePower = model.performance.powerDensity.value
  
  // Temperature factor (Arrhenius-like)
  const optimalTemp = model.operating.temperature.optimal
  const tempFactor = Math.exp(-Math.pow(parameters.temperature - optimalTemp, 2) / 200)
  
  // pH factor (bell curve)
  const optimalPH = model.operating.ph.optimal
  const phFactor = Math.exp(-Math.pow(parameters.ph - optimalPH, 2) / 2)
  
  // Voltage factor
  const voltageFactor = Math.min(parameters.electrodeVoltage / 100, 1)
  
  // Substrate factor (Monod kinetics)
  const substrateFactor = parameters.substrateConcentration / (0.5 + parameters.substrateConcentration)
  
  // Add some realistic noise
  const noise = 0.95 + Math.random() * 0.1
  
  return basePower * tempFactor * phFactor * voltageFactor * substrateFactor * noise
}

function calculateCurrentDensity(model: BioreactorModel, parameters: any): number {
  const baseCurrent = model.performance.currentDensity.value
  
  // Similar factors as power but with different weightings
  const tempFactor = Math.exp(-Math.pow(parameters.temperature - model.operating.temperature.optimal, 2) / 150)
  const phFactor = Math.exp(-Math.pow(parameters.ph - model.operating.ph.optimal, 2) / 1.5)
  const voltageFactor = parameters.electrodeVoltage / 100
  
  return baseCurrent * tempFactor * phFactor * voltageFactor * (0.9 + Math.random() * 0.2)
}

function calculateEfficiency(model: BioreactorModel, parameters: any): number {
  const baseEfficiency = model.performance.efficiency.codRemoval || 80
  
  // Flow rate optimization
  const optimalFlow = model.operating.flowRate?.value || 50
  const flowFactor = Math.exp(-Math.pow(parameters.flowRate - optimalFlow, 2) / 1000)
  
  // Temperature and pH factors
  const tempFactor = Math.exp(-Math.pow(parameters.temperature - model.operating.temperature.optimal, 2) / 100)
  const phFactor = Math.exp(-Math.pow(parameters.ph - model.operating.ph.optimal, 2) / 1)
  
  // Mixing factor
  const mixingFactor = Math.min(parameters.mixingSpeed / 100, 1)
  
  return baseEfficiency * tempFactor * phFactor * flowFactor * mixingFactor * (0.85 + Math.random() * 0.3)
}

function calculateSystemHealth(model: BioreactorModel, parameters: any): number {
  let health = 100
  
  // Temperature stress
  const tempRange = model.operating.temperature.range
  if (parameters.temperature < tempRange[0] || parameters.temperature > tempRange[1]) {
    health -= Math.abs(parameters.temperature - model.operating.temperature.optimal) * 2
  }
  
  // pH stress
  const phRange = model.operating.ph.range
  if (parameters.ph < phRange[0] || parameters.ph > phRange[1]) {
    health -= Math.abs(parameters.ph - model.operating.ph.optimal) * 10
  }
  
  // Voltage stress
  if (parameters.electrodeVoltage > 200) {
    health -= (parameters.electrodeVoltage - 200) * 0.5
  }
  
  // Flow stress
  if (parameters.flowRate > 200) {
    health -= (parameters.flowRate - 200) * 0.2
  }
  
  return Math.max(health, 0)
}

function determineOperationalStatus(metrics: any): string {
  const avgPerformance = (metrics.currentPower / 100 + metrics.efficiency / 100 + metrics.systemHealth / 100) / 3
  
  if (avgPerformance >= 0.9 && metrics.systemHealth >= 95) return 'optimal'
  if (avgPerformance >= 0.7 && metrics.systemHealth >= 80) return 'good'
  if (avgPerformance >= 0.5 && metrics.systemHealth >= 60) return 'warning'
  return 'critical'
}

function checkWarnings(model: BioreactorModel, parameters: any, metrics: any): string[] {
  const warnings = []
  
  // Temperature warnings
  const tempRange = model.operating.temperature.range
  if (parameters.temperature < tempRange[0]) {
    warnings.push('Temperature too low')
  } else if (parameters.temperature > tempRange[1]) {
    warnings.push('Temperature too high')
  }
  
  // pH warnings
  const phRange = model.operating.ph.range
  if (parameters.ph < phRange[0]) {
    warnings.push('pH too acidic')
  } else if (parameters.ph > phRange[1]) {
    warnings.push('pH too basic')
  }
  
  // Performance warnings
  if (metrics.currentPower < model.performance.powerDensity.value * 0.5) {
    warnings.push('Low power output')
  }
  
  if (metrics.efficiency < 50) {
    warnings.push('Low efficiency')
  }
  
  // System health warnings
  if (metrics.systemHealth < 60) {
    warnings.push('System health critical')
  }
  
  // Electrode voltage warnings
  if (parameters.electrodeVoltage > 150) {
    warnings.push('High voltage stress')
  } else if (parameters.electrodeVoltage < 10) {
    warnings.push('Insufficient voltage')
  }
  
  return warnings
}