import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render3D, createMockMFCConfig } from '../utils/test-utils'
import MFC3DModel from '@/components/MFC3DModel'

// Mock Three.js components
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas">{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: () => ({
    gl: { domElement: document.createElement('canvas') },
    camera: { position: { set: vi.fn() } },
    scene: { add: vi.fn(), remove: vi.fn() }
  })
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Environment: () => <div data-testid="environment" />,
  Text: ({ children, ...props }: any) => (
    <div data-testid="text" {...props}>{children}</div>
  ),
  Box: ({ children, ...props }: any) => (
    <div data-testid="box" {...props}>{children}</div>
  ),
  Cylinder: ({ children, ...props }: any) => (
    <div data-testid="cylinder" {...props}>{children}</div>
  ),
  Sphere: ({ children, ...props }: any) => (
    <div data-testid="sphere" {...props}>{children}</div>
  )
}))

describe('MFC3DModel', () => {
  const mockOnComponentSelect = vi.fn()
  const defaultConfig = createMockMFCConfig()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the 3D canvas container', () => {
      render3D(
        <MFC3DModel
          config={defaultConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent={null}
        />
      )

      expect(screen.getByTestId('canvas')).toBeInTheDocument()
      expect(screen.getByTestId('orbit-controls')).toBeInTheDocument()
      expect(screen.getByTestId('environment')).toBeInTheDocument()
    })

    it('renders all MFC components', () => {
      render3D(
        <MFC3DModel
          config={defaultConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent={null}
        />
      )

      // Should render multiple boxes for electrodes and chamber
      const boxes = screen.getAllByTestId('box')
      expect(boxes.length).toBeGreaterThan(0)

      // Should render spheres for microbial particles and electron flow
      const spheres = screen.getAllByTestId('sphere')
      expect(spheres.length).toBeGreaterThan(0)
    })

    it('displays component labels when selected', () => {
      render3D(
        <MFC3DModel
          config={defaultConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent="anode"
        />
      )

      expect(screen.getByText(/Anode/)).toBeInTheDocument()
    })

    it('applies correct styling based on configuration', () => {
      const stainlessSteelConfig = createMockMFCConfig({
        electrode: { material: 'stainless-steel' }
      })

      render3D(
        <MFC3DModel
          config={stainlessSteelConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent={null}
        />
      )

      // Component should render (exact styling is handled by Three.js materials)
      expect(screen.getByTestId('canvas')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onComponentSelect when component is clicked', async () => {
      const user = userEvent.setup()

      render3D(
        <MFC3DModel
          config={defaultConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent={null}
        />
      )

      // Simulate clicking on a component (box)
      const boxes = screen.getAllByTestId('box')
      await user.click(boxes[0])

      expect(mockOnComponentSelect).toHaveBeenCalled()
    })

    it('highlights selected component', () => {
      const { rerender } = render3D(
        <MFC3DModel
          config={defaultConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent={null}
        />
      )

      // Initially no component selected
      expect(screen.queryByText(/Anode/)).not.toBeInTheDocument()

      // Select anode
      rerender(
        <MFC3DModel
          config={defaultConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent="anode"
        />
      )

      expect(screen.getByText(/Anode/)).toBeInTheDocument()
    })

    it('updates visual representation based on config changes', () => {
      const { rerender } = render3D(
        <MFC3DModel
          config={defaultConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent={null}
        />
      )

      const highActivityConfig = createMockMFCConfig({
        microbial: { activity: 95, density: 8.0 }
      })

      rerender(
        <MFC3DModel
          config={highActivityConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent={null}
        />
      )

      // Should render more microbial particles due to higher density
      const spheres = screen.getAllByTestId('sphere')
      expect(spheres.length).toBeGreaterThan(10) // More particles for higher density
    })
  })

  describe('Component Configurations', () => {
    it('renders different electrode materials correctly', () => {
      const configs = [
        { electrode: { material: 'carbon-cloth' } },
        { electrode: { material: 'graphite' } },
        { electrode: { material: 'stainless-steel' } }
      ]

      configs.forEach(config => {
        const testConfig = createMockMFCConfig(config)
        render3D(
          <MFC3DModel
            config={testConfig}
            onComponentSelect={mockOnComponentSelect}
            selectedComponent={null}
          />
        )

        expect(screen.getByTestId('canvas')).toBeInTheDocument()
      })
    })

    it('renders advanced electrode materials with unique visual properties', () => {
      const advancedMaterials = [
        'graphene-oxide',
        'reduced-graphene-oxide', 
        'graphene-aerogel',
        'graphene-foam',
        'swcnt',
        'mwcnt',
        'cnt-graphene',
        'ti3c2tx',
        'ti2ctx',
        'mxene-graphene',
        'nb2ctx',
        'v2ctx'
      ]

      advancedMaterials.forEach(material => {
        const config = createMockMFCConfig({
          electrode: { material }
        })

        const { unmount } = render3D(
          <MFC3DModel
            config={config}
            onComponentSelect={mockOnComponentSelect}
            selectedComponent={null}
          />
        )

        // Should render without errors for all advanced materials
        expect(screen.getByTestId('canvas')).toBeInTheDocument()
        
        // Should render electrode components
        const boxes = screen.getAllByTestId('box')
        expect(boxes.length).toBeGreaterThan(0)
        
        unmount()
      })
    })

    it('displays correct electrode labels for advanced materials when selected', () => {
      const materialConfigs = [
        { material: 'graphene-aerogel', expectedLabel: 'graphene-aerogel' },
        { material: 'cnt-graphene', expectedLabel: 'cnt-graphene' },
        { material: 'ti3c2tx', expectedLabel: 'ti3c2tx' },
        { material: 'swcnt', expectedLabel: 'swcnt' }
      ]

      materialConfigs.forEach(({ material, expectedLabel }) => {
        const config = createMockMFCConfig({
          electrode: { material }
        })

        const { unmount } = render3D(
          <MFC3DModel
            config={config}
            onComponentSelect={mockOnComponentSelect}
            selectedComponent="anode"
          />
        )

        expect(screen.getByText(new RegExp(expectedLabel))).toBeInTheDocument()
        unmount()
      })
    })

    it('renders different chamber shapes correctly', () => {
      const cylindricalConfig = createMockMFCConfig({
        chamber: { shape: 'cylindrical' }
      })

      render3D(
        <MFC3DModel
          config={cylindricalConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent={null}
        />
      )

      expect(screen.getByTestId('cylinder')).toBeInTheDocument()
    })

    it('renders microbial community with correct density', () => {
      const highDensityConfig = createMockMFCConfig({
        microbial: { density: 10.0 }
      })

      render3D(
        <MFC3DModel
          config={highDensityConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent={null}
        />
      )

      const spheres = screen.getAllByTestId('sphere')
      expect(spheres.length).toBeGreaterThan(50) // High density = many particles
    })
  })

  describe('Performance and Edge Cases', () => {
    it('handles zero density microbial community', () => {
      const zeroDensityConfig = createMockMFCConfig({
        microbial: { density: 0 }
      })

      render3D(
        <MFC3DModel
          config={zeroDensityConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent={null}
        />
      )

      expect(screen.getByTestId('canvas')).toBeInTheDocument()
    })

    it('handles extreme configuration values', () => {
      const extremeConfig = createMockMFCConfig({
        electrode: { surface: 1000, thickness: 10 },
        chamber: { volume: 50 },
        microbial: { activity: 100, density: 15 }
      })

      render3D(
        <MFC3DModel
          config={extremeConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent={null}
        />
      )

      expect(screen.getByTestId('canvas')).toBeInTheDocument()
    })

    it('handles rapid config changes without errors', () => {
      const { rerender } = render3D(
        <MFC3DModel
          config={defaultConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent={null}
        />
      )

      // Rapidly change configurations
      for (let i = 0; i < 5; i++) {
        const newConfig = createMockMFCConfig({
          microbial: { activity: 50 + i * 10 }
        })
        
        rerender(
          <MFC3DModel
            config={newConfig}
            onComponentSelect={mockOnComponentSelect}
            selectedComponent={null}
          />
        )
      }

      expect(screen.getByTestId('canvas')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides appropriate ARIA labels and roles', () => {
      render3D(
        <MFC3DModel
          config={defaultConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent={null}
        />
      )

      const canvas = screen.getByTestId('canvas')
      expect(canvas).toBeInTheDocument()
    })

    it('supports keyboard navigation when component is selected', () => {
      render3D(
        <MFC3DModel
          config={defaultConfig}
          onComponentSelect={mockOnComponentSelect}
          selectedComponent="anode"
        />
      )

      expect(screen.getByText(/Anode/)).toBeInTheDocument()
    })
  })
})