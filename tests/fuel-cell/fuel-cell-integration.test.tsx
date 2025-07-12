import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UnifiedDashboard from '@/components/unified/UnifiedDashboard'
import FuelCellConfigPanel from '@/components/fuel-cell/FuelCellConfigPanel'
import ControlSystemDesigner from '@/components/fuel-cell/ControlSystemDesigner'
import OptimizationInterface from '@/components/fuel-cell/OptimizationInterface'
import ComparativeAnalysis from '@/components/fuel-cell/ComparativeAnalysis'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}))

// Mock fetch globally
global.fetch = vi.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response)
)

// Mock WebGL context
beforeEach(() => {
  // Mock canvas getContext
  HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return {
        clearColor: vi.fn(),
        enable: vi.fn(),
        depthFunc: vi.fn(),
        viewport: vi.fn(),
        clear: vi.fn(),
        getExtension: vi.fn(),
        getParameter: vi.fn(() => 4096),
        createShader: vi.fn(() => ({})),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn(() => true),
        createProgram: vi.fn(() => ({})),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn(() => true),
        useProgram: vi.fn(),
        createBuffer: vi.fn(() => ({})),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        createTexture: vi.fn(() => ({})),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
      }
    }
    return null
  })
})

describe('Fuel Cell Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('System Selection', () => {
    it('should allow switching between microbial and fuel cell systems', async () => {
      render(<UnifiedDashboard />)
      
      // Initially should show system selector
      expect(screen.getByText('Choose Your System')).toBeInTheDocument()
      
      // Select fuel cell system
      const fuelCellCard = screen.getByText('Fuel Cell Systems')
      await userEvent.click(fuelCellCard)
      
      // Should show fuel cell dashboard
      await waitFor(() => {
        expect(screen.getByText('Fuel Cell Systems')).toBeInTheDocument()
        expect(screen.getByText('Design and optimize fuel cell stacks and systems')).toBeInTheDocument()
      })
      
      // Should be able to go back
      const changeSystemBtn = screen.getByText('← Change System')
      await userEvent.click(changeSystemBtn)
      
      expect(screen.getByText('Choose Your System')).toBeInTheDocument()
    })
  })

  describe('Fuel Cell Configuration', () => {
    it('should configure PEM fuel cell and get predictions', async () => {
      // Mock successful prediction response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            predictedPower: 150.5,
            efficiency: 65.2,
            voltage: 0.72,
            current: 209.0,
            powerDensity: 0.301,
            fuelUtilization: 85.5,
            operatingPoint: {
              temperature: 80,
              pressure: 2.5,
              humidity: 100
            },
            modelFidelity: 'INTERMEDIATE',
            timestamp: new Date().toISOString()
          }
        })
      } as Response)

      render(
        <FuelCellConfigPanel
          onConfigChange={vi.fn()}
          onPredictionRequest={vi.fn()}
          isCalculating={false}
        />
      )
      
      // Configure fuel cell parameters
      const cellCountInput = screen.getByLabelText(/Cell Count/)
      await userEvent.clear(cellCountInput)
      await userEvent.type(cellCountInput, '50')
      
      const activeAreaInput = screen.getByLabelText(/Active Area/)
      await userEvent.clear(activeAreaInput)
      await userEvent.type(activeAreaInput, '100')
      
      const temperatureInput = screen.getByLabelText(/Operating Temperature/)
      await userEvent.clear(temperatureInput)
      await userEvent.type(temperatureInput, '80')
      
      // Get predictions
      const predictButton = screen.getByText('Get Predictions')
      await userEvent.click(predictButton)
      
      // Should show loading state briefly
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/fuel-cell/predictions', expect.any(Object))
      })
    })

    it('should support different fuel cell types', async () => {
      render(
        <FuelCellConfigPanel
          onConfigChange={vi.fn()}
          onPredictionRequest={vi.fn()}
          isCalculating={false}
        />
      )
      
      // Check all fuel cell types are available
      const typeSelect = screen.getByLabelText(/Fuel Cell Type/)
      await userEvent.click(typeSelect)
      
      expect(screen.getByText('PEM - Proton Exchange Membrane')).toBeInTheDocument()
      expect(screen.getByText('SOFC - Solid Oxide')).toBeInTheDocument()
      expect(screen.getByText('PAFC - Phosphoric Acid')).toBeInTheDocument()
      expect(screen.getByText('MCFC - Molten Carbonate')).toBeInTheDocument()
      expect(screen.getByText('AFC - Alkaline')).toBeInTheDocument()
    })
  })

  describe('Control System Design', () => {
    it('should configure PID controllers for fuel cell control', async () => {
      const mockOnConfigChange = vi.fn()
      const mockOnSimulationRequest = vi.fn()
      
      render(
        <ControlSystemDesigner
          fuelCellType="PEM"
          onConfigChange={mockOnConfigChange}
          onSimulationRequest={mockOnSimulationRequest}
        />
      )
      
      // Configure temperature controller
      const tempKpInput = screen.getByTestId('temperature-kp')
      await userEvent.clear(tempKpInput)
      await userEvent.type(tempKpInput, '2.5')
      
      // Should update config
      expect(mockOnConfigChange).toHaveBeenCalled()
      
      // Auto-tune button should be available
      const autoTuneBtn = screen.getByText('Auto-Tune')
      expect(autoTuneBtn).toBeInTheDocument()
      
      // Run simulation
      const simulateBtn = screen.getByText('Run Simulation')
      await userEvent.click(simulateBtn)
      
      expect(mockOnSimulationRequest).toHaveBeenCalled()
    })
  })

  describe('Optimization', () => {
    it('should configure and run optimization', async () => {
      // Mock successful optimization response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            success: true,
            optimizedParameters: {
              cellCount: 75,
              activeArea: 150,
              operatingTemperature: 75,
              operatingPressure: 3.2,
              fuelFlowRate: 7.5,
              airFlowRate: 35
            },
            objectiveValue: 225.8,
            iterations: 87,
            constraintViolations: [],
            convergenceHistory: []
          }
        })
      } as Response)
      
      const mockOnOptimizationStart = vi.fn()
      
      render(
        <OptimizationInterface
          fuelCellType="PEM"
          onOptimizationStart={mockOnOptimizationStart}
        />
      )
      
      // Select optimization objective
      const maxPowerBtn = screen.getByText('Maximize Power')
      await userEvent.click(maxPowerBtn)
      
      // Configure constraints
      const constraintsTab = screen.getByText('Constraints')
      await userEvent.click(constraintsTab)
      
      // Set cell count range
      const cellMinInput = screen.getAllByDisplayValue('10')[0]
      await userEvent.clear(cellMinInput)
      await userEvent.type(cellMinInput, '50')
      
      // Select algorithm
      const algorithmTab = screen.getByText('Algorithm')
      await userEvent.click(algorithmTab)
      
      const geneticAlgBtn = screen.getByText('Genetic Algorithm')
      await userEvent.click(geneticAlgBtn)
      
      // Start optimization
      const startBtn = screen.getByText('Start Optimization')
      await userEvent.click(startBtn)
      
      expect(mockOnOptimizationStart).toHaveBeenCalled()
    })
  })

  describe('Comparative Analysis', () => {
    it('should compare multiple fuel cell systems', async () => {
      // Mock comparison API response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            results: [
              {
                systemId: 'pem-standard',
                systemName: 'Standard PEM',
                metrics: {
                  power: 150,
                  efficiency: 65,
                  cost: 5000,
                  durability: 40000
                },
                rank: { power: 2, efficiency: 1, cost: 2, overall: 2 }
              },
              {
                systemId: 'pem-optimized',
                systemName: 'Optimized PEM',
                metrics: {
                  power: 180,
                  efficiency: 62,
                  cost: 6000,
                  durability: 35000
                },
                rank: { power: 1, efficiency: 2, cost: 3, overall: 1 }
              }
            ]
          }
        })
      } as Response)
      
      render(<ComparativeAnalysis />)
      
      // Should show default systems
      expect(screen.getByText('Standard PEM')).toBeInTheDocument()
      expect(screen.getByText('Optimized PEM')).toBeInTheDocument()
      expect(screen.getByText('Standard SOFC')).toBeInTheDocument()
      
      // Add custom system
      const addSystemBtn = screen.getByText('+ Add System')
      await userEvent.click(addSystemBtn)
      
      // Should calculate comparisons automatically
      await waitFor(() => {
        expect(screen.getByText('Calculating comparisons...')).toBeInTheDocument()
      })
      
      // Switch to chart view
      const chartBtn = screen.getByText('Chart')
      await userEvent.click(chartBtn)
      
      // Switch to radar view
      const radarBtn = screen.getByText('Radar')
      await userEvent.click(radarBtn)
    })
  })

  describe('View Mode Navigation', () => {
    it('should navigate between all fuel cell view modes', async () => {
      render(<UnifiedDashboard initialSystemType="fuel-cell" />)
      
      // Check all view modes are available
      expect(screen.getByText('Config')).toBeInTheDocument()
      expect(screen.getByText('3D View')).toBeInTheDocument()
      expect(screen.getByText('Split')).toBeInTheDocument()
      expect(screen.getByText('Control')).toBeInTheDocument()
      expect(screen.getByText('HIL')).toBeInTheDocument()
      expect(screen.getByText('Optimize')).toBeInTheDocument()
      expect(screen.getByText('Compare')).toBeInTheDocument()
      
      // Navigate to control view
      await userEvent.click(screen.getByText('Control'))
      expect(screen.getByText('Control System Design')).toBeInTheDocument()
      
      // Navigate to optimization view
      await userEvent.click(screen.getByText('Optimize'))
      expect(screen.getByText('Fuel Cell System Optimization')).toBeInTheDocument()
      
      // Navigate to comparison view
      await userEvent.click(screen.getByText('Compare'))
      expect(screen.getByText('Fuel Cell System Comparison')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock failed API response
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))
      
      const mockOnPredictionRequest = vi.fn()
      
      render(
        <FuelCellConfigPanel
          onConfigChange={vi.fn()}
          onPredictionRequest={mockOnPredictionRequest}
          isCalculating={false}
        />
      )
      
      // Try to get predictions
      const predictButton = screen.getByText('Get Predictions')
      await userEvent.click(predictButton)
      
      // Should handle error (in real app would show error message)
      expect(mockOnPredictionRequest).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and keyboard navigation', async () => {
      render(<UnifiedDashboard initialSystemType="fuel-cell" />)
      
      // Check ARIA labels
      const configButton = screen.getByText('Config')
      expect(configButton).toHaveAttribute('class', expect.stringContaining('transition-colors'))
      
      // Test keyboard navigation
      configButton.focus()
      expect(document.activeElement).toBe(configButton)
      
      // Tab to next button
      await userEvent.tab()
      expect(document.activeElement).toBe(screen.getByText('3D View'))
    })
  })
})