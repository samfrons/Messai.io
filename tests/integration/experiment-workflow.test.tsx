/**
 * Integration tests for complete experiment workflow
 * Tests the entire flow from design selection to experiment creation to prevent 404 errors
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import HomePage from '@/app/page'

// Mock Next.js navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
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

// Mock window.location.href
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
})

describe('Experiment Workflow Integration', () => {
  beforeEach(() => {
    localStorageMock.clear()
    mockPush.mockClear()
    // Reset window.location.href
    window.location.href = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should complete full experiment creation workflow without 404 errors', async () => {
    render(<HomePage />)

    // Wait for designs to load
    await waitFor(() => {
      expect(screen.getByText('Earthen Pot MFC')).toBeInTheDocument()
    })

    // Select a design
    const designCard = screen.getByText('Earthen Pot MFC').closest('div')
    expect(designCard).toBeInTheDocument()
    
    fireEvent.click(designCard!)

    // Should show parameter form
    await waitFor(() => {
      expect(screen.getByText('Setup New Experiment')).toBeInTheDocument()
    })

    // Fill in experiment parameters
    const nameInput = screen.getByLabelText('Name')
    const temperatureInput = screen.getByLabelText('Temperature (°C)')
    const phInput = screen.getByLabelText('pH Level')
    const substrateInput = screen.getByLabelText('Substrate (g/L)')

    fireEvent.change(nameInput, { target: { value: 'Test Experiment' } })
    fireEvent.change(temperatureInput, { target: { value: '30' } })
    fireEvent.change(phInput, { target: { value: '7.2' } })
    fireEvent.change(substrateInput, { target: { value: '1.5' } })

    // Submit experiment
    const submitButton = screen.getByText('Start Experiment')
    fireEvent.click(submitButton)

    // Wait for experiment creation
    await waitFor(() => {
      expect(window.location.href).toMatch(/\/experiment\/exp-/)
    }, { timeout: 2000 })

    // Check that experiment was stored in localStorage
    const storedExperiments = JSON.parse(localStorage.getItem('messai-experiments') || '[]')
    expect(storedExperiments).toHaveLength(1)
    expect(storedExperiments[0].name).toBe('Test Experiment')
    expect(storedExperiments[0].designName).toBe('Earthen Pot MFC')
    expect(storedExperiments[0].parameters.temperature).toBe(30)
  })

  it('should handle all design types without errors', async () => {
    const designTypes = [
      'Earthen Pot MFC',
      'Cardboard MFC', 
      'Mason Jar MFC',
      '3D Printed MFC',
      'Wetland MFC',
      'Micro MFC Chip',
      'Isolinear Bio-Chip',
      'Benchtop Bioreactor MFC',
      'Wastewater Treatment MFC',
      'Brewery Processing MFC',
      'BioFacade Power Cell',
      'Benthic Sediment MFC',
      'Kitchen Sink Bio-Cell'
    ]

    for (const designName of designTypes) {
      render(<HomePage />)

      // Wait for designs to load
      await waitFor(() => {
        expect(screen.getByText(designName)).toBeInTheDocument()
      })

      // Select design
      const designCard = screen.getByText(designName).closest('div')
      fireEvent.click(designCard!)

      // Should show parameter form without errors
      await waitFor(() => {
        expect(screen.getByText('Setup New Experiment')).toBeInTheDocument()
      })

      // Cancel to return to catalog for next iteration
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      // Should return to catalog
      await waitFor(() => {
        expect(screen.getByText('MFC Design Catalog')).toBeInTheDocument()
      })
    }
  })

  it('should generate unique experiment IDs', async () => {
    render(<HomePage />)

    // Create multiple experiments
    for (let i = 0; i < 3; i++) {
      // Wait for designs to load
      await waitFor(() => {
        expect(screen.getByText('Earthen Pot MFC')).toBeInTheDocument()
      })

      // Select design
      const designCard = screen.getByText('Earthen Pot MFC').closest('div')
      fireEvent.click(designCard!)

      // Fill form
      await waitFor(() => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText('Name')
      fireEvent.change(nameInput, { target: { value: `Test Experiment ${i + 1}` } })

      // Submit
      const submitButton = screen.getByText('Start Experiment')
      fireEvent.click(submitButton)

      // Wait for completion
      await waitFor(() => {
        expect(window.location.href).toMatch(/\/experiment\/exp-/)
      }, { timeout: 2000 })

      // Reset for next iteration
      window.location.href = ''
    }

    // Check that all experiments have unique IDs
    const storedExperiments = JSON.parse(localStorage.getItem('messai-experiments') || '[]')
    expect(storedExperiments).toHaveLength(3)
    
    const ids = storedExperiments.map((exp: any) => exp.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(3) // All IDs should be unique
  })

  it('should handle experiment creation errors gracefully', async () => {
    // Mock localStorage to throw an error
    const originalSetItem = localStorage.setItem
    localStorage.setItem = vi.fn(() => {
      throw new Error('Storage quota exceeded')
    })

    // Mock window.alert
    window.alert = vi.fn()

    render(<HomePage />)

    // Select design and fill form
    await waitFor(() => {
      expect(screen.getByText('Earthen Pot MFC')).toBeInTheDocument()
    })

    const designCard = screen.getByText('Earthen Pot MFC').closest('div')
    fireEvent.click(designCard!)

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
    })

    const nameInput = screen.getByLabelText('Name')
    fireEvent.change(nameInput, { target: { value: 'Test Experiment' } })

    // Submit experiment
    const submitButton = screen.getByText('Start Experiment')
    fireEvent.click(submitButton)

    // Should show error alert
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to create experiment. Please try again.')
    })

    // Should not redirect
    expect(window.location.href).toBe('')

    // Restore localStorage
    localStorage.setItem = originalSetItem
  })

  it('should validate required form fields', async () => {
    render(<HomePage />)

    // Select design
    await waitFor(() => {
      expect(screen.getByText('Earthen Pot MFC')).toBeInTheDocument()
    })

    const designCard = screen.getByText('Earthen Pot MFC').closest('div')
    fireEvent.click(designCard!)

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
    })

    // Clear the name field (it has a default value)
    const nameInput = screen.getByLabelText('Name')
    fireEvent.change(nameInput, { target: { value: '' } })

    // Try to submit without required fields
    const submitButton = screen.getByText('Start Experiment')
    fireEvent.click(submitButton)

    // Form should not submit (HTML5 validation)
    expect(window.location.href).toBe('')
  })

  it('should preserve experiment data structure', async () => {
    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('Micro MFC Chip')).toBeInTheDocument()
    })

    // Select a new design type
    const designCard = screen.getByText('Micro MFC Chip').closest('div')
    fireEvent.click(designCard!)

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
    })

    // Fill form with specific values
    const nameInput = screen.getByLabelText('Name')
    const notesInput = screen.getByLabelText('Notes')
    
    fireEvent.change(nameInput, { target: { value: 'Micro Chip Test' } })
    fireEvent.change(notesInput, { target: { value: 'Testing micro-scale design' } })

    // Submit
    const submitButton = screen.getByText('Start Experiment')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(window.location.href).toMatch(/\/experiment\/exp-/)
    })

    // Verify data structure
    const storedExperiments = JSON.parse(localStorage.getItem('messai-experiments') || '[]')
    const experiment = storedExperiments[0]

    expect(experiment).toHaveProperty('id')
    expect(experiment).toHaveProperty('name', 'Micro Chip Test')
    expect(experiment).toHaveProperty('designName', 'Micro MFC Chip')
    expect(experiment).toHaveProperty('designType', 'micro-chip')
    expect(experiment).toHaveProperty('status', 'setup')
    expect(experiment).toHaveProperty('createdAt')
    expect(experiment).toHaveProperty('parameters')
    expect(experiment).toHaveProperty('stats')
    
    expect(experiment.parameters).toHaveProperty('notes', 'Testing micro-scale design')
    expect(experiment.stats).toHaveProperty('totalMeasurements', 0)
  })
})