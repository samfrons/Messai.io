'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, AlertTriangle, Home } from 'lucide-react';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.';
      case 'Verification':
        return 'The verification link has expired or has already been used.';
      case 'OAuthSignin':
        return 'Error occurred while signing in with the OAuth provider.';
      case 'OAuthCallback':
        return 'Error occurred during the OAuth callback.';
      case 'OAuthCreateAccount':
        return 'Could not create account with the OAuth provider.';
      case 'EmailCreateAccount':
        return 'Could not create account with email provider.';
      case 'Callback':
        return 'Error occurred during the authentication callback.';
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account. Please sign in with your original account provider.';
      case 'EmailSignin':
        return 'The email could not be sent. Please try again later.';
      case 'CredentialsSignin':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An unexpected authentication error occurred. Please try again.';
    }
  };

  const errorMessage = getErrorMessage(error);
  const isWarning = error === 'SessionRequired' || error === 'AccessDenied';

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        {/* LCARS-style header */}
        <div className="mb-8">
          <div className={`bg-gradient-to-r ${
            isWarning ? 'from-yellow-500 to-yellow-600' : 'from-red-500 to-red-600'
          } h-2 w-full rounded-t-lg`}></div>
          <div className={`bg-gray-900 p-8 border-l-4 ${
            isWarning ? 'border-yellow-500' : 'border-red-500'
          }`}>
            <h1 className={`text-3xl font-bold mb-2 ${
              isWarning ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {isWarning ? 'ACCESS DENIED' : 'AUTHENTICATION ERROR'}
            </h1>
            <p className="text-gray-400">
              {error ? `Error code: ${error}` : 'Unknown error'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 text-center">
          <div className="mb-6">
            {isWarning ? (
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            <h2 className="text-xl font-bold text-white mb-2">
              {isWarning ? 'Authentication Required' : 'Something went wrong'}
            </h2>
            <p className="text-gray-400">{errorMessage}</p>
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 border border-gray-700"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </Link>
          </div>

          {error === 'OAuthAccountNotLinked' && (
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600 rounded-lg text-left">
              <p className="text-sm text-blue-400">
                <strong>Tip:</strong> To link accounts, sign in with your original provider first, then connect additional providers from your profile settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}