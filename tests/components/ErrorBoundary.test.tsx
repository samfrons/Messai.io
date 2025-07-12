import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ErrorBoundary, { LiteratureErrorBoundary } from '@/components/ErrorBoundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for error boundary')
  }
  return <div>Normal component</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal component')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Refresh Page')).toBeInTheDocument()
  })

  it('shows custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('calls custom error handler when provided', () => {
    const mockErrorHandler = vi.fn()

    render(
      <ErrorBoundary onError={mockErrorHandler}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(mockErrorHandler).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('tracks errors with context when provided', () => {
    const mockGtag = vi.fn()
    ;(global as any).window = { gtag: mockGtag }
    
    // Mock production environment
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(
      <ErrorBoundary context="TestComponent">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
      description: 'TestComponent Error: Error: Test error for error boundary',
      fatal: false,
    })

    // Restore environment
    process.env.NODE_ENV = originalEnv
    delete (global as any).window
  })

  it('shows error details in development mode', () => {
    // Mock development environment
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument()

    // Restore environment
    process.env.NODE_ENV = originalEnv
  })

  it('hides error details in production mode', () => {
    // Mock production environment
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument()

    // Restore environment
    process.env.NODE_ENV = originalEnv
  })

  it('recovers from error when Try Again is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Try Again'))

    // Re-render with working component
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal component')).toBeInTheDocument()
  })

  it('refreshes page when Refresh Page is clicked', () => {
    const mockReload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByText('Refresh Page'))

    expect(mockReload).toHaveBeenCalled()
  })
})

describe('LiteratureErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <LiteratureErrorBoundary>
        <ThrowError shouldThrow={false} />
      </LiteratureErrorBoundary>
    )

    expect(screen.getByText('Normal component')).toBeInTheDocument()
  })

  it('renders literature-specific error UI when there is an error', () => {
    render(
      <LiteratureErrorBoundary>
        <ThrowError shouldThrow={true} />
      </LiteratureErrorBoundary>
    )

    expect(screen.getByText('📚❌')).toBeInTheDocument()
    expect(screen.getByText('Literature Loading Error')).toBeInTheDocument()
    expect(screen.getByText('Unable to load research papers. Please try refreshing the page.')).toBeInTheDocument()
    expect(screen.getByText('Refresh')).toBeInTheDocument()
  })

  it('tracks literature-specific errors with gtag', () => {
    const mockGtag = vi.fn()
    ;(global as any).window = { gtag: mockGtag }

    render(
      <LiteratureErrorBoundary>
        <ThrowError shouldThrow={true} />
      </LiteratureErrorBoundary>
    )

    expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
      description: 'Literature Error: Error: Test error for error boundary',
      fatal: false,
    })

    delete (global as any).window
  })

  it('refreshes page when refresh button is clicked', () => {
    const mockReload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    })

    render(
      <LiteratureErrorBoundary>
        <ThrowError shouldThrow={true} />
      </LiteratureErrorBoundary>
    )

    fireEvent.click(screen.getByText('Refresh'))

    expect(mockReload).toHaveBeenCalled()
  })

  it('has literature context for error tracking', () => {
    const mockErrorHandler = vi.fn()
    const WrappedLiteratureErrorBoundary = ({ children }: { children: React.ReactNode }) => (
      <ErrorBoundary context="Literature" onError={mockErrorHandler}>
        {children}
      </ErrorBoundary>
    )

    render(
      <WrappedLiteratureErrorBoundary>
        <ThrowError shouldThrow={true} />
      </WrappedLiteratureErrorBoundary>
    )

    expect(mockErrorHandler).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })
})

describe('ErrorBoundary Edge Cases', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('handles errors in error handler gracefully', () => {
    const faultyErrorHandler = vi.fn(() => {
      throw new Error('Error in error handler')
    })

    // Should not crash the app even if error handler throws
    expect(() => {
      render(
        <ErrorBoundary onError={faultyErrorHandler}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
    }).not.toThrow()

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('handles missing gtag gracefully', () => {
    // Ensure no global gtag
    delete (global as any).window?.gtag

    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    // Should not crash even without gtag
    expect(() => {
      render(
        <ErrorBoundary context="Test">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
    }).not.toThrow()

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('handles complex error objects', () => {
    const ComplexErrorComponent = () => {
      const error = new Error('Complex error')
      error.name = 'CustomError'
      error.stack = 'Custom stack trace\n  at line 1\n  at line 2'
      throw error
    }

    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ComplexErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument()
    
    // Click to expand details
    fireEvent.click(screen.getByText('Error Details (Development)'))
    
    expect(screen.getByText(/CustomError/)).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('handles multiple consecutive errors', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Try again - should reset error boundary
    fireEvent.click(screen.getByText('Try Again'))

    // Cause another error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Should still show error UI
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})