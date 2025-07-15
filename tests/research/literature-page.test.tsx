import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionProvider } from 'next-auth/react'
import LiteraturePage from '@/app/literature/page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock API responses
const mockPapers = [
  {
    id: '1',
    title: 'Real Paper with DOI',
    authors: '["John Smith", "Jane Doe"]',
    abstract: 'This is a real research paper about MFCs.',
    journal: 'Nature Energy',
    publicationDate: '2024-01-15',
    systemType: 'MFC',
    powerOutput: 25000,
    efficiency: 85.5,
    doi: '10.1038/s41560-024-01234-5',
    externalUrl: 'https://doi.org/10.1038/s41560-024-01234-5',
    source: 'crossref_api',
    _count: { experiments: 3 },
    user: { id: '1', name: 'Test User', email: 'test@example.com' }
  },
  {
    id: '2',
    title: 'PubMed Research Paper',
    authors: '["Academic Author"]',
    abstract: 'This is a peer-reviewed research paper.',
    systemType: 'MEC',
    powerOutput: 15000,
    source: 'pubmed_api',
    _count: { experiments: 0 },
    user: { id: '2', name: 'Academic User', email: 'academic@example.com' }
  }
]

const mockStats = {
  totalPapers: 4380,
  aiProcessed: 3850,
  uniqueMaterials: 127,
  uniqueOrganisms: 45,
  withPowerOutput: 4200,
  withEfficiency: 3800,
  papers2024: 1200,
  knowledgeNodes: 892,
  smartConnections: 3504,
  systemTypes: [
    { type: 'MFC', count: 2200 },
    { type: 'MEC', count: 1100 },
    { type: 'MDC', count: 680 },
    { type: 'MES', count: 400 }
  ],
  sources: [
    { source: 'crossref_api', count: 2426 },
    { source: 'pubmed_api', count: 1954 }
  ]
}

// Mock fetch globally
global.fetch = vi.fn()

