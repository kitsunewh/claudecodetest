import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { getWeightHistory, addWeightEntry, getUserProfile } from '../utils/api';
import { format } from 'date-fns';

function WeightTracker() {
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [weightData, profileData] = await Promise.all([
        getWeightHistory(),
        getUserProfile()
      ]);
      setHistory(weightData);
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!newWeight) return;

    try {
      await addWeightEntry({
        weight: parseFloat(newWeight),
        date: newDate,
        notes,
        unit: 'kg'
      });

      setNewWeight('');
      setNotes('');
      setNewDate(new Date().toISOString().split('T')[0]);
      await loadData();
    } catch (error) {
      console.error('Failed to add weight:', error);
      alert('Failed to add weight entry');
    }
  };

  const chartData = {
    labels: history.map(h => format(new Date(h.date), 'MMM d')),
    datasets: [{
      label: 'Weight (kg)',
      data: history.map(h => h.weight),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const currentWeight = history.length > 0 ? history[history.length - 1].weight : null;
  const startWeight = history.length > 0 ? history[0].weight : null;
  const weightChange = currentWeight && startWeight ? currentWeight - startWeight : 0;
  const targetWeight = profile?.targetWeight;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Weight Tracker</h1>
        <p className="text-gray-600 mt-1">Monitor your weight progress over time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-gray-700 font-medium">Current Weight</p>
          <p className="text-4xl font-bold text-blue-700 mt-2">{currentWeight || '-'} kg</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <p className="text-sm text-gray-700 font-medium">Target Weight</p>
          <p className="text-4xl font-bold text-purple-700 mt-2">{targetWeight || '-'} kg</p>
        </div>

        <div className={`card bg-gradient-to-br ${weightChange < 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
          <p className="text-sm text-gray-700 font-medium">Total Change</p>
          <div className="flex items-center space-x-2 mt-2">
            <p className={`text-4xl font-bold ${weightChange < 0 ? 'text-green-700' : 'text-orange-700'}`}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
            </p>
            {weightChange < 0 ? <TrendingDown className="text-green-700" /> : <TrendingUp className="text-orange-700" />}
          </div>
        </div>
      </div>

      {/* Add Weight Form */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Log Weight</h3>
        <form onSubmit={handleAddWeight} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="70.5"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Feeling great!"
              className="input-field"
            />
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center space-x-2">
            <Plus size={20} />
            <span>Add Weight Entry</span>
          </button>
        </form>
      </div>

      {/* Chart */}
      {history.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Weight Progress</h3>
          <div className="h-80">
            <Line
              data={chartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: false
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* History */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">History</h3>
        {history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No weight entries yet</p>
        ) : (
          <div className="space-y-2">
            {history.slice().reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{entry.weight} kg</p>
                  <p className="text-sm text-gray-600">{format(new Date(entry.date), 'MMM d, yyyy')}</p>
                  {entry.notes && <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WeightTracker;
