'use client'

import { useState, useEffect } from 'react'

export default function DebugLiteraturePage() {
  const [status, setStatus] = useState('Initial')
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStatus('useEffect triggered')
    
    fetch('/api/papers?page=1&limit=5')
      .then(res => {
        setStatus(`API responded with status: ${res.status}`)
        return res.json()
      })
      .then(data => {
        setStatus('Data received')
        setData(data)
      })
      .catch(err => {
        setStatus('Error occurred')
        setError(err.message)
      })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Literature Debug Page</h1>
      
      <div className="mb-4">
        <h2 className="font-semibold">Status:</h2>
        <p className="text-blue-600">{status}</p>
      </div>

      {error && (
        <div className="mb-4">
          <h2 className="font-semibold">Error:</h2>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {data && (
        <div className="mb-4">
          <h2 className="font-semibold">Data:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-semibold mb-2">Manual Test:</h2>
        <button
          onClick={() => {
            setStatus('Manual fetch started')
            fetch('/api/papers?page=1&limit=2')
              .then(res => res.json())
              .then(data => {
                setStatus('Manual fetch completed')
                setData(data)
              })
              .catch(err => {
                setStatus('Manual fetch failed')
                setError(err.message)
              })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test API Manually
        </button>
      </div>
    </div>
  )
}