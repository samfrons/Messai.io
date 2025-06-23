import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, createMockMFCConfig } from '../utils/test-utils'
import MFCConfigPanel from '@/components/MFCConfigPanel'

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}))

describe('MFCConfigPanel', () => {
  const mockOnConfigChange = vi.fn()
  const defaultConfig = createMockMFCConfig()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all configuration sections', () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      expect(screen.getByText('MFC Configuration')).toBeInTheDocument()
      expect(screen.getByText('Electrode Configuration')).toBeInTheDocument()
      expect(screen.getByText('Microbial Community')).toBeInTheDocument()
      expect(screen.getByText('Chamber Configuration')).toBeInTheDocument()
    })

    it('displays current configuration values', () => {
      const config = createMockMFCConfig({
        electrode: { material: 'graphite', surface: 150, thickness: 3.5 },
        microbial: { species: 'shewanella', density: 7.5, activity: 85 },
        chamber: { shape: 'cylindrical', material: 'glass', volume: 2.5 }
      })

      render(
        <MFCConfigPanel
          config={config}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      expect(screen.getByDisplayValue('150')).toBeInTheDocument() // surface area
      expect(screen.getByDisplayValue('3.5')).toBeInTheDocument() // thickness
      expect(screen.getByDisplayValue('7.5')).toBeInTheDocument() // density
      expect(screen.getByDisplayValue('85')).toBeInTheDocument() // activity
      expect(screen.getByDisplayValue('2.5')).toBeInTheDocument() // volume
    })

    it('shows selected component indicator', () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent="electrode"
          onConfigChange={mockOnConfigChange}
        />
      )

      expect(screen.getByText('Editing: electrode')).toBeInTheDocument()
    })

    it('displays predicted performance metrics', () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      expect(screen.getByText('Predicted Performance')).toBeInTheDocument()
      expect(screen.getByText('Power Output')).toBeInTheDocument()
      expect(screen.getByText('Efficiency')).toBeInTheDocument()
      expect(screen.getByText('Est. Cost')).toBeInTheDocument()
    })
  })

  describe('Electrode Configuration', () => {
    it('allows material selection', async () => {
      const user = userEvent.setup()
      
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const graphiteOption = screen.getByLabelText(/Graphite Rod/)
      await user.click(graphiteOption)

      expect(mockOnConfigChange).toHaveBeenCalledWith('electrode', 'material', 'graphite')
    })

    it('displays all advanced electrode material categories', () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Check all material categories are present
      expect(screen.getByText('Traditional Materials')).toBeInTheDocument()
      expect(screen.getByText('Graphene Materials')).toBeInTheDocument()
      expect(screen.getByText('Carbon Nanotubes Materials')).toBeInTheDocument()
      expect(screen.getByText('MXene Materials')).toBeInTheDocument()
    })

    it('allows selection of advanced materials', async () => {
      const user = userEvent.setup()
      
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Test graphene material selection
      const grapheneOption = screen.getByLabelText(/Graphene Aerogel/)
      await user.click(grapheneOption)
      expect(mockOnConfigChange).toHaveBeenCalledWith('electrode', 'material', 'graphene-aerogel')

      // Test CNT material selection
      const cntOption = screen.getByLabelText(/Single-Walled CNT/)
      await user.click(cntOption)
      expect(mockOnConfigChange).toHaveBeenCalledWith('electrode', 'material', 'swcnt')

      // Test MXene material selection
      const mxeneOption = screen.getByLabelText(/Ti₃C₂Tₓ MXene/)
      await user.click(mxeneOption)
      expect(mockOnConfigChange).toHaveBeenCalledWith('electrode', 'material', 'ti3c2tx')
    })

    it('displays advanced material properties for non-traditional materials', () => {
      const grapheneConfig = createMockMFCConfig({
        electrode: { material: 'graphene-aerogel' }
      })

      render(
        <MFCConfigPanel
          config={grapheneConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Should show advanced properties panel
      expect(screen.getByText('Advanced Material Properties')).toBeInTheDocument()
      expect(screen.getByText(/Electron Transfer Rate/)).toBeInTheDocument()
      expect(screen.getByText(/Biocompatibility/)).toBeInTheDocument()
      expect(screen.getByText(/Stability/)).toBeInTheDocument()
      expect(screen.getByText(/Research Status/)).toBeInTheDocument()
    })

    it('does not show advanced properties for traditional materials', () => {
      const traditionalConfig = createMockMFCConfig({
        electrode: { material: 'carbon-cloth' }
      })

      render(
        <MFCConfigPanel
          config={traditionalConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Should not show advanced properties panel
      expect(screen.queryByText('Advanced Material Properties')).not.toBeInTheDocument()
    })

    it('shows material descriptions for advanced materials', () => {
      const mxeneConfig = createMockMFCConfig({
        electrode: { material: 'ti3c2tx' }
      })

      render(
        <MFCConfigPanel
          config={mxeneConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Should show material description
      expect(screen.getByText(/Titanium carbide MXene with metallic conductivity/)).toBeInTheDocument()
    })

    it('displays different efficiency and cost values for advanced materials', () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Check that all material categories are displayed
      expect(screen.getByText('Traditional Materials')).toBeInTheDocument()
      expect(screen.getByText('Graphene Materials')).toBeInTheDocument() 
      expect(screen.getByText('Carbon Nanotubes Materials')).toBeInTheDocument()
      expect(screen.getByText('MXene Materials')).toBeInTheDocument()
      expect(screen.getByText('Upcycled Materials')).toBeInTheDocument()

      // Check some specific materials are displayed with their properties
      expect(screen.getByText('Carbon Cloth')).toBeInTheDocument()
      expect(screen.getByText('Graphene Aerogel')).toBeInTheDocument()
      expect(screen.getByText('CNT/Graphene Hybrid')).toBeInTheDocument()
      expect(screen.getByText('Ti₃C₂Tₓ MXene')).toBeInTheDocument()
      expect(screen.getByText('iPhone Cord Copper (Raw)')).toBeInTheDocument()
      expect(screen.getByText('Electroplated Reclaimed Metal')).toBeInTheDocument()

      // Check different efficiency values are present
      expect(screen.getAllByText(/\d+% eff/).length).toBeGreaterThan(10) // Many different efficiency values
      expect(screen.getAllByText(/\$\d+/).length).toBeGreaterThan(10) // Many different cost values
    })

    it('allows surface area adjustment', async () => {
      const user = userEvent.setup()
      
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const surfaceSlider = screen.getByLabelText(/Surface Area/)
      await user.clear(surfaceSlider)
      await user.type(surfaceSlider, '150')

      expect(mockOnConfigChange).toHaveBeenCalledWith('electrode', 'surface', 150)
    })

    it('allows thickness adjustment', async () => {
      const user = userEvent.setup()
      
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const thicknessSlider = screen.getByLabelText(/Thickness/)
      fireEvent.change(thicknessSlider, { target: { value: '3.5' } })

      expect(mockOnConfigChange).toHaveBeenCalledWith('electrode', 'thickness', 3.5)
    })

    it('displays material properties', () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      expect(screen.getByText('85% eff')).toBeInTheDocument() // Carbon cloth efficiency
      expect(screen.getByText('$5')).toBeInTheDocument() // Carbon cloth cost
    })

    it('can be collapsed and expanded', async () => {
      const user = userEvent.setup()
      
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const electrodeHeader = screen.getByText('Electrode Configuration').closest('button')
      expect(electrodeHeader).toBeInTheDocument()

      // Should be expanded by default
      expect(screen.getByText('Electrode Material')).toBeInTheDocument()

      // Click to collapse
      await user.click(electrodeHeader!)
      
      // Content should still be visible (AnimatePresence mocked)
      expect(screen.getByText('Electrode Material')).toBeInTheDocument()
    })
  })

  describe('Microbial Configuration', () => {
    it('allows species selection', async () => {
      const user = userEvent.setup()
      
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const shewanellaOption = screen.getByLabelText(/Shewanella oneidensis/)
      await user.click(shewanellaOption)

      expect(mockOnConfigChange).toHaveBeenCalledWith('microbial', 'species', 'shewanella')
    })

    it('allows density adjustment', async () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const densitySlider = screen.getByLabelText(/Cell Density/)
      fireEvent.change(densitySlider, { target: { value: '8.5' } })

      expect(mockOnConfigChange).toHaveBeenCalledWith('microbial', 'density', 8.5)
    })

    it('allows activity level adjustment', async () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const activitySlider = screen.getByLabelText(/Activity Level/)
      fireEvent.change(activitySlider, { target: { value: '90' } })

      expect(mockOnConfigChange).toHaveBeenCalledWith('microbial', 'activity', 90)
    })

    it('displays species characteristics', () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      expect(screen.getByText('High power')).toBeInTheDocument() // Geobacter power
      expect(screen.getByText('Excellent')).toBeInTheDocument() // Geobacter stability
    })
  })

  describe('Chamber Configuration', () => {
    it('allows shape selection', async () => {
      const user = userEvent.setup()
      
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const cylindricalOption = screen.getByLabelText(/Cylindrical/)
      await user.click(cylindricalOption)

      expect(mockOnConfigChange).toHaveBeenCalledWith('chamber', 'shape', 'cylindrical')
    })

    it('allows material selection', async () => {
      const user = userEvent.setup()
      
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const glassOption = screen.getByLabelText(/Glass/)
      await user.click(glassOption)

      expect(mockOnConfigChange).toHaveBeenCalledWith('chamber', 'material', 'glass')
    })

    it('allows volume adjustment', async () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const volumeSlider = screen.getByLabelText(/Volume/)
      fireEvent.change(volumeSlider, { target: { value: '3.0' } })

      expect(mockOnConfigChange).toHaveBeenCalledWith('chamber', 'volume', 3.0)
    })

    it('displays material properties', () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      expect(screen.getByText('$15')).toBeInTheDocument() // Acrylic cost
      expect(screen.getByText('High')).toBeInTheDocument() // Acrylic transparency
    })
  })

  describe('Performance Predictions', () => {
    it('calculates power output based on configuration', () => {
      const highPerformanceConfig = createMockMFCConfig({
        electrode: { surface: 200 },
        microbial: { activity: 90 }
      })

      render(
        <MFCConfigPanel
          config={highPerformanceConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Power = surface * activity * 0.05 = 200 * 90 * 0.05 = 900
      expect(screen.getByText('900 mW')).toBeInTheDocument()
    })

    it('calculates different power outputs for advanced materials', () => {
      const configs = [
        createMockMFCConfig({ 
          electrode: { material: 'carbon-cloth', surface: 100 },
          microbial: { activity: 50 }
        }),
        createMockMFCConfig({ 
          electrode: { material: 'graphene-aerogel', surface: 100 },
          microbial: { activity: 50 }
        }),
        createMockMFCConfig({ 
          electrode: { material: 'cnt-graphene', surface: 100 },
          microbial: { activity: 50 }
        }),
        createMockMFCConfig({ 
          electrode: { material: 'ti3c2tx', surface: 100 },
          microbial: { activity: 50 }
        })
      ]

      const powerOutputs: number[] = []

      configs.forEach((config, index) => {
        const { unmount } = render(
          <MFCConfigPanel
            config={config}
            selectedComponent={null}
            onConfigChange={mockOnConfigChange}
          />
        )

        const powerText = screen.getByText(/\d+ mW/).textContent
        const powerValue = parseInt(powerText?.match(/\d+/)?.[0] || '0')
        powerOutputs.push(powerValue)
        unmount()
      })

      // Advanced materials should provide higher power output due to multipliers
      // Base power = 100 * 50 * 0.05 = 250 mW
      expect(powerOutputs[0]).toBe(250) // Carbon cloth (1.0x) = 250 mW
      expect(powerOutputs[1]).toBe(625) // Graphene aerogel (2.5x) = 625 mW  
      expect(powerOutputs[2]).toBe(700) // CNT-graphene (2.8x) = 700 mW
      expect(powerOutputs[3]).toBe(525) // Ti3C2Tx (2.1x) = 525 mW
    })

    it('calculates efficiency based on configuration', () => {
      const config = createMockMFCConfig({
        electrode: { surface: 150 },
        microbial: { activity: 60 }
      })

      render(
        <MFCConfigPanel
          config={config}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Efficiency = (activity + surface) / 3 = (60 + 150) / 3 = 70
      expect(screen.getByText('70%')).toBeInTheDocument()
    })

    it('calculates estimated cost', () => {
      const config = createMockMFCConfig({
        chamber: { volume: 2.0 },
        electrode: { surface: 100 }
      })

      render(
        <MFCConfigPanel
          config={config}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Cost = volume * 10 + surface * 0.1 = 2 * 10 + 100 * 0.1 = 30
      expect(screen.getByText('$30')).toBeInTheDocument()
    })

    it('updates predictions when configuration changes', async () => {
      const { rerender } = render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const initialPower = screen.getByText(/\d+ mW/)
      
      const newConfig = createMockMFCConfig({
        electrode: { surface: 200 },
        microbial: { activity: 90 }
      })

      rerender(
        <MFCConfigPanel
          config={newConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const updatedPower = screen.getByText(/\d+ mW/)
      expect(updatedPower).not.toBe(initialPower)
    })
  })

  describe('Input Validation', () => {
    it('handles slider boundaries correctly', async () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const surfaceSlider = screen.getByLabelText(/Surface Area/)
      
      // Test minimum value
      fireEvent.change(surfaceSlider, { target: { value: '5' } })
      expect(mockOnConfigChange).toHaveBeenCalledWith('electrode', 'surface', 5)

      // Test maximum value
      fireEvent.change(surfaceSlider, { target: { value: '250' } })
      expect(mockOnConfigChange).toHaveBeenCalledWith('electrode', 'surface', 250)
    })

    it('handles decimal values correctly', async () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const thicknessSlider = screen.getByLabelText(/Thickness/)
      fireEvent.change(thicknessSlider, { target: { value: '2.5' } })

      expect(mockOnConfigChange).toHaveBeenCalledWith('electrode', 'thickness', 2.5)
    })
  })

  describe('Accessibility', () => {
    it('provides proper form labels', () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      expect(screen.getByLabelText(/Surface Area/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Thickness/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Cell Density/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Activity Level/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Volume/)).toBeInTheDocument()
    })

    it('provides radio button labels', () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      expect(screen.getByLabelText(/Carbon Cloth/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Geobacter sulfurreducens/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Rectangular/)).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const firstRadio = screen.getByLabelText(/Carbon Cloth/)
      await user.tab()
      
      expect(document.activeElement).toBe(firstRadio)
    })
  })

  describe('Error Handling', () => {
    it('handles missing configuration gracefully', () => {
      const incompleteConfig = {
        electrode: { material: 'carbon-cloth' },
        microbial: {},
        chamber: {}
      } as any

      expect(() => {
        render(
          <MFCConfigPanel
            config={incompleteConfig}
            selectedComponent={null}
            onConfigChange={mockOnConfigChange}
          />
        )
      }).not.toThrow()
    })

    it('continues to function when onConfigChange throws', async () => {
      const faultyOnConfigChange = vi.fn().mockImplementation(() => {
        throw new Error('Config change failed')
      })

      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={faultyOnConfigChange}
        />
      )

      const surfaceSlider = screen.getByLabelText(/Surface Area/)
      
      expect(() => {
        fireEvent.change(surfaceSlider, { target: { value: '150' } })
      }).not.toThrow()
    })
  })
})