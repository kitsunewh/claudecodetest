import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    daily_calorie_goal: '',
    daily_protein_goal: '',
    daily_carbs_goal: '',
    daily_fats_goal: '',
    daily_water_goal: ''
  });
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || '',
        gender: user.gender || '',
        height: user.height || '',
        daily_calorie_goal: user.daily_calorie_goal || '',
        daily_protein_goal: user.daily_protein_goal || '',
        daily_carbs_goal: user.daily_carbs_goal || '',
        daily_fats_goal: user.daily_fats_goal || '',
        daily_water_goal: user.daily_water_goal || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateProfile(formData);
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const connectGoogleDrive = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/google-drive/auth-url`);
      window.open(response.data.authUrl, '_blank', 'width=600,height=600');
    } catch (error) {
      console.error('Failed to get Google Drive auth URL:', error);
    }
  };

  const calculateBMI = () => {
    if (formData.height && user) {
      // Would need weight from weight_entries table
      return 'N/A';
    }
    return 'N/A';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('success')
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      {/* Profile Card */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Personal Information</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-primary">
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
              <h3 className="text-lg font-bold mb-4">Daily Goals</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Calorie Goal</label>
                  <input
                    type="number"
                    name="daily_calorie_goal"
                    value={formData.daily_calorie_goal}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Protein Goal (g)</label>
                  <input
                    type="number"
                    name="daily_protein_goal"
                    value={formData.daily_protein_goal}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Carbs Goal (g)</label>
                  <input
                    type="number"
                    name="daily_carbs_goal"
                    value={formData.daily_carbs_goal}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fats Goal (g)</label>
                  <input
                    type="number"
                    name="daily_fats_goal"
                    value={formData.daily_fats_goal}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Water Goal (glasses)</label>
                  <input
                    type="number"
                    name="daily_water_goal"
                    value={formData.daily_water_goal}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: user.name || '',
                    age: user.age || '',
                    gender: user.gender || '',
                    height: user.height || '',
                    daily_calorie_goal: user.daily_calorie_goal || '',
                    daily_protein_goal: user.daily_protein_goal || '',
                    daily_carbs_goal: user.daily_carbs_goal || '',
                    daily_fats_goal: user.daily_fats_goal || '',
                    daily_water_goal: user.daily_water_goal || ''
                  });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</div>
                <div className="font-medium">{user?.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</div>
                <div className="font-medium">{user?.name || 'Not set'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Age</div>
                <div className="font-medium">{user?.age || 'Not set'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gender</div>
                <div className="font-medium capitalize">{user?.gender || 'Not set'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Height</div>
                <div className="font-medium">{user?.height ? `${user.height} cm` : 'Not set'}</div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-bold mb-4">Daily Goals</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Calories</div>
                  <div className="text-2xl font-bold">{user?.daily_calorie_goal || 2000}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Protein</div>
                  <div className="text-2xl font-bold">{user?.daily_protein_goal || 150}g</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Carbs</div>
                  <div className="text-2xl font-bold">{user?.daily_carbs_goal || 200}g</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fats</div>
                  <div className="text-2xl font-bold">{user?.daily_fats_goal || 65}g</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Water</div>
                  <div className="text-2xl font-bold">{user?.daily_water_goal || 8} glasses</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Google Drive Integration */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Google Drive Integration</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Connect your Google Drive to automatically backup all food images
        </p>
        {googleDriveConnected ? (
          <div className="flex items-center space-x-3">
            <span className="text-green-600 dark:text-green-400">✓ Connected</span>
            <button className="btn btn-secondary text-sm">
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={connectGoogleDrive} className="btn btn-primary">
            Connect Google Drive
          </button>
        )}
      </div>
    </div>
  );
}

export default Profile;
