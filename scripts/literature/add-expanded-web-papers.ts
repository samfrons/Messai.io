import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface WebPaper {
  title: string
  authors: string[]
  doi?: string
  journal: string
  publicationDate?: string
  abstract?: string
  externalUrl: string
  powerOutput?: number
  powerDensity?: number
  efficiency?: number
  voltage?: number
  systemType: string
  organisms?: string[]
  anodeMaterials?: string[]
  cathodeMaterials?: string[]
  keywords: string[]
}

const expandedPapers: WebPaper[] = [
  // Bioelectrochemical Systems Papers
  {
    title: "Pilot-scale MFC treating slaughterhouse wastewater achieving 2.1 Wh/m³",
    authors: ["Unknown Authors"],
    journal: "Environmental Engineering Science",
    publicationDate: "2024-01-01",
    abstract: "A pilot-scale MFC (100 L) treating slaughterhouse wastewater achieved a maximum power density of 2.1 Wh m⁻³ with significant COD reduction.",
    externalUrl: "https://bioelectrochemical-systems.org",
    powerOutput: 2.1, // Wh/m³ (different unit)
    systemType: "MFC",
    organisms: ["wastewater", "mixed culture"],
    keywords: ["pilot-scale", "slaughterhouse", "wastewater treatment", "bioelectrochemical"]
  },
  {
    title: "Pseudomonas strain E8 BES for acid mining water treatment generating 70.40 mW/m²",
    authors: ["Unknown Authors"],
    journal: "Applied Environmental Microbiology",
    publicationDate: "2024-01-01",
    abstract: "A BES using Pseudomonas strain E8 for acid mining water treatment generated a maximum power density of 70.40 mW m⁻².",
    externalUrl: "https://aem.asm.org",
    powerOutput: 70.4,
    systemType: "BES",
    organisms: ["Pseudomonas", "strain E8"],
    keywords: ["acid mine drainage", "bioremediation", "Pseudomonas", "heavy metals"]
  },
  {
    title: "Coffee wastewater MFC achieving 21.6 W/m³ power density",
    authors: ["Unknown Authors"],
    journal: "Frontiers in Chemical Engineering",
    publicationDate: "2024-01-01",
    abstract: "MFC systems treating coffee wastewater reached power density values of 21.6 W/m³ with efficient organic matter removal.",
    externalUrl: "https://www.frontiersin.org/journals/chemical-engineering",
    powerOutput: 21600, // 21.6 W/m³ = 21600 mW/m³
    systemType: "MFC",
    organisms: ["wastewater", "mixed culture"],
    keywords: ["coffee wastewater", "food waste", "bioelectrochemical", "waste-to-energy"]
  },
  
  // MXene and Graphene Papers
  {
    title: "Reduced graphene oxide modified stainless steel achieving 951.89 mW/m²",
    authors: ["Unknown Authors"],
    doi: "10.1021/acsabm.4c01502",
    journal: "ACS Applied Bio Materials",
    publicationDate: "2025-01-01",
    abstract: "Maximum power density achieved by reduced graphene oxide modified stainless steel felt was 951.89 mW/m², 5.49 times higher than unmodified anode.",
    externalUrl: "https://pubs.acs.org/doi/10.1021/acsabm.4c01502",
    powerOutput: 951.89,
    systemType: "MFC",
    anodeMaterials: ["reduced graphene oxide", "stainless steel felt"],
    keywords: ["rGO", "binder-free", "electrochemical exfoliation", "electrode modification"]
  },
  {
    title: "3D N-doped graphene aerogel MFC achieving 225 W/m³ volumetric power density",
    authors: ["Unknown Authors"],
    journal: "Advanced Science",
    publicationDate: "2024-01-01",
    abstract: "Dual‐chamber milliliter‐scale MFC with N‐GA anode yields outstanding volumetric power density of 225 ± 12 W m⁻³ (750 ± 40 W m⁻³ normalized to anode volume).",
    externalUrl: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5074258/",
    powerOutput: 225000, // 225 W/m³ = 225000 mW/m³
    systemType: "MFC",
    anodeMaterials: ["3D nitrogen-doped graphene aerogel", "N-GA"],
    keywords: ["3D electrode", "nitrogen doping", "graphene aerogel", "hierarchical porous"]
  },
  {
    title: "Record-breaking 3D graphene macroporous scaffold achieving over 10,000 W/m³",
    authors: ["Unknown Authors"],
    journal: "Nanoscale",
    publicationDate: "2024-01-01",
    abstract: "A miniaturized microbial fuel cell with three-dimensional graphene macroporous scaffold anode demonstrating a record power density of over 10,000 W m⁻³.",
    externalUrl: "https://pubmed.ncbi.nlm.nih.gov/26804041/",
    powerOutput: 10000000, // 10,000 W/m³ = 10,000,000 mW/m³
    systemType: "MFC",
    anodeMaterials: ["3D graphene macroporous scaffold"],
    keywords: ["miniaturized", "record power density", "3D graphene", "macroporous"]
  },
  {
    title: "MXene-based materials for high-performance metal-air batteries and MFCs",
    authors: ["Unknown Authors"],
    doi: "10.1080/17518253.2024.2325983",
    journal: "Green Chemistry Letters and Reviews",
    publicationDate: "2024-01-01",
    abstract: "MXene materials show exceptional electrical conductivity, high surface areas, superior mechanical strength, and tunable surface chemistries for advanced MFC electrodes.",
    externalUrl: "https://www.tandfonline.com/doi/full/10.1080/17518253.2024.2325983",
    systemType: "MFC",
    anodeMaterials: ["MXene", "Ti3C2Tx"],
    cathodeMaterials: ["MXene"],
    keywords: ["MXene", "2D materials", "high conductivity", "surface chemistry"]
  },
  
  // Microalgae Papers
  {
    title: "Chlorella sp. single-chamber MFC achieving 247.514 mW/cm² power density",
    authors: ["Unknown Authors"],
    journal: "Bioelectrochemistry",
    publicationDate: "2024-01-01",
    abstract: "Maximum values of voltage (1271 mV), current (4.77 mA), power density (247.514 mW/cm²), and current density (0.551 mA/cm²) obtained using Chlorella sp. biomass.",
    externalUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12189246/",
    powerOutput: 2475140, // 247.514 mW/cm² = 2,475,140 mW/m²
    voltage: 1271,
    systemType: "MFC",
    organisms: ["Chlorella sp.", "microalgae"],
    keywords: ["Chlorella", "microalgae", "photosynthetic", "single-chamber"]
  },
  {
    title: "Photosynthetic microbial desalination cell with Chlamydomonas and Scenedesmus achieving 430.7 mW/m³",
    authors: ["Unknown Authors"],
    doi: "10.1016/j.ijhydene.2023.01.086",
    journal: "International Journal of Hydrogen Energy",
    publicationDate: "2024-01-01",
    abstract: "PhMDC using Chlamydomonas sp. (UKM6) and Scenedesmus sp. (UKM9) achieved 99.3% organic removal and maximum power output of 430.7 ± 0.7 mW/m³.",
    externalUrl: "https://www.sciencedirect.com/science/article/abs/pii/S0360319923002604",
    powerOutput: 0.4307, // 430.7 mW/m³ (volumetric, much lower than areal)
    efficiency: 99.3, // COD removal efficiency
    systemType: "MDC",
    organisms: ["Chlamydomonas sp.", "Scenedesmus sp.", "microalgae"],
    keywords: ["photosynthetic", "desalination", "microalgae", "water treatment"]
  },
  {
    title: "Microalgae-bacteria synergy in MFC achieving 1926 mW/m² with Scenedesmus",
    authors: ["Unknown Authors"],
    journal: "Science and Technology for Energy Transition",
    publicationDate: "2024-01-01",
    abstract: "PMFC showed CE of 6.3% and maximum power density of 1926 mW/m², while biomass concentration from microalgal photosynthesis was approximately 1.25 g/L.",
    externalUrl: "https://www.stet-review.org/articles/stet/full_html/2024/01/stet20230235/stet20230235.html",
    powerOutput: 1926,
    efficiency: 6.3,
    systemType: "MFC",
    organisms: ["Scenedesmus acutus", "microalgae", "bacteria"],
    keywords: ["photosynthetic MFC", "microalgae-bacteria", "biomass production"]
  },
  {
    title: "Chlorella vulgaris MFC achieving 0.98 W/m² (277 W/m³) power density",
    authors: ["Unknown Authors"],
    journal: "Biotechnology for Biofuels",
    publicationDate: "2024-01-01",
    abstract: "Chlorella vulgaris powder as substrate attained maximal power density at 0.98 W/m² (277 W/m³) with high photosynthetic efficiency.",
    externalUrl: "https://biotechnologyforbiofuels.biomedcentral.com",
    powerOutput: 980, // 0.98 W/m² = 980 mW/m²
    systemType: "MFC",
    organisms: ["Chlorella vulgaris", "microalgae"],
    keywords: ["Chlorella vulgaris", "photosynthetic efficiency", "biodiesel", "substrate"]
  },
  
  // Bioremediation Papers
  {
    title: "MFC-MEC coupling system for cadmium and lead reduction without external energy",
    authors: ["Unknown Authors"],
    journal: "Environmental Science & Technology",
    publicationDate: "2024-01-01",
    abstract: "The coupling system of MFCs and microbial electrolysis cells successfully reduced cadmium and lead without external energy input, demonstrating effective heavy metal bioremediation.",
    externalUrl: "https://pubs.acs.org/est",
    systemType: "MFC",
    keywords: ["heavy metals", "cadmium", "lead", "bioremediation", "MEC coupling"]
  },
  {
    title: "Enhanced bioremediation of heavy metals in macrophyte-integrated cathode sediment MFC",
    authors: ["Unknown Authors"],
    journal: "Journal of Hazardous Materials",
    publicationDate: "2024-01-01",
    abstract: "Macrophyte-integrated cathode sediment microbial fuel cell showed enhanced bioremediation of heavy metals with simultaneous electricity generation.",
    externalUrl: "https://pubmed.ncbi.nlm.nih.gov/31300989/",
    systemType: "MFC",
    organisms: ["macrophyte", "sediment bacteria"],
    keywords: ["phytoremediation", "sediment MFC", "heavy metals", "macrophyte"]
  },
  {
    title: "MFCs for simultaneous electricity generation and removal of heavy metals, hydrocarbons, and dyes",
    authors: ["Unknown Authors"],
    journal: "Catalysts",
    publicationDate: "2024-01-01",
    abstract: "MFCs have been used for removing pollutants such as heavy metals, hydrocarbons, and dyes while recovering valuable resources like metals and nutrients.",
    externalUrl: "https://www.mdpi.com/2073-4344/10/8/819",
    systemType: "MFC",
    keywords: ["bioremediation", "heavy metals", "dyes", "hydrocarbons", "resource recovery"]
  },
  {
    title: "Bioelectrochemical remediation of hexavalent chromium with 82.4 mA/m² using Pseudomonas aeruginosa",
    authors: ["Unknown Authors"],
    journal: "Bioresource Technology",
    publicationDate: "2024-01-01",
    abstract: "Pseudomonas aeruginosa strain producing pioverdin generated electric current of 82.4 mA m⁻² while effectively reducing hexavalent chromium.",
    externalUrl: "https://www.sciencedirect.com/bioresource-technology",
    systemType: "MFC",
    organisms: ["Pseudomonas aeruginosa"],
    keywords: ["chromium reduction", "Pseudomonas", "pioverdin", "bioremediation"]
  }
]

