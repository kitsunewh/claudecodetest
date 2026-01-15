import React, { useState, useEffect } from 'react';
import { Droplet, Plus } from 'lucide-react';
import { getWaterIntake, addWaterIntake, getUserProfile } from '../utils/api';

function WaterTracker() {
  const [todayIntake, setTodayIntake] = useState(0);
  const [goal, setGoal] = useState(8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const [waterData, profileData] = await Promise.all([
        getWaterIntake(today),
        getUserProfile()
      ]);

      const todayEntry = waterData.find(w => w.date === today);
      setTodayIntake(todayEntry?.glasses || 0);
      setGoal(profileData.dailyWaterGoal || 8);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWater = async (glasses = 1) => {
    try {
      await addWaterIntake({ glasses });
      await loadData();
    } catch (error) {
      console.error('Failed to add water:', error);
      alert('Failed to log water intake');
    }
  };

  const progress = (todayIntake / goal) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Water Tracker</h1>
        <p className="text-gray-600 mt-1">Stay hydrated throughout the day</p>
      </div>

      {/* Progress Circle */}
      <div className="card text-center">
        <div className="inline-block relative">
          <svg className="w-64 h-64">
            <circle
              cx="128"
              cy="128"
              r="100"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="20"
            />
            <circle
              cx="128"
              cy="128"
              r="100"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="20"
              strokeDasharray={`${2 * Math.PI * 100}`}
              strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 128 128)"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplet size={48} className="text-cyan-600 mb-2" />
            <p className="text-5xl font-bold text-gray-900">{todayIntake}</p>
            <p className="text-gray-600">of {goal} glasses</p>
            <p className="text-sm text-gray-500 mt-1">{Math.round(progress)}% complete</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={() => handleAddWater(1)} className="btn-primary">
            <Plus size={20} className="inline mr-2" />
            Add 1 Glass
          </button>
          <button onClick={() => handleAddWater(2)} className="btn-secondary">
            <Plus size={20} className="inline mr-2" />
            Add 2 Glasses
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="card bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Hydration Tips</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <Droplet size={16} className="text-cyan-600 mt-1 mr-2 flex-shrink-0" />
            <span>Drink a glass of water when you wake up</span>
          </li>
          <li className="flex items-start">
            <Droplet size={16} className="text-cyan-600 mt-1 mr-2 flex-shrink-0" />
            <span>Keep water nearby throughout the day</span>
          </li>
          <li className="flex items-start">
            <Droplet size={16} className="text-cyan-600 mt-1 mr-2 flex-shrink-0" />
            <span>Drink before, during, and after exercise</span>
          </li>
          <li className="flex items-start">
            <Droplet size={16} className="text-cyan-600 mt-1 mr-2 flex-shrink-0" />
            <span>Set reminders if you tend to forget</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default WaterTracker;
