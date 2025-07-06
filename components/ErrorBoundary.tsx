'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full h-full flex items-center justify-center bg-lcars-black border border-lcars-gray rounded-lcars p-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon points="50,20 70,35 70,65 50,80 30,65 30,35" fill="#4A90E2" stroke="#2E5984" strokeWidth="2"/>
              </svg>
            </div>
            <p className="text-lcars-tan text-sm">3D Preview Unavailable</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}