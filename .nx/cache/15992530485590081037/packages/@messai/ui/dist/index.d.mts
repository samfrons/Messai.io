import * as React from 'react';
import React__default from 'react';
import { ClassValue } from 'clsx';

interface ButtonProps extends React__default.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}
declare const Button: React__default.ForwardRefExoticComponent<ButtonProps & React__default.RefAttributes<HTMLButtonElement>>;
interface InputProps extends React__default.InputHTMLAttributes<HTMLInputElement> {
}
declare const Input: React__default.ForwardRefExoticComponent<InputProps & React__default.RefAttributes<HTMLInputElement>>;
interface CardProps extends React__default.HTMLAttributes<HTMLDivElement> {
}
declare const Card: React__default.ForwardRefExoticComponent<CardProps & React__default.RefAttributes<HTMLDivElement>>;
declare const CardHeader: React__default.ForwardRefExoticComponent<CardProps & React__default.RefAttributes<HTMLDivElement>>;
declare const CardTitle: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLHeadingElement> & React__default.RefAttributes<HTMLParagraphElement>>;
declare const CardContent: React__default.ForwardRefExoticComponent<CardProps & React__default.RefAttributes<HTMLDivElement>>;

/**
 * Utility function to merge Tailwind classes
 */
declare function cn(...inputs: ClassValue[]): string;
/**
 * Design tokens
 */
declare const theme: {
    readonly colors: {
        readonly primary: {
            readonly 50: "#eff6ff";
            readonly 100: "#dbeafe";
            readonly 500: "#3b82f6";
            readonly 900: "#1e3a8a";
        };
        readonly scientific: {
            readonly positive: "#10b981";
            readonly negative: "#ef4444";
            readonly neutral: "#6b7280";
            readonly confidence: "#8b5cf6";
        };
    };
    readonly spacing: {
        readonly xs: "0.5rem";
        readonly sm: "0.75rem";
        readonly md: "1rem";
        readonly lg: "1.5rem";
        readonly xl: "2rem";
    };
};

/**
 * Hook for managing loading states
 */
declare function useLoading(initialState?: boolean): {
    isLoading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
};
/**
 * Hook for debouncing values
 */
declare function useDebounce<T>(value: T, delay: number): T;

export { Button, type ButtonProps, Card, CardContent, CardHeader, type CardProps, CardTitle, Input, type InputProps, cn, theme, useDebounce, useLoading };
