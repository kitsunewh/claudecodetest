import { useState, useEffect } from 'react'
import { User, Target, Scale, Save } from 'lucide-react'
import { getGoals, updateGoals, logWeight } from '../services/api'
import { format } from 'date-fns'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [goals, setGoals] = useState({
    daily_calorie_goal: 2000,
    protein_goal: 150,
    carbs_goal: 200,
    fats_goal: 65,
    water_goal: 8,
    target_weight: 0,
  })
  const [currentWeight, setCurrentWeight] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      setUser(userData)

      const goalsData = await getGoals(userData.id)
      if (goalsData) {
        setGoals(goalsData)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading profile:', error)
      setLoading(false)
    }
  }

  const handleSaveGoals = async () => {
    setSaving(true)
    try {
      await updateGoals(user.id, goals)
      alert('Goals updated successfully!')
    } catch (error) {
      console.error('Error saving goals:', error)
      alert('Error saving goals. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogWeight = async () => {
    if (!currentWeight) {
      alert('Please enter your weight')
      return
    }

    try {
      await logWeight(user.id, parseFloat(currentWeight), format(new Date(), 'yyyy-MM-dd'))
      alert('Weight logged successfully!')
      setCurrentWeight('')
    } catch (error) {
      console.error('Error logging weight:', error)
      alert('Error logging weight. Please try again.')
    }
  }

  const handleGoalChange = (e) => {
    setGoals({
      ...goals,
      [e.target.name]: parseFloat(e.target.value) || 0,
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile & Goals</h1>
        <p className="text-gray-600">Manage your account and set your health goals</p>
      </div>

      {/* User Info */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="text-primary-600" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Username</h3>
          <p className="text-gray-900">{user?.username}</p>
        </div>
      </div>

      {/* Log Weight */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Scale className="text-primary-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Log Current Weight</h3>
        </div>
        <div className="flex space-x-4">
          <input
            type="number"
            step="0.1"
            value={currentWeight}
            onChange={(e) => setCurrentWeight(e.target.value)}
            placeholder="Enter weight in lbs"
            className="input flex-1"
          />
          <button onClick={handleLogWeight} className="btn-primary">
            Log Weight
          </button>
        </div>
      </div>

      {/* Daily Goals */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="text-primary-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Daily Goals</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Calorie Goal (kcal)
            </label>
            <input
              type="number"
              name="daily_calorie_goal"
              value={goals.daily_calorie_goal}
              onChange={handleGoalChange}
              className="input"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                name="protein_goal"
                value={goals.protein_goal}
                onChange={handleGoalChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                name="carbs_goal"
                value={goals.carbs_goal}
                onChange={handleGoalChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fats (g)
              </label>
              <input
                type="number"
                name="fats_goal"
                value={goals.fats_goal}
                onChange={handleGoalChange}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Water Goal (cups/day)
              </label>
              <input
                type="number"
                name="water_goal"
                value={goals.water_goal}
                onChange={handleGoalChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Weight (lbs)
              </label>
              <input
                type="number"
                step="0.1"
                name="target_weight"
                value={goals.target_weight}
                onChange={handleGoalChange}
                className="input"
              />
            </div>
          </div>

          <button
            onClick={handleSaveGoals}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save Goals'}</span>
          </button>
        </div>
      </div>

      {/* Health Tips */}
      <div className="card bg-primary-50 border-2 border-primary-200">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">Health Tips</h3>
        <ul className="space-y-2 text-sm text-primary-800">
          <li>• Aim for a 500-calorie deficit per day to lose 1 lb per week</li>
          <li>• Drink at least 8 cups of water daily for optimal hydration</li>
          <li>• Get 7-9 hours of sleep for better recovery and metabolism</li>
          <li>• Track consistently for best results - logging every meal helps!</li>
          <li>• Combine calorie tracking with regular exercise for faster progress</li>
        </ul>
      </div>
    </div>
  )
}
