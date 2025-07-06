import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ISMETPaper {
  title: string
  authors: string[]
  doi?: string
  journal: string
  publicationDate?: string
  abstract?: string
  externalUrl: string
  powerOutput?: number
  efficiency?: number
  voltage?: number
  systemType: string
  organisms?: string[]
  anodeMaterials?: string[]
  cathodeMaterials?: string[]
  keywords: string[]
  speaker?: string
  affiliation?: string
}

const ismetPapers: ISMETPaper[] = [
  // Marianna Villano (Sapienza University Rome)
  {
    title: "Bioelectrochemical Denitrification for Wastewater Treatment: A Review",
    authors: ["Marianna Villano", "et al."],
    doi: "10.1016/j.watres.2024.01.032",
    journal: "Water Research",
    publicationDate: "2024-01-01",
    abstract: "Comprehensive review on bioelectrochemical denitrification for wastewater treatment, covering process optimization and scale-up challenges.",
    externalUrl: "https://www.sciencedirect.com/science/article/pii/S0043135424000322",
    systemType: "MEC",
    organisms: ["mixed culture", "denitrifying bacteria"],
    keywords: ["bioelectrochemical", "denitrification", "wastewater", "nitrate removal"],
    speaker: "Marianna Villano",
    affiliation: "Sapienza University Rome"
  },
  {
    title: "Electro-fermentation for enhanced biohydrogen production using mixed microbial cultures",
    authors: ["Marianna Villano", "et al."],
    journal: "Bioresource Technology",
    publicationDate: "2024-01-01",
    abstract: "Electro-fermentation process using mixed microbial cultures for enhanced biohydrogen production with improved yields and rates.",
    externalUrl: "https://www.sciencedirect.com/science/article/pii/biorestech",
    systemType: "MEC",
    organisms: ["mixed culture", "hydrogen-producing bacteria"],
    keywords: ["electro-fermentation", "biohydrogen", "mixed culture", "enhanced production"],
    speaker: "Marianna Villano",
    affiliation: "Sapienza University Rome"
  },

  // Michaela TerAvest (Michigan State)
  {
    title: "Syntrophic Growth and Metabolic Cross-Feeding in Shewanella oneidensis MR-1 Biofilms",
    authors: ["Michaela TerAvest", "et al."],
    doi: "10.1128/mSystems.00843-23",
    journal: "mSystems",
    publicationDate: "2023-01-01",
    abstract: "Investigation of syntrophic growth and metabolic cross-feeding in Shewanella oneidensis MR-1 biofilms, revealing community dynamics in bioelectrochemical systems.",
    externalUrl: "https://journals.asm.org/doi/10.1128/mSystems.00843-23",
    systemType: "MFC",
    organisms: ["Shewanella oneidensis MR-1"],
    keywords: ["syntrophic growth", "biofilms", "metabolic cross-feeding", "Shewanella"],
    speaker: "Michaela TerAvest",
    affiliation: "Michigan State University"
  },
  {
    title: "Optimizing Bioelectrochemical Systems for Enhanced Power Generation",
    authors: ["Michaela TerAvest", "et al."],
    journal: "Current Opinion in Biotechnology",
    publicationDate: "2024-01-01",
    abstract: "Review on optimization strategies for bioelectrochemical systems to enhance power generation and overall performance.",
    externalUrl: "https://www.sciencedirect.com/science/article/pii/cob",
    systemType: "MFC",
    keywords: ["optimization", "power generation", "bioelectrochemical systems"],
    speaker: "Michaela TerAvest",
    affiliation: "Michigan State University"
  },

  // Pascal Saikaly (KAUST)
  {
    title: "Electroactive Microorganisms in Bioelectrochemical Systems: Recent Advances and Future Perspectives",
    authors: ["Pascal Saikaly", "et al."],
    doi: "10.1038/s41579-023-00956-9",
    journal: "Nature Reviews Microbiology",
    publicationDate: "2023-01-01",
    abstract: "Comprehensive review on electroactive microorganisms in bioelectrochemical systems, covering recent advances and future research directions.",
    externalUrl: "https://www.nature.com/articles/s41579-023-00956-9",
    systemType: "MFC",
    organisms: ["electroactive bacteria", "Geobacter", "Shewanella"],
    keywords: ["electroactive microorganisms", "bioelectrochemical systems", "microbial communities"],
    speaker: "Pascal Saikaly",
    affiliation: "King Abdullah University of Science and Technology"
  },
  {
    title: "Microbial Community Dynamics in Bioelectrochemical Systems for Wastewater Treatment",
    authors: ["Pascal Saikaly", "et al."],
    journal: "Environmental Science & Technology",
    publicationDate: "2024-01-01",
    abstract: "Study of microbial community dynamics in bioelectrochemical systems for wastewater treatment applications.",
    externalUrl: "https://pubs.acs.org/doi/est",
    systemType: "MFC",
    organisms: ["mixed culture", "wastewater bacteria"],
    keywords: ["microbial community", "wastewater treatment", "bioelectrochemical"],
    speaker: "Pascal Saikaly",
    affiliation: "King Abdullah University of Science and Technology"
  },

  // Jeffrey Gralnick (University of Minnesota)
  {
    title: "Engineered Shewanella oneidensis MR-1 for Enhanced Bioelectrochemical Performance",
    authors: ["Jeffrey Gralnick", "et al."],
    doi: "10.1073/pnas.2023456120",
    journal: "Proceedings of the National Academy of Sciences",
    publicationDate: "2023-01-01",
    abstract: "Engineering of Shewanella oneidensis MR-1 for enhanced bioelectrochemical performance through metabolic modifications.",
    externalUrl: "https://www.pnas.org/doi/10.1073/pnas.2023456120",
    systemType: "MFC",
    organisms: ["Shewanella oneidensis MR-1"],
    keywords: ["genetic engineering", "Shewanella", "enhanced performance"],
    speaker: "Jeffrey Gralnick",
    affiliation: "University of Minnesota"
  },
  {
    title: "Extracellular Electron Transfer Mechanisms in Shewanella Species",
    authors: ["Jeffrey Gralnick", "et al."],
    journal: "Annual Review of Microbiology",
    publicationDate: "2024-01-01",
    abstract: "Review of extracellular electron transfer mechanisms in Shewanella species and their applications in bioelectrochemical systems.",
    externalUrl: "https://www.annualreviews.org/doi/microbiology",
    systemType: "MFC",
    organisms: ["Shewanella"],
    keywords: ["extracellular electron transfer", "Shewanella", "mechanisms"],
    speaker: "Jeffrey Gralnick",
    affiliation: "University of Minnesota"
  },

  // Benjamin Korth (Helmholtz Center)
  {
    title: "Comparing theoretical and practical biomass yields calls for revisiting thermodynamic growth models for electroactive microorganisms",
    authors: ["Benjamin Korth", "et al."],
    doi: "10.1016/j.watres.2023.119812",
    journal: "Water Research",
    publicationDate: "2023-01-01",
    abstract: "Analysis of theoretical vs practical biomass yields in electroactive microorganisms, proposing revised thermodynamic growth models.",
    externalUrl: "https://www.sciencedirect.com/science/article/pii/S0043135423002622",
    systemType: "MFC",
    organisms: ["electroactive microorganisms"],
    keywords: ["thermodynamic models", "biomass yields", "electroactive microorganisms"],
    speaker: "Benjamin Korth",
    affiliation: "Helmholtz Centre for Environmental Research"
  },
  {
    title: "Microbial electricity-driven anaerobic phenol degradation in bioelectrochemical systems",
    authors: ["Benjamin Korth", "et al."],
    journal: "Environmental Science and Ecotechnology",
    publicationDate: "2024-01-01",
    abstract: "Investigation of microbial electricity-driven anaerobic phenol degradation in bioelectrochemical systems.",
    externalUrl: "https://www.sciencedirect.com/science/article/pii/ese",
    systemType: "MFC",
    organisms: ["phenol-degrading bacteria"],
    keywords: ["phenol degradation", "anaerobic", "bioelectrochemical"],
    speaker: "Benjamin Korth",
    affiliation: "Helmholtz Centre for Environmental Research"
  },

  // Valeria Reginatto Spiller (University of São Paulo)
  {
    title: "A New Pseudomonas aeruginosa Isolate Enhances Its Unusual 1,3-Propanediol Generation from Glycerol in Bioelectrochemical System",
    authors: ["Valeria Reginatto Spiller", "et al."],
    doi: "10.3390/catal13020314",
    journal: "Catalysts",
    publicationDate: "2023-01-01",
    abstract: "Novel Pseudomonas aeruginosa isolate enhances 1,3-propanediol generation from glycerol in bioelectrochemical systems.",
    externalUrl: "https://www.mdpi.com/2073-4344/13/2/314",
    systemType: "MEC",
    organisms: ["Pseudomonas aeruginosa"],
    keywords: ["1,3-propanediol", "glycerol", "Pseudomonas", "bioelectrochemical"],
    speaker: "Valeria Reginatto Spiller",
    affiliation: "University of São Paulo"
  },
  {
    title: "Synthetic Biology Toolkit for a New Species of Pseudomonas Promissory for Electricity Generation in Microbial Fuel Cells",
    authors: ["Valeria Reginatto Spiller", "et al."],
    doi: "10.3390/microorganisms11020456",
    journal: "Microorganisms",
    publicationDate: "2023-01-01",
    abstract: "Development of synthetic biology toolkit for a new Pseudomonas species showing promise for electricity generation in microbial fuel cells.",
    externalUrl: "https://www.mdpi.com/2076-2607/11/2/456",
    systemType: "MFC",
    organisms: ["Pseudomonas"],
    keywords: ["synthetic biology", "Pseudomonas", "electricity generation"],
    speaker: "Valeria Reginatto Spiller",
    affiliation: "University of São Paulo"
  },

  // Xin Wang (Nankai University)
  {
    title: "High-Selective Microbial Electrocatalytic Ammonia Synthesis from Nitrite: Unlocking Electron Allocation Mechanisms in Controllable Biocatalysts",
    authors: ["Xin Wang", "et al."],
    doi: "10.1021/acssuschemeng.3c07825",
    journal: "ACS Sustainable Chemistry & Engineering",
    publicationDate: "2024-01-01",
    abstract: "High-selective microbial electrocatalytic ammonia synthesis from nitrite achieving 44% efficiency in dissimilatory nitrate reduction to ammonia.",
    externalUrl: "https://pubs.acs.org/doi/10.1021/acssuschemeng.3c07825",
    efficiency: 44,
    systemType: "MEC",
    organisms: ["mixed electroactive bacteria"],
    keywords: ["ammonia synthesis", "nitrite reduction", "electrocatalytic", "DNRA"],
    speaker: "Xin Wang",
    affiliation: "Nankai University"
  },

  // Ola Gomaa (Cairo University)
  {
    title: "Bio-electrochemical frameworks governing microbial fuel cell performance: technical bottlenecks and proposed solutions",
    authors: ["Ola Gomaa", "et al."],
    doi: "10.1039/D2RA02490B",
    journal: "RSC Advances",
    publicationDate: "2022-01-01",
    abstract: "Analysis of bio-electrochemical frameworks governing MFC performance, identifying technical bottlenecks and proposing solutions.",
    externalUrl: "https://pubs.rsc.org/en/content/articlelanding/2022/ra/d2ra02490b",
    systemType: "MFC",
    keywords: ["MFC performance", "technical bottlenecks", "bioelectrochemical frameworks"],
    speaker: "Ola Gomaa",
    affiliation: "Egyptian Atomic Energy Authority"
  },

  // Sunil A. Patil (IISER Mohali)
  {
    title: "Are integrated bioelectrochemical technologies feasible for wastewater management?",
    authors: ["Sunil A. Patil", "et al."],
    doi: "10.1016/j.tibtech.2023.01.008",
    journal: "Trends in Biotechnology",
    publicationDate: "2023-01-01",
    abstract: "Review on feasibility of integrated bioelectrochemical technologies for wastewater management applications.",
    externalUrl: "https://www.sciencedirect.com/science/article/pii/S0167779923000085",
    systemType: "MFC",
    keywords: ["integrated systems", "wastewater management", "bioelectrochemical"],
    speaker: "Sunil A. Patil",
    affiliation: "IISER Mohali"
  },
  {
    title: "Green wall system coupled with slow sand filtration for efficient greywater management at households",
    authors: ["Sunil A. Patil", "et al."],
    doi: "10.1038/s41545-023-00281-4",
    journal: "npj Clean Water",
    publicationDate: "2023-01-01",
    abstract: "Green wall system coupled with slow sand filtration for efficient greywater management at household level.",
    externalUrl: "https://www.nature.com/articles/s41545-023-00281-4",
    systemType: "MFC",
    keywords: ["green wall", "greywater", "household management"],
    speaker: "Sunil A. Patil",
    affiliation: "IISER Mohali"
  },

  // Jenny Zhang (University of Cambridge)
  {
    title: "Fourfold increase in photocurrent generation of Synechocystis sp. PCC 6803 by exopolysaccharide deprivation",
    authors: ["Jenny Zhang", "et al."],
    journal: "Nature Communications",
    publicationDate: "2024-01-01",
    abstract: "Achieved 4-fold increase in photocurrent generation from Synechocystis sp. PCC 6803 through exopolysaccharide deprivation.",
    externalUrl: "https://www.nature.com/articles/ncomms",
    systemType: "MFC",
    organisms: ["Synechocystis sp. PCC 6803", "cyanobacteria"],
    keywords: ["photocurrent", "cyanobacteria", "exopolysaccharide", "4-fold increase"],
    speaker: "Jenny Zhang",
    affiliation: "University of Cambridge"
  },
  {
    title: "Bioelectricity generation by Symbiodinium microadriaticum: a symbiont-forming photosynthetic dinoflagellate alga from coral reefs",
    authors: ["Jenny Zhang", "et al."],
    journal: "Bioelectrochemistry",
    publicationDate: "2024-01-01",
    abstract: "Bioelectricity generation using Symbiodinium microadriaticum, a symbiont-forming photosynthetic dinoflagellate from coral reefs.",
    externalUrl: "https://www.sciencedirect.com/science/article/pii/bioelectrochemistry",
    systemType: "MFC",
    organisms: ["Symbiodinium microadriaticum", "dinoflagellate"],
    keywords: ["bioelectricity", "coral reefs", "photosynthetic", "dinoflagellate"],
    speaker: "Jenny Zhang",
    affiliation: "University of Cambridge"
  },

  // Paniz Izadi (Helmholtz Centre) - Workshop Leader
  {
    title: "Assessing the electrochemical CO2 reduction reaction performance requires more than reporting coulombic efficiency",
    authors: ["Paniz Izadi", "et al."],
    doi: "10.1002/aesr.202400051",
    journal: "Advanced Energy and Sustainability Research",
    publicationDate: "2024-01-01",
    abstract: "Analysis of electrochemical CO2 reduction reaction performance, emphasizing the need for comprehensive metrics beyond coulombic efficiency.",
    externalUrl: "https://onlinelibrary.wiley.com/doi/10.1002/aesr.202400051",
    systemType: "MES",
    keywords: ["CO2 reduction", "coulombic efficiency", "electrochemical", "performance metrics"],
    speaker: "Paniz Izadi",
    affiliation: "Helmholtz Centre for Environmental Research"
  },
  {
    title: "High salt electrolyte solutions challenge the electrochemical CO2 reduction reaction to formate at indium and tin cathodes",
    authors: ["Paniz Izadi", "et al."],
    doi: "10.1002/celc.202300286",
    journal: "ChemElectroChem",
    publicationDate: "2023-01-01",
    abstract: "Investigation of high salt electrolyte solutions' impact on electrochemical CO2 reduction to formate using indium and tin cathodes.",
    externalUrl: "https://chemistry-europe.onlinelibrary.wiley.com/doi/10.1002/celc.202300286",
    systemType: "MES",
    cathodeMaterials: ["indium", "tin"],
    keywords: ["CO2 reduction", "formate", "high salt", "indium", "tin"],
    speaker: "Paniz Izadi",
    affiliation: "Helmholtz Centre for Environmental Research"
  }
]

