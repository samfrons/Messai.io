#!/usr/bin/env npx tsx

import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testEnhancedAPI() {
  const baseUrl = 'http://localhost:3003'
  
  console.log('🧪 Testing Enhanced Literature API')
  console.log('================================')
  
  try {
    // Test filters endpoint
    console.log('\n📊 Testing /api/papers/filters...')
    const filtersResponse = await fetch(`${baseUrl}/api/papers/filters`)
    
    if (filtersResponse.ok) {
      const filtersData = await filtersResponse.json()
      console.log('✅ Filters endpoint working!')
      console.log(`   - Available microbes: ${filtersData.microbes?.length || 0}`)
      console.log(`   - System types: ${filtersData.systemTypes?.length || 0}`)
      console.log(`   - Total papers: ${filtersData.stats?.totalPapers || 0}`)
      console.log(`   - With microbe data: ${filtersData.stats?.withMicrobeData || 0}`)
    } else {
      console.log(`❌ Filters endpoint error: ${filtersResponse.status}`)
    }
    
    // Test enhanced papers endpoint
    console.log('\n📄 Testing /api/papers with filters...')
    const papersResponse = await fetch(`${baseUrl}/api/papers?limit=5&realOnly=true`)
    
    if (papersResponse.ok) {
      const papersData = await papersResponse.json()
      console.log('✅ Papers endpoint working!')
      console.log(`   - Papers returned: ${papersData.papers?.length || 0}`)
      console.log(`   - Total papers: ${papersData.pagination?.total || 0}`)
      
      if (papersData.papers?.length > 0) {
        const paper = papersData.papers[0]
        console.log(`   - Sample paper: "${paper.title?.substring(0, 50)}..."`)
        console.log(`   - Has performance data: ${paper.hasPerformanceData}`)
        console.log(`   - Is AI processed: ${paper.isAiProcessed}`)
        console.log(`   - System config: ${paper.systemConfiguration ? 'Yes' : 'No'}`)
        console.log(`   - Microbial community: ${paper.microbialCommunity ? 'Yes' : 'No'}`)
      }
    } else {
      console.log(`❌ Papers endpoint error: ${papersResponse.status}`)
    }
    
    // Test advanced filtering
    console.log('\n🔍 Testing advanced filtering...')
    const filteredResponse = await fetch(`${baseUrl}/api/papers?systemTypes=MFC&minPower=100&sortBy=power&limit=3`)
    
    if (filteredResponse.ok) {
      const filteredData = await filteredResponse.json()
      console.log('✅ Advanced filtering working!')
      console.log(`   - Filtered papers: ${filteredData.papers?.length || 0}`)
      console.log(`   - Total matching: ${filteredData.pagination?.total || 0}`)
    } else {
      console.log(`❌ Advanced filtering error: ${filteredResponse.status}`)
    }
    
    console.log('\n🎉 Enhanced API integration test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Check if this is called directly
if (require.main === module) {
  testEnhancedAPI()
}

export default testEnhancedAPI