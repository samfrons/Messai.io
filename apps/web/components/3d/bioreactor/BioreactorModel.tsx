'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Group } from 'three'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { animated, useSpring } from '@react-spring/three'
import Chamber from './Chamber'
import Electrodes from './Electrodes'
import Membrane from './Membrane'
import FlowSystem from './FlowSystem'
import { useMaterials } from '../core/Materials'

interface BioreactorModelProps {
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES'
  scale: 'laboratory' | 'pilot' | 'industrial'
  anodeMaterial: string
  cathodeMaterial: string
  onPerformanceUpdate?: (data: { powerOutput: number; efficiency: number; cost: number }) => void
}

export default function BioreactorModel({
  systemType,
  scale,
  anodeMaterial,
  cathodeMaterial,
  onPerformanceUpdate,
}: BioreactorModelProps) {
  const groupRef = useRef<Group>(null)
  const materials = useMaterials()
  
  // Scale factors
  const scaleFactor = useMemo(() => {
    switch (scale) {
      case 'laboratory': return 1
      case 'pilot': return 3
      case 'industrial': return 10
      default: return 1
    }
  }, [scale])
  
  // Chamber configuration based on system type
  const chamberConfig = useMemo(() => {
    switch (systemType) {
      case 'MFC':
        return { chambers: 2, hasMembranes: true, height: 1 }
      case 'MEC':
        return { chambers: 2, hasMembranes: true, height: 1.2 }
      case 'MDC':
        return { chambers: 3, hasMembranes: true, height: 1.1 }
      case 'MES':
        return { chambers: 2, hasMembranes: true, height: 1.3 }
      default:
        return { chambers: 2, hasMembranes: true, height: 1 }
    }
  }, [systemType])
  
  // Animation controls
  const { showFlow, rotateModel, showBiofilm } = useControls('Visualization', {
    showFlow: { value: true, label: 'Show Flow' },
    rotateModel: { value: false, label: 'Auto Rotate' },
    showBiofilm: { value: true, label: 'Show Biofilm' },
  })
  
  // Spring animation for smooth transitions
  const springProps = useSpring({
    scale: scaleFactor,
    config: { mass: 1, tension: 280, friction: 60 }
  })
  
  // Auto rotation
  useFrame((state, delta) => {
    if (groupRef.current && rotateModel) {
      groupRef.current.rotation.y += delta * 0.2
    }
  })
  
  // Calculate and update performance metrics
  useEffect(() => {
    if (onPerformanceUpdate) {
      // Simplified performance calculation
      const baseOutput = systemType === 'MFC' ? 25 : systemType === 'MEC' ? 0 : 15
      const anodeFactor = anodeMaterial === 'mxeneTi3C2Tx' ? 1.8 : anodeMaterial === 'carbonNanotube' ? 1.5 : 1
      const cathodeFactor = cathodeMaterial === 'platinum' ? 1.5 : 1
      const scalePowerFactor = scale === 'laboratory' ? 1 : scale === 'pilot' ? 1.5 : 2
      
      const powerOutput = Math.round(baseOutput * scalePowerFactor * anodeFactor * cathodeFactor * 10) / 10
      const efficiency = Math.round(65 + Math.random() * 20)
      const baseCost = scale === 'laboratory' ? 500 : scale === 'pilot' ? 5000 : 50000
      const materialCost = (anodeMaterial === 'mxeneTi3C2Tx' ? 3 : 1) * (cathodeMaterial === 'platinum' ? 2 : 1)
      const cost = Math.round(baseCost * materialCost)
      
      onPerformanceUpdate({ powerOutput, efficiency, cost })
    }
  }, [systemType, scale, anodeMaterial, cathodeMaterial, onPerformanceUpdate])
  
  // Map material names to our material types
  const getAnodeMaterialType = () => {
    switch (anodeMaterial) {
      case 'carbonCloth': return 'carbonCloth'
      case 'graphiteFelt': return 'carbonFelt'
      case 'carbonNanotube': return 'carbonCloth'
      case 'mxeneTi3C2Tx': return 'mxene'
      default: return 'carbonCloth'
    }
  }
  
  const getCathodeMaterialType = () => {
    switch (cathodeMaterial) {
      case 'copper': return 'copper'
      case 'platinum': return 'platinum'
      case 'stainlessSteel': return 'stainlessSteel'
      case 'carbonCloth': return 'carbonCloth'
      default: return 'stainlessSteel'
    }
  }
  
  return (
    <animated.group ref={groupRef} scale={springProps.scale}>
      {/* Main chamber structure */}
      <Chamber
        width={2}
        height={chamberConfig.height}
        depth={1}
        chambers={chamberConfig.chambers}
        material={materials.plastic}
      />
      
      {/* Electrodes */}
      <Electrodes
        anodeMaterial={materials[getAnodeMaterialType()]}
        cathodeMaterial={materials[getCathodeMaterialType()]}
        chamberWidth={2}
        chamberHeight={chamberConfig.height}
        chamberDepth={1}
        showBiofilm={showBiofilm}
        biofilmMaterial={materials.biofilm}
      />
      
      {/* Membranes (for multi-chamber systems) */}
      {chamberConfig.hasMembranes && chamberConfig.chambers > 1 && (
        <Membrane
          width={2}
          height={chamberConfig.height}
          position={[0, 0, 0]}
          material={materials.membrane}
        />
      )}
      
      {/* Flow visualization */}
      {showFlow && (
        <FlowSystem
          systemType={systemType}
          chamberDimensions={{
            width: 2,
            height: chamberConfig.height,
            depth: 1
          }}
        />
      )}
    </animated.group>
  )
}