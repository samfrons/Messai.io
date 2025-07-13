'use client';

import { useEffect, useRef, useState } from 'react';

export default function TestThreePage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const loadThree = async () => {
      try {
        setStatus('Loading Three.js...');
        const THREE = await import('three');
        setStatus('Three.js loaded successfully!');

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        // Create camera
        const camera = new THREE.PerspectiveCamera(
          75,
          mount.clientWidth / mount.clientHeight,
          0.1,
          1000
        );
        camera.position.z = 5;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        // Create cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Add light
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        // Animation
        const animate = () => {
          requestAnimationFrame(animate);
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
          renderer.render(scene, camera);
        };
        animate();

        setStatus('Three.js scene created and running!');

        // Cleanup
        return () => {
          mount.removeChild(renderer.domElement);
          renderer.dispose();
        };
      } catch (err) {
        console.error('Three.js error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Failed to load Three.js');
      }
    };

    loadThree();
  }, []);

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Three.js Direct Test</h1>
      
      <div className="mb-4">
        <p className="text-lg text-gray-300">Status: <span className="text-green-400">{status}</span></p>
        {error && <p className="text-red-400">Error: {error}</p>}
      </div>

      <div 
        ref={mountRef} 
        className="w-full h-96 bg-gray-900 rounded-lg"
        style={{ minHeight: '400px' }}
      />

      <div className="mt-4 p-4 bg-gray-900 rounded-lg">
        <h3 className="text-white mb-2">Debug Info:</h3>
        <pre className="text-sm text-gray-400">
          {JSON.stringify({
            hasWindow: typeof window !== 'undefined',
            hasDocument: typeof document !== 'undefined',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}