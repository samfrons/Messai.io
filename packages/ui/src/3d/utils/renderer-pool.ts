/**
 * WebGL Renderer Pool
 * Manages a pool of renderers to avoid WebGL context limit
 */

interface RendererInfo {
  renderer: any;
  canvas: HTMLCanvasElement;
  useCount: number;
  lastUsed: number;
}

class RendererPool {
  private static instance: RendererPool;
  private renderers: Map<string, RendererInfo> = new Map();
  private maxRenderers = 8; // WebGL typically limits to 16 contexts, we'll use half
  
  private constructor() {}

  static getInstance(): RendererPool {
    if (!RendererPool.instance) {
      RendererPool.instance = new RendererPool();
    }
    return RendererPool.instance;
  }

  /**
   * Get or create a renderer for the given container
   */
  async getRenderer(
    containerId: string,
    container: HTMLElement,
    THREE: any,
    options: {
      antialias?: boolean;
      alpha?: boolean;
      powerPreference?: string;
      pixelRatio?: number;
    } = {}
  ): Promise<{ renderer: any; canvas: HTMLCanvasElement; isNew: boolean }> {
    // Check if we already have a renderer for this container
    const existing = this.renderers.get(containerId);
    if (existing) {
      existing.useCount++;
      existing.lastUsed = Date.now();
      return { 
        renderer: existing.renderer, 
        canvas: existing.canvas,
        isNew: false 
      };
    }

    // If we're at the limit, remove the least recently used
    if (this.renderers.size >= this.maxRenderers) {
      this.removeLeastRecentlyUsed();
    }

    // Create new renderer
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: options.antialias ?? true,
      alpha: options.alpha ?? true,
      powerPreference: options.powerPreference ?? 'high-performance',
      preserveDrawingBuffer: true,
    });

    renderer.setPixelRatio(options.pixelRatio ?? Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Store renderer info
    const info: RendererInfo = {
      renderer,
      canvas,
      useCount: 1,
      lastUsed: Date.now(),
    };

    this.renderers.set(containerId, info);
    container.appendChild(canvas);

    return { renderer, canvas, isNew: true };
  }

  /**
   * Release a renderer
   */
  releaseRenderer(containerId: string): void {
    const info = this.renderers.get(containerId);
    if (info) {
      info.useCount--;
      
      // If no longer in use, mark for potential removal
      if (info.useCount <= 0) {
        info.lastUsed = Date.now() - 60000; // Mark as old
      }
    }
  }

  /**
   * Dispose a renderer completely
   */
  disposeRenderer(containerId: string): void {
    const info = this.renderers.get(containerId);
    if (info) {
      // Dispose Three.js resources
      info.renderer.dispose();
      info.renderer.forceContextLoss();
      
      // Remove canvas from DOM
      if (info.canvas.parentElement) {
        info.canvas.parentElement.removeChild(info.canvas);
      }
      
      // Remove from pool
      this.renderers.delete(containerId);
    }
  }

  /**
   * Remove least recently used renderer
   */
  private removeLeastRecentlyUsed(): void {
    let oldestId: string | null = null;
    let oldestTime = Date.now();

    // Find renderer with oldest lastUsed time and no active uses
    for (const [id, info] of this.renderers) {
      if (info.useCount === 0 && info.lastUsed < oldestTime) {
        oldestTime = info.lastUsed;
        oldestId = id;
      }
    }

    // If all are in use, force remove the oldest one
    if (!oldestId) {
      for (const [id, info] of this.renderers) {
        if (info.lastUsed < oldestTime) {
          oldestTime = info.lastUsed;
          oldestId = id;
        }
      }
    }

    if (oldestId) {
      console.warn(`Disposing old WebGL context: ${oldestId}`);
      this.disposeRenderer(oldestId);
    }
  }

  /**
   * Dispose all renderers
   */
  disposeAll(): void {
    for (const id of this.renderers.keys()) {
      this.disposeRenderer(id);
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      activeRenderers: this.renderers.size,
      maxRenderers: this.maxRenderers,
      renderers: Array.from(this.renderers.entries()).map(([id, info]) => ({
        id,
        useCount: info.useCount,
        age: Date.now() - info.lastUsed,
      })),
    };
  }
}

export const rendererPool = RendererPool.getInstance();