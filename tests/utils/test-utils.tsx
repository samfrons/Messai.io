import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock Canvas component for testing 3D components
const MockCanvas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid="dashboard-canvas">{children}</div>
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div>{children}</div>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Render function specifically for 3D components
const render3D = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <MockCanvas>
        {children}
      </MockCanvas>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock MFC config factory
export const createMockMFCConfig = (overrides = {}) => ({
  electrode: {
    material: 'carbon-cloth',
    surface: 100,
    thickness: 2.0,
    ...overrides.electrode
  },
  microbial: {
    density: 5.0,
    species: 'geobacter',
    activity: 75,
    ...overrides.microbial
  },
  chamber: {
    volume: 1.0,
    shape: 'rectangular',
    material: 'acrylic',
    ...overrides.chamber
  },
  ...overrides
})

// Mock experiment data factory
export const createMockExperiment = (overrides = {}) => ({
  id: 'exp-test-1',
  name: 'Test Experiment',
  designName: 'Mason Jar MFC',
  status: 'running',
  createdAt: '2024-01-15T10:00:00Z',
  lastPower: 245.6,
  parameters: {
    temperature: 28.5,
    ph: 7.1,
    substrateConcentration: 1.2
  },
  ...overrides
})

// Mock measurement data factory
export const createMockMeasurements = (count = 10) =>
  Array.from({ length: count }, (_, i) => ({
    id: `m-${i}`,
    timestamp: new Date(Date.now() - (count - i) * 60000).toISOString(),
    voltage: 0.4 + Math.random() * 0.3,
    current: 0.3 + Math.random() * 0.4,
    power: 150 + Math.random() * 100,
    temperature: 28 + Math.random() * 2,
    ph: 7 + Math.random() * 0.5
  }))

// Helper to wait for async operations
export const waitForAnimationFrame = () =>
  new Promise(resolve => requestAnimationFrame(resolve))

// Helper to simulate canvas interactions
export const mockCanvasInteraction = (element: HTMLElement, eventType: string) => {
  const event = new MouseEvent(eventType, {
    bubbles: true,
    cancelable: true,
    clientX: 100,
    clientY: 100
  })
  element.dispatchEvent(event)
}

export * from '@testing-library/react'
export { customRender as render, render3D }