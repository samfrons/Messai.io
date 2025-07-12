'use strict';

var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');
var React2 = require('react');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React2__default = /*#__PURE__*/_interopDefault(React2);

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
function cn(...inputs) {
  return tailwindMerge.twMerge(clsx.clsx(inputs));
}
var Button = React2__default.default.forwardRef(
  (_a, ref) => {
    var _b = _a, {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      children,
      disabled
    } = _b, props = __objRest(_b, [
      "className",
      "variant",
      "size",
      "loading",
      "icon",
      "iconPosition",
      "children",
      "disabled"
    ]);
    const variants = {
      primary: [
        "bg-primary-500 text-white",
        "hover:bg-primary-600",
        "focus:ring-primary-500",
        "disabled:bg-primary-500/50"
      ],
      secondary: [
        "bg-white dark:bg-gray-800",
        "text-gray-900 dark:text-gray-100",
        "border border-gray-300 dark:border-gray-600",
        "hover:bg-gray-50 dark:hover:bg-gray-700",
        "focus:ring-gray-500"
      ],
      ghost: [
        "text-gray-700 dark:text-gray-300",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "focus:ring-gray-500"
      ],
      danger: [
        "bg-error-light dark:bg-error-dark text-white",
        "hover:bg-red-600 dark:hover:bg-red-700",
        "focus:ring-red-500"
      ]
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg"
    };
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      __spreadProps(__spreadValues({
        ref,
        className: cn(
          // Base styles
          "inline-flex items-center justify-center rounded-md font-medium",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Variant styles
          variants[variant],
          // Size styles
          sizes[size],
          // Loading state
          loading && "relative cursor-wait",
          className
        ),
        disabled: disabled || loading
      }, props), {
        children: [
          loading && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsxs(
            "svg",
            {
              className: "animate-spin h-4 w-4",
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(
                  "circle",
                  {
                    className: "opacity-25",
                    cx: "12",
                    cy: "12",
                    r: "10",
                    stroke: "currentColor",
                    strokeWidth: "4"
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(
                  "path",
                  {
                    className: "opacity-75",
                    fill: "currentColor",
                    d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  }
                )
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: cn(
            "inline-flex items-center",
            loading && "invisible"
          ), children: [
            icon && iconPosition === "left" && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mr-2", children: icon }),
            children,
            icon && iconPosition === "right" && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "ml-2", children: icon })
          ] })
        ]
      })
    );
  }
);
Button.displayName = "Button";
var Card = React2__default.default.forwardRef(
  (_a, ref) => {
    var _b = _a, { className, variant = "default", padding = "md", children } = _b, props = __objRest(_b, ["className", "variant", "padding", "children"]);
    const variants = {
      default: [
        "bg-white dark:bg-gray-800",
        "border border-gray-200 dark:border-gray-700",
        "shadow-sm"
      ],
      chat: [
        "bg-gray-50 dark:bg-gray-700",
        "border border-gray-100 dark:border-gray-600",
        "shadow-chat"
      ],
      hover: [
        "bg-white dark:bg-gray-800",
        "border border-gray-200 dark:border-gray-700",
        "shadow-sm hover:shadow-md",
        "transition-shadow duration-200",
        "cursor-pointer"
      ]
    };
    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6"
    };
    return /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      __spreadProps(__spreadValues({
        ref,
        className: cn(
          "rounded-lg",
          variants[variant],
          paddings[padding],
          className
        )
      }, props), {
        children
      })
    );
  }
);
Card.displayName = "Card";
var CardHeader = React2__default.default.forwardRef((_a, ref) => {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    __spreadValues({
      ref,
      className: cn("mb-4 pb-4 border-b border-gray-200 dark:border-gray-700", className)
    }, props)
  );
});
CardHeader.displayName = "CardHeader";
var CardTitle = React2__default.default.forwardRef((_a, ref) => {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "h3",
    __spreadValues({
      ref,
      className: cn("text-lg font-semibold text-gray-900 dark:text-gray-100", className)
    }, props)
  );
});
CardTitle.displayName = "CardTitle";
var CardContent = React2__default.default.forwardRef((_a, ref) => {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsxRuntime.jsx("div", __spreadValues({ ref, className: cn("text-gray-700 dark:text-gray-300", className) }, props));
});
CardContent.displayName = "CardContent";
var Input = React2__default.default.forwardRef(
  (_a, ref) => {
    var _b = _a, { className, label, error, hint, icon, iconPosition = "left" } = _b, props = __objRest(_b, ["className", "label", "error", "hint", "icon", "iconPosition"]);
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "w-full", children: [
      label && /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: label }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
        icon && iconPosition === "left" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-gray-500 dark:text-gray-400 sm:text-sm", children: icon }) }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          __spreadValues({
            ref,
            className: cn(
              // Base styles
              "block w-full rounded-md border-0 py-2.5 text-gray-900 dark:text-gray-100",
              "bg-white dark:bg-gray-800",
              "ring-1 ring-inset",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "focus:ring-2 focus:ring-inset",
              "sm:text-sm sm:leading-6",
              "transition-colors duration-200",
              // Normal state
              !error && [
                "ring-gray-300 dark:ring-gray-600",
                "focus:ring-primary-500"
              ],
              // Error state
              error && [
                "ring-red-300 dark:ring-red-600",
                "focus:ring-red-500"
              ],
              // Icon padding
              icon && iconPosition === "left" && "pl-10",
              icon && iconPosition === "right" && "pr-10",
              !icon && "px-3",
              className
            ),
            "aria-invalid": !!error,
            "aria-describedby": error ? "error-message" : hint ? "hint-message" : void 0
          }, props)
        ),
        icon && iconPosition === "right" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-gray-500 dark:text-gray-400 sm:text-sm", children: icon }) })
      ] }),
      error && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", id: "error-message", children: error }),
      hint && !error && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", id: "hint-message", children: hint })
    ] });
  }
);
Input.displayName = "Input";
var Textarea = React2__default.default.forwardRef(
  (_a, ref) => {
    var _b = _a, { className, label, error, hint } = _b, props = __objRest(_b, ["className", "label", "error", "hint"]);
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "w-full", children: [
      label && /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: label }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "textarea",
        __spreadValues({
          ref,
          className: cn(
            // Base styles
            "block w-full rounded-md border-0 px-3 py-2.5",
            "text-gray-900 dark:text-gray-100",
            "bg-white dark:bg-gray-800",
            "ring-1 ring-inset",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "focus:ring-2 focus:ring-inset",
            "sm:text-sm sm:leading-6",
            "transition-colors duration-200",
            "resize-y min-h-[80px]",
            // Normal state
            !error && [
              "ring-gray-300 dark:ring-gray-600",
              "focus:ring-primary-500"
            ],
            // Error state
            error && [
              "ring-red-300 dark:ring-red-600",
              "focus:ring-red-500"
            ],
            className
          ),
          "aria-invalid": !!error,
          "aria-describedby": error ? "error-message" : hint ? "hint-message" : void 0
        }, props)
      ),
      error && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", id: "error-message", children: error }),
      hint && !error && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", id: "hint-message", children: hint })
    ] });
  }
);
Textarea.displayName = "Textarea";

