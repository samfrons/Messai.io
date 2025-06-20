import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MESSAi - MFC Research Platform',
  description: 'Track microbial fuel cell experiments and get AI insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-primary">MESSAi</div>
                <div className="ml-2 text-sm text-gray-500">MFC Research Platform</div>
              </div>
              <div className="flex space-x-4">
                <a href="/" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Designs
                </a>
                <a href="/dashboard" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}