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
        
        // Core WebGL methods
        getExtension: (name: string) => {
          if (name === 'WEBGL_debug_renderer_info') return { UNMASKED_RENDERER_WEBGL: 37446, UNMASKED_VENDOR_WEBGL: 37445 };
          if (name === 'EXT_texture_filter_anisotropic') return { MAX_TEXTURE_MAX_ANISOTROPY_EXT: 34047, TEXTURE_MAX_ANISOTROPY_EXT: 34046 };
          if (name === 'WEBGL_lose_context') return { loseContext: () => {}, restoreContext: () => {} };
          if (name === 'OES_vertex_array_object') return { createVertexArrayOES: () => ({}), deleteVertexArrayOES: () => {}, bindVertexArrayOES: () => {} };
          return null;
        },
        
        getParameter: (pname: number) => {
          // Handle the case where pname is undefined (this was causing the error)
          if (pname === undefined || pname === null) {
            return 'OpenGL ES 2.0 (Mock Context)'; // Return a safe default string
          }
          
          // Common WebGL parameters
          if (pname === 7938) return 'Mock WebGL Renderer'; // GL_RENDERER
          if (pname === 7937) return 'Mock WebGL Vendor'; // GL_VENDOR
          if (pname === 7936) return 'OpenGL ES 2.0 (Mock Context)'; // GL_VERSION
          if (pname === 35724) return 'WebGL GLSL ES 3.00 (Mock)'; // GL_SHADING_LANGUAGE_VERSION
          if (pname === 3379) return 16; // GL_MAX_TEXTURE_SIZE
          if (pname === 34076) return 32; // GL_MAX_CUBE_MAP_TEXTURE_SIZE
          if (pname === 34024) return 16; // GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS
          if (pname === 34930) return 16; // GL_MAX_FRAGMENT_UNIFORM_VECTORS
          if (pname === 36347) return 30; // GL_MAX_VARYING_VECTORS
          if (pname === 36348) return 128; // GL_MAX_VERTEX_UNIFORM_VECTORS
          if (pname === 34921) return 16; // GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS
          if (pname === 3386) return new Int32Array([1024, 1024]); // GL_MAX_VIEWPORT_DIMS
          
          // Return a safe default for unknown parameters
          return 1;
        },
        
        // Critical missing method that was causing failures
        getShaderPrecisionFormat: (shaderType: number, precisionType: number) => ({
          precision: 23,
          rangeMax: 127,
          rangeMin: -127
        }),
        
        // Context attributes
        getContextAttributes: () => ({
          alpha: true,
          antialias: true,
          depth: true,
          premultipliedAlpha: true,
          preserveDrawingBuffer: false,
          stencil: false,
          desynchronized: false,
          failIfMajorPerformanceCaveat: false,
          powerPreference: 'default'
        }),
        
        // Supported extensions
        getSupportedExtensions: () => [
          'WEBGL_debug_renderer_info',
          'EXT_texture_filter_anisotropic',
          'WEBGL_lose_context',
          'OES_vertex_array_object'
        ],
        
        // Shader operations
        createShader: () => ({ type: 'shader' }),
        createProgram: () => ({ type: 'program' }),
        attachShader: () => {},
        linkProgram: () => {},
        useProgram: () => {},
        shaderSource: () => {}, // Critical missing method for shader compilation
        getShaderParameter: () => true,
        getProgramParameter: () => true,
        getShaderInfoLog: () => '',
        getProgramInfoLog: () => '',
        compileShader: () => {},
        deleteShader: () => {},
        deleteProgram: () => {},
        detachShader: () => {},
        isShader: () => false,
        isProgram: () => false,
        
        // Buffer operations
        createBuffer: () => ({ type: 'buffer' }),
        bindBuffer: () => {},
        bufferData: () => {},
        deleteBuffer: () => {},
        
        // Vertex operations
        enableVertexAttribArray: () => {},
        disableVertexAttribArray: () => {},
        vertexAttribPointer: () => {},
        getAttribLocation: () => 0,
        
        // Uniform operations
        uniform1f: () => {},
        uniform1i: () => {},
        uniform2f: () => {},
        uniform3f: () => {},
        uniform4f: () => {},
        uniformMatrix3fv: () => {},
        uniformMatrix4fv: () => {},
        getUniformLocation: () => ({ location: 'mock' }),
        getActiveUniform: (program: any, index: number) => ({
          name: `uniform_${index}`,
          type: 35678, // GL_FLOAT_VEC4
          size: 1
        }),
        getActiveAttrib: (program: any, index: number) => ({
          name: `attribute_${index}`,
          type: 35678, // GL_FLOAT_VEC4
          size: 1
        }),
        
        // Texture operations
        createTexture: () => ({ type: 'texture' }),
        bindTexture: () => {},
        texImage2D: () => {},
        texImage3D: () => {}, // WebGL 2.0 method
        texParameteri: () => {},
        generateMipmap: () => {},
        activeTexture: () => {},
        deleteTexture: () => {},
        
        // Framebuffer operations
        createFramebuffer: () => ({ type: 'framebuffer' }),
        bindFramebuffer: () => {},
        framebufferTexture2D: () => {},
        checkFramebufferStatus: () => 36053, // GL_FRAMEBUFFER_COMPLETE
        deleteFramebuffer: () => {},
        
        // Renderbuffer operations
        createRenderbuffer: () => ({ type: 'renderbuffer' }),
        bindRenderbuffer: () => {},
        renderbufferStorage: () => {},
        framebufferRenderbuffer: () => {},
        deleteRenderbuffer: () => {},
        
        // Drawing operations
        drawArrays: () => {},
        drawElements: () => {},
        drawBuffers: () => {}, // WebGL 2.0 method for multiple render targets
        
        // State management
        enable: () => {},
        disable: () => {},
        depthFunc: () => {},
        depthMask: () => {},
        cullFace: () => {},
        frontFace: () => {},
        blendFunc: () => {},
        blendFuncSeparate: () => {}, // Advanced blending for RGB and Alpha separately
        blendEquation: () => {},
        blendEquationSeparate: () => {},
        
        // Clear operations
        clearColor: () => {},
        clearDepth: () => {},
        clearStencil: () => {},
        clear: () => {},
        
        // Viewport and scissor operations
        viewport: () => {},
        scissor: () => {},
        
        // Error handling
        getError: () => 0, // GL_NO_ERROR
        
        // Context state
        isContextLost: () => false,
        finish: () => {},
        flush: () => {},
        
        // Additional commonly used WebGL methods for Three.js
        stencilFunc: () => {},
        stencilMask: () => {},
        stencilOp: () => {},
        colorMask: () => {},
        polygonOffset: () => {},
        lineWidth: () => {},
        pixelStorei: () => {},
        readPixels: () => {},
        copyTexImage2D: () => {},
        copyTexSubImage2D: () => {},
        texSubImage2D: () => {},
        compressedTexImage2D: () => {},
        compressedTexSubImage2D: () => {},
        
        // Transform feedback (WebGL 2.0)
        transformFeedbackVaryings: () => {},
        beginTransformFeedback: () => {},
        endTransformFeedback: () => {},
        pauseTransformFeedback: () => {},
        resumeTransformFeedback: () => {},
        
        // Compute shader support (WebGL 2.0)
        dispatchCompute: () => {},
        memoryBarrier: () => {},
        
        // Instanced rendering
        drawArraysInstanced: () => {},
        drawElementsInstanced: () => {},
        vertexAttribDivisor: () => {},
        
        // Query objects
        createQuery: () => ({ type: 'query' }),
        deleteQuery: () => {},
        beginQuery: () => {},
        endQuery: () => {},
        getQuery: () => null,
        getQueryParameter: () => 1,
        
        // Sync objects
        fenceSync: () => ({ type: 'sync' }),
        deleteSync: () => {},
        clientWaitSync: () => 1, // GL_ALREADY_SIGNALED
        waitSync: () => {},
        getSyncParameter: () => 1,
        
        // Sampler objects
        createSampler: () => ({ type: 'sampler' }),
        deleteSampler: () => {},
        bindSampler: () => {},
        samplerParameteri: () => {},
        samplerParameterf: () => {},
        getSamplerParameter: () => 1,
        
        // Vertex array objects
        createVertexArray: () => ({ type: 'vertexArray' }),
        deleteVertexArray: () => {},
        bindVertexArray: () => {},
        isVertexArray: () => false,
        
        // Transform feedback objects  
        createTransformFeedback: () => ({ type: 'transformFeedback' }),
        deleteTransformFeedback: () => {},
        bindTransformFeedback: () => {},
        isTransformFeedback: () => false,
        
        // Constants for common WebGL values
        VERTEX_SHADER: 35633,
        FRAGMENT_SHADER: 35632,
        ARRAY_BUFFER: 34962,
        ELEMENT_ARRAY_BUFFER: 34963,
        STATIC_DRAW: 35044,
        DYNAMIC_DRAW: 35048,
        TRIANGLES: 4,
        UNSIGNED_SHORT: 5123,
        FLOAT: 5126,
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
        TEXTURE_2D: 3553,
        TEXTURE_CUBE_MAP: 34067,
        DEPTH_TEST: 2929,
        CULL_FACE: 2884,
        BLEND: 3042,
        COLOR_BUFFER_BIT: 16384,
        DEPTH_BUFFER_BIT: 256,
        
        // Critical constants for Three.js WebGL state detection
        VERSION: 7936,
        RENDERER: 7938,
        VENDOR: 7937,
        SHADING_LANGUAGE_VERSION: 35724,
        MAX_TEXTURE_SIZE: 3379,
        MAX_CUBE_MAP_TEXTURE_SIZE: 34076,
        MAX_VERTEX_TEXTURE_IMAGE_UNITS: 34024,
        MAX_FRAGMENT_UNIFORM_VECTORS: 34930,
        MAX_VARYING_VECTORS: 36347,
        MAX_VERTEX_UNIFORM_VECTORS: 36348,
        MAX_COMBINED_TEXTURE_IMAGE_UNITS: 34921,
        MAX_VIEWPORT_DIMS: 3386
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