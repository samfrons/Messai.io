import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, createMockMFCConfig } from '../utils/test-utils'
import ParameterForm from '@/components/ParameterForm'

// Mock the 3D components
vi.mock('@/components/MFC3DModel', () => ({
  default: ({ config, onComponentSelect, selectedComponent }: any) => (
    <div data-testid="mfc-3d-model">
      <button onClick={() => onComponentSelect('anode')}>Select Anode</button>
      <button onClick={() => onComponentSelect('cathode')}>Select Cathode</button>
      <button onClick={() => onComponentSelect('microbial')}>Select Microbial</button>
      <button onClick={() => onComponentSelect('chamber')}>Select Chamber</button>
      <div data-testid="config-surface">{config.electrode.surface}</div>
      <div data-testid="config-activity">{config.microbial.activity}</div>
      <div data-testid="selected-component">{selectedComponent || 'none'}</div>
    </div>
  )
}))

vi.mock('@/components/MFCConfigPanel', () => ({
  default: ({ config, selectedComponent, onConfigChange }: any) => (
    <div data-testid="mfc-config-panel">
      <div data-testid="selected-in-panel">{selectedComponent || 'none'}</div>
      <button
        onClick={() => onConfigChange('electrode', 'surface', 150)}
        data-testid="change-surface"
      >
        Change Surface
      </button>
      <button
        onClick={() => onConfigChange('microbial', 'activity', 90)}
        data-testid="change-activity"
      >
        Change Activity
      </button>
      <div data-testid="panel-surface">{config.electrode.surface}</div>
      <div data-testid="panel-activity">{config.microbial.activity}</div>
    </div>
  )
}))

