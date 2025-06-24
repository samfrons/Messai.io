/**
 * Regression tests for design functionality
 * Ensures all design types work correctly and new additions don't break existing features
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import HomePage from '@/app/page'
import ParameterForm from '@/components/ParameterForm'
import MFCDesignCard from '@/components/MFCDesignCard'

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
})

describe('Design Functionality Regression Tests', () => {
  const allDesignTypes = [
    { name: 'Earthen Pot MFC', type: 'earthen-pot', legacy: true },
    { name: 'Cardboard MFC', type: 'cardboard', legacy: true },
    { name: 'Mason Jar MFC', type: 'mason-jar', legacy: true },
    { name: '3D Printed MFC', type: '3d-printed', legacy: true },
    { name: 'Wetland MFC', type: 'wetland', legacy: true },
    { name: 'Micro MFC Chip', type: 'micro-chip', legacy: false },
    { name: 'Isolinear Bio-Chip', type: 'isolinear-chip', legacy: false },
    { name: 'Benchtop Bioreactor MFC', type: 'benchtop-bioreactor', legacy: false },
    { name: 'Wastewater Treatment MFC', type: 'wastewater-treatment', legacy: false },
    { name: 'Brewery Processing MFC', type: 'brewery-processing', legacy: false },
    { name: 'BioFacade Power Cell', type: 'architectural-facade', legacy: false },
    { name: 'Benthic Sediment MFC', type: 'benthic-fuel-cell', legacy: false },
    { name: 'Kitchen Sink Bio-Cell', type: 'kitchen-sink', legacy: false }
  ]

  it('should render all 13 design types without errors', async () => {
    render(<HomePage />)

    // Wait for all designs to load
    await waitFor(() => {
      expect(screen.getByText('MFC Design Catalog')).toBeInTheDocument()
    })

    // Check that all designs are present
    for (const design of allDesignTypes) {
      expect(screen.getByText(design.name)).toBeInTheDocument()
    }
  })

  it('should display correct visual indicators for 3D vs legacy designs', async () => {
    const mockDesign = {
      id: '1',
      name: 'Test Design',
      type: 'micro-chip',
      cost: '$5',
      powerOutput: '10-50 mW/m²',
      materials: { features: 'Lab-on-chip design' }
    }

    const mockOnSelect = vi.fn()

    render(<MFCDesignCard design={mockDesign} onSelect={mockOnSelect} />)

    // Should show 3D badge for new designs
    expect(screen.getByText('3D')).toBeInTheDocument()
    expect(screen.getByText('Explore 3D Model')).toBeInTheDocument()
    expect(screen.getByText('Lab-on-chip design')).toBeInTheDocument()
  })

  it('should display correct visual indicators for legacy designs', async () => {
    const mockDesign = {
      id: '1',
      name: 'Test Legacy Design',
      type: 'earthen-pot',
      cost: '$1',
      powerOutput: '100-500 mW/m²',
      materials: { container: 'Clay pot' }
    }

    const mockOnSelect = vi.fn()

    render(<MFCDesignCard design={mockDesign} onSelect={mockOnSelect} />)

    // Should NOT show 3D badge for legacy designs
    expect(screen.queryByText('3D')).not.toBeInTheDocument()
    expect(screen.getByText('Select Design')).toBeInTheDocument()
    expect(screen.queryByText('Lab-on-chip design')).not.toBeInTheDocument()
  })

  it('should correctly pass design type to ParameterForm', async () => {
    const mockDesign = {
      id: 'test-id',
      name: 'Test Design',
      type: 'benchtop-bioreactor',
      cost: '$350',
      powerOutput: '1-5 W/m²',
      materials: {}
    }

    const mockOnSubmit = vi.fn()
    const mockOnCancel = vi.fn()

    render(
      <ParameterForm
        designId={mockDesign.id}
        designName={mockDesign.name}
        designType={mockDesign.type}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    // Should render without errors
    expect(screen.getByText('Setup New Experiment')).toBeInTheDocument()
    expect(screen.getByText('Test Design')).toBeInTheDocument()
  })

  it('should maintain cost progression across design scales', async () => {
    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('MFC Design Catalog')).toBeInTheDocument()
    })

    // Verify cost progression from lab to industrial scale
    const expectedCosts = [
      { name: 'Cardboard MFC', cost: '$0.50' },
      { name: 'Earthen Pot MFC', cost: '$1' },
      { name: 'Micro MFC Chip', cost: '$5' },
      { name: 'Mason Jar MFC', cost: '$10' },
      { name: 'Isolinear Bio-Chip', cost: '$25' },
      { name: '3D Printed MFC', cost: '$30' },
      { name: 'Kitchen Sink Bio-Cell', cost: '$85' },
      { name: 'Wetland MFC', cost: '$100' },
      { name: 'Benthic Sediment MFC', cost: '$150' },
      { name: 'Benchtop Bioreactor MFC', cost: '$350' },
      { name: 'Brewery Processing MFC', cost: '$1,800' },
      { name: 'Wastewater Treatment MFC', cost: '$2,500' },
      { name: 'BioFacade Power Cell', cost: '$5,000' }
    ]

    for (const { name, cost } of expectedCosts) {
      const designElement = screen.getByText(name).closest('div')
      expect(designElement).toContainElement(screen.getByText(cost))
    }
  })

  it('should maintain power output progression across design scales', async () => {
    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('MFC Design Catalog')).toBeInTheDocument()
    })

    // Verify power output ranges are realistic and progressive
    const expectedPowerOutputs = [
      { name: 'Micro MFC Chip', power: '10-50 mW/m²' },
      { name: 'Cardboard MFC', power: '50-200 mW/m²' },
      { name: 'Isolinear Bio-Chip', power: '80-200 mW/m²' },
      { name: 'Earthen Pot MFC', power: '100-500 mW/m²' },
      { name: 'Kitchen Sink Bio-Cell', power: '100-500 mW/m²' },
      { name: 'Mason Jar MFC', power: '200-400 mW/m²' },
      { name: '3D Printed MFC', power: '300-750 mW/m²' },
      { name: 'Wetland MFC', power: '500-3000 mW/m²' },
      { name: 'Benchtop Bioreactor MFC', power: '1-5 W/m²' },
      { name: 'Wastewater Treatment MFC', power: '2-10 W/m²' },
      { name: 'Brewery Processing MFC', power: '3-8 W/m²' },
      { name: 'Benthic Sediment MFC', power: '5-25 W/m²' },
      { name: 'BioFacade Power Cell', power: '10-50 W/m²' }
    ]

    for (const { name, power } of expectedPowerOutputs) {
      const designElement = screen.getByText(name).closest('div')
      expect(designElement).toContainElement(screen.getByText(power))
    }
  })

  it('should handle design selection state correctly', async () => {
    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('MFC Design Catalog')).toBeInTheDocument()
    })

    // Initially should show catalog
    expect(screen.getByText('Choose from our collection of validated microbial fuel cell designs')).toBeInTheDocument()

    // Select a design
    const designCard = screen.getByText('Earthen Pot MFC').closest('div')
    fireEvent.click(designCard!)

    // Should show parameter form
    await waitFor(() => {
      expect(screen.getByText('Setup New Experiment')).toBeInTheDocument()
    })

    // Should not show catalog anymore
    expect(screen.queryByText('Choose from our collection of validated microbial fuel cell designs')).not.toBeInTheDocument()

    // Cancel should return to catalog
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.getByText('Choose from our collection of validated microbial fuel cell designs')).toBeInTheDocument()
    })
  })

  it('should preserve design data integrity during workflow', async () => {
    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('BioFacade Power Cell')).toBeInTheDocument()
    })

    // Select a complex design
    const designCard = screen.getByText('BioFacade Power Cell').closest('div')
    fireEvent.click(designCard!)

    await waitFor(() => {
      expect(screen.getByText('Setup New Experiment')).toBeInTheDocument()
    })

    // Verify design name is preserved
    expect(screen.getByText('BioFacade Power Cell')).toBeInTheDocument()

    // Check that the form displays correct design info
    expect(screen.getByText(/Configure parameters and design for your BioFacade Power Cell/)).toBeInTheDocument()
  })

  it('should handle all design types in parameter form without errors', async () => {
    const mockOnSubmit = vi.fn()
    const mockOnCancel = vi.fn()

    for (const design of allDesignTypes) {
      render(
        <ParameterForm
          designId="test-id"
          designName={design.name}
          designType={design.type}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      // Should render without errors
      expect(screen.getByText('Setup New Experiment')).toBeInTheDocument()
      expect(screen.getByText(design.name)).toBeInTheDocument()

      // Should have all required form fields
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Temperature (°C)')).toBeInTheDocument()
      expect(screen.getByLabelText('pH Level')).toBeInTheDocument()
      expect(screen.getByLabelText('Substrate (g/L)')).toBeInTheDocument()
      expect(screen.getByLabelText('Notes')).toBeInTheDocument()

      // Should have 3D model area
      expect(screen.getByText('3D MFC Model')).toBeInTheDocument()
      expect(screen.getByText('Click components to configure')).toBeInTheDocument()
    }
  })

  it('should maintain consistent loading behavior', async () => {
    render(<HomePage />)

    // Should show loading state initially
    expect(screen.getByText(/Loading/i)).toBeInTheDocument()

    // Should load all designs within reasonable time
    await waitFor(() => {
      expect(screen.getByText('MFC Design Catalog')).toBeInTheDocument()
    }, { timeout: 1000 })

    // Should show correct number of design cards
    const designCards = screen.getAllByText('Select Design').concat(screen.getAllByText('Explore 3D Model'))
    expect(designCards).toHaveLength(13)
  })

  it('should handle edge cases in design data', async () => {
    // Test with design that has minimal data
    const minimalDesign = {
      id: '1',
      name: 'Minimal Design',
      type: 'test-type',
      cost: '$0',
      powerOutput: '0 mW/m²',
      materials: {}
    }

    const mockOnSelect = vi.fn()

    render(<MFCDesignCard design={minimalDesign} onSelect={mockOnSelect} />)

    // Should render without errors
    expect(screen.getByText('Minimal Design')).toBeInTheDocument()
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(screen.getByText('0 mW/m²')).toBeInTheDocument()

    // Should use fallback button text for unknown type
    expect(screen.getByText('Select Design')).toBeInTheDocument()
  })
})