import { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { OnboardingData } from '../OnboardingWizard';

interface InterestsStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const SUGGESTED_INTERESTS = [
  'Microbial Fuel Cells',
  'Bioelectrochemistry',
  'Wastewater Treatment',
  'Renewable Energy',
  'Bioremediation',
  'Hydrogen Production',
  'Carbon Capture',
  'Biosensors',
  'Synthetic Biology',
  'Environmental Engineering',
  'Sustainable Technology',
  'Electroactive Bacteria',
];

export function InterestsStep({ data, updateData }: InterestsStepProps) {
  const [customInterest, setCustomInterest] = useState('');

  const addInterest = (interest: string) => {
    if (!data.interests.includes(interest)) {
      updateData({ interests: [...data.interests, interest] });
    }
  };

  const removeInterest = (interest: string) => {
    updateData({ interests: data.interests.filter(i => i !== interest) });
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !data.interests.includes(customInterest.trim())) {
      addInterest(customInterest.trim());
      setCustomInterest('');
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-lcars-purple mb-2">Research Interests</h2>
        <p className="text-gray-400">
          Select topics you&apos;re interested in to receive relevant updates
        </p>
      </div>

      {/* Selected Interests */}
      {data.interests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-3">SELECTED INTERESTS ({data.interests.length})</h3>
          <div className="flex flex-wrap gap-2">
            {data.interests.map((interest) => (
              <span
                key={interest}
                className="px-4 py-2 bg-purple-900/30 text-purple-400 rounded-full text-sm flex items-center gap-2 border border-purple-700"
              >
                {interest}
                <button
                  onClick={() => removeInterest(interest)}
                  className="text-purple-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Interests */}
      <div className="mb-6">
        <h3 className="text-sm text-gray-400 mb-3">SUGGESTED TOPICS</h3>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_INTERESTS.filter(i => !data.interests.includes(i)).map((interest) => (
            <button
              key={interest}
              onClick={() => addInterest(interest)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm flex items-center gap-2 border border-gray-700 hover:border-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Interest Input */}
      <div>
        <h3 className="text-sm text-gray-400 mb-3">ADD CUSTOM INTEREST</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
            placeholder="Type your interest..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lcars-purple focus:outline-none"
          />
          <button
            onClick={addCustomInterest}
            disabled={!customInterest.trim()}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-black font-bold rounded-lcars transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ADD
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
        <p className="text-sm text-purple-400 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Select at least 3 interests to get personalized recommendations
        </p>
      </div>
    </div>
  );
}