// src/3d/utils/loader.ts
var threeModule = null;
var loadPromise = null;
async function loadThree() {
  if (threeModule) {
    return threeModule;
  }
  if (loadPromise) {
    return loadPromise;
  }
  loadPromise = new Promise(async (resolve, reject) => {
    try {
      threeModule = await import('three');
      resolve(threeModule);
    } catch (error) {
      console.warn("Failed to load Three.js from npm, trying CDN fallback:", error);
      try {
        await loadThreeFromCDN();
        threeModule = window.THREE;
        if (!threeModule) {
          throw new Error("Three.js failed to load from CDN");
        }
        resolve(threeModule);
      } catch (cdnError) {
        reject(cdnError);
      }
    }
  });
  return loadPromise;
}
async function loadThreeFromCDN() {
  return new Promise((resolve, reject) => {
    if (window.THREE) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/three@0.160.0/build/three.min.js";
    script.async = true;
    script.onload = () => {
      if (!window.THREE) {
        reject(new Error("Three.js loaded but not available on window"));
      } else {
        resolve();
      }
    };
    script.onerror = () => {
      reject(new Error("Failed to load Three.js from CDN"));
    };
    document.head.appendChild(script);
  });
}
async function loadOrbitControls(THREE) {
  try {
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
    return OrbitControls;
  } catch (error) {
    console.warn("Failed to load OrbitControls from npm:", error);
    return createBasicOrbitControls(THREE);
  }
}
function createBasicOrbitControls(THREE) {
  return class BasicOrbitControls {
    constructor(camera, domElement) {
      this.enabled = true;
      this.enableDamping = true;
      this.dampingFactor = 0.05;
      this.enableZoom = true;
      this.enableRotate = true;
      this.enablePan = true;
      this.spherical = new THREE.Spherical();
      this.sphericalDelta = new THREE.Spherical();
      this.scale = 1;
      this.panOffset = new THREE.Vector3();
      this.rotateStart = new THREE.Vector2();
      this.rotateEnd = new THREE.Vector2();
      this.rotateDelta = new THREE.Vector2();
      this.camera = camera;
      this.domElement = domElement;
      this.domElement.addEventListener("mousedown", this.onMouseDown.bind(this));
      this.domElement.addEventListener("wheel", this.onMouseWheel.bind(this));
      this.domElement.addEventListener("touchstart", this.onTouchStart.bind(this));
      this.domElement.addEventListener("touchmove", this.onTouchMove.bind(this));
    }
    update() {
      const position = this.camera.position;
      this.spherical.setFromVector3(position);
      this.spherical.theta += this.sphericalDelta.theta;
      this.spherical.phi += this.sphericalDelta.phi;
      this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));
      this.spherical.radius *= this.scale;
      this.spherical.radius = Math.max(2, Math.min(20, this.spherical.radius));
      position.setFromSpherical(this.spherical);
      position.add(this.panOffset);
      this.camera.lookAt(0, 0, 0);
      if (this.enableDamping) {
        this.sphericalDelta.theta *= 1 - this.dampingFactor;
        this.sphericalDelta.phi *= 1 - this.dampingFactor;
      } else {
        this.sphericalDelta.set(0, 0, 0);
      }
      this.scale = 1;
      this.panOffset.set(0, 0, 0);
    }
    onMouseDown(event) {
      if (!this.enabled || !this.enableRotate) return;
      this.rotateStart.set(event.clientX, event.clientY);
      document.addEventListener("mousemove", this.onMouseMove.bind(this));
      document.addEventListener("mouseup", this.onMouseUp.bind(this));
    }
    onMouseMove(event) {
      if (!this.enabled || !this.enableRotate) return;
      this.rotateEnd.set(event.clientX, event.clientY);
      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
      const element = this.domElement;
      this.sphericalDelta.theta -= 2 * Math.PI * this.rotateDelta.x / element.clientHeight;
      this.sphericalDelta.phi -= 2 * Math.PI * this.rotateDelta.y / element.clientHeight;
      this.rotateStart.copy(this.rotateEnd);
      this.update();
    }
    onMouseUp() {
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.onMouseUp);
    }
    onMouseWheel(event) {
      if (!this.enabled || !this.enableZoom) return;
      event.preventDefault();
      if (event.deltaY < 0) {
        this.scale *= 0.95;
      } else {
        this.scale *= 1.05;
      }
      this.update();
    }
    onTouchStart(event) {
      if (!this.enabled) return;
      if (event.touches.length === 1 && this.enableRotate) {
        this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
      }
    }
    onTouchMove(event) {
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
      this.domElement.removeEventListener("mousedown", this.onMouseDown);
      this.domElement.removeEventListener("wheel", this.onMouseWheel);
      this.domElement.removeEventListener("touchstart", this.onTouchStart);
      this.domElement.removeEventListener("touchmove", this.onTouchMove);
    }
  };
}

// src/3d/utils/webgl.ts
function checkWebGLSupport() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}
function getWebGLCapabilities() {
  const capabilities = {
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
    renderer: "unknown",
    vendor: "unknown"
  };
  try {
    const canvas = document.createElement("canvas");
    let gl = canvas.getContext("webgl2");
    let version = 2;
    if (!gl) {
      gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      version = 1;
    }
    if (!gl) {
      return capabilities;
    }
    capabilities.supported = true;
    capabilities.version = version;
    capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    capabilities.maxCubeMapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    capabilities.maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    capabilities.maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    capabilities.maxVertexTextureImageUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    capabilities.maxTextureImageUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    capabilities.maxFragmentUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
    capabilities.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      capabilities.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      capabilities.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    }
    const loseContext = gl.getExtension("WEBGL_lose_context");
    if (loseContext) {
      loseContext.loseContext();
    }
  } catch (e) {
    console.error("Error detecting WebGL capabilities:", e);
  }
  return capabilities;
}
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
function getQualitySettings(capabilities) {
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
      quality: "low"
    };
  }
  if (hasHighEndGPU && capabilities.version === 2) {
    return {
      pixelRatio: window.devicePixelRatio,
      shadowMapSize: 2048,
      antialias: true,
      quality: "high"
    };
  }
  return {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    shadowMapSize: 1024,
    antialias: true,
    quality: "medium"
  };
}

