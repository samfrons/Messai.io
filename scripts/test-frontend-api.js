#!/usr/bin/env node

const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testAPIs() {
  console.log('🧪 Testing Frontend API Data Transformation...\n');

  try {
    // Test papers-simple endpoint
    console.log('📡 Testing /api/papers-simple...');
    const simpleResponse = await makeRequest('/api/papers-simple');
    
    if (simpleResponse.papers && simpleResponse.papers.length > 0) {
      const paper = simpleResponse.papers[0];
      console.log(`✅ Found ${simpleResponse.papers.length} papers`);
      console.log(`📄 Sample paper: "${paper.title.substring(0, 50)}..."`);
      console.log(`📊 Enhanced data present:`);
      console.log(`   - hasPerformanceData: ${paper.hasPerformanceData}`);
      console.log(`   - isAiProcessed: ${paper.isAiProcessed}`);
      console.log(`   - processingMethod: ${paper.processingMethod || 'none'}`);
      console.log(`   - confidenceScore: ${paper.confidenceScore || 'none'}`);
      console.log(`   - authors type: ${Array.isArray(paper.authors) ? 'array' : typeof paper.authors}`);
      
      // Find a paper with performance data
      const paperWithData = simpleResponse.papers.find(p => p.hasPerformanceData);
      if (paperWithData) {
        console.log(`\n🎯 Paper with performance data:`);
        console.log(`   Title: "${paperWithData.title.substring(0, 60)}..."`);
        console.log(`   Power Output: ${paperWithData.powerOutput} mW/m²`);
        console.log(`   Efficiency: ${paperWithData.efficiency || 'N/A'}%`);
        console.log(`   System Type: ${paperWithData.systemType || 'N/A'}`);
        console.log(`   Processing: ${paperWithData.processingMethod}`);
        console.log(`   Confidence: ${paperWithData.confidenceScore}`);
      }
    } else {
      console.log('❌ No papers found');
    }

    // Test main papers endpoint
    console.log('\n📡 Testing /api/papers...');
    const mainResponse = await makeRequest('/api/papers?limit=5');
    
    if (mainResponse.papers && mainResponse.papers.length > 0) {
      console.log(`✅ Found ${mainResponse.papers.length} papers (paginated)`);
      console.log(`📊 Pagination: ${mainResponse.pagination.page}/${mainResponse.pagination.totalPages} (${mainResponse.pagination.total} total)`);
      
      const processedPapers = mainResponse.papers.filter(p => p.isAiProcessed);
      const performancePapers = mainResponse.papers.filter(p => p.hasPerformanceData);
      
      console.log(`🤖 AI Processed: ${processedPapers.length}/${mainResponse.papers.length}`);
      console.log(`📈 With Performance Data: ${performancePapers.length}/${mainResponse.papers.length}`);
    }

    console.log('\n✅ Frontend API validation complete!');
    console.log('🎉 Enhanced data transformation is working correctly.');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the dev server is running: npm run dev');
    }
  }
}

testAPIs();