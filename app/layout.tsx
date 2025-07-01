import type { Metadata } from 'next'
import { Antonio } from 'next/font/google'
import './globals.css'

const antonio = Antonio({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-antonio'
})

export const metadata: Metadata = {
  title: 'LCARS | MESSAi MFC Research Platform',
  description: 'Starfleet Microbial Fuel Cell Research Database',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={antonio.variable}>
      <body className="bg-lcars-black font-lcars">
        <div className="min-h-screen flex flex-col">
          {/* LCARS Header Bar */}
          <header className="h-24 flex items-stretch gap-2 p-2">
            {/* Left section */}
            <div className="flex items-stretch gap-2 flex-1">
              <div className="w-40 bg-lcars-orange rounded-l-lcars-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-lcars-black">LCARS</span>
              </div>
              <div className="flex-1 bg-lcars-orange flex items-center px-6">
                <h1 className="text-3xl font-bold text-lcars-black uppercase tracking-wider">
                  MESSAi MFC Research Platform
                </h1>
              </div>
              <div className="w-4 bg-lcars-orange" />
            </div>

            {/* Right section with navigation */}
            <div className="flex items-stretch gap-2">
              <a href="/" className="bg-lcars-gold hover:bg-lcars-tan transition-colors rounded-lcars px-8 flex items-center text-lcars-black font-bold uppercase">
                Home
              </a>
              <a href="/designs" className="bg-lcars-cyan hover:bg-lcars-blue transition-colors rounded-lcars px-8 flex items-center text-lcars-black font-bold uppercase">
                Designs
              </a>
              <a href="/dashboard" className="bg-lcars-purple hover:bg-lcars-pink transition-colors rounded-lcars px-8 flex items-center text-lcars-black font-bold uppercase">
                Dashboard
              </a>
              <a href="/algal-fuel-cell" className="bg-lcars-pink hover:bg-lcars-purple transition-colors rounded-lcars px-8 flex items-center text-lcars-black font-bold uppercase">
                Algal 3D
              </a>
              <div className="w-32 bg-lcars-red rounded-r-lcars-lg flex items-center justify-center">
                <span className="text-sm font-bold text-lcars-black">47-1701</span>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <div className="flex-1 flex">
            {/* Left sidebar */}
            <aside className="w-48 p-2">
              <div className="h-full flex flex-col gap-2">
                <div className="h-16 bg-lcars-purple rounded-tr-lcars-lg" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-12 bg-lcars-cyan rounded-r-lcars animate-lcars-blink" />
                  <div className="h-12 bg-lcars-blue rounded-r-lcars" />
                  <div className="h-12 bg-lcars-pink rounded-r-lcars" />
                  <div className="h-12 bg-lcars-gold rounded-r-lcars" />
                </div>
                <div className="h-24 bg-lcars-orange rounded-br-lcars-lg" />
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-4">
              <div className="bg-lcars-black border-2 border-lcars-orange rounded-lcars-lg h-full overflow-auto">
                {children}
              </div>
            </main>

            {/* Right sidebar */}
            <aside className="w-48 p-2">
              <div className="h-full flex flex-col gap-2">
                <div className="h-16 bg-lcars-gold rounded-tl-lcars-lg" />
                <div className="flex-1 flex flex-col justify-end gap-2">
                  <div className="h-8 bg-lcars-gray bg-opacity-30 rounded-l-lcars" />
                  <div className="h-8 bg-lcars-gray bg-opacity-30 rounded-l-lcars" />
                  <div className="h-8 bg-lcars-gray bg-opacity-30 rounded-l-lcars" />
                </div>
                <div className="h-32 bg-lcars-cyan rounded-bl-lcars-lg flex items-end justify-center pb-4">
                  <span className="text-xs text-lcars-black font-bold">SYS 5443</span>
                </div>
              </div>
            </aside>
          </div>

          {/* Bottom status bar */}
          <footer className="h-16 flex items-stretch gap-2 p-2">
            <div className="flex-1 bg-lcars-purple rounded-lcars flex items-center px-6">
              <span className="text-lcars-black font-bold uppercase">Status: Operational</span>
            </div>
            <div className="w-48 bg-lcars-orange rounded-lcars flex items-center justify-center">
              <span className="text-lcars-black font-bold">Stardate {new Date().getFullYear()}.{Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)}</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}