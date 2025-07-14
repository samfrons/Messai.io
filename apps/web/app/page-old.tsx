import { Button, Card, CardContent, CardHeader, CardTitle } from '@messai/ui'
import { SCIENTIFIC_CONSTANTS, SystemType } from '@messai/core'
import { Header } from '@/components/Header'
import Link from 'next/link'

export default function HomePage() {
  const features = [
    {
      title: 'Research Intelligence System',
      description: '3,721+ AI-enhanced papers with extracted performance metrics',
      icon: '📚',
      href: '/features/research-intelligence',
      highlights: ['Semantic search', 'Citation networks', 'Knowledge graphs']
    },
    {
      title: '3D Modeling Lab',
      description: 'Interactive, real-time bioelectrochemical system visualization',
      icon: '🔬',
      href: '/features/3d-modeling',
      highlights: ['Real-time rendering', 'Biofilm simulation', 'Flow patterns']
    },
    {
      title: 'Parameters Database',
      description: '1500+ comprehensive parameters across 150 categories',
      icon: '⚡',
      href: '/features/parameters',
      highlights: ['Material properties', 'Compatibility matrix', 'Custom materials']
    },
    {
      title: 'AI Predictions Engine',
      description: 'Machine learning models trained on research data',
      icon: '🤖',
      href: '/features/predictions',
      highlights: ['Performance predictions', 'Multi-objective optimization', 'Confidence scoring']
    },
    {
      title: 'Experiment Platform',
      description: 'Complete lifecycle from setup to publication',
      icon: '🧪',
      href: '/features/experiments',
      highlights: ['Real-time monitoring', 'Team collaboration', 'Data export']
    },
    {
      title: 'Model Design Catalog',
      description: 'Growing collection of original multi-scale MESS models',
      icon: '🏗️',
      href: '/features/catalog',
      highlights: ['Microfluidic designs', 'Industrial systems', 'Custom configurations']
    }
  ]

  return (
    <>
      <Header />
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          MESSAi Platform
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Clean architecture foundation for microbial electrochemical systems research and development
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Core Package:</span>
                <span className="text-sm font-medium text-green-600">✓ Loaded</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">UI Components:</span>
                <span className="text-sm font-medium text-green-600">✓ Ready</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">API Health:</span>
                <span className="text-sm font-medium text-green-600">✓ Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scientific Constants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Faraday Constant:</span>
                <span className="text-sm font-mono">{SCIENTIFIC_CONSTANTS.FARADAY_CONSTANT.toLocaleString()} C/mol</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Gas Constant:</span>
                <span className="text-sm font-mono">{SCIENTIFIC_CONSTANTS.GAS_CONSTANT} J/(mol·K)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Standard Temp:</span>
                <span className="text-sm font-mono">{SCIENTIFIC_CONSTANTS.STANDARD_TEMP} K</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supported Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Available system types:</div>
              <div className="flex flex-wrap gap-2">
                {(['MFC', 'MEC', 'MDC', 'MES'] as SystemType[]).map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <div className="space-y-4">
          <p className="text-gray-600">
            This is the clean MESSAi architecture foundation. Feature-specific functionality 
            will be available through dedicated worktrees.
          </p>
          <div className="flex justify-center gap-4">
            <Button>Explore Features</Button>
            <Button variant="outline">Documentation</Button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}