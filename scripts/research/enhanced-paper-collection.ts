#!/usr/bin/env npx tsx

import prisma from '../../lib/db'

interface PaperSearchConfig {
  query: string
  source: string
  category: string
  minYear?: number
  maxResults?: number
}

// Enhanced search queries targeting high-quality, recent research
const ENHANCED_SEARCHES: PaperSearchConfig[] = [
  // MXene Materials (cutting-edge 2D materials)
  {
    query: 'MXene AND (microbial fuel cell OR bioelectrochemical OR electrode)',
    source: 'crossref_api',
    category: 'MXENE_ELECTRODES',
    minYear: 2020,
    maxResults: 50
  },
  {
    query: 'Ti3C2 AND (bioelectrochemical OR microbial electrode)',
    source: 'crossref_api',
    category: 'MXENE_TI3C2',
    minYear: 2021,
    maxResults: 30
  },
  
  // Graphene and Carbon Nanomaterials
  {
    query: 'graphene oxide AND microbial fuel cell AND performance',
    source: 'crossref_api',
    category: 'GRAPHENE_MFC',
    minYear: 2020,
    maxResults: 60
  },
  {
    query: 'carbon nanotube AND bioelectrochemical AND electrode modification',
    source: 'crossref_api',
    category: 'CNT_ELECTRODES',
    minYear: 2019,
    maxResults: 50
  },
  {
    query: 'reduced graphene oxide AND microbial electrolysis cell',
    source: 'crossref_api',
    category: 'RGO_MEC',
    minYear: 2020,
    maxResults: 40
  },
  
  // High-Performance Systems
  {
    query: 'microbial fuel cell AND power density AND (mW/m2 OR milliwatt)',
    source: 'crossref_api',
    category: 'HIGH_POWER_MFC',
    minYear: 2019,
    maxResults: 70
  },
  {
    query: 'bioelectrochemical system AND current density AND performance optimization',
    source: 'crossref_api',
    category: 'PERFORMANCE_OPTIMIZATION',
    minYear: 2020,
    maxResults: 50
  },
  
  // Wastewater Treatment Applications
  {
    query: 'microbial fuel cell AND wastewater treatment AND energy recovery',
    source: 'crossref_api',
    category: 'WASTEWATER_ENERGY',
    minYear: 2020,
    maxResults: 60
  },
  {
    query: 'bioelectrochemical system AND water treatment AND sustainability',
    source: 'crossref_api',
    category: 'SUSTAINABLE_TREATMENT',
    minYear: 2021,
    maxResults: 40
  },
  
  // Microbial Communities and Electroactive Bacteria
  {
    query: 'electroactive bacteria AND biofilm AND electrode surface',
    source: 'crossref_api',
    category: 'ELECTROACTIVE_BIOFILM',
    minYear: 2020,
    maxResults: 50
  },
  {
    query: 'Geobacter AND Shewanella AND microbial fuel cell',
    source: 'crossref_api',
    category: 'MODEL_ORGANISMS',
    minYear: 2019,
    maxResults: 40
  },
  {
    query: 'microbial community AND bioelectrochemical AND diversity',
    source: 'crossref_api',
    category: 'MICROBIAL_DIVERSITY',
    minYear: 2020,
    maxResults: 35
  },
  
  // Advanced Materials and Modifications
  {
    query: 'electrode modification AND bioelectrochemical AND conductivity',
    source: 'crossref_api',
    category: 'ELECTRODE_MODIFICATION',
    minYear: 2020,
    maxResults: 45
  },
  {
    query: 'metal oxide AND microbial fuel cell AND cathode',
    source: 'crossref_api',
    category: 'METAL_OXIDE_CATHODE',
    minYear: 2019,
    maxResults: 40
  },
  {
    query: 'conductive polymer AND bioelectrochemical AND PEDOT',
    source: 'crossref_api',
    category: 'CONDUCTIVE_POLYMERS',
    minYear: 2020,
    maxResults: 30
  },
  
  // Process Optimization and Modeling
  {
    query: 'microbial fuel cell AND optimization AND machine learning',
    source: 'crossref_api',
    category: 'AI_OPTIMIZATION',
    minYear: 2021,
    maxResults: 25
  },
  {
    query: 'bioelectrochemical AND modeling AND kinetics',
    source: 'crossref_api',
    category: 'KINETIC_MODELING',
    minYear: 2020,
    maxResults: 35
  },
  
  // PubMed Searches (Biological Focus)
  {
    query: 'microbial fuel cell AND electron transfer AND metabolism',
    source: 'pubmed_api',
    category: 'ELECTRON_TRANSFER',
    minYear: 2020,
    maxResults: 40
  },
  {
    query: 'bioelectrochemical AND microbiome AND electrode',
    source: 'pubmed_api',
    category: 'MICROBIOME_ELECTRODE',
    minYear: 2021,
    maxResults: 30
  },
  
  // arXiv Searches (Cutting-edge Research)
  {
    query: 'bioelectrochemical AND machine learning AND optimization',
    source: 'arxiv_api',
    category: 'ML_BIOELECTROCHEMICAL',
    minYear: 2022,
    maxResults: 15
  },
  {
    query: 'microbial fuel cell AND artificial intelligence',
    source: 'arxiv_api',
    category: 'AI_MFC',
    minYear: 2021,
    maxResults: 10
  }
]

