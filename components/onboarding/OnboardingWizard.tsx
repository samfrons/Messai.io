'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { WelcomeStep } from './steps/WelcomeStep';
import { ProfileStep } from './steps/ProfileStep';
import { InterestsStep } from './steps/InterestsStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { CompleteStep } from './steps/CompleteStep';

export interface OnboardingData {
  name: string;
  institution: string;
  researchArea: string;
  expertise: string;
  interests: string[];
  emailNotifications: boolean;
  experimentAlerts: boolean;
  units: 'metric' | 'imperial';
  theme: 'dark' | 'light' | 'auto';
}

const STEPS = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'profile', title: 'Profile', component: ProfileStep },
  { id: 'interests', title: 'Interests', component: InterestsStep },
  { id: 'preferences', title: 'Preferences', component: PreferencesStep },
  { id: 'complete', title: 'Complete', component: CompleteStep },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState<OnboardingData>({
    name: '',
    institution: '',
    researchArea: '',
    expertise: '',
    interests: [],
    emailNotifications: true,
    experimentAlerts: true,
    units: 'metric',
    theme: 'dark',
  });

  useEffect(() => {
    // Check onboarding status on mount
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const res = await fetch('/api/user/onboarding');
      if (res.ok) {
        const { onboardingStep, completedOnboarding } = await res.json();
        if (completedOnboarding) {
          router.push('/dashboard');
        } else {
          setCurrentStep(onboardingStep);
        }
      }
    } catch (err) {
      // Ignore errors and continue with onboarding
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      await updateOnboardingProgress(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Update user profile
      await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          institution: data.institution,
          researchArea: data.researchArea,
        }),
      });

      // Update user profile data
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertise: data.expertise,
          interests: data.interests,
        }),
      });

      // Update user settings
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifications: data.emailNotifications,
          experimentAlerts: data.experimentAlerts,
          units: data.units,
          theme: data.theme,
        }),
      });

      // Mark onboarding as complete
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: STEPS.length,
          completed: true,
        }),
      });

      // Redirect to dashboard
      router.push('/dashboard?onboarding=complete');
    } catch (err) {
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboardingProgress = async (step: number) => {
    try {
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step }),
      });
    } catch (err) {
      // Ignore errors for progress updates
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-black p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    index < currentStep
                      ? 'bg-green-500 text-black'
                      : index === currentStep
                      ? 'bg-lcars-gold text-black'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 w-full transition-colors ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-800'
                    }`}
                    style={{ width: '60px' }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`text-center ${
                  index === currentStep ? 'text-lcars-gold' : 'text-gray-500'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <CurrentStepComponent
            data={data}
            updateData={updateData}
          />

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lcars transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                BACK
              </button>
            )}
            
            <div className="ml-auto">
              {isLastStep ? (
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lcars transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      COMPLETE SETUP
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-lcars-gold hover:bg-lcars-tan text-black font-bold rounded-lcars transition-colors"
                >
                  NEXT
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Skip Option */}
        {currentStep < STEPS.length - 1 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-400"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}