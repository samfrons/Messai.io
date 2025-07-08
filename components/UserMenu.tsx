'use client';

import Link from 'next/link';
import { useState } from 'react';
import { User, ExternalLink, ChevronDown, Sparkles } from 'lucide-react';
import { getDemoConfig } from '@/lib/demo-mode';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const demoConfig = getDemoConfig();

  // In demo mode, show simplified menu with external links
  if (demoConfig.isDemo) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 bg-opacity-80 rounded-lg px-4 py-2 hover:bg-opacity-100 transition-all shadow-sm"
        >
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">Demo Mode</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You're viewing MESSAi in demo mode
                </p>
              </div>
              
              <div className="p-2">
                <a
                  href={demoConfig.productionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>Create Account</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
                
                <a
                  href={`${demoConfig.productionUrl}/login`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
                
                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <Link
                    href="/literature"
                    className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Research Literature
                  </Link>
                  
                  <Link
                    href="/"
                    className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    System Designs
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Production mode - not used in demo deployment
  return (
    <div className="bg-gray-200 dark:bg-gray-700 bg-opacity-30 rounded-lg px-6 py-2">
      <span className="text-sm">Production Mode</span>
    </div>
  );
}