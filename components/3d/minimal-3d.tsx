'use client';

import { useEffect, useState } from 'react';

export function Minimal3D() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test if we can load Three.js
    const loadThree = async () => {
      try {
        const THREE = await import('three');
        console.log('Three.js loaded successfully', THREE);
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load Three.js:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    loadThree();
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-900 text-white rounded">
        <p>Error loading 3D: {error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="p-4 bg-gray-800 text-white rounded">
        <p>Loading 3D engine...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-900 text-white rounded">
      <p>Three.js loaded successfully!</p>
    </div>
  );
}