// src/3d/utils/performance.ts
var PerformanceMonitor = class {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.frameTimeHistory = [];
    this.historySize = 60;
    this.memoryUsage = {
      geometries: 0,
      textures: 0,
      total: 0
    };
  }
  /**
   * Update FPS calculation
   */
  update() {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    if (deltaTime >= 1e3) {
      this.fps = Math.round(this.frameCount * 1e3 / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > this.historySize) {
      this.frameTimeHistory.shift();
    }
  }
  /**
   * Get current FPS
   */
  getFPS() {
    return this.fps;
  }
  /**
   * Get average frame time
   */
  getAverageFrameTime() {
    if (this.frameTimeHistory.length === 0) return 0;
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    return sum / this.frameTimeHistory.length;
  }
  /**
   * Check if performance is below threshold
   */
  isPerformanceLow(threshold = 30) {
    return this.fps < threshold;
  }
  /**
   * Update memory usage stats
   */
  updateMemoryUsage(renderer) {
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
    return __spreadValues({}, this.memoryUsage);
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
};
var AdaptiveQuality = class {
  // 2 seconds at 60fps
  constructor(monitor, initialQuality) {
    this.qualityLevel = "medium";
    this.autoAdjust = true;
    this.adjustmentCooldown = 0;
    this.cooldownFrames = 120;
    this.monitor = monitor;
    if (initialQuality) {
      this.qualityLevel = initialQuality;
    }
  }
  /**
   * Update quality based on performance
   */
  update() {
    if (!this.autoAdjust || this.adjustmentCooldown > 0) {
      this.adjustmentCooldown--;
      return;
    }
    const fps = this.monitor.getFPS();
    if (fps < 25 && this.qualityLevel !== "low") {
      this.decreaseQuality();
      this.adjustmentCooldown = this.cooldownFrames;
    } else if (fps > 55 && this.qualityLevel !== "high") {
      this.increaseQuality();
      this.adjustmentCooldown = this.cooldownFrames;
    }
  }
  /**
   * Decrease quality level
   */
  decreaseQuality() {
    if (this.qualityLevel === "high") {
      this.qualityLevel = "medium";
    } else if (this.qualityLevel === "medium") {
      this.qualityLevel = "low";
    }
  }
  /**
   * Increase quality level
   */
  increaseQuality() {
    if (this.qualityLevel === "low") {
      this.qualityLevel = "medium";
    } else if (this.qualityLevel === "medium") {
      this.qualityLevel = "high";
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
  setAutoAdjust(enabled) {
    this.autoAdjust = enabled;
  }
};
function disposeObject(object) {
  if (!object) return;
  if (object.geometry) {
    object.geometry.dispose();
  }
  if (object.material) {
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      Object.keys(material).forEach((key) => {
        const value = material[key];
        if (value && typeof value.dispose === "function") {
          value.dispose();
        }
      });
      material.dispose();
    });
  }
  if (object.children) {
    object.children.forEach((child) => disposeObject(child));
  }
}

// src/3d/utils/renderer-pool.ts
var RendererPool = class _RendererPool {
  // WebGL typically limits to 16 contexts, we'll use half
  constructor() {
    this.renderers = /* @__PURE__ */ new Map();
    this.maxRenderers = 8;
  }
  static getInstance() {
    if (!_RendererPool.instance) {
      _RendererPool.instance = new _RendererPool();
    }
    return _RendererPool.instance;
  }
  /**
   * Get or create a renderer for the given container
   */
  async getRenderer(containerId, container, THREE, options = {}) {
    var _a, _b, _c, _d;
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
    if (this.renderers.size >= this.maxRenderers) {
      this.removeLeastRecentlyUsed();
    }
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: (_a = options.antialias) != null ? _a : true,
      alpha: (_b = options.alpha) != null ? _b : true,
      powerPreference: (_c = options.powerPreference) != null ? _c : "high-performance",
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio((_d = options.pixelRatio) != null ? _d : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const info = {
      renderer,
      canvas,
      useCount: 1,
      lastUsed: Date.now()
    };
    this.renderers.set(containerId, info);
    container.appendChild(canvas);
    return { renderer, canvas, isNew: true };
  }
  /**
   * Release a renderer
   */
  releaseRenderer(containerId) {
    const info = this.renderers.get(containerId);
    if (info) {
      info.useCount--;
      if (info.useCount <= 0) {
        info.lastUsed = Date.now() - 6e4;
      }
    }
  }
  /**
   * Dispose a renderer completely
   */
  disposeRenderer(containerId) {
    const info = this.renderers.get(containerId);
    if (info) {
      info.renderer.dispose();
      info.renderer.forceContextLoss();
      if (info.canvas.parentElement) {
        info.canvas.parentElement.removeChild(info.canvas);
      }
      this.renderers.delete(containerId);
    }
  }
  /**
   * Remove least recently used renderer
   */
  removeLeastRecentlyUsed() {
    let oldestId = null;
    let oldestTime = Date.now();
    for (const [id, info] of this.renderers) {
      if (info.useCount === 0 && info.lastUsed < oldestTime) {
        oldestTime = info.lastUsed;
        oldestId = id;
      }
    }
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
  disposeAll() {
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
        age: Date.now() - info.lastUsed
      }))
    };
  }
};
var rendererPool = RendererPool.getInstance();

