// Mock WebGL context for testing
import { vi } from 'vitest'

// Mock WebGL
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  getExtension: vi.fn(),
  getParameter: vi.fn(() => 16384), // MAX_TEXTURE_SIZE
  createTexture: vi.fn(),
  bindTexture: vi.fn(),
  texParameteri: vi.fn(),
  texImage2D: vi.fn(),
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  uniformMatrix4fv: vi.fn(),
  viewport: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
  drawArrays: vi.fn(),
  createFramebuffer: vi.fn(),
  framebufferTexture2D: vi.fn(),
  createRenderbuffer: vi.fn(),
  renderbufferStorage: vi.fn(),
  framebufferRenderbuffer: vi.fn(),
  generateMipmap: vi.fn(),
  getShaderParameter: vi.fn(() => true),
  getProgramParameter: vi.fn(() => true),
  getActiveAttrib: vi.fn(),
  getActiveUniform: vi.fn(),
  getUniformLocation: vi.fn(),
  getAttribLocation: vi.fn(),
  deleteShader: vi.fn(),
  deleteProgram: vi.fn(),
  deleteTexture: vi.fn(),
  deleteBuffer: vi.fn(),
}))

// Mock performance.memory for performance monitoring
Object.defineProperty(performance, 'memory', {
  value: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024,
    jsHeapSizeLimit: 2048 * 1024 * 1024
  },
  writable: true
})