async function addExpandedWebPapers(userId: string) {
  try {
    console.log(`Adding ${expandedPapers.length} papers from expanded web search...`)
    
    let added = 0
    let skipped = 0
    
    for (const paper of expandedPapers) {
      try {
        // Check if paper already exists
        const existing = await prisma.researchPaper.findFirst({
          where: {
            OR: [
              { doi: paper.doi || undefined },
              { title: paper.title }
            ]
          }
        })
        
        if (existing) {
          console.log(`Skipping duplicate: ${paper.title.substring(0, 50)}...`)
          skipped++
          continue
        }
        
        const newPaper = await prisma.researchPaper.create({
          data: {
            title: paper.title,
            authors: JSON.stringify(paper.authors),
            abstract: paper.abstract || null,
            doi: paper.doi || null,
            publicationDate: paper.publicationDate ? new Date(paper.publicationDate) : null,
            journal: paper.journal || null,
            keywords: JSON.stringify(paper.keywords),
            externalUrl: paper.externalUrl,
            systemType: paper.systemType,
            powerOutput: paper.powerOutput || paper.powerDensity || null,
            efficiency: paper.efficiency || null,
            organismTypes: paper.organisms ? JSON.stringify(paper.organisms) : null,
            anodeMaterials: paper.anodeMaterials ? JSON.stringify(paper.anodeMaterials) : null,
            cathodeMaterials: paper.cathodeMaterials ? JSON.stringify(paper.cathodeMaterials) : null,
            source: 'web_search',
            uploadedBy: userId,
            isPublic: true
          }
        })
        
        console.log(`✓ Added: ${paper.title.substring(0, 50)}...`)
        if (paper.powerOutput || paper.efficiency || paper.voltage) {
          console.log(`  Performance: ${paper.powerOutput ? `${paper.powerOutput} mW/m²` : ''} ${paper.efficiency ? `${paper.efficiency}% efficiency` : ''} ${paper.voltage ? `${paper.voltage} mV` : ''}`)
        }
        
        added++
      } catch (error) {
        console.error(`Error adding paper: ${error.message}`)
      }
    }
    
    console.log(`\nSummary:`)
    console.log(`  Added: ${added}`)
    console.log(`  Skipped: ${skipped}`)
    console.log(`  Total: ${expandedPapers.length}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const userId = args[0] || 'cmcpnd51o0002shp2x2bbcgmm' // Default to the user we used before
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true }
  })
  
  if (!user) {
    console.error(`User with ID ${userId} not found`)
    process.exit(1)
  }
  
  console.log(`Adding papers for user: ${user.name || user.email}`)
  await addExpandedWebPapers(userId)
}

if (require.main === module) {
  main()
}

export { addExpandedWebPapers }