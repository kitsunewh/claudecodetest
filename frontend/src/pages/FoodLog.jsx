import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, Loader } from 'lucide-react'
import { logMeal } from '../services/api'
import { format } from 'date-fns'

export default function FoodLog() {
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mealData, setMealData] = useState({
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    mealType: 'breakfast',
  })
  const [analyzing, setAnalyzing] = useState(false)

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadedend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Auto-analyze the image
      setAnalyzing(true)
      // In production, this would call the AI analysis endpoint
      // For now, we'll simulate it
      setTimeout(() => {
        setMealData({
          ...mealData,
          foodName: 'Detected Food Item',
          calories: '450',
          protein: '25',
          carbs: '50',
          fats: '15',
        })
        setAnalyzing(false)
      }, 2000)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const formData = new FormData()
      formData.append('userId', user.id)
      formData.append('foodName', mealData.foodName)
      formData.append('calories', mealData.calories)
      formData.append('protein', mealData.protein)
      formData.append('carbs', mealData.carbs)
      formData.append('fats', mealData.fats)
      formData.append('mealType', mealData.mealType)
      formData.append('timestamp', format(new Date(), 'yyyy-MM-dd HH:mm:ss'))
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      await logMeal(formData)
      navigate('/')
    } catch (error) {
      console.error('Error logging meal:', error)
      alert('Error logging meal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setMealData({
      ...mealData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Log Food</h1>
        <p className="text-gray-600">Upload a photo or enter details manually</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Food Image</h3>

          {preview ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={preview}
                  alt="Food preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                {analyzing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      <Loader className="animate-spin mx-auto mb-2" size={32} />
                      <p>Analyzing image...</p>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreview(null)
                  setSelectedImage(null)
                }}
                className="btn-secondary w-full"
              >
                Change Image
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Camera className="text-gray-400 mb-3" size={48} />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        {/* Meal Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Meal Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Type
              </label>
              <select
                name="mealType"
                value={mealData.mealType}
                onChange={handleChange}
                className="input"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Name
              </label>
              <input
                type="text"
                name="foodName"
                value={mealData.foodName}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Grilled Chicken Salad"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  name="calories"
                  value={mealData.calories}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  name="protein"
                  value={mealData.protein}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  name="carbs"
                  value={mealData.carbs}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fats (g)
                </label>
                <input
                  type="number"
                  name="fats"
                  value={mealData.fats}
                  onChange={handleChange}
                  className="input"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 flex items-center justify-center space-x-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                <span>Logging...</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span>Log Meal</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