async function collectEnhancedPapers() {
  console.log('🚀 Starting Enhanced Paper Collection...')
  console.log(`📋 Configured searches: ${ENHANCED_SEARCHES.length}`)
  console.log(`🎯 Target: ~${ENHANCED_SEARCHES.reduce((sum, search) => sum + (search.maxResults || 0), 0)} new papers\\n`)
  
  try {
    let totalAttempted = 0
    let totalSuccessful = 0
    let totalSkipped = 0
    
    for (const searchConfig of ENHANCED_SEARCHES) {
      console.log(`🔍 Searching: ${searchConfig.category}`)
      console.log(`   Query: "${searchConfig.query}"`)
      console.log(`   Source: ${searchConfig.source}`)
      console.log(`   Min Year: ${searchConfig.minYear || 'Any'}`)
      console.log(`   Max Results: ${searchConfig.maxResults || 'Default'}\\n`)
      
      // This would integrate with your existing paper fetching scripts
      // For now, let's simulate the process and create placeholder logic
      
      // TODO: Integrate with existing CrossRef/PubMed/arXiv APIs
      console.log(`   ⏳ Would fetch papers from ${searchConfig.source}...`)
      console.log(`   ✅ Placeholder: ${searchConfig.maxResults || 0} papers targeted\\n`)
      
      totalAttempted += searchConfig.maxResults || 0
    }
    
    console.log('📊 Collection Summary:')
    console.log(`   • Searches executed: ${ENHANCED_SEARCHES.length}`)
    console.log(`   • Papers targeted: ${totalAttempted}`)
    console.log(`   • Categories covered: ${new Set(ENHANCED_SEARCHES.map(s => s.category)).size}`)
    console.log('\\n🎯 Next Steps:')
    console.log('   1. Implement API integration for each search')
    console.log('   2. Run data extraction on new papers')
    console.log('   3. Validate quality and relevance')
    console.log('   4. Update remote database')
    
  } catch (error) {
    console.error('❌ Collection failed:', error)
    throw error
  }
}

async function getCollectionTargets() {
  console.log('📊 Enhanced Collection Targets:\\n')
  
  const categories = ENHANCED_SEARCHES.reduce((acc, search) => {
    const category = search.category.split('_')[0]
    acc[category] = (acc[category] || 0) + (search.maxResults || 0)
    return acc
  }, {} as Record<string, number>)
  
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} papers`)
  })
  
  console.log(`\\n🎯 Total Target: ${Object.values(categories).reduce((sum, count) => sum + count, 0)} papers`)
  console.log('💡 This would significantly expand the literature database with high-quality, recent research.')
}

if (require.main === module) {
  const command = process.argv[2]
  
  if (command === '--targets') {
    getCollectionTargets()
  } else {
    collectEnhancedPapers()
  }
}