import Link from 'next/link'

export default function DemoAuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🎭</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Demo Mode Active
          </h1>
          <p className="text-gray-600">
            You're viewing the MESSAi demo platform
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-900 mb-2">
            Full Platform Features
          </h2>
          <p className="text-sm text-blue-700 mb-3">
            Create a free account on messai.io to:
          </p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Save and track your experiments</li>
            <li>Access personalized AI insights</li>
            <li>Collaborate with other researchers</li>
            <li>Export data and generate reports</li>
          </ul>
        </div>

        <div className="space-y-3">
          <a
            href="https://messai.io/auth/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Create Account on messai.io
          </a>
          
          <a
            href="https://messai.io/auth/login"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Sign In on messai.io
          </a>
          
          <Link
            href="/"
            className="block w-full text-center px-4 py-3 text-blue-600 hover:text-blue-800 transition"
          >
            ← Back to Demo
          </Link>
        </div>
      </div>
    </div>
  )
}