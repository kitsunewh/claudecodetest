import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

function Analytics() {
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [weekly, monthly] = await Promise.all([
        axios.get(`${API_URL}/analytics/weekly`),
        axios.get(`${API_URL}/analytics/monthly`)
      ]);
      setWeeklyData(weekly.data);
      setMonthlyData(monthly.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  // Prepare chart data
  const calorieChartData = weeklyData?.meals?.map(meal => ({
    date: meal.meal_date.substring(5),
    calories: meal.total_calories,
    protein: meal.total_protein,
    carbs: meal.total_carbs,
    fats: meal.total_fats
  })) || [];

  const exerciseChartData = weeklyData?.exercises?.map(ex => ({
    date: ex.entry_date.substring(5),
    burned: ex.total_calories_burned,
    duration: ex.total_duration
  })) || [];

  const weightChartData = weeklyData?.weight?.map(w => ({
    date: w.entry_date.substring(5),
    weight: w.weight
  })) || [];

  const waterChartData = weeklyData?.water?.map(w => ({
    date: w.entry_date.substring(5),
    glasses: w.glasses
  })) || [];

  // Calculate macro distribution
  const totalProtein = calorieChartData.reduce((sum, d) => sum + (d.protein || 0), 0);
  const totalCarbs = calorieChartData.reduce((sum, d) => sum + (d.carbs || 0), 0);
  const totalFats = calorieChartData.reduce((sum, d) => sum + (d.fats || 0), 0);

  const macroData = [
    { name: 'Protein', value: totalProtein, calories: totalProtein * 4 },
    { name: 'Carbs', value: totalCarbs, calories: totalCarbs * 4 },
    { name: 'Fats', value: totalFats, calories: totalFats * 9 }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualize your health and fitness progress
        </p>
      </div>

      {/* Monthly Stats */}
      {monthlyData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="text-sm opacity-90 mb-1">Days Tracked</div>
            <div className="text-4xl font-bold">{monthlyData.meals.days_tracked || 0}</div>
            <div className="text-sm opacity-90 mt-2">This month</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Avg Daily Calories</div>
            <div className="text-4xl font-bold">
              {Math.round(monthlyData.meals.avg_daily_calories) || 0}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Total Workouts</div>
            <div className="text-4xl font-bold">{monthlyData.exercise.total_workouts || 0}</div>
            <div className="text-sm opacity-90 mt-2">
              {Math.round(monthlyData.exercise.total_duration || 0)} minutes
            </div>
          </div>
        </div>
      )}

      {/* Calorie Trend */}
      {calorieChartData.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Weekly Calorie Intake</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={calorieChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="calories" stroke="#0ea5e9" strokeWidth={2} name="Total Calories" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Macronutrients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Macro Distribution Pie Chart */}
        {macroData.some(d => d.value > 0) && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Macronutrient Distribution (7 days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Protein</div>
                <div className="font-bold text-lg">{totalProtein.toFixed(0)}g</div>
                <div className="text-xs text-gray-500">{(totalProtein * 4).toFixed(0)} cal</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Carbs</div>
                <div className="font-bold text-lg">{totalCarbs.toFixed(0)}g</div>
                <div className="text-xs text-gray-500">{(totalCarbs * 4).toFixed(0)} cal</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Fats</div>
                <div className="font-bold text-lg">{totalFats.toFixed(0)}g</div>
                <div className="text-xs text-gray-500">{(totalFats * 9).toFixed(0)} cal</div>
              </div>
            </div>
          </div>
        )}

        {/* Macro Trends Bar Chart */}
        {calorieChartData.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Daily Macronutrients</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calorieChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="protein" fill="#10b981" name="Protein (g)" />
                <Bar dataKey="carbs" fill="#f59e0b" name="Carbs (g)" />
                <Bar dataKey="fats" fill="#ef4444" name="Fats (g)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Exercise and Weight Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Exercise Trend */}
        {exerciseChartData.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Calories Burned</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={exerciseChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="burned" fill="#f97316" name="Calories Burned" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weight Trend */}
        {weightChartData.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Weight Progress</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={2} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Water Intake */}
      {waterChartData.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Daily Water Intake</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={waterChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="glasses" fill="#06b6d4" name="Glasses of Water" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Empty State */}
      {calorieChartData.length === 0 && exerciseChartData.length === 0 && weightChartData.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">No data yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start tracking your meals, weight, and exercise to see analytics
          </p>
        </div>
      )}
    </div>
  );
}

export default Analytics;
