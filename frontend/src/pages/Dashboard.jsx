import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Droplet, Activity, Target, TrendingDown } from 'lucide-react'
import { getMeals, getGoals, getWaterIntake, logWater } from '../services/api'
import { format } from 'date-fns'

export default function Dashboard() {
  const [stats, setStats] = useState({
    caloriesConsumed: 0,
    caloriesGoal: 2000,
    protein: 0,
    carbs: 0,
    fats: 0,
    water: 0,
    waterGoal: 8,
  })
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const today = format(new Date(), 'yyyy-MM-dd')

      // Load meals
      const mealsData = await getMeals(user.id, today)
      setMeals(mealsData)

      // Calculate totals
      const totals = mealsData.reduce(
        (acc, meal) => ({
          calories: acc.calories + (meal.calories || 0),
          protein: acc.protein + (meal.protein || 0),
          carbs: acc.carbs + (meal.carbs || 0),
          fats: acc.fats + (meal.fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      )

      // Load goals
      const goalsData = await getGoals(user.id)

      // Load water intake
      const waterData = await getWaterIntake(user.id, today)

      setStats({
        caloriesConsumed: totals.calories,
        caloriesGoal: goalsData.daily_calorie_goal || 2000,
        protein: totals.protein,
        carbs: totals.carbs,
        fats: totals.fats,
        water: waterData.total || 0,
        waterGoal: goalsData.water_goal || 8,
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  const handleAddWater = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      await logWater(user.id, 1, format(new Date(), 'yyyy-MM-dd'))
      setStats({ ...stats, water: stats.water + 1 })
    } catch (error) {
      console.error('Error logging water:', error)
    }
  }

  const calorieProgress = (stats.caloriesConsumed / stats.caloriesGoal) * 100
  const waterProgress = (stats.water / stats.waterGoal) * 100

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link to="/log-food" className="btn-primary flex items-center space-x-2">
          <Camera size={20} />
          <span>Log Food</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Calories */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Calories</h3>
            <Target className="text-primary-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.caloriesConsumed}
            <span className="text-lg text-gray-500">/{stats.caloriesGoal}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${Math.min(calorieProgress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.caloriesGoal - stats.caloriesConsumed > 0
              ? `${stats.caloriesGoal - stats.caloriesConsumed} kcal remaining`
              : 'Goal exceeded'}
          </p>
        </div>

        {/* Water */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Water</h3>
            <Droplet className="text-blue-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.water}
            <span className="text-lg text-gray-500">/{stats.waterGoal} cups</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${Math.min(waterProgress, 100)}%` }}
            />
          </div>
          <button
            onClick={handleAddWater}
            className="text-xs text-blue-600 hover:text-blue-700 mt-2"
          >
            + Add 1 cup
          </button>
        </div>

        {/* Protein */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Protein</h3>
            <Activity className="text-orange-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.protein}
            <span className="text-lg text-gray-500">g</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Today's intake</p>
        </div>

        {/* Net Calories */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Net Calories</h3>
            <TrendingDown className="text-green-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.caloriesConsumed}
          </div>
          <p className="text-xs text-gray-500 mt-2">After exercise</p>
        </div>
      </div>

      {/* Macros Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Macronutrient Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.protein}g</div>
            <div className="text-sm text-gray-600">Protein</div>
            <div className="text-xs text-gray-500">{stats.protein * 4} kcal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.carbs}g</div>
            <div className="text-sm text-gray-600">Carbs</div>
            <div className="text-xs text-gray-500">{stats.carbs * 4} kcal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.fats}g</div>
            <div className="text-sm text-gray-600">Fats</div>
            <div className="text-xs text-gray-500">{stats.fats * 9} kcal</div>
          </div>
        </div>
      </div>

      {/* Recent Meals */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Meals</h3>
          <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700">
            View All
          </Link>
        </div>
        {meals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No meals logged today. Start by logging your first meal!
          </p>
        ) : (
          <div className="space-y-3">
            {meals.slice(0, 5).map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {meal.image_url && (
                    <img
                      src={meal.image_url}
                      alt={meal.food_name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{meal.food_name}</div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(meal.timestamp), 'h:mm a')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{meal.calories} kcal</div>
                  <div className="text-xs text-gray-500">
                    P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
