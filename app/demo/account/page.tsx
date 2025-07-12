import Link from 'next/link'

export default function DemoAccountPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎭</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Demo Account
            </h1>
            <p className="text-gray-600">
              Account features are not available in demo mode
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">What You Can Do</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Browse 2,800+ research papers
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Explore 3D system designs
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  View AI predictions and insights
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Test all platform features
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">With an Account</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">⭐</span>
                  Save experiments and results
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">⭐</span>
                  Personal dashboard and profile
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">⭐</span>
                  Export data and reports
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">⭐</span>
                  Collaborate with teams
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">
              Ready for the Full Experience?
            </h3>
            <p className="text-gray-700 mb-4">
              Create a free account on messai.io to unlock all features and start tracking your research.
            </p>
            <a
              href="https://messai.io/auth/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Sign Up on messai.io →
            </a>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Platform
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}