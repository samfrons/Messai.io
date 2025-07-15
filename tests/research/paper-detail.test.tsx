import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionProvider } from 'next-auth/react'
import PaperDetailPage from '@/app/literature/[id]/page'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock paper data
const mockRealPaper = {
  id: '1',
  title: 'High-Performance Microbial Fuel Cell with Graphene Electrodes',
  authors: '["Dr. Jane Smith", "Prof. John Doe", "Dr. Sarah Wilson"]',
  abstract: 'This study presents a novel microbial fuel cell design using graphene-based electrodes that achieves unprecedented power density of 25,000 mW/m². The system demonstrates exceptional performance with Geobacter sulfurreducens biofilms.',
  doi: '10.1038/s41560-024-01234-5',
  pubmedId: '38123456',
  arxivId: null,
  ieeeId: null,
  publicationDate: '2024-01-15T00:00:00.000Z',
  journal: 'Nature Energy',
  volume: '9',
  issue: '1',
  pages: '123-135',
  keywords: '["Microbial Fuel Cell", "Graphene", "Bioelectrochemical", "Renewable Energy", "Geobacter"]',
  externalUrl: 'https://doi.org/10.1038/s41560-024-01234-5',
  organismTypes: '["Geobacter sulfurreducens", "Shewanella oneidensis"]',
  anodeMaterials: '["Graphene oxide", "Carbon cloth", "Nitrogen-doped graphene"]',
  cathodeMaterials: '["Platinum catalyst", "Stainless steel mesh"]',
  powerOutput: 25000,
  efficiency: 89.5,
  systemType: 'MFC',
  source: 'crossref_api',
  isPublic: true,
  createdAt: '2024-01-20T10:30:00.000Z',
  user: {
    id: 'user-123',
    name: 'Dr. Research Expert',
    email: 'research@university.edu',
    institution: 'MIT Energy Lab'
  },
  experiments: [
    {
      id: 'exp-1',
      notes: 'Used as reference for baseline performance comparison',
      citationType: 'background',
      experiment: {
        id: 'exp-1',
        name: 'MFC Performance Optimization Study',
        status: 'completed'
      }
    },
    {
      id: 'exp-2',
      notes: 'Electrode material comparison study',
      citationType: 'method',
      experiment: {
        id: 'exp-2',
        name: 'Graphene vs Carbon Cloth Analysis',
        status: 'active'
      }
    }
  ],
  _count: {
    experiments: 2
  }
}

const mockAIPaper = {
  id: '2',
  title: 'AI-Generated Paper on Bioelectrochemical Systems',
  authors: '["AI Research Assistant"]',
  abstract: 'This is an AI-generated research paper about bioelectrochemical systems.',
  doi: null,
  pubmedId: null,
  arxivId: null,
  ieeeId: null,
  publicationDate: null,
  journal: null,
  volume: null,
  issue: null,
  pages: null,
  keywords: '["Bioelectrochemical", "AI Generated", "Synthetic Data"]',
  externalUrl: 'https://example.com/ai-paper',
  organismTypes: null,
  anodeMaterials: null,
  cathodeMaterials: null,
  powerOutput: null,
  efficiency: null,
  systemType: 'BES',
  source: 'arxiv_api',
  isPublic: true,
  createdAt: '2024-01-10T08:15:00.000Z',
  user: {
    id: 'research-user',
    name: 'Research Assistant',
    email: 'research@messai.io'
  },
  experiments: [],
  _count: {
    experiments: 0
  }
}

// Mock fetch globally
global.fetch = vi.fn()

