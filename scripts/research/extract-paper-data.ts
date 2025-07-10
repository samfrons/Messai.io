import fs from 'fs/promises'
import path from 'path'
import pdf from 'pdf-parse'

interface ExtractedPaperData {
  title?: string
  authors?: string[]
  abstract?: string
  doi?: string
  publicationDate?: string
  journal?: string
  keywords?: string[]
  
  // MES-specific performance data
  systemType?: string
  powerOutput?: number
  powerDensity?: number
  currentDensity?: number
  efficiency?: number
  coulombicEfficiency?: number
  voltage?: number
  internalResistance?: number
  
  // Materials
  anodeMaterial?: string[]
  cathodeMaterial?: string[]
  separator?: string
  
  // Organisms
  organisms?: string[]
  
  // Operating conditions
  temperature?: number
  ph?: number
  substrate?: string
  
  // Raw extracted text for manual review
  extractedText?: string
}

// Patterns for extracting specific data
const patterns = {
  // Performance metrics
  powerOutput: /power\s+output[:\s]+(\d+\.?\d*)\s*(mW\/m²|W\/m²|mW\/m2|W\/m2)/gi,
  powerDensity: /power\s+density[:\s]+(\d+\.?\d*)\s*(mW\/m²|W\/m²|mW\/m2|W\/m2)/gi,
  currentDensity: /current\s+density[:\s]+(\d+\.?\d*)\s*(mA\/m²|A\/m²|mA\/m2|A\/m2)/gi,
  voltage: /(?:open\s+circuit\s+)?voltage[:\s]+(\d+\.?\d*)\s*(mV|V)/gi,
  efficiency: /(?:coulombic\s+)?efficiency[:\s]+(\d+\.?\d*)\s*%/gi,
  internalResistance: /internal\s+resistance[:\s]+(\d+\.?\d*)\s*(Ω|ohm)/gi,
  
  // System types
  systemType: /(MFC|MEC|MDC|MES|microbial fuel cell|microbial electrolysis cell|microbial desalination cell)/gi,
  
  // Materials
  anodeMaterial: /anode[:\s]+(?:material[:\s]+)?([^,\n]+(?:,\s*[^,\n]+)*)/gi,
  cathodeMaterial: /cathode[:\s]+(?:material[:\s]+)?([^,\n]+(?:,\s*[^,\n]+)*)/gi,
  
  // Operating conditions
  temperature: /temperature[:\s]+(\d+\.?\d*)\s*°?C/gi,
  ph: /pH[:\s]+(\d+\.?\d*)/gi,
  
  // Metadata
  doi: /(?:DOI|doi)[:\s]+([^\s\n]+)/i,
  title: /^([^\n]{10,200})$/m, // First long line is often the title
}

