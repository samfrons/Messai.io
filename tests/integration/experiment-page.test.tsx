/**
 * Integration tests for experiment page functionality
 * Tests experiment loading, error handling, and localStorage integration
 */

import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ExperimentPage from '@/app/experiment/[id]/page'

// Mock Next.js useParams
const mockParams = { id: 'test-experiment-id' }
vi.mock('next/navigation', () => ({
  useParams: () => mockParams,
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock URL and Blob for CSV download functionality
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()
global.Blob = vi.fn() as any

describe('Experiment Page Integration', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('should load experiment from localStorage successfully', async () => {
    // Set up stored experiment
    const testExperiment = {
      id: 'test-experiment-id',
      name: 'Test Experiment',
      designName: 'Earthen Pot MFC',
      designType: 'earthen-pot',
      status: 'running',
      createdAt: '2024-01-15T10:00:00Z',
      parameters: {
        temperature: 30,
        ph: 7.2,
        substrateConcentration: 1.5,
        notes: 'Test notes'
      },
      stats: {
        totalMeasurements: 100,
        averagePower: 200,
        maxPower: 250,
        efficiency: 80
      }
    }

    localStorage.setItem('messai-experiments', JSON.stringify([testExperiment]))

    render(<ExperimentPage />)

    // Should show loading initially
    expect(screen.getByText(/Loading/i)).toBeInTheDocument()

    // Should load experiment data
    await waitFor(() => {
      expect(screen.getByText('Test Experiment')).toBeInTheDocument()
    })

    expect(screen.getByText('Earthen Pot MFC')).toBeInTheDocument()
    expect(screen.getByText('30°C')).toBeInTheDocument()
    expect(screen.getByText('7.2')).toBeInTheDocument()
    expect(screen.getByText('1.5 g/L')).toBeInTheDocument()
  })

  it('should fallback to demo data when experiment not found in localStorage', async () => {
    // No stored experiments
    localStorage.setItem('messai-experiments', JSON.stringify([]))

    render(<ExperimentPage />)

    // Should load demo data
    await waitFor(() => {
      expect(screen.getByText('Demo Experiment')).toBeInTheDocument()
    })

    expect(screen.getByText('Demo MFC Design')).toBeInTheDocument()
  })

  it('should handle localStorage errors gracefully', async () => {
    // Mock localStorage.getItem to throw an error
    const originalGetItem = localStorage.getItem
    localStorage.getItem = vi.fn(() => {
      throw new Error('Storage not available')
    })

    render(<ExperimentPage />)

    // Should show error state
    await waitFor(() => {
      expect(screen.getByText('Failed to load experiment data')).toBeInTheDocument()
    })

    expect(screen.getByText('Return to Design Catalog')).toBeInTheDocument()

    // Restore localStorage
    localStorage.getItem = originalGetItem
  })

  it('should handle malformed localStorage data', async () => {
    // Set malformed JSON in localStorage
    localStorage.setItem('messai-experiments', 'invalid-json')

    render(<ExperimentPage />)

    // Should show error state
    await waitFor(() => {
      expect(screen.getByText('Failed to load experiment data')).toBeInTheDocument()
    })
  })

  it('should load correct experiment when multiple experiments exist', async () => {
    const experiments = [
      {
        id: 'experiment-1',
        name: 'First Experiment',
        designName: 'Design 1',
        designType: 'earthen-pot',
        status: 'completed',
        createdAt: '2024-01-01T10:00:00Z',
        parameters: { temperature: 25, ph: 7.0, substrateConcentration: 1.0 },
        stats: { totalMeasurements: 50, averagePower: 150, maxPower: 200, efficiency: 70 }
      },
      {
        id: 'test-experiment-id',
        name: 'Target Experiment',
        designName: 'Design 2',
        designType: 'mason-jar',
        status: 'running',
        createdAt: '2024-01-02T10:00:00Z',
        parameters: { temperature: 28, ph: 7.1, substrateConcentration: 1.2 },
        stats: { totalMeasurements: 75, averagePower: 180, maxPower: 220, efficiency: 75 }
      },
      {
        id: 'experiment-3',
        name: 'Third Experiment',
        designName: 'Design 3',
        designType: '3d-printed',
        status: 'setup',
        createdAt: '2024-01-03T10:00:00Z',
        parameters: { temperature: 30, ph: 7.2, substrateConcentration: 1.4 },
        stats: { totalMeasurements: 25, averagePower: 160, maxPower: 190, efficiency: 72 }
      }
    ]

    localStorage.setItem('messai-experiments', JSON.stringify(experiments))

    render(<ExperimentPage />)

    // Should load the correct experiment (Target Experiment)
    await waitFor(() => {
      expect(screen.getByText('Target Experiment')).toBeInTheDocument()
    })

    expect(screen.getByText('Design 2')).toBeInTheDocument()
    expect(screen.getByText('28°C')).toBeInTheDocument()
    expect(screen.getByText('7.1')).toBeInTheDocument()

    // Should not show other experiments
    expect(screen.queryByText('First Experiment')).not.toBeInTheDocument()
    expect(screen.queryByText('Third Experiment')).not.toBeInTheDocument()
  })

  it('should display all experiment stats correctly', async () => {
    const testExperiment = {
      id: 'test-experiment-id',
      name: 'Stats Test Experiment',
      designName: 'Test Design',
      designType: 'earthen-pot',
      status: 'running',
      createdAt: '2024-01-15T10:00:00Z',
      parameters: {
        temperature: 32,
        ph: 6.8,
        substrateConcentration: 1.8,
        notes: 'Comprehensive stats test'
      },
      stats: {
        totalMeasurements: 1500,
        averagePower: 285.7,
        maxPower: 345.2,
        efficiency: 87.3
      }
    }

    localStorage.setItem('messai-experiments', JSON.stringify([testExperiment]))

    render(<ExperimentPage />)

    await waitFor(() => {
      expect(screen.getByText('Stats Test Experiment')).toBeInTheDocument()
    })

    // Check that all stats are displayed
    expect(screen.getByText('1,500')).toBeInTheDocument() // totalMeasurements formatted
    expect(screen.getByText('285.7 mW')).toBeInTheDocument() // averagePower
    expect(screen.getByText('345.2 mW')).toBeInTheDocument() // maxPower
    expect(screen.getByText('87.3%')).toBeInTheDocument() // efficiency
  })

  it('should handle different experiment statuses correctly', async () => {
    const statuses = ['setup', 'running', 'completed', 'paused', 'failed']

    for (const status of statuses) {
      localStorageMock.clear()
      
      const testExperiment = {
        id: 'test-experiment-id',
        name: `${status} Experiment`,
        designName: 'Test Design',
        designType: 'earthen-pot',
        status: status,
        createdAt: '2024-01-15T10:00:00Z',
        parameters: { temperature: 25, ph: 7.0, substrateConcentration: 1.0 },
        stats: { totalMeasurements: 0, averagePower: 0, maxPower: 0, efficiency: 0 }
      }

      localStorage.setItem('messai-experiments', JSON.stringify([testExperiment]))

      render(<ExperimentPage />)

      await waitFor(() => {
        expect(screen.getByText(`${status} Experiment`)).toBeInTheDocument()
      })

      // Status should be displayed with proper formatting
      const statusElement = screen.getByText(status.charAt(0).toUpperCase() + status.slice(1))
      expect(statusElement).toBeInTheDocument()
    }
  })

  it('should validate experiment data structure', async () => {
    // Test with minimal valid experiment
    const minimalExperiment = {
      id: 'test-experiment-id',
      name: 'Minimal Experiment',
      designName: 'Minimal Design',
      status: 'setup',
      createdAt: '2024-01-15T10:00:00Z',
      parameters: {
        temperature: 25,
        ph: 7.0,
        substrateConcentration: 1.0
      },
      stats: {
        totalMeasurements: 0,
        averagePower: 0,
        maxPower: 0,
        efficiency: 0
      }
    }

    localStorage.setItem('messai-experiments', JSON.stringify([minimalExperiment]))

    render(<ExperimentPage />)

    await waitFor(() => {
      expect(screen.getByText('Minimal Experiment')).toBeInTheDocument()
    })

    // Should handle missing optional fields gracefully
    expect(screen.getByText('Minimal Design')).toBeInTheDocument()
  })
})