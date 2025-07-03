'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown, Bell, Sparkles } from 'lucide-react';

interface UserProfile {
  avatar: string | null;
  completedOnboarding: boolean;
  interests: string[];
}

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile({
          avatar: data.avatar,
          completedOnboarding: data.completedOnboarding,
          interests: data.interests || [],
        });
      }
    } catch (err) {
      // Ignore errors
    }
  };

  if (status === 'loading') {
    return (
      <div className="bg-lcars-gray bg-opacity-30 rounded-lcars px-6 py-2 animate-pulse">
        <div className="h-5 w-20"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex gap-2">
        <Link
          href="/auth/login"
          className="bg-lcars-cyan hover:bg-lcars-blue transition-colors rounded-lcars px-6 py-2 text-lcars-black font-bold uppercase"
        >
          Login
        </Link>
        <Link
          href="/auth/signup"
          className="bg-lcars-gold hover:bg-lcars-tan transition-colors rounded-lcars px-6 py-2 text-lcars-black font-bold uppercase"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-lcars-purple hover:bg-lcars-pink transition-colors rounded-lcars px-4 py-2 text-lcars-black font-bold uppercase flex items-center gap-2 relative"
      >
        {/* Profile Picture or Icon */}
        {profile?.avatar ? (
          <img
            src={profile.avatar}
            alt={session.user.name || 'Profile'}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <User className="w-5 h-5" />
        )}
        
        <span className="max-w-[150px] truncate">{session.user.name || session.user.email}</span>
        
        {/* Notification Badge */}
        {hasNewNotifications && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        )}
        
        {/* Onboarding Badge */}
        {profile && !profile.completedOnboarding && (
          <Sparkles className="w-4 h-4 text-lcars-gold" />
        )}
        
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-lcars-purple rounded-lcars overflow-hidden z-50">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-start gap-3">
                {/* Profile Picture in Menu */}
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={session.user.name || 'Profile'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                
                <div className="flex-1">
                  <p className="text-white font-medium truncate">{session.user.name || 'Researcher'}</p>
                  <p className="text-sm text-gray-400 truncate">{session.user.email}</p>
                  <p className="text-xs text-lcars-purple mt-1 uppercase">{session.user.role}</p>
                </div>
              </div>
              
              {/* Onboarding Progress */}
              {profile && !profile.completedOnboarding && (
                <Link
                  href="/onboarding"
                  className="mt-3 flex items-center gap-2 p-2 bg-gold-900/20 border border-lcars-gold rounded text-lcars-gold text-sm hover:bg-gold-900/30 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Sparkles className="w-4 h-4" />
                  Complete your profile setup
                </Link>
              )}
            </div>

            <div className="p-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded transition-colors relative"
                onClick={() => setIsOpen(false)}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                {hasNewNotifications && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Link>
              
              <Link
                href="/settings"
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
              
              {/* Profile Stats */}
              {profile && (
                <div className="px-3 py-2 border-t border-gray-800 mt-2">
                  <p className="text-xs text-gray-500 mb-1">Research Interests</p>
                  <p className="text-sm text-gray-300">
                    {profile.interests.length > 0
                      ? `${profile.interests.length} topics selected`
                      : 'No interests selected'}
                  </p>
                </div>
              )}
              
              <hr className="my-2 border-gray-800" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-gray-800 rounded transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}