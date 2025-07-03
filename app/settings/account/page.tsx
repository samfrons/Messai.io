'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, AlertCircle, Check } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  institution: string | null;
  researchArea: string | null;
  bio: string | null;
  role: string;
  emailVerified: Date | null;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export default function AccountSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user');
      if (!res.ok) throw new Error('Failed to fetch user data');
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      setError('Failed to load account data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccess('Password updated successfully');
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-lcars-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <h2 className="text-2xl font-bold text-purple-500 mb-6">ACCOUNT INFORMATION</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-900/20 border border-green-500 rounded-lg flex items-center gap-2 text-green-400">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email Address</label>
            <div className="flex items-center gap-2">
              <p className="text-white">{userData?.email}</p>
              {userData?.emailVerified ? (
                <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full">
                  Verified
                </span>
              ) : (
                <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">
                  Unverified
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Account Type</label>
            <p className="text-white uppercase">{userData?.role || 'USER'}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Member Since</label>
            <p className="text-white">
              {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Last Login</label>
            <p className="text-white">
              {userData?.lastLoginAt ? new Date(userData.lastLoginAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <h2 className="text-2xl font-bold text-purple-500 mb-6">PASSWORD & SECURITY</h2>
        
        {!showPasswordForm ? (
          <div>
            <p className="text-gray-400 mb-4">
              Keep your account secure by using a strong password that you don&apos;t use anywhere else.
            </p>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-black font-bold rounded-lcars transition-colors"
            >
              CHANGE PASSWORD
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-purple-500 focus:outline-none"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-black font-bold rounded-lcars transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                UPDATE PASSWORD
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                  setPasswordError(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lcars transition-colors"
              >
                CANCEL
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Delete Account */}
      <div className="bg-gray-900 p-6 rounded-lg border border-red-900/50">
        <h2 className="text-2xl font-bold text-red-500 mb-4">DANGER ZONE</h2>
        <p className="text-gray-400 mb-4">
          Once you delete your account, there is no going back. All your data will be permanently removed.
        </p>
        <button
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lcars transition-colors"
          onClick={() => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
              // TODO: Implement account deletion
              alert('Account deletion is not yet implemented');
            }
          }}
        >
          DELETE ACCOUNT
        </button>
      </div>
    </div>
  );
}