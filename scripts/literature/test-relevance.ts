#!/usr/bin/env npx tsx

import prisma from '../../lib/db'
import { calculateRelevanceScore } from './microbial-relevance-validator'

async function testRelevance() {
  console.log('Testing relevance scoring...\n')

  // Test cases
  const testCases = [
    {
      title: "High-performance microbial fuel cells using Geobacter biofilms",
      abstract: "This study investigates bioelectrochemical systems with electroactive bacteria for sustainable energy generation.",
      expected: "keep"
    },
    {
      title: "Solar photovoltaic cell efficiency improvements",
      abstract: "A study on silicon-based solar panels and their quantum efficiency under various light conditions.",
      expected: "remove"
    },
    {
      title: "Algae-based microbial fuel cells for wastewater treatment",
      abstract: "Integration of Chlorella vulgaris in photosynthetic MFCs for simultaneous energy generation and nutrient removal.",
      expected: "keep"
    },
    {
      title: "Hydrogen production via water electrolysis",
      abstract: "Pure chemical electrolysis of water using platinum electrodes for hydrogen gas generation.",
      expected: "remove"
    },
    {
      title: "Bioelectrochemical hydrogen production in microbial electrolysis cells",
      abstract: "Using mixed bacterial consortia to produce hydrogen through bioelectrochemical processes in MECs.",
      expected: "keep"
    }
  ]

  for (const test of testCases) {
    const score = calculateRelevanceScore(test.title, test.abstract, null, null, null)
    console.log(`Title: ${test.title}`)
    console.log(`Score: ${score.overall}/100`)
    console.log(`Recommendation: ${score.recommendation} (expected: ${test.expected})`)
    console.log(`Categories: Microbial=${score.categories.isMicrobial}, Algae=${score.categories.isAlgae}`)
    console.log(`Matched keywords: ${score.matchedKeywords.join(', ')}`)
    console.log('---\n')
  }

  // Sample real papers from database
  console.log('\nSampling papers from database...')
  const papers = await prisma.researchPaper.findMany({
    take: 10,
    where: {
      OR: [
        { title: { contains: 'solar', mode: 'insensitive' } },
        { title: { contains: 'hydrogen', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      title: true,
      abstract: true,
      systemType: true
    }
  })

  console.log(`\nFound ${papers.length} papers with 'solar' or 'hydrogen' in title:\n`)

  for (const paper of papers) {
    const score = calculateRelevanceScore(
      paper.title,
      paper.abstract,
      null,
      null,
      paper.systemType
    )
    
    console.log(`Title: ${paper.title}`)
    console.log(`Score: ${score.overall}/100`)
    console.log(`Recommendation: ${score.recommendation}`)
    console.log(`Microbial: ${score.categories.isMicrobial}, Algae: ${score.categories.isAlgae}`)
    console.log('---\n')
  }

  await prisma.$disconnect()
}

testRelevance().catch(console.error)