import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth
export const loginUser = async (username, password) => {
  const response = await api.post('/auth/login', { username, password })
  return response.data
}

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

// Meals
export const logMeal = async (formData) => {
  const response = await api.post('/meals', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getMeals = async (userId, date) => {
  const response = await api.get(`/meals/${userId}`, {
    params: { date },
  })
  return response.data
}

export const deleteMeal = async (mealId) => {
  const response = await api.delete(`/meals/${mealId}`)
  return response.data
}

export const updateMeal = async (mealId, data) => {
  const response = await api.put(`/meals/${mealId}`, data)
  return response.data
}

// Weight
export const logWeight = async (userId, weight, date) => {
  const response = await api.post('/weight', { userId, weight, date })
  return response.data
}

export const getWeightHistory = async (userId, days = 30) => {
  const response = await api.get(`/weight/${userId}`, {
    params: { days },
  })
  return response.data
}

// Goals
export const updateGoals = async (userId, goals) => {
  const response = await api.put(`/goals/${userId}`, goals)
  return response.data
}

export const getGoals = async (userId) => {
  const response = await api.get(`/goals/${userId}`)
  return response.data
}

// Water intake
export const logWater = async (userId, amount, date) => {
  const response = await api.post('/water', { userId, amount, date })
  return response.data
}

export const getWaterIntake = async (userId, date) => {
  const response = await api.get(`/water/${userId}`, {
    params: { date },
  })
  return response.data
}

// Exercise
export const logExercise = async (exerciseData) => {
  const response = await api.post('/exercise', exerciseData)
  return response.data
}

export const getExercises = async (userId, date) => {
  const response = await api.get(`/exercise/${userId}`, {
    params: { date },
  })
  return response.data
}

// Statistics
export const getStatistics = async (userId, days = 7) => {
  const response = await api.get(`/statistics/${userId}`, {
    params: { days },
  })
  return response.data
}

export default api
