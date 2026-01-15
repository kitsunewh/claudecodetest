import React, { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '../utils/api';

function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    targetWeight: '',
    dailyCalorieGoal: 2000,
    dailyWaterGoal: 8,
    activityLevel: 'moderate'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfile({
        name: data.name || '',
        age: data.age || '',
        gender: data.gender || '',
        height: data.height || '',
        targetWeight: data.targetWeight || '',
        dailyCalorieGoal: data.dailyCalorieGoal || 2000,
        dailyWaterGoal: data.dailyWaterGoal || 8,
        activityLevel: data.activityLevel || 'moderate'
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await updateUserProfile({
        ...profile,
        age: profile.age ? parseInt(profile.age) : null,
        height: profile.height ? parseFloat(profile.height) : null,
        targetWeight: profile.targetWeight ? parseFloat(profile.targetWeight) : null,
        dailyCalorieGoal: parseInt(profile.dailyCalorieGoal),
        dailyWaterGoal: parseInt(profile.dailyWaterGoal)
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and goals</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User size={20} className="mr-2" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="John Doe"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  placeholder="30"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                  placeholder="175"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.targetWeight}
                  onChange={(e) => setProfile({ ...profile, targetWeight: e.target.value })}
                  placeholder="70"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Level
                </label>
                <select
                  value={profile.activityLevel}
                  onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
                  className="input-field"
                >
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="light">Light (exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                  <option value="active">Active (exercise 6-7 days/week)</option>
                  <option value="very_active">Very Active (intense exercise daily)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Calorie Goal
                </label>
                <input
                  type="number"
                  value={profile.dailyCalorieGoal}
                  onChange={(e) => setProfile({ ...profile, dailyCalorieGoal: e.target.value })}
                  placeholder="2000"
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Recommended based on your goals</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Water Goal (glasses)
                </label>
                <input
                  type="number"
                  value={profile.dailyWaterGoal}
                  onChange={(e) => setProfile({ ...profile, dailyWaterGoal: e.target.value })}
                  placeholder="8"
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Standard recommendation: 8 glasses</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Save size={20} />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">About HealthTrack</h3>
        <p className="text-gray-700 mb-2">
          HealthTrack uses AI-powered image analysis to help you track your nutrition and achieve your health goals.
        </p>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Upload food photos for instant calorie estimation</li>
          <li>• Track weight progress over time</li>
          <li>• Monitor water intake and exercise</li>
          <li>• View detailed nutrition analytics</li>
          <li>• Images stored securely in Google Drive</li>
        </ul>
      </div>
    </div>
  );
}

export default Profile;
