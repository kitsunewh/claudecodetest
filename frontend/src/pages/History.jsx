import { useState, useEffect } from 'react'
import { Calendar, Trash2, Edit } from 'lucide-react'
import { getMeals, deleteMeal } from '../services/api'
import { format, subDays } from 'date-fns'

export default function History() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  })

  useEffect(() => {
    loadMeals()
  }, [selectedDate])

  const loadMeals = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const mealsData = await getMeals(user.id, selectedDate)
      setMeals(mealsData)

      const totals = mealsData.reduce(
        (acc, meal) => ({
          totalCalories: acc.totalCalories + (meal.calories || 0),
          totalProtein: acc.totalProtein + (meal.protein || 0),
          totalCarbs: acc.totalCarbs + (meal.carbs || 0),
          totalFats: acc.totalFats + (meal.fats || 0),
        }),
        { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 }
      )

      setStats(totals)
      setLoading(false)
    } catch (error) {
      console.error('Error loading meals:', error)
      setLoading(false)
    }
  }

  const handleDeleteMeal = async (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await deleteMeal(mealId)
        loadMeals()
      } catch (error) {
        console.error('Error deleting meal:', error)
        alert('Error deleting meal. Please try again.')
      }
    }
  }

  const groupedMeals = meals.reduce((acc, meal) => {
    const type = meal.meal_type || 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(meal)
    return acc
  }, {})

  const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'snack', 'other']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meal History</h1>
        <p className="text-gray-600">View and manage your meal log</p>
      </div>

      {/* Date Selector */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Calendar className="text-gray-600" size={24} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input flex-1"
            max={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
      </div>

      {/* Daily Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {stats.totalCalories}
            </div>
            <div className="text-sm text-gray-600">Calories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalProtein}g
            </div>
            <div className="text-sm text-gray-600">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalCarbs}g
            </div>
            <div className="text-sm text-gray-600">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.totalFats}g
            </div>
            <div className="text-sm text-gray-600">Fats</div>
          </div>
        </div>
      </div>

      {/* Meals List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : meals.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No meals logged for this date.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {mealTypeOrder.map((type) => {
            const typeMeals = groupedMeals[type]
            if (!typeMeals) return null

            return (
              <div key={type} className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                  {type}
                </h3>
                <div className="space-y-3">
                  {typeMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        {meal.image_url && (
                          <img
                            src={meal.image_url}
                            alt={meal.food_name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {meal.food_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(meal.timestamp), 'h:mm a')}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            {meal.calories}
                          </div>
                          <div className="text-sm text-gray-500">kcal</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
