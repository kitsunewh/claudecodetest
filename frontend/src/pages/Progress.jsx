import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingDown, Activity, Award } from 'lucide-react'
import { getWeightHistory, getStatistics } from '../services/api'
import { format, subDays } from 'date-fns'

export default function Progress() {
  const [weightData, setWeightData] = useState([])
  const [calorieData, setCalorieData] = useState([])
  const [timeRange, setTimeRange] = useState(30)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    weightChange: 0,
    avgCalories: 0,
    totalMeals: 0,
    streakDays: 0,
  })

  useEffect(() => {
    loadProgressData()
  }, [timeRange])

  const loadProgressData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))

      // Load weight history
      const weights = await getWeightHistory(user.id, timeRange)
      const weightChartData = weights.map((w) => ({
        date: format(new Date(w.date), 'MMM dd'),
        weight: w.weight,
      }))
      setWeightData(weightChartData)

      // Load calorie statistics
      const stats = await getStatistics(user.id, timeRange)
      const calorieChartData = stats.daily.map((d) => ({
        date: format(new Date(d.date), 'MMM dd'),
        calories: d.calories,
        goal: d.goal || 2000,
      }))
      setCalorieData(calorieChartData)

      // Calculate summary
      const weightChange =
        weights.length > 1
          ? weights[0].weight - weights[weights.length - 1].weight
          : 0

      const avgCalories = stats.daily.reduce((sum, d) => sum + d.calories, 0) / stats.daily.length || 0

      setSummary({
        weightChange: weightChange.toFixed(1),
        avgCalories: Math.round(avgCalories),
        totalMeals: stats.totalMeals || 0,
        streakDays: stats.streakDays || 0,
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading progress data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Progress</h1>
        <p className="text-gray-600">Track your health journey</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => setTimeRange(days)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === days
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {days} days
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Weight Change</h3>
            <TrendingDown className="text-primary-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {summary.weightChange > 0 ? '+' : ''}
            {summary.weightChange} lbs
          </div>
          <p className="text-xs text-gray-500 mt-1">Last {timeRange} days</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avg Calories</h3>
            <Activity className="text-orange-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{summary.avgCalories}</div>
          <p className="text-xs text-gray-500 mt-1">Per day</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Meals</h3>
            <Award className="text-blue-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{summary.totalMeals}</div>
          <p className="text-xs text-gray-500 mt-1">Logged</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Streak</h3>
            <Award className="text-green-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{summary.streakDays}</div>
          <p className="text-xs text-gray-500 mt-1">Days</p>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Trend</h3>
        {weightData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#22c55e"
                strokeWidth={2}
                name="Weight (lbs)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-12">
            No weight data available. Start logging your weight!
          </p>
        )}
      </div>

      {/* Calorie Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calorie Intake</h3>
        {calorieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={calorieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="calories" fill="#22c55e" name="Consumed" />
              <Bar dataKey="goal" fill="#e5e7eb" name="Goal" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-12">
            No calorie data available. Start logging your meals!
          </p>
        )}
      </div>
    </div>
  )
}
