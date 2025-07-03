'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/auth/validation';
import { Lock, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
    },
  });

  const password = watch('password');

  useEffect(() => {
    if (password) {
      setPasswordStrength({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
      });
    }
  }, [password]);

  useEffect(() => {
    if (!token) {
      setError('No reset token provided. Please request a new password reset.');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'An error occurred');
      } else {
        setIsSuccess(true);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-md">
          {/* LCARS-style header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 w-full rounded-t-lg"></div>
            <div className="bg-gray-900 p-8 border-l-4 border-green-500">
              <h1 className="text-3xl font-bold text-green-500 mb-2">PASSWORD RESET</h1>
              <p className="text-gray-400">Success!</p>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Password Reset Successful</h2>
            <p className="text-gray-400 mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <Link
              href="/auth/login"
              className="inline-block py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Invalid Reset Link</h2>
            <p className="text-gray-400 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-block py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        {/* LCARS-style header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 w-full rounded-t-lg"></div>
          <div className="bg-gray-900 p-8 border-l-4 border-purple-500">
            <h1 className="text-3xl font-bold text-purple-500 mb-2">RESET PASSWORD</h1>
            <p className="text-gray-400">Create a new password</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register('token')} />

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  {...register('password')}
                  type="password"
                  id="password"
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
              {password && (
                <div className="mt-2 space-y-1 text-xs">
                  <div className={passwordStrength.length ? 'text-green-400' : 'text-gray-500'}>
                    ✓ At least 8 characters
                  </div>
                  <div className={passwordStrength.uppercase ? 'text-green-400' : 'text-gray-500'}>
                    ✓ One uppercase letter
                  </div>
                  <div className={passwordStrength.lowercase ? 'text-green-400' : 'text-gray-500'}>
                    ✓ One lowercase letter
                  </div>
                  <div className={passwordStrength.number ? 'text-green-400' : 'text-gray-500'}>
                    ✓ One number
                  </div>
                  <div className={passwordStrength.special ? 'text-green-400' : 'text-gray-500'}>
                    ✓ One special character
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  id="confirmPassword"
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Remember your password?{' '}
            <Link
              href="/auth/login"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}