'use client'

import { useState, useEffect } from 'react'

export default function SimpleLiteraturePage() {
  const [status, setStatus] = useState('Initial')
  const [papers, setPapers] = useState<any[]>([])
  
  useEffect(() => {
    console.log('SimpleLiteraturePage mounted')
    setStatus('Mounted')
    
    // Direct fetch without any dependencies
    fetch('/api/papers?page=1&limit=5&realOnly=true')
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
      <h1 className="text-2xl font-bold mb-4">Simple Literature Test</h1>
      <p className="mb-4">Status: <span className="font-mono text-blue-600">{status}</span></p>
      
      {papers.length > 0 ? (
        <div className="space-y-4">
          <p className="text-green-600">Successfully loaded {papers.length} papers!</p>
          {papers.map(paper => (
            <div key={paper.id} className="p-4 border rounded">
              <h3 className="font-semibold">{paper.title}</h3>
              <p className="text-sm text-gray-600">{paper.authors}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No papers loaded yet...</p>
      )}
    </div>
  )
}