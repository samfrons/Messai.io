import { Bell, Mail, Sun, Moon, Monitor, Ruler } from 'lucide-react';
import { OnboardingData } from '../OnboardingWizard';

interface PreferencesStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export function PreferencesStep({ data, updateData }: PreferencesStepProps) {
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-lcars-pink mb-2">Set Your Preferences</h2>
        <p className="text-gray-400">
          Customize how MESSAi works for you
        </p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-lcars-pink" />
            Notifications
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={data.emailNotifications}
                onChange={(e) => updateData({ emailNotifications: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-pink-500 focus:ring-pink-500"
              />
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive important updates about your experiments</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={data.experimentAlerts}
                onChange={(e) => updateData({ experimentAlerts: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-pink-500 focus:ring-pink-500"
              />
              <div>
                <p className="text-white font-medium">Experiment Alerts</p>
                <p className="text-sm text-gray-400">Get notified when experiments complete or need attention</p>
              </div>
            </label>
          </div>
        </div>

        {/* Theme */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-lcars-pink" />
            Appearance
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            <label
              className={`p-4 bg-gray-800 rounded-lg border-2 cursor-pointer transition-all text-center ${
                data.theme === 'dark'
                  ? 'border-pink-500 bg-pink-900/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={data.theme === 'dark'}
                onChange={(e) => updateData({ theme: e.target.value as 'dark' | 'light' | 'auto' })}
                className="sr-only"
              />
              <Moon className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-white font-medium">Dark</p>
              <p className="text-xs text-gray-400 mt-1">LCARS Classic</p>
            </label>

            <label
              className={`p-4 bg-gray-800 rounded-lg border-2 cursor-pointer transition-all text-center ${
                data.theme === 'light'
                  ? 'border-pink-500 bg-pink-900/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="light"
                checked={data.theme === 'light'}
                onChange={(e) => updateData({ theme: e.target.value as 'dark' | 'light' | 'auto' })}
                className="sr-only"
              />
              <Sun className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-white font-medium">Light</p>
              <p className="text-xs text-gray-400 mt-1">Bright mode</p>
            </label>

            <label
              className={`p-4 bg-gray-800 rounded-lg border-2 cursor-pointer transition-all text-center ${
                data.theme === 'auto'
                  ? 'border-pink-500 bg-pink-900/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="auto"
                checked={data.theme === 'auto'}
                onChange={(e) => updateData({ theme: e.target.value as 'dark' | 'light' | 'auto' })}
                className="sr-only"
              />
              <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-white font-medium">System</p>
              <p className="text-xs text-gray-400 mt-1">Auto-detect</p>
            </label>
          </div>
        </div>

        {/* Units */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-lcars-pink" />
            Units & Measurements
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`p-4 bg-gray-800 rounded-lg border-2 cursor-pointer transition-all ${
                data.units === 'metric'
                  ? 'border-pink-500 bg-pink-900/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="units"
                value="metric"
                checked={data.units === 'metric'}
                onChange={(e) => updateData({ units: e.target.value as 'metric' | 'imperial' })}
                className="sr-only"
              />
              <p className="text-white font-medium">Metric</p>
              <p className="text-sm text-gray-400 mt-1">Celsius, meters, liters</p>
            </label>

            <label
              className={`p-4 bg-gray-800 rounded-lg border-2 cursor-pointer transition-all ${
                data.units === 'imperial'
                  ? 'border-pink-500 bg-pink-900/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="units"
                value="imperial"
                checked={data.units === 'imperial'}
                onChange={(e) => updateData({ units: e.target.value as 'metric' | 'imperial' })}
                className="sr-only"
              />
              <p className="text-white font-medium">Imperial</p>
              <p className="text-sm text-gray-400 mt-1">Fahrenheit, feet, gallons</p>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}