describe('Paper Detail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
  })

  describe('Real Paper Display', () => {
    beforeEach(() => {
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/papers/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockRealPaper)
          })
        }
        return Promise.reject(new Error('Unhandled fetch'))
      })
    })

    it('renders real paper with quality badge', async () => {
      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '1' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('High-Performance Microbial Fuel Cell with Graphene Electrodes')).toBeInTheDocument()
      })

      // Check quality badge
      expect(screen.getByText('✅')).toBeInTheDocument()
      expect(screen.getByText('DOI Verified Research Paper')).toBeInTheDocument()
    })

    it('displays prominent external link button', async () => {
      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '1' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        const readPaperButton = screen.getByText('Read Full Paper')
        expect(readPaperButton).toBeInTheDocument()
        expect(readPaperButton.closest('a')).toHaveAttribute('href', 'https://doi.org/10.1038/s41560-024-01234-5')
        expect(readPaperButton.closest('a')).toHaveAttribute('target', '_blank')
      })
    })

    it('shows enhanced performance metrics', async () => {
      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '1' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        // Performance section
        expect(screen.getByText('⚡')).toBeInTheDocument()
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument()
        expect(screen.getByText('✅ Verified Data')).toBeInTheDocument()
        
        // Specific metrics
        expect(screen.getByText('MFC')).toBeInTheDocument()
        expect(screen.getByText('25,000')).toBeInTheDocument()
        expect(screen.getByText('mW/m² Power Density')).toBeInTheDocument()
        expect(screen.getByText('89.5%')).toBeInTheDocument()
        expect(screen.getByText('Coulombic Efficiency')).toBeInTheDocument()
        expect(screen.getByText('🚀 High Performance')).toBeInTheDocument()
        expect(screen.getByText('🎯 Excellent')).toBeInTheDocument()
      })
    })

    it('displays materials and organisms section', async () => {
      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '1' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        // Materials section
        expect(screen.getByText('🔬')).toBeInTheDocument()
        expect(screen.getByText('Materials & Organisms')).toBeInTheDocument()
        
        // Anode materials
        expect(screen.getByText('Anode Materials')).toBeInTheDocument()
        expect(screen.getByText('Graphene oxide')).toBeInTheDocument()
        expect(screen.getByText('Carbon cloth')).toBeInTheDocument()
        expect(screen.getByText('Nitrogen-doped graphene')).toBeInTheDocument()
        
        // Cathode materials
        expect(screen.getByText('Cathode Materials')).toBeInTheDocument()
        expect(screen.getByText('Platinum catalyst')).toBeInTheDocument()
        expect(screen.getByText('Stainless steel mesh')).toBeInTheDocument()
        
        // Organisms
        expect(screen.getByText('Microorganisms')).toBeInTheDocument()
        expect(screen.getByText('Geobacter sulfurreducens')).toBeInTheDocument()
        expect(screen.getByText('Shewanella oneidensis')).toBeInTheDocument()
      })
    })

    it('shows multiple access options', async () => {
      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '1' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        // Access options section
        expect(screen.getByText('📚 Access Options')).toBeInTheDocument()
        
        // DOI link
        const doiLink = screen.getByText('DOI Link')
        expect(doiLink).toBeInTheDocument()
        expect(doiLink.closest('a')).toHaveAttribute('href', 'https://doi.org/10.1038/s41560-024-01234-5')
        
        // PubMed link
        const pubmedLink = screen.getByText('PubMed')
        expect(pubmedLink).toBeInTheDocument()
        expect(pubmedLink.closest('a')).toHaveAttribute('href', 'https://pubmed.ncbi.nlm.nih.gov/38123456')
        
        // External URL
        const externalLink = screen.getByText('Full Text')
        expect(externalLink).toBeInTheDocument()
        expect(externalLink.closest('a')).toHaveAttribute('href', 'https://doi.org/10.1038/s41560-024-01234-5')
      })
    })

    it('displays linked experiments', async () => {
      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '1' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Cited in Experiments')).toBeInTheDocument()
        
        // First experiment
        expect(screen.getByText('MFC Performance Optimization Study')).toBeInTheDocument()
        expect(screen.getByText('Status: completed')).toBeInTheDocument()
        expect(screen.getByText('Citation type: background')).toBeInTheDocument()
        expect(screen.getByText('Used as reference for baseline performance comparison')).toBeInTheDocument()
        
        // Second experiment
        expect(screen.getByText('Graphene vs Carbon Cloth Analysis')).toBeInTheDocument()
        expect(screen.getByText('Status: active')).toBeInTheDocument()
        expect(screen.getByText('Citation type: method')).toBeInTheDocument()
        expect(screen.getByText('Electrode material comparison study')).toBeInTheDocument()
      })
    })

    it('handles experiment navigation', async () => {
      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '1' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        const experimentLink = screen.getByText('MFC Performance Optimization Study').closest('a')
        expect(experimentLink).toHaveAttribute('href', '/experiment/exp-1')
      })
    })
  })

  describe('AI Paper Display', () => {
    beforeEach(() => {
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/papers/2')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockAIPaper)
          })
        }
        return Promise.reject(new Error('Unhandled fetch'))
      })
    })

    it('renders AI paper with appropriate badges', async () => {
      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '2' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('AI-Generated Paper on Bioelectrochemical Systems')).toBeInTheDocument()
      })

      // Check AI badge
      expect(screen.getByText('🤖')).toBeInTheDocument()
      expect(screen.getByText('AI-Enhanced Content')).toBeInTheDocument()
    })

    it('does not show performance metrics for papers without data', async () => {
      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '2' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('AI-Generated Paper on Bioelectrochemical Systems')).toBeInTheDocument()
      })

      // Should not show performance metrics section
      expect(screen.queryByText('Performance Metrics')).not.toBeInTheDocument()
      expect(screen.queryByText('Materials & Organisms')).not.toBeInTheDocument()
    })

    it('shows external URL for AI papers', async () => {
      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '2' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        const externalLink = screen.getByText('Full Text')
        expect(externalLink).toBeInTheDocument()
        expect(externalLink.closest('a')).toHaveAttribute('href', 'https://example.com/ai-paper')
      })
    })
  })

  describe('Owner Actions', () => {
    const mockSession = {
      user: { id: 'user-123', email: 'research@university.edu' }
    }

    beforeEach(() => {
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/papers/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockRealPaper)
          })
        }
        return Promise.reject(new Error('Unhandled fetch'))
      })
    })

    it('shows edit and delete buttons for paper owner', async () => {
      render(
        <SessionProvider session={mockSession}>
          <PaperDetailPage params={{ id: '1' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
        expect(screen.getByText('Delete')).toBeInTheDocument()
      })
    })

    it('handles paper deletion', async () => {
      const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
      
      // Mock successful deletion
      ;(global.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url.includes('/api/papers/1') && options?.method === 'DELETE') {
          return Promise.resolve({ ok: true })
        }
        if (url.includes('/api/papers/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockRealPaper)
          })
        }
        return Promise.reject(new Error('Unhandled fetch'))
      })

      render(
        <SessionProvider session={mockSession}>
          <PaperDetailPage params={{ id: '1' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        const deleteButton = screen.getByText('Delete')
        fireEvent.click(deleteButton)
      })

      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this paper?')
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/literature')
      })

      mockConfirm.mockRestore()
    })
  })

  describe('Error Handling', () => {
    it('redirects to literature page when paper not found', async () => {
      ;(global.fetch as any).mockImplementation(() => 
        Promise.resolve({ ok: false, status: 404 })
      )

      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: 'nonexistent' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/literature')
      })
    })

    it('handles API errors gracefully', async () => {
      ;(global.fetch as any).mockImplementation(() => 
        Promise.reject(new Error('Network error'))
      )

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '1' }} />
        </SessionProvider>
      )

      // Should show loading initially, then handle error
      expect(screen.getByText('Back to Literature')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('Data Quality Indicators', () => {
    beforeEach(() => {
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/papers/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockRealPaper)
          })
        }
        return Promise.reject(new Error('Unhandled fetch'))
      })
    })

    it('shows peer-reviewed indicator for real papers', async () => {
      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '1' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Peer-reviewed')).toBeInTheDocument()
      })
    })

    it('formats authors correctly', async () => {
      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '1' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Dr. Jane Smith, Prof. John Doe, Dr. Sarah Wilson')).toBeInTheDocument()
      })
    })

    it('formats publication date correctly', async () => {
      render(
        <SessionProvider session={null}>
          <PaperDetailPage params={{ id: '1' }} />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Date:')).toBeInTheDocument()
        expect(screen.getByText('January 15, 2024')).toBeInTheDocument()
      })
    })
  })
})