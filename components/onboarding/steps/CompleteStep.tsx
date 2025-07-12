import { CheckCircle, Rocket, BookOpen, Users, FlaskConical } from 'lucide-react';
import { OnboardingData } from '../OnboardingWizard';

interface CompleteStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function CompleteStep({ data }: CompleteStepProps) {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        
        <h2 className="text-3xl font-bold text-green-500 mb-4">
          You&apos;re All Set, {data.name || 'Researcher'}!
        </h2>
        <p className="text-xl text-gray-400">
          Welcome to the MESSAi research community
        </p>
      </div>

      <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">What happens next?</h3>
        
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <FlaskConical className="w-4 h-4 text-cyan-500" />
            </div>
            <div>
              <p className="text-white font-medium">Start Your First Experiment</p>
              <p className="text-sm text-gray-400">
                Choose from 13 bioelectrochemical system designs and get AI-powered predictions
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-white font-medium">Explore the Knowledge Base</p>
              <p className="text-sm text-gray-400">
                Access research papers, tutorials, and best practices
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="w-4 h-4 text-lcars-gold" />
            </div>
            <div>
              <p className="text-white font-medium">Connect with Researchers</p>
              <p className="text-sm text-gray-400">
                Find collaborators working on similar projects
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-green-900/20 border border-green-700 rounded-lg">
        <p className="text-green-400 flex items-center justify-center gap-2">
          <Rocket className="w-5 h-5" />
          Click &quot;Complete Setup&quot; below to launch your dashboard!
        </p>
      </div>
    </div>
  );
}