'use client';

import { useEffect, useRef } from 'react';
import Safe3DModelCDN from '@/components/Safe3DModelCDN';

export default function Test3DSimplePage() {
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Log to both console and page
    const log = (message: string) => {
      console.log(message);
      if (consoleRef.current) {
        consoleRef.current.innerHTML += `<div>${new Date().toISOString()}: ${message}</div>`;
      }
    };

    log('Test3DSimplePage mounted');
    
    // Check if Three.js is available
    if (typeof window !== 'undefined') {
      log(`Window object available: ${!!window}`);
      log(`Three.js loaded: ${!!(window as any).THREE}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-3xl font-bold text-white mb-8">3D Model Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl text-white mb-4">Earthen Pot MFC</h2>
          <div className="h-64 bg-gray-900 rounded-lg overflow-hidden">
            <Safe3DModelCDN designName="Earthen Pot MFC" className="w-full h-full" />
          </div>
        </div>

        <div>
          <h2 className="text-xl text-white mb-4">Micro-chip MFC</h2>
          <div className="h-64 bg-gray-900 rounded-lg overflow-hidden">
            <Safe3DModelCDN designName="Micro-chip MFC" className="w-full h-full" />
          </div>
        </div>

        <div>
          <h2 className="text-xl text-white mb-4">Bio-neural MFC</h2>
          <div className="h-64 bg-gray-900 rounded-lg overflow-hidden">
            <Safe3DModelCDN designName="Bio-neural MFC" className="w-full h-full" />
          </div>
        </div>

        <div>
          <h2 className="text-xl text-white mb-4">Quantum Resonance MFC</h2>
          <div className="h-64 bg-gray-900 rounded-lg overflow-hidden">
            <Safe3DModelCDN designName="Quantum Resonance MFC" className="w-full h-full" />
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-900 rounded-lg">
        <h3 className="text-lg text-white mb-2">Console Output:</h3>
        <div ref={consoleRef} className="text-sm text-gray-400 font-mono"></div>
      </div>
    </div>
  );
}