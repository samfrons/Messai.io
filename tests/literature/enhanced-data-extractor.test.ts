import { describe, it, expect, vi } from 'vitest'
import { extractEnhancedData } from '../../scripts/literature/enhanced-data-extractor'

// Mock Prisma
vi.mock('../../lib/db', () => ({
  default: {
    $disconnect: vi.fn()
  }
}))

describe('Enhanced Data Extractor', () => {
  const createMockPaper = (overrides = {}) => ({
    id: 'test-1',
    title: 'Test Paper',
    abstract: '',
    systemType: 'MFC',
    ...overrides
  })

  describe('Performance Data Extraction', () => {
    it('should extract power density with conditions', async () => {
      const paper = createMockPaper({
        abstract: 'The MFC achieved 1500 mW/m² at 30°C and pH 7.0'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.powerDensity).toBeDefined()
      expect(result.powerDensity.value).toBe(1500)
      expect(result.powerDensity.unit).toBe('mW/m²')
      expect(result.powerDensity.conditions).toContain('30°C')
    })

    it('should extract current density with proper units', async () => {
      const paper = createMockPaper({
        abstract: 'Maximum current density reached 8.5 mA/cm² at steady state'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.currentDensity).toBeDefined()
      expect(result.currentDensity.value).toBe(8.5)
      expect(result.currentDensity.unit).toBe('mA/cm²')
    })

    it('should identify OCV vs operating voltage', async () => {
      const paper = createMockPaper({
        abstract: 'Open circuit voltage of 850 mV was observed'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.voltage).toBeDefined()
      expect(result.voltage.value).toBe(850)
      expect(result.voltage.type).toBe('OCV')
    })

    it('should extract coulombic efficiency', async () => {
      const paper = createMockPaper({
        abstract: 'The system demonstrated 78.5% coulombic efficiency'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.coulombicEfficiency).toBe(78.5)
    })

    it('should prefer highest values when multiple are found', async () => {
      const paper = createMockPaper({
        abstract: 'Power density varied from 500 mW/m² to 1200 mW/m² with peak of 1800 mW/m²'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.powerDensity.value).toBe(1800)
    })
  })

  describe('Material Classification', () => {
    it('should classify anode materials by type', async () => {
      const paper = createMockPaper({
        abstract: 'The anode was made of carbon cloth modified with reduced graphene oxide'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.anodeMaterials).toBeDefined()
      expect(result.anodeMaterials[0].material).toContain('carbon cloth')
      expect(result.anodeMaterials[0].modification).toBe('carbon')
      expect(result.anodeMaterials.some(m => m.material.includes('graphene'))).toBe(true)
    })

    it('should detect platinum catalysts in cathodes', async () => {
      const paper = createMockPaper({
        abstract: 'Cathode used carbon paper with platinum catalyst loading'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.cathodeMaterials).toBeDefined()
      expect(result.cathodeMaterials[0].catalyst).toBe('Pt')
    })

    it('should identify MXene materials', async () => {
      const paper = createMockPaper({
        abstract: 'Novel Ti3C2 MXene electrodes were fabricated'
      })
      
      const result = await extractEnhancedData(paper)
      
      const materials = result.anodeMaterials || result.cathodeMaterials
      expect(materials.some(m => m.material.includes('Ti3C2'))).toBe(true)
    })
  })

  describe('Organism Classification', () => {
    it('should classify pure cultures vs consortia', async () => {
      const paper = createMockPaper({
        abstract: 'Pure culture of Geobacter sulfurreducens and mixed microbial consortium were compared'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.organisms).toBeDefined()
      expect(result.organisms.find(o => o.species.includes('Geobacter')).type).toBe('pure')
      expect(result.organisms.find(o => o.species.includes('consortium')).type).toBe('consortium')
    })

    it('should identify electroactive organisms', async () => {
      const paper = createMockPaper({
        abstract: 'Shewanella oneidensis biofilm formed on the electrode'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.organisms).toBeDefined()
      const shewanella = result.organisms.find(o => o.species.includes('Shewanella'))
      expect(shewanella).toBeDefined()
      expect(shewanella.type).toBe('biofilm')
      expect(shewanella.source).toBe('electroactive')
    })
  })

  describe('System Configuration', () => {
    it('should detect chamber configuration', async () => {
      const paper = createMockPaper({
        abstract: 'A single-chamber microbial fuel cell was constructed'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.systemConfig.chamberConfig).toBe('single')
    })

    it('should extract system volume', async () => {
      const paper = createMockPaper({
        abstract: 'The reactor had a working volume of 250 mL'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.systemConfig.volume).toBe(250)
      expect(result.systemConfig.volumeUnit).toBe('mL')
    })

    it('should determine system type from context', async () => {
      const paper = createMockPaper({
        title: 'Hydrogen Production in Microbial Electrolysis Cell',
        abstract: 'MEC for hydrogen generation',
        systemType: null
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.systemConfig.type).toBe('MEC')
    })
  })

  describe('Operating Conditions', () => {
    it('should extract temperature values', async () => {
      const paper = createMockPaper({
        abstract: 'Experiments were conducted at 25±2°C'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.operatingConditions.temperature).toBe(25)
    })

    it('should extract pH values', async () => {
      const paper = createMockPaper({
        abstract: 'Optimal performance was observed at pH 7.5'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.operatingConditions.pH).toBe(7.5)
    })

    it('should extract COD concentration', async () => {
      const paper = createMockPaper({
        abstract: 'Wastewater with 1500 mg COD/L was used'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.operatingConditions.concentrationCOD).toBe(1500)
    })

    it('should extract hydraulic retention time', async () => {
      const paper = createMockPaper({
        abstract: 'The system operated with HRT of 24 hours'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.operatingConditions.hydraulicRetentionTime).toBe(24)
    })
  })

  describe('Experimental Duration', () => {
    it('should extract operation duration in various units', async () => {
      const paper = createMockPaper({
        abstract: 'The MFC was operated for 90 days continuously'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.duration).toBeDefined()
      expect(result.duration.value).toBe(90)
      expect(result.duration.unit).toBe('days')
    })

    it('should handle different duration patterns', async () => {
      const paper = createMockPaper({
        abstract: 'After running for 6 months, stable performance was achieved'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.duration.value).toBe(6)
      expect(result.duration.unit).toBe('months')
    })
  })

  describe('Confidence Scoring', () => {
    it('should give high confidence for comprehensive extraction', async () => {
      const paper = createMockPaper({
        abstract: `The single-chamber MFC with carbon cloth anode and Pt-coated cathode 
                   achieved 2000 mW/m² at 30°C, pH 7.0. Geobacter biofilm developed over 
                   14 days. System volume was 100 mL with HRT of 12 hours.`
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.extractionMetadata.confidence).toBeGreaterThan(0.7)
    })

    it('should give low confidence for minimal extraction', async () => {
      const paper = createMockPaper({
        abstract: 'This paper discusses theoretical aspects of bioelectrochemical systems.'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.extractionMetadata.confidence).toBeLessThan(0.3)
    })

    it('should include metadata', async () => {
      const paper = createMockPaper({})
      const result = await extractEnhancedData(paper)
      
      expect(result.extractionMetadata.method).toBe('pattern-matching-enhanced')
      expect(result.extractionMetadata.timestamp).toBeDefined()
      expect(typeof result.extractionMetadata.confidence).toBe('number')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty abstract gracefully', async () => {
      const paper = createMockPaper({ abstract: null })
      const result = await extractEnhancedData(paper)
      
      expect(result).toBeDefined()
      expect(result.extractionMetadata.confidence).toBe(0)
    })

    it('should handle malformed units', async () => {
      const paper = createMockPaper({
        abstract: 'Power output was 1500 mW m-2'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.powerDensity.unit).toBe('mW/m-2')
    })

    it('should extract from title when abstract is minimal', async () => {
      const paper = createMockPaper({
        title: 'High Power MFC: 3000 mW/m² Using MXene Electrodes',
        abstract: 'Study of microbial fuel cells.'
      })
      
      const result = await extractEnhancedData(paper)
      
      expect(result.powerDensity.value).toBe(3000)
    })
  })
})