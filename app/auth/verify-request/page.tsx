'use client';

import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyRequestContent() {
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Modern header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600">Verification link sent</p>
        </div>

        {/* Content */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {provider === 'credentials' ? 'Verify your email' : 'Check your email'}
            </h2>
            <p className="text-gray-600">
              We've sent you an email with a verification link. Please check your inbox and click the link to verify your account.
            </p>
          </div>

          <div className="space-y-4 text-sm text-gray-600">
            <p>
              The verification link will expire in <span className="text-gray-900 font-medium">24 hours</span>.
            </p>
            <p>
              Didn't receive the email? Check your spam folder or request a new verification email.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/auth/login"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Login
            </Link>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyRequestContent />
    </Suspense>
  );
}