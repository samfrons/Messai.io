'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@messai/ui'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const features = [
    { name: 'Research Intelligence', href: '/features/research-intelligence', description: 'AI-enhanced paper analysis' },
    { name: '3D Modeling Lab', href: '/features/3d-modeling', description: 'Interactive system visualization' },
    { name: 'Parameters Database', href: '/features/parameters', description: 'Comprehensive MESS parameters' },
    { name: 'Performance Predictions', href: '/features/predictions', description: 'AI-powered optimization' },
    { name: 'Experiment Platform', href: '/features/experiments', description: 'Track and analyze experiments' },
  ]

  return (
    <header className="fixed top-0 w-full z-50 glass">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-light tracking-tight">MESSAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="relative group">
              <button className="text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors">
                Features
              </button>
              <div className="absolute left-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                  {features.map((feature) => (
                    <Link
                      key={feature.href}
                      href={feature.href}
                      className="block px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <div className="text-sm font-medium">{feature.name}</div>
                      <div className="text-xs text-muted-foreground">{feature.description}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/research" className="text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors">
              Research
            </Link>
            <Link href="/documentation" className="text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors">
              Documentation
            </Link>
            <Link href="/pricing" className="text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors">
              Pricing
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-slide-up">
            <div className="space-y-1">
              <div className="py-2">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-4 py-2">
                  Features
                </div>
                {features.map((feature) => (
                  <Link
                    key={feature.href}
                    href={feature.href}
                    className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    {feature.name}
                  </Link>
                ))}
              </div>
              <Link href="/research" className="block px-4 py-2 text-sm hover:bg-accent transition-colors">
                Research
              </Link>
              <Link href="/documentation" className="block px-4 py-2 text-sm hover:bg-accent transition-colors">
                Documentation
              </Link>
              <Link href="/pricing" className="block px-4 py-2 text-sm hover:bg-accent transition-colors">
                Pricing
              </Link>
              <div className="pt-4 px-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
                <Button variant="primary" size="sm" className="w-full">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}