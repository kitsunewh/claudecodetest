import React, { useState, useEffect } from 'react';
import { Trash2, Calendar } from 'lucide-react';
import { getMeals, deleteMeal } from '../utils/api';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

function MealHistory() {
  const [meals, setMeals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeals();
  }, [filter]);

  const loadMeals = async () => {
    try {
      setLoading(true);
      let startDate, endDate;

      if (filter === 'today') {
        startDate = startOfDay(new Date()).toISOString();
        endDate = endOfDay(new Date()).toISOString();
      } else if (filter === 'week') {
        startDate = subDays(new Date(), 7).toISOString();
        endDate = new Date().toISOString();
      }

      const data = await getMeals(startDate, endDate);
      setMeals(data.reverse());
    } catch (error) {
      console.error('Failed to load meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mealId) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    try {
      await deleteMeal(mealId);
      setMeals(meals.filter(m => m.id !== mealId));
    } catch (error) {
      console.error('Failed to delete meal:', error);
      alert('Failed to delete meal');
    }
  };

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFats = meals.reduce((sum, m) => sum + (m.fats || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meal History</h1>
          <p className="text-gray-600 mt-1">View and manage your logged meals</p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <p className="text-sm text-gray-700 font-medium">Total Calories</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{totalCalories}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-gray-700 font-medium">Protein</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{totalProtein}g</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-gray-700 font-medium">Carbs</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{totalCarbs}g</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <p className="text-sm text-gray-700 font-medium">Fats</p>
          <p className="text-3xl font-bold text-yellow-700 mt-1">{totalFats}g</p>
        </div>
      </div>

      {/* Meals List */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={48} className="mx-auto mb-2 opacity-50" />
            <p>No meals found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meals.map((meal) => (
              <div key={meal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {meal.mealType}
                      </span>
                      <span className="text-sm text-gray-600">
                        {format(new Date(meal.timestamp), 'MMM d, yyyy • h:mm a')}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {meal.foodItems.join(', ')}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Calories</p>
                        <p className="font-semibold text-gray-900">{meal.calories}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Protein</p>
                        <p className="font-semibold text-gray-900">{meal.protein}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Carbs</p>
                        <p className="font-semibold text-gray-900">{meal.carbs}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Fats</p>
                        <p className="font-semibold text-gray-900">{meal.fats}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Fiber</p>
                        <p className="font-semibold text-gray-900">{meal.fiber}g</p>
                      </div>
                    </div>

                    {meal.notes && (
                      <p className="text-sm text-gray-600 mt-2">{meal.notes}</p>
                    )}

                    {meal.driveUrl && (
                      <a
                        href={meal.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
                      >
                        View in Google Drive
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MealHistory;
