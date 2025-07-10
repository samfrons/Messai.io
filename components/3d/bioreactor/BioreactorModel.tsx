'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createElectrodeGeometry, createChamberGeometry } from './ElectrodeGeometries'
import { getMaterialLibrary } from './MaterialLibrary'
import { FlowSimulation } from './FlowSimulation'

interface BioreactorModelProps {
  systemType: 'MFC' | 'MEC' | 'MDC' | 'MES'
  scale: 'laboratory' | 'pilot' | 'industrial'
  anodeMaterial: string
  cathodeMaterial: string
  onPerformanceUpdate?: (data: any) => void
  className?: string
}

export default function BioreactorModel({
  systemType,
  scale,
  anodeMaterial,
  cathodeMaterial,
  onPerformanceUpdate,
  className = ''
}: BioreactorModelProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const flowSimulationRef = useRef<FlowSimulation | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  // Model groups
  const modelGroupsRef = useRef({
    chamber: null as THREE.Group | null,
    anode: null as THREE.Group | null,
    cathode: null as THREE.Group | null,
    membrane: null as THREE.Mesh | null,
    inletOutlet: null as THREE.Group | null
  })

  const createBioreactor = useCallback((scene: THREE.Scene) => {
    const materials = getMaterialLibrary()
    
    // Clear existing models
    Object.values(modelGroupsRef.current).forEach(group => {
      if (group) scene.remove(group)
    })

    // Chamber dimensions based on scale
    const dimensions = {
      laboratory: { width: 2, height: 1.5, depth: 1.5, thickness: 0.05 },
      pilot: { width: 4, height: 3, depth: 3, thickness: 0.1 },
      industrial: { width: 8, height: 6, depth: 6, thickness: 0.2 }
    }[scale]

    // Create chamber
    const chamberGroup = new THREE.Group()
    const chamberGeometry = createChamberGeometry(dimensions)
    const chamberMaterial = materials.glass
    const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial)
    chamber.castShadow = true
    chamber.receiveShadow = true
    chamberGroup.add(chamber)
    
    // Add chamber frame
    const frameGeometry = new THREE.BoxGeometry(
      dimensions.width + 0.1,
      dimensions.height + 0.1,
      dimensions.depth + 0.1
    )
    const frameMaterial = materials.metalFrame
    const frame = new THREE.Mesh(frameGeometry, frameMaterial)
    frame.castShadow = true
    chamberGroup.add(frame)
    
    modelGroupsRef.current.chamber = chamberGroup
    scene.add(chamberGroup)

    // Create electrodes
    const electrodeSpacing = dimensions.width * 0.3
    
    // Anode
    const anodeGroup = new THREE.Group()
    const anodeGeometry = createElectrodeGeometry(
      dimensions.height * 0.8,
      dimensions.depth * 0.8,
      0.02,
      anodeMaterial
    )
    const anodeMat = materials[anodeMaterial] || materials.carbonCloth
    const anode = new THREE.Mesh(anodeGeometry, anodeMat)
    anode.position.x = -electrodeSpacing
    anode.castShadow = true
    anode.receiveShadow = true
    anode.userData = { type: 'anode', material: anodeMaterial }
    anodeGroup.add(anode)
    
    // Add anode connector
    const connectorGeometry = new THREE.CylinderGeometry(0.02, 0.02, dimensions.height * 0.3)
    const connectorMaterial = materials.copper
    const anodeConnector = new THREE.Mesh(connectorGeometry, connectorMaterial)
    anodeConnector.position.set(-electrodeSpacing, dimensions.height * 0.6, 0)
    anodeGroup.add(anodeConnector)
    
    modelGroupsRef.current.anode = anodeGroup
    scene.add(anodeGroup)

    // Cathode
    const cathodeGroup = new THREE.Group()
    const cathodeGeometry = createElectrodeGeometry(
      dimensions.height * 0.8,
      dimensions.depth * 0.8,
      0.02,
      cathodeMaterial
    )
    const cathodeMat = materials[cathodeMaterial] || materials.stainlessSteel
    const cathode = new THREE.Mesh(cathodeGeometry, cathodeMat)
    cathode.position.x = electrodeSpacing
    cathode.castShadow = true
    cathode.receiveShadow = true
    cathode.userData = { type: 'cathode', material: cathodeMaterial }
    cathodeGroup.add(cathode)
    
    // Add cathode connector
    const cathodeConnector = new THREE.Mesh(connectorGeometry, connectorMaterial)
    cathodeConnector.position.set(electrodeSpacing, dimensions.height * 0.6, 0)
    cathodeGroup.add(cathodeConnector)
    
    modelGroupsRef.current.cathode = cathodeGroup
    scene.add(cathodeGroup)

    // Add membrane for certain system types
    if (systemType === 'MEC' || systemType === 'MDC') {
      const membraneGeometry = new THREE.PlaneGeometry(
        dimensions.height * 0.9,
        dimensions.depth * 0.9
      )
      const membraneMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x4fc3f7,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        transmission: 0.9,
        thickness: 0.1,
        roughness: 0.1
      })
      const membrane = new THREE.Mesh(membraneGeometry, membraneMaterial)
      membrane.rotation.y = Math.PI / 2
      modelGroupsRef.current.membrane = membrane
      scene.add(membrane)
    }

    // Add inlet/outlet ports
    const portGroup = new THREE.Group()
    const portGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3)
    const portMaterial = materials.pvcPipe
    
    // Inlet
    const inlet = new THREE.Mesh(portGeometry, portMaterial)
    inlet.position.set(-dimensions.width / 2 - 0.15, -dimensions.height / 3, 0)
    inlet.rotation.z = Math.PI / 2
    portGroup.add(inlet)
    
    // Outlet
    const outlet = new THREE.Mesh(portGeometry, portMaterial)
    outlet.position.set(dimensions.width / 2 + 0.15, dimensions.height / 3, 0)
    outlet.rotation.z = Math.PI / 2
    portGroup.add(outlet)
    
    modelGroupsRef.current.inletOutlet = portGroup
    scene.add(portGroup)

    setIsLoading(false)
  }, [systemType, scale, anodeMaterial, cathodeMaterial])

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 50)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    )
    camera.position.set(8, 6, 8)
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
    renderer.toneMappingExposure = 1.2
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxDistance = 20
    controls.minDistance = 3
    controls.enablePan = true
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
    mainLight.position.set(10, 10, 10)
    mainLight.castShadow = true
    mainLight.shadow.camera.left = -10
    mainLight.shadow.camera.right = 10
    mainLight.shadow.camera.top = 10
    mainLight.shadow.camera.bottom = -10
    mainLight.shadow.mapSize.width = 2048
    mainLight.shadow.mapSize.height = 2048
    scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(0x4fc3f7, 0.3)
    fillLight.position.set(-10, -5, -10)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2)
    rimLight.position.set(0, 0, -10)
    scene.add(rimLight)

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
    gridHelper.position.y = -3
    scene.add(gridHelper)

    // Create bioreactor model
    createBioreactor(scene)

    // Initialize flow simulation
    flowSimulationRef.current = new FlowSimulation(scene, systemType)

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      const delta = clock.getDelta()
      
      controls.update()
      
      // Update flow simulation
      if (flowSimulationRef.current) {
        flowSimulationRef.current.update(delta)
      }
      
      // Rotate electrodes slightly for visual interest
      if (modelGroupsRef.current.anode) {
        modelGroupsRef.current.anode.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.02
      }
      if (modelGroupsRef.current.cathode) {
        modelGroupsRef.current.cathode.rotation.y = -Math.sin(clock.getElapsedTime() * 0.1) * 0.02
      }
      
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Raycaster for interactions
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const handleClick = (event: MouseEvent) => {
      if (!mountRef.current) return
      
      const rect = mountRef.current.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(scene.children, true)
      
      if (intersects.length > 0) {
        const object = intersects[0].object
        if (object.userData.type) {
          setSelectedComponent(object.userData.type)
          console.log('Selected:', object.userData)
        }
      }
    }
    renderer.domElement.addEventListener('click', handleClick)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('click', handleClick)
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      renderer.dispose()
      controls.dispose()
    }
  }, []) // Initial setup only

  // Update model when props change
  useEffect(() => {
    if (sceneRef.current) {
      createBioreactor(sceneRef.current)
    }
  }, [systemType, scale, anodeMaterial, cathodeMaterial, createBioreactor])

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">Loading 3D Model...</div>
        </div>
      )}
      
      {selectedComponent && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
          <h3 className="font-semibold">Selected: {selectedComponent}</h3>
          <button 
            onClick={() => setSelectedComponent(null)}
            className="mt-2 text-sm underline"
          >
            Clear Selection
          </button>
        </div>
      )}
      
      <div className="absolute bottom-4 right-4 text-xs text-gray-400">
        <div>System: {systemType}</div>
        <div>Scale: {scale}</div>
        <div>Click components for details</div>
      </div>
    </div>
  )
}