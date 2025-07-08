import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Simple papers API called')
    
    // Simple query - just get 10 public papers
    const papers = await prisma.researchPaper.findMany({
      where: { isPublic: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        authors: true,
        abstract: true,
        journal: true,
        publicationDate: true,
        doi: true,
        source: true,
        uploadedBy: true,
        createdAt: true,
        updatedAt: true,
        // Enhanced AI extraction fields
        systemType: true,
        powerOutput: true,
        efficiency: true,
        anodeMaterials: true,
        cathodeMaterials: true,
        organismTypes: true,
        keywords: true,
        aiDataExtraction: true,
        aiModelVersion: true,
        aiProcessingDate: true,
        aiConfidence: true
      }
    })
    
    console.log(`Found ${papers.length} papers`)
    
    // Transform papers to parse JSON fields
    const transformedPapers = papers.map(paper => {
      const parseJsonField = (field: string | null): any => {
        if (!field) return null
        
        // If it's already an array or object, return as-is
        if (typeof field === 'object') return field
        
        // Handle string fields
        if (typeof field === 'string') {
          const trimmed = field.trim()
          
          // Skip obviously non-JSON strings
          if (!trimmed.startsWith('[') && !trimmed.startsWith('{') && !trimmed.startsWith('"')) {
            return field
          }
          
          try {
            const parsed = JSON.parse(trimmed)
            // If parsed result is an object, make sure it's properly handled
            if (typeof parsed === 'object' && parsed !== null) {
              if (Array.isArray(parsed)) {
                return parsed.filter(item => item && typeof item === 'string' && item.trim().length > 0)
              }
              // Convert object to array of values if it has string values
              if (typeof parsed === 'object') {
                const values = Object.values(parsed).filter(val => typeof val === 'string' && val.trim().length > 0)
                return values.length > 0 ? values : null
              }
            }
            return parsed
          } catch {
            return field
          }
        }
        
        return field
      }

      let aiData = null
      if (paper.aiDataExtraction) {
        try {
          aiData = JSON.parse(paper.aiDataExtraction)
        } catch {
          aiData = null
        }
      }

      return {
        ...paper,
        authors: parseJsonField(paper.authors),
        anodeMaterials: parseJsonField(paper.anodeMaterials),
        cathodeMaterials: parseJsonField(paper.cathodeMaterials),
        organismTypes: parseJsonField(paper.organismTypes),
        keywords: parseJsonField(paper.keywords),
        aiData,
        hasPerformanceData: !!(paper.powerOutput || paper.efficiency || (paper.keywords && paper.keywords.includes('HAS_PERFORMANCE_DATA'))),
        isAiProcessed: !!paper.aiProcessingDate,
        processingMethod: paper.aiModelVersion || null,
        confidenceScore: paper.aiConfidence || null
      }
    })
    
    return NextResponse.json({
      papers: transformedPapers,
      count: transformedPapers.length
    })
  } catch (error) {
    console.error('Error in simple papers API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch papers', details: error },
      { status: 500 }
    )
  }
}