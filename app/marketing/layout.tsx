/**
 * MESSAi Marketing Layout
 * Professional layout for the public website with bio-inspired design
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeProvider } from '@/hooks/useTheme'
import ThemeSelector from '@/components/marketing/ThemeSelector'

interface MarketingLayoutProps {
  children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Research', href: '/research', description: '3,721 verified papers' },
    { name: 'Platform', href: '/marketing/platform', description: 'Interactive design tools' },
    { name: 'Industries', href: '/marketing/industries', description: 'Real-world applications' },
    { name: 'Demo', href: '/demo', description: 'Try it now' },
  ]

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white">
        {/* Professional Navigation */}
        <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Elegant Logo */}
              <Link href="/marketing" className="flex items-center space-x-3 group">
                <div className="relative">
                  {/* Bio-inspired logo with subtle animation */}
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-teal-400 to-green-400 rounded-lg opacity-0 group-hover:opacity-20 animate-pulse"></div>
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                    MESSAi
                  </span>
                  <div className="text-xs text-gray-500 font-medium tracking-wider -mt-1">
                    MICROBIAL SYSTEMS
                  </div>
                </div>
              </Link>
              
              {/* Clean Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      pathname.startsWith(item.href)
                        ? 'text-teal-600'
                        : 'text-gray-700 hover:text-teal-600'
                    }`}
                  >
                    <span className="relative z-10">{item.name}</span>
                    <div className="text-xs text-gray-500 absolute top-8 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {item.description}
                    </div>
                    {/* Active indicator with bio-inspired design */}
                    {pathname.startsWith(item.href) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-green-500 rounded-full"></div>
                    )}
                  </Link>
                ))}
                
                {/* CTA Button */}
                <Link
                  href="/demo"
                  className="ml-4 px-4 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-white text-sm font-medium rounded-lg hover:from-teal-700 hover:to-green-700 hover:shadow-lg hover:shadow-teal-200/50 transition-all duration-300"
                >
                  Try Platform
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative">
          {children}
        </main>

        {/* Theme Selector for Easy Customization */}
        <ThemeSelector />

        {/* Professional Footer */}
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Column */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-green-600 rounded-lg"></div>
                  <div>
                    <span className="text-xl font-bold text-gray-900">MESSAi</span>
                    <div className="text-xs text-gray-500 font-medium tracking-wider -mt-1">
                      MICROBIAL SYSTEMS PLATFORM
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 max-w-md leading-relaxed">
                  The world's first comprehensive platform for bioelectrochemical research and development. 
                  From scientific discovery to commercial deployment.
                </p>
                <div className="mt-6 flex space-x-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-teal-600">3,721</span> Research Papers
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-green-600">27+</span> Materials
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-pink-600">AI</span> Powered
                  </div>
                </div>
              </div>

              {/* Platform Links */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Platform</h3>
                <ul className="space-y-3">
                  <li><Link href="/research" className="text-gray-600 hover:text-teal-600 transition-colors">Research Database</Link></li>
                  <li><Link href="/demo" className="text-gray-600 hover:text-teal-600 transition-colors">Interactive Demo</Link></li>
                  <li><Link href="/marketing/platform" className="text-gray-600 hover:text-teal-600 transition-colors">Design Tools</Link></li>
                  <li><Link href="/systems" className="text-gray-600 hover:text-teal-600 transition-colors">System Catalog</Link></li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Company</h3>
                <ul className="space-y-3">
                  <li><Link href="/marketing/about" className="text-gray-600 hover:text-teal-600 transition-colors">About</Link></li>
                  <li><Link href="/marketing/industries" className="text-gray-600 hover:text-teal-600 transition-colors">Industries</Link></li>
                  <li><Link href="/marketing/contact" className="text-gray-600 hover:text-teal-600 transition-colors">Contact</Link></li>
                  <li><Link href="/marketing/pricing" className="text-gray-600 hover:text-teal-600 transition-colors">Pricing</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-500">
                © 2025 MESSAi. Unlocking the magic of microbial systems.
              </div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-teal-600 transition-colors">Privacy</Link>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-teal-600 transition-colors">Terms</Link>
                <Link href="/marketing/contact" className="text-sm text-gray-500 hover:text-teal-600 transition-colors">Support</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}