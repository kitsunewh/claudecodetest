import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Weight() {
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWeight, setNewWeight] = useState({
    weight: '',
    entry_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchWeights();
  }, []);

  const fetchWeights = async () => {
    try {
      const response = await axios.get(`${API_URL}/weight`);
      setWeights(response.data);
    } catch (error) {
      console.error('Failed to fetch weights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/weight`, newWeight);
      setShowAddModal(false);
      setNewWeight({
        weight: '',
        entry_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchWeights();
    } catch (error) {
      console.error('Failed to add weight:', error);
      alert('Failed to add weight entry');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this weight entry?')) return;

    try {
      await axios.delete(`${API_URL}/weight/${id}`);
      fetchWeights();
    } catch (error) {
      console.error('Failed to delete weight:', error);
    }
  };

  const chartData = [...weights].reverse().map(w => ({
    date: w.entry_date,
    weight: w.weight
  }));

  const latestWeight = weights[0];
  const oldestWeight = weights[weights.length - 1];
  const weightChange = latestWeight && oldestWeight ? (latestWeight.weight - oldestWeight.weight).toFixed(1) : 0;

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
          <h1 className="text-3xl font-bold mb-2">Weight Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your weight progress over time
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          + Add Weight
        </button>
      </div>

      {/* Stats Cards */}
      {weights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="text-sm opacity-90 mb-1">Current Weight</div>
            <div className="text-4xl font-bold">{latestWeight.weight} kg</div>
            <div className="text-sm opacity-90 mt-2">{latestWeight.entry_date}</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Weight Change</div>
            <div className="text-4xl font-bold">
              {weightChange > 0 ? '+' : ''}{weightChange} kg
            </div>
            <div className="text-sm opacity-90 mt-2">
              {weightChange < 0 ? 'Lost' : 'Gained'} since start
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Total Entries</div>
            <div className="text-4xl font-bold">{weights.length}</div>
            <div className="text-sm opacity-90 mt-2">Weight logs recorded</div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Weight Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weight History */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Weight History</h2>
        {weights.length > 0 ? (
          <div className="space-y-3">
            {weights.map((weight) => (
              <div key={weight.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="font-bold text-lg">{weight.weight} kg</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{weight.entry_date}</div>
                  {weight.notes && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">
                      {weight.notes}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(weight.id)}
                  className="btn btn-danger text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">⚖️</div>
            <h3 className="text-xl font-bold mb-2">No weight entries yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start tracking your weight to see your progress
            </p>
          </div>
        )}
      </div>

      {/* Add Weight Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Weight Entry</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight.weight}
                  onChange={(e) => setNewWeight({...newWeight, weight: e.target.value})}
                  className="input"
                  placeholder="75.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={newWeight.entry_date}
                  onChange={(e) => setNewWeight({...newWeight, entry_date: e.target.value})}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={newWeight.notes}
                  onChange={(e) => setNewWeight({...newWeight, notes: e.target.value})}
                  className="input"
                  rows="3"
                  placeholder="How are you feeling?"
                />
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="flex-1 btn btn-primary">
                  Add Entry
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

export default Weight;
