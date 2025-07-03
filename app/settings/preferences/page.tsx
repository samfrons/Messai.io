'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, AlertCircle, Check, Monitor, Sun, Moon, Globe, Ruler } from 'lucide-react';

interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  experimentAlerts: boolean;
  collaborationRequests: boolean;
  newsletter: boolean;
  theme: string;
  units: string;
  language: string;
  dashboardLayout: any;
}

export default function PreferencesSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    theme: 'dark',
    units: 'metric',
    language: 'en',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/user/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings(data);
      setFormData({
        theme: data.theme,
        units: data.units,
        language: data.language,
      });
    } catch (err) {
      setError('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      setSuccess('Preferences updated successfully');
      await fetchSettings();

      // Apply theme change immediately
      if (formData.theme === 'light') {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-lcars-gold animate-spin" />
      </div>
    );
  }

  const themes = [
    { value: 'dark', label: 'Dark (LCARS Classic)', icon: Moon, description: 'The classic LCARS dark theme' },
    { value: 'light', label: 'Light', icon: Sun, description: 'Light theme for bright environments' },
    { value: 'auto', label: 'System', icon: Monitor, description: 'Match your system preferences' },
  ];

  const unitSystems = [
    { value: 'metric', label: 'Metric', description: 'Celsius, meters, liters' },
    { value: 'imperial', label: 'Imperial', description: 'Fahrenheit, feet, gallons' },
  ];

  const languages = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'es', label: 'Spanish', flag: '🇪🇸' },
    { value: 'fr', label: 'French', flag: '🇫🇷' },
    { value: 'de', label: 'German', flag: '🇩🇪' },
    { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
    { value: 'ja', label: 'Japanese', flag: '🇯🇵' },
  ];

  return (
    <div className="space-y-6">
      {/* Display Preferences */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <h2 className="text-2xl font-bold text-purple-500 mb-6">DISPLAY PREFERENCES</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-900/20 border border-green-500 rounded-lg flex items-center gap-2 text-green-400">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Theme Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-white mb-4">Theme</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {themes.map((theme) => {
              const Icon = theme.icon;
              return (
                <label
                  key={theme.value}
                  className={`p-4 bg-gray-800 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.theme === theme.value
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={theme.value}
                    checked={formData.theme === theme.value}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${formData.theme === theme.value ? 'text-purple-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-white font-medium">{theme.label}</p>
                      <p className="text-sm text-gray-400 mt-1">{theme.description}</p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Dashboard Layout */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Dashboard Layout</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
              <input
                type="radio"
                name="layout"
                value="default"
                defaultChecked
                className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600"
              />
              <div>
                <p className="text-white font-medium">Default</p>
                <p className="text-sm text-gray-400">Standard layout with sidebar navigation</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
              <input
                type="radio"
                name="layout"
                value="compact"
                className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600"
              />
              <div>
                <p className="text-white font-medium">Compact</p>
                <p className="text-sm text-gray-400">Condensed view for smaller screens</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Units & Measurements */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-purple-500 mb-2">UNITS & MEASUREMENTS</h2>
            <p className="text-gray-400">
              Choose your preferred unit system for displaying data
            </p>
          </div>
          <Ruler className="w-8 h-8 text-purple-500" />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {unitSystems.map((unit) => (
            <label
              key={unit.value}
              className={`p-4 bg-gray-800 rounded-lg border-2 cursor-pointer transition-all ${
                formData.units === unit.value
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="units"
                value={unit.value}
                checked={formData.units === unit.value}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                className="sr-only"
              />
              <div>
                <p className="text-white font-medium">{unit.label}</p>
                <p className="text-sm text-gray-400 mt-1">{unit.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-white font-medium mb-3">Example conversions:</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Temperature:</p>
              <p className="text-white">{formData.units === 'metric' ? '25°C' : '77°F'}</p>
            </div>
            <div>
              <p className="text-gray-400">Volume:</p>
              <p className="text-white">{formData.units === 'metric' ? '1.5 L' : '0.4 gal'}</p>
            </div>
            <div>
              <p className="text-gray-400">Power Output:</p>
              <p className="text-white">15 mW/m² (same in both)</p>
            </div>
            <div>
              <p className="text-gray-400">Dimensions:</p>
              <p className="text-white">{formData.units === 'metric' ? '10 cm' : '3.94 in'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-purple-500 mb-2">LANGUAGE</h2>
            <p className="text-gray-400">
              Choose your preferred language for the interface
            </p>
          </div>
          <Globe className="w-8 h-8 text-purple-500" />
        </div>

        <select
          value={formData.language}
          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>

        <p className="mt-3 text-sm text-gray-500">
          Note: Full language support is coming soon. Currently, only English is fully supported.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-black font-bold rounded-lcars transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          SAVE PREFERENCES
        </button>
      </div>
    </div>
  );
}