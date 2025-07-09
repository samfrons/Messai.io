import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.researchPaper.count()
  console.log('Total papers in database:', count)
  
  const recent = await prisma.researchPaper.findFirst({
    orderBy: { createdAt: 'desc' }
  })
  
  if (recent) {
    console.log('Most recent paper:', recent.title)
    console.log('Created at:', recent.createdAt)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())