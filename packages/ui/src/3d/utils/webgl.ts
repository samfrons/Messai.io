/**
 * WebGL detection and capability utilities
 */

export interface WebGLCapabilities {
  supported: boolean;
  version: 1 | 2 | 0;
  maxTextureSize: number;
  maxCubeMapSize: number;
  maxRenderbufferSize: number;
  maxVertexAttributes: number;
  maxVertexTextureImageUnits: number;
  maxTextureImageUnits: number;
  maxFragmentUniformVectors: number;
  maxVertexUniformVectors: number;
  renderer: string;
  vendor: string;
}

/**
 * Check if WebGL is supported
 */
export function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || 
       canvas.getContext('webgl') || 
       canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

/**
 * Get detailed WebGL capabilities
 */
export function getWebGLCapabilities(): WebGLCapabilities {
  const capabilities: WebGLCapabilities = {
    supported: false,
    version: 0,
    maxTextureSize: 0,
    maxCubeMapSize: 0,
    maxRenderbufferSize: 0,
    maxVertexAttributes: 0,
    maxVertexTextureImageUnits: 0,
    maxTextureImageUnits: 0,
    maxFragmentUniformVectors: 0,
    maxVertexUniformVectors: 0,
    renderer: 'unknown',
    vendor: 'unknown'
  };

  try {
    const canvas = document.createElement('canvas');
    let gl = canvas.getContext('webgl2');
    let version = 2;

    if (!gl) {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as any;
      version = 1;
    }

    if (!gl) {
      return capabilities;
    }

    capabilities.supported = true;
    capabilities.version = version as 1 | 2;
    
    // Get capabilities
    capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    capabilities.maxCubeMapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    capabilities.maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    capabilities.maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    capabilities.maxVertexTextureImageUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    capabilities.maxTextureImageUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    capabilities.maxFragmentUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
    capabilities.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);

    // Get renderer info
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      capabilities.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      capabilities.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    }

    // Clean up
    const loseContext = gl.getExtension('WEBGL_lose_context');
    if (loseContext) {
      loseContext.loseContext();
    }

  } catch (e) {
    console.error('Error detecting WebGL capabilities:', e);
  }

  return capabilities;
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Get recommended quality settings based on device capabilities
 */
export function getQualitySettings(capabilities: WebGLCapabilities) {
  const isMobile = isMobileDevice();
  const hasHighEndGPU = capabilities.maxTextureSize >= 8192;

  if (!capabilities.supported) {
    return null;
  }

  if (isMobile || capabilities.maxTextureSize < 4096) {
    return {
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
      shadowMapSize: 512,
      antialias: false,
      quality: 'low'
    };
  }

  if (hasHighEndGPU && capabilities.version === 2) {
    return {
      pixelRatio: window.devicePixelRatio,
      shadowMapSize: 2048,
      antialias: true,
      quality: 'high'
    };
  }

  return {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    shadowMapSize: 1024,
    antialias: true,
    quality: 'medium'
  };
}