async function extractDataFromPDF(filePath: string): Promise<ExtractedPaperData> {
  try {
    const dataBuffer = await fs.readFile(filePath)
    const data = await pdf(dataBuffer)
    const text = data.text
    
    const extracted: ExtractedPaperData = {
      extractedText: text.substring(0, 5000) // Store first 5000 chars for review
    }
    
    // Extract DOI
    const doiMatch = patterns.doi.exec(text)
    if (doiMatch) {
      extracted.doi = doiMatch[1].trim()
    }
    
    // Extract title (usually in the first few lines)
    const lines = text.split('\n').filter(line => line.trim().length > 10)
    if (lines.length > 0) {
      extracted.title = lines[0].trim()
    }
    
    // Extract system type
    const systemMatches = text.match(patterns.systemType)
    if (systemMatches) {
      const systemType = systemMatches[0].toUpperCase()
      if (systemType.includes('FUEL')) extracted.systemType = 'MFC'
      else if (systemType.includes('ELECTROLYSIS')) extracted.systemType = 'MEC'
      else if (systemType.includes('DESALINATION')) extracted.systemType = 'MDC'
      else if (systemType.includes('MES')) extracted.systemType = 'MES'
      else extracted.systemType = systemType
    }
    
    // Extract performance metrics
    const powerOutputMatch = patterns.powerOutput.exec(text)
    if (powerOutputMatch) {
      let value = parseFloat(powerOutputMatch[1])
      // Convert W/m² to mW/m²
      if (powerOutputMatch[2].toLowerCase().includes('w/m')) {
        value *= 1000
      }
      extracted.powerOutput = value
    }
    
    const powerDensityMatch = patterns.powerDensity.exec(text)
    if (powerDensityMatch) {
      let value = parseFloat(powerDensityMatch[1])
      if (powerDensityMatch[2].toLowerCase().includes('w/m')) {
        value *= 1000
      }
      extracted.powerDensity = value
    }
    
    const currentDensityMatch = patterns.currentDensity.exec(text)
    if (currentDensityMatch) {
      let value = parseFloat(currentDensityMatch[1])
      // Convert A/m² to mA/m²
      if (currentDensityMatch[2].toLowerCase().includes('a/m')) {
        value *= 1000
      }
      extracted.currentDensity = value
    }
    
    const voltageMatch = patterns.voltage.exec(text)
    if (voltageMatch) {
      let value = parseFloat(voltageMatch[1])
      // Convert V to mV
      if (voltageMatch[2].toLowerCase() === 'v') {
        value *= 1000
      }
      extracted.voltage = value
    }
    
    const efficiencyMatch = patterns.efficiency.exec(text)
    if (efficiencyMatch) {
      extracted.efficiency = parseFloat(efficiencyMatch[1])
    }
    
    const resistanceMatch = patterns.internalResistance.exec(text)
    if (resistanceMatch) {
      extracted.internalResistance = parseFloat(resistanceMatch[1])
    }
    
    // Extract materials
    const anodeMatch = patterns.anodeMaterial.exec(text)
    if (anodeMatch) {
      extracted.anodeMaterial = anodeMatch[1].split(',').map(m => m.trim())
    }
    
    const cathodeMatch = patterns.cathodeMaterial.exec(text)
    if (cathodeMatch) {
      extracted.cathodeMaterial = cathodeMatch[1].split(',').map(m => m.trim())
    }
    
    // Extract operating conditions
    const tempMatch = patterns.temperature.exec(text)
    if (tempMatch) {
      extracted.temperature = parseFloat(tempMatch[1])
    }
    
    const phMatch = patterns.ph.exec(text)
    if (phMatch) {
      extracted.ph = parseFloat(phMatch[1])
    }
    
    // Look for common organism names
    const organismPatterns = [
      'Shewanella', 'Geobacter', 'E. coli', 'Escherichia coli',
      'Pseudomonas', 'Clostridium', 'Desulfovibrio', 'mixed culture',
      'activated sludge', 'wastewater'
    ]
    
    const foundOrganisms = organismPatterns.filter(org => 
      text.toLowerCase().includes(org.toLowerCase())
    )
    
    if (foundOrganisms.length > 0) {
      extracted.organisms = foundOrganisms
    }
    
    return extracted
  } catch (error) {
    console.error(`Error processing PDF ${filePath}:`, error)
    return { extractedText: `Error: ${error.message}` }
  }
}

async function processLiteratureDirectory(dirPath: string) {
  try {
    const files = await fs.readdir(dirPath)
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'))
    
    console.log(`Found ${pdfFiles.length} PDF files to process`)
    
    const results = []
    
    for (const file of pdfFiles) {
      console.log(`\nProcessing: ${file}`)
      const filePath = path.join(dirPath, file)
      const data = await extractDataFromPDF(filePath)
      
      results.push({
        filename: file,
        filePath,
        ...data
      })
      
      // Log extracted performance data
      if (data.powerOutput || data.voltage || data.efficiency) {
        console.log('Performance data found:')
        if (data.powerOutput) console.log(`  Power Output: ${data.powerOutput} mW/m²`)
        if (data.powerDensity) console.log(`  Power Density: ${data.powerDensity} mW/m²`)
        if (data.currentDensity) console.log(`  Current Density: ${data.currentDensity} mA/m²`)
        if (data.voltage) console.log(`  Voltage: ${data.voltage} mV`)
        if (data.efficiency) console.log(`  Efficiency: ${data.efficiency}%`)
        if (data.systemType) console.log(`  System Type: ${data.systemType}`)
      }
    }
    
    // Save results to JSON file
    const outputPath = path.join(dirPath, 'extracted-paper-data.json')
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2))
    console.log(`\nResults saved to: ${outputPath}`)
    
    return results
  } catch (error) {
    console.error('Error processing directory:', error)
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const literatureDir = args[0] || './literature'
  
  console.log(`Processing literature directory: ${literatureDir}`)
  await processLiteratureDirectory(literatureDir)
}

// Run if called directly
if (require.main === module) {
  main()
}

export { extractDataFromPDF, processLiteratureDirectory }