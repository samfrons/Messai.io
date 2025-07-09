import { describe, it, expect, beforeEach } from 'vitest'
import { 
  validatePaperQuality, 
  extractPerformanceData,
  extractMaterials,
  extractOrganisms
} from '../../scripts/literature/paper-quality-validator'

describe('Paper Quality Validator', () => {
  describe('validatePaperQuality', () => {
    const basePaper = {
      id: 'test-1',
      title: 'Test Paper on Microbial Fuel Cells',
      authors: JSON.stringify(['John Doe', 'Jane Smith']),
      abstract: 'This paper investigates the performance of microbial fuel cells using carbon cloth anodes and platinum cathodes with Geobacter sulfurreducens.',
      journal: 'International Journal of Hydrogen Energy',
      publicationDate: new Date().toISOString(),
      keywords: JSON.stringify(['microbial fuel cell', 'bioelectrochemical', 'power density'])
    }

    it('should give high verification score for papers with DOI', async () => {
      const paper = { ...basePaper, doi: '10.1016/j.ijhydene.2024.01.001' }
      const result = await validatePaperQuality(paper)
      
      expect(result.breakdown.verification).toBe(20)
      expect(result.flags.isVerified).toBe(true)
    })

    it('should give moderate verification score for PubMed/arXiv IDs', async () => {
      const paper = { ...basePaper, pubmedId: '12345678' }
      const result = await validatePaperQuality(paper)
      
      expect(result.breakdown.verification).toBe(15)
      expect(result.flags.isVerified).toBe(true)
    })

    it('should calculate completeness based on required fields', async () => {
      const completePaper = { ...basePaper }
      const incompletePaper = { ...basePaper, abstract: null, journal: null }
      
      const completeResult = await validatePaperQuality(completePaper)
      const incompleteResult = await validatePaperQuality(incompletePaper)
      
      expect(completeResult.breakdown.completeness).toBe(15)
      expect(incompleteResult.breakdown.completeness).toBe(9) // 3/5 fields * 15
    })

    it('should score relevance based on core and related terms', async () => {
      const highlyRelevant = {
        ...basePaper,
        title: 'Microbial Fuel Cell with Bioelectrochemical System',
        abstract: 'Study of microbial electrolysis and bioelectricity generation using electroactive bacteria'
      }
      
      const result = await validatePaperQuality(highlyRelevant)
      expect(result.breakdown.relevance).toBeGreaterThan(10)
    })

    it('should detect performance data and set flags', async () => {
      const paperWithData = {
        ...basePaper,
        abstract: 'The MFC achieved a maximum power density of 1500 mW/m² and current density of 5 A/m²'
      }
      
      const result = await validatePaperQuality(paperWithData)
      expect(result.flags.hasPerformanceData).toBe(true)
      expect(result.breakdown.dataRichness).toBeGreaterThanOrEqual(10)
    })

    it('should detect materials and organisms', async () => {
      const result = await validatePaperQuality(basePaper)
      
      expect(result.flags.hasMaterialsData).toBe(true) // Has carbon cloth and platinum
      expect(result.flags.hasOrganismData).toBe(true) // Has Geobacter
    })

    it('should score recency appropriately', async () => {
      const newPaper = { ...basePaper, publicationDate: new Date().toISOString() }
      const oldPaper = { ...basePaper, publicationDate: new Date('2010-01-01').toISOString() }
      
      const newResult = await validatePaperQuality(newPaper)
      const oldResult = await validatePaperQuality(oldPaper)
      
      expect(newResult.breakdown.recency).toBe(10)
      expect(oldResult.breakdown.recency).toBe(2)
    })

    it('should identify high-impact journals', async () => {
      const highImpact = { ...basePaper, journal: 'Nature Energy' }
      const normalImpact = { ...basePaper, journal: 'Some Regular Journal' }
      
      const highResult = await validatePaperQuality(highImpact)
      const normalResult = await validatePaperQuality(normalImpact)
      
      expect(highResult.flags.isHighImpact).toBe(true)
      expect(highResult.breakdown.impact).toBe(10)
      expect(normalResult.flags.isHighImpact).toBe(false)
      expect(normalResult.breakdown.impact).toBe(5)
    })

    it('should flag papers needing enhancement', async () => {
      const poorPaper = {
        id: 'poor-1',
        title: 'Some Paper',
        authors: JSON.stringify(['Author']),
        keywords: JSON.stringify([])
      }
      
      const result = await validatePaperQuality(poorPaper)
      expect(result.overall).toBeLessThan(70)
      expect(result.flags.needsEnhancement).toBe(true)
      expect(result.recommendations.length).toBeGreaterThan(2)
    })
  })

  describe('extractPerformanceData', () => {
    it('should extract power density values with units', () => {
      const text = 'The MFC achieved 1500 mW/m² at steady state and peaked at 2000 mW/m².'
      const result = extractPerformanceData(text)
      
      expect(result.powerDensity).toEqual([1500, 2000])
    })

    it('should extract current density values', () => {
      const text = 'Current density reached 5.5 A/m² with a maximum of 8 mA/cm².'
      const result = extractPerformanceData(text)
      
      expect(result.currentDensity).toBeDefined()
      expect(result.currentDensity).toContain(5.5)
      expect(result.currentDensity).toContain(8)
    })

    it('should extract efficiency percentages', () => {
      const text = 'The system demonstrated 85% coulombic efficiency and 92% CE.'
      const result = extractPerformanceData(text)
      
      expect(result.efficiency).toEqual([85, 92])
    })

    it('should extract voltage values', () => {
      const text = 'Open circuit voltage was 750 mV with operating voltage of 0.5 V.'
      const result = extractPerformanceData(text)
      
      expect(result.voltage).toContain(750)
      expect(result.voltage).toContain(0.5)
    })

    it('should handle no matches gracefully', () => {
      const text = 'This paper discusses theoretical aspects only.'
      const result = extractPerformanceData(text)
      
      expect(Object.keys(result).length).toBe(0)
    })
  })

  describe('extractMaterials', () => {
    it('should extract anode materials', () => {
      const text = 'The anode was made of carbon cloth modified with graphene oxide.'
      const result = extractMaterials(text)
      
      expect(result.anode).toContain('carbon cloth modified with graphene oxide')
    })

    it('should extract cathode materials', () => {
      const text = 'Cathode electrode composed of platinum-coated carbon paper.'
      const result = extractMaterials(text)
      
      expect(result.cathode).toContain('platinum-coated carbon paper')
    })

    it('should extract membrane materials', () => {
      const text = 'A Nafion 117 membrane was used as the separator.'
      const result = extractMaterials(text)
      
      expect(result.membrane).toContain('Nafion 117')
    })

    it('should handle multiple materials', () => {
      const text = 'Anodes were carbon felt or graphite brushes. Cathodes used stainless steel mesh.'
      const result = extractMaterials(text)
      
      expect(result.anode.length).toBeGreaterThanOrEqual(1)
      expect(result.cathode.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('extractOrganisms', () => {
    it('should extract specific species names', () => {
      const text = 'Geobacter sulfurreducens and Shewanella oneidensis were used.'
      const result = extractOrganisms(text)
      
      expect(result).toContain('Geobacter sulfurreducens')
      expect(result).toContain('Shewanella oneidensis')
    })

    it('should extract consortium types', () => {
      const text = 'A mixed microbial consortium from activated sludge was employed.'
      const result = extractOrganisms(text)
      
      expect(result).toContain('mixed microbial consortium')
    })

    it('should extract biofilm mentions', () => {
      const text = 'The electroactive biofilm developed over 14 days.'
      const result = extractOrganisms(text)
      
      expect(result.some(org => org.includes('biofilm'))).toBe(true)
    })

    it('should avoid duplicates', () => {
      const text = 'Geobacter was used. The Geobacter biofilm was analyzed.'
      const result = extractOrganisms(text)
      
      const geobacterCount = result.filter(org => org.includes('Geobacter')).length
      expect(geobacterCount).toBeLessThanOrEqual(2) // Species and biofilm are different
    })
  })

  describe('Quality Score Integration', () => {
    it('should calculate overall score correctly', async () => {
      const excellentPaper = {
        id: 'excellent-1',
        title: 'High-Performance Microbial Fuel Cell Using Novel MXene-Modified Anodes',
        authors: JSON.stringify(['Expert One', 'Expert Two']),
        abstract: 'This bioelectrochemical system achieved record power density of 3000 mW/m² using Ti3C2 MXene-modified carbon cloth anodes with Geobacter biofilms.',
        doi: '10.1038/nature.2024.12345',
        journal: 'Nature Energy',
        publicationDate: new Date().toISOString(),
        keywords: JSON.stringify(['microbial fuel cell', 'MXene', 'bioelectrochemical', 'power density']),
        anodeMaterials: JSON.stringify(['MXene-modified carbon cloth']),
        cathodeMaterials: JSON.stringify(['Platinum']),
        organismTypes: JSON.stringify(['Geobacter']),
        powerOutput: 3000
      }
      
      const result = await validatePaperQuality(excellentPaper)
      
      expect(result.overall).toBeGreaterThanOrEqual(85)
      expect(result.breakdown.verification).toBe(20)
      expect(result.breakdown.completeness).toBe(15)
      expect(result.flags.isVerified).toBe(true)
      expect(result.flags.hasPerformanceData).toBe(true)
      expect(result.flags.isHighImpact).toBe(true)
    })
  })
})