'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { Chart, registerables } from 'chart.js'
import styles from './AlgalFuelCell.module.css'
import { 
  algaeDatabase, 
  electrodesDatabase, 
  mediatorsDatabase, 
  separatorsDatabase, 
  presets, 
  defaultParameters 
} from './AlgalFuelCellDatabase'
import ParameterControls from './ParameterControls'

// Register Chart.js components
Chart.register(...registerables)

interface AlgalFuelCell3DProps {
  className?: string
}

export default function AlgalFuelCell3D({ className = '' }: AlgalFuelCell3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const composerRef = useRef<EffectComposer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const clockRef = useRef(new THREE.Clock())
  const chartRef = useRef<Chart | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // State management
  const [parameters, setParameters] = useState(defaultParameters)
  const [activeTab, setActiveTab] = useState('biological')
  const [advancedMode, setAdvancedMode] = useState(false)
  const [visualizationMode, setVisualizationMode] = useState('normal')
  const [isRotating, setIsRotating] = useState(true)
  const [showElectrons, setShowElectrons] = useState(true)
  const [isDayTime, setIsDayTime] = useState(true)

  // 3D Objects refs
  const objectsRef = useRef({
    hydrogelChamber: null as THREE.Mesh | null,
    anodeGroup: null as THREE.Group | null,
    cathodeGroup: null as THREE.Group | null,
    algaeGroups: {} as { [key: string]: THREE.Group },
    electrons: [] as THREE.Mesh[],
    electronPaths: [] as THREE.CatmullRomCurve3[],
    particleSystems: {} as { [key: string]: THREE.Points }
  })

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x001122) // Dark blue background for better visibility
    scene.fog = new THREE.FogExp2(0x000511, 0.015) // Exponential fog for depth
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(30, 20, 30)
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
    renderer.toneMappingExposure = 1.5 // Increased exposure for better visibility
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Post-processing
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2, // strength - increased for better glow
      0.6, // radius - increased for wider glow
      0.7  // threshold - lowered to capture more glowing elements
    )
    composer.addPass(bloomPass)
    composerRef.current = composer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxDistance = 100
    controls.minDistance = 10
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controlsRef.current = controls

    // Lighting
    setupLighting(scene)

    // Create 3D objects
    createHydrogelChamber(scene)
    createElectrodes(scene)
    createAlgaeCells(scene)
    createElectronFlow(scene)
    
    // Add grid floor for better depth perception
    const gridHelper = new THREE.GridHelper(40, 40, 0x004466, 0x002233)
    gridHelper.position.y = -5
    scene.add(gridHelper)

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer || !composer) return
      
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      
      renderer.setSize(width, height)
      composer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      const delta = clockRef.current.getDelta()
      const elapsed = clockRef.current.getElapsedTime()

      // Update controls
      if (controls) {
        controls.autoRotate = isRotating
        controls.update()
      }

      // Animate objects
      animateAlgae(elapsed)
      if (showElectrons) {
        animateElectrons(elapsed, delta)
      }
      animateParticles(elapsed)

      // Render
      if (composer) {
        composer.render()
      }
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      const currentMount = mountRef.current
      if (currentMount && renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [isRotating, showElectrons])

  // Setup lighting
  const setupLighting = (scene: THREE.Scene) => {
    // Ambient light - matching original with dark blue tint for better visibility
    const ambientLight = new THREE.AmbientLight(0x001122, 0.4)
    scene.add(ambientLight)

    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
    mainLight.position.set(10, 15, 10)
    mainLight.castShadow = true
    mainLight.shadow.camera.near = 0.1
    mainLight.shadow.camera.far = 50
    mainLight.shadow.mapSize.width = 2048
    mainLight.shadow.mapSize.height = 2048
    scene.add(mainLight)

    // Bio light - green point light for algae
    const bioLight = new THREE.PointLight(0x00ff00, 0.6, 25)
    bioLight.position.set(0, 10, 0)
    scene.add(bioLight)

    // Additional fill lights for better visibility
    const fillLight1 = new THREE.PointLight(0x0088ff, 0.4, 30)
    fillLight1.position.set(-15, 5, 10)
    scene.add(fillLight1)

    const fillLight2 = new THREE.PointLight(0x00ffff, 0.4, 30)
    fillLight2.position.set(15, 5, -10)
    scene.add(fillLight2)

    // Top light to illuminate algae
    const topLight = new THREE.PointLight(0xffffff, 1.0, 30)
    topLight.position.set(0, 15, 0)
    scene.add(topLight)

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x00ffff, 0.5)
    rimLight.position.set(0, -10, -20)
    scene.add(rimLight)

    // Hemisphere light for natural illumination
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
    hemiLight.position.set(0, 20, 0)
    scene.add(hemiLight)
    
    // Spotlight on the chamber for better algae visibility
    const spotLight = new THREE.SpotLight(0xffffff, 1.5)
    spotLight.position.set(0, 20, 10)
    spotLight.target.position.set(0, 0, 0)
    spotLight.angle = Math.PI / 4
    spotLight.penumbra = 0.5
    spotLight.decay = 2
    spotLight.distance = 50
    scene.add(spotLight)
    scene.add(spotLight.target)
  }

  // Create hydrogel chamber (slide-like design)
  const createHydrogelChamber = (scene: THREE.Scene) => {
    // Calculate chamber dimensions based on volume
    const volume = parameters.algae.volume // in mL
    const baseWidth = 10
    const baseDepth = 5
    const height = Math.max(0.5, Math.min(5, volume / (baseWidth * baseDepth))) // Height varies with volume
    
    // Main chamber - rectangular slide design
    const chamberGeometry = new THREE.BoxGeometry(baseWidth, height, baseDepth)
    const chamberMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.3, // Increased opacity for better visibility
      metalness: 0.1,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      side: THREE.DoubleSide,
      transmission: 0.8, // Reduced transmission for better visibility
      thickness: 0.5,
      ior: 1.5,
      emissive: 0x001122, // Slight emissive glow
      emissiveIntensity: 0.1
    })
    
    const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial)
    chamber.castShadow = true
    chamber.receiveShadow = true
    chamber.userData.type = 'chamber' // Tag for identification
    scene.add(chamber)
    objectsRef.current.hydrogelChamber = chamber

    // Create glass walls for slide effect
    const wallThickness = 0.1
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2, // Increased opacity
      metalness: 0.0,
      roughness: 0.0,
      transmission: 0.9,
      thickness: 0.2,
      ior: 1.52,
      emissive: 0x0066ff, // Blue emissive edge
      emissiveIntensity: 0.05
    })

    // Front and back walls
    const frontWall = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth + wallThickness * 2, height + wallThickness * 2, wallThickness),
      glassMaterial
    )
    frontWall.position.z = baseDepth / 2 + wallThickness / 2
    frontWall.userData.type = 'chamberWall'
    scene.add(frontWall)

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth + wallThickness * 2, height + wallThickness * 2, wallThickness),
      glassMaterial
    )
    backWall.position.z = -baseDepth / 2 - wallThickness / 2
    backWall.userData.type = 'chamberWall'
    scene.add(backWall)

    // Side walls
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, height + wallThickness * 2, baseDepth),
      glassMaterial
    )
    leftWall.position.x = -baseWidth / 2 - wallThickness / 2
    leftWall.userData.type = 'chamberWall'
    scene.add(leftWall)

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, height + wallThickness * 2, baseDepth),
      glassMaterial
    )
    rightWall.position.x = baseWidth / 2 + wallThickness / 2
    rightWall.userData.type = 'chamberWall'
    scene.add(rightWall)

    // Top and bottom caps
    const capMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.2
    })

    const topCap = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth + wallThickness * 2, wallThickness, baseDepth + wallThickness * 2),
      capMaterial
    )
    topCap.position.y = height / 2 + wallThickness / 2
    topCap.userData.type = 'chamberWall'
    scene.add(topCap)

    const bottomCap = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth + wallThickness * 2, wallThickness, baseDepth + wallThickness * 2),
      capMaterial
    )
    bottomCap.position.y = -height / 2 - wallThickness / 2
    bottomCap.userData.type = 'chamberWall'
    scene.add(bottomCap)

    // Add inlet/outlet ports
    const portGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5)
    const portMaterial = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.9 })
    
    const inlet = new THREE.Mesh(portGeometry, portMaterial)
    inlet.position.set(-baseWidth / 2 + 1, height / 2 + 0.25, 0)
    scene.add(inlet)

    const outlet = new THREE.Mesh(portGeometry, portMaterial)
    outlet.position.set(baseWidth / 2 - 1, height / 2 + 0.25, 0)
    scene.add(outlet)
  }

  // Create electrodes
  const createElectrodes = (scene: THREE.Scene) => {
    const separation = parameters.electrodes.separation
    const area = parameters.electrodes.area
    const scale = Math.sqrt(area / 25)
    
    // Calculate electrode dimensions
    const electrodeWidth = Math.sqrt(area / 0.7) * 0.4 // Proportional to area
    const electrodeHeight = Math.sqrt(area / 0.7) * 0.7
    const electrodeThickness = 0.1 + scale * 0.05

    // Get material properties
    const anodeMat = parameters.electrodes.anodeMaterial
    const cathodeMat = parameters.electrodes.cathodeMaterial
    const anodeProps = electrodesDatabase.anode[anodeMat as keyof typeof electrodesDatabase.anode]
    const cathodeProps = electrodesDatabase.cathode[cathodeMat as keyof typeof electrodesDatabase.cathode]

    // Anode group
    const anodeGroup = new THREE.Group()
    scene.add(anodeGroup)
    objectsRef.current.anodeGroup = anodeGroup

    // Create anode with material-specific appearance
    const anodeGeometry = new THREE.BoxGeometry(electrodeThickness, electrodeHeight, electrodeWidth)
    const anodeMaterial = new THREE.MeshPhysicalMaterial({
      color: anodeMat.includes('graphene') ? 0x2a2a3a : 
             anodeMat.includes('carbon') ? 0x444455 : 
             anodeMat.includes('biochar') ? 0x5a4a3a : 0x3a3a4a,
      metalness: anodeProps.conductivity,
      roughness: 1 - anodeProps.conductivity,
      clearcoat: anodeMat.includes('graphene') ? 0.8 : 0.3,
      clearcoatRoughness: 0.1,
      emissive: anodeMat.includes('graphene') ? 0x1a1a2a : 0x222233,
      emissiveIntensity: 0.2
    })
    
    const anode = new THREE.Mesh(anodeGeometry, anodeMaterial)
    anode.castShadow = true
    anode.receiveShadow = true
    anode.position.set(-separation/2 - electrodeThickness/2, 0, 0)
    anodeGroup.add(anode)

    // Add surface texture for certain materials
    if (anodeMat.includes('cloth') || anodeMat.includes('felt')) {
      const textureGeometry = new THREE.PlaneGeometry(electrodeThickness * 1.1, electrodeHeight * 1.1, 20, 20)
      const positions = textureGeometry.attributes.position
      for (let i = 0; i < positions.count; i++) {
        positions.setZ(i, Math.random() * 0.02)
      }
      const textureMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      })
      const texture = new THREE.Mesh(textureGeometry, textureMaterial)
      texture.rotation.y = Math.PI / 2
      texture.position.copy(anode.position)
      texture.position.x += electrodeThickness * 0.6
      anodeGroup.add(texture)
    }

    // Cathode group
    const cathodeGroup = new THREE.Group()
    scene.add(cathodeGroup)
    objectsRef.current.cathodeGroup = cathodeGroup

    // Create cathode with material-specific appearance
    const cathodeGeometry = new THREE.BoxGeometry(electrodeThickness, electrodeHeight, electrodeWidth)
    const cathodeMaterial = new THREE.MeshPhysicalMaterial({
      color: cathodeMat === 'platinum' ? 0xf0f0f0 :
             cathodeMat === 'mxene' ? 0x6a00aa :
             cathodeMat.includes('oxide') ? 0x777788 : 0x444455,
      metalness: cathodeProps.conductivity,
      roughness: 1 - cathodeProps.conductivity,
      clearcoat: cathodeMat === 'platinum' ? 0.9 : 0.5,
      clearcoatRoughness: 0.05,
      emissive: cathodeMat === 'mxene' ? 0x4a0080 : 
                cathodeMat === 'platinum' ? 0xaaaaff : 0x333344,
      emissiveIntensity: cathodeMat === 'mxene' ? 0.3 : 0.1
    })
    
    const cathode = new THREE.Mesh(cathodeGeometry, cathodeMaterial)
    cathode.castShadow = true
    cathode.receiveShadow = true
    cathode.position.set(separation/2 + electrodeThickness/2, 0, 0)
    cathodeGroup.add(cathode)

    // Add surface modification effects
    if (parameters.electrodes.surfaceModification !== 'none') {
      const modType = parameters.electrodes.surfaceModification
      
      if (modType === 'metal-nanoparticles') {
        // Add metallic particles
        const particleCount = 50
        const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8)
        const particleMaterial = new THREE.MeshStandardMaterial({
          color: 0xffdd00,
          metalness: 0.9,
          roughness: 0.1,
          emissive: 0xffdd00,
          emissiveIntensity: 0.3
        })
        
        for (let i = 0; i < particleCount; i++) {
          const particle = new THREE.Mesh(particleGeometry, particleMaterial)
          particle.position.set(
            (Math.random() - 0.5) * electrodeThickness,
            (Math.random() - 0.5) * electrodeHeight * 0.9,
            (Math.random() - 0.5) * electrodeWidth * 0.9
          )
          anodeGroup.add(particle.clone())
          cathodeGroup.add(particle)
        }
      }
    }
  }

  // Create algae cells
  const createAlgaeCells = (scene: THREE.Scene) => {
    const algaeTypes = parameters.algae.type === 'mixed' 
      ? ['chlorella', 'spirulina', 'scenedesmus'] 
      : [parameters.algae.type]

    // Calculate chamber bounds based on volume
    const volume = parameters.algae.volume
    const baseWidth = 10
    const baseDepth = 5
    const height = Math.max(0.5, Math.min(5, volume / (baseWidth * baseDepth)))

    // Create water medium with subtle greenish tint for algae culture
    const mediumGeometry = new THREE.BoxGeometry(baseWidth * 0.95, height * 0.95, baseDepth * 0.95)
    const mediumMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a3d2e,
      transparent: true,
      opacity: 0.1,  // Much more transparent
      transmission: 0.95,  // Higher transmission
      thickness: 0.5,
      roughness: 0.05,
      ior: 1.33,
      emissive: 0x051d0e,
      emissiveIntensity: 0.05  // Subtle glow
    })
    const medium = new THREE.Mesh(mediumGeometry, mediumMaterial)
    medium.userData.type = 'waterMedium' // Tag for identification
    scene.add(medium)

    algaeTypes.forEach(type => {
      const algaeData = algaeDatabase[type as keyof typeof algaeDatabase]
      const group = new THREE.Group()
      
      // Scale count for visible representation (actual microalgae are microscopic)
      const baseCount = Math.min(parameters.algae.density * 50, 500) // Limit for performance
      
      // Create colonies and individual cells
      if (type === 'spirulina') {
        // Spirulina - tight spring-like spiral filaments (cyanobacteria)
        const filamentCount = Math.min(baseCount / 5, 40)
        
        for (let i = 0; i < filamentCount; i++) {
          const spiralGroup = new THREE.Group()
          
          // Create a tight helix curve - real spirulina has very close coils
          const turns = 8 + Math.random() * 4  // More turns
          const radius = 0.08 + Math.random() * 0.02  // Tighter radius
          const height = 0.8 + Math.random() * 0.4   // Shorter, more compact
          const points = []
          
          // Create tighter spiral with more points
          for (let t = 0; t <= turns * Math.PI * 2; t += 0.1) {
            points.push(new THREE.Vector3(
              Math.cos(t) * radius,
              (t / (turns * Math.PI * 2)) * height,
              Math.sin(t) * radius
            ))
          }
          
          const curve = new THREE.CatmullRomCurve3(points)
          const geometry = new THREE.TubeGeometry(curve, 100, 0.03, 6, false) // Uniform width
          const material = new THREE.MeshPhysicalMaterial({
            color: 0x0a5f3e,  // Dark blue-green for cyanobacteria
            emissive: 0x0a5f3e,
            emissiveIntensity: 0.5,
            metalness: 0.1,
            roughness: 0.8,
            transparent: true,
            opacity: 0.95,
            clearcoat: 0.3,
            clearcoatRoughness: 0.7
          })
          
          const spirulina = new THREE.Mesh(geometry, material)
          spirulina.position.set(
            (Math.random() - 0.5) * (baseWidth - 0.5),
            (Math.random() - 0.5) * (height - 0.2),
            (Math.random() - 0.5) * (baseDepth - 0.5)
          )
          spirulina.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          )
          
          spiralGroup.add(spirulina)
          group.add(spiralGroup)
        }
        
      } else if (type === 'chlorella') {
        // Chlorella - perfect spherical cells, mostly single with some pairs
        const cellCount = Math.min(baseCount / 2, 80)
        
        for (let c = 0; c < cellCount; c++) {
          const cellGroup = new THREE.Group()
          const isPaired = Math.random() < 0.3  // 30% chance of being paired
          const cellsInGroup = isPaired ? 2 : 1
          const groupCenter = new THREE.Vector3(
            (Math.random() - 0.5) * (baseWidth - 1),
            (Math.random() - 0.5) * (height - 0.4),
            (Math.random() - 0.5) * (baseDepth - 1)
          )
          
          for (let i = 0; i < cellsInGroup; i++) {
            const geometry = new THREE.SphereGeometry(0.08, 24, 24) // Perfect spheres, uniform size
            const material = new THREE.MeshPhysicalMaterial({
              color: 0x00ff00,  // Bright green for chlorophyll
              emissive: 0x00aa00,
              emissiveIntensity: 0.4,
              metalness: 0.0,
              roughness: 0.9,  // Cell wall gives matte appearance
              transparent: true,
              opacity: 0.9,
              clearcoat: 0.6,  // Cell wall sheen
              clearcoatRoughness: 0.4,
              sheen: 0.3,
              sheenRoughness: 0.6,
              sheenColor: 0x88ff88
            })
            
            const cell = new THREE.Mesh(geometry, material)
            if (isPaired && i === 1) {
              // Position second cell touching the first
              cell.position.set(
                groupCenter.x + 0.16,
                groupCenter.y,
                groupCenter.z
              )
            } else {
              cell.position.copy(groupCenter)
            }
            
            cellGroup.add(cell)
          }
          
          group.add(cellGroup)
        }
        
      } else if (type === 'scenedesmus') {
        // Scenedesmus - colonial green algae, 2-8 oval cells in a row
        const colonyCount = Math.min(baseCount / 8, 25)
        
        for (let c = 0; c < colonyCount; c++) {
          const colonyGroup = new THREE.Group()
          const cellsInColony = Math.random() < 0.5 ? 4 : Math.floor(Math.random() * 3) * 2 + 2 // Even numbers common
          
          for (let i = 0; i < cellsInColony; i++) {
            // Create oval/elliptical cells
            const geometry = new THREE.SphereGeometry(0.06, 16, 16)
            geometry.scale(1.8, 1, 1) // Elongated oval shape
            const material = new THREE.MeshPhysicalMaterial({
              color: 0x00dd00,  // Slightly darker green than chlorella
              emissive: 0x009900,
              emissiveIntensity: 0.35,
              metalness: 0.0,
              roughness: 0.85,
              transparent: true,
              opacity: 0.95,
              clearcoat: 0.4,
              clearcoatRoughness: 0.5
            })
            
            const cell = new THREE.Mesh(geometry, material)
            cell.position.x = (i - (cellsInColony - 1) / 2) * 0.11 // Tightly packed
            cell.rotation.z = Math.PI / 2
            
            // Add small spines on outer cells (characteristic feature)
            if ((i === 0 || i === cellsInColony - 1) && Math.random() < 0.5) {
              const spineGeometry = new THREE.ConeGeometry(0.01, 0.05, 4)
              const spineMaterial = new THREE.MeshStandardMaterial({ color: 0x00aa00 })
              const spine = new THREE.Mesh(spineGeometry, spineMaterial)
              spine.position.x = i === 0 ? -0.08 : 0.08
              spine.rotation.z = i === 0 ? -Math.PI / 2 : Math.PI / 2
              cell.add(spine)
            }
            
            colonyGroup.add(cell)
          }
          
          colonyGroup.position.set(
            (Math.random() - 0.5) * (baseWidth - 0.8),
            (Math.random() - 0.5) * (height - 0.3),
            (Math.random() - 0.5) * (baseDepth - 0.8)
          )
          colonyGroup.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            0
          )
          
          group.add(colonyGroup)
        }
        
      } else if (type === 'chlamydomonas') {
        // Chlamydomonas - pear-shaped cells with two flagella
        const cellCount = Math.min(baseCount / 3, 50)
        
        for (let i = 0; i < cellCount; i++) {
          const cellGroup = new THREE.Group()
          
          // Create pear-shaped body
          const geometry = new THREE.SphereGeometry(0.07, 16, 16)
          geometry.scale(1, 1.3, 1) // Elongate to pear shape
          
          // Taper the bottom
          const positions = geometry.attributes.position
          for (let j = 0; j < positions.count; j++) {
            const y = positions.getY(j)
            if (y < 0) {
              const scale = 1 + y * 0.3 // Taper bottom
              positions.setX(j, positions.getX(j) * scale)
              positions.setZ(j, positions.getZ(j) * scale)
            }
          }
          geometry.attributes.position.needsUpdate = true
          
          const material = new THREE.MeshPhysicalMaterial({
            color: 0x00ff88,  // Bright green
            emissive: 0x00aa44,
            emissiveIntensity: 0.4,
            metalness: 0.0,
            roughness: 0.8,
            transparent: true,
            opacity: 0.9,
            clearcoat: 0.3
          })
          
          const body = new THREE.Mesh(geometry, material)
          cellGroup.add(body)
          
          // Add two flagella
          for (let f = 0; f < 2; f++) {
            const flagellaPoints = []
            const flagellaLength = 0.15
            const segments = 8
            
            for (let s = 0; s <= segments; s++) {
              const t = s / segments
              flagellaPoints.push(new THREE.Vector3(
                (f === 0 ? -0.02 : 0.02) + Math.sin(t * Math.PI * 2) * 0.01 * t,
                0.09 + t * flagellaLength,
                Math.cos(t * Math.PI * 2) * 0.01 * t
              ))
            }
            
            const flagellaCurve = new THREE.CatmullRomCurve3(flagellaPoints)
            const flagellaGeometry = new THREE.TubeGeometry(flagellaCurve, 16, 0.005, 4, false)
            const flagellaMaterial = new THREE.MeshBasicMaterial({
              color: 0x88ff88,
              transparent: true,
              opacity: 0.6
            })
            
            const flagella = new THREE.Mesh(flagellaGeometry, flagellaMaterial)
            cellGroup.add(flagella)
          }
          
          cellGroup.position.set(
            (Math.random() - 0.5) * (baseWidth - 0.5),
            (Math.random() - 0.5) * (height - 0.2),
            (Math.random() - 0.5) * (baseDepth - 0.5)
          )
          cellGroup.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          )
          
          group.add(cellGroup)
        }
        
      } else if (type === 'dunaliella') {
        // Dunaliella - elongated cells, no rigid cell wall, can change shape
        const cellCount = Math.min(baseCount / 3, 40)
        
        for (let i = 0; i < cellCount; i++) {
          const cellGroup = new THREE.Group()
          
          // Create elongated, flexible-looking cell
          const geometry = new THREE.SphereGeometry(0.06, 16, 16)
          geometry.scale(2.5, 1, 1) // Very elongated
          
          // Add slight irregularity to show flexible nature
          const positions = geometry.attributes.position
          for (let j = 0; j < positions.count; j++) {
            const x = positions.getX(j)
            const wobble = Math.sin(j * 0.5) * 0.005
            positions.setX(j, x + wobble)
          }
          geometry.attributes.position.needsUpdate = true
          
          const material = new THREE.MeshPhysicalMaterial({
            color: 0xff8800,  // Orange-red due to carotenoids
            emissive: 0xaa4400,
            emissiveIntensity: 0.5,
            metalness: 0.1,
            roughness: 0.6,
            transparent: true,
            opacity: 0.85,
            clearcoat: 0.2  // Less shiny due to no rigid wall
          })
          
          const body = new THREE.Mesh(geometry, material)
          cellGroup.add(body)
          
          // Add two flagella (similar to chlamydomonas)
          for (let f = 0; f < 2; f++) {
            const flagellaPoints = []
            for (let s = 0; s <= 6; s++) {
              const t = s / 6
              flagellaPoints.push(new THREE.Vector3(
                (f === 0 ? -0.08 : 0.08) + Math.sin(t * Math.PI) * 0.02,
                Math.sin(t * Math.PI * 3) * 0.02,
                -0.05 + t * 0.12
              ))
            }
            
            const flagellaCurve = new THREE.CatmullRomCurve3(flagellaPoints)
            const flagellaGeometry = new THREE.TubeGeometry(flagellaCurve, 12, 0.006, 4, false)
            const flagellaMaterial = new THREE.MeshBasicMaterial({
              color: 0xffaa44,
              transparent: true,
              opacity: 0.5
            })
            
            const flagella = new THREE.Mesh(flagellaGeometry, flagellaMaterial)
            cellGroup.add(flagella)
          }
          
          cellGroup.position.set(
            (Math.random() - 0.5) * (baseWidth - 0.5),
            (Math.random() - 0.5) * (height - 0.2),
            (Math.random() - 0.5) * (baseDepth - 0.5)
          )
          cellGroup.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          )
          
          group.add(cellGroup)
        }
        
      } else if (type === 'synechocystis') {
        // Synechocystis - small spherical cyanobacteria, often in pairs or small groups
        const cellCount = Math.min(baseCount / 2, 100)
        
        for (let i = 0; i < cellCount; i++) {
          const groupType = Math.random()
          const cellGroup = new THREE.Group()
          
          let cellsInGroup = 1
          if (groupType < 0.4) cellsInGroup = 2  // 40% pairs
          else if (groupType < 0.6) cellsInGroup = 4  // 20% tetrads
          
          for (let c = 0; c < cellsInGroup; c++) {
            const geometry = new THREE.SphereGeometry(0.05, 20, 20) // Smaller than chlorella
            const material = new THREE.MeshPhysicalMaterial({
              color: 0x0088aa,  // Blue-green cyanobacteria
              emissive: 0x004455,
              emissiveIntensity: 0.45,
              metalness: 0.05,
              roughness: 0.85,
              transparent: true,
              opacity: 0.9,
              clearcoat: 0.5,
              clearcoatRoughness: 0.6
            })
            
            const cell = new THREE.Mesh(geometry, material)
            
            // Position cells in pairs or tetrads
            if (cellsInGroup === 2) {
              cell.position.x = (c - 0.5) * 0.1
            } else if (cellsInGroup === 4) {
              const angle = (c / 4) * Math.PI * 2
              cell.position.x = Math.cos(angle) * 0.05
              cell.position.z = Math.sin(angle) * 0.05
            }
            
            cellGroup.add(cell)
          }
          
          cellGroup.position.set(
            (Math.random() - 0.5) * (baseWidth - 0.5),
            (Math.random() - 0.5) * (height - 0.2),
            (Math.random() - 0.5) * (baseDepth - 0.5)
          )
          
          group.add(cellGroup)
        }
        
      } else {
        // Default simple spherical cells for any other type
        const cellCount = Math.min(baseCount / 5, 40)
        
        for (let i = 0; i < cellCount; i++) {
          const geometry = new THREE.SphereGeometry(0.08, 16, 16)
          const material = new THREE.MeshPhysicalMaterial({
            color: algaeData.color,
            emissive: algaeData.color,
            emissiveIntensity: 0.4,
            metalness: 0.1,
            roughness: 0.8,
            transparent: true,
            opacity: 0.9
          })
          
          const cell = new THREE.Mesh(geometry, material)
          cell.position.set(
            (Math.random() - 0.5) * (baseWidth - 0.5),
            (Math.random() - 0.5) * (height - 0.2),
            (Math.random() - 0.5) * (baseDepth - 0.5)
          )
          
          group.add(cell)
        }
      }
      
      // Add floating particles for suspended matter
      const particleCount = Math.min(parameters.algae.density * 100, 1000)
      const particleGeometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)
      
      const color = new THREE.Color(algaeData.color)
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * baseWidth * 0.9
        positions[i + 1] = (Math.random() - 0.5) * height * 0.9
        positions[i + 2] = (Math.random() - 0.5) * baseDepth * 0.9
        
        colors[i] = color.r
        colors[i + 1] = color.g
        colors[i + 2] = color.b
      }
      
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05, // Much larger particles
        vertexColors: true,
        transparent: true,
        opacity: 1.0, // Full opacity
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      })
      
      const particles = new THREE.Points(particleGeometry, particleMaterial)
      group.add(particles)
      
      // Enhanced biofilm visualization
      if (parameters.algae.biofilm > 20) {
        const biofilmGroup = new THREE.Group()
        
        // Create biofilm as a bumpy, organic surface
        const biofilmSegments = 20
        const biofilmGeometry = new THREE.PlaneGeometry(
          baseWidth * 0.9, 
          height * 0.9,
          biofilmSegments,
          biofilmSegments
        )
        
        // Add organic bumps to the biofilm
        const positions = biofilmGeometry.attributes.position
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i)
          const y = positions.getY(i)
          const distance = Math.sqrt(x * x + y * y)
          const bumpiness = Math.sin(distance * 5) * 0.02 + Math.random() * 0.01
          positions.setZ(i, bumpiness * (parameters.algae.biofilm / 100))
        }
        biofilmGeometry.computeVertexNormals()
        
        const biofilmMaterial = new THREE.MeshPhysicalMaterial({
          color: algaeData.color,
          transparent: true,
          opacity: 0.3 + (parameters.algae.biofilm / 200),
          side: THREE.DoubleSide,
          roughness: 0.9,
          metalness: 0.1,
          clearcoat: 0.3,
          clearcoatRoughness: 0.9,
          emissive: algaeData.color,
          emissiveIntensity: 0.1
        })
        
        // Create biofilm on electrodes
        const biofilm1 = new THREE.Mesh(biofilmGeometry, biofilmMaterial)
        biofilm1.position.x = -parameters.electrodes.separation/2 - 0.15
        biofilm1.rotation.y = Math.PI / 2
        biofilmGroup.add(biofilm1)
        
        const biofilm2 = new THREE.Mesh(biofilmGeometry, biofilmMaterial.clone())
        biofilm2.position.x = parameters.electrodes.separation/2 + 0.15
        biofilm2.rotation.y = Math.PI / 2
        biofilmGroup.add(biofilm2)
        
        group.add(biofilmGroup)
      }
      
      scene.add(group)
      objectsRef.current.algaeGroups[type] = group
    })
  }

  // Create electron flow visualization
  const createElectronFlow = (scene: THREE.Scene) => {
    const electronCount = 20
    const electrons: THREE.Mesh[] = []
    const paths: THREE.CatmullRomCurve3[] = []

    for (let i = 0; i < electronCount; i++) {
      // Create electron
      const electronGeometry = new THREE.SphereGeometry(0.05, 8, 8)
      const electronMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00
      })
      
      const electron = new THREE.Mesh(electronGeometry, electronMaterial)
      scene.add(electron)
      electrons.push(electron)

      // Create path
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-6, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8),
        new THREE.Vector3(0, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8),
        new THREE.Vector3(6, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8)
      ])
      paths.push(path)
    }

    objectsRef.current.electrons = electrons
    objectsRef.current.electronPaths = paths
  }

  // Animation functions
  const animateAlgae = (elapsed: number) => {
    const mixingSpeed = parameters.flow.mixingSpeed / 100
    const flowMode = parameters.flow.operationMode
    
    Object.values(objectsRef.current.algaeGroups).forEach(group => {
      group.children.forEach((algae, index) => {
        if (algae instanceof THREE.Mesh) {
          // Vertical movement based on mixing speed
          const verticalMotion = Math.sin(elapsed * mixingSpeed + index) * 0.002 * mixingSpeed
          algae.position.y += verticalMotion
          
          // Rotation based on species
          if (parameters.algae.type === 'spirulina') {
            algae.rotation.z = elapsed * 0.5
          } else {
            algae.rotation.y = elapsed * 0.1 * mixingSpeed
          }
          
          // Flow motion for continuous mode
          if (flowMode === 'continuous' && parameters.flow.flowRate > 0) {
            algae.position.x += 0.001 * parameters.flow.flowRate / 10
            // Reset position when reaching edge
            if (algae.position.x > 5) {
              algae.position.x = -5
            }
          }
          
          // Brownian motion
          algae.position.x += (Math.random() - 0.5) * 0.001
          algae.position.z += (Math.random() - 0.5) * 0.001
          
          // Keep within chamber bounds
          const bounds = {
            x: 4.5,
            y: Math.max(0.5, Math.min(5, parameters.algae.volume / 50)) / 2,
            z: 2.5
          }
          algae.position.x = Math.max(-bounds.x, Math.min(bounds.x, algae.position.x))
          algae.position.y = Math.max(-bounds.y, Math.min(bounds.y, algae.position.y))
          algae.position.z = Math.max(-bounds.z, Math.min(bounds.z, algae.position.z))
        }
      })
    })
  }

  const animateElectrons = (elapsed: number, delta: number) => {
    objectsRef.current.electrons.forEach((electron, index) => {
      const path = objectsRef.current.electronPaths[index]
      const t = (elapsed * 0.1 + index * 0.05) % 1
      const position = path.getPoint(t)
      electron.position.copy(position)
    })
  }

  const animateParticles = (elapsed: number) => {
    Object.values(objectsRef.current.particleSystems).forEach(system => {
      system.rotation.y = elapsed * 0.05
    })
  }

  // Calculate performance metrics
  const calculatePerformance = useCallback(() => {
    const algae = algaeDatabase[parameters.algae.type as keyof typeof algaeDatabase]
    const anodeProps = electrodesDatabase.anode[parameters.electrodes.anodeMaterial as keyof typeof electrodesDatabase.anode]
    const cathodeProps = electrodesDatabase.cathode[parameters.electrodes.cathodeMaterial as keyof typeof electrodesDatabase.cathode]
    const separatorProps = separatorsDatabase[parameters.separator.type as keyof typeof separatorsDatabase]
    
    // Basic calculations (simplified model)
    const cellDensityFactor = parameters.algae.density / 10
    const areaFactor = parameters.electrodes.area / 25
    const tempFactor = 1 + (parameters.environment.temperature - 25) * 0.02
    const phFactor = 1 - Math.abs(parameters.environment.ph - algae.optimalPH) * 0.1
    const lightFactor = Math.min(parameters.environment.lightIntensity / 400, 1.5)
    
    // Calculate voltage (simplified Nernst equation)
    const standardPotential = 0.8
    const voltage = standardPotential * anodeProps.conductivity * cathodeProps.conductivity * phFactor
    
    // Calculate current density
    const currentDensity = algae.electronTransferRate * cellDensityFactor * tempFactor * lightFactor / 1e8
    const current = currentDensity * parameters.electrodes.area
    
    // Calculate power
    const power = voltage * current
    const powerDensity = power / parameters.electrodes.area
    
    // Calculate efficiency
    const efficiency = (power / (parameters.environment.lightIntensity * parameters.electrodes.area * 0.001)) * 100
    
    // CO2 fixation
    const co2Fixation = algae.co2FixationRate * cellDensityFactor * parameters.algae.volume * 0.001
    
    // Update performance state
    setParameters(prev => ({
      ...prev,
      performance: {
        power: power * 1000, // Convert to mW
        powerDensity: powerDensity * 1000, // mW/cm²
        efficiency: efficiency / 100,
        voltage,
        current: current * 1000, // mA
        resistance: voltage / current,
        co2Fixation,
        coulombicEfficiency: efficiency * 0.7,
        energyRecovery: efficiency * 0.5,
        volumetricPower: power / parameters.algae.volume * 1000000 // mW/L
      }
    }))
  }, [parameters])

  // Recalculate performance when parameters change
  useEffect(() => {
    calculatePerformance()
  }, [calculatePerformance])

  // Parameter update handlers
  const handleParameterChange = useCallback((category: string, param: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [param]: value
      }
    }))
    
    // Update 3D visualization based on parameter changes
    if (sceneRef.current) {
      // Trigger re-render or update specific objects
      updateVisualization(category, param, value)
    }
  }, [])

  const updateVisualization = (category: string, param: string, value: any) => {
    if (!sceneRef.current) return

    // Clear existing objects for major changes
    const clearGroup = (group: THREE.Group | null) => {
      if (group) {
        while (group.children.length > 0) {
          const child = group.children[0]
          group.remove(child)
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (child.material instanceof THREE.Material) {
              child.material.dispose()
            }
          }
        }
      }
    }

    switch (category) {
      case 'algae':
        // Update algae visualization
        if (param === 'type' || param === 'density' || param === 'biofilm') {
          // Clear existing algae
          Object.values(objectsRef.current.algaeGroups).forEach(group => {
            sceneRef.current?.remove(group)
            clearGroup(group)
          })
          objectsRef.current.algaeGroups = {}
          // Recreate algae
          createAlgaeCells(sceneRef.current)
        }
        if (param === 'volume') {
          // Update chamber size
          const chamber = objectsRef.current.hydrogelChamber
          if (chamber) {
            sceneRef.current.remove(chamber)
            // Remove all chamber-related objects safely
            const childrenToRemove: THREE.Object3D[] = []
            
            sceneRef.current.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                // Check userData first for tagged objects
                if (child.userData.type === 'waterMedium' || 
                    child.userData.type === 'chamber' ||
                    child.userData.type === 'chamberWall') {
                  childrenToRemove.push(child)
                  return
                }
                
                // Check material properties as fallback
                try {
                  const material = child.material as any
                  if (material && material.color) {
                    const colorHex = material.color.getHex()
                    // Chamber-related colors
                    if (colorHex === 0x00ff88 || // Chamber
                        colorHex === 0xffffff || // Glass walls
                        colorHex === 0x1a3d2e || // Water medium
                        colorHex === 0x333333) { // Caps
                      childrenToRemove.push(child)
                    }
                  }
                } catch (e) {
                  // Ignore any errors accessing material properties
                }
              }
            })
            
            // Remove and dispose identified objects
            childrenToRemove.forEach(child => {
              sceneRef.current?.remove(child)
              if (child instanceof THREE.Mesh) {
                child.geometry.dispose()
                if (child.material instanceof THREE.Material) {
                  child.material.dispose()
                } else if (Array.isArray(child.material)) {
                  child.material.forEach(mat => mat.dispose())
                }
              }
            })
          }
          createHydrogelChamber(sceneRef.current)
          // Recreate algae to fit new volume
          Object.values(objectsRef.current.algaeGroups).forEach(group => {
            sceneRef.current?.remove(group)
            clearGroup(group)
          })
          createAlgaeCells(sceneRef.current)
        }
        break

      case 'electrodes':
        // Update electrode visualization
        if (param === 'anodeMaterial' || param === 'cathodeMaterial' || 
            param === 'area' || param === 'separation' || param === 'surfaceModification') {
          // Clear existing electrodes
          if (objectsRef.current.anodeGroup) {
            sceneRef.current.remove(objectsRef.current.anodeGroup)
            clearGroup(objectsRef.current.anodeGroup)
          }
          if (objectsRef.current.cathodeGroup) {
            sceneRef.current.remove(objectsRef.current.cathodeGroup)
            clearGroup(objectsRef.current.cathodeGroup)
          }
          // Recreate electrodes
          createElectrodes(sceneRef.current)
          
          // Update electron paths for new separation
          if (param === 'separation') {
            objectsRef.current.electronPaths = []
            objectsRef.current.electrons.forEach(electron => {
              sceneRef.current?.remove(electron)
            })
            createElectronFlow(sceneRef.current)
          }
        }
        break

      case 'environment':
        // Update lighting based on light intensity
        if (param === 'lightIntensity') {
          const sunLight = sceneRef.current.children.find(
            child => child instanceof THREE.DirectionalLight && child.position.y > 40
          ) as THREE.DirectionalLight
          if (sunLight) {
            sunLight.intensity = 0.5 + (value / 1000) * 2
          }
        }
        // Update algae emissive based on light
        if (param === 'lightIntensity' || param === 'lightSpectrum') {
          Object.values(objectsRef.current.algaeGroups).forEach(group => {
            group.children.forEach(child => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
                child.material.emissiveIntensity = 0.1 + (value / 1000) * 0.4
                
                // Adjust color based on spectrum
                if (param === 'lightSpectrum') {
                  const algaeData = algaeDatabase[parameters.algae.type as keyof typeof algaeDatabase]
                  let colorMultiplier = new THREE.Color(1, 1, 1)
                  
                  switch (value) {
                    case 'red':
                      colorMultiplier = new THREE.Color(1.5, 0.5, 0.5)
                      break
                    case 'blue':
                      colorMultiplier = new THREE.Color(0.5, 0.5, 1.5)
                      break
                    case 'red-blue':
                      colorMultiplier = new THREE.Color(1.2, 0.5, 1.2)
                      break
                  }
                  
                  const baseColor = new THREE.Color(algaeData.color)
                  child.material.color = baseColor.multiply(colorMultiplier)
                }
              }
            })
          })
        }
        break

      case 'flow':
        // Update animation speed based on mixing
        if (param === 'mixingSpeed') {
          // This will affect the animation loop
        }
        break
    }
  }

  const loadPreset = (presetKey: string) => {
    const preset = presets[presetKey as keyof typeof presets]
    if (preset) {
      setParameters({
        ...preset,
        performance: defaultParameters.performance
      })
    }
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div ref={mountRef} className={styles.canvas} />
      
      {/* Control Panel */}
      <div className={`${styles.controlPanel} ${styles.glassPanel}`}>
        <h1 className={styles.title}>Algal Fuel Cell Designer</h1>
        <p className={styles.subtitle}>
          Advanced bio-electrochemical system modeling with real-time 3D visualization
        </p>

        {/* Presets */}
        <div className={styles.parameterSection}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⚡</span>
            Quick Start Presets
          </div>
          <div className={styles.presetButtons}>
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                className={styles.presetButton}
                onClick={() => loadPreset(key)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === 'biological' ? styles.active : ''}`}
            onClick={() => setActiveTab('biological')}
          >
            Biological
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'materials' ? styles.active : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            Materials
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'environment' ? styles.active : ''}`}
            onClick={() => setActiveTab('environment')}
          >
            Environment
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'electrical' ? styles.active : ''}`}
            onClick={() => setActiveTab('electrical')}
          >
            Electrical
          </button>
        </div>

        {/* Advanced Mode Toggle */}
        <div className={styles.advancedToggle} onClick={() => setAdvancedMode(!advancedMode)}>
          <span>Advanced Parameters</span>
          <div className={`${styles.toggleSwitch} ${advancedMode ? styles.active : ''}`} />
        </div>

        {/* Tab Content */}
        <ParameterControls
          parameters={parameters}
          onParameterChange={handleParameterChange}
          activeTab={activeTab}
          advancedMode={advancedMode}
        />
      </div>

      {/* Status Panel */}
      <div className={`${styles.statusPanel} ${styles.glassPanel}`}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📊</span>
          System Status
        </h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Power Output</div>
            <div className={styles.statValue}>
              {parameters.performance.power.toFixed(2)}
              <span className={styles.statUnit}>mW</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Power Density</div>
            <div className={styles.statValue}>
              {parameters.performance.powerDensity.toFixed(1)}
              <span className={styles.statUnit}>mW/cm²</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Efficiency</div>
            <div className={styles.statValue}>
              {(parameters.performance.efficiency * 100).toFixed(1)}
              <span className={styles.statUnit}>%</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>CO₂ Fixation</div>
            <div className={styles.statValue}>
              {parameters.performance.co2Fixation.toFixed(1)}
              <span className={styles.statUnit}>g/day</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Voltage</div>
            <div className={styles.statValue}>
              {parameters.performance.voltage.toFixed(3)}
              <span className={styles.statUnit}>V</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Current</div>
            <div className={styles.statValue}>
              {parameters.performance.current.toFixed(1)}
              <span className={styles.statUnit}>mA</span>
            </div>
          </div>
        </div>

        {/* Material Cost Analysis */}
        <div className={styles.costAnalysis}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>💰</span>
            Cost Analysis
          </h4>
          <div className={styles.costItem}>
            <span className={styles.costLabel}>Anode Cost:</span>
            <span className={styles.costValue}>
              ${electrodesDatabase.anode[parameters.electrodes.anodeMaterial as keyof typeof electrodesDatabase.anode]?.cost || 0}
            </span>
          </div>
          <div className={styles.costItem}>
            <span className={styles.costLabel}>Cathode Cost:</span>
            <span className={styles.costValue}>
              ${electrodesDatabase.cathode[parameters.electrodes.cathodeMaterial as keyof typeof electrodesDatabase.cathode]?.cost || 0}
            </span>
          </div>
          <div className={styles.costItem}>
            <span className={styles.costLabel}>Total Material Cost:</span>
            <span className={styles.costValue}>
              ${(
                (electrodesDatabase.anode[parameters.electrodes.anodeMaterial as keyof typeof electrodesDatabase.anode]?.cost || 0) +
                (electrodesDatabase.cathode[parameters.electrodes.cathodeMaterial as keyof typeof electrodesDatabase.cathode]?.cost || 0) +
                (separatorsDatabase[parameters.separator.type as keyof typeof separatorsDatabase]?.cost || 0)
              ).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Visualization Mode Buttons */}
      <div className={styles.visualizationModes}>
        <button
          className={`${styles.modeButton} ${visualizationMode === 'normal' ? styles.active : ''}`}
          onClick={() => setVisualizationMode('normal')}
        >
          Normal View
        </button>
        <button
          className={`${styles.modeButton} ${visualizationMode === 'xray' ? styles.active : ''}`}
          onClick={() => setVisualizationMode('xray')}
        >
          X-Ray Mode
        </button>
        <button
          className={`${styles.modeButton} ${visualizationMode === 'thermal' ? styles.active : ''}`}
          onClick={() => setVisualizationMode('thermal')}
        >
          Thermal View
        </button>
        <button
          className={`${styles.modeButton} ${showElectrons ? styles.active : ''}`}
          onClick={() => setShowElectrons(!showElectrons)}
        >
          Electron Flow
        </button>
      </div>
    </div>
  )
}