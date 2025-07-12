import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MESSAi - Microbial Electrochemical Systems AI Platform',
  description: 'Clean architecture foundation for bioelectrochemical systems research and development',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">MESSAi</h1>
                <span className="ml-2 text-sm text-gray-500">Clean Architecture</span>
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  )
}