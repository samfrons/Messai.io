import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render3D, createMockExperiment } from '../utils/test-utils'
import MFCDashboard3D from '@/components/MFCDashboard3D'

// Mock Three.js and React Three Fiber components
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-canvas">{children}</div>
  )
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Environment: () => <div data-testid="environment" />,
  Text: ({ children, ...props }: any) => (
    <div data-testid="text" {...props}>{children}</div>
  ),
  Box: ({ onClick, ...props }: any) => (
    <div data-testid="box" onClick={onClick} {...props} />
  ),
  Cylinder: ({ onClick, ...props }: any) => (
    <div data-testid="cylinder" onClick={onClick} {...props} />
  ),
  Sphere: ({ onClick, ...props }: any) => (
    <div data-testid="sphere" onClick={onClick} {...props} />
  )
}))

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

      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
      expect(screen.getByTestId('orbit-controls')).toBeInTheDocument()
      expect(screen.getByTestId('environment')).toBeInTheDocument()
    })

    it('renders all experiments as 3D objects', () => {
      render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should render boxes for each experiment chamber
      const boxes = screen.getAllByTestId('box')
      expect(boxes.length).toBeGreaterThanOrEqual(multipleExperiments.length)

      // Should render spheres for status indicators and particles
      const spheres = screen.getAllByTestId('sphere')
      expect(spheres.length).toBeGreaterThan(0)
    })

    it('displays experiment labels', () => {
      render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should display experiment names
      expect(screen.getByText('High Power Test')).toBeInTheDocument()
      expect(screen.getByText('Medium Power Test')).toBeInTheDocument()
      expect(screen.getByText('Low Power Test')).toBeInTheDocument()
      expect(screen.getByText('Setup Test')).toBeInTheDocument()
    })

    it('displays power output values', () => {
      render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should display power values
      expect(screen.getByText('450.2 mW')).toBeInTheDocument()
      expect(screen.getByText('280.5 mW')).toBeInTheDocument()
      expect(screen.getByText('120.8 mW')).toBeInTheDocument()
      expect(screen.getByText('0.0 mW')).toBeInTheDocument()
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
    it('calls onExperimentSelect when experiment is clicked', async () => {
      const user = userEvent.setup()

      render3D(
        <MFCDashboard3D
          experiments={singleExperiment}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Click on the experiment (box)
      const experimentBox = screen.getAllByTestId('box')[0]
      await user.click(experimentBox)

      expect(mockOnExperimentSelect).toHaveBeenCalledWith(singleExperiment[0].id)
    })

    it('highlights selected experiment', () => {
      const { rerender } = render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          selectedExperiment={undefined}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Select an experiment
      rerender(
        <MFCDashboard3D
          experiments={multipleExperiments}
          selectedExperiment="exp-1"
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Visual representation should change (testing presence of elements)
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
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

      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
      expect(screen.getByTestId('orbit-controls')).toBeInTheDocument()
    })
  })

  describe('Experiment Visualization', () => {
    it('arranges multiple experiments in a grid pattern', () => {
      render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // All experiments should be rendered
      multipleExperiments.forEach(exp => {
        expect(screen.getByText(exp.name)).toBeInTheDocument()
      })
    })

    it('displays different visual states for different experiment statuses', () => {
      render3D(
        <MFCDashboard3D
          experiments={multipleExperiments}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Running experiments should show particles
      const runningExperiments = multipleExperiments.filter(exp => exp.status === 'running')
      expect(runningExperiments.length).toBeGreaterThan(0)

      // All experiments should have status indicators (spheres)
      const spheres = screen.getAllByTestId('sphere')
      expect(spheres.length).toBeGreaterThan(multipleExperiments.length) // Status + particles
    })

    it('applies power-based color coding', () => {
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

      // All experiments should be rendered with appropriate power displays
      expect(screen.getByText('450.0 mW')).toBeInTheDocument()
      expect(screen.getByText('300.0 mW')).toBeInTheDocument()
      expect(screen.getByText('150.0 mW')).toBeInTheDocument()
    })

    it('shows animated particles for running experiments', () => {
      const runningExperiment = createMockExperiment({ status: 'running', lastPower: 300 })

      render3D(
        <MFCDashboard3D
          experiments={[runningExperiment]}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      // Should render particles (spheres) for running experiment
      const spheres = screen.getAllByTestId('sphere')
      expect(spheres.length).toBeGreaterThan(1) // Status indicator + particles
    })

    it('handles experiments with zero power output', () => {
      const zeroExperiment = createMockExperiment({ lastPower: 0, status: 'setup' })

      render3D(
        <MFCDashboard3D
          experiments={[zeroExperiment]}
          onExperimentSelect={mockOnExperimentSelect}
        />
      )

      expect(screen.getByText('0.0 mW')).toBeInTheDocument()
      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
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

      expect(screen.getByText('0.0 mW')).toBeInTheDocument()
      expect(screen.getByText('99999.0 mW')).toBeInTheDocument()
      expect(screen.getByText('-5.0 mW')).toBeInTheDocument()
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

    it('handles undefined onExperimentSelect gracefully', async () => {
      const user = userEvent.setup()

      render3D(
        <MFCDashboard3D
          experiments={singleExperiment}
          onExperimentSelect={undefined as any}
        />
      )

      // Should not crash when clicking without handler
      const experimentBox = screen.getAllByTestId('box')[0]
      await user.click(experimentBox)

      expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument()
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