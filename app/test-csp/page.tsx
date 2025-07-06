'use client';

import { useEffect, useState } from 'react';

export default function TestCSPPage() {
  const [results, setResults] = useState<Record<string, string>>({});

  useEffect(() => {
    const testResults: Record<string, string> = {};

    // Test 1: Check if eval works
    try {
      eval('1 + 1');
      testResults['eval'] = '✅ WORKS - CSP allows eval';
    } catch (error) {
      testResults['eval'] = '❌ BLOCKED - ' + (error as Error).message;
    }

    // Test 2: Check new Function
    try {
      new Function('return 1 + 1')();
      testResults['newFunction'] = '✅ WORKS - CSP allows new Function';
    } catch (error) {
      testResults['newFunction'] = '❌ BLOCKED - ' + (error as Error).message;
    }

    // Test 3: Check setTimeout with string
    try {
      setTimeout('console.log("test")', 0);
      testResults['setTimeoutString'] = '✅ WORKS - CSP allows setTimeout with string';
    } catch (error) {
      testResults['setTimeoutString'] = '❌ BLOCKED - ' + (error as Error).message;
    }

    // Test 4: Get CSP from meta tag or header
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (meta) {
      testResults['cspMeta'] = 'CSP Meta: ' + meta.getAttribute('content');
    } else {
      testResults['cspMeta'] = 'No CSP meta tag found';
    }

    // Test 5: Try to load Three.js
    import('three').then(
      (THREE) => {
        testResults['threejs'] = '✅ Three.js loaded successfully';
        setResults({ ...testResults });
      },
      (error) => {
        testResults['threejs'] = '❌ Three.js failed to load: ' + error.message;
        setResults({ ...testResults });
      }
    );

    setResults(testResults);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">CSP Test Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Test Results:</h2>
          {Object.entries(results).map(([test, result]) => (
            <div key={test} className="mb-2">
              <span className="font-mono text-sm">{test}:</span>
              <div className="ml-4 text-sm">{result}</div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Browser Info:</h2>
          <pre className="text-xs">
            {JSON.stringify({
              userAgent: navigator.userAgent,
              currentURL: window.location.href,
              protocol: window.location.protocol,
              NODE_ENV: process.env.NODE_ENV,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}