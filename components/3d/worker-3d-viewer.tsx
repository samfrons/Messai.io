'use client';

import { useEffect, useRef, useState } from 'react';

export function Worker3DViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const offscreen = canvas.transferControlToOffscreen();

    // Create worker script inline to avoid file issues
    const workerScript = `
      importScripts('https://unpkg.com/three@0.169.0/build/three.min.js');
      
      let renderer, scene, camera, cube;
      
      self.onmessage = function(e) {
        if (e.data.type === 'init') {
          const { canvas, width, height } = e.data;
          
          // Initialize Three.js
          scene = new THREE.Scene();
          scene.background = new THREE.Color(0x1a1a1a);
          
          camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
          camera.position.z = 5;
          
          renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
          renderer.setSize(width, height);
          
          // Add lights
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambientLight);
          
          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
          directionalLight.position.set(10, 10, 5);
          scene.add(directionalLight);
          
          // Create cube
          const geometry = new THREE.BoxGeometry(2, 2, 2);
          const material = new THREE.MeshStandardMaterial({ color: 0x4A90E2 });
          cube = new THREE.Mesh(geometry, material);
          scene.add(cube);
          
          // Start animation
          animate();
          
          self.postMessage({ type: 'ready' });
        } else if (e.data.type === 'resize') {
          const { width, height } = e.data;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      };
      
      function animate() {
        requestAnimationFrame(animate);
        if (cube) {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
        }
        renderer.render(scene, camera);
      }
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    worker.onmessage = (e) => {
      if (e.data.type === 'ready') {
        setStatus('ready');
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      setError('Failed to initialize 3D worker');
      setStatus('error');
    };

    // Initialize worker
    worker.postMessage({
      type: 'init',
      canvas: offscreen,
      width: canvas.clientWidth,
      height: canvas.clientHeight
    }, [offscreen]);

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      worker.postMessage({
        type: 'resize',
        width: canvasRef.current.clientWidth,
        height: canvasRef.current.clientHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center h-full bg-red-900 text-white rounded p-4">
        <div className="text-center">
          <p className="text-xl mb-2">3D Rendering Error</p>
          <p className="text-sm">{error || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}
    </div>
  );
}