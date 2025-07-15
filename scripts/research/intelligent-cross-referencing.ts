import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

interface CitationNetwork {
  paperId: string
  directCitations: string[]
  indirectCitations: string[]
  citationScore: number
  influenceMetrics: {
    hIndex: number
    citationCount: number
    impactFactor: number
    noveltyScore: number
  }
}

interface SmartRecommendation {
  type: 'similar_work' | 'complementary_research' | 'methodological_advance' | 'application_extension'
  targetPaper: string
  recommendedPapers: string[]
  reasoning: string
  confidence: number
  potentialImpact: number
}

interface ResearchLineage {
  conceptId: string
  conceptName: string
  evolutionPath: {
    paperId: string
    title: string
    year: number
    breakthrough: boolean
    performanceMetrics: { power?: number; efficiency?: number }
    innovations: string[]
  }[]
  futureDirections: string[]
  keyResearchers: string[]
}

interface CrossReferenceSystem {
  citations: CitationNetwork[]
  recommendations: SmartRecommendation[]
  researchLineages: ResearchLineage[]
  collaborationMap: Map<string, string[]>
  conceptEvolution: Map<string, any[]>
}

class IntelligentCrossReferenceEngine {
  private papers: any[] = []
  private citationNetwork: Map<string, CitationNetwork> = new Map()
  private authorCollaborations: Map<string, Set<string>> = new Map()
  private conceptTimelines: Map<string, any[]> = new Map()
  private performanceEvolution: Map<string, { year: number, value: number, paperId: string }[]> = new Map()

  constructor() {}

  private async loadPaperData() {
    console.log('📚 Loading papers for cross-reference analysis...')
    
    this.papers = await prisma.researchPaper.findMany({
      select: {
        id: true,
        title: true,
        authors: true,
        systemType: true,
        powerOutput: true,
        efficiency: true,
        anodeMaterials: true,
        cathodeMaterials: true,
        organismTypes: true,
        keywords: true,
        source: true,
        publicationDate: true,
        journal: true,
        abstract: true,
        doi: true
      }
    })

    console.log(`✅ Loaded ${this.papers.length} papers for analysis`)
  }

  private buildCitationNetworks() {
    console.log('🔗 Building citation networks...')
    
    // Create citation networks based on content similarity and temporal relationships
    this.papers.forEach(paper => {
      const citations: CitationNetwork = {
        paperId: paper.id,
        directCitations: [],
        indirectCitations: [],
        citationScore: 0,
        influenceMetrics: {
          hIndex: 0,
          citationCount: 0,
          impactFactor: 0,
          noveltyScore: 0
        }
      }

      // Find papers with similar materials/organisms (potential citations)
      const similarPapers = this.papers.filter(otherPaper => {
        if (otherPaper.id === paper.id) return false
        
        // Check material overlap
        if (paper.anodeMaterials && otherPaper.anodeMaterials) {
          try {
            const materials1 = JSON.parse(paper.anodeMaterials)
            const materials2 = JSON.parse(otherPaper.anodeMaterials)
            const overlap = materials1.some((m: string) => materials2.includes(m))
            if (overlap) return true
          } catch (e) {
            if (paper.anodeMaterials === otherPaper.anodeMaterials) return true
          }
        }

        // Check organism overlap
        if (paper.organismTypes && otherPaper.organismTypes) {
          try {
            const organisms1 = JSON.parse(paper.organismTypes)
            const organisms2 = JSON.parse(otherPaper.organismTypes)
            const overlap = organisms1.some((o: string) => organisms2.includes(o))
            if (overlap) return true
          } catch (e) {
            if (paper.organismTypes === otherPaper.organismTypes) return true
          }
        }

        // Check system type match
        if (paper.systemType === otherPaper.systemType) return true

        return false
      })

      // Determine citation relationships based on temporal order and performance
      similarPapers.forEach(similarPaper => {
        const paperYear = paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : 2024
        const similarYear = similarPaper.publicationDate ? new Date(similarPaper.publicationDate).getFullYear() : 2024
        
        // Papers cite earlier work
        if (paperYear > similarYear) {
          citations.directCitations.push(similarPaper.id)
        }
        
        // Calculate citation score based on performance comparison
        if (paper.powerOutput && similarPaper.powerOutput) {
          const performanceRatio = paper.powerOutput / similarPaper.powerOutput
          if (performanceRatio > 1.2) { // Significant improvement
            citations.citationScore += Math.log(performanceRatio)
          }
        }
      })

      // Calculate influence metrics
      citations.influenceMetrics.citationCount = citations.directCitations.length
      citations.influenceMetrics.impactFactor = this.calculateImpactFactor(paper)
      citations.influenceMetrics.noveltyScore = this.calculateNoveltyScore(paper)
      citations.influenceMetrics.hIndex = Math.min(citations.influenceMetrics.citationCount, Math.sqrt(citations.citationScore))

      this.citationNetwork.set(paper.id, citations)
    })

    console.log(`✅ Built citation networks for ${this.citationNetwork.size} papers`)
  }

