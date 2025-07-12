import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionProvider } from 'next-auth/react'
import LiteraturePage from '@/app/literature/page'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock comprehensive paper dataset
const mockPaperDatabase = {
  realPapers: [
    {
      id: 'real-1',
      title: 'High-Performance MFC with Graphene Electrodes',
      authors: '["Dr. Jane Smith", "Prof. John Doe"]',
      abstract: 'Revolutionary MFC design achieving 25,000 mW/m² power density.',
      journal: 'Nature Energy',
      publicationDate: '2024-01-15',
      systemType: 'MFC',
      powerOutput: 25000,
      efficiency: 89.5,
      doi: '10.1038/s41560-024-01234-5',
      externalUrl: 'https://doi.org/10.1038/s41560-024-01234-5',
      source: 'crossref_api',
      _count: { experiments: 3 },
      user: { id: '1', name: 'Dr. Smith', email: 'smith@mit.edu' }
    },
    {
      id: 'real-2',
      title: 'Microbial Electrolysis for Hydrogen Production',
      authors: '["Prof. Sarah Wilson", "Dr. Mike Chen"]',
      abstract: 'Novel MEC design for efficient hydrogen production from wastewater.',
      journal: 'Energy & Environmental Science',
      publicationDate: '2024-02-20',
      systemType: 'MEC',
      powerOutput: 18000,
      efficiency: 78.2,
      pubmedId: '38123456',
      externalUrl: 'https://pubmed.ncbi.nlm.nih.gov/38123456',
      source: 'pubmed_api',
      _count: { experiments: 2 },
      user: { id: '2', name: 'Prof. Wilson', email: 'wilson@stanford.edu' }
    },
    {
      id: 'real-3',
      title: 'Bioelectrochemical Wastewater Treatment Systems',
      authors: '["Dr. Alex Kumar", "Dr. Lisa Park"]',
      abstract: 'Large-scale implementation of bioelectrochemical systems for municipal wastewater treatment.',
      journal: 'Water Research',
      publicationDate: '2023-11-10',
      systemType: 'MDC',
      powerOutput: 12000,
      efficiency: 65.8,
      arxivId: '2311.12345',
      externalUrl: 'https://arxiv.org/abs/2311.12345',
      source: 'arxiv_api',
      _count: { experiments: 1 },
      user: { id: '3', name: 'Dr. Kumar', email: 'kumar@caltech.edu' }
    }
  ],
  aiPapers: [
    {
      id: 'ai-1',
      title: 'AI-Enhanced Bioelectrochemical System Design',
      authors: '["AI Research Assistant"]',
      abstract: 'AI-generated research on optimizing bioelectrochemical systems.',
      systemType: 'BES',
      powerOutput: 15000,
      source: 'ai_smart_literature',
      _count: { experiments: 0 },
      user: { id: 'ai-1', name: 'AI Assistant', email: 'ai@messai.io' }
    },
    {
      id: 'ai-2',
      title: 'Synthetic Data on Microbial Fuel Cell Performance',
      authors: '["Automated Content Generator"]',
      abstract: 'Computer-generated analysis of MFC performance parameters.',
      systemType: 'MFC',
      powerOutput: 20000,
      source: 'ai_smart_literature',
      _count: { experiments: 0 },
      user: { id: 'ai-2', name: 'Content Gen', email: 'gen@messai.io' }
    }
  ]
}

const mockStats = {
  totalPapers: 5,
  aiEnhanced: 2,
  uniqueMaterials: 25,
  uniqueOrganisms: 12,
  withPowerOutput: 5,
  withEfficiency: 3,
  papers2024: 2,
  knowledgeNodes: 87,
  smartConnections: 245,
  systemTypes: [
    { type: 'MFC', count: 2 },
    { type: 'MEC', count: 1 },
    { type: 'MDC', count: 1 },
    { type: 'BES', count: 1 }
  ],
  sources: [
    { source: 'crossref_api', count: 1 },
    { source: 'pubmed_api', count: 1 },
    { source: 'arxiv_api', count: 1 },
    { source: 'ai_smart_literature', count: 2 }
  ]
}

// Mock fetch globally
global.fetch = vi.fn()

