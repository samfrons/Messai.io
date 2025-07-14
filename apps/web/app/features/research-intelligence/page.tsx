import { Button, Card, CardContent, CardHeader, CardTitle } from '@messai/ui'

export default function ResearchIntelligencePage() {
  const stats = [
    { label: 'Research Papers', value: '3,721+', description: 'AI-enhanced and summarized' },
    { label: 'Knowledge Graph Nodes', value: '1,200+', description: 'Connected research concepts' },
    { label: 'Graph Connections', value: '2,750+', description: 'Research relationships mapped' },
    { label: 'External Integrations', value: '4', description: 'PubMed, CrossRef, IEEE, Google Scholar' }
  ]

  const features = [
    {
      title: 'AI-Enhanced Literature Analysis',
      description: 'Advanced natural language processing extracts key metrics, methodologies, and results from thousands of research papers.',
      icon: '🧠'
    },
    {
      title: 'Semantic Search Engine',
      description: 'Find papers using natural language queries across abstracts, methods, results, and extracted performance data.',
      icon: '🔍'
    },
    {
      title: 'Citation Network Analysis',
      description: 'Discover research lineages, influential papers, and emerging trends through interactive citation maps.',
      icon: '🕸️'
    },
    {
      title: 'Knowledge Graph Visualization',
      description: 'Explore research concepts and their relationships through an interactive knowledge graph interface.',
      icon: '📊'
    },
    {
      title: 'Performance Metrics Database',
      description: 'Extracted power density, efficiency, and operational parameters from research publications.',
      icon: '⚡'
    },
    {
      title: 'Research Trend Analytics',
      description: 'Track emerging technologies, popular materials, and research momentum over time.',
      icon: '📈'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="section relative">
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-6xl mb-6">📚</div>
            <h1 className="heading-1 mb-6">Research Intelligence System</h1>
            <p className="body-large mb-12">
              Accelerate your research with AI-powered analysis of 3,721+ bioelectrochemical systems papers.
              Extract insights, discover connections, and stay ahead of emerging trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                Explore Research Database
              </Button>
              <Button variant="outline" size="lg">
                View Knowledge Graph
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-light text-gradient mb-2">{stat.value}</div>
                <div className="font-medium mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Intelligent Research Tools</h2>
            <p className="body-large max-w-3xl mx-auto">
              Transform how you discover, analyze, and build upon bioelectrochemical systems research
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="section bg-gradient-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-2 mb-4">Experience Research Intelligence</h2>
          <p className="body-large max-w-2xl mx-auto mb-8">
            See how AI transforms literature review from weeks to hours
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Try Interactive Demo
            </Button>
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/20">
              Schedule Walkthrough
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}