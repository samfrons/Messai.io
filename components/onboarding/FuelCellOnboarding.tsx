'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface OnboardingStep {
  title: string
  description: string
  target?: string // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Welcome to Fuel Cell Systems',
    description: 'This unified platform allows you to design, simulate, and optimize both microbial and fuel cell systems.',
  },
  {
    title: 'Choose Your Fuel Cell Type',
    description: 'Select from 5 different fuel cell types: PEM, SOFC, PAFC, MCFC, or AFC. Each has unique characteristics and applications.',
    target: '[data-onboarding="fuel-cell-type"]',
    position: 'bottom'
  },
  {
    title: 'Configure Your System',
    description: 'Set parameters like cell count, active area, operating temperature, and pressure. Use the sliders or type exact values.',
    target: '[data-onboarding="system-config"]',
    position: 'right'
  },
  {
    title: 'View 3D Visualization',
    description: 'See your fuel cell stack in 3D. Toggle gas flow and temperature visualization for better understanding.',
    target: '[data-onboarding="3d-view"]',
    position: 'left'
  },
  {
    title: 'Design Control Systems',
    description: 'Configure PID controllers for temperature, pressure, and flow control. Use auto-tuning for optimal parameters.',
    target: '[data-onboarding="control-system"]',
    position: 'top'
  },
  {
    title: 'Optimize Performance',
    description: 'Use advanced algorithms to find the best configuration for your objectives: power, efficiency, cost, or durability.',
    target: '[data-onboarding="optimization"]',
    position: 'top'
  },
  {
    title: 'Compare Systems',
    description: 'Compare multiple fuel cell configurations side-by-side with detailed metrics and visualizations.',
    target: '[data-onboarding="comparison"]',
    position: 'top'
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Use Ctrl+1-7 to quickly switch between views. Press ? anytime to see all available shortcuts.',
  }
]

interface FuelCellOnboardingProps {
  onComplete?: () => void
  className?: string
}

export default function FuelCellOnboarding({ onComplete, className = '' }: FuelCellOnboardingProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has seen onboarding
    const seen = localStorage.getItem('fuelCellOnboardingSeen')
    if (!seen) {
      setIsVisible(true)
    } else {
      setHasSeenOnboarding(true)
    }
  }, [])

  const handleComplete = () => {
    localStorage.setItem('fuelCellOnboardingSeen', 'true')
    setIsVisible(false)
    setHasSeenOnboarding(true)
    onComplete?.()
  }

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const step = onboardingSteps[currentStep]

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={handleSkip}
            />

            {/* Onboarding Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md ${className}`}
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Close button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {step.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>

              {/* Progress */}
              <div className="flex gap-1 mb-6">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index <= currentStep
                        ? 'bg-blue-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    currentStep === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentStep + 1} of {onboardingSteps.length}
                </span>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Help button to restart onboarding */}
      {hasSeenOnboarding && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => {
            setCurrentStep(0)
            setIsVisible(true)
          }}
          className="fixed bottom-4 right-4 w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30"
          title="Show onboarding"
        >
          ?
        </motion.button>
      )}
    </>
  )
}