import { describe, it, expect } from 'vitest'
import * as THREE from 'three'

describe('Three.js Namespace Tests', () => {
  it('should have Points constructor in THREE namespace', () => {
    expect(THREE.Points).toBeDefined()
    expect(typeof THREE.Points).toBe('function')
  })

  it('should create Points object correctly', () => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array([0, 0, 0, 1, 1, 1, 2, 2, 2])
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const material = new THREE.PointsMaterial({ size: 0.1 })
    const points = new THREE.Points(geometry, material)
    
    expect(points).toBeInstanceOf(THREE.Points)
    expect(points.geometry).toBe(geometry)
    expect(points.material).toBe(material)
  })

  it('should have correct TypeScript types', () => {
    // This test validates TypeScript compilation
    const testFunction = (points: THREE.Points): void => {
      const position = points.position
      expect(position).toBeInstanceOf(THREE.Vector3)
    }

    const points = new THREE.Points()
    testFunction(points)
  })

  it('should support buffer attribute updates', () => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(9)
    const posAttr = new THREE.BufferAttribute(positions, 3)
    geometry.setAttribute('position', posAttr)
    
    // Update positions
    positions[0] = 1
    positions[1] = 2
    positions[2] = 3
    posAttr.needsUpdate = true
    
    expect(geometry.attributes.position.array[0]).toBe(1)
    expect(geometry.attributes.position.array[1]).toBe(2)
    expect(geometry.attributes.position.array[2]).toBe(3)
  })
})