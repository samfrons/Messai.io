import React from 'react';
import { cn } from './utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, iconPosition = 'left', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                {icon}
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              // Base styles
              'block w-full rounded-md border-0 py-2.5 text-gray-900 dark:text-gray-100',
              'bg-white dark:bg-gray-800',
              'ring-1 ring-inset',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:ring-2 focus:ring-inset',
              'sm:text-sm sm:leading-6',
              'transition-colors duration-200',
              
              // Normal state
              !error && [
                'ring-gray-300 dark:ring-gray-600',
                'focus:ring-primary-500'
              ],
              
              // Error state
              error && [
                'ring-red-300 dark:ring-red-600',
                'focus:ring-red-500'
              ],
              
              // Icon padding
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              !icon && 'px-3',
              
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? 'error-message' : hint ? 'hint-message' : undefined}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                {icon}
              </span>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" id="error-message">
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400" id="hint-message">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea variant
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={cn(
            // Base styles
            'block w-full rounded-md border-0 px-3 py-2.5',
            'text-gray-900 dark:text-gray-100',
            'bg-white dark:bg-gray-800',
            'ring-1 ring-inset',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:ring-2 focus:ring-inset',
            'sm:text-sm sm:leading-6',
            'transition-colors duration-200',
            'resize-y min-h-[80px]',
            
            // Normal state
            !error && [
              'ring-gray-300 dark:ring-gray-600',
              'focus:ring-primary-500'
            ],
            
            // Error state
            error && [
              'ring-red-300 dark:ring-red-600',
              'focus:ring-red-500'
            ],
            
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? 'error-message' : hint ? 'hint-message' : undefined}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" id="error-message">
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400" id="hint-message">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';