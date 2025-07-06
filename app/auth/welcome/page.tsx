'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Rocket, Beaker, BarChart3, Users, ArrowRight, Sparkles } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // Redirect to onboarding after 5 seconds for new users
    const timer = setTimeout(() => {
      router.push('/onboarding');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Modern header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to MESSAi</h1>
          <p className="text-gray-600 text-lg">
            {session?.user?.name ? `Hello, ${session.user.name}!` : 'Welcome aboard!'} Your journey begins here.
          </p>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Getting Started */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Rocket className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Getting Started</h2>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">▸</span>
                <span>Explore our 13 bioelectrochemical system designs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">▸</span>
                <span>Create your first experiment with AI predictions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">▸</span>
                <span>Visualize systems in interactive 3D</span>
              </li>
            </ul>
          </div>

          {/* Key Features */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Key Features</h2>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <Beaker className="w-5 h-5 text-purple-600 mt-0.5" />
                <span>27 electrode materials database</span>
              </li>
              <li className="flex items-start gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5" />
                <span>Real-time performance predictions</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                <span>Collaborate with researchers worldwide</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What would you like to do first?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/dashboard"
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
            >
              <h3 className="text-lg font-medium text-blue-600 mb-2 group-hover:text-blue-700">
                View Dashboard
              </h3>
              <p className="text-sm text-gray-600">
                See your experiments and system overview
              </p>
            </Link>
            <Link
              href="/"
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
            >
              <h3 className="text-lg font-medium text-purple-600 mb-2 group-hover:text-purple-700">
                Browse Designs
              </h3>
              <p className="text-sm text-gray-600">
                Explore bioelectrochemical systems
              </p>
            </Link>
            <Link
              href="/experiment/new"
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
            >
              <h3 className="text-lg font-medium text-green-600 mb-2 group-hover:text-green-700">
                New Experiment
              </h3>
              <p className="text-sm text-gray-600">
                Start your first research project
              </p>
            </Link>
          </div>
        </div>

        {/* Auto-redirect notice */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center">
          <p className="text-gray-600 mb-4">
            Let's set up your profile to get the most out of MESSAi...
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200"
          >
            Start Setup
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}