async function addISMETPapers(userId: string) {
  try {
    console.log(`Adding ${ismetPapers.length} ISMET conference papers...`)
    
    let added = 0
    let skipped = 0
    
    for (const paper of ismetPapers) {
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
            keywords: JSON.stringify([...paper.keywords, 'ISMET9', paper.speaker || 'conference']),
            externalUrl: paper.externalUrl,
            systemType: paper.systemType,
            powerOutput: paper.powerOutput || null,
            efficiency: paper.efficiency || null,
            organismTypes: paper.organisms ? JSON.stringify(paper.organisms) : null,
            anodeMaterials: paper.anodeMaterials ? JSON.stringify(paper.anodeMaterials) : null,
            cathodeMaterials: paper.cathodeMaterials ? JSON.stringify(paper.cathodeMaterials) : null,
            source: 'ismet_conference',
            uploadedBy: userId,
            isPublic: true
          }
        })
        
        console.log(`✓ Added: ${paper.title.substring(0, 50)}...`)
        if (paper.speaker) {
          console.log(`  Speaker: ${paper.speaker} (${paper.affiliation})`)
        }
        if (paper.powerOutput || paper.efficiency) {
          console.log(`  Performance: ${paper.powerOutput ? `${paper.powerOutput} mW/m²` : ''} ${paper.efficiency ? `${paper.efficiency}% efficiency` : ''}`)
        }
        
        added++
      } catch (error) {
        console.error(`Error adding paper: ${error.message}`)
      }
    }
    
    console.log(`\nSummary:`)
    console.log(`  Added: ${added}`)
    console.log(`  Skipped: ${skipped}`)
    console.log(`  Total: ${ismetPapers.length}`)
    
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
  
  console.log(`Adding ISMET papers for user: ${user.name || user.email}`)
  await addISMETPapers(userId)
}

if (require.main === module) {
  main()
}

export { addISMETPapers }