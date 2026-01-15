import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Food analysis
export const analyzeFoodImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post('/analyze-food', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Meals
export const getMeals = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get('/meals', { params });
  return response.data;
};

export const addMeal = async (mealData) => {
  const response = await api.post('/meals', mealData);
  return response.data;
};

export const deleteMeal = async (mealId) => {
  const response = await api.delete(`/meals/${mealId}`);
  return response.data;
};

// Statistics
export const getStats = async (period = 'week') => {
  const response = await api.get('/stats', { params: { period } });
  return response.data;
};

// Weight
export const getWeightHistory = async () => {
  const response = await api.get('/weight');
  return response.data;
};

export const addWeightEntry = async (entry) => {
  const response = await api.post('/weight', entry);
  return response.data;
};

// Profile
export const getUserProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const updateUserProfile = async (profile) => {
  const response = await api.put('/profile', profile);
  return response.data;
};

// Water
export const getWaterIntake = async (date) => {
  const params = date ? { date } : {};
  const response = await api.get('/water', { params });
  return response.data;
};

export const addWaterIntake = async (entry) => {
  const response = await api.post('/water', entry);
  return response.data;
};

// Exercises
export const getExercises = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get('/exercises', { params });
  return response.data;
};

export const addExercise = async (exercise) => {
  const response = await api.post('/exercises', exercise);
  return response.data;
};

export default api;
