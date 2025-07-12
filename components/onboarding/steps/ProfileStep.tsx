import { User, Briefcase, BookOpen, FileText } from 'lucide-react';
import { OnboardingData } from '../OnboardingWizard';

interface ProfileStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function ProfileStep({ data, updateData }: ProfileStepProps) {
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-lcars-cyan mb-2">Tell us about yourself</h2>
        <p className="text-gray-400">
          This helps us connect you with relevant research and collaborators
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <User className="w-4 h-4" />
            Your Name
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder="Dr. Jane Smith"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lcars-cyan focus:outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Briefcase className="w-4 h-4" />
            Institution or Organization
          </label>
          <input
            type="text"
            value={data.institution}
            onChange={(e) => updateData({ institution: e.target.value })}
            placeholder="Stanford University"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lcars-cyan focus:outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <BookOpen className="w-4 h-4" />
            Primary Research Area
          </label>
          <input
            type="text"
            value={data.researchArea}
            onChange={(e) => updateData({ researchArea: e.target.value })}
            placeholder="Microbial Electrochemistry"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lcars-cyan focus:outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <FileText className="w-4 h-4" />
            Areas of Expertise
          </label>
          <textarea
            value={data.expertise}
            onChange={(e) => updateData({ expertise: e.target.value })}
            placeholder="Bioelectrochemical systems, wastewater treatment, renewable energy..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lcars-cyan focus:outline-none resize-none"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <p className="text-sm text-blue-400">
          💡 Tip: Complete profiles get 3x more collaboration requests
        </p>
      </div>
    </div>
  );
}