describe('Literature Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default fetch mocks
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/literature/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStats)
        })
      }
      
      if (url.includes('/api/papers')) {
        const urlObj = new URL(url, 'http://localhost')
        const realOnly = urlObj.searchParams.get('realOnly') === 'true'
        
        const filteredPapers = realOnly 
          ? mockPapers.filter(paper => 
              paper.source === 'crossref_api' || 
              paper.doi || 
              paper.source === 'pubmed_api' ||
              paper.source === 'arxiv_api'
            )
          : mockPapers
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            papers: filteredPapers,
            pagination: { page: 1, limit: 10, total: filteredPapers.length, totalPages: 1 }
          })
        })
      }
      
      return Promise.reject(new Error('Unhandled fetch'))
    })
  })

  it('renders literature page with stats', async () => {
    render(
      <SessionProvider session={null}>
        <LiteraturePage />
      </SessionProvider>
    )

    expect(screen.getByText('Research Literature')).toBeInTheDocument()
    expect(screen.getByText('Browse and search scientific papers on microbial electrochemical systems')).toBeInTheDocument()
    
    // Wait for stats to load
    await waitFor(() => {
      expect(screen.getByText('4,380')).toBeInTheDocument() // Total papers
    })
  })

  it('shows real papers filter by default', async () => {
    render(
      <SessionProvider session={null}>
        <LiteraturePage />
      </SessionProvider>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Real Papers')).toBeInTheDocument()
    })

    // Should only show real papers initially
    await waitFor(() => {
      expect(screen.getByText('Real Paper with DOI')).toBeInTheDocument()
      expect(screen.queryByText('AI Generated Paper')).not.toBeInTheDocument()
    })
  })

  it('toggles between real and all papers', async () => {
    render(
      <SessionProvider session={null}>
        <LiteraturePage />
      </SessionProvider>
    )

    const toggleButton = await screen.findByText('Real Papers')
    
    // Click to show all papers
    fireEvent.click(toggleButton)
    
    await waitFor(() => {
      expect(screen.getByText('All Papers')).toBeInTheDocument()
    })

    // Should now show both real and AI papers
    await waitFor(() => {
      expect(screen.getByText('Real Paper with DOI')).toBeInTheDocument()
      expect(screen.getByText('AI Generated Paper')).toBeInTheDocument()
    })
  })

  it('displays quality indicators for papers', async () => {
    render(
      <SessionProvider session={null}>
        <LiteraturePage />
      </SessionProvider>
    )

    // Wait for papers to load
    await waitFor(() => {
      expect(screen.getByText('Real Paper with DOI')).toBeInTheDocument()
    })

    // Check for quality indicators
    expect(screen.getByText('✅ DOI Verified')).toBeInTheDocument()
    expect(screen.getByText('⚡ High Performance')).toBeInTheDocument()
    expect(screen.getByText('🔋 Energy Generation')).toBeInTheDocument()
  })

  it('shows external links for verified papers', async () => {
    render(
      <SessionProvider session={null}>
        <LiteraturePage />
      </SessionProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Real Paper with DOI')).toBeInTheDocument()
    })

    // Check for "View Paper" link
    const viewPaperLink = screen.getByText('View Paper')
    expect(viewPaperLink).toBeInTheDocument()
    expect(viewPaperLink.closest('a')).toHaveAttribute('href', 'https://doi.org/10.1038/s41560-024-01234-5')
  })

  it('handles search functionality', async () => {
    render(
      <SessionProvider session={null}>
        <LiteraturePage />
      </SessionProvider>
    )

    const searchInput = screen.getByPlaceholderText(/Search.*papers/)
    const searchButton = screen.getByText('Search')

    fireEvent.change(searchInput, { target: { value: 'MFC' } })
    fireEvent.click(searchButton)

    // Verify fetch was called with search parameter
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=MFC')
      )
    })
  })

  it('displays performance metrics correctly', async () => {
    render(
      <SessionProvider session={null}>
        <LiteraturePage />
      </SessionProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('25,000 mW/m²')).toBeInTheDocument()
      expect(screen.getByText('Power Density')).toBeInTheDocument()
      expect(screen.getByText('🚀 Above Average Performance')).toBeInTheDocument()
    })
  })

  it('shows proper data quality indicators', async () => {
    render(
      <SessionProvider session={null}>
        <LiteraturePage />
      </SessionProvider>
    )

    // Toggle to show all papers
    const toggleButton = await screen.findByText('Real Papers')
    fireEvent.click(toggleButton)

    await waitFor(() => {
      // Real paper indicators
      expect(screen.getByText('Verified research paper')).toBeInTheDocument()
      expect(screen.getByText('• External link available')).toBeInTheDocument()
      
      // AI paper indicators
      expect(screen.getByText('Enhanced with AI analysis')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    // Mock API failure
    ;(global.fetch as any).mockImplementation(() => 
      Promise.reject(new Error('API Error'))
    )

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <SessionProvider session={null}>
        <LiteraturePage />
      </SessionProvider>
    )

    // Should not crash the page
    expect(screen.getByText('Research Literature')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('navigates to paper detail on click', async () => {
    const mockPush = vi.fn()
    vi.mocked(require('next/navigation').useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
    })

    render(
      <SessionProvider session={null}>
        <LiteraturePage />
      </SessionProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Real Paper with DOI')).toBeInTheDocument()
    })

    const paperCard = screen.getByText('Real Paper with DOI').closest('div[class*="cursor-pointer"]')
    expect(paperCard).toBeInTheDocument()

    fireEvent.click(paperCard!)

    expect(mockPush).toHaveBeenCalledWith('/literature/1')
  })

  it('renders pagination when multiple pages', async () => {
    // Mock response with multiple pages
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/papers')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            papers: mockPapers,
            pagination: { page: 1, limit: 10, total: 25, totalPages: 3 }
          })
        })
      }
      
      if (url.includes('/api/literature/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStats)
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
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })
})