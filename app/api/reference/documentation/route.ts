import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getDemoConfig } from '@/lib/demo-mode'

// Get documentation content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const parameter = searchParams.get('parameter')
    const material = searchParams.get('material')
    const guide = searchParams.get('guide')
    const format = searchParams.get('format') || 'json'

    const demoConfig = getDemoConfig()
    const basePath = join(process.cwd(), 'reference')

    // Documentation index
    if (!category && !parameter && !material && !guide) {
      return NextResponse.json({
        documentation: {
          parameters: {
            electrical: ['power-density', 'current-density', 'voltage', 'coulombic-efficiency', 'resistance'],
            biological: ['microbial-communities', 'biofilm-properties', 'substrate-utilization', 'electron-transfer', 'growth-kinetics'],
            materials: {
              anodes: ['carbon-cloth-anode', 'mxene-anode'],
              cathodes: ['platinum-cathode', 'air-cathode'],
              membranes: ['proton-exchange']
            }
          },
          guides: ['electrode-optimization', 'system-configuration'],
          formats: ['json', 'markdown', 'html']
        },
        ...(demoConfig.isDemo && {
          demo_mode: true,
          note: 'Educational documentation based on scientific literature'
        }),
        timestamp: new Date().toISOString()
      })
    }

    // Parameter documentation
    if (category && parameter) {
      const filePath = join(basePath, 'parameters', category, `${parameter}.md`)
      
      if (!existsSync(filePath)) {
        return NextResponse.json(
          { error: `Documentation not found: ${category}/${parameter}` },
          { status: 404 }
        )
      }

      const content = readFileSync(filePath, 'utf-8')
      
      if (format === 'markdown') {
        return new Response(content, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `inline; filename="${parameter}.md"`
          }
        })
      }

      return NextResponse.json({
        category,
        parameter,
        content,
        format: 'markdown',
        timestamp: new Date().toISOString()
      })
    }

    // Material documentation
    if (material) {
      const materialParts = material.split('-')
      let filePath = ''
      
      if (materialParts.includes('anode')) {
        filePath = join(basePath, 'parameters', 'materials', 'anodes', `${material}.md`)
      } else if (materialParts.includes('cathode')) {
        filePath = join(basePath, 'parameters', 'materials', 'cathodes', `${material}.md`)
      } else if (material.includes('membrane') || material.includes('exchange')) {
        filePath = join(basePath, 'parameters', 'materials', 'membranes', `${material}.md`)
      }

      if (!existsSync(filePath)) {
        return NextResponse.json(
          { error: `Material documentation not found: ${material}` },
          { status: 404 }
        )
      }

      const content = readFileSync(filePath, 'utf-8')
      
      if (format === 'markdown') {
        return new Response(content, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `inline; filename="${material}.md"`
          }
        })
      }

      return NextResponse.json({
        material,
        content,
        format: 'markdown',
        timestamp: new Date().toISOString()
      })
    }

    // Design guides
    if (guide) {
      const filePath = join(basePath, 'design-guides', `${guide}.md`)
      
      if (!existsSync(filePath)) {
        return NextResponse.json(
          { error: `Guide not found: ${guide}` },
          { status: 404 }
        )
      }

      const content = readFileSync(filePath, 'utf-8')
      
      if (format === 'markdown') {
        return new Response(content, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `inline; filename="${guide}.md"`
          }
        })
      }

      return NextResponse.json({
        guide,
        content,
        format: 'markdown',
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: 'Invalid documentation request' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Documentation API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve documentation' },
      { status: 500 }
    )
  }
}

// Search documentation content
export async function POST(request: NextRequest) {
  try {
    const demoConfig = getDemoConfig()
    const body = await request.json()
    const { query, categories = [], limit = 10 } = body

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const basePath = join(process.cwd(), 'reference')
    const results = []

    // Search in parameter documentation
    const searchCategories = categories.length > 0 ? categories : ['electrical', 'biological', 'materials']
    
    for (const category of searchCategories) {
      if (category === 'materials') {
        // Search material subcategories
        const subcategories = ['anodes', 'cathodes', 'membranes']
        for (const subcat of subcategories) {
          const subcatResults = await searchInDirectory(
            join(basePath, 'parameters', 'materials', subcat),
            query,
            `materials/${subcat}`
          )
          results.push(...subcatResults)
        }
      } else {
        const categoryResults = await searchInDirectory(
          join(basePath, 'parameters', category),
          query,
          category
        )
        results.push(...categoryResults)
      }
    }

    // Search in design guides
    if (categories.length === 0 || categories.includes('guides')) {
      const guideResults = await searchInDirectory(
        join(basePath, 'design-guides'),
        query,
        'guides'
      )
      results.push(...guideResults)
    }

    // Sort by relevance and limit results
    results.sort((a, b) => b.relevance - a.relevance)
    const limitedResults = results.slice(0, limit)

    return NextResponse.json({
      query,
      results: limitedResults,
      total_found: results.length,
      categories_searched: searchCategories,
      ...(demoConfig.isDemo && {
        demo_mode: true,
        note: 'Search results from educational documentation'
      }),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Documentation search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

// Helper function to search in directory
async function searchInDirectory(dirPath: string, query: string, category: string) {
  const results = []
  
  if (!existsSync(dirPath)) {
    return results
  }

  try {
    const fs = require('fs')
    const files = fs.readdirSync(dirPath).filter((file: string) => file.endsWith('.md'))

    for (const file of files) {
      const filePath = join(dirPath, file)
      const content = readFileSync(filePath, 'utf-8')
      
      const queryLower = query.toLowerCase()
      const contentLower = content.toLowerCase()
      
      // Simple relevance scoring
      let relevance = 0
      const titleMatch = file.toLowerCase().includes(queryLower)
      const contentMatches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length
      
      if (titleMatch) relevance += 10
      relevance += contentMatches

      if (relevance > 0) {
        // Extract context around matches
        const context = extractContext(content, query, 150)
        
        results.push({
          file: file.replace('.md', ''),
          category,
          relevance,
          title: extractTitle(content),
          context,
          matches: contentMatches + (titleMatch ? 1 : 0)
        })
      }
    }
  } catch (error) {
    console.error(`Error searching directory ${dirPath}:`, error)
  }

  return results
}

// Extract title from markdown content
function extractTitle(content: string): string {
  const lines = content.split('\n')
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.substring(2).trim()
    }
  }
  return 'Untitled'
}

// Extract context around search query
function extractContext(content: string, query: string, maxLength: number): string {
  const queryLower = query.toLowerCase()
  const contentLower = content.toLowerCase()
  const index = contentLower.indexOf(queryLower)
  
  if (index === -1) return ''
  
  const start = Math.max(0, index - maxLength / 2)
  const end = Math.min(content.length, index + query.length + maxLength / 2)
  
  let context = content.substring(start, end)
  
  // Clean up context
  context = context.replace(/\n+/g, ' ').trim()
  
  // Add ellipsis if truncated
  if (start > 0) context = '...' + context
  if (end < content.length) context = context + '...'
  
  return context
}