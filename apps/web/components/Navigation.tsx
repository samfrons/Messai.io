'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Research', href: '/research', badge: 'Enhanced' },
  { name: 'Parameters', href: '/parameters', badge: 'Enhanced' },
  { name: 'Models', href: '/models' },
  { name: 'Experiments', href: '/experiments' },
  { name: 'Tools', href: '/tools' },
]

export default function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 z-50 w-full bg-cream border-b border-gray-200">
      <div className="container-grid">
        <div className="grid-12 py-4">
          <div className="col-span-12 flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-serif text-black">
                MESSAi
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex sm:items-center sm:space-x-6">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href === '/research' && pathname === '/research/enhanced') ||
                  (item.href === '/parameters' && pathname === '/parameters/enhanced')
                
                return (
                  <Link
                    key={item.name}
                    href={
                      item.href === '/research' ? '/research/enhanced' : 
                      item.href === '/parameters' ? '/parameters/enhanced' :
                      item.href
                    }
                    className={`nav-link ${
                      isActive
                        ? 'text-black'
                        : 'text-black opacity-60'
                    }`}
                  >
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-black/10 text-black rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Right side items */}
            <div className="hidden sm:flex sm:items-center">
              {session?.user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-black opacity-60">{session.user.email}</span>
                  <Link
                    href="/settings"
                    className="nav-link text-black"
                  >
                    Settings
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="nav-link text-black"
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-black hover:bg-black/5 transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden bg-cream border-t border-gray-200`}>
        <div className="pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/research' && pathname === '/research/enhanced') ||
              (item.href === '/parameters' && pathname === '/parameters/enhanced')
            
            return (
              <Link
                key={item.name}
                href={
                  item.href === '/research' ? '/research/enhanced' : 
                  item.href === '/parameters' ? '/parameters/enhanced' :
                  item.href
                }
                className={`block pl-3 pr-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-black/5 text-black'
                    : 'text-black opacity-60 hover:bg-black/5 hover:opacity-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  {item.name}
                  {item.badge && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-black/10 text-black rounded">
                      {item.badge}
                    </span>
                  )}
                </span>
              </Link>
            )
          })}
        </div>
        {session?.user && (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4">
              <div className="text-base font-medium text-black">{session.user.name}</div>
              <div className="text-sm font-medium text-black opacity-60">{session.user.email}</div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm font-medium text-black opacity-60 hover:opacity-100 hover:bg-black/5 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}