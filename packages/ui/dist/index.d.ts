import { ClassValue } from 'clsx';
import React from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * Merge class names with tailwind-merge to handle conflicts
 */
declare function cn(...inputs: ClassValue[]): string;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'chat' | 'hover';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}
declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
declare const CardHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const CardTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>;
declare const CardContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}
declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;

/**
 * Type definitions for MESSAi 3D models
 */
type DesignType = 'earthen-pot' | 'cardboard' | 'mason-jar' | '3d-printed' | 'wetland' | 'micro-chip' | 'isolinear-chip' | 'benchtop-bioreactor' | 'wastewater-treatment' | 'brewery-processing' | 'architectural-facade' | 'benthic-fuel-cell' | 'kitchen-sink';
interface MESSModel3DProps {
    /** The design type to render */
    design: DesignType;
    /** Enable interactive controls (orbit, zoom, pan) */
    interactive?: boolean;
    /** Show grid helper */
    showGrid?: boolean;
    /** Auto-rotate the model */
    autoRotate?: boolean;
    /** Rotation speed (if autoRotate is true) */
    rotationSpeed?: number;
    /** Additional CSS classes */
    className?: string;
    /** Called when model is loaded */
    onLoad?: () => void;
    /** Called on error */
    onError?: (error: Error) => void;
    /** Click handler for model */
    onClick?: (component?: string) => void;
    /** Show component labels */
    showLabels?: boolean;
    /** Enable performance mode (reduced quality for better FPS) */
    performanceMode?: boolean;
}

/**
 * Main 3D model component for MESSAi
 * Consolidates all 3D rendering functionality
 */
declare function MESSModel3D({ design, interactive, showGrid, autoRotate, rotationSpeed, className, onLoad, onError, onClick, showLabels, performanceMode, }: MESSModel3DProps): react_jsx_runtime.JSX.Element;

/**
 * Lightweight 3D model component that uses CSS 3D transforms
 * Used in galleries to avoid WebGL context limits
 */
declare function MESSModel3DLite({ design, className, autoRotate, rotationSpeed, }: Pick<MESSModel3DProps, 'design' | 'className' | 'autoRotate' | 'rotationSpeed'>): react_jsx_runtime.JSX.Element;

/**
 * Check if WebGL is supported
 */
declare function checkWebGLSupport(): boolean;

export { Button, type ButtonProps, Card, CardContent, CardHeader, type CardProps, CardTitle, type DesignType, Input, type InputProps, MESSModel3D, MESSModel3DLite, type MESSModel3DProps, Textarea, type TextareaProps, checkWebGLSupport, cn };
