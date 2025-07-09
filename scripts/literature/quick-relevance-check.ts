#!/usr/bin/env npx tsx

import prisma from '../../lib/db'

async function quickCheck() {
  console.log('Quick relevance check...\n')

  // Sample non-microbial papers
  const nonMicrobialSample = await prisma.researchPaper.findMany({
    take: 20,
    where: {
      AND: [
        {
          OR: [
            { title: { contains: 'solar', mode: 'insensitive' } },
            { title: { contains: 'photovoltaic', mode: 'insensitive' } },
            { title: { contains: 'lithium', mode: 'insensitive' } },
            { title: { contains: 'battery', mode: 'insensitive' } },
            { title: { contains: 'fuel cell', mode: 'insensitive' } }
          ]
        },
        {
          NOT: {
            OR: [
              { title: { contains: 'microb', mode: 'insensitive' } },
              { title: { contains: 'bio', mode: 'insensitive' } },
              { abstract: { contains: 'microb', mode: 'insensitive' } },
              { abstract: { contains: 'bio', mode: 'insensitive' } }
            ]
          }
        }
      ]
    },
    select: {
      id: true,
      title: true,
      systemType: true,
      source: true
    }
  })

  console.log(`Found ${nonMicrobialSample.length} potentially non-microbial papers:\n`)
  
  nonMicrobialSample.forEach((paper, i) => {
    console.log(`${i + 1}. ${paper.title}`)
    console.log(`   System: ${paper.systemType || 'Not specified'}, Source: ${paper.source}`)
  })

  // Count papers by source
  const sourceCounts = await prisma.researchPaper.groupBy({
    by: ['source'],
    _count: true,
    orderBy: {
      _count: {
        source: 'desc'
      }
    }
  })

  console.log('\n\nPapers by source:')
  sourceCounts.forEach(({ source, _count }) => {
    console.log(`${source || 'null'}: ${_count}`)
  })

  // Count papers with biological keywords
  const bioCount = await prisma.researchPaper.count({
    where: {
      OR: [
        { title: { contains: 'microb', mode: 'insensitive' } },
        { title: { contains: 'bacteria', mode: 'insensitive' } },
        { title: { contains: 'algae', mode: 'insensitive' } },
        { abstract: { contains: 'microb', mode: 'insensitive' } },
        { abstract: { contains: 'bacteria', mode: 'insensitive' } },
        { abstract: { contains: 'bioelectrochemical', mode: 'insensitive' } }
      ]
    }
  })

  const total = await prisma.researchPaper.count()
  
  console.log(`\n\nTotal papers: ${total}`)
  console.log(`Papers with biological keywords: ${bioCount} (${(bioCount/total*100).toFixed(1)}%)`)
  console.log(`Papers without biological keywords: ${total - bioCount} (${((total-bioCount)/total*100).toFixed(1)}%)`)

  await prisma.$disconnect()
}

quickCheck().catch(console.error)