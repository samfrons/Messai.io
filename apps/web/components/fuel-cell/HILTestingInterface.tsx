'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FuelCellType } from '@/lib/types/fuel-cell-types'

// ============================================================================
// HIL TESTING INTERFACES
// ============================================================================

interface HILTestConfig {
  testName: string
  testType: 'VALIDATION' | 'STRESS_TEST' | 'LONGEVITY' | 'FAULT_INJECTION' | 'OPTIMIZATION'
  hardwareSetup: {
    realHardware: string[] // List of real hardware components
    simulatedComponents: string[] // List of simulated components
    interfaces: HILInterface[]
  }
  testScenarios: HILTestScenario[]
  dataAcquisition: {
    sampleRate: number // Hz
    duration: number // seconds
    channels: string[]
  }
  safetyLimits: {
    maxTemperature: number
    maxPressure: number
    maxCurrent: number
    maxVoltage: number
  }
}

interface HILInterface {
  id: string
  name: string
  type: 'ANALOG_IN' | 'ANALOG_OUT' | 'DIGITAL_IN' | 'DIGITAL_OUT' | 'CAN' | 'MODBUS' | 'ETHERNET'
  hardware: string // Hardware device/card
  channels: number[]
  sampleRate: number
  resolution: number // bits
  range: { min: number; max: number }
  unit: string
}

interface HILTestScenario {
  id: string
  name: string
  description: string
  duration: number
  steps: HILTestStep[]
  expectedOutcomes: {
    parameter: string
    expectedValue: number
    tolerance: number
    unit: string
  }[]
}

interface HILTestStep {
  time: number // seconds from start
  action: 'SET_INPUT' | 'INJECT_FAULT' | 'CHANGE_LOAD' | 'VERIFY_OUTPUT' | 'WAIT'
  parameters: Record<string, any>
  description: string
}

interface HILTestResult {
  testId: string
  status: 'RUNNING' | 'PASSED' | 'FAILED' | 'ABORTED'
  startTime: string
  endTime?: string
  duration: number
  measurements: {
    timestamp: number
    parameters: Record<string, number>
  }[]
  faults: {
    timestamp: number
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    message: string
    parameter?: string
    value?: number
  }[]
  summary: {
    passedSteps: number
    totalSteps: number
    efficiency: number
    performanceScore: number
  }
}

interface HILTestingInterfaceProps {
  fuelCellType: FuelCellType
  onTestStart?: (config: HILTestConfig) => void
  onTestStop?: () => void
  testResults?: HILTestResult[]
  isConnected?: boolean
  className?: string
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

const DEFAULT_HIL_SETUPS: Record<FuelCellType, Partial<HILTestConfig>> = {
  PEM: {
    hardwareSetup: {
      realHardware: ['PEM Stack', 'Temperature Sensors', 'Pressure Sensors', 'Current Sensors'],
      simulatedComponents: ['Load Bank', 'Air Compressor', 'Humidifier', 'Cooling System'],
      interfaces: [
        {
          id: 'temp_in',
          name: 'Temperature Input',
          type: 'ANALOG_IN',
          hardware: 'NI USB-6008',
          channels: [0, 1, 2, 3],
          sampleRate: 100,
          resolution: 16,
          range: { min: -40, max: 150 },
          unit: '°C'
        },
        {
          id: 'pressure_in',
          name: 'Pressure Input',
          type: 'ANALOG_IN',
          hardware: 'NI USB-6008',
          channels: [4, 5],
          sampleRate: 100,
          resolution: 16,
          range: { min: 0, max: 10 },
          unit: 'bar'
        }
      ]
    },
    safetyLimits: {
      maxTemperature: 90,
      maxPressure: 10,
      maxCurrent: 100,
      maxVoltage: 60
    }
  },
  SOFC: {
    hardwareSetup: {
      realHardware: ['SOFC Stack', 'High-Temp Sensors', 'Gas Analyzers'],
      simulatedComponents: ['Furnace', 'Gas Mixing System', 'Reformer'],
      interfaces: [
        {
          id: 'high_temp_in',
          name: 'High Temperature Input',
          type: 'ANALOG_IN',
          hardware: 'NI cDAQ-9174',
          channels: [0, 1, 2],
          sampleRate: 50,
          resolution: 24,
          range: { min: 500, max: 1000 },
          unit: '°C'
        }
      ]
    },
    safetyLimits: {
      maxTemperature: 1000,
      maxPressure: 20,
      maxCurrent: 200,
      maxVoltage: 100
    }
  },
  PAFC: {
    hardwareSetup: {
      realHardware: ['PAFC Stack', 'Electrolyte Management', 'Temperature Control'],
      simulatedComponents: ['Process Heater', 'Acid Circulation', 'Gas Cleanup'],
      interfaces: []
    },
    safetyLimits: {
      maxTemperature: 220,
      maxPressure: 8,
      maxCurrent: 150,
      maxVoltage: 80
    }
  },
  MCFC: {
    hardwareSetup: {
      realHardware: ['MCFC Stack', 'Molten Electrolyte System'],
      simulatedComponents: ['High-Temp Furnace', 'Gas Reforming Unit'],
      interfaces: []
    },
    safetyLimits: {
      maxTemperature: 700,
      maxPressure: 15,
      maxCurrent: 300,
      maxVoltage: 120
    }
  },
  AFC: {
    hardwareSetup: {
      realHardware: ['AFC Stack', 'Electrolyte Management'],
      simulatedComponents: ['KOH Circulation', 'CO2 Scrubber'],
      interfaces: []
    },
    safetyLimits: {
      maxTemperature: 90,
      maxPressure: 6,
      maxCurrent: 80,
      maxVoltage: 50
    }
  }
}

const TEST_TEMPLATES: HILTestScenario[] = [
  {
    id: 'startup_sequence',
    name: 'Startup Sequence Validation',
    description: 'Validate the fuel cell startup procedure with HIL',
    duration: 300,
    steps: [
      {
        time: 0,
        action: 'SET_INPUT',
        parameters: { temperature: 25, pressure: 1.0, humidity: 50 },
        description: 'Set initial conditions'
      },
      {
        time: 30,
        action: 'SET_INPUT',
        parameters: { fuelFlow: 1.0 },
        description: 'Start fuel flow'
      },
      {
        time: 60,
        action: 'SET_INPUT',
        parameters: { airFlow: 5.0 },
        description: 'Start air flow'
      },
      {
        time: 90,
        action: 'SET_INPUT',
        parameters: { temperature: 80 },
        description: 'Heat to operating temperature'
      },
      {
        time: 180,
        action: 'CHANGE_LOAD',
        parameters: { current: 10 },
        description: 'Apply initial load'
      },
      {
        time: 240,
        action: 'VERIFY_OUTPUT',
        parameters: { expectedVoltage: 45, tolerance: 5 },
        description: 'Verify stable operation'
      }
    ],
    expectedOutcomes: [
      { parameter: 'voltage', expectedValue: 45, tolerance: 5, unit: 'V' },
      { parameter: 'efficiency', expectedValue: 50, tolerance: 10, unit: '%' }
    ]
  },
  {
    id: 'load_following',
    name: 'Load Following Response',
    description: 'Test dynamic load response capabilities',
    duration: 180,
    steps: [
      {
        time: 0,
        action: 'SET_INPUT',
        parameters: { load: 10 },
        description: 'Set baseline load'
      },
      {
        time: 30,
        action: 'CHANGE_LOAD',
        parameters: { load: 25 },
        description: 'Step increase to 25A'
      },
      {
        time: 90,
        action: 'CHANGE_LOAD',
        parameters: { load: 50 },
        description: 'Step increase to 50A'
      },
      {
        time: 120,
        action: 'CHANGE_LOAD',
        parameters: { load: 10 },
        description: 'Return to baseline'
      }
    ],
    expectedOutcomes: [
      { parameter: 'responseTime', expectedValue: 5, tolerance: 2, unit: 's' },
      { parameter: 'overshoot', expectedValue: 5, tolerance: 3, unit: '%' }
    ]
  }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HILTestingInterface({
  fuelCellType,
  onTestStart,
  onTestStop,
  testResults = [],
  isConnected = false,
  className = ''
}: HILTestingInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'setup' | 'scenarios' | 'monitor' | 'results'>('setup')
  const [testConfig, setTestConfig] = useState<HILTestConfig>(() => ({
    testName: `${fuelCellType} HIL Test`,
    testType: 'VALIDATION',
    hardwareSetup: DEFAULT_HIL_SETUPS[fuelCellType]?.hardwareSetup || DEFAULT_HIL_SETUPS.PEM.hardwareSetup!,
    testScenarios: [],
    dataAcquisition: {
      sampleRate: 100,
      duration: 300,
      channels: ['temperature', 'pressure', 'voltage', 'current']
    },
    safetyLimits: DEFAULT_HIL_SETUPS[fuelCellType]?.safetyLimits || DEFAULT_HIL_SETUPS.PEM.safetyLimits!
  }))
  
  const [runningTest, setRunningTest] = useState<HILTestResult | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<string>('')

  const handleStartTest = useCallback(() => {
    if (testConfig.testScenarios.length === 0) return
    
    const newTest: HILTestResult = {
      testId: `test_${Date.now()}`,
      status: 'RUNNING',
      startTime: new Date().toISOString(),
      duration: 0,
      measurements: [],
      faults: [],
      summary: {
        passedSteps: 0,
        totalSteps: testConfig.testScenarios.reduce((sum, scenario) => sum + scenario.steps.length, 0),
        efficiency: 0,
        performanceScore: 0
      }
    }
    
    setRunningTest(newTest)
    onTestStart?.(testConfig)
  }, [testConfig, onTestStart])

  const handleStopTest = useCallback(() => {
    setRunningTest(null)
    onTestStop?.()
  }, [onTestStop])

  const addScenario = useCallback((scenario: HILTestScenario) => {
    setTestConfig(prev => ({
      ...prev,
      testScenarios: [...prev.testScenarios, scenario]
    }))
  }, [])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Hardware-in-the-Loop Testing
        </h2>
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>

          {/* Test Controls */}
          {runningTest ? (
            <button
              onClick={handleStopTest}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Stop Test
            </button>
          ) : (
            <button
              onClick={handleStartTest}
              disabled={!isConnected || testConfig.testScenarios.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Test
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'setup', label: 'Hardware Setup', icon: '🔧' },
            { id: 'scenarios', label: 'Test Scenarios', icon: '📋' },
            { id: 'monitor', label: 'Monitor', icon: '📊' },
            { id: 'results', label: 'Results', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'setup' && (
            <HardwareSetupPanel
              config={testConfig}
              onConfigChange={setTestConfig}
              fuelCellType={fuelCellType}
            />
          )}

          {activeTab === 'scenarios' && (
            <TestScenariosPanel
              scenarios={testConfig.testScenarios}
              selectedScenario={selectedScenario}
              onScenarioSelect={setSelectedScenario}
              onAddScenario={addScenario}
              templates={TEST_TEMPLATES}
            />
          )}

          {activeTab === 'monitor' && (
            <TestMonitorPanel
              runningTest={runningTest}
              testConfig={testConfig}
              isConnected={isConnected}
            />
          )}

          {activeTab === 'results' && (
            <TestResultsPanel
              results={testResults}
              fuelCellType={fuelCellType}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// HARDWARE SETUP PANEL
// ============================================================================

interface HardwareSetupPanelProps {
  config: HILTestConfig
  onConfigChange: (config: HILTestConfig) => void
  fuelCellType: FuelCellType
}

function HardwareSetupPanel({ config, onConfigChange, fuelCellType }: HardwareSetupPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardware Components */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Hardware Components</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Real Hardware
              </label>
              <div className="space-y-2">
                {config.hardwareSetup.realHardware.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Simulated Components
              </label>
              <div className="space-y-2">
                {config.hardwareSetup.simulatedComponents.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="text-blue-600 dark:text-blue-400">🖥️</span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interface Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Interface Configuration</h3>
          
          <div className="space-y-3">
            {config.hardwareSetup.interfaces.map((interface_, index) => (
              <div key={interface_.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{interface_.name}</h4>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {interface_.type}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Hardware: {interface_.hardware}</div>
                  <div>Channels: {interface_.channels.join(', ')}</div>
                  <div>Sample Rate: {interface_.sampleRate} Hz</div>
                  <div>Range: {interface_.range.min} - {interface_.range.max} {interface_.unit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Limits */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">Safety Limits</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
              Max Temperature (°C)
            </label>
            <input
              type="number"
              value={config.safetyLimits.maxTemperature}
              onChange={(e) => onConfigChange({
                ...config,
                safetyLimits: { ...config.safetyLimits, maxTemperature: parseFloat(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-md bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
              Max Pressure (bar)
            </label>
            <input
              type="number"
              value={config.safetyLimits.maxPressure}
              onChange={(e) => onConfigChange({
                ...config,
                safetyLimits: { ...config.safetyLimits, maxPressure: parseFloat(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-md bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
              Max Current (A)
            </label>
            <input
              type="number"
              value={config.safetyLimits.maxCurrent}
              onChange={(e) => onConfigChange({
                ...config,
                safetyLimits: { ...config.safetyLimits, maxCurrent: parseFloat(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-md bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
              Max Voltage (V)
            </label>
            <input
              type="number"
              value={config.safetyLimits.maxVoltage}
              onChange={(e) => onConfigChange({
                ...config,
                safetyLimits: { ...config.safetyLimits, maxVoltage: parseFloat(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-md bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TEST SCENARIOS PANEL
// ============================================================================

interface TestScenariosPanelProps {
  scenarios: HILTestScenario[]
  selectedScenario: string
  onScenarioSelect: (id: string) => void
  onAddScenario: (scenario: HILTestScenario) => void
  templates: HILTestScenario[]
}

function TestScenariosPanel({
  scenarios,
  selectedScenario,
  onScenarioSelect,
  onAddScenario,
  templates
}: TestScenariosPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Test Scenarios</h3>
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              const template = templates.find(t => t.id === e.target.value)
              if (template) onAddScenario(template)
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="">Add from template...</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scenario List */}
        <div className="space-y-2">
          {scenarios.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => onScenarioSelect(scenario.id)}
              className={`w-full p-3 text-left border rounded-md transition-colors ${
                selectedScenario === scenario.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="font-medium">{scenario.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{scenario.duration}s</div>
            </button>
          ))}
          
          {scenarios.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No scenarios configured.<br />
              Add scenarios using templates above.
            </div>
          )}
        </div>

        {/* Scenario Details */}
        {selectedScenario && (
          <div className="md:col-span-2">
            <ScenarioDetails
              scenario={scenarios.find(s => s.id === selectedScenario)!}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ScenarioDetails({ scenario }: { scenario: HILTestScenario }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{scenario.name}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{scenario.description}</p>
      </div>

      <div className="space-y-2">
        <h5 className="font-medium text-gray-900 dark:text-gray-100">Test Steps</h5>
        <div className="space-y-2">
          {scenario.steps.map((step, index) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Step {index + 1}</span>
                <span className="text-xs text-gray-500">{step.time}s</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{step.description}</div>
              <div className="text-xs text-gray-500 mt-1">
                Action: {step.action} | Parameters: {JSON.stringify(step.parameters)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MONITOR AND RESULTS PANELS (Simplified)
// ============================================================================

function TestMonitorPanel({ runningTest, isConnected }: any) {
  return (
    <div className="space-y-6">
      {runningTest ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">Test Running</h3>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Test ID: {runningTest.testId}<br />
              Status: {runningTest.status}<br />
              Duration: {runningTest.duration}s
            </div>
          </div>
          {/* Add real-time monitoring charts here */}
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No test currently running
        </div>
      )}
    </div>
  )
}

function TestResultsPanel({ results }: any) {
  return (
    <div className="space-y-6">
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result: HILTestResult) => (
            <div key={result.testId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{result.testId}</h4>
                <span className={`px-2 py-1 text-xs rounded ${
                  result.status === 'PASSED' ? 'bg-green-100 text-green-800' :
                  result.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Duration: {result.duration}s | 
                Passed Steps: {result.summary.passedSteps}/{result.summary.totalSteps}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No test results available
        </div>
      )}
    </div>
  )
}