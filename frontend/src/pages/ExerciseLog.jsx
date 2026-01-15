import React, { useState, useEffect } from 'react';
import { Plus, Dumbbell, Trash2 } from 'lucide-react';
import { getExercises, addExercise } from '../utils/api';
import { format } from 'date-fns';

function ExerciseLog() {
  const [exercises, setExercises] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'cardio',
    name: '',
    duration: '',
    caloriesBurned: '',
    distance: '',
    notes: ''
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await getExercises();
      setExercises(data.reverse());
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addExercise({
        ...formData,
        duration: parseInt(formData.duration),
        caloriesBurned: parseInt(formData.caloriesBurned),
        distance: formData.distance ? parseFloat(formData.distance) : null
      });

      setFormData({
        type: 'cardio',
        name: '',
        duration: '',
        caloriesBurned: '',
        distance: '',
        notes: ''
      });
      setShowForm(false);
      await loadExercises();
    } catch (error) {
      console.error('Failed to add exercise:', error);
      alert('Failed to log exercise');
    }
  };

  const totalCaloriesBurned = exercises.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0);
  const totalDuration = exercises.reduce((sum, e) => sum + (e.duration || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exercise Log</h1>
          <p className="text-gray-600 mt-1">Track your workouts and activities</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Log Exercise</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <p className="text-sm text-gray-700 font-medium">Total Exercises</p>
          <p className="text-4xl font-bold text-orange-700 mt-2">{exercises.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <p className="text-sm text-gray-700 font-medium">Calories Burned</p>
          <p className="text-4xl font-bold text-red-700 mt-2">{totalCaloriesBurned}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-gray-700 font-medium">Total Time</p>
          <p className="text-4xl font-bold text-blue-700 mt-2">{totalDuration} min</p>
        </div>
      </div>

      {/* Add Exercise Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Log Exercise</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="cardio">Cardio</option>
                  <option value="strength">Strength Training</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Running, Swimming, etc."
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="30"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calories Burned</label>
                <input
                  type="number"
                  value={formData.caloriesBurned}
                  onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                  placeholder="200"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km, optional)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  placeholder="5.0"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Felt great!"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Save Exercise</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exercise List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        {exercises.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Dumbbell size={48} className="mx-auto mb-2 opacity-50" />
            <p>No exercises logged yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        {exercise.type}
                      </span>
                      <span className="text-sm text-gray-600">
                        {format(new Date(exercise.timestamp), 'MMM d, yyyy • h:mm a')}
                      </span>
                    </div>

                    <h4 className="font-semibold text-lg text-gray-900 mb-2">{exercise.name}</h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="font-semibold text-gray-900">{exercise.duration} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Calories</p>
                        <p className="font-semibold text-gray-900">{exercise.caloriesBurned}</p>
                      </div>
                      {exercise.distance && (
                        <div>
                          <p className="text-xs text-gray-600">Distance</p>
                          <p className="font-semibold text-gray-900">{exercise.distance} km</p>
                        </div>
                      )}
                    </div>

                    {exercise.notes && (
                      <p className="text-sm text-gray-600 mt-2">{exercise.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExerciseLog;
