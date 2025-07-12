'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, AlertCircle, Check, Bell, Mail, Shield, Calendar } from 'lucide-react';

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

export default function NotificationSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    emailNotifications: true,
    experimentAlerts: true,
    collaborationRequests: true,
    newsletter: false,
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
        emailNotifications: data.emailNotifications,
        experimentAlerts: data.experimentAlerts,
        collaborationRequests: data.collaborationRequests,
        newsletter: data.newsletter,
      });
    } catch (err) {
      setError('Failed to load notification settings');
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

      setSuccess('Notification settings updated successfully');
      await fetchSettings();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings');
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

  const notificationOptions = [
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive important updates about your account and experiments',
      icon: Mail,
      color: 'text-lcars-cyan',
    },
    {
      id: 'experimentAlerts',
      title: 'Experiment Alerts',
      description: 'Get notified when experiments complete or require attention',
      icon: Bell,
      color: 'text-lcars-gold',
    },
    {
      id: 'collaborationRequests',
      title: 'Collaboration Requests',
      description: 'Receive notifications when researchers want to collaborate',
      icon: Shield,
      color: 'text-lcars-purple',
    },
    {
      id: 'newsletter',
      title: 'Newsletter & Updates',
      description: 'Stay informed about new features and research opportunities',
      icon: Calendar,
      color: 'text-lcars-pink',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <h2 className="text-2xl font-bold text-purple-500 mb-6">NOTIFICATION PREFERENCES</h2>
        
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

        <div className="space-y-4">
          {notificationOptions.map((option) => {
            const Icon = option.icon;
            const key = option.id as keyof typeof formData;
            
            return (
              <div
                key={option.id}
                className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <label className="flex items-start gap-4 cursor-pointer">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-5 h-5 ${option.color}`} />
                      <h3 className="text-lg font-medium text-white">{option.title}</h3>
                    </div>
                    <p className="text-sm text-gray-400">{option.description}</p>
                  </div>
                </label>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
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

      {/* Email Frequency */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <h2 className="text-2xl font-bold text-purple-500 mb-6">EMAIL FREQUENCY</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 mb-4">
              Choose how often you want to receive email notifications. This setting applies to all enabled notification types.
            </p>
            
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                <input
                  type="radio"
                  name="frequency"
                  value="instant"
                  defaultChecked
                  className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600"
                />
                <div>
                  <p className="text-white font-medium">Instant</p>
                  <p className="text-sm text-gray-400">Receive notifications as they happen</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                <input
                  type="radio"
                  name="frequency"
                  value="daily"
                  className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600"
                />
                <div>
                  <p className="text-white font-medium">Daily Digest</p>
                  <p className="text-sm text-gray-400">Receive a summary once per day</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                <input
                  type="radio"
                  name="frequency"
                  value="weekly"
                  className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600"
                />
                <div>
                  <p className="text-white font-medium">Weekly Summary</p>
                  <p className="text-sm text-gray-400">Receive a summary once per week</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <h2 className="text-2xl font-bold text-purple-500 mb-6">ADDITIONAL OPTIONS</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-medium mb-2">Do Not Disturb Hours</h3>
            <p className="text-sm text-gray-400 mb-3">
              Pause notifications during specific hours (your local time)
            </p>
            <div className="flex items-center gap-2">
              <input
                type="time"
                defaultValue="22:00"
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
              <span className="text-gray-400">to</span>
              <input
                type="time"
                defaultValue="08:00"
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>

          <div className="p-4 bg-gray-800 rounded-lg">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 mt-0.5 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
              />
              <div>
                <h3 className="text-white font-medium">Smart Notifications</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Use AI to prioritize and batch similar notifications
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}