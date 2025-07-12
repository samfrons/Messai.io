'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function SimpleBioreactorModel() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    )
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    mountRef.current.appendChild(renderer.domElement)

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 5, 5)
    scene.add(light)
    scene.add(new THREE.AmbientLight(0x404040))

    // Simple bioreactor geometry
    // Chamber
    const chamberGeometry = new THREE.BoxGeometry(3, 2, 2)
    const chamberMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2196f3,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0.1,
    })
    const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial)
    scene.add(chamber)

    // Anode
    const anodeGeometry = new THREE.BoxGeometry(0.1, 1.5, 1.5)
    const anodeMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
    const anode = new THREE.Mesh(anodeGeometry, anodeMaterial)
    anode.position.x = -1
    scene.add(anode)

    // Cathode
    const cathodeGeometry = new THREE.BoxGeometry(0.1, 1.5, 1.5)
    const cathodeMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 })
    const cathode = new THREE.Mesh(cathodeGeometry, cathodeMaterial)
    cathode.position.x = 1
    scene.add(cathode)

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)
      chamber.rotation.y += 0.005
      anode.rotation.y += 0.005
      cathode.rotation.y += 0.005
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return <div ref={mountRef} className="w-full h-full" />
}