  private calculateImpactFactor(paper: any): number {
    let impact = 1.0

    // Journal impact (simplified)
    const highImpactJournals = ['Nature', 'Science', 'Cell', 'Nature Energy', 'Energy & Environmental Science']
    if (highImpactJournals.some(journal => paper.journal?.includes(journal))) {
      impact += 2.0
    }

    // Performance impact
    if (paper.powerOutput) {
      if (paper.powerOutput > 50000) impact += 1.5
      else if (paper.powerOutput > 20000) impact += 1.0
      else if (paper.powerOutput > 10000) impact += 0.5
    }

    // Source credibility
    if (paper.source === 'local_pdf') impact += 0.5 // Original research
    if (paper.source === 'crossref_api' || paper.source === 'pubmed_api') impact += 0.8 // Verified academic sources

    return impact
  }

  private calculateNoveltyScore(paper: any): number {
    let novelty = 0

    // Check for novel materials
    if (paper.anodeMaterials) {
      try {
        const materials = JSON.parse(paper.anodeMaterials)
        materials.forEach((material: string) => {
          if (material.includes('quantum') || material.includes('MXene') || material.includes('synthetic')) {
            novelty += 1
          }
        })
      } catch (e) {
        if (paper.anodeMaterials.includes('quantum') || paper.anodeMaterials.includes('MXene')) {
          novelty += 1
        }
      }
    }

    // Check for novel organisms
    if (paper.organismTypes) {
      try {
        const organisms = JSON.parse(paper.organismTypes)
        organisms.forEach((organism: string) => {
          if (organism.includes('engineered') || organism.includes('synthetic') || organism.includes('CRISPR')) {
            novelty += 1
          }
        })
      } catch (e) {
        if (paper.organismTypes.includes('engineered') || paper.organismTypes.includes('synthetic')) {
          novelty += 1
        }
      }
    }

    // Check for breakthrough performance
    if (paper.powerOutput && paper.powerOutput > 100000) novelty += 2
    if (paper.efficiency && paper.efficiency > 95) novelty += 1

    return Math.min(5, novelty) // Cap at 5
  }

  private generateSmartRecommendations(): SmartRecommendation[] {
    console.log('🎯 Generating smart recommendations...')
    
    const recommendations: SmartRecommendation[] = []

    this.papers.forEach(paper => {
      // Similar work recommendations
      const similarPapers = this.findSimilarPapers(paper, 5)
      if (similarPapers.length > 0) {
        recommendations.push({
          type: 'similar_work',
          targetPaper: paper.id,
          recommendedPapers: similarPapers.map(p => p.id),
          reasoning: `Papers with similar materials (${this.extractMaterials(paper).slice(0, 2).join(', ')}) and system type (${paper.systemType})`,
          confidence: 0.85,
          potentialImpact: 0.7
        })
      }

      // Methodological advance recommendations
      const methodologicalAdvances = this.findMethodologicalAdvances(paper)
      if (methodologicalAdvances.length > 0) {
        recommendations.push({
          type: 'methodological_advance',
          targetPaper: paper.id,
          recommendedPapers: methodologicalAdvances.map(p => p.id),
          reasoning: `Papers with advanced techniques that could enhance this research approach`,
          confidence: 0.75,
          potentialImpact: 0.85
        })
      }

      // Application extension recommendations
      const applicationExtensions = this.findApplicationExtensions(paper)
      if (applicationExtensions.length > 0) {
        recommendations.push({
          type: 'application_extension',
          targetPaper: paper.id,
          recommendedPapers: applicationExtensions.map(p => p.id),
          reasoning: `Papers exploring applications that could benefit from this research`,
          confidence: 0.65,
          potentialImpact: 0.8
        })
      }
    })

    console.log(`✅ Generated ${recommendations.length} smart recommendations`)
    return recommendations
  }

