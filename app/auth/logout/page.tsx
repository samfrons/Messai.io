'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, Loader2 } from 'lucide-react';

export default function LogoutPage() {
  useEffect(() => {
    // Automatically sign out and redirect to home
    signOut({ callbackUrl: '/' });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        {/* LCARS-style header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 w-full rounded-t-lg"></div>
          <div className="bg-gray-900 p-8 border-l-4 border-orange-500">
            <h1 className="text-3xl font-bold text-orange-500 mb-2">SIGNING OUT</h1>
            <p className="text-gray-400">Please wait...</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <LogOut className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Signing you out...</h2>
            <p className="text-gray-400">
              You are being securely signed out of your MESSAi account.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
}