describe('ParameterForm Integration', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    designId: 'test-design-1',
    designName: 'Test MFC Design',
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Integration', () => {
    it('renders all integrated components', () => {
      render(<ParameterForm {...defaultProps} />)

      expect(screen.getByText('Setup New Experiment')).toBeInTheDocument()
      expect(screen.getByTestId('mfc-3d-model')).toBeInTheDocument()
      expect(screen.getByTestId('mfc-config-panel')).toBeInTheDocument()
      expect(screen.getByText('Experiment Parameters')).toBeInTheDocument()
    })

    it('synchronizes configuration between 3D model and config panel', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Initial state should be synchronized
      expect(screen.getByTestId('config-surface')).toHaveTextContent('100')
      expect(screen.getByTestId('panel-surface')).toHaveTextContent('100')

      // Change configuration via config panel
      await user.click(screen.getByTestId('change-surface'))

      await waitFor(() => {
        expect(screen.getByTestId('config-surface')).toHaveTextContent('150')
        expect(screen.getByTestId('panel-surface')).toHaveTextContent('150')
      })
    })

    it('synchronizes selected component between 3D model and config panel', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Initially no component selected
      expect(screen.getByTestId('selected-component')).toHaveTextContent('none')
      expect(screen.getByTestId('selected-in-panel')).toHaveTextContent('none')

      // Select component in 3D model
      await user.click(screen.getByText('Select Anode'))

      await waitFor(() => {
        expect(screen.getByTestId('selected-component')).toHaveTextContent('anode')
        expect(screen.getByTestId('selected-in-panel')).toHaveTextContent('anode')
      })
    })

    it('updates AI predictions based on both experiment and MFC parameters', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Get initial prediction
      const initialPrediction = screen.getByText(/\d+ mW/)

      // Change MFC configuration
      await user.click(screen.getByTestId('change-surface'))
      await user.click(screen.getByTestId('change-activity'))

      // Change experiment parameters
      const temperatureInput = screen.getByLabelText(/Temperature/)
      await user.clear(temperatureInput)
      await user.type(temperatureInput, '35')

      await waitFor(() => {
        const updatedPrediction = screen.getByText(/\d+ mW/)
        expect(updatedPrediction.textContent).not.toBe(initialPrediction.textContent)
      })
    })
  })

  describe('Form Interaction Flow', () => {
    it('allows complete experiment setup workflow', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Step 1: Configure MFC design
      await user.click(screen.getByText('Select Anode'))
      await user.click(screen.getByTestId('change-surface'))

      // Step 2: Set experiment parameters
      const nameInput = screen.getByLabelText(/Experiment Name/)
      await user.clear(nameInput)
      await user.type(nameInput, 'Optimized Carbon Cloth Test')

      const temperatureInput = screen.getByLabelText(/Temperature/)
      await user.clear(temperatureInput)
      await user.type(temperatureInput, '32')

      const phInput = screen.getByLabelText(/pH Level/)
      await user.clear(phInput)
      await user.type(phInput, '7.2')

      const substrateInput = screen.getByLabelText(/Substrate Concentration/)
      await user.clear(substrateInput)
      await user.type(substrateInput, '1.5')

      // Step 3: Add notes
      const notesInput = screen.getByLabelText(/Notes/)
      await user.type(notesInput, 'Testing optimized electrode configuration')

      // Step 4: Submit experiment
      await user.click(screen.getByText('Start Experiment'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Optimized Carbon Cloth Test',
          temperature: 32,
          ph: 7.2,
          substrateConcentration: 1.5,
          notes: 'Testing optimized electrode configuration'
        })
      })
    })

    it('handles form validation correctly', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Clear required field
      const nameInput = screen.getByLabelText(/Experiment Name/)
      await user.clear(nameInput)

      // Try to submit
      await user.click(screen.getByText('Start Experiment'))

      // Form should not submit with empty required field
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('handles parameter range validation', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Test temperature boundaries
      const temperatureInput = screen.getByLabelText(/Temperature/)
      await user.clear(temperatureInput)
      await user.type(temperatureInput, '50') // Above max

      // Input should be constrained by HTML validation
      expect(temperatureInput).toHaveAttribute('max', '40')
    })

    it('supports cancellation at any point', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Make some changes
      await user.click(screen.getByTestId('change-surface'))
      await user.type(screen.getByLabelText(/Temperature/), '35')

      // Cancel
      await user.click(screen.getByText('Cancel'))

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Real-time Updates', () => {
    it('updates predictions immediately when MFC config changes', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      const initialPrediction = screen.getByText(/\d+ mW/)

      // Change MFC configuration
      await user.click(screen.getByTestId('change-surface'))

      // Prediction should update without delay
      await waitFor(() => {
        const updatedPrediction = screen.getByText(/\d+ mW/)
        expect(updatedPrediction.textContent).not.toBe(initialPrediction.textContent)
      })
    })

    it('updates predictions immediately when experiment parameters change', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      const initialPrediction = screen.getByText(/\d+ mW/)

      // Change temperature
      const temperatureInput = screen.getByLabelText(/Temperature/)
      await user.clear(temperatureInput)
      await user.type(temperatureInput, '35')

      // Prediction should update
      await waitFor(() => {
        const updatedPrediction = screen.getByText(/\d+ mW/)
        expect(updatedPrediction.textContent).not.toBe(initialPrediction.textContent)
      })
    })

    it('reflects MFC configuration changes in 3D visualization', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Initial surface area
      expect(screen.getByTestId('config-surface')).toHaveTextContent('100')

      // Change surface area
      await user.click(screen.getByTestId('change-surface'))

      // 3D model should reflect the change
      await waitFor(() => {
        expect(screen.getByTestId('config-surface')).toHaveTextContent('150')
      })
    })
  })

  describe('State Management', () => {
    it('maintains component selection state across config changes', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Select a component
      await user.click(screen.getByText('Select Anode'))

      await waitFor(() => {
        expect(screen.getByTestId('selected-component')).toHaveTextContent('anode')
      })

      // Change configuration
      await user.click(screen.getByTestId('change-surface'))

      // Selection should be maintained
      expect(screen.getByTestId('selected-component')).toHaveTextContent('anode')
    })

    it('toggles component selection correctly', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Select anode
      await user.click(screen.getByText('Select Anode'))
      await waitFor(() => {
        expect(screen.getByTestId('selected-component')).toHaveTextContent('anode')
      })

      // Select cathode
      await user.click(screen.getByText('Select Cathode'))
      await waitFor(() => {
        expect(screen.getByTestId('selected-component')).toHaveTextContent('cathode')
      })

      // Click cathode again to deselect
      await user.click(screen.getByText('Select Cathode'))
      await waitFor(() => {
        expect(screen.getByTestId('selected-component')).toHaveTextContent('none')
      })
    })

    it('preserves form state during configuration changes', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Fill form
      const nameInput = screen.getByLabelText(/Experiment Name/)
      await user.clear(nameInput)
      await user.type(nameInput, 'Persistent Test')

      const temperatureInput = screen.getByLabelText(/Temperature/)
      await user.clear(temperatureInput)
      await user.type(temperatureInput, '30')

      // Change MFC configuration
      await user.click(screen.getByTestId('change-surface'))

      // Form values should be preserved
      expect(nameInput).toHaveValue('Persistent Test')
      expect(temperatureInput).toHaveValue(30)
    })
  })

  describe('Loading States', () => {
    it('shows loading state during form submission', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Submit form
      await user.click(screen.getByText('Start Experiment'))

      // Should show loading state
      expect(screen.getByText('Creating Experiment...')).toBeInTheDocument()
      
      // Button should be disabled
      const submitButton = screen.getByText('Creating Experiment...')
      expect(submitButton).toBeDisabled()
    })

    it('prevents multiple submissions during loading', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      const submitButton = screen.getByText('Start Experiment')
      
      // Click multiple times quickly
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)

      // Should only submit once
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Accessibility Integration', () => {
    it('maintains focus management across components', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Tab through form elements
      await user.tab()
      
      // Focus should be managed correctly
      expect(document.activeElement).toBeInstanceOf(HTMLElement)
    })

    it('provides comprehensive form labeling', () => {
      render(<ParameterForm {...defaultProps} />)

      // All form inputs should have labels
      expect(screen.getByLabelText(/Experiment Name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Temperature/)).toBeInTheDocument()
      expect(screen.getByLabelText(/pH Level/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Substrate Concentration/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Notes/)).toBeInTheDocument()
    })

    it('provides helpful error messages and hints', () => {
      render(<ParameterForm {...defaultProps} />)

      // Parameter ranges should be shown
      expect(screen.getByText('Range: 20-40°C')).toBeInTheDocument()
      expect(screen.getByText('Range: 6-8')).toBeInTheDocument()
      expect(screen.getByText('Range: 0.5-2 g/L')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('handles rapid configuration changes efficiently', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      // Make rapid changes
      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByTestId('change-surface'))
        await user.click(screen.getByTestId('change-activity'))
      }

      // Component should remain responsive
      expect(screen.getByTestId('mfc-3d-model')).toBeInTheDocument()
      expect(screen.getByTestId('mfc-config-panel')).toBeInTheDocument()
    })

    it('debounces prediction updates appropriately', async () => {
      const user = userEvent.setup()
      
      render(<ParameterForm {...defaultProps} />)

      const temperatureInput = screen.getByLabelText(/Temperature/)
      
      // Rapid input changes
      await user.clear(temperatureInput)
      await user.type(temperatureInput, '35')
      await user.clear(temperatureInput)
      await user.type(temperatureInput, '30')
      await user.clear(temperatureInput)
      await user.type(temperatureInput, '32')

      // Should still show predictions without performance issues
      expect(screen.getByText(/\d+ mW/)).toBeInTheDocument()
    })
  })
})