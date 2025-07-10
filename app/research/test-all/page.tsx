'use client'

import { useState, useEffect } from 'react'

export default function TestAllLiteraturePage() {
  const [status, setStatus] = useState('Initial')
  const [papers, setPapers] = useState<any[]>([])
  
  useEffect(() => {
    console.log('TestAllLiteraturePage mounted')
    setStatus('Mounted')
    
    // Fetch ALL papers without realOnly filter
    fetch('/api/papers?page=1&limit=10')
      .then(res => {
        console.log('Response:', res.status)
        setStatus(`Response: ${res.status}`)
        return res.json()
      })
      .then(data => {
        console.log('Data:', data)
        setStatus(`Got ${data.papers?.length || 0} papers`)
        setPapers(data.papers || [])
      })
      .catch(err => {
        console.error('Error:', err)
        setStatus(`Error: ${err.message}`)
      })
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test All Papers (No Filter)</h1>
      <p className="mb-4">Status: <span className="font-mono text-blue-600">{status}</span></p>
      
      {papers.length > 0 ? (
        <div className="space-y-4">
          <p className="text-green-600">Successfully loaded {papers.length} papers!</p>
          {papers.map(paper => (
            <div key={paper.id} className="p-4 border rounded">
              <h3 className="font-semibold">{paper.title}</h3>
              <p className="text-sm text-gray-600">
                {paper.authors} | Source: {paper.source || 'Unknown'}
              </p>
              {paper.doi && <p className="text-xs text-blue-600">DOI: {paper.doi}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No papers loaded yet...</p>
      )}
    </div>
  )
}