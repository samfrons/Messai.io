import { execSync } from 'child_process'
import { existsSync } from 'fs'

const databasePath = '/Users/samfrons/Desktop/Messai/prisma/dev.db'

async function checkPaperData() {
  try {
    console.log(`\n🔍 Checking database at: ${databasePath}\n`)

    if (!existsSync(databasePath)) {
      console.error('Database file not found!')
      return
    }

    // Use SQLite directly to avoid Prisma schema mismatch issues
    
    // Get total count of papers
    const totalPapers = execSync(`sqlite3 "${databasePath}" "SELECT COUNT(*) FROM ResearchPaper;"`, { encoding: 'utf-8' }).trim()
    console.log(`📊 Total papers in database: ${totalPapers}`)

    if (parseInt(totalPapers) === 0) {
      console.log('\n❌ No papers found in the database!')
      return
    }

    // Count papers with abstracts
    const papersWithAbstracts = execSync(`sqlite3 "${databasePath}" "SELECT COUNT(*) FROM ResearchPaper WHERE abstract IS NOT NULL;"`, { encoding: 'utf-8' }).trim()
    const abstractPercent = ((parseInt(papersWithAbstracts)/parseInt(totalPapers))*100).toFixed(1)
    console.log(`\n📝 Papers with abstracts: ${papersWithAbstracts} (${abstractPercent}%)`)

    // Count papers with performance data
    const papersWithPowerOutput = execSync(`sqlite3 "${databasePath}" "SELECT COUNT(*) FROM ResearchPaper WHERE powerOutput IS NOT NULL;"`, { encoding: 'utf-8' }).trim()
    const powerPercent = ((parseInt(papersWithPowerOutput)/parseInt(totalPapers))*100).toFixed(1)
    console.log(`\n⚡ Papers with power output data: ${papersWithPowerOutput} (${powerPercent}%)`)

    const papersWithEfficiency = execSync(`sqlite3 "${databasePath}" "SELECT COUNT(*) FROM ResearchPaper WHERE efficiency IS NOT NULL;"`, { encoding: 'utf-8' }).trim()
    const efficiencyPercent = ((parseInt(papersWithEfficiency)/parseInt(totalPapers))*100).toFixed(1)
    console.log(`📈 Papers with efficiency data: ${papersWithEfficiency} (${efficiencyPercent}%)`)

    // Count papers with materials data
    const papersWithAnodeMaterials = execSync(`sqlite3 "${databasePath}" "SELECT COUNT(*) FROM ResearchPaper WHERE anodeMaterials IS NOT NULL;"`, { encoding: 'utf-8' }).trim()
    const anodePercent = ((parseInt(papersWithAnodeMaterials)/parseInt(totalPapers))*100).toFixed(1)
    console.log(`\n🔩 Papers with anode materials: ${papersWithAnodeMaterials} (${anodePercent}%)`)

    const papersWithCathodeMaterials = execSync(`sqlite3 "${databasePath}" "SELECT COUNT(*) FROM ResearchPaper WHERE cathodeMaterials IS NOT NULL;"`, { encoding: 'utf-8' }).trim()
    const cathodePercent = ((parseInt(papersWithCathodeMaterials)/parseInt(totalPapers))*100).toFixed(1)
    console.log(`🔩 Papers with cathode materials: ${papersWithCathodeMaterials} (${cathodePercent}%)`)

    // Count papers with AI-generated fields
    const papersWithAISummary = execSync(`sqlite3 "${databasePath}" "SELECT COUNT(*) FROM ResearchPaper WHERE aiSummary IS NOT NULL;"`, { encoding: 'utf-8' }).trim()
    const aiSummaryPercent = ((parseInt(papersWithAISummary)/parseInt(totalPapers))*100).toFixed(1)
    console.log(`\n🤖 Papers with AI summary: ${papersWithAISummary} (${aiSummaryPercent}%)`)

    const papersWithAIKeyFindings = execSync(`sqlite3 "${databasePath}" "SELECT COUNT(*) FROM ResearchPaper WHERE aiKeyFindings IS NOT NULL;"`, { encoding: 'utf-8' }).trim()
    const aiKeyPercent = ((parseInt(papersWithAIKeyFindings)/parseInt(totalPapers))*100).toFixed(1)
    console.log(`🔍 Papers with AI key findings: ${papersWithAIKeyFindings} (${aiKeyPercent}%)`)

    const papersWithAIDataExtraction = execSync(`sqlite3 "${databasePath}" "SELECT COUNT(*) FROM ResearchPaper WHERE aiDataExtraction IS NOT NULL;"`, { encoding: 'utf-8' }).trim()
    const aiDataPercent = ((parseInt(papersWithAIDataExtraction)/parseInt(totalPapers))*100).toFixed(1)
    console.log(`📊 Papers with AI data extraction: ${papersWithAIDataExtraction} (${aiDataPercent}%)`)

    // Sample a few papers to see what data is populated
    console.log(`\n\n🔎 Sampling 5 papers to inspect data fields:\n`)
    
    const sampleQuery = `
      SELECT 
        id, title, doi, abstract, systemType, powerOutput, efficiency,
        anodeMaterials, cathodeMaterials, aiSummary, aiKeyFindings, 
        aiDataExtraction, source
      FROM ResearchPaper 
      ORDER BY createdAt DESC 
      LIMIT 5;
    `
    
    const samples = execSync(`sqlite3 -header -column "${databasePath}" "${sampleQuery}"`, { encoding: 'utf-8' })
    console.log(samples)

    // Check distribution by source
    console.log(`\n\n📚 Papers by source:`)
    const sourceQuery = `SELECT source, COUNT(*) as count FROM ResearchPaper GROUP BY source ORDER BY count DESC;`
    const sources = execSync(`sqlite3 -header -column "${databasePath}" "${sourceQuery}"`, { encoding: 'utf-8' })
    console.log(sources)

    // Check distribution by system type
    console.log(`\n\n🔬 Papers by system type:`)
    const systemQuery = `SELECT systemType, COUNT(*) as count FROM ResearchPaper WHERE systemType IS NOT NULL GROUP BY systemType ORDER BY count DESC;`
    const systems = execSync(`sqlite3 -header -column "${databasePath}" "${systemQuery}"`, { encoding: 'utf-8' })
    console.log(systems)

    // Get some specific examples with performance data
    console.log(`\n\n⚡ Papers with performance data (first 3):`)
    const perfQuery = `
      SELECT title, powerOutput, efficiency, systemType 
      FROM ResearchPaper 
      WHERE powerOutput IS NOT NULL OR efficiency IS NOT NULL 
      LIMIT 3;
    `
    const perfData = execSync(`sqlite3 -header -column "${databasePath}" "${perfQuery}"`, { encoding: 'utf-8' })
    console.log(perfData)

  } catch (error) {
    console.error('Error checking paper data:', error)
  }
}

checkPaperData()