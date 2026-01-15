import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Meals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    meal_type: 'breakfast',
    meal_date: new Date().toISOString().split('T')[0],
    meal_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await axios.get(`${API_URL}/meals`);
      setMeals(response.data);
    } catch (error) {
      console.error('Failed to fetch meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('meal_type', uploadData.meal_type);
    formData.append('meal_date', uploadData.meal_date);
    formData.append('meal_time', uploadData.meal_time);
    formData.append('notes', uploadData.notes);

    try {
      await axios.post(`${API_URL}/meals/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUploadModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadData({
        meal_type: 'breakfast',
        meal_date: new Date().toISOString().split('T')[0],
        meal_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        notes: ''
      });
      fetchMeals();
    } catch (error) {
      console.error('Failed to upload meal:', error);
      alert('Failed to upload meal. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) return;

    try {
      await axios.delete(`${API_URL}/meals/${id}`);
      fetchMeals();
    } catch (error) {
      console.error('Failed to delete meal:', error);
    }
  };

  const getMealTypeEmoji = (type) => {
    const emojis = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍪'
    };
    return emojis[type] || '🍽️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading meals...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Meals</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your food with AI-powered calorie analysis
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn btn-primary"
        >
          + Upload Food Photo
        </button>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal) => (
          <div key={meal.id} className="card hover:shadow-xl transition-shadow">
            {meal.image_url && (
              <img
                src={meal.image_url}
                alt={meal.meal_name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{getMealTypeEmoji(meal.meal_type)}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {meal.meal_type}
              </span>
            </div>
            <h3 className="text-lg font-bold mb-2">{meal.meal_name}</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded">
                <div className="text-xs text-gray-600 dark:text-gray-400">Calories</div>
                <div className="text-lg font-bold">{meal.calories}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <div className="text-xs text-gray-600 dark:text-gray-400">Protein</div>
                <div className="text-lg font-bold">{meal.protein.toFixed(0)}g</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                <div className="text-xs text-gray-600 dark:text-gray-400">Carbs</div>
                <div className="text-lg font-bold">{meal.carbs.toFixed(0)}g</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                <div className="text-xs text-gray-600 dark:text-gray-400">Fats</div>
                <div className="text-lg font-bold">{meal.fats.toFixed(0)}g</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {meal.meal_date} at {meal.meal_time}
            </div>
            {meal.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">
                {meal.notes}
              </p>
            )}
            <button
              onClick={() => handleDelete(meal.id)}
              className="w-full btn btn-danger text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {meals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-bold mb-2">No meals logged yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload a photo of your food to get started
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
          >
            Upload First Meal
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Upload Food Photo</h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Food Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full"
                  required
                />
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Meal Type</label>
                <select
                  value={uploadData.meal_type}
                  onChange={(e) => setUploadData({...uploadData, meal_type: e.target.value})}
                  className="input"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={uploadData.meal_date}
                    onChange={(e) => setUploadData({...uploadData, meal_date: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={uploadData.meal_time}
                    onChange={(e) => setUploadData({...uploadData, meal_time: e.target.value})}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={uploadData.notes}
                  onChange={(e) => setUploadData({...uploadData, notes: e.target.value})}
                  className="input"
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="flex-1 btn btn-primary"
                >
                  {uploading ? 'Analyzing...' : 'Upload & Analyze'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Meals;
