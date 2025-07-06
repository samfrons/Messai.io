/**
 * Performance monitoring and optimization utilities for 3D rendering
 */

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private frameTimeHistory: number[] = [];
  private readonly historySize = 60;
  
  private memoryUsage = {
    geometries: 0,
    textures: 0,
    total: 0
  };

  /**
   * Update FPS calculation
   */
  update(): void {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    // Track frame time history
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > this.historySize) {
      this.frameTimeHistory.shift();
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Get average frame time
   */
  getAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) return 0;
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    return sum / this.frameTimeHistory.length;
  }

  /**
   * Check if performance is below threshold
   */
  isPerformanceLow(threshold = 30): boolean {
    return this.fps < threshold;
  }

  /**
   * Update memory usage stats
   */
  updateMemoryUsage(renderer: any): void {
    if (!renderer || !renderer.info) return;

    const info = renderer.info;
    this.memoryUsage = {
      geometries: info.memory.geometries || 0,
      textures: info.memory.textures || 0,
      total: info.memory.geometries + info.memory.textures
    };
  }

  /**
   * Get memory usage stats
   */
  getMemoryUsage() {
    return { ...this.memoryUsage };
  }

  /**
   * Get performance report
   */
  getReport() {
    return {
      fps: this.fps,
      averageFrameTime: this.getAverageFrameTime(),
      memory: this.getMemoryUsage(),
      isLowPerformance: this.isPerformanceLow()
    };
  }
}

/**
 * Adaptive quality manager
 */
export class AdaptiveQuality {
  private qualityLevel: 'low' | 'medium' | 'high' = 'medium';
  private monitor: PerformanceMonitor;
  private autoAdjust = true;
  private adjustmentCooldown = 0;
  private readonly cooldownFrames = 120; // 2 seconds at 60fps

  constructor(monitor: PerformanceMonitor, initialQuality?: 'low' | 'medium' | 'high') {
    this.monitor = monitor;
    if (initialQuality) {
      this.qualityLevel = initialQuality;
    }
  }

  /**
   * Update quality based on performance
   */
  update(): void {
    if (!this.autoAdjust || this.adjustmentCooldown > 0) {
      this.adjustmentCooldown--;
      return;
    }

    const fps = this.monitor.getFPS();
    
    // Decrease quality if FPS is too low
    if (fps < 25 && this.qualityLevel !== 'low') {
      this.decreaseQuality();
      this.adjustmentCooldown = this.cooldownFrames;
    }
    // Increase quality if FPS is consistently high
    else if (fps > 55 && this.qualityLevel !== 'high') {
      this.increaseQuality();
      this.adjustmentCooldown = this.cooldownFrames;
    }
  }

  /**
   * Decrease quality level
   */
  decreaseQuality(): void {
    if (this.qualityLevel === 'high') {
      this.qualityLevel = 'medium';
    } else if (this.qualityLevel === 'medium') {
      this.qualityLevel = 'low';
    }
  }

  /**
   * Increase quality level
   */
  increaseQuality(): void {
    if (this.qualityLevel === 'low') {
      this.qualityLevel = 'medium';
    } else if (this.qualityLevel === 'medium') {
      this.qualityLevel = 'high';
    }
  }

  /**
   * Get current quality settings
   */
  getQualitySettings() {
    const settings = {
      low: {
        pixelRatio: 1,
        shadowMapSize: 512,
        antialias: false,
        shadowsEnabled: false,
        postProcessing: false,
        maxLights: 2
      },
      medium: {
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        shadowMapSize: 1024,
        antialias: true,
        shadowsEnabled: true,
        postProcessing: false,
        maxLights: 4
      },
      high: {
        pixelRatio: window.devicePixelRatio,
        shadowMapSize: 2048,
        antialias: true,
        shadowsEnabled: true,
        postProcessing: true,
        maxLights: 8
      }
    };

    return settings[this.qualityLevel];
  }

  /**
   * Get current quality level
   */
  getQualityLevel() {
    return this.qualityLevel;
  }

  /**
   * Set auto-adjust enabled/disabled
   */
  setAutoAdjust(enabled: boolean): void {
    this.autoAdjust = enabled;
  }
}

/**
 * Resource disposal helper
 */
export function disposeObject(object: any): void {
  if (!object) return;

  // Dispose geometry
  if (object.geometry) {
    object.geometry.dispose();
  }

  // Dispose material(s)
  if (object.material) {
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material: any) => {
      // Dispose textures
      Object.keys(material).forEach(key => {
        const value = material[key];
        if (value && typeof value.dispose === 'function') {
          value.dispose();
        }
      });
      material.dispose();
    });
  }

  // Recursively dispose children
  if (object.children) {
    object.children.forEach((child: any) => disposeObject(child));
  }
}

/**
 * Dispose entire Three.js scene
 */
export function disposeScene(scene: any, renderer: any): void {
  if (scene) {
    scene.traverse((object: any) => disposeObject(object));
    scene.clear();
  }

  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
  }
}