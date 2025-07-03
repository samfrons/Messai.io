'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No verification token provided');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard?verified=true');
          }, 3000);
        } else {
          setStatus('error');
          setError(data.error || 'Verification failed');
        }
      } catch (err) {
        setStatus('error');
        setError('An unexpected error occurred');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        {/* LCARS-style header */}
        <div className="mb-8">
          <div className={`bg-gradient-to-r ${
            status === 'success' ? 'from-green-500 to-green-600' : 
            status === 'error' ? 'from-red-500 to-red-600' : 
            'from-blue-500 to-blue-600'
          } h-2 w-full rounded-t-lg`}></div>
          <div className={`bg-gray-900 p-8 border-l-4 ${
            status === 'success' ? 'border-green-500' : 
            status === 'error' ? 'border-red-500' : 
            'border-blue-500'
          }`}>
            <h1 className={`text-3xl font-bold mb-2 ${
              status === 'success' ? 'text-green-500' : 
              status === 'error' ? 'text-red-500' : 
              'text-blue-500'
            }`}>
              EMAIL VERIFICATION
            </h1>
            <p className="text-gray-400">
              {status === 'loading' && 'Verifying your email...'}
              {status === 'success' && 'Verification successful!'}
              {status === 'error' && 'Verification failed'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Verifying your email...</h2>
              <p className="text-gray-400">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-gray-400 mb-4">
                Your email has been successfully verified. You will be redirected to the dashboard shortly.
              </p>
              <div className="animate-pulse">
                <div className="h-2 bg-green-500 rounded-full"></div>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  The verification link may have expired or is invalid.
                </p>
                <Link
                  href="/auth/login"
                  className="inline-block py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}