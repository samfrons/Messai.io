'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/auth/validation';
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
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
              <h1 className="text-3xl font-bold text-green-500 mb-2">EMAIL SENT</h1>
              <p className="text-gray-400">Check your inbox</p>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Password Reset Email Sent</h2>
            <p className="text-gray-400 mb-6">
              If an account exists with that email address, we've sent password reset instructions.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              The reset link will expire in 24 hours for security reasons.
            </p>
            <Link
              href="/auth/login"
              className="inline-block py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Back to Login
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
            <h1 className="text-3xl font-bold text-purple-500 mb-2">FORGOT PASSWORD</h1>
            <p className="text-gray-400">Reset your account password</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
          <p className="text-gray-400 mb-6">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="researcher@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
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
                  Sending reset email...
                </>
              ) : (
                'Send Reset Email'
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <Link
              href="/auth/login"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}