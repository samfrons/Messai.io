'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ChartData {
  timestamp: string
  power: number
  voltage: number
  current: number
  temperature: number
  ph: number
  predicted?: number
}

interface ExperimentChartProps {
  experimentId: string
  realTime?: boolean
}

export default function ExperimentChart({ experimentId, realTime = false }: ExperimentChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data generator
  const generateMockData = (count: number = 24): ChartData[] => {
    const now = new Date()
    return Array.from({ length: count }, (_, i) => {
      const timestamp = new Date(now.getTime() - (count - i - 1) * 60 * 60 * 1000)
      const temp = 25 + Math.random() * 10
      const ph = 6.5 + Math.random() * 1.5
      const baseVoltage = 0.3 + Math.random() * 0.4
      const baseCurrent = 0.1 + Math.random() * 0.2
      const power = baseVoltage * baseCurrent * 1000 // mW
      const predicted = 50 + (temp * 5) + (ph * 20) + (Math.random() - 0.5) * 20
      
      return {
        timestamp: timestamp.toLocaleTimeString(),
        power: parseFloat(power.toFixed(2)),
        voltage: parseFloat(baseVoltage.toFixed(3)),
        current: parseFloat(baseCurrent.toFixed(3)),
        temperature: parseFloat(temp.toFixed(1)),
        ph: parseFloat(ph.toFixed(1)),
        predicted: parseFloat(predicted.toFixed(2))
      }
    })
  }

  useEffect(() => {
    // Initial data load
    const mockData = generateMockData()
    setData(mockData)
    setLoading(false)

    // Real-time updates every 5 seconds
    if (realTime) {
      const interval = setInterval(() => {
        const newPoint = generateMockData(1)[0]
        newPoint.timestamp = new Date().toLocaleTimeString()
        
        setData(prevData => {
          const newData = [...prevData.slice(1), newPoint]
          return newData
        })
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [experimentId, realTime])

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Power Output Over Time</h3>
        {realTime && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Data</span>
          </div>
        )}
      </div>
      
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Power (mW)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #ccc',
                borderRadius: '8px'
              }}
              formatter={(value: any, name: string) => [
                `${value}${name === 'power' || name === 'predicted' ? ' mW' : 
                  name === 'voltage' ? ' V' : 
                  name === 'current' ? ' A' : 
                  name === 'temperature' ? '°C' : ''}`,
                name === 'predicted' ? 'AI Prediction' : name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="power" 
              stroke="#0066cc" 
              strokeWidth={2}
              dot={{ fill: '#0066cc', r: 3 }}
              name="Actual Power"
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#00ff88" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#00ff88', r: 3 }}
              name="AI Prediction"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.length > 0 && [
          { label: 'Current Power', value: `${data[data.length - 1].power} mW`, color: 'text-blue-600' },
          { label: 'Voltage', value: `${data[data.length - 1].voltage} V`, color: 'text-green-600' },
          { label: 'Temperature', value: `${data[data.length - 1].temperature}°C`, color: 'text-orange-600' },
          { label: 'pH Level', value: `${data[data.length - 1].ph}`, color: 'text-purple-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">{stat.label}</div>
            <div className={`text-lg font-semibold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}