// src/3d/models/earthen-pot.ts
function createEarthenPot(THREE) {
  const group = new THREE.Group();
  const points = [];
  const segments = 10;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * 2 - 0.5;
    let radius;
    if (t < 0.3) {
      radius = 0.3 + t * 0.5;
    } else if (t < 0.8) {
      radius = 0.8 + Math.sin((t - 0.3) * Math.PI) * 0.2;
    } else {
      radius = 1 - (t - 0.8) * 2;
    }
    points.push(new THREE.Vector2(radius, y));
  }
  const potGeometry = new THREE.LatheGeometry(points, 32);
  const potMaterial = new THREE.MeshStandardMaterial({
    color: 13395507,
    roughness: 0.9,
    metalness: 0
  });
  const pot = new THREE.Mesh(potGeometry, potMaterial);
  pot.castShadow = true;
  pot.receiveShadow = true;
  group.add(pot);
  const innerChamberGeometry = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 32);
  const innerChamberMaterial = new THREE.MeshStandardMaterial({
    color: 1710618,
    roughness: 0.8,
    metalness: 0.1
  });
  const innerChamber = new THREE.Mesh(innerChamberGeometry, innerChamberMaterial);
  innerChamber.position.y = -0.2;
  group.add(innerChamber);
  const electrodeGeometry = new THREE.PlaneGeometry(0.8, 0.8);
  const electrodeMaterial = new THREE.MeshStandardMaterial({
    color: 657930,
    roughness: 0.9,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const anode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  anode.position.set(0, 0, 0);
  anode.rotation.y = Math.PI / 4;
  group.add(anode);
  const cathodeGeometry = new THREE.RingGeometry(0.7, 0.9, 32);
  const cathode = new THREE.Mesh(cathodeGeometry, electrodeMaterial);
  cathode.position.y = 0.3;
  cathode.rotation.x = -Math.PI / 2;
  group.add(cathode);
  const wireGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5);
  const wireMaterial = new THREE.MeshStandardMaterial({
    color: 12088115,
    metalness: 0.8,
    roughness: 0.3
  });
  const anodeWire = new THREE.Mesh(wireGeometry, wireMaterial);
  anodeWire.position.set(0, 0.8, 0);
  group.add(anodeWire);
  const cathodeWire = new THREE.Mesh(wireGeometry, wireMaterial);
  cathodeWire.position.set(0.7, 0.8, 0);
  cathodeWire.rotation.z = Math.PI / 6;
  group.add(cathodeWire);
  const waterGeometry = new THREE.CylinderGeometry(0.58, 0.58, 0.8, 32);
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 4620980,
    transparent: true,
    opacity: 0.3,
    roughness: 0,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.y = -0.3;
  group.add(water);
  const patternGeometry = new THREE.TorusGeometry(0.9, 0.02, 8, 32);
  const patternMaterial = new THREE.MeshStandardMaterial({
    color: 10506797,
    roughness: 0.8,
    metalness: 0
  });
  const pattern1 = new THREE.Mesh(patternGeometry, patternMaterial);
  pattern1.position.y = 0.5;
  pattern1.rotation.x = Math.PI / 2;
  group.add(pattern1);
  const pattern2 = new THREE.Mesh(patternGeometry, patternMaterial);
  pattern2.position.y = 0;
  pattern2.rotation.x = Math.PI / 2;
  pattern2.scale.setScalar(1.1);
  group.add(pattern2);
  return group;
}

// src/3d/models/cardboard.ts
function createCardboard(THREE) {
  const group = new THREE.Group();
  const boxGeometry = new THREE.BoxGeometry(2, 1.5, 1);
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 13935988,
    roughness: 0.8,
    metalness: 0
  });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.castShadow = true;
  box.receiveShadow = true;
  group.add(box);
  const separatorGeometry = new THREE.PlaneGeometry(1.8, 1.3);
  const separatorMaterial = new THREE.MeshStandardMaterial({
    color: 16777215,
    roughness: 0.6,
    metalness: 0,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  const separator = new THREE.Mesh(separatorGeometry, separatorMaterial);
  separator.rotation.y = Math.PI / 2;
  group.add(separator);
  const electrodeGeometry = new THREE.PlaneGeometry(0.8, 1.2);
  const electrodeMaterial = new THREE.MeshStandardMaterial({
    color: 1710618,
    roughness: 0.9,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const anode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  anode.position.set(-0.4, 0, 0);
  anode.rotation.y = Math.PI / 2;
  group.add(anode);
  const cathode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  cathode.position.set(0.4, 0, 0);
  cathode.rotation.y = Math.PI / 2;
  group.add(cathode);
  return group;
}

// src/3d/models/mason-jar.ts
function createMasonJar(THREE) {
  const group = new THREE.Group();
  const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 32);
  const jarMaterial = new THREE.MeshPhysicalMaterial({
    color: 16777215,
    metalness: 0,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0
  });
  const jar = new THREE.Mesh(jarGeometry, jarMaterial);
  jar.castShadow = true;
  jar.receiveShadow = true;
  group.add(jar);
  const lidGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 32);
  const lidMaterial = new THREE.MeshStandardMaterial({
    color: 12632256,
    metalness: 0.8,
    roughness: 0.3
  });
  const lid = new THREE.Mesh(lidGeometry, lidMaterial);
  lid.position.y = 1.05;
  group.add(lid);
  const electrodeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5);
  const electrodeMaterial = new THREE.MeshStandardMaterial({
    color: 1710618,
    roughness: 0.8,
    metalness: 0.2
  });
  const anode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  anode.position.set(-0.3, 0, 0);
  group.add(anode);
  const cathode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  cathode.position.set(0.3, 0, 0);
  group.add(cathode);
  const substrateGeometry = new THREE.CylinderGeometry(0.75, 0.75, 1.5, 32);
  const substrateMaterial = new THREE.MeshPhysicalMaterial({
    color: 9127187,
    transparent: true,
    opacity: 0.6,
    roughness: 0.8,
    metalness: 0
  });
  const substrate = new THREE.Mesh(substrateGeometry, substrateMaterial);
  substrate.position.y = -0.25;
  group.add(substrate);
  return group;
}

// src/3d/models/3d-printed.ts
function create3DPrinted(THREE) {
  const group = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, -1);
  shape.lineTo(1, -1);
  shape.lineTo(1, 1);
  shape.lineTo(-1, 1);
  shape.lineTo(-1, -1);
  shape.lineTo(0, -1);
  const extrudeSettings = {
    depth: 2,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 10
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({
    color: 4286945,
    roughness: 0.4,
    metalness: 0.2
  });
  const chamber = new THREE.Mesh(geometry, material);
  chamber.rotation.x = Math.PI / 2;
  chamber.castShadow = true;
  chamber.receiveShadow = true;
  group.add(chamber);
  return group;
}

// src/3d/models/wetland.ts
function createWetland(THREE) {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(3, 0.5, 2);
  const material = new THREE.MeshStandardMaterial({
    color: 2263842,
    roughness: 0.7,
    metalness: 0
  });
  const wetland = new THREE.Mesh(geometry, material);
  wetland.castShadow = true;
  wetland.receiveShadow = true;
  group.add(wetland);
  return group;
}

