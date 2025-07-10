'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import ErrorBoundary from '@/components/ErrorBoundary'
import type { ModelStage, ModelParameters } from '@/lib/multi-scale-catalog'
import { multiScaleModels, advancedMaterials, calculatePerformance, bacterialSpecies } from '@/lib/multi-scale-catalog'

interface MultiScaleModel3DProps {
  stage: ModelStage
  parameters: ModelParameters
  isAnimating: boolean
  onPerformanceUpdate?: (data: { powerDensity: number; efficiency: number; voltage: number }) => void
  className?: string
}

export default function MultiScaleModel3D({
  stage,
  parameters,
  isAnimating,
  onPerformanceUpdate,
  className = ''
}: MultiScaleModel3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())
  
  // Performance monitoring
  const [fps, setFps] = useState(60)
  const [renderTime, setRenderTime] = useState(0)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  
  // Model groups
  const modelGroupsRef = useRef<Record<string, THREE.Group | THREE.Mesh | null>>({
    chamber: null,
    anode: null,
    cathode: null,
    membrane: null,
    substrate: null,
    biofilm: null,
    electronFlow: null,
    gasProduction: null
  })
  
  // Animation systems
  const particleSystemsRef = useRef<THREE.Points[]>([])
  const biofilmMeshesRef = useRef<THREE.Mesh[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create materials library
  const createMaterialsLibrary = useCallback(() => {
    return {
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.1,
        transmission: 0.95,
        thickness: 0.5,
        transparent: true,
        opacity: 0.3
      }),
      chamber: new THREE.MeshPhysicalMaterial({
        color: 0x333333,
        metalness: 0.2,
        roughness: 0.8,
        transparent: true,
        opacity: 0.2
      }),
      anode: new THREE.MeshPhysicalMaterial({
        color: 0x2C3E50,
        metalness: 0.3,
        roughness: 0.7,
        emissive: 0x001122,
        emissiveIntensity: 0.1
      }),
      cathode: new THREE.MeshPhysicalMaterial({
        color: 0x34495E,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x002211,
        emissiveIntensity: 0.1
      }),
      membrane: new THREE.MeshPhysicalMaterial({
        color: 0x4fc3f7,
        transparent: true,
        opacity: 0.4,
        transmission: 0.8,
        thickness: 0.1
      }),
      substrate: new THREE.MeshPhysicalMaterial({
        color: 0x8B4513,
        metalness: 0,
        roughness: 0.9,
        transparent: true,
        opacity: 0.6
      }),
      biofilm: new THREE.MeshPhysicalMaterial({
        color: 0x27AE60,
        metalness: 0,
        roughness: 0.8,
        transparent: true,
        opacity: 0.7,
        emissive: 0x002200,
        emissiveIntensity: 0.2
      })
    }
  }, [])

  // Create stage-specific 3D models
  const createStageModel = useCallback((scene: THREE.Scene, stage: ModelStage) => {
    const materials = createMaterialsLibrary()
    const model = multiScaleModels[stage]
    const group = new THREE.Group()
    
    // Clear existing models
    Object.values(modelGroupsRef.current).forEach(obj => {
      if (obj && obj.parent) {
        obj.parent.remove(obj)
      }
    })
    
    // Reset arrays
    particleSystemsRef.current = []
    biofilmMeshesRef.current = []
    
    switch (stage) {
      case 'micro-scale':
        createMicroScaleModel(group, materials, model.dimensions)
        break
      case 'voltaic-pile':
        createVoltaicPileModel(group, materials, model.dimensions)
        break
      case 'bench-scale':
        createBenchScaleModel(group, materials, model.dimensions)
        break
      case 'industrial':
        createIndustrialModel(group, materials, model.dimensions)
        break
    }
    
    scene.add(group)
    return group
  }, [])

  const createMicroScaleModel = (group: THREE.Group, materials: any, dimensions: any) => {
    const scale = 0.1 // Scale factor for visualization
    
    // Glass slide substrate
    const slideGeometry = new THREE.BoxGeometry(
      dimensions.width * scale,
      dimensions.depth * scale,
      dimensions.height * scale
    )
    const slide = new THREE.Mesh(slideGeometry, materials.glass)
    slide.position.set(0, -1, 0)
    group.add(slide)
    modelGroupsRef.current.chamber = slide
    
    // Microfluidic channels
    const channelGeometry = new THREE.CylinderGeometry(0.05, 0.05, dimensions.width * scale * 0.8)
    const channel = new THREE.Mesh(channelGeometry, materials.substrate)
    channel.rotation.z = Math.PI / 2
    channel.position.set(0, -0.8, 0)
    group.add(channel)
    
    // Microelectrodes
    const electrodeGeometry = new THREE.BoxGeometry(0.5, 0.02, 0.1)
    
    // Anode
    const anode = new THREE.Mesh(electrodeGeometry, materials.anode)
    anode.position.set(-1, -0.9, 0)
    group.add(anode)
    modelGroupsRef.current.anode = anode
    
    // Cathode
    const cathode = new THREE.Mesh(electrodeGeometry, materials.cathode)
    cathode.position.set(1, -0.9, 0)
    group.add(cathode)
    modelGroupsRef.current.cathode = cathode
    
    // Biofilm on anode
    const biofilmGeometry = new THREE.BoxGeometry(0.52, 0.05, 0.12)
    const biofilm = new THREE.Mesh(biofilmGeometry, materials.biofilm)
    biofilm.position.set(-1, -0.85, 0)
    group.add(biofilm)
    modelGroupsRef.current.biofilm = biofilm
    biofilmMeshesRef.current.push(biofilm)
    
    // Electron flow particles
    createElectronFlowSystem(group, stage)
  }

  const createVoltaicPileModel = (group: THREE.Group, materials: any, dimensions: any) => {
    const scale = 0.01
    const cellCount = 8
    
    for (let i = 0; i < cellCount; i++) {
      const cellGroup = new THREE.Group()
      
      // Cell chamber
      const chamberGeometry = new THREE.CylinderGeometry(
        dimensions.width * scale * 0.3,
        dimensions.width * scale * 0.3,
        dimensions.height * scale * 0.8
      )
      const chamber = new THREE.Mesh(chamberGeometry, materials.chamber)
      chamber.position.set(0, i * 0.4, 0)
      cellGroup.add(chamber)
      
      // Electrodes
      const electrodeGeometry = new THREE.CylinderGeometry(
        dimensions.width * scale * 0.25,
        dimensions.width * scale * 0.25,
        0.05
      )
      
      const anode = new THREE.Mesh(electrodeGeometry, materials.anode)
      anode.position.set(0, i * 0.4 - 0.15, 0)
      cellGroup.add(anode)
      
      const cathode = new THREE.Mesh(electrodeGeometry, materials.cathode)
      cathode.position.set(0, i * 0.4 + 0.15, 0)
      cellGroup.add(cathode)
      
      // Biofilm
      const biofilm = new THREE.Mesh(electrodeGeometry, materials.biofilm)
      biofilm.position.set(0, i * 0.4 - 0.12, 0)
      biofilm.scale.set(1.1, 0.5, 1.1)
      cellGroup.add(biofilm)
      biofilmMeshesRef.current.push(biofilm)
      
      // Connections
      if (i > 0) {
        const connectionGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4)
        const connection = new THREE.Mesh(connectionGeometry, materials.cathode)
        connection.position.set(0.3, i * 0.4 - 0.2, 0)
        cellGroup.add(connection)
      }
      
      group.add(cellGroup)
    }
    
    modelGroupsRef.current.chamber = group
    createElectronFlowSystem(group, stage)
  }

  const createBenchScaleModel = (group: THREE.Group, materials: any, dimensions: any) => {
    const scale = 0.005
    
    // Main chamber
    const chamberGeometry = new THREE.BoxGeometry(
      dimensions.width * scale,
      dimensions.height * scale,
      dimensions.depth * scale
    )
    const chamber = new THREE.Mesh(chamberGeometry, materials.chamber)
    group.add(chamber)
    modelGroupsRef.current.chamber = chamber
    
    // Electrodes
    const electrodeGeometry = new THREE.BoxGeometry(
      dimensions.width * scale * 0.8,
      dimensions.height * scale * 0.8,
      0.1
    )
    
    const anode = new THREE.Mesh(electrodeGeometry, materials.anode)
    anode.position.set(0, 0, -dimensions.depth * scale * 0.3)
    group.add(anode)
    modelGroupsRef.current.anode = anode
    
    const cathode = new THREE.Mesh(electrodeGeometry, materials.cathode)
    cathode.position.set(0, 0, dimensions.depth * scale * 0.3)
    group.add(cathode)
    modelGroupsRef.current.cathode = cathode
    
    // Membrane
    const membraneGeometry = new THREE.PlaneGeometry(
      dimensions.width * scale * 0.9,
      dimensions.height * scale * 0.9
    )
    const membrane = new THREE.Mesh(membraneGeometry, materials.membrane)
    membrane.position.set(0, 0, 0)
    group.add(membrane)
    modelGroupsRef.current.membrane = membrane
    
    // Biofilm
    const biofilmGeometry = new THREE.BoxGeometry(
      dimensions.width * scale * 0.82,
      dimensions.height * scale * 0.82,
      0.2
    )
    const biofilm = new THREE.Mesh(biofilmGeometry, materials.biofilm)
    biofilm.position.set(0, 0, -dimensions.depth * scale * 0.25)
    group.add(biofilm)
    modelGroupsRef.current.biofilm = biofilm
    biofilmMeshesRef.current.push(biofilm)
    
    // Inlet/outlet ports
    const portGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3)
    const inlet = new THREE.Mesh(portGeometry, materials.cathode)
    inlet.position.set(-dimensions.width * scale * 0.6, 0, 0)
    inlet.rotation.z = Math.PI / 2
    group.add(inlet)
    
    const outlet = new THREE.Mesh(portGeometry, materials.cathode)
    outlet.position.set(dimensions.width * scale * 0.6, 0, 0)
    outlet.rotation.z = Math.PI / 2
    group.add(outlet)
    
    createElectronFlowSystem(group, stage)
  }

  const createIndustrialModel = (group: THREE.Group, materials: any, dimensions: any) => {
    const scale = 0.001
    const moduleCount = 12
    
    // Main structure
    const frameGeometry = new THREE.BoxGeometry(
      dimensions.width * scale,
      dimensions.height * scale,
      dimensions.depth * scale
    )
    const frame = new THREE.Mesh(frameGeometry, materials.chamber)
    frame.material.wireframe = true
    group.add(frame)
    
    // MFC modules array
    for (let i = 0; i < moduleCount; i++) {
      const moduleGroup = new THREE.Group()
      
      const x = (i % 4 - 1.5) * 0.8
      const y = (Math.floor(i / 4) - 1) * 0.8
      const z = 0
      
      // Module chamber
      const moduleGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.4)
      const moduleUnit = new THREE.Mesh(moduleGeometry, materials.chamber)
      moduleUnit.position.set(x, y, z)
      moduleGroup.add(moduleUnit)
      
      // Module electrodes
      const electrodeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05)
      const anode = new THREE.Mesh(electrodeGeometry, materials.anode)
      anode.position.set(x, y, z - 0.15)
      moduleGroup.add(anode)
      
      const cathode = new THREE.Mesh(electrodeGeometry, materials.cathode)
      cathode.position.set(x, y, z + 0.15)
      moduleGroup.add(cathode)
      
      // Biofilm
      const biofilm = new THREE.Mesh(electrodeGeometry, materials.biofilm)
      biofilm.position.set(x, y, z - 0.12)
      biofilm.scale.set(1.1, 1.1, 0.5)
      moduleGroup.add(biofilm)
      biofilmMeshesRef.current.push(biofilm)
      
      group.add(moduleGroup)
    }
    
    modelGroupsRef.current.chamber = group
    createElectronFlowSystem(group, stage)
  }

  const createElectronFlowSystem = (group: THREE.Group, stage: ModelStage) => {
    const particleCount = stage === 'micro-scale' ? 100 : 
                        stage === 'voltaic-pile' ? 200 : 
                        stage === 'bench-scale' ? 500 : 1000
    
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Random positions
      positions[i3] = (Math.random() - 0.5) * 4
      positions[i3 + 1] = (Math.random() - 0.5) * 4
      positions[i3 + 2] = (Math.random() - 0.5) * 4
      
      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02
      
      // Electron colors (blue-white)
      colors[i3] = 0.3 + Math.random() * 0.7
      colors[i3 + 1] = 0.5 + Math.random() * 0.5
      colors[i3 + 2] = 1.0
    }
    
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8
    })
    
    const particles = new THREE.Points(geometry, material)
    group.add(particles)
    particleSystemsRef.current.push(particles)
    modelGroupsRef.current.electronFlow = particles
  }

  // Update animations
  const updateAnimations = useCallback((deltaTime: number) => {
    if (!isAnimating) return
    
    const currentTime = clockRef.current.getElapsedTime()
    
    // Update biofilm growth
    biofilmMeshesRef.current.forEach(biofilm => {
      const growthFactor = 1 + (parameters.biofilmThickness / 1000) * 0.2
      const pulse = 1 + Math.sin(currentTime * 2) * 0.1
      biofilm.scale.setScalar(growthFactor * pulse)
      
      // Update biofilm color based on health
      const material = biofilm.material as THREE.MeshPhysicalMaterial
      const healthFactor = Math.min(parameters.pH / 7, 1) * Math.min(parameters.temperature / 30, 1)
      material.color.setRGB(
        0.1 + healthFactor * 0.2,
        0.4 + healthFactor * 0.4,
        0.1 + healthFactor * 0.1
      )
    })
    
    // Update electron flow
    particleSystemsRef.current.forEach(particles => {
      const positions = particles.geometry.attributes.position.array as Float32Array
      const velocities = particles.geometry.attributes.velocity.array as Float32Array
      const colors = particles.geometry.attributes.color.array as Float32Array
      
      for (let i = 0; i < positions.length; i += 3) {
        // Update positions
        positions[i] += velocities[i] * parameters.currentDensity * 0.1
        positions[i + 1] += velocities[i + 1] * parameters.currentDensity * 0.1
        positions[i + 2] += velocities[i + 2] * parameters.currentDensity * 0.1
        
        // Reset particles that move too far
        if (Math.abs(positions[i]) > 5) {
          positions[i] = (Math.random() - 0.5) * 4
          positions[i + 1] = (Math.random() - 0.5) * 4
          positions[i + 2] = (Math.random() - 0.5) * 4
        }
        
        // Update colors based on current density
        const intensity = Math.min(parameters.currentDensity / 10, 1)
        colors[i] = 0.3 + intensity * 0.7
        colors[i + 1] = 0.5 + intensity * 0.5
        colors[i + 2] = 1.0
      }
      
      particles.geometry.attributes.position.needsUpdate = true
      particles.geometry.attributes.color.needsUpdate = true
    })
    
    // Update model rotations for visual interest
    if (modelGroupsRef.current.chamber) {
      modelGroupsRef.current.chamber.rotation.y += 0.001
    }
  }, [isAnimating, parameters])

  // Performance monitoring
  const updatePerformanceMetrics = useCallback(() => {
    const performance = calculatePerformance(
      stage,
      parameters,
      advancedMaterials.slice(0, 2), // Use first 2 materials
      bacterialSpecies[0] // Use first bacterial species
    )
    
    onPerformanceUpdate?.(performance)
  }, [stage, parameters, onPerformanceUpdate])

  // Initialize 3D scene
  useEffect(() => {
    if (!mountRef.current) return
    
    try {
      // Scene setup
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x0a0a0a)
      scene.fog = new THREE.Fog(0x0a0a0a, 5, 25)
      sceneRef.current = scene
      
      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        50,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        100
      )
      camera.position.set(5, 3, 5)
      camera.lookAt(0, 0, 0)
      cameraRef.current = camera
      
      // Renderer setup
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      })
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.5
      renderer.outputColorSpace = THREE.SRGBColorSpace
      mountRef.current.appendChild(renderer.domElement)
      rendererRef.current = renderer
      
      // Controls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.maxDistance = 15
      controls.minDistance = 1
      controls.enablePan = true
      controls.autoRotate = false
      controls.autoRotateSpeed = 0.5
      controlsRef.current = controls
      
      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
      scene.add(ambientLight)
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
      directionalLight.position.set(10, 10, 10)
      directionalLight.castShadow = true
      directionalLight.shadow.camera.left = -10
      directionalLight.shadow.camera.right = 10
      directionalLight.shadow.camera.top = 10
      directionalLight.shadow.camera.bottom = -10
      directionalLight.shadow.mapSize.width = 2048
      directionalLight.shadow.mapSize.height = 2048
      scene.add(directionalLight)
      
      const fillLight = new THREE.DirectionalLight(0x4fc3f7, 0.4)
      fillLight.position.set(-5, 0, -5)
      scene.add(fillLight)
      
      const rimLight = new THREE.DirectionalLight(0x9B59B6, 0.3)
      rimLight.position.set(0, 5, -10)
      scene.add(rimLight)
      
      // Create initial model
      createStageModel(scene, stage)
      
      // Animation loop
      const animate = () => {
        const startTime = performance.now()
        
        animationIdRef.current = requestAnimationFrame(animate)
        
        const deltaTime = clockRef.current.getDelta()
        
        // Update controls
        controls.update()
        
        // Update animations
        updateAnimations(deltaTime)
        
        // Render
        renderer.render(scene, camera)
        
        // Performance monitoring
        frameCountRef.current++
        const now = performance.now()
        const renderTime = now - startTime
        setRenderTime(renderTime)
        
        if (now - lastTimeRef.current >= 1000) {
          setFps(frameCountRef.current)
          frameCountRef.current = 0
          lastTimeRef.current = now
        }
      }
      
      animate()
      setIsLoading(false)
      
      // Handle resize
      const handleResize = () => {
        if (!mountRef.current || !camera || !renderer) return
        
        const width = mountRef.current.clientWidth
        const height = mountRef.current.clientHeight
        
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }
      
      window.addEventListener('resize', handleResize)
      
      return () => {
        window.removeEventListener('resize', handleResize)
        
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current)
        }
        
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement)
        }
        
        // Cleanup
        renderer.dispose()
        controls.dispose()
        
        // Cleanup geometries and materials
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose()
            if (object.material instanceof THREE.Material) {
              object.material.dispose()
            }
          }
        })
      }
    } catch (err) {
      console.error('Error initializing 3D scene:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize 3D scene')
      setIsLoading(false)
    }
  }, [stage, createStageModel, updateAnimations])

  // Update performance when parameters change
  useEffect(() => {
    updatePerformanceMetrics()
  }, [updatePerformanceMetrics])

  // Update model when stage changes
  useEffect(() => {
    if (sceneRef.current) {
      createStageModel(sceneRef.current, stage)
    }
  }, [stage, createStageModel])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-900/20 border border-red-500/30 rounded-lg">
        <div className="text-center p-4">
          <div className="text-red-400 mb-2">3D Rendering Error</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className={`relative w-full h-full ${className}`}>
        <div ref={mountRef} className="w-full h-full" />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
              <div>Loading {stage} model...</div>
            </div>
          </div>
        )}
        
        {/* Performance overlay */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs p-2 rounded">
          <div>FPS: {fps}</div>
          <div>Render: {renderTime.toFixed(1)}ms</div>
        </div>
        
        {/* Info overlay */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs p-2 rounded">
          <div>Stage: {stage}</div>
          <div>Animation: {isAnimating ? 'ON' : 'OFF'}</div>
          <div>Particles: {particleSystemsRef.current.length}</div>
        </div>
      </div>
    </ErrorBoundary>
  )
}