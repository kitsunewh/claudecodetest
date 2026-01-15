import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EXERCISE_TYPES = [
  { value: 'cardio', label: 'Cardio', emoji: '🏃' },
  { value: 'strength', label: 'Strength Training', emoji: '💪' },
  { value: 'yoga', label: 'Yoga', emoji: '🧘' },
  { value: 'sports', label: 'Sports', emoji: '⚽' },
  { value: 'walking', label: 'Walking', emoji: '🚶' },
  { value: 'cycling', label: 'Cycling', emoji: '🚴' },
  { value: 'swimming', label: 'Swimming', emoji: '🏊' },
  { value: 'other', label: 'Other', emoji: '🏋️' }
];

function Exercise() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [todaySummary, setTodaySummary] = useState(null);
  const [newExercise, setNewExercise] = useState({
    exercise_name: '',
    exercise_type: 'cardio',
    duration: '',
    calories_burned: '',
    entry_date: new Date().toISOString().split('T')[0],
    entry_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    notes: ''
  });

  useEffect(() => {
    fetchExercises();
    fetchTodaySummary();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await axios.get(`${API_URL}/exercise`);
      setExercises(response.data);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaySummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/exercise/summary/today`);
      setTodaySummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/exercise`, newExercise);
      setShowAddModal(false);
      setNewExercise({
        exercise_name: '',
        exercise_type: 'cardio',
        duration: '',
        calories_burned: '',
        entry_date: new Date().toISOString().split('T')[0],
        entry_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        notes: ''
      });
      fetchExercises();
      fetchTodaySummary();
    } catch (error) {
      console.error('Failed to add exercise:', error);
      alert('Failed to add exercise');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exercise?')) return;

    try {
      await axios.delete(`${API_URL}/exercise/${id}`);
      fetchExercises();
      fetchTodaySummary();
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  };

  const getExerciseEmoji = (type) => {
    const exercise = EXERCISE_TYPES.find(e => e.value === type);
    return exercise ? exercise.emoji : '🏋️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Exercise Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Log your workouts and track calories burned
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          + Add Exercise
        </button>
      </div>

      {/* Today's Summary */}
      {todaySummary && todaySummary.exercise_count > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="text-sm opacity-90 mb-1">Workouts Today</div>
            <div className="text-4xl font-bold">{todaySummary.exercise_count}</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Total Duration</div>
            <div className="text-4xl font-bold">{todaySummary.total_duration} min</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Calories Burned</div>
            <div className="text-4xl font-bold">{todaySummary.total_calories_burned}</div>
          </div>
        </div>
      )}

      {/* Exercise List */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Exercise History</h2>
        {exercises.length > 0 ? (
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="text-4xl">{getExerciseEmoji(exercise.exercise_type)}</div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{exercise.exercise_name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {exercise.exercise_type} • {exercise.duration} min • {exercise.calories_burned} cal burned
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {exercise.entry_date} at {exercise.entry_time}
                    </div>
                    {exercise.notes && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">
                        {exercise.notes}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(exercise.id)}
                  className="btn btn-danger text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💪</div>
            <h3 className="text-xl font-bold mb-2">No exercises logged yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start tracking your workouts to see your progress
            </p>
          </div>
        )}
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Exercise</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Exercise Name</label>
                <input
                  type="text"
                  value={newExercise.exercise_name}
                  onChange={(e) => setNewExercise({...newExercise, exercise_name: e.target.value})}
                  className="input"
                  placeholder="Morning jog"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Exercise Type</label>
                <select
                  value={newExercise.exercise_type}
                  onChange={(e) => setNewExercise({...newExercise, exercise_type: e.target.value})}
                  className="input"
                >
                  {EXERCISE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newExercise.duration}
                    onChange={(e) => setNewExercise({...newExercise, duration: e.target.value})}
                    className="input"
                    placeholder="30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Calories Burned</label>
                  <input
                    type="number"
                    value={newExercise.calories_burned}
                    onChange={(e) => setNewExercise({...newExercise, calories_burned: e.target.value})}
                    className="input"
                    placeholder="200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={newExercise.entry_date}
                    onChange={(e) => setNewExercise({...newExercise, entry_date: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={newExercise.entry_time}
                    onChange={(e) => setNewExercise({...newExercise, entry_time: e.target.value})}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={newExercise.notes}
                  onChange={(e) => setNewExercise({...newExercise, notes: e.target.value})}
                  className="input"
                  rows="3"
                  placeholder="How did it go?"
                />
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="flex-1 btn btn-primary">
                  Add Exercise
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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

export default Exercise;