describe('Literature Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()

    // Setup default fetch behavior
    ;(global.fetch as any).mockImplementation((url: string) => {
      const urlObj = new URL(url, 'http://localhost')
      
      if (url.includes('/api/literature/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStats)
        })
      }
      
      if (url.includes('/api/papers')) {
        const realOnly = urlObj.searchParams.get('realOnly') === 'true'
        const search = urlObj.searchParams.get('search') || ''
        
        let papers = realOnly 
          ? mockPaperDatabase.realPapers 
          : [...mockPaperDatabase.realPapers, ...mockPaperDatabase.aiPapers]
        
        // Apply search filter
        if (search) {
          papers = papers.filter(paper => 
            paper.title.toLowerCase().includes(search.toLowerCase()) ||
            paper.abstract?.toLowerCase().includes(search.toLowerCase()) ||
            paper.systemType?.toLowerCase().includes(search.toLowerCase())
          )
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            papers,
            pagination: { page: 1, limit: 10, total: papers.length, totalPages: 1 }
          })
        })
      }
      
      return Promise.reject(new Error('Unhandled fetch'))
    })
  })

  describe('Paper Quality Filtering Workflow', () => {
    it('loads with real papers by default and shows quality indicators', async () => {
      render(
        <SessionProvider session={null}>
          <LiteraturePage />
        </SessionProvider>
      )

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Research Literature')).toBeInTheDocument()
      })

      // Should show "Real Papers" toggle is active
      expect(screen.getByText('Real Papers')).toBeInTheDocument()

      // Should show only real papers initially
      await waitFor(() => {
        expect(screen.getByText('High-Performance MFC with Graphene Electrodes')).toBeInTheDocument()
        expect(screen.getByText('Microbial Electrolysis for Hydrogen Production')).toBeInTheDocument()
        expect(screen.getByText('Bioelectrochemical Wastewater Treatment Systems')).toBeInTheDocument()
        
        // Should NOT show AI papers
        expect(screen.queryByText('AI-Enhanced Bioelectrochemical System Design')).not.toBeInTheDocument()
        expect(screen.queryByText('Synthetic Data on Microbial Fuel Cell Performance')).not.toBeInTheDocument()
      })

      // Check quality indicators for real papers
      expect(screen.getByText('✅ DOI Verified')).toBeInTheDocument()
      expect(screen.getByText('⚡ High Performance')).toBeInTheDocument()
      expect(screen.getByText('🔋 Energy Generation')).toBeInTheDocument()
    })

    it('toggles to show all papers including AI-generated content', async () => {
      render(
        <SessionProvider session={null}>
          <LiteraturePage />
        </SessionProvider>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Real Papers')).toBeInTheDocument()
      })

      // Click toggle to show all papers
      const toggleButton = screen.getByText('Real Papers')
      fireEvent.click(toggleButton)

      // Should now show "All Papers"
      await waitFor(() => {
        expect(screen.getByText('All Papers')).toBeInTheDocument()
      })

      // Should now show all papers including AI
      await waitFor(() => {
        expect(screen.getByText('High-Performance MFC with Graphene Electrodes')).toBeInTheDocument()
        expect(screen.getByText('AI-Enhanced Bioelectrochemical System Design')).toBeInTheDocument()
        expect(screen.getByText('Synthetic Data on Microbial Fuel Cell Performance')).toBeInTheDocument()
      })

      // Verify different quality indicators
      expect(screen.getByText('✅ DOI Verified')).toBeInTheDocument() // Real paper
      expect(screen.getByText('Enhanced with AI analysis')).toBeInTheDocument() // AI paper
    })

    it('maintains filter state while searching', async () => {
      render(
        <SessionProvider session={null}>
          <LiteraturePage />
        </SessionProvider>
      )

      // Wait for initial load with real papers filter
      await waitFor(() => {
        expect(screen.getByText('Real Papers')).toBeInTheDocument()
      })

      // Search for MFC papers
      const searchInput = screen.getByPlaceholderText(/Search.*papers/)
      const searchButton = screen.getByText('Search')

      fireEvent.change(searchInput, { target: { value: 'MFC' } })
      fireEvent.click(searchButton)

      // Should show filtered results but maintain real papers only
      await waitFor(() => {
        expect(screen.getByText('High-Performance MFC with Graphene Electrodes')).toBeInTheDocument()
        
        // Should NOT show AI MFC paper since real filter is still active
        expect(screen.queryByText('Synthetic Data on Microbial Fuel Cell Performance')).not.toBeInTheDocument()
      })

      // Verify search was called with realOnly=true
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=MFC&realOnly=true')
      )
    })
  })

  describe('External Link Navigation Workflow', () => {
    it('provides multiple access pathways for real papers', async () => {
      render(
        <SessionProvider session={null}>
          <LiteraturePage />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('High-Performance MFC with Graphene Electrodes')).toBeInTheDocument()
      })

      // Check for "View Paper" buttons for each real paper
      const viewPaperButtons = screen.getAllByText('View Paper')
      expect(viewPaperButtons).toHaveLength(3) // One for each real paper

      // Verify correct URLs
      expect(viewPaperButtons[0].closest('a')).toHaveAttribute('href', 'https://doi.org/10.1038/s41560-024-01234-5')
      expect(viewPaperButtons[1].closest('a')).toHaveAttribute('href', 'https://pubmed.ncbi.nlm.nih.gov/38123456')
      expect(viewPaperButtons[2].closest('a')).toHaveAttribute('href', 'https://arxiv.org/abs/2311.12345')

      // Verify external link attributes
      viewPaperButtons.forEach(button => {
        const link = button.closest('a')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })

    it('handles paper detail navigation with proper context', async () => {
      render(
        <SessionProvider session={null}>
          <LiteraturePage />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('High-Performance MFC with Graphene Electrodes')).toBeInTheDocument()
      })

      // Click on paper title/card (but not the external link)
      const paperCard = screen.getByText('High-Performance MFC with Graphene Electrodes').closest('div[class*="cursor-pointer"]')
      expect(paperCard).toBeInTheDocument()

      fireEvent.click(paperCard!)

      // Should navigate to paper detail page
      expect(mockPush).toHaveBeenCalledWith('/literature/real-1')
    })
  })

  describe('Performance Metrics Display Workflow', () => {
    it('displays comprehensive performance data for verified papers', async () => {
      render(
        <SessionProvider session={null}>
          <LiteraturePage />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('High-Performance MFC with Graphene Electrodes')).toBeInTheDocument()
      })

      // Check performance metrics for high-performing paper
      expect(screen.getByText('25,000 mW/m²')).toBeInTheDocument()
      expect(screen.getByText('Power Density')).toBeInTheDocument()
      expect(screen.getByText('🚀 Above Average Performance')).toBeInTheDocument()

      // Check AI insights for real papers
      expect(screen.getByText('AI Insight Available')).toBeInTheDocument()
      expect(screen.getByText('Cross-referenced')).toBeInTheDocument()
      expect(screen.getByText('Peer-reviewed')).toBeInTheDocument()
    })

    it('shows different performance categories correctly', async () => {
      render(
        <SessionProvider session={null}>
          <LiteraturePage />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Research Literature')).toBeInTheDocument()
      })

      // Wait for all papers to load
      await waitFor(() => {
        expect(screen.getByText('High-Performance MFC with Graphene Electrodes')).toBeInTheDocument()
        expect(screen.getByText('Microbial Electrolysis for Hydrogen Production')).toBeInTheDocument()
        expect(screen.getByText('Bioelectrochemical Wastewater Treatment Systems')).toBeInTheDocument()
      })

      // Check different performance levels
      expect(screen.getByText('25,000 mW/m²')).toBeInTheDocument() // High performance
      expect(screen.getByText('18,000 mW/m²')).toBeInTheDocument() // Medium performance
      expect(screen.getByText('12,000 mW/m²')).toBeInTheDocument() // Lower performance

      // Only high performance should show special indicator
      expect(screen.getByText('🚀 Above Average Performance')).toBeInTheDocument()
    })
  })

  describe('Search and Discovery Workflow', () => {
    it('enables system-type specific searches', async () => {
      render(
        <SessionProvider session={null}>
          <LiteraturePage />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Research Literature')).toBeInTheDocument()
      })

      // Search for MEC papers specifically
      const searchInput = screen.getByPlaceholderText(/Search.*papers/)
      fireEvent.change(searchInput, { target: { value: 'MEC' } })
      fireEvent.click(screen.getByText('Search'))

      // Should show only MEC paper
      await waitFor(() => {
        expect(screen.getByText('Microbial Electrolysis for Hydrogen Production')).toBeInTheDocument()
        expect(screen.queryByText('High-Performance MFC with Graphene Electrodes')).not.toBeInTheDocument()
      })

      // Clear search and search for wastewater
      fireEvent.change(searchInput, { target: { value: 'wastewater' } })
      fireEvent.click(screen.getByText('Search'))

      await waitFor(() => {
        expect(screen.getByText('Bioelectrochemical Wastewater Treatment Systems')).toBeInTheDocument()
        expect(screen.getByText('Microbial Electrolysis for Hydrogen Production')).toBeInTheDocument() // Also mentions wastewater
      })
    })

    it('maintains data quality context during search', async () => {
      render(
        <SessionProvider session={null}>
          <LiteraturePage />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Real Papers')).toBeInTheDocument()
      })

      // Toggle to show all papers
      fireEvent.click(screen.getByText('Real Papers'))

      await waitFor(() => {
        expect(screen.getByText('All Papers')).toBeInTheDocument()
      })

      // Search for MFC (should show both real and AI MFC papers)
      const searchInput = screen.getByPlaceholderText(/Search.*papers/)
      fireEvent.change(searchInput, { target: { value: 'MFC' } })
      fireEvent.click(screen.getByText('Search'))

      await waitFor(() => {
        expect(screen.getByText('High-Performance MFC with Graphene Electrodes')).toBeInTheDocument()
        expect(screen.getByText('Synthetic Data on Microbial Fuel Cell Performance')).toBeInTheDocument()
      })

      // Should maintain different quality indicators
      expect(screen.getByText('✅ DOI Verified')).toBeInTheDocument()
      expect(screen.getByText('Enhanced with AI analysis')).toBeInTheDocument()
    })
  })

  describe('Data Integrity and Error Resilience', () => {
    it('gracefully handles missing performance data', async () => {
      // Mock papers with missing data
      const incompleteData = [
        {
          id: 'incomplete-1',
          title: 'Paper with Missing Data',
          authors: '["Unknown Author"]',
          abstract: 'Abstract only paper.',
          source: 'crossref_api',
          doi: '10.1234/incomplete',
          externalUrl: 'https://doi.org/10.1234/incomplete',
          _count: { experiments: 0 },
          user: { id: '1', name: 'Test', email: 'test@example.com' }
          // Missing: powerOutput, efficiency, systemType
        }
      ]

      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/literature/stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockStats)
          })
        }
        
        if (url.includes('/api/papers')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              papers: incompleteData,
              pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
            })
          })
        }
        
        return Promise.reject(new Error('Unhandled fetch'))
      })

      render(
        <SessionProvider session={null}>
          <LiteraturePage />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Paper with Missing Data')).toBeInTheDocument()
      })

      // Should still show paper with quality indicator
      expect(screen.getByText('✅ DOI Verified')).toBeInTheDocument()
      
      // Should NOT crash or show performance metrics section
      expect(screen.queryByText('mW/m²')).not.toBeInTheDocument()
      expect(screen.queryByText('🚀 Above Average Performance')).not.toBeInTheDocument()
    })

    it('handles API failures gracefully', async () => {
      ;(global.fetch as any).mockImplementation(() => 
        Promise.reject(new Error('Network failure'))
      )

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <SessionProvider session={null}>
          <LiteraturePage />
        </SessionProvider>
      )

      // Page should still render header
      expect(screen.getByText('Research Literature')).toBeInTheDocument()
      expect(screen.getByText('Browse and search scientific papers on microbial electrochemical systems')).toBeInTheDocument()

      // Should show loading state or fallback
      expect(screen.getByText('Real Papers')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('Real-world Usage Patterns', () => {
    it('supports researcher workflow: filter → search → access', async () => {
      render(
        <SessionProvider session={null}>
          <LiteraturePage />
        </SessionProvider>
      )

      // Step 1: Researcher starts with real papers (default)
      await waitFor(() => {
        expect(screen.getByText('Real Papers')).toBeInTheDocument()
        expect(screen.getByText('High-Performance MFC with Graphene Electrodes')).toBeInTheDocument()
      })

      // Step 2: Search for specific topic
      const searchInput = screen.getByPlaceholderText(/Search.*papers/)
      fireEvent.change(searchInput, { target: { value: 'graphene' } })
      fireEvent.click(screen.getByText('Search'))

      await waitFor(() => {
        expect(screen.getByText('High-Performance MFC with Graphene Electrodes')).toBeInTheDocument()
      })

      // Step 3: Access external paper
      const viewPaperButton = screen.getByText('View Paper')
      expect(viewPaperButton.closest('a')).toHaveAttribute('href', 'https://doi.org/10.1038/s41560-024-01234-5')
      
      // Step 4: View detailed information
      const paperCard = screen.getByText('High-Performance MFC with Graphene Electrodes').closest('div[class*="cursor-pointer"]')
      fireEvent.click(paperCard!)
      
      expect(mockPush).toHaveBeenCalledWith('/literature/real-1')
    })

    it('supports comparative analysis workflow', async () => {
      render(
        <SessionProvider session={null}>
          <LiteraturePage />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Research Literature')).toBeInTheDocument()
      })

      // Wait for all papers to load
      await waitFor(() => {
        expect(screen.getByText('High-Performance MFC with Graphene Electrodes')).toBeInTheDocument()
        expect(screen.getByText('Microbial Electrolysis for Hydrogen Production')).toBeInTheDocument()
        expect(screen.getByText('Bioelectrochemical Wastewater Treatment Systems')).toBeInTheDocument()
      })

      // Researcher can compare performance metrics across papers
      const performanceValues = ['25,000 mW/m²', '18,000 mW/m²', '12,000 mW/m²']
      performanceValues.forEach(value => {
        expect(screen.getByText(value)).toBeInTheDocument()
      })

      // Can see quality verification for all
      expect(screen.getByText('✅ DOI Verified')).toBeInTheDocument()
      expect(screen.getByText('✅ arXiv Paper')).toBeInTheDocument()

      // Can access different external sources
      const viewPaperButtons = screen.getAllByText('View Paper')
      expect(viewPaperButtons).toHaveLength(3)
    })
  })
})