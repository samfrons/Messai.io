'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@messai/ui'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    console.error('3D Component Error:', error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.retry} />
      }

      return (
        <div className="flex flex-col items-center justify-center h-full bg-red-50 p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">3D Rendering Error</h2>
            <p className="text-red-600 mb-4">
              Something went wrong while loading the 3D model. This could be due to WebGL compatibility issues.
            </p>
            
            <div className="space-y-2 mb-6">
              <div className="text-sm text-red-700">
                <strong>Error:</strong> {this.state.error?.message}
              </div>
              {this.state.errorInfo && (
                <details className="text-xs text-red-600 text-left">
                  <summary className="cursor-pointer">Technical Details</summary>
                  <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={this.retry}
                variant="primary"
                size="sm"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Reload Page
              </Button>
            </div>
            
            <div className="mt-4 text-xs text-red-500">
              <p>If this problem persists, please check:</p>
              <ul className="text-left mt-1 space-y-1">
                <li>• WebGL is enabled in your browser</li>
                <li>• Your graphics drivers are up to date</li>
                <li>• Try using a different browser</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary