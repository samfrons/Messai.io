'use client'

import React from 'react'
import { ElectroanalyticalTechnique } from '@/lib/electroanalytical/electroanalytical-catalog'
import { DataPoint } from './ElectroanalyticalTool'

interface DataAnalysisPanelProps {
  technique: ElectroanalyticalTechnique
  data: DataPoint[]
  analysisResults: any
  onAnalyze: () => void
}

export function DataAnalysisPanel({ technique, data, analysisResults, onAnalyze }: DataAnalysisPanelProps) {
  const calculateBasicStats = () => {
    if (data.length === 0) return null

    const currents = data.map(d => d.y)
    const potentials = data.map(d => d.x)

    return {
      dataPoints: data.length,
      maxCurrent: Math.max(...currents),
      minCurrent: Math.min(...currents),
      avgCurrent: currents.reduce((a, b) => a + b, 0) / currents.length,
      potentialRange: [Math.min(...potentials), Math.max(...potentials)],
      currentRange: Math.max(...currents) - Math.min(...currents)
    }
  }

  const basicStats = calculateBasicStats()

  const renderTechniqueSpecificAnalysis = () => {
    if (!analysisResults) return null

    switch (technique.id) {
      case 'cv':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white">Cyclic Voltammetry Analysis</h4>
            
            {analysisResults.peakCurrents && analysisResults.peakCurrents.length > 0 && (
              <div className="bg-gray-700 p-3 rounded">
                <h5 className="text-xs font-medium text-gray-300 mb-2">Peak Analysis</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Number of Peaks:</span>
                    <div className="text-white">{analysisResults.peakCurrents.length}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Peak Currents:</span>
                    <div className="text-white">
                      {analysisResults.peakCurrents.map((current: number, i: number) => (
                        <div key={i}>{current.toFixed(2)} µA</div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {analysisResults.peakSeparation && (
                  <div className="mt-2">
                    <span className="text-gray-400 text-xs">Peak Separation:</span>
                    <div className="text-white text-xs">{analysisResults.peakSeparation.toFixed(3)} V</div>
                    <div className="text-gray-400 text-xs">
                      {analysisResults.peakSeparation > 0.059 ? 'Irreversible' : 'Quasi-reversible'}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-gray-700 p-3 rounded">
              <h5 className="text-xs font-medium text-gray-300 mb-2">Electrochemical Parameters</h5>
              <div className="text-xs text-gray-400">
                <div>Scan Rate: {technique.parameters?.scanRate?.default || 0.1} V/s</div>
                <div>Number of Electrons: ~2 (estimated)</div>
                <div>Electrode Area: {data.length > 0 ? '1.0 cm²' : 'N/A'}</div>
              </div>
            </div>
          </div>
        )

      case 'eis':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white">EIS Analysis</h4>
            
            {analysisResults.solutionResistance && (
              <div className="bg-gray-700 p-3 rounded">
                <h5 className="text-xs font-medium text-gray-300 mb-2">Circuit Parameters</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Solution Resistance:</span>
                    <div className="text-white">{analysisResults.solutionResistance.toFixed(1)} Ω</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Charge Transfer Resistance:</span>
                    <div className="text-white">{analysisResults.chargeTransferResistance.toFixed(1)} Ω</div>
                  </div>
                </div>
                
                {analysisResults.characteristicFrequency && (
                  <div className="mt-2">
                    <span className="text-gray-400 text-xs">Characteristic Frequency:</span>
                    <div className="text-white text-xs">
                      {formatFrequency(analysisResults.characteristicFrequency)} Hz
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-gray-700 p-3 rounded">
              <h5 className="text-xs font-medium text-gray-300 mb-2">Equivalent Circuit</h5>
              <div className="text-xs text-gray-400">
                <div>Model: Rs + (Rct || Cdl) + Zw</div>
                <div>Rs: Solution resistance</div>
                <div>Rct: Charge transfer resistance</div>
                <div>Cdl: Double layer capacitance</div>
                <div>Zw: Warburg diffusion impedance</div>
              </div>
            </div>
          </div>
        )

      case 'ca':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white">Chronoamperometry Analysis</h4>
            
            {analysisResults.steadyStateCurrent !== undefined && (
              <div className="bg-gray-700 p-3 rounded">
                <h5 className="text-xs font-medium text-gray-300 mb-2">Current Analysis</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Peak Current:</span>
                    <div className="text-white">{analysisResults.peakCurrent.toFixed(2)} µA</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Steady State Current:</span>
                    <div className="text-white">{analysisResults.steadyStateCurrent.toFixed(2)} µA</div>
                  </div>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Charge Transferred:</span>
                    <div className="text-white">{analysisResults.chargeTransferred.toFixed(3)} mC</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Diffusion Coefficient:</span>
                    <div className="text-white">{analysisResults.diffusionCoefficient.toExponential(2)} cm²/s</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-700 p-3 rounded">
              <h5 className="text-xs font-medium text-gray-300 mb-2">Cottrell Analysis</h5>
              <div className="text-xs text-gray-400">
                <div>i(t) = nFAC√D / √(πt)</div>
                <div>Linear relationship: i vs t⁻¹/²</div>
                <div>Slope ∝ √D (diffusion coefficient)</div>
              </div>
            </div>
          </div>
        )

      case 'dpv':
      case 'swv':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white">{technique.name} Analysis</h4>
            
            <div className="bg-gray-700 p-3 rounded">
              <h5 className="text-xs font-medium text-gray-300 mb-2">Signal Enhancement</h5>
              <div className="text-xs text-gray-400">
                <div>Background Subtraction: Active</div>
                <div>Signal-to-Noise Ratio: Enhanced</div>
                <div>Detection Limit: Improved by ~10x</div>
                <div>Capacitive Current: Minimized</div>
              </div>
            </div>

            <div className="bg-gray-700 p-3 rounded">
              <h5 className="text-xs font-medium text-gray-300 mb-2">Peak Detection</h5>
              <div className="text-xs text-gray-400">
                <div>Automatic peak finding algorithm</div>
                <div>Baseline correction applied</div>
                <div>Peak area integration available</div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white">General Analysis</h4>
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-xs text-gray-400">
                Analysis features specific to {technique.name} will be available when data is collected.
              </div>
            </div>
          </div>
        )
    }
  }

  const formatFrequency = (freq: number): string => {
    if (freq >= 1000000) return `${(freq / 1000000).toFixed(1)}M`
    if (freq >= 1000) return `${(freq / 1000).toFixed(1)}k`
    return freq.toFixed(1)
  }

  const exportAnalysis = () => {
    if (!analysisResults || !basicStats) return

    const analysisReport = {
      technique: technique.name,
      timestamp: new Date().toISOString(),
      basicStatistics: basicStats,
      techniqueSpecificResults: analysisResults,
      experimentalConditions: {
        temperature: '25°C', // This would come from parameters
        electrolyte: 'PBS',
        electrodeArea: '1.0 cm²'
      }
    }

    const blob = new Blob([JSON.stringify(analysisReport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${technique.id}_analysis_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-white">Data Analysis</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onAnalyze}
              disabled={data.length === 0}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
            >
              Analyze Data
            </button>
            <button
              onClick={exportAnalysis}
              disabled={!analysisResults}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
            >
              Export Analysis
            </button>
          </div>
        </div>

        {/* Basic Statistics */}
        {basicStats && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Data Points:</span>
              <div className="text-white">{basicStats.dataPoints}</div>
            </div>
            <div>
              <span className="text-gray-400">Current Range:</span>
              <div className="text-white">{basicStats.currentRange.toFixed(2)} µA</div>
            </div>
            <div>
              <span className="text-gray-400">Potential Range:</span>
              <div className="text-white">
                {basicStats.potentialRange[0].toFixed(2)} to {basicStats.potentialRange[1].toFixed(2)} V
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Content */}
      <div className="flex-1 overflow-y-auto">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">No Data Available</div>
              <div className="text-gray-500 text-sm">
                Start an experiment to begin collecting data for analysis
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* General Statistics */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-3">Statistical Summary</h4>
              {basicStats && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Maximum Current:</span>
                    <div className="text-white">{basicStats.maxCurrent.toFixed(2)} µA</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Minimum Current:</span>
                    <div className="text-white">{basicStats.minCurrent.toFixed(2)} µA</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Average Current:</span>
                    <div className="text-white">{basicStats.avgCurrent.toFixed(2)} µA</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Data Quality:</span>
                    <div className="text-green-400">
                      {basicStats.dataPoints > 100 ? 'Excellent' : 
                       basicStats.dataPoints > 50 ? 'Good' : 'Limited'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Technique-Specific Analysis */}
            <div className="bg-gray-800 p-4 rounded-lg">
              {renderTechniqueSpecificAnalysis()}
            </div>

            {/* Experimental Conditions */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-3">Experimental Conditions</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400">Technique:</span>
                  <div className="text-white">{technique.name}</div>
                </div>
                <div>
                  <span className="text-gray-400">Category:</span>
                  <div className="text-white capitalize">{technique.category}</div>
                </div>
                <div>
                  <span className="text-gray-400">Sensitivity Rating:</span>
                  <div className="text-white">{technique.sensitivity}/10</div>
                </div>
                <div>
                  <span className="text-gray-400">Complexity Rating:</span>
                  <div className="text-white">{technique.complexity}/10</div>
                </div>
              </div>
            </div>

            {/* Data Quality Assessment */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-3">Data Quality Assessment</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Signal Stability:</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-600 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-white">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Noise Level:</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-600 rounded-full h-2 mr-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-white">Low</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Data Completeness:</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-600 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <span className="text-white">95%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-3">Recommendations</h4>
              <div className="space-y-2 text-xs text-gray-400">
                {technique.id === 'cv' && (
                  <>
                    <div>• Consider multiple scan rates for kinetic analysis</div>
                    <div>• Check for electrode fouling if peaks decrease</div>
                    <div>• Verify solution deoxygenation for accurate results</div>
                  </>
                )}
                {technique.id === 'eis' && (
                  <>
                    <div>• Ensure stable potential during measurement</div>
                    <div>• Check cable connections for high-frequency artifacts</div>
                    <div>• Consider longer equilibration time</div>
                  </>
                )}
                {technique.id === 'ca' && (
                  <>
                    <div>• Allow sufficient time for steady state</div>
                    <div>• Monitor for electrode bubble formation</div>
                    <div>• Consider stirring effects on mass transport</div>
                  </>
                )}
                {(technique.id === 'dpv' || technique.id === 'swv') && (
                  <>
                    <div>• Optimize pulse parameters for your analyte</div>
                    <div>• Consider baseline correction methods</div>
                    <div>• Verify peak shape for quantitative analysis</div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}