  private findSimilarPapers(targetPaper: any, limit: number): any[] {
    const targetMaterials = this.extractMaterials(targetPaper)
    const targetOrganisms = this.extractOrganisms(targetPaper)
    
    return this.papers
      .filter(paper => paper.id !== targetPaper.id)
      .map(paper => ({
        ...paper,
        similarity: this.calculateSimilarity(targetPaper, paper, targetMaterials, targetOrganisms)
      }))
      .filter(paper => paper.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
  }

  private findMethodologicalAdvances(targetPaper: any): any[] {
    // Find papers with higher performance or novel techniques
    return this.papers
      .filter(paper => {
        if (paper.id === targetPaper.id) return false
        
        // Higher performance
        if (targetPaper.powerOutput && paper.powerOutput && paper.powerOutput > targetPaper.powerOutput * 1.5) {
          return true
        }
        
        // Novel techniques (AI, quantum, synthetic biology)
        const novelKeywords = ['ai', 'quantum', 'synthetic', 'CRISPR', 'machine learning']
        if (paper.keywords) {
          try {
            const keywords = JSON.parse(paper.keywords)
            return keywords.some((kw: string) => novelKeywords.some(nkw => kw.toLowerCase().includes(nkw)))
          } catch (e) {
            return novelKeywords.some(nkw => paper.keywords.toLowerCase().includes(nkw))
          }
        }
        
        return false
      })
      .slice(0, 3)
  }

  private findApplicationExtensions(targetPaper: any): any[] {
    // Find papers in different application areas but similar technology
    const targetSystemType = targetPaper.systemType
    const targetMaterials = this.extractMaterials(targetPaper)
    
    return this.papers
      .filter(paper => {
        if (paper.id === targetPaper.id) return false
        
        // Different application but similar technology
        const materialOverlap = this.extractMaterials(paper).some(material => 
          targetMaterials.some(targetMaterial => 
            material.includes(targetMaterial) || targetMaterial.includes(material)
          )
        )
        
        const applicationKeywords = ['building', 'wastewater', 'space', 'medical', 'environmental']
        const hasApplicationFocus = applicationKeywords.some(keyword => 
          paper.title?.toLowerCase().includes(keyword) || 
          paper.abstract?.toLowerCase().includes(keyword)
        )
        
        return materialOverlap && hasApplicationFocus
      })
      .slice(0, 3)
  }

  private extractMaterials(paper: any): string[] {
    const materials: string[] = []
    if (paper.anodeMaterials) {
      try {
        materials.push(...JSON.parse(paper.anodeMaterials))
      } catch (e) {
        materials.push(paper.anodeMaterials)
      }
    }
    if (paper.cathodeMaterials) {
      try {
        materials.push(...JSON.parse(paper.cathodeMaterials))
      } catch (e) {
        materials.push(paper.cathodeMaterials)
      }
    }
    return materials
  }

  private extractOrganisms(paper: any): string[] {
    if (paper.organismTypes) {
      try {
        return JSON.parse(paper.organismTypes)
      } catch (e) {
        return [paper.organismTypes]
      }
    }
    return []
  }

  private calculateSimilarity(paper1: any, paper2: any, materials1: string[], organisms1: string[]): number {
    let similarity = 0

    // Material similarity
    const materials2 = this.extractMaterials(paper2)
    const materialOverlap = materials1.filter(m1 => 
      materials2.some(m2 => m1.includes(m2) || m2.includes(m1))
    ).length
    similarity += (materialOverlap / Math.max(materials1.length, materials2.length, 1)) * 0.4

    // Organism similarity
    const organisms2 = this.extractOrganisms(paper2)
    const organismOverlap = organisms1.filter(o1 => 
      organisms2.some(o2 => o1.includes(o2) || o2.includes(o1))
    ).length
    similarity += (organismOverlap / Math.max(organisms1.length, organisms2.length, 1)) * 0.3

    // System type similarity
    if (paper1.systemType === paper2.systemType) similarity += 0.2

    // Performance similarity
    if (paper1.powerOutput && paper2.powerOutput) {
      const ratio = Math.min(paper1.powerOutput, paper2.powerOutput) / Math.max(paper1.powerOutput, paper2.powerOutput)
      similarity += ratio * 0.1
    }

    return similarity
  }

  private traceResearchLineages(): ResearchLineage[] {
    console.log('🔬 Tracing research lineages...')
    
    const lineages: ResearchLineage[] = []
    
    // Group papers by key concepts
    const conceptGroups = new Map<string, any[]>()
    
    this.papers.forEach(paper => {
      // Extract key concepts from materials
      const materials = this.extractMaterials(paper)
      materials.forEach(material => {
        const concept = this.generalizeToConceptLevel(material)
        if (!conceptGroups.has(concept)) {
          conceptGroups.set(concept, [])
        }
        conceptGroups.get(concept)!.push(paper)
      })
    })

    // Create lineages for major concepts
    conceptGroups.forEach((papers, concept) => {
      if (papers.length >= 5) { // Only for concepts with sufficient papers
        // Sort papers by date
        papers.sort((a, b) => {
          const yearA = a.publicationDate ? new Date(a.publicationDate).getFullYear() : 2024
          const yearB = b.publicationDate ? new Date(b.publicationDate).getFullYear() : 2024
          return yearA - yearB
        })

        const evolutionPath = papers.map(paper => {
          const year = paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : 2024
          return {
            paperId: paper.id,
            title: paper.title || 'Unknown',
            year,
            breakthrough: this.isBreakthrough(paper),
            performanceMetrics: {
              power: paper.powerOutput,
              efficiency: paper.efficiency
            },
            innovations: this.extractInnovations(paper)
          }
        })

        lineages.push({
          conceptId: concept.replace(/\s+/g, '_'),
          conceptName: concept,
          evolutionPath,
          futureDirections: this.predictFutureDirections(concept, papers),
          keyResearchers: this.extractKeyResearchers(papers)
        })
      }
    })

    console.log(`✅ Traced ${lineages.length} research lineages`)
    return lineages
  }

  private generalizeToConceptLevel(material: string): string {
    // Map specific materials to general concepts
    const conceptMap: Record<string, string> = {
      'graphene': 'Carbon Materials',
      'carbon': 'Carbon Materials',
      'CNT': 'Carbon Materials',
      'MXene': 'MXene Materials',
      'Ti3C2': 'MXene Materials',
      'quantum': 'Quantum Materials',
      'synthetic': 'Synthetic Biology',
      'engineered': 'Synthetic Biology',
      'CRISPR': 'Synthetic Biology'
    }

    for (const [key, concept] of Object.entries(conceptMap)) {
      if (material.toLowerCase().includes(key.toLowerCase())) {
        return concept
      }
    }

    return 'General Materials'
  }

  private isBreakthrough(paper: any): boolean {
    // Define breakthrough criteria
    if (paper.powerOutput && paper.powerOutput > 50000) return true
    if (paper.efficiency && paper.efficiency > 95) return true
    
    const breakthroughKeywords = ['breakthrough', 'record', 'unprecedented', 'revolutionary']
    if (paper.title && breakthroughKeywords.some(kw => paper.title.toLowerCase().includes(kw))) {
      return true
    }

    // Check for novel materials or approaches
    if (paper.anodeMaterials) {
      try {
        const materials = JSON.parse(paper.anodeMaterials)
        const novelMaterials = ['quantum', 'MXene', 'synthetic', 'engineered', 'biomimetic']
        if (materials.some((m: string) => novelMaterials.some(nm => m.toLowerCase().includes(nm)))) {
          return true
        }
      } catch (e) {
        // Handle non-JSON materials
      }
    }

    return false
  }

  private extractInnovations(paper: any): string[] {
    const innovations: string[] = []
    
    if (paper.anodeMaterials) {
      const materials = this.extractMaterials(paper)
      materials.forEach(material => {
        if (material.includes('quantum') || material.includes('synthetic') || material.includes('AI')) {
          innovations.push(`Novel ${material}`)
        }
      })
    }

    if (paper.organismTypes) {
      const organisms = this.extractOrganisms(paper)
      organisms.forEach(organism => {
        if (organism.includes('engineered') || organism.includes('CRISPR')) {
          innovations.push(`Engineered organism: ${organism}`)
        }
      })
    }

    return innovations
  }

  private predictFutureDirections(concept: string, papers: any[]): string[] {
    const directions: string[] = []
    
    // Analyze trend in performance
    const recentPapers = papers.slice(-3) // Last 3 papers
    const avgRecentPower = recentPapers
      .filter(p => p.powerOutput)
      .reduce((sum, p) => sum + p.powerOutput, 0) / recentPapers.filter(p => p.powerOutput).length

    if (avgRecentPower > 20000) {
      directions.push('Ultra-high power density systems (>100,000 mW/m²)')
    }

    // Concept-specific predictions
    if (concept.includes('MXene')) {
      directions.push('Multi-element MXene compositions')
      directions.push('MXene-biological hybrid interfaces')
    }
    
    if (concept.includes('Carbon')) {
      directions.push('3D carbon architectures')
      directions.push('Functionalized carbon surfaces')
    }

    if (concept.includes('Synthetic Biology')) {
      directions.push('AI-designed organisms')
      directions.push('Programmable metabolic pathways')
    }

    return directions.slice(0, 5)
  }

  private extractKeyResearchers(papers: any[]): string[] {
    const authorCounts = new Map<string, number>()
    
    papers.forEach(paper => {
      if (paper.authors) {
        try {
          const authors = JSON.parse(paper.authors)
          authors.forEach((author: string) => {
            authorCounts.set(author, (authorCounts.get(author) || 0) + 1)
          })
        } catch (e) {
          // Handle non-JSON authors
        }
      }
    })

    return Array.from(authorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([author, _]) => author)
  }

  public async generateCrossReferenceSystem(): Promise<CrossReferenceSystem> {
    await this.loadPaperData()
    this.buildCitationNetworks()
    
    const recommendations = this.generateSmartRecommendations()
    const lineages = this.traceResearchLineages()
    
    return {
      citations: Array.from(this.citationNetwork.values()),
      recommendations,
      researchLineages: lineages,
      collaborationMap: new Map(Array.from(this.authorCollaborations.entries()).map(([k, v]) => [k, Array.from(v)])),
      conceptEvolution: this.conceptTimelines
    }
  }
}

async function runIntelligentCrossReferencing() {
  try {
    console.log('🧠 Initializing Intelligent Cross-Reference Engine...')
    
    const engine = new IntelligentCrossReferenceEngine()
    const system = await engine.generateCrossReferenceSystem()
    
    console.log('\n📊 CROSS-REFERENCE SYSTEM RESULTS')
    console.log('='.repeat(50))
    
    console.log(`\n🔗 Citation Networks: ${system.citations.length}`)
    const topCited = system.citations
      .sort((a, b) => b.influenceMetrics.citationCount - a.influenceMetrics.citationCount)
      .slice(0, 5)
    
    console.log('Top Cited Papers:')
    topCited.forEach((citation, i) => {
      console.log(`${i + 1}. Citations: ${citation.influenceMetrics.citationCount}, Impact: ${citation.influenceMetrics.impactFactor.toFixed(2)}`)
    })
    
    console.log(`\n🎯 Smart Recommendations: ${system.recommendations.length}`)
    const recommendationTypes = new Map<string, number>()
    system.recommendations.forEach(rec => {
      recommendationTypes.set(rec.type, (recommendationTypes.get(rec.type) || 0) + 1)
    })
    console.log('Recommendation Types:')
    recommendationTypes.forEach((count, type) => {
      console.log(`  ${type}: ${count}`)
    })
    
    console.log(`\n🔬 Research Lineages: ${system.researchLineages.length}`)
    system.researchLineages.slice(0, 3).forEach((lineage, i) => {
      console.log(`${i + 1}. ${lineage.conceptName}: ${lineage.evolutionPath.length} papers`)
      console.log(`   Future directions: ${lineage.futureDirections.slice(0, 2).join(', ')}`)
    })
    
    // Save cross-reference system
    const report = {
      generatedAt: new Date().toISOString(),
      version: "1.0",
      statistics: {
        totalCitations: system.citations.length,
        totalRecommendations: system.recommendations.length,
        totalLineages: system.researchLineages.length,
        recommendationTypes: Object.fromEntries(recommendationTypes)
      },
      ...system
    }
    
    fs.writeFileSync('/Users/samfrons/Desktop/clean-messai/messai-mvp/cross-reference-system.json', JSON.stringify(report, null, 2))
    
    console.log('\n💾 Cross-reference system saved to: cross-reference-system.json')
    
    return system
    
  } catch (error) {
    console.error('Error running Intelligent Cross-Referencing:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Main execution
if (require.main === module) {
  runIntelligentCrossReferencing()
}

export { IntelligentCrossReferenceEngine, runIntelligentCrossReferencing }