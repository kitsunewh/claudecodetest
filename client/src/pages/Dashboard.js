import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [water, setWater] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchWaterIntake();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/dashboard`);
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaterIntake = async () => {
    try {
      const response = await axios.get(`${API_URL}/water/today`);
      setWater(response.data.glasses || 0);
    } catch (error) {
      console.error('Failed to fetch water intake:', error);
    }
  };

  const addWaterGlass = async () => {
    try {
      await axios.post(`${API_URL}/water/increment`);
      setWater(water + 1);
    } catch (error) {
      console.error('Failed to add water:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const caloriesPercentage = dashboard ? (dashboard.today.calories / dashboard.goals.calories) * 100 : 0;
  const waterPercentage = dashboard ? (water / dashboard.goals.water) * 100 : 0;
  const proteinPercentage = dashboard ? (dashboard.today.protein / dashboard.goals.protein) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your daily progress and stay on target
        </p>
      </div>

      {/* Today's Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="text-sm opacity-90 mb-1">Calories</div>
          <div className="text-3xl font-bold mb-2">
            {dashboard?.today.calories || 0}
            <span className="text-lg font-normal">/{dashboard?.goals.calories}</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all"
              style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-sm opacity-90 mb-1">Protein</div>
          <div className="text-3xl font-bold mb-2">
            {dashboard?.today.protein.toFixed(0) || 0}g
            <span className="text-lg font-normal">/{dashboard?.goals.protein}g</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all"
              style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-sm opacity-90 mb-1">Water</div>
          <div className="text-3xl font-bold mb-2">
            {water}
            <span className="text-lg font-normal">/{dashboard?.goals.water} glasses</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2 mb-3">
            <div
              className="bg-white rounded-full h-2 transition-all"
              style={{ width: `${Math.min(waterPercentage, 100)}%` }}
            />
          </div>
          <button onClick={addWaterGlass} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors">
            + Add Glass
          </button>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-sm opacity-90 mb-1">Exercises</div>
          <div className="text-3xl font-bold mb-2">{dashboard?.today.exercises || 0}</div>
          <div className="text-sm opacity-90">
            {dashboard?.today.caloriesBurned || 0} calories burned
          </div>
        </div>
      </div>

      {/* Net Calories */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Net Calories</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Consumed</div>
            <div className="text-2xl font-bold text-green-600">{dashboard?.today.calories || 0}</div>
          </div>
          <div className="text-2xl">-</div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Burned</div>
            <div className="text-2xl font-bold text-red-600">{dashboard?.today.caloriesBurned || 0}</div>
          </div>
          <div className="text-2xl">=</div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Net</div>
            <div className="text-2xl font-bold text-primary-600">{dashboard?.today.netCalories || 0}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/meals" className="card hover:shadow-xl transition-shadow cursor-pointer">
          <div className="text-4xl mb-3">🍽️</div>
          <h3 className="text-lg font-bold mb-2">Log Meal</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload a food photo and get instant calorie analysis
          </p>
        </Link>

        <Link to="/weight" className="card hover:shadow-xl transition-shadow cursor-pointer">
          <div className="text-4xl mb-3">⚖️</div>
          <h3 className="text-lg font-bold mb-2">Track Weight</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {dashboard?.weight ? `Current: ${dashboard.weight.weight}kg` : 'Log your weight today'}
          </p>
        </Link>

        <Link to="/exercise" className="card hover:shadow-xl transition-shadow cursor-pointer">
          <div className="text-4xl mb-3">💪</div>
          <h3 className="text-lg font-bold mb-2">Add Exercise</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your workouts and calories burned
          </p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
