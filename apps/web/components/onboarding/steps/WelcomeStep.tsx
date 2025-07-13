import { Rocket, Beaker, BarChart3, Users } from 'lucide-react';
import { OnboardingData } from '../OnboardingWizard';

interface WelcomeStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function WelcomeStep({ data }: WelcomeStepProps) {
  return (
    <div className="text-center">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-lcars-gold mb-4">WELCOME TO MESSAi</h1>
        <p className="text-xl text-gray-400">
          Let&apos;s get you set up in just a few minutes
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Beaker className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">13 System Designs</h3>
            <p className="text-sm text-gray-400">
              Explore bioelectrochemical systems from lab to industrial scale
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">AI Predictions</h3>
            <p className="text-sm text-gray-400">
              Get real-time performance predictions for your experiments
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Rocket className="w-6 h-6 text-lcars-gold" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">3D Visualization</h3>
            <p className="text-sm text-gray-400">
              Interactive 3D models of all system designs
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-lcars-pink" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Collaborate</h3>
            <p className="text-sm text-gray-400">
              Connect with researchers worldwide
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-300">
          This quick setup will help us personalize your experience and connect you with relevant research opportunities.
        </p>
      </div>
    </div>
  );
}