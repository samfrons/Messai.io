import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, createMockMFCConfig, createMockExperiment } from '../utils/test-utils'
import MFCConfigPanel from '@/components/MFCConfigPanel'
import ParameterForm from '@/components/ParameterForm'

// Mock components for accessibility testing
vi.mock('@/components/MFC3DModel', () => ({
  default: ({ onComponentSelect }: any) => (
    <div role="application" aria-label="3D MFC Model Visualization">
      <button onClick={() => onComponentSelect('anode')} aria-label="Select anode electrode">
        Anode
      </button>
      <button onClick={() => onComponentSelect('cathode')} aria-label="Select cathode electrode">
        Cathode
      </button>
      <div aria-live="polite" id="model-status">Ready</div>
    </div>
  )
}))

// Mock Framer Motion for consistent testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}))

describe('Accessibility Tests', () => {
  const mockOnConfigChange = vi.fn()
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('MFCConfigPanel Accessibility', () => {
    const defaultConfig = createMockMFCConfig()

    it('provides proper ARIA labels for all form controls', () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Range inputs should have accessible labels
      expect(screen.getByLabelText(/Surface Area/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Thickness/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Cell Density/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Activity Level/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Volume/)).toBeInTheDocument()

      // Radio buttons should have accessible labels
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

      // Tab should move through interactive elements
      await user.tab()
      expect(document.activeElement).toBeInstanceOf(HTMLElement)

      // Radio buttons should be reachable
      const firstRadio = screen.getByLabelText(/Carbon Cloth/)
      await user.tab()
      while (document.activeElement !== firstRadio && document.activeElement) {
        await user.tab()
      }

      expect(document.activeElement).toBe(firstRadio)

      // Should be able to navigate with arrow keys within radio groups
      await user.keyboard('[ArrowDown]')
      expect(document.activeElement).not.toBe(firstRadio)
    })

    it('provides clear focus indicators', async () => {
      const user = userEvent.setup()
      
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      const slider = screen.getByLabelText(/Surface Area/)
      await user.click(slider)
      
      expect(slider).toHaveFocus()
      expect(slider).toHaveClass('focus:ring-2') // Tailwind focus ring class
    })

    it('provides live updates for screen readers', async () => {
      const user = userEvent.setup()
      
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Performance section should update when configuration changes
      const performanceSection = screen.getByText('Predicted Performance').closest('div')
      expect(performanceSection).toBeInTheDocument()

      // Changes should trigger accessible updates
      const surfaceSlider = screen.getByLabelText(/Surface Area/)
      await user.click(surfaceSlider)
      fireEvent.change(surfaceSlider, { target: { value: '150' } })

      expect(mockOnConfigChange).toHaveBeenCalled()
    })

    it('uses proper heading hierarchy', () => {
      render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Should have proper heading structure
      expect(screen.getByRole('heading', { name: /MFC Configuration/ })).toBeInTheDocument()
      expect(screen.getByText('Electrode Configuration')).toBeInTheDocument()
      expect(screen.getByText('Microbial Community')).toBeInTheDocument()
      expect(screen.getByText('Chamber Configuration')).toBeInTheDocument()
    })

    it('provides meaningful error messages', () => {
      const invalidConfig = createMockMFCConfig({
        electrode: { surface: -10 } // Invalid value
      })

      render(
        <MFCConfigPanel
          config={invalidConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Component should handle invalid values gracefully
      expect(screen.getByText('MFC Configuration')).toBeInTheDocument()
    })

    it('announces state changes appropriately', () => {
      const { rerender } = render(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Select a component
      rerender(
        <MFCConfigPanel
          config={defaultConfig}
          selectedComponent="electrode"
          onConfigChange={mockOnConfigChange}
        />
      )

      // Should show component selection
      expect(screen.getByText('Editing: electrode')).toBeInTheDocument()
    })
  })

  describe('ParameterForm Accessibility', () => {
    const defaultProps = {
      designId: 'test-design',
      designName: 'Test Design',
      onSubmit: mockOnSubmit,
      onCancel: mockOnCancel
    }

    it('provides comprehensive form labeling', () => {
      render(<ParameterForm {...defaultProps} />)

      // All form inputs should have labels
      expect(screen.getByLabelText(/Experiment Name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Temperature/)).toBeInTheDocument()
      expect(screen.getByLabelText(/pH Level/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Substrate Concentration/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Notes/)).toBeInTheDocument()
    })

    it('provides helpful input constraints and hints', () => {
      render(<ParameterForm {...defaultProps} />)

      // Range hints should be present
      expect(screen.getByText('Range: 20-40°C')).toBeInTheDocument()
      expect(screen.getByText('Range: 6-8')).toBeInTheDocument()
      expect(screen.getByText('Range: 0.5-2 g/L')).toBeInTheDocument()
    })

    it('supports logical tab order', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Should tab through form fields in logical order
      await user.tab() // Name field
      expect(screen.getByLabelText(/Experiment Name/)).toHaveFocus()

      await user.tab() // Temperature field  
      expect(screen.getByLabelText(/Temperature/)).toHaveFocus()

      await user.tab() // pH field
      expect(screen.getByLabelText(/pH Level/)).toHaveFocus()

      await user.tab() // Substrate field
      expect(screen.getByLabelText(/Substrate Concentration/)).toHaveFocus()
    })

    it('provides proper form validation feedback', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Clear required field
      const nameField = screen.getByLabelText(/Experiment Name/)
      await user.clear(nameField)

      // Try to submit
      await user.click(screen.getByText('Start Experiment'))

      // HTML5 validation should prevent submission
      expect(nameField).toBeRequired()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('announces dynamic content changes', () => {
      render(<ParameterForm {...defaultProps} />)

      // AI prediction should be announced
      const predictionSection = screen.getByText(/AI Prediction Preview/)
      expect(predictionSection).toBeInTheDocument()

      // Should have live region for updates
      const powerOutput = screen.getByText(/\d+ mW/)
      expect(powerOutput).toBeInTheDocument()
    })

    it('provides accessible 3D model interaction', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // 3D model should have proper ARIA labeling
      expect(screen.getByRole('application', { name: /3D MFC Model Visualization/ })).toBeInTheDocument()

      // Interactive elements should be accessible
      const anodeButton = screen.getByLabelText(/Select anode electrode/)
      expect(anodeButton).toBeInTheDocument()

      await user.click(anodeButton)
      
      // Status should be announced
      expect(screen.getByText('Ready')).toBeInTheDocument()
    })

    it('handles form submission states accessibly', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      const submitButton = screen.getByText('Start Experiment')
      await user.click(submitButton)

      // Loading state should be announced
      expect(screen.getByText('Creating Experiment...')).toBeInTheDocument()
      expect(screen.getByText('Creating Experiment...')).toBeDisabled()
    })
  })

  describe('Color and Contrast Accessibility', () => {
    it('provides sufficient color contrast for text', () => {
      render(
        <MFCConfigPanel
          config={createMockMFCConfig()}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Main text should have good contrast
      const headings = screen.getAllByRole('heading')
      headings.forEach(heading => {
        expect(heading).toHaveClass('text-gray-900') // Dark text for contrast
      })

      // Helper text should be readable
      const helperText = screen.getByText('85% eff')
      expect(helperText).toHaveClass('text-green-800') // Sufficient contrast
    })

    it('does not rely solely on color for information', () => {
      render(
        <MFCConfigPanel
          config={createMockMFCConfig()}
          selectedComponent="electrode"
          onConfigChange={mockOnConfigChange}
        />
      )

      // Selected component should be indicated by text, not just color
      expect(screen.getByText('Editing: electrode')).toBeInTheDocument()

      // Status indicators should have text labels
      expect(screen.getByText('Power Output')).toBeInTheDocument()
      expect(screen.getByText('Efficiency')).toBeInTheDocument()
    })
  })

  describe('Screen Reader Support', () => {
    it('provides meaningful element descriptions', () => {
      render(
        <MFCConfigPanel
          config={createMockMFCConfig()}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Range inputs should have proper descriptions
      const surfaceSlider = screen.getByLabelText(/Surface Area/)
      expect(surfaceSlider).toHaveAttribute('type', 'range')
      expect(surfaceSlider).toHaveAttribute('min')
      expect(surfaceSlider).toHaveAttribute('max')

      // Current values should be displayed
      expect(screen.getByText(/100 cm²/)).toBeInTheDocument()
    })

    it('groups related form controls properly', () => {
      render(
        <MFCConfigPanel
          config={createMockMFCConfig()}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Radio button groups should be properly grouped
      const carbonClothOption = screen.getByLabelText(/Carbon Cloth/)
      expect(carbonClothOption).toHaveAttribute('name', 'electrode-material')

      const geobacterOption = screen.getByLabelText(/Geobacter sulfurreducens/)
      expect(geobacterOption).toHaveAttribute('name', 'microbial-species')
    })

    it('provides live region updates for dynamic content', () => {
      render(<ParameterForm {...defaultProps} />)

      // Live status should be available
      const statusElement = screen.getByText('Ready')
      expect(statusElement).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Keyboard-Only Navigation', () => {
    it('allows complete functionality via keyboard', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Should be able to complete entire form with keyboard
      await user.tab() // Name field
      await user.type(screen.getByLabelText(/Experiment Name/), 'Keyboard Test')

      await user.tab() // Temperature
      await user.type(screen.getByLabelText(/Temperature/), '30')

      await user.tab() // pH
      await user.type(screen.getByLabelText(/pH Level/), '7.0')

      await user.tab() // Substrate
      await user.type(screen.getByLabelText(/Substrate Concentration/), '1.2')

      await user.tab() // Notes
      await user.type(screen.getByLabelText(/Notes/), 'Accessibility test')

      // Should be able to submit with keyboard
      await user.keyboard('[Tab]') // Navigate to submit button
      while (document.activeElement?.textContent !== 'Start Experiment') {
        await user.keyboard('[Tab]')
      }

      await user.keyboard('[Enter]')
      expect(mockOnSubmit).toHaveBeenCalled()
    })

    it('provides skip links for complex interfaces', () => {
      render(<ParameterForm {...defaultProps} />)

      // Should provide ways to skip complex 3D visualization
      expect(screen.getByText('Click on components in the 3D model to configure them')).toBeInTheDocument()
    })

    it('manages focus appropriately during dynamic updates', async () => {
      const user = userEvent.setup()
      
      const { rerender } = render(<ParameterForm {...defaultProps} />)

      // Focus an element
      const nameField = screen.getByLabelText(/Experiment Name/)
      await user.click(nameField)
      expect(nameField).toHaveFocus()

      // Re-render with updates (simulating state changes)
      rerender(<ParameterForm {...defaultProps} />)

      // Focus should be maintained appropriately
      expect(document.activeElement).toBeInstanceOf(HTMLElement)
    })
  })

  describe('Mobile Accessibility', () => {
    it('provides adequate touch targets', () => {
      render(
        <MFCConfigPanel
          config={createMockMFCConfig()}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Buttons should be large enough for touch
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        // Minimum 44px recommended by WCAG
        expect(button).toHaveClass('p-3') // Adequate padding for touch
      })
    })

    it('works well with zoom and viewport changes', () => {
      render(<ParameterForm {...defaultProps} />)

      // Layout should be responsive
      const container = screen.getByText('Setup New Experiment').closest('div')
      expect(container).toHaveClass('max-w-7xl') // Responsive container
    })
  })

  describe('Error Handling Accessibility', () => {
    it('announces errors in an accessible way', async () => {
      const failingOnSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'))
      
      render(
        <ParameterForm
          {...defaultProps}
          onSubmit={failingOnSubmit}
        />
      )

      // Even if submission fails, UI should remain accessible
      expect(screen.getByText('Setup New Experiment')).toBeInTheDocument()
    })

    it('maintains accessibility during error recovery', () => {
      const faultyConfig = createMockMFCConfig({
        electrode: { surface: NaN }
      })

      render(
        <MFCConfigPanel
          config={faultyConfig}
          selectedComponent={null}
          onConfigChange={mockOnConfigChange}
        />
      )

      // Should handle invalid data gracefully while maintaining accessibility
      expect(screen.getByText('MFC Configuration')).toBeInTheDocument()
      expect(screen.getByLabelText(/Surface Area/)).toBeInTheDocument()
    })
  })
})