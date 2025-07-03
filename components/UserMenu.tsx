'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

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
        className="bg-lcars-purple hover:bg-lcars-pink transition-colors rounded-lcars px-6 py-2 text-lcars-black font-bold uppercase flex items-center gap-2"
      >
        <User className="w-4 h-4" />
        <span className="max-w-[150px] truncate">{session.user.name || session.user.email}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-lcars-purple rounded-lcars overflow-hidden z-50">
            <div className="p-4 border-b border-gray-800">
              <p className="text-sm text-gray-400">Signed in as</p>
              <p className="text-white font-medium truncate">{session.user.email}</p>
              <p className="text-xs text-lcars-purple mt-1 uppercase">{session.user.role}</p>
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
                href="/settings"
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
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