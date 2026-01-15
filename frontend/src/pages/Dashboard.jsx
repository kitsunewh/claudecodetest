import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { Camera, TrendingUp, Droplet, Flame, Apple, Activity } from 'lucide-react';
import { getStats, getMeals, getWeightHistory, getUserProfile } from '../utils/api';
import { format, subDays } from 'date-fns';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentMeals, setRecentMeals] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, mealsData, weightData, profileData] = await Promise.all([
        getStats('week'),
        getMeals(),
        getWeightHistory(),
        getUserProfile()
      ]);

      setStats(statsData);
      setRecentMeals(mealsData.slice(-5).reverse());
      setWeightHistory(weightData.slice(-7));
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const calorieProgress = stats ? (stats.avgDailyCalories / stats.dailyCalorieGoal) * 100 : 0;

  // Calorie distribution chart
  const macroData = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [{
      data: [
        stats?.totalProtein * 4 || 0,
        stats?.totalCarbs * 4 || 0,
        stats?.totalFats * 9 || 0
      ],
      backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  // Weekly calorie trend
  const weeklyTrendData = {
    labels: Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'EEE')),
    datasets: [{
      label: 'Daily Calories',
      data: Array(7).fill(0),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your health and nutrition journey</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/capture" className="card hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <Camera className="text-primary-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Capture Food</h3>
              <p className="text-sm text-gray-600">Upload a photo to track</p>
            </div>
          </div>
        </Link>

        <Link to="/weight" className="card hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Log Weight</h3>
              <p className="text-sm text-gray-600">Track your progress</p>
            </div>
          </div>
        </Link>

        <Link to="/water" className="card hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
              <Droplet className="text-cyan-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Water</h3>
              <p className="text-sm text-gray-600">Stay hydrated</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">Avg Daily Calories</p>
              <p className="text-3xl font-bold text-primary-700 mt-1">{stats?.avgDailyCalories || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Goal: {stats?.dailyCalorieGoal || 2000}</p>
            </div>
            <Flame className="text-primary-600" size={32} />
          </div>
          <div className="mt-4 bg-white rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary-600 h-full transition-all duration-500"
              style={{ width: `${Math.min(calorieProgress, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">Protein</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{stats?.avgDailyProtein || 0}g</p>
              <p className="text-xs text-gray-600 mt-1">Per day average</p>
            </div>
            <Apple className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">Net Calories</p>
              <p className="text-3xl font-bold text-orange-700 mt-1">{stats?.netCalories || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Intake - Exercise</p>
            </div>
            <Activity className="text-orange-600" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6 border border-cyan-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">Water Intake</p>
              <p className="text-3xl font-bold text-cyan-700 mt-1">{stats?.avgDailyWater || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Glasses per day</p>
            </div>
            <Droplet className="text-cyan-600" size={32} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Macronutrient Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={macroData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Weekly Calorie Trend</h3>
          <div className="h-64">
            <Line
              data={weeklyTrendData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Meals */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Meals</h3>
          <Link to="/meals" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>

        {recentMeals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Camera size={48} className="mx-auto mb-2 opacity-50" />
            <p>No meals logged yet</p>
            <Link to="/capture" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Start tracking
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMeals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{meal.foodItems.join(', ')}</p>
                  <p className="text-sm text-gray-600">{format(new Date(meal.timestamp), 'MMM d, h:mm a')}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-700">{meal.calories} cal</p>
                  <p className="text-xs text-gray-600">P: {meal.protein}g C: {meal.carbs}g F: {meal.fats}g</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
