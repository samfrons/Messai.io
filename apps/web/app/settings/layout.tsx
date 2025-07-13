'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Bell, Shield, Settings as SettingsIcon, ChevronRight } from 'lucide-react';

const settingsNavigation = [
  {
    name: 'Account',
    href: '/settings/account',
    icon: User,
    description: 'Manage your account details and password',
  },
  {
    name: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Configure email and platform notifications',
  },
  {
    name: 'Security',
    href: '/settings/security',
    icon: Shield,
    description: 'Two-factor authentication and security settings',
  },
  {
    name: 'Preferences',
    href: '/settings/preferences',
    icon: SettingsIcon,
    description: 'Theme, language, and display preferences',
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* LCARS-style header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-3 w-full rounded-t-lg"></div>
          <div className="bg-gray-900 p-8 border-l-4 border-purple-500">
            <h1 className="text-4xl font-bold text-purple-500 mb-2">SETTINGS</h1>
            <p className="text-gray-400">Configure your MESSAi account and preferences</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="md:col-span-1">
            <nav className="space-y-2">
              {settingsNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block p-4 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-gray-800 border-purple-500 text-white'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:border-gray-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-500' : ''}`} />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-purple-500' : 'text-gray-600'}`} />
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Links */}
            <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-bold text-gray-400 mb-3">QUICK LINKS</h3>
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="block text-sm text-lcars-cyan hover:text-lcars-blue transition-colors"
                >
                  → Edit Profile
                </Link>
                <Link
                  href="/dashboard"
                  className="block text-sm text-lcars-gold hover:text-lcars-tan transition-colors"
                >
                  → Dashboard
                </Link>
                <Link
                  href="/auth/logout"
                  className="block text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  → Sign Out
                </Link>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}