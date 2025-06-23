import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

// Setup MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => server.close())

// Mock Three.js for testing
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock WebGL context for Three.js
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: (contextType: string) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return {
        canvas: {},
        drawingBufferWidth: 800,
        drawingBufferHeight: 600,
        getExtension: () => null,
        getParameter: () => null,
        createShader: () => ({}),
        createProgram: () => ({}),
        attachShader: () => {},
        linkProgram: () => {},
        useProgram: () => {},
        createBuffer: () => ({}),
        bindBuffer: () => {},
        bufferData: () => {},
        enableVertexAttribArray: () => {},
        vertexAttribPointer: () => {},
        uniform1f: () => {},
        uniformMatrix4fv: () => {},
        drawArrays: () => {},
        enable: () => {},
        depthFunc: () => {},
        clearColor: () => {},
        clear: () => {},
        viewport: () => {},
        deleteShader: () => {},
        deleteProgram: () => {},
        deleteBuffer: () => {},
        getShaderParameter: () => true,
        getProgramParameter: () => true,
        isContextLost: () => false
      }
    }
    return null
  }
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16)
}

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id)
}