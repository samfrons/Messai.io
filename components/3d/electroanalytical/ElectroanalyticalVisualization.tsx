'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'

interface ElectroanalyticalVisualizationProps {
  method: string
  parameters: any
  onDataUpdate?: (data: any) => void
  className?: string
}

export default function ElectroanalyticalVisualization({
  method,
  parameters,
  onDataUpdate,
  className = ''
}: ElectroanalyticalVisualizationProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Visualization data
  const dataRef = useRef({
    voltammogram: [] as { x: number; y: number }[],
    currentTime: [] as { x: number; y: number }[],
    impedance: [] as { real: number; imag: number; freq: number }[]
  })

  // Generate synthetic data based on method
  const generateData = (method: string) => {
    switch (method) {
      case 'cyclic-voltammetry':
        // Generate CV curve
        const cvData: { x: number; y: number }[] = []
        for (let v = -0.5; v <= 0.5; v += 0.01) {
          const current = 
            0.5 * Math.exp(-Math.pow(v - 0.2, 2) / 0.01) - // Oxidation peak
            0.3 * Math.exp(-Math.pow(v + 0.1, 2) / 0.01) + // Reduction peak
            0.1 * v // Background current
          cvData.push({ x: v, y: current })
        }
        dataRef.current.voltammogram = cvData
        break

      case 'chronoamperometry':
        // Generate current vs time
        const caData: { x: number; y: number }[] = []
        for (let t = 0; t <= 10; t += 0.1) {
          const current = 2 * Math.exp(-t / 2) + 0.1 + Math.random() * 0.05
          caData.push({ x: t, y: current })
        }
        dataRef.current.currentTime = caData
        break

      case 'impedance':
        // Generate Nyquist plot data
        const eisData: { real: number; imag: number; freq: number }[] = []
        for (let f = 0.1; f <= 10000; f *= 1.2) {
          const omega = 2 * Math.PI * f
          const real = 100 + 200 / (1 + Math.pow(omega * 0.001, 2))
          const imag = -200 * omega * 0.001 / (1 + Math.pow(omega * 0.001, 2))
          eisData.push({ real, imag, freq: f })
        }
        dataRef.current.impedance = eisData
        break
    }
  }

  // Create 3D visualization elements
  const create3DVisualization = (scene: THREE.Scene, method: string) => {
    // Clear existing objects
    scene.clear()

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Create electrochemical cell
    const cellGroup = new THREE.Group()

    // Glass cell container
    const cellGeometry = new THREE.CylinderGeometry(2, 2, 3, 32, 1, true)
    const cellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.2,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      thickness: 0.1
    })
    const cell = new THREE.Mesh(cellGeometry, cellMaterial)
    cellGroup.add(cell)

    // Electrolyte solution
    const solutionGeometry = new THREE.CylinderGeometry(1.9, 1.9, 2.5, 32)
    const solutionMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0.3,
      roughness: 0,
      metalness: 0,
      transmission: 0.8
    })
    const solution = new THREE.Mesh(solutionGeometry, solutionMaterial)
    solution.position.y = -0.25
    cellGroup.add(solution)

    // Working electrode
    const workingElectrodeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2)
    const workingElectrodeMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.2
    })
    const workingElectrode = new THREE.Mesh(workingElectrodeGeometry, workingElectrodeMaterial)
    workingElectrode.position.set(0, 0, 0)
    cellGroup.add(workingElectrode)

    // Reference electrode (Ag/AgCl)
    const refElectrodeGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.5)
    const refElectrodeMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.9,
      roughness: 0.1
    })
    const refElectrode = new THREE.Mesh(refElectrodeGeometry, refElectrodeMaterial)
    refElectrode.position.set(-0.8, 0.25, 0)
    cellGroup.add(refElectrode)

    // Counter electrode (Pt)
    const counterElectrodeGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.5)
    const counterElectrodeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5e5e5,
      metalness: 1,
      roughness: 0.2
    })
    const counterElectrode = new THREE.Mesh(counterElectrodeGeometry, counterElectrodeMaterial)
    counterElectrode.position.set(0.8, 0.25, 0)
    cellGroup.add(counterElectrode)

    // Add connecting wires
    const wireGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5)
    const wireMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
    
    // Wire connections
    for (let i = 0; i < 3; i++) {
      const wire = new THREE.Mesh(wireGeometry, wireMaterial)
      wire.position.y = 1.75
      if (i === 0) wire.position.x = 0 // Working
      else if (i === 1) wire.position.x = -0.8 // Reference
      else wire.position.x = 0.8 // Counter
      cellGroup.add(wire)
    }

    scene.add(cellGroup)

    // Add data visualization plane
    if (method === 'cyclic-voltammetry' || method === 'chronoamperometry') {
      const planeGroup = new THREE.Group()
      planeGroup.position.set(4, 0, 0)

      // Graph background
      const bgGeometry = new THREE.PlaneGeometry(4, 3)
      const bgMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x1a1a1a,
        side: THREE.DoubleSide
      })
      const bg = new THREE.Mesh(bgGeometry, bgMaterial)
      planeGroup.add(bg)

      // Axes
      const axesMaterial = new LineMaterial({
        color: 0xffffff,
        linewidth: 2,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
      })

      // X-axis
      const xAxisGeometry = new LineGeometry()
      xAxisGeometry.setPositions([-1.8, -1.3, 0.01, 1.8, -1.3, 0.01])
      const xAxis = new Line2(xAxisGeometry, axesMaterial)
      planeGroup.add(xAxis)

      // Y-axis
      const yAxisGeometry = new LineGeometry()
      yAxisGeometry.setPositions([-1.8, -1.3, 0.01, -1.8, 1.3, 0.01])
      const yAxis = new Line2(yAxisGeometry, axesMaterial)
      planeGroup.add(yAxis)

      // Plot data curve
      const data = method === 'cyclic-voltammetry' 
        ? dataRef.current.voltammogram 
        : dataRef.current.currentTime

      if (data.length > 0) {
        const positions: number[] = []
        data.forEach(point => {
          const x = -1.8 + (point.x - data[0].x) / (data[data.length-1].x - data[0].x) * 3.6
          const y = -1.3 + (point.y + 1) * 1.3
          positions.push(x, y, 0.02)
        })

        const curveGeometry = new LineGeometry()
        curveGeometry.setPositions(positions)
        const curveMaterial = new LineMaterial({
          color: method === 'cyclic-voltammetry' ? 0x00ff00 : 0xff9800,
          linewidth: 3,
          resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        })
        const curve = new Line2(curveGeometry, curveMaterial)
        planeGroup.add(curve)
      }

      scene.add(planeGroup)
    }

    // Add particle effects for electron flow
    const particleCount = 50
    const particleGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.2
      positions[i * 3 + 1] = Math.random() * 2 - 1
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
    
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    cellGroup.add(particles)

    setIsLoading(false)
  }

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
    camera.position.set(6, 4, 6)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxDistance = 20
    controls.minDistance = 3
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controlsRef.current = controls

    // Generate data and create visualization
    generateData(method)
    create3DVisualization(scene, method)

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      const elapsedTime = clock.getElapsedTime()
      
      controls.update()
      
      // Animate particles
      const particles = scene.getObjectByName('particles')
      if (particles && particles instanceof THREE.Points) {
        const positions = particles.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < positions.length / 3; i++) {
          positions[i * 3 + 1] += 0.01
          if (positions[i * 3 + 1] > 1) {
            positions[i * 3 + 1] = -1
          }
        }
        particles.geometry.attributes.position.needsUpdate = true
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

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      controls.dispose()
    }
  }, [method])

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">Loading Visualization...</div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 text-xs text-gray-400">
        <div>Method: {method}</div>
        <div>Click and drag to rotate</div>
      </div>
    </div>
  )
}