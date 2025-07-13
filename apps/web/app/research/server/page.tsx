import prisma from '@/lib/db'

async function getPapers() {
  try {
    const papers = await prisma.researchPaper.findMany({
      where: { isPublic: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { experiments: true }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })
    return papers
  } catch (error) {
    console.error('Error fetching papers:', error)
    return []
  }
}

export default async function ServerLiteraturePage() {
  const papers = await getPapers()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Server-Side Literature Test</h1>
      <p className="mb-4 text-green-600">Found {papers.length} papers (server-side)</p>
      
      {papers.length > 0 ? (
        <div className="space-y-4">
          {papers.map(paper => (
            <div key={paper.id} className="p-4 border rounded">
              <h3 className="font-semibold">{paper.title}</h3>
              <p className="text-sm text-gray-600">
                {paper.authors} | Created: {new Date(paper.createdAt).toLocaleDateString()}
              </p>
              {paper.doi && <p className="text-xs text-blue-600">DOI: {paper.doi}</p>}
              <p className="text-xs text-gray-500">
                Experiments: {paper._count.experiments} | 
                Uploaded by: {paper.user.email}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No papers found in database</p>
      )}
    </div>
  )
}