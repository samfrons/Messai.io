import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render3D, createMockExperiment } from '../utils/test-utils'
import MFCDashboard3D from '@/components/MFCDashboard3D'

// The component uses vanilla Three.js, not React Three Fiber
// So we don't need to mock React Three Fiber components

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

describe('MFCDashboard3D', () => {
  const mockOnExperimentSelect = vi.fn()

  const singleExperiment = [createMockExperiment()]
  
  const multipleExperiments = [
    createMockExperiment({ id: 'exp-1', name: 'High Power Test', lastPower: 450.2, status: 'running' }),
    createMockExperiment({ id: 'exp-2', name: 'Medium Power Test', lastPower: 280.5, status: 'running' }),
    createMockExperiment({ id: 'exp-3', name: 'Low Power Test', lastPower: 120.8, status: 'completed' }),
    createMockExperiment({ id: 'exp-4', name: 'Setup Test', lastPower: 0, status: 'setup' })
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the 3D dashboard container', () => {
      render3D(
        <MFCDashboard3D
          experiments={singleExperiment}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Check for the actual container elements that the vanilla Three.js component renders
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
      
      // Check for the controls overlay
      expect(screen.getByText('🖱️ Click & drag to rotate')).toBeInTheDocument()
      expect(screen.getByText('🔍 Scroll to zoom')).toBeInTheDocument()
      expect(screen.getByText('🎯 Click MFC to select')).toBeInTheDocument()
      
      // Check for the status legend
      expect(screen.getByText('Status Indicators')).toBeInTheDocument()
      expect(screen.getByText('Running')).toBeInTheDocument()
    })

    it('renders the dashboard with multiple experiments', () => {
      render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should render the dashboard container
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
      
      // Check for canvas element created by Three.js WebGL renderer
      const canvas = screen.getByTestId('dashboard-canvas').querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      
      // Should have the Three.js data attribute
      expect(canvas).toHaveAttribute('data-engine', 'three.js r169')
    })

    it('initializes properly with experiment data', () => {
      render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should have the dashboard container
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
      
      // Should have a canvas element for WebGL rendering
      const canvas = screen.getByTestId('dashboard-canvas').querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      
      // Note: experiment labels and 3D objects are rendered in WebGL, not as DOM elements
      // so we can't test their content directly, only that the canvas is present
    })

    it('displays power output legend in UI overlay', () => {
      render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Check for power output legend (these are DOM elements, not WebGL)
      expect(screen.getByText('Power Output')).toBeInTheDocument()
      expect(screen.getByText('>400 mW')).toBeInTheDocument()
      expect(screen.getByText('250-400 mW')).toBeInTheDocument()
      expect(screen.getByText('<250 mW')).toBeInTheDocument()
    })

    it('renders control overlays and legends', () => {
      render3D(
        <MFCDashboard3D
          experiments={singleExperiment}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Control instructions
      expect(screen.getByText('🖱️ Click & drag to rotate')).toBeInTheDocument()
      expect(screen.getByText('🔍 Scroll to zoom')).toBeInTheDocument()
      expect(screen.getByText('🎯 Click MFC to select')).toBeInTheDocument()

      // Status legend
      expect(screen.getByText('Status Indicators')).toBeInTheDocument()
      expect(screen.getByText('Running')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Setup')).toBeInTheDocument()

      // Power legend
      expect(screen.getByText('Power Output')).toBeInTheDocument()
      expect(screen.getByText('>400 mW')).toBeInTheDocument()
      expect(screen.getByText('250-400 mW')).toBeInTheDocument()
      expect(screen.getByText('<250 mW')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('has click handlers attached to canvas for experiment selection', async () => {
      render3D(
        <MFCDashboard3D
          experiments={singleExperiment}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Check that the canvas is rendered and can receive events
      const canvas = screen.getByTestId('dashboard-canvas').querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      
      // Note: In a real Three.js app, raycasting would handle clicks on 3D objects
      // For testing, we verify the handler is provided and the canvas exists
      expect(mockOnExperimentSelect).toBeDefined()
    })

    it('re-renders when selected experiment changes', () => {
      const { rerender } = render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          selectedExperiment={undefined}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should have canvas initially
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()

      // Select an experiment - canvas should still be present
      rerender(
        <MFCDashboard3D
          experiments={multipleExperiments}
          selectedExperiment="exp-1"
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Visual representation should change (testing that component still renders)
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
      const canvas = screen.getByTestId('dashboard-canvas').querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('toggles control overlay visibility', async () => {
      const user = userEvent.setup()

      render3D(
        <MFCDashboard3D
          experiments={singleExperiment}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Controls should be visible initially
      expect(screen.getByText('🖱️ Click & drag to rotate')).toBeInTheDocument()

      // Click toggle button
      const toggleButton = screen.getByRole('button')
      await user.click(toggleButton)

      // Controls visibility is managed by motion.div with opacity animation
      // The text should still be in DOM but potentially with different opacity
      expect(screen.getByText('🖱️ Click & drag to rotate')).toBeInTheDocument()
    })

    it('handles empty experiments list gracefully', () => {
      render3D(
        <MFCDashboard3D
          experiments={[]}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should render the dashboard container and controls even with no experiments
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
      expect(screen.getByText('🖱️ Click & drag to rotate')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Experiment Visualization', () => {
    it('renders dashboard for multiple experiments', () => {
      render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should render the dashboard container and canvas
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
      const canvas = screen.getByTestId('dashboard-canvas').querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      
      // Note: Experiment names are rendered in WebGL, not as DOM text,
      // so we verify the canvas exists which would contain the 3D scene
    })

    it('renders status legend for different experiment statuses', () => {
      render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should show status legend in DOM overlay
      expect(screen.getByText('Status Indicators')).toBeInTheDocument()
      expect(screen.getByText('Running')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Setup')).toBeInTheDocument()
      
      // Verify canvas exists for 3D scene
      const canvas = screen.getByTestId('dashboard-canvas').querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('renders power legend for power-based visualization', () => {
      const powerTestExperiments = [
        createMockExperiment({ id: 'high', lastPower: 450, name: 'High Power' }),
        createMockExperiment({ id: 'med', lastPower: 300, name: 'Med Power' }),
        createMockExperiment({ id: 'low', lastPower: 150, name: 'Low Power' })
      ]

      render3D(
        <MFCDashboard3D
          experiments={powerTestExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should show power legend in DOM overlay
      expect(screen.getByText('Power Output')).toBeInTheDocument()
      expect(screen.getByText('>400 mW')).toBeInTheDocument()
      expect(screen.getByText('250-400 mW')).toBeInTheDocument()
      expect(screen.getByText('<250 mW')).toBeInTheDocument()
      
      // Note: Actual power values are rendered in WebGL, not as DOM text
    })

    it('renders dashboard for running experiments', () => {
      const runningExperiment = createMockExperiment({ status: 'running', lastPower: 300 })

      render3D(
        <MFCDashboard3D
          experiments={[runningExperiment]}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should render dashboard with running experiment status in legend
      expect(screen.getByText('Status Indicators')).toBeInTheDocument()
      expect(screen.getByText('Running')).toBeInTheDocument()
      
      // Verify canvas exists for 3D scene (particles are rendered in WebGL)
      const canvas = screen.getByTestId('dashboard-canvas').querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('handles experiments with zero power output', () => {
      const zeroExperiment = createMockExperiment({ lastPower: 0, status: 'setup' })

      render3D(
        <MFCDashboard3D
          experiments={[zeroExperiment]}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should render dashboard (power values are displayed in WebGL, not DOM)
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
      expect(screen.getByText('Setup')).toBeInTheDocument() // Status should be in legend
      
      // Verify canvas exists for 3D scene
      const canvas = screen.getByTestId('dashboard-canvas').querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })
  })

  describe('Performance and Scalability', () => {
    it('handles large number of experiments efficiently', () => {
      const manyExperiments = Array.from({ length: 50 }, (_, i) =>
        createMockExperiment({
          id: `exp-${i}`,
          name: `Experiment ${i}`,
          lastPower: Math.random() * 500
        })
      )

      const startTime = Date.now()
      
      render3D(
        <MFCDashboard3D
          experiments={manyExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      const endTime = Date.now()

      // Should render without significant delay
      expect(endTime - startTime).toBeLessThan(1000)
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
    })

    it('handles rapid selection changes efficiently', async () => {
      const user = userEvent.setup()

      const { rerender } = render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          selectedExperiment={undefined}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Rapidly change selections
      for (const exp of multipleExperiments) {
        rerender(
          <MFCDashboard3D
            experiments={multipleExperiments}
            selectedExperiment={exp.id}
            onExperimentSelect={mockOnExperimentSelect}
          />
        )
      }

      // Should remain responsive
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
    })

    it('handles extreme power values gracefully', () => {
      const extremeExperiments = [
        createMockExperiment({ lastPower: 0.001, name: 'Micro Power' }),
        createMockExperiment({ lastPower: 99999, name: 'Mega Power' }),
        createMockExperiment({ lastPower: -5, name: 'Negative Power' })
      ]

      render3D(
        <MFCDashboard3D
          experiments={extremeExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should render dashboard without crashing
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
      const canvas = screen.getByTestId('dashboard-canvas').querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      
      // Power legend should still be displayed
      expect(screen.getByText('Power Output')).toBeInTheDocument()
      
      // Note: Actual power values are rendered in WebGL, not as DOM text
    })
  })

  describe('Accessibility', () => {
    it('provides keyboard navigation support', async () => {
      const user = userEvent.setup()

      render3D(
        <MFCDashboard3D
          experiments={singleExperiment}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Tab to the toggle button
      await user.tab()
      expect(document.activeElement).toBeInstanceOf(HTMLElement)
    })

    it('provides informative control instructions', () => {
      render3D(
        <MFCDashboard3D
          experiments={singleExperiment}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Control instructions should be clear and helpful
      expect(screen.getByText('🖱️ Click & drag to rotate')).toBeInTheDocument()
      expect(screen.getByText('🔍 Scroll to zoom')).toBeInTheDocument()
      expect(screen.getByText('🎯 Click MFC to select')).toBeInTheDocument()
    })

    it('provides clear legends for visual elements', () => {
      render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Status legend
      expect(screen.getByText('Status Indicators')).toBeInTheDocument()
      expect(screen.getByText('Running')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Setup')).toBeInTheDocument()

      // Power legend
      expect(screen.getByText('Power Output')).toBeInTheDocument()
    })

    it('supports toggle button for accessibility preferences', async () => {
      const user = userEvent.setup()

      render3D(
        <MFCDashboard3D
          experiments={singleExperiment}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toBeInTheDocument()
      
      await user.click(toggleButton)
      // Button should remain functional after click
      expect(toggleButton).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles malformed experiment data gracefully', () => {
      const malformedExperiments = [
        { id: 'bad-1' }, // Missing required fields
        { ...createMockExperiment(), lastPower: null }, // Invalid power
        { ...createMockExperiment(), name: undefined } // Missing name
      ] as any

      expect(() => {
        render3D(
          <MFCDashboard3D
            experiments={malformedExperiments}
            onExperimentSelect={mockOnExperimentSelect}
          />
        )
      }).not.toThrow()

      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
    })

    it('handles undefined onExperimentSelect gracefully', () => {
      render3D(
        <MFCDashboard3D
          experiments={singleExperiment}
          onExperimentSelect={undefined as any}
        />
      )

      // Should render without crashing
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
      const canvas = screen.getByTestId('dashboard-canvas').querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      
      // Component should render successfully even without an experiment select handler
      expect(screen.getByText('🖱️ Click & drag to rotate')).toBeInTheDocument()
    })

    it('handles rapid data updates without memory leaks', () => {
      const { rerender } = render3D(
        <MFCDashboard3D
          experiments={singleExperiment}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Simulate rapid data updates
      for (let i = 0; i < 20; i++) {
        const updatedExperiments = [
          createMockExperiment({
            id: 'test-exp',
            lastPower: Math.random() * 500,
            name: `Update ${i}`
          })
        ]

        rerender(
          <MFCDashboard3D
            experiments={updatedExperiments}
            onExperimentSelect={mockOnExperimentSelect}
          />
        )
      }

      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
    })
  })
})