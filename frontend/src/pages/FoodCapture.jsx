import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Edit2 } from 'lucide-react';
import { analyzeFoodImage, addMeal } from '../utils/api';
import { useNavigate } from 'react-router-dom';

function FoodCapture() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [mealType, setMealType] = useState('lunch');
  const [notes, setNotes] = useState('');
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setAnalysis(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    try {
      setAnalyzing(true);
      const result = await analyzeFoodImage(selectedImage);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze image. Please check your API configuration.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!analysis) return;

    try {
      const mealData = {
        timestamp: new Date().toISOString(),
        mealType,
        foodItems: analysis.foodItems,
        calories: analysis.totalCalories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fats: analysis.fats,
        fiber: analysis.fiber,
        sugar: analysis.sugar,
        servingSize: analysis.servingSize,
        driveUrl: analysis.driveUrl,
        notes: notes || analysis.notes
      };

      await addMeal(mealData);
      alert('Meal saved successfully!');
      navigate('/meals');
    } catch (error) {
      console.error('Failed to save meal:', error);
      alert('Failed to save meal. Please try again.');
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setNotes('');
    setEditMode(false);
  };

  const updateAnalysis = (field, value) => {
    setAnalysis(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Capture Food</h1>
        <p className="text-gray-600 mt-1">Upload a photo to get instant nutritional analysis</p>
      </div>

      {/* Upload Section */}
      {!imagePreview ? (
        <div className="card">
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Food Photo</h3>
            <p className="text-gray-600 mb-4">Click to select an image from your device</p>
            <button className="btn-primary inline-flex items-center space-x-2">
              <Upload size={20} />
              <span>Choose Image</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      ) : (
        <>
          {/* Image Preview */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Selected Image</h3>
              <button
                onClick={handleReset}
                className="text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <X size={20} />
                <span>Clear</span>
              </button>
            </div>

            <img
              src={imagePreview}
              alt="Food preview"
              className="w-full h-96 object-cover rounded-lg"
            />

            {!analysis && !analyzing && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="input-field mb-4"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>

                <button
                  onClick={handleAnalyze}
                  className="btn-primary w-full"
                  disabled={analyzing}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Food'}
                </button>
              </div>
            )}

            {analyzing && (
              <div className="mt-4 text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing your food with AI...</p>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Nutritional Analysis</h3>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                >
                  <Edit2 size={16} />
                  <span>{editMode ? 'Done Editing' : 'Edit'}</span>
                </button>
              </div>

              {/* Food Items */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Items
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={analysis.foodItems.join(', ')}
                    onChange={(e) => updateAnalysis('foodItems', e.target.value.split(',').map(s => s.trim()))}
                    className="input-field"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {analysis.foodItems.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Calories */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-700 font-medium">Calories</p>
                  {editMode ? (
                    <input
                      type="number"
                      value={analysis.totalCalories}
                      onChange={(e) => updateAnalysis('totalCalories', parseInt(e.target.value))}
                      className="input-field mt-1"
                    />
                  ) : (
                    <p className="text-3xl font-bold text-red-700 mt-1">{analysis.totalCalories}</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-700 font-medium">Protein</p>
                  {editMode ? (
                    <input
                      type="number"
                      value={analysis.protein}
                      onChange={(e) => updateAnalysis('protein', parseInt(e.target.value))}
                      className="input-field mt-1"
                    />
                  ) : (
                    <p className="text-3xl font-bold text-green-700 mt-1">{analysis.protein}g</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 font-medium">Carbs</p>
                  {editMode ? (
                    <input
                      type="number"
                      value={analysis.carbs}
                      onChange={(e) => updateAnalysis('carbs', parseInt(e.target.value))}
                      className="input-field mt-1"
                    />
                  ) : (
                    <p className="text-3xl font-bold text-blue-700 mt-1">{analysis.carbs}g</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700 font-medium">Fats</p>
                  {editMode ? (
                    <input
                      type="number"
                      value={analysis.fats}
                      onChange={(e) => updateAnalysis('fats', parseInt(e.target.value))}
                      className="input-field mt-1"
                    />
                  ) : (
                    <p className="text-3xl font-bold text-yellow-700 mt-1">{analysis.fats}g</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700 font-medium">Fiber</p>
                  {editMode ? (
                    <input
                      type="number"
                      value={analysis.fiber}
                      onChange={(e) => updateAnalysis('fiber', parseInt(e.target.value))}
                      className="input-field mt-1"
                    />
                  ) : (
                    <p className="text-3xl font-bold text-purple-700 mt-1">{analysis.fiber}g</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                  <p className="text-sm text-gray-700 font-medium">Sugar</p>
                  {editMode ? (
                    <input
                      type="number"
                      value={analysis.sugar}
                      onChange={(e) => updateAnalysis('sugar', parseInt(e.target.value))}
                      className="input-field mt-1"
                    />
                  ) : (
                    <p className="text-3xl font-bold text-pink-700 mt-1">{analysis.sugar}g</p>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serving Size
                  </label>
                  <p className="text-gray-900">{analysis.servingSize}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confidence Level
                  </label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    analysis.confidence === 'high' ? 'bg-green-100 text-green-700' :
                    analysis.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {analysis.confidence.charAt(0).toUpperCase() + analysis.confidence.slice(1)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={analysis.notes}
                    className="input-field"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveMeal}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Check size={20} />
                <span>Save Meal</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FoodCapture;
