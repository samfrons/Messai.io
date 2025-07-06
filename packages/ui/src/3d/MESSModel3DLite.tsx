'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MESSModel3DProps } from './types';

/**
 * Lightweight 3D model component that uses CSS 3D transforms
 * Used in galleries to avoid WebGL context limits
 */
export function MESSModel3DLite({
  design,
  className = '',
  autoRotate = true,
  rotationSpeed = 0.01,
}: Pick<MESSModel3DProps, 'design' | 'className' | 'autoRotate' | 'rotationSpeed'>) {
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!autoRotate) return;

    const animate = () => {
      setRotation(prev => ({
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

  // Design-specific 3D CSS models
  const getDesignElement = () => {
    const baseStyle = {
      transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
      transformStyle: 'preserve-3d' as const,
      transition: autoRotate ? 'none' : 'transform 0.3s ease',
    };

    switch (design) {
      case 'earthen-pot':
        return (
          <div className="relative w-32 h-32" style={baseStyle}>
            <div className="absolute inset-0 bg-orange-700 rounded-full" 
                 style={{ 
                   clipPath: 'polygon(20% 0%, 80% 0%, 100% 70%, 90% 100%, 10% 100%, 0% 70%)',
                   background: 'linear-gradient(135deg, #cc6633 0%, #8b4513 100%)'
                 }} />
            <div className="absolute inset-4 bg-gray-900 rounded-full opacity-50" />
          </div>
        );

      case 'mason-jar':
        return (
          <div className="relative w-24 h-32" style={baseStyle}>
            <div className="absolute inset-0 bg-blue-100 rounded-lg border-2 border-gray-300"
                 style={{ 
                   background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(200,200,255,0.6) 100%)'
                 }} />
            <div className="absolute top-0 inset-x-0 h-4 bg-gray-400 rounded-t-lg" />
            <div className="absolute bottom-4 inset-x-2 h-16 bg-yellow-700 opacity-30 rounded" />
          </div>
        );

      case 'micro-chip':
        return (
          <div className="relative w-20 h-20" style={baseStyle}>
            <div className="absolute inset-0 bg-green-900 rounded"
                 style={{ 
                   background: 'linear-gradient(45deg, #1e4d2b 0%, #2d5a3d 50%, #1e4d2b 100%)'
                 }} />
            <div className="absolute inset-2 bg-gray-700 rounded">
              <div className="absolute inset-1 bg-green-400 rounded animate-pulse" />
            </div>
          </div>
        );

      case '3d-printed':
        return (
          <div className="relative w-28 h-28" style={baseStyle}>
            <div className="absolute inset-0"
                 style={{
                   background: 'conic-gradient(from 45deg, #4169e1 0deg, #6495ed 60deg, #4169e1 120deg, #1e50a2 180deg, #4169e1 240deg, #6495ed 300deg, #4169e1 360deg)',
                   clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                 }} />
          </div>
        );

      case 'wetland':
        return (
          <div className="relative w-36 h-20" style={baseStyle}>
            <div className="absolute bottom-0 inset-x-0 h-12 bg-green-800 rounded"
                 style={{ 
                   background: 'linear-gradient(180deg, #228b22 0%, #0d4d0d 100%)'
                 }} />
            <div className="absolute bottom-8 left-4 w-2 h-12 bg-green-600 rounded-t-full" />
            <div className="absolute bottom-8 left-8 w-2 h-10 bg-green-600 rounded-t-full" />
            <div className="absolute bottom-8 right-4 w-2 h-14 bg-green-600 rounded-t-full" />
            <div className="absolute bottom-8 right-8 w-2 h-11 bg-green-600 rounded-t-full" />
          </div>
        );

      default:
        return (
          <div className="relative w-24 h-24" style={baseStyle}>
            <div className="absolute inset-0 bg-gray-600 rounded"
                 style={{ 
                   background: 'linear-gradient(135deg, #808080 0%, #404040 100%)'
                 }} />
          </div>
        );
    }
  };

  return (
    <div className={`flex items-center justify-center h-full perspective-1000 ${className}`}>
      {getDesignElement()}
    </div>
  );
}

// Add perspective utility to tailwind
const perspectiveStyle = `
.perspective-1000 {
  perspective: 1000px;
}
`;

if (typeof document !== 'undefined' && !document.querySelector('#perspective-styles')) {
  const style = document.createElement('style');
  style.id = 'perspective-styles';
  style.textContent = perspectiveStyle;
  document.head.appendChild(style);
}