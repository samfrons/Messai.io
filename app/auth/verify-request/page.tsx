'use client';

import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyRequestContent() {
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        {/* LCARS-style header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 w-full rounded-t-lg"></div>
          <div className="bg-gray-900 p-8 border-l-4 border-blue-500">
            <h1 className="text-3xl font-bold text-blue-500 mb-2">CHECK YOUR EMAIL</h1>
            <p className="text-gray-400">Verification link sent</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {provider === 'credentials' ? 'Verify your email' : 'Check your email'}
            </h2>
            <p className="text-gray-400">
              We&apos;ve sent you an email with a verification link. Please check your inbox and click the link to verify your account.
            </p>
          </div>

          <div className="space-y-4 text-sm text-gray-400">
            <p>
              The verification link will expire in <span className="text-white font-medium">24 hours</span>.
            </p>
            <p>
              Didn&apos;t receive the email? Check your spam folder or request a new verification email.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/auth/login"
              className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 border border-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Login
            </Link>
          </div>

          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
            <p className="text-sm text-yellow-400">
              <strong>Note:</strong> You must verify your email before you can access the full MESSAi platform features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <VerifyRequestContent />
    </Suspense>
  );
}