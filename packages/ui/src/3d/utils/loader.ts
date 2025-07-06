/**
 * Three.js loader utilities
 */

let threeModule: any = null;
let loadPromise: Promise<any> | null = null;

/**
 * Load Three.js library dynamically
 */
export async function loadThree(): Promise<any> {
  // Return cached module if already loaded
  if (threeModule) {
    return threeModule;
  }

  // Return existing promise if loading is in progress
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise(async (resolve, reject) => {
    try {
      // Try to load from npm first
      threeModule = await import('three');
      resolve(threeModule);
    } catch (error) {
      console.warn('Failed to load Three.js from npm, trying CDN fallback:', error);
      
      // Fallback to CDN
      try {
        await loadThreeFromCDN();
        threeModule = (window as any).THREE;
        if (!threeModule) {
          throw new Error('Three.js failed to load from CDN');
        }
        resolve(threeModule);
      } catch (cdnError) {
        reject(cdnError);
      }
    }
  });

  return loadPromise;
}

/**
 * Load Three.js from CDN
 */
async function loadThreeFromCDN(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).THREE) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
    script.async = true;
    
    script.onload = () => {
      if (!(window as any).THREE) {
        reject(new Error('Three.js loaded but not available on window'));
      } else {
        resolve();
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Three.js from CDN'));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Load OrbitControls
 */
export async function loadOrbitControls(THREE: any): Promise<any> {
  try {
    // Try to load from npm
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
    return OrbitControls;
  } catch (error) {
    console.warn('Failed to load OrbitControls from npm:', error);
    
    // For CDN version, OrbitControls might need manual implementation
    // Return a basic implementation
    return createBasicOrbitControls(THREE);
  }
}

/**
 * Create basic orbit controls implementation
 */
function createBasicOrbitControls(THREE: any) {
  return class BasicOrbitControls {
    camera: any;
    domElement: HTMLElement;
    enabled = true;
    enableDamping = true;
    dampingFactor = 0.05;
    enableZoom = true;
    enableRotate = true;
    enablePan = true;
    
    private spherical = new THREE.Spherical();
    private sphericalDelta = new THREE.Spherical();
    private scale = 1;
    private panOffset = new THREE.Vector3();
    private rotateStart = new THREE.Vector2();
    private rotateEnd = new THREE.Vector2();
    private rotateDelta = new THREE.Vector2();

    constructor(camera: any, domElement: HTMLElement) {
      this.camera = camera;
      this.domElement = domElement;
      
      this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
      this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
      this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this));
      this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this));
    }

    update() {
      const position = this.camera.position;
      
      // Apply spherical coordinates
      this.spherical.setFromVector3(position);
      this.spherical.theta += this.sphericalDelta.theta;
      this.spherical.phi += this.sphericalDelta.phi;
      
      // Restrict phi to be between desired limits
      this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));
      
      this.spherical.radius *= this.scale;
      this.spherical.radius = Math.max(2, Math.min(20, this.spherical.radius));
      
      position.setFromSpherical(this.spherical);
      position.add(this.panOffset);
      
      this.camera.lookAt(0, 0, 0);
      
      // Damping
      if (this.enableDamping) {
        this.sphericalDelta.theta *= (1 - this.dampingFactor);
        this.sphericalDelta.phi *= (1 - this.dampingFactor);
      } else {
        this.sphericalDelta.set(0, 0, 0);
      }
      
      this.scale = 1;
      this.panOffset.set(0, 0, 0);
    }

    private onMouseDown(event: MouseEvent) {
      if (!this.enabled || !this.enableRotate) return;
      
      this.rotateStart.set(event.clientX, event.clientY);
      
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
      document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    private onMouseMove(event: MouseEvent) {
      if (!this.enabled || !this.enableRotate) return;
      
      this.rotateEnd.set(event.clientX, event.clientY);
      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
      
      const element = this.domElement;
      this.sphericalDelta.theta -= 2 * Math.PI * this.rotateDelta.x / element.clientHeight;
      this.sphericalDelta.phi -= 2 * Math.PI * this.rotateDelta.y / element.clientHeight;
      
      this.rotateStart.copy(this.rotateEnd);
      this.update();
    }

    private onMouseUp() {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }

    private onMouseWheel(event: WheelEvent) {
      if (!this.enabled || !this.enableZoom) return;
      
      event.preventDefault();
      
      if (event.deltaY < 0) {
        this.scale *= 0.95;
      } else {
        this.scale *= 1.05;
      }
      
      this.update();
    }

    private onTouchStart(event: TouchEvent) {
      if (!this.enabled) return;
      
      if (event.touches.length === 1 && this.enableRotate) {
        this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
      }
    }

    private onTouchMove(event: TouchEvent) {
      if (!this.enabled) return;
      
      event.preventDefault();
      
      if (event.touches.length === 1 && this.enableRotate) {
        this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
        
        const element = this.domElement;
        this.sphericalDelta.theta -= 2 * Math.PI * this.rotateDelta.x / element.clientHeight;
        this.sphericalDelta.phi -= 2 * Math.PI * this.rotateDelta.y / element.clientHeight;
        
        this.rotateStart.copy(this.rotateEnd);
        this.update();
      }
    }

    dispose() {
      this.domElement.removeEventListener('mousedown', this.onMouseDown);
      this.domElement.removeEventListener('wheel', this.onMouseWheel);
      this.domElement.removeEventListener('touchstart', this.onTouchStart);
      this.domElement.removeEventListener('touchmove', this.onTouchMove);
    }
  };
}