// src/3d/models/micro-chip.ts
function createMicroChip(THREE) {
  const group = new THREE.Group();
  const boardGeometry = new THREE.BoxGeometry(1, 0.1, 1);
  const boardMaterial = new THREE.MeshStandardMaterial({
    color: 1985835,
    roughness: 0.6,
    metalness: 0.1
  });
  const board = new THREE.Mesh(boardGeometry, boardMaterial);
  board.castShadow = true;
  board.receiveShadow = true;
  group.add(board);
  const chipGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.3);
  const chipMaterial = new THREE.MeshStandardMaterial({
    color: 6908265,
    roughness: 0.2,
    metalness: 0.6,
    emissive: 65280,
    emissiveIntensity: 0.1
  });
  const chip = new THREE.Mesh(chipGeometry, chipMaterial);
  chip.position.y = 0.08;
  group.add(chip);
  return group;
}

// src/3d/models/isolinear-chip.ts
function createIsolinearChip(THREE) {
  const group = new THREE.Group();
  const geometry = new THREE.OctahedronGeometry(0.5, 0);
  const material = new THREE.MeshPhysicalMaterial({
    color: 9662683,
    metalness: 0.4,
    roughness: 0.1,
    emissive: 9662683,
    emissiveIntensity: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0
  });
  const chip = new THREE.Mesh(geometry, material);
  chip.castShadow = true;
  chip.receiveShadow = true;
  group.add(chip);
  return group;
}

// src/3d/models/benchtop-bioreactor.ts
function createBenchtopBioreactor(THREE) {
  const group = new THREE.Group();
  const vesselGeometry = new THREE.CylinderGeometry(1, 1, 2.5, 32);
  const vesselMaterial = new THREE.MeshPhysicalMaterial({
    color: 12632256,
    metalness: 0.7,
    roughness: 0.3,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1
  });
  const vessel = new THREE.Mesh(vesselGeometry, vesselMaterial);
  vessel.castShadow = true;
  vessel.receiveShadow = true;
  group.add(vessel);
  const panelGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.1);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 3355443,
    metalness: 0.5,
    roughness: 0.4
  });
  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  panel.position.set(1.2, 0, 0);
  group.add(panel);
  return group;
}

// src/3d/models/wastewater-treatment.ts
function createWastewaterTreatment(THREE) {
  const group = new THREE.Group();
  const tankGeometry = new THREE.BoxGeometry(4, 1.5, 3);
  const tankMaterial = new THREE.MeshStandardMaterial({
    color: 4620980,
    metalness: 0.3,
    roughness: 0.6
  });
  const tank = new THREE.Mesh(tankGeometry, tankMaterial);
  tank.castShadow = true;
  tank.receiveShadow = true;
  group.add(tank);
  const pipeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2);
  const pipeMaterial = new THREE.MeshStandardMaterial({
    color: 8421504,
    metalness: 0.6,
    roughness: 0.4
  });
  const pipe1 = new THREE.Mesh(pipeGeometry, pipeMaterial);
  pipe1.position.set(-2.2, 0, 0);
  pipe1.rotation.z = Math.PI / 2;
  group.add(pipe1);
  const pipe2 = new THREE.Mesh(pipeGeometry, pipeMaterial);
  pipe2.position.set(2.2, 0, 0);
  pipe2.rotation.z = Math.PI / 2;
  group.add(pipe2);
  return group;
}

// src/3d/models/brewery-processing.ts
function createBreweryProcessing(THREE) {
  const group = new THREE.Group();
  const tankGeometry = new THREE.CylinderGeometry(1.2, 1.5, 3, 32);
  const tankMaterial = new THREE.MeshStandardMaterial({
    color: 14329120,
    metalness: 0.5,
    roughness: 0.4
  });
  const tank = new THREE.Mesh(tankGeometry, tankMaterial);
  tank.castShadow = true;
  tank.receiveShadow = true;
  group.add(tank);
  const domeGeometry = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeometry, tankMaterial);
  dome.position.y = 1.5;
  group.add(dome);
  return group;
}

// src/3d/models/architectural-facade.ts
function createArchitecturalFacade(THREE) {
  const group = new THREE.Group();
  const panelGeometry = new THREE.BoxGeometry(4, 6, 0.3);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 7372944,
    metalness: 0.8,
    roughness: 0.2
  });
  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  panel.castShadow = true;
  panel.receiveShadow = true;
  group.add(panel);
  const moduleGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.2);
  const moduleMaterial = new THREE.MeshPhysicalMaterial({
    color: 3100495,
    metalness: 0.6,
    roughness: 0.3,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1
  });
  for (let x = -1.5; x <= 1.5; x += 1) {
    for (let y = -2.5; y <= 2.5; y += 1) {
      const module = new THREE.Mesh(moduleGeometry, moduleMaterial);
      module.position.set(x, y, 0.25);
      group.add(module);
    }
  }
  return group;
}

// src/3d/models/benthic-fuel-cell.ts
function createBenthicFuelCell(THREE) {
  const group = new THREE.Group();
  const sedimentGeometry = new THREE.BoxGeometry(3, 0.8, 3);
  const sedimentMaterial = new THREE.MeshStandardMaterial({
    color: 3100495,
    roughness: 0.8,
    metalness: 0.1
  });
  const sediment = new THREE.Mesh(sedimentGeometry, sedimentMaterial);
  sediment.position.y = -0.4;
  sediment.castShadow = true;
  sediment.receiveShadow = true;
  group.add(sediment);
  const waterGeometry = new THREE.BoxGeometry(3, 1.5, 3);
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 4620980,
    transparent: true,
    opacity: 0.4,
    roughness: 0,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.y = 0.75;
  group.add(water);
  const electrodeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2);
  const electrodeMaterial = new THREE.MeshStandardMaterial({
    color: 1710618,
    metalness: 0.3,
    roughness: 0.6
  });
  for (let x = -1; x <= 1; x += 0.5) {
    for (let z = -1; z <= 1; z += 0.5) {
      const electrode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
      electrode.position.set(x, 0, z);
      group.add(electrode);
    }
  }
  return group;
}

