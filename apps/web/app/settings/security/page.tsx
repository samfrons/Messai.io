'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Smartphone, Key, AlertCircle, Check, Loader2, History, MapPin } from 'lucide-react';

export default function SecuritySettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      // Simulate loading user security settings
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [status, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-lcars-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-purple-500 mb-2">TWO-FACTOR AUTHENTICATION</h2>
            <p className="text-gray-400">
              Add an extra layer of security to your account
            </p>
          </div>
          <Shield className="w-8 h-8 text-purple-500" />
        </div>

        {!twoFactorEnabled ? (
          <div>
            <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
              <p className="text-yellow-400 text-sm">
                Two-factor authentication is not currently enabled on your account.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Use an authenticator app</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Use apps like Google Authenticator, Microsoft Authenticator, or Authy to generate time-based codes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Recovery codes</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    You&apos;ll receive backup codes to access your account if you lose your device
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShow2FASetup(true)}
              className="mt-6 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-black font-bold rounded-lcars transition-colors"
            >
              ENABLE TWO-FACTOR
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-green-900/20 border border-green-600 rounded-lg flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <p className="text-green-400">
                Two-factor authentication is enabled on your account.
              </p>
            </div>

            <button
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lcars transition-colors"
            >
              DISABLE TWO-FACTOR
            </button>
          </div>
        )}

        {show2FASetup && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <p className="text-yellow-400 mb-2">🚧 Coming Soon</p>
            <p className="text-sm text-gray-400">
              Two-factor authentication setup will be available in a future update.
            </p>
            <button
              onClick={() => setShow2FASetup(false)}
              className="mt-3 text-sm text-lcars-cyan hover:text-lcars-blue"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Login History */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-purple-500 mb-2">LOGIN HISTORY</h2>
            <p className="text-gray-400">
              Recent login activity on your account
            </p>
          </div>
          <History className="w-8 h-8 text-purple-500" />
        </div>

        <div className="space-y-3">
          {/* Mock login history */}
          {[
            { location: 'San Francisco, CA', device: 'Chrome on MacOS', time: '2 hours ago', current: true },
            { location: 'San Francisco, CA', device: 'MESSAi Mobile App', time: '1 day ago' },
            { location: 'New York, NY', device: 'Firefox on Windows', time: '3 days ago' },
          ].map((login, index) => (
            <div
              key={index}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex items-start justify-between"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">{login.location}</p>
                  <p className="text-sm text-gray-400">{login.device}</p>
                  <p className="text-xs text-gray-500 mt-1">{login.time}</p>
                </div>
              </div>
              {login.current && (
                <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full">
                  Current Session
                </span>
              )}
            </div>
          ))}
        </div>

        <button className="mt-4 text-sm text-lcars-cyan hover:text-lcars-blue">
          View full login history →
        </button>
      </div>

      {/* Security Recommendations */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <h2 className="text-2xl font-bold text-purple-500 mb-6">SECURITY RECOMMENDATIONS</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Use a strong password</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Your password was last changed 45 days ago
                </p>
              </div>
              <Check className="w-5 h-5 text-green-400" />
            </div>
          </div>

          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Verify your email address</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Helps with account recovery
                </p>
              </div>
              {session?.user?.emailVerified ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Enable two-factor authentication</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Significantly improves account security
                </p>
              </div>
              {twoFactorEnabled ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connected Apps */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <h2 className="text-2xl font-bold text-purple-500 mb-6">CONNECTED APPLICATIONS</h2>
        
        <p className="text-gray-400 mb-4">
          No third-party applications have access to your MESSAi account.
        </p>
        
        <p className="text-sm text-gray-500">
          When you connect third-party apps, they&apos;ll appear here and you can manage their permissions.
        </p>
      </div>
    </div>
  );
}