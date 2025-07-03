'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Mail, Briefcase, MapPin, Globe, Save, X, Edit2, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  userId: string;
  avatar: string | null;
  expertise: string | null;
  interests: string[];
  publicProfile: boolean;
  completedOnboarding: boolean;
  onboardingStep: number;
  linkedIn: string | null;
  orcid: string | null;
  googleScholar: string | null;
  user: {
    name: string | null;
    email: string;
    institution: string | null;
    researchArea: string | null;
    bio: string | null;
  };
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  institution: string | null;
  researchArea: string | null;
  bio: string | null;
  role: string;
  emailVerified: Date | null;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    researchArea: '',
    bio: '',
    expertise: '',
    interests: [] as string[],
    linkedIn: '',
    orcid: '',
    googleScholar: '',
    publicProfile: false,
  });

  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchProfileData();
    }
  }, [status, router]);

  const fetchProfileData = async () => {
    try {
      const [profileRes, userRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user'),
      ]);

      if (!profileRes.ok || !userRes.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const profileData = await profileRes.json();
      const userData = await userRes.json();

      setProfile(profileData);
      setUserData(userData);
      
      // Initialize form data
      setFormData({
        name: userData.name || '',
        institution: userData.institution || '',
        researchArea: userData.researchArea || '',
        bio: userData.bio || '',
        expertise: profileData.expertise || '',
        interests: profileData.interests || [],
        linkedIn: profileData.linkedIn || '',
        orcid: profileData.orcid || '',
        googleScholar: profileData.googleScholar || '',
        publicProfile: profileData.publicProfile || false,
      });
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Update user data
      const userRes = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          institution: formData.institution,
          researchArea: formData.researchArea,
          bio: formData.bio,
        }),
      });

      // Update profile data
      const profileRes = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertise: formData.expertise,
          interests: formData.interests,
          linkedIn: formData.linkedIn,
          orcid: formData.orcid,
          googleScholar: formData.googleScholar,
          publicProfile: formData.publicProfile,
        }),
      });

      if (!userRes.ok || !profileRes.ok) {
        throw new Error('Failed to update profile');
      }

      await fetchProfileData();
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-lcars-gold animate-spin" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* LCARS-style header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 h-3 w-full rounded-t-lg"></div>
          <div className="bg-gray-900 p-8 border-l-4 border-cyan-500">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-cyan-500 mb-2">USER PROFILE</h1>
                <p className="text-gray-400">Manage your MESSAi account and public information</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-lcars-gold hover:bg-lcars-tan text-black font-bold rounded-lcars transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  EDIT PROFILE
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lcars transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    SAVE
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfileData();
                    }}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lcars transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    CANCEL
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold text-lcars-gold mb-4">BASIC INFORMATION</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-lcars-gold focus:outline-none"
                  />
                ) : (
                  <p className="text-white">{userData?.name || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <p className="text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {userData?.email}
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Institution</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-lcars-gold focus:outline-none"
                  />
                ) : (
                  <p className="text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    {userData?.institution || 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Research Area</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.researchArea}
                    onChange={(e) => setFormData({ ...formData, researchArea: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-lcars-gold focus:outline-none"
                  />
                ) : (
                  <p className="text-white">{userData?.researchArea || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold text-lcars-purple mb-4">PROFESSIONAL PROFILE</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Expertise</label>
                {isEditing ? (
                  <textarea
                    value={formData.expertise}
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-lcars-purple focus:outline-none"
                    placeholder="Describe your areas of expertise..."
                  />
                ) : (
                  <p className="text-white">{profile?.expertise || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Research Interests</label>
                {isEditing ? (
                  <div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-lcars-purple focus:outline-none"
                        placeholder="Add an interest..."
                      />
                      <button
                        onClick={addInterest}
                        className="px-4 py-2 bg-lcars-purple hover:bg-lcars-pink text-black font-bold rounded transition-colors"
                      >
                        ADD
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-gray-800 text-lcars-purple rounded-full text-sm flex items-center gap-1"
                        >
                          {interest}
                          <button
                            onClick={() => removeInterest(interest)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.interests.length ? (
                      profile.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-gray-800 text-lcars-purple rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No interests added</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 md:col-span-2">
            <h2 className="text-xl font-bold text-lcars-cyan mb-4">BIOGRAPHY</h2>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-lcars-cyan focus:outline-none"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-white whitespace-pre-wrap">{userData?.bio || 'No bio added yet.'}</p>
            )}
          </div>

          {/* External Profiles */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 md:col-span-2">
            <h2 className="text-xl font-bold text-lcars-pink mb-4">EXTERNAL PROFILES</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">LinkedIn</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.linkedIn}
                    onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-lcars-pink focus:outline-none"
                    placeholder="https://linkedin.com/in/..."
                  />
                ) : profile?.linkedIn ? (
                  <a
                    href={profile.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lcars-pink hover:text-lcars-purple flex items-center gap-1"
                  >
                    <Globe className="w-4 h-4" />
                    View Profile
                  </a>
                ) : (
                  <p className="text-gray-500">Not connected</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">ORCID</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.orcid}
                    onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-lcars-pink focus:outline-none"
                    placeholder="0000-0000-0000-0000"
                  />
                ) : (
                  <p className="text-white">{profile?.orcid || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Google Scholar</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.googleScholar}
                    onChange={(e) => setFormData({ ...formData, googleScholar: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-lcars-pink focus:outline-none"
                    placeholder="https://scholar.google.com/..."
                  />
                ) : profile?.googleScholar ? (
                  <a
                    href={profile.googleScholar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lcars-pink hover:text-lcars-purple flex items-center gap-1"
                  >
                    <Globe className="w-4 h-4" />
                    View Profile
                  </a>
                ) : (
                  <p className="text-gray-500">Not connected</p>
                )}
              </div>
            </div>

            {/* Public Profile Toggle */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.publicProfile}
                  onChange={(e) => setFormData({ ...formData, publicProfile: e.target.checked })}
                  disabled={!isEditing}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-lcars-pink focus:ring-lcars-pink"
                />
                <span className="text-white">
                  Make my profile publicly visible
                </span>
              </label>
              <p className="text-sm text-gray-400 mt-1 ml-8">
                When enabled, other researchers can view your profile and research interests
              </p>
            </div>
          </div>

          {/* Account Stats */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 md:col-span-2">
            <h2 className="text-xl font-bold text-lcars-tan mb-4">ACCOUNT STATISTICS</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Member Since</p>
                <p className="text-lg text-white">
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Last Login</p>
                <p className="text-lg text-white">
                  {userData?.lastLoginAt ? new Date(userData.lastLoginAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Role</p>
                <p className="text-lg text-lcars-gold uppercase">{userData?.role || 'USER'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email Verified</p>
                <p className="text-lg">
                  {userData?.emailVerified ? (
                    <span className="text-green-400">Verified</span>
                  ) : (
                    <span className="text-red-400">Unverified</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">QUICK LINKS</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/settings"
              className="px-4 py-2 bg-lcars-purple hover:bg-lcars-pink text-black font-bold rounded-lcars transition-colors"
            >
              ACCOUNT SETTINGS
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-lcars-cyan hover:bg-lcars-blue text-black font-bold rounded-lcars transition-colors"
            >
              DASHBOARD
            </Link>
            <Link
              href="/experiments"
              className="px-4 py-2 bg-lcars-gold hover:bg-lcars-tan text-black font-bold rounded-lcars transition-colors"
            >
              MY EXPERIMENTS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}