// src/3d/models/kitchen-sink.ts
function createKitchenSink(THREE) {
  const group = new THREE.Group();
  const sinkShape = new THREE.Shape();
  sinkShape.moveTo(-1, -0.5);
  sinkShape.lineTo(1, -0.5);
  sinkShape.lineTo(1, 0.5);
  sinkShape.lineTo(-1, 0.5);
  sinkShape.lineTo(-1, -0.5);
  const sinkGeometry = new THREE.ExtrudeGeometry(sinkShape, {
    depth: 0.8,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 10
  });
  const sinkMaterial = new THREE.MeshStandardMaterial({
    color: 16119260,
    metalness: 0.6,
    roughness: 0.3
  });
  const sink = new THREE.Mesh(sinkGeometry, sinkMaterial);
  sink.rotation.x = Math.PI / 2;
  sink.castShadow = true;
  sink.receiveShadow = true;
  group.add(sink);
  const mfcGeometry = new THREE.BoxGeometry(1.5, 0.3, 0.6);
  const mfcMaterial = new THREE.MeshStandardMaterial({
    color: 3355443,
    metalness: 0.4,
    roughness: 0.6
  });
  const mfc = new THREE.Mesh(mfcGeometry, mfcMaterial);
  mfc.position.y = -0.65;
  group.add(mfc);
  return group;
}

// src/3d/models/index.ts
var modelDefinitions = {
  "earthen-pot": {
    id: "earthen-pot",
    name: "Earthen Pot MFC",
    description: "Traditional clay pot design for rural applications",
    color: 13395507,
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createEarthenPot,
    materialProps: {
      metalness: 0,
      roughness: 0.9
    }
  },
  "cardboard": {
    id: "cardboard",
    name: "Cardboard MFC",
    description: "Low-cost educational prototype",
    color: 13935988,
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createCardboard,
    materialProps: {
      metalness: 0,
      roughness: 0.8
    }
  },
  "mason-jar": {
    id: "mason-jar",
    name: "Mason Jar MFC",
    description: "Laboratory-scale glass container system",
    color: 15790320,
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createMasonJar,
    materialProps: {
      metalness: 0,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8
    }
  },
  "3d-printed": {
    id: "3d-printed",
    name: "3D Printed MFC",
    description: "Customizable rapid prototype design",
    color: 4286945,
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: create3DPrinted,
    materialProps: {
      metalness: 0.2,
      roughness: 0.4
    }
  },
  "wetland": {
    id: "wetland",
    name: "Constructed Wetland MFC",
    description: "Nature-based wastewater treatment system",
    color: 2263842,
    scale: 1.5,
    rotation: [0, 0, 0],
    position: [0, -0.5, 0],
    createGeometry: createWetland,
    materialProps: {
      metalness: 0,
      roughness: 0.7
    }
  },
  "micro-chip": {
    id: "micro-chip",
    name: "Micro-Chip MFC",
    description: "Miniaturized bioelectronic device",
    color: 6908265,
    emissiveColor: 65280,
    scale: 0.5,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createMicroChip,
    materialProps: {
      metalness: 0.6,
      roughness: 0.2
    },
    animation: {
      type: "pulse",
      speed: 2,
      amplitude: 0.05
    }
  },
  "isolinear-chip": {
    id: "isolinear-chip",
    name: "Isolinear Chip MFC",
    description: "Advanced optical biocomputing system",
    color: 9662683,
    emissiveColor: 9662683,
    scale: 0.6,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createIsolinearChip,
    materialProps: {
      metalness: 0.4,
      roughness: 0.1,
      emissiveIntensity: 0.3
    },
    animation: {
      type: "rotate",
      speed: 0.5
    }
  },
  "benchtop-bioreactor": {
    id: "benchtop-bioreactor",
    name: "Benchtop Bioreactor",
    description: "Laboratory-scale controlled reactor",
    color: 12632256,
    scale: 1.2,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createBenchtopBioreactor,
    materialProps: {
      metalness: 0.7,
      roughness: 0.3
    }
  },
  "wastewater-treatment": {
    id: "wastewater-treatment",
    name: "Wastewater Treatment Plant",
    description: "Industrial-scale treatment facility",
    color: 4620980,
    scale: 2,
    rotation: [0, 0, 0],
    position: [0, -1, 0],
    createGeometry: createWastewaterTreatment,
    materialProps: {
      metalness: 0.3,
      roughness: 0.6
    }
  },
  "brewery-processing": {
    id: "brewery-processing",
    name: "Brewery Processing System",
    description: "Waste-to-energy brewery integration",
    color: 14329120,
    scale: 1.5,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createBreweryProcessing,
    materialProps: {
      metalness: 0.5,
      roughness: 0.4
    }
  },
  "architectural-facade": {
    id: "architectural-facade",
    name: "Architectural Facade",
    description: "Building-integrated bioelectrochemical system",
    color: 7372944,
    scale: 2.5,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createArchitecturalFacade,
    materialProps: {
      metalness: 0.8,
      roughness: 0.2
    }
  },
  "benthic-fuel-cell": {
    id: "benthic-fuel-cell",
    name: "Benthic Fuel Cell",
    description: "Sediment-based marine power system",
    color: 3100495,
    scale: 1.8,
    rotation: [0, 0, 0],
    position: [0, -0.8, 0],
    createGeometry: createBenthicFuelCell,
    materialProps: {
      metalness: 0.1,
      roughness: 0.8
    }
  },
  "kitchen-sink": {
    id: "kitchen-sink",
    name: "Kitchen Sink System",
    description: "Domestic waste-to-energy converter",
    color: 16119260,
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    createGeometry: createKitchenSink,
    materialProps: {
      metalness: 0.6,
      roughness: 0.3
    }
  }
};

// src/3d/models/shared/materials.ts
function createMaterial(THREE, config) {
  const baseProps = {
    color: config.color,
    transparent: config.transparent || false,
    opacity: config.opacity || 1
  };
  switch (config.type) {
    case "physical":
      return new THREE.MeshPhysicalMaterial(__spreadProps(__spreadValues({}, baseProps), {
        metalness: config.metalness || 0,
        roughness: config.roughness || 0.5,
        emissive: config.emissive || 0,
        emissiveIntensity: config.emissiveIntensity,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2
      }));
    case "standard":
      return new THREE.MeshStandardMaterial(__spreadProps(__spreadValues({}, baseProps), {
        metalness: config.metalness || 0,
        roughness: config.roughness || 0.5,
        emissive: config.emissive || 0,
        emissiveIntensity: config.emissiveIntensity
      }));
    case "basic":
    default:
      return new THREE.MeshBasicMaterial(baseProps);
  }
}
var instanceCounter = 0;
function MESSModel3D({
  design,
  interactive = true,
  showGrid = false,
  autoRotate = false,
  rotationSpeed = 0.01,
  className = "",
  onLoad,
  onError,
  onClick,
  showLabels = false,
  performanceMode = false
}) {
  const mountRef = React2.useRef(null);
  const contextRef = React2.useRef(null);
  const animationIdRef = React2.useRef(null);
  const performanceRef = React2.useRef(null);
  const qualityRef = React2.useRef(null);
  const instanceId = React2.useRef(`mess-3d-${++instanceCounter}`);
  const [isLoading, setIsLoading] = React2.useState(true);
  const [error, setError] = React2.useState(null);
  const [webglSupported, setWebglSupported] = React2.useState(true);
  const initScene = React2.useCallback(async () => {
    if (!mountRef.current) return;
    try {
      if (!checkWebGLSupport()) {
        throw new Error("WebGL is not supported on this device");
      }
      const THREE = await loadThree();
      const capabilities = getWebGLCapabilities();
      const qualitySettings = getQualitySettings(capabilities);
      if (!qualitySettings) {
        throw new Error("Unable to determine quality settings");
      }
      performanceRef.current = new PerformanceMonitor();
      qualityRef.current = new AdaptiveQuality(
        performanceRef.current,
        performanceMode ? "low" : qualitySettings.quality
      );
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(657930);
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1e3
      );
      camera.position.set(5, 5, 5);
      const currentQuality = qualityRef.current.getQualitySettings();
      const { renderer, canvas, isNew } = await rendererPool.getRenderer(
        instanceId.current,
        mountRef.current,
        THREE,
        {
          antialias: currentQuality.antialias,
          alpha: true,
          powerPreference: performanceMode ? "low-power" : "high-performance",
          pixelRatio: currentQuality.pixelRatio
        }
      );
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.shadowMap.enabled = currentQuality.shadowsEnabled;
      let controls = null;
      if (interactive) {
        const OrbitControls = await loadOrbitControls(THREE);
        controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.enablePan = true;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = rotationSpeed * 60;
      }
      const ambientLight = new THREE.AmbientLight(16777215, 0.6);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(16777215, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = currentQuality.shadowsEnabled;
      if (directionalLight.shadow) {
        directionalLight.shadow.mapSize.width = currentQuality.shadowMapSize;
        directionalLight.shadow.mapSize.height = currentQuality.shadowMapSize;
      }
      scene.add(directionalLight);
      if (showGrid) {
        const gridHelper = new THREE.GridHelper(10, 10, 4473924, 2236962);
        scene.add(gridHelper);
      }
      contextRef.current = {
        scene,
        camera,
        renderer,
        controls
      };
      await loadModel(THREE, scene);
      if (onClick && canvas) {
        canvas.addEventListener("click", handleClick);
      }
      animate();
      setIsLoading(false);
      onLoad == null ? void 0 : onLoad();
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error("Failed to initialize 3D scene");
      setError(error2);
      setWebglSupported(checkWebGLSupport());
      onError == null ? void 0 : onError(error2);
      console.error("MESSModel3D initialization error:", error2);
    }
  }, [design, interactive, showGrid, autoRotate, rotationSpeed, onClick, onLoad, onError, performanceMode]);
  const loadModel = React2.useCallback(async (THREE, scene) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const modelDef = modelDefinitions[design];
    if (!modelDef) {
      throw new Error(`Unknown design type: ${design}`);
    }
    const modelGroup = new THREE.Group();
    if (modelDef.position) {
      modelGroup.position.set(...modelDef.position);
    }
    if (modelDef.rotation) {
      modelGroup.rotation.set(...modelDef.rotation);
    }
    if (modelDef.scale) {
      modelGroup.scale.setScalar(modelDef.scale);
    }
    try {
      let geometry;
      if (modelDef.createGeometry) {
        geometry = await modelDef.createGeometry(THREE);
      } else {
        geometry = new THREE.BoxGeometry(2, 2, 2);
      }
      if (!geometry || !geometry.attributes) {
        console.warn(`Invalid geometry for ${design}, using default box`);
        geometry = new THREE.BoxGeometry(2, 2, 2);
      }
      const materialConfig = {
        name: modelDef.name,
        type: ((_a = modelDef.materialProps) == null ? void 0 : _a.type) || "standard",
        color: modelDef.color || 8421504,
        metalness: (_c = (_b = modelDef.materialProps) == null ? void 0 : _b.metalness) != null ? _c : 0.5,
        roughness: (_e = (_d = modelDef.materialProps) == null ? void 0 : _d.roughness) != null ? _e : 0.5,
        transparent: (_g = (_f = modelDef.materialProps) == null ? void 0 : _f.transparent) != null ? _g : false,
        opacity: (_i = (_h = modelDef.materialProps) == null ? void 0 : _h.opacity) != null ? _i : 1,
        emissive: modelDef.emissiveColor || 0,
        emissiveIntensity: 0.1
      };
      const material = createMaterial(THREE, materialConfig);
      let mesh;
      try {
        mesh = new THREE.Mesh(geometry, material);
      } catch (meshError) {
        console.error("Error creating mesh, using basic material:", meshError);
        const basicMaterial = new THREE.MeshBasicMaterial({ color: modelDef.color || 8421504 });
        mesh = new THREE.Mesh(geometry, basicMaterial);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = design;
      if (modelDef.animation) {
        mesh.userData.animation = modelDef.animation;
      }
      modelGroup.add(mesh);
      scene.add(modelGroup);
    } catch (modelError) {
      console.error(`Error creating model ${design}:`, modelError);
      const fallbackGeometry = new THREE.BoxGeometry(2, 2, 2);
      const fallbackMaterial = new THREE.MeshBasicMaterial({
        color: 16711680,
        wireframe: true
      });
      const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
      modelGroup.add(fallbackMesh);
      scene.add(modelGroup);
    }
  }, [design, showLabels]);
  const handleClick = React2.useCallback((event) => {
    if (!contextRef.current || !onClick) return;
    const { camera, renderer, scene } = contextRef.current;
    const THREE = window.THREE;
    if (!THREE) return;
    const rect = event.target.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      (event.clientX - rect.left) / rect.width * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const object = intersects[0].object;
      onClick(object.name || void 0);
    }
  }, [onClick]);
  const animate = React2.useCallback(() => {
    var _a, _b, _c, _d;
    if (!contextRef.current) return;
    const { scene, camera, renderer, controls } = contextRef.current;
    (_a = performanceRef.current) == null ? void 0 : _a.update();
    (_b = performanceRef.current) == null ? void 0 : _b.updateMemoryUsage(renderer);
    (_c = qualityRef.current) == null ? void 0 : _c.update();
    const currentQuality = (_d = qualityRef.current) == null ? void 0 : _d.getQualitySettings();
    if (currentQuality && renderer.getPixelRatio() !== currentQuality.pixelRatio) {
      renderer.setPixelRatio(currentQuality.pixelRatio);
    }
    if (controls) {
      controls.update();
    }
    scene.traverse((child) => {
      if (child.userData.animation) {
        const time = performance.now() * 1e-3;
        const anim = child.userData.animation;
        switch (anim.type) {
          case "rotate":
            child.rotation.y = time * (anim.speed || 1);
            break;
          case "float":
            child.position.y = Math.sin(time * (anim.speed || 1)) * (anim.amplitude || 0.1);
            break;
          case "pulse":
            const scale = 1 + Math.sin(time * (anim.speed || 1)) * (anim.amplitude || 0.05);
            child.scale.setScalar(scale);
            break;
        }
      }
    });
    renderer.render(scene, camera);
    animationIdRef.current = requestAnimationFrame(animate);
  }, []);
  React2.useEffect(() => {
    const handleResize = () => {
      if (!contextRef.current || !mountRef.current) return;
      const { camera, renderer } = contextRef.current;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  React2.useEffect(() => {
    initScene();
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (contextRef.current) {
        const { scene, controls } = contextRef.current;
        if (controls && controls.dispose) {
          controls.dispose();
        }
        scene.traverse((child) => {
          disposeObject(child);
        });
        scene.clear();
      }
      rendererPool.releaseRenderer(instanceId.current);
    };
  }, [initScene]);
  if (!webglSupported) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: `flex items-center justify-center h-full bg-gray-900 rounded-lg p-8 ${className}`, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-red-500 mb-2", children: "WebGL is not supported on your device" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-400", children: "Please use a modern browser with WebGL support to view 3D models." })
    ] }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: `flex items-center justify-center h-full bg-gray-900 rounded-lg p-8 ${className}`, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-red-500 mb-2", children: "Failed to load 3D model" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-400", children: error.message })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `relative w-full h-full bg-gray-900 rounded-lg overflow-hidden ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { ref: mountRef, className: "w-full h-full" }),
    isLoading && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-gray-400", children: "Loading 3D model..." })
    ] }) }),
    process.env.NODE_ENV === "development" && performanceRef.current && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "absolute top-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs text-white", children: [
      "FPS: ",
      performanceRef.current.getFPS()
    ] })
  ] });
}
function MESSModel3DLite({
  design,
  className = "",
  autoRotate = true,
  rotationSpeed = 0.01
}) {
  const [rotation, setRotation] = React2.useState({ x: -20, y: 45 });
  const animationRef = React2.useRef();
  React2.useEffect(() => {
    if (!autoRotate) return;
    const animate = () => {
      setRotation((prev) => ({
        x: prev.x,
        y: prev.y + rotationSpeed * 60
      }));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoRotate, rotationSpeed]);
  const getDesignElement = () => {
    const baseStyle = {
      transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
      transformStyle: "preserve-3d",
      transition: autoRotate ? "none" : "transform 0.3s ease"
    };
    switch (design) {
      case "earthen-pot":
        return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative w-32 h-32", style: baseStyle, children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: "absolute inset-0 bg-orange-700 rounded-full",
              style: {
                clipPath: "polygon(20% 0%, 80% 0%, 100% 70%, 90% 100%, 10% 100%, 0% 70%)",
                background: "linear-gradient(135deg, #cc6633 0%, #8b4513 100%)"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-4 bg-gray-900 rounded-full opacity-50" })
        ] });
      case "mason-jar":
        return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative w-24 h-32", style: baseStyle, children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: "absolute inset-0 bg-blue-100 rounded-lg border-2 border-gray-300",
              style: {
                background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(200,200,255,0.6) 100%)"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute top-0 inset-x-0 h-4 bg-gray-400 rounded-t-lg" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute bottom-4 inset-x-2 h-16 bg-yellow-700 opacity-30 rounded" })
        ] });
      case "micro-chip":
        return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative w-20 h-20", style: baseStyle, children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: "absolute inset-0 bg-green-900 rounded",
              style: {
                background: "linear-gradient(45deg, #1e4d2b 0%, #2d5a3d 50%, #1e4d2b 100%)"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-2 bg-gray-700 rounded", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-1 bg-green-400 rounded animate-pulse" }) })
        ] });
      case "3d-printed":
        return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "relative w-28 h-28", style: baseStyle, children: /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: "absolute inset-0",
            style: {
              background: "conic-gradient(from 45deg, #4169e1 0deg, #6495ed 60deg, #4169e1 120deg, #1e50a2 180deg, #4169e1 240deg, #6495ed 300deg, #4169e1 360deg)",
              clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)"
            }
          }
        ) });
      case "wetland":
        return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative w-36 h-20", style: baseStyle, children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: "absolute bottom-0 inset-x-0 h-12 bg-green-800 rounded",
              style: {
                background: "linear-gradient(180deg, #228b22 0%, #0d4d0d 100%)"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute bottom-8 left-4 w-2 h-12 bg-green-600 rounded-t-full" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute bottom-8 left-8 w-2 h-10 bg-green-600 rounded-t-full" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute bottom-8 right-4 w-2 h-14 bg-green-600 rounded-t-full" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute bottom-8 right-8 w-2 h-11 bg-green-600 rounded-t-full" })
        ] });
      default:
        return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "relative w-24 h-24", style: baseStyle, children: /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: "absolute inset-0 bg-gray-600 rounded",
            style: {
              background: "linear-gradient(135deg, #808080 0%, #404040 100%)"
            }
          }
        ) });
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `flex items-center justify-center h-full ${className}`, style: { perspective: "1000px" }, children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-xs text-red-500 absolute top-1 right-1 z-10", children: [
      "3D: ",
      design
    ] }),
    getDesignElement()
  ] });
}
var perspectiveStyle = `
.perspective-1000 {
  perspective: 1000px;
}
`;
if (typeof document !== "undefined" && !document.querySelector("#perspective-styles")) {
  const style = document.createElement("style");
  style.id = "perspective-styles";
  style.textContent = perspectiveStyle;
  document.head.appendChild(style);
}

exports.Button = Button;
exports.Card = Card;
exports.CardContent = CardContent;
exports.CardHeader = CardHeader;
exports.CardTitle = CardTitle;
exports.Input = Input;
exports.MESSModel3D = MESSModel3D;
exports.MESSModel3DLite = MESSModel3DLite;
exports.Textarea = Textarea;
exports.checkWebGLSupport = checkWebGLSupport;
exports.cn = cn;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map