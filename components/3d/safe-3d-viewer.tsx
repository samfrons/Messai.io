'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';

const VanillaThreeScene = dynamic(
  () => import('./vanilla-three-scene').then(mod => mod.VanillaThreeScene),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-gray-400">Loading 3D viewer...</p>
        </div>
      </div>
    )
  }
);

interface Safe3DViewerProps {
  modelUrl?: string;
  className?: string;
}

export function Safe3DViewer({ modelUrl, className = '' }: Safe3DViewerProps) {
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Delay mounting to ensure client-side rendering
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">3D Viewer Error</h3>
          <p className="text-gray-400 mb-4">Unable to load 3D content</p>
          <button
            onClick={() => {
              setHasError(false);
              setIsReady(false);
              setTimeout(() => setIsReady(true), 100);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-gray-400">Initializing 3D viewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <div className="relative w-full h-full">
        <VanillaThreeScene />
      </div>
    </div>
  );
}