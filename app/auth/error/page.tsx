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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Modern header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isWarning ? 'Access Denied' : 'Authentication Error'}
          </h1>
          <p className="text-gray-600">
            {error ? `Error code: ${error}` : 'Unknown error'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center">
          <div className="mb-6">
            {isWarning ? (
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isWarning ? 'Authentication Required' : 'Something went wrong'}
            </h2>
            <p className="text-gray-600">{errorMessage}</p>
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 border border-gray-300"
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