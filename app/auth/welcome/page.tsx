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
    // Redirect to dashboard after 10 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* LCARS-style header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-3 w-full rounded-t-lg"></div>
          <div className="bg-gray-900 p-8 border-l-4 border-cyan-500">
            <h1 className="text-4xl font-bold text-cyan-500 mb-2">WELCOME TO MESSAi</h1>
            <p className="text-gray-400 text-lg">
              {session?.user?.name ? `Hello, ${session.user.name}!` : 'Welcome aboard!'} Your journey begins here.
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Getting Started */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <Rocket className="w-6 h-6 text-cyan-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Getting Started</h2>
            </div>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">▸</span>
                <span>Explore our 13 bioelectrochemical system designs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">▸</span>
                <span>Create your first experiment with AI predictions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">▸</span>
                <span>Visualize systems in interactive 3D</span>
              </li>
            </ul>
          </div>

          {/* Key Features */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Key Features</h2>
            </div>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2">
                <Beaker className="w-5 h-5 text-purple-500 mt-0.5" />
                <span>27 electrode materials database</span>
              </li>
              <li className="flex items-start gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500 mt-0.5" />
                <span>Real-time performance predictions</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-5 h-5 text-purple-500 mt-0.5" />
                <span>Collaborate with researchers worldwide</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">What would you like to do first?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/dashboard"
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors group"
            >
              <h3 className="text-lg font-medium text-cyan-400 mb-2 group-hover:text-cyan-300">
                View Dashboard
              </h3>
              <p className="text-sm text-gray-400">
                See your experiments and system overview
              </p>
            </Link>
            <Link
              href="/"
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors group"
            >
              <h3 className="text-lg font-medium text-purple-400 mb-2 group-hover:text-purple-300">
                Browse Designs
              </h3>
              <p className="text-sm text-gray-400">
                Explore bioelectrochemical systems
              </p>
            </Link>
            <Link
              href="/experiment/new"
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors group"
            >
              <h3 className="text-lg font-medium text-green-400 mb-2 group-hover:text-green-300">
                New Experiment
              </h3>
              <p className="text-sm text-gray-400">
                Start your first research project
              </p>
            </Link>
          </div>
        </div>

        {/* Auto-redirect notice */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 text-center">
          <p className="text-gray-400 mb-4">
            You&apos;ll be automatically redirected to your dashboard in a few seconds...
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 py-3 px-6 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}