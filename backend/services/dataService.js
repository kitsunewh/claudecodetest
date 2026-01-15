import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const MEALS_FILE = path.join(DATA_DIR, 'meals.json');
const WEIGHT_FILE = path.join(DATA_DIR, 'weight.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const WATER_FILE = path.join(DATA_DIR, 'water.json');
const EXERCISES_FILE = path.join(DATA_DIR, 'exercises.json');

// Initialize data directory and files
async function initDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    const files = [
      { path: MEALS_FILE, data: [] },
      { path: WEIGHT_FILE, data: [] },
      { path: WATER_FILE, data: [] },
      { path: EXERCISES_FILE, data: [] },
      {
        path: PROFILE_FILE,
        data: {
          name: '',
          age: null,
          gender: '',
          height: null,
          targetWeight: null,
          dailyCalorieGoal: 2000,
          dailyWaterGoal: 8, // glasses
          activityLevel: 'moderate'
        }
      }
    ];

    for (const file of files) {
      if (!existsSync(file.path)) {
        await fs.writeFile(file.path, JSON.stringify(file.data, null, 2));
      }
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

// Initialize on module load
initDataFiles();

// Helper function to read JSON file
async function readJSON(filePath, defaultValue = []) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return defaultValue;
    }
    throw error;
  }
}

// Helper function to write JSON file
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Meal operations
export async function getMeals(startDate, endDate) {
  const meals = await readJSON(MEALS_FILE);

  if (!startDate && !endDate) {
    return meals;
  }

  return meals.filter(meal => {
    const mealDate = new Date(meal.timestamp);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    return mealDate >= start && mealDate <= end;
  });
}

export async function addMeal(mealData) {
  const meals = await readJSON(MEALS_FILE);

  const newMeal = {
    id: uuidv4(),
    timestamp: mealData.timestamp || new Date().toISOString(),
    mealType: mealData.mealType || 'snack', // breakfast, lunch, dinner, snack
    foodItems: mealData.foodItems || [],
    calories: mealData.calories || 0,
    protein: mealData.protein || 0,
    carbs: mealData.carbs || 0,
    fats: mealData.fats || 0,
    fiber: mealData.fiber || 0,
    sugar: mealData.sugar || 0,
    servingSize: mealData.servingSize || '',
    imageUrl: mealData.imageUrl || null,
    driveUrl: mealData.driveUrl || null,
    notes: mealData.notes || ''
  };

  meals.push(newMeal);
  await writeJSON(MEALS_FILE, meals);

  return newMeal;
}

export async function deleteMeal(mealId) {
  const meals = await readJSON(MEALS_FILE);
  const filtered = meals.filter(meal => meal.id !== mealId);
  await writeJSON(MEALS_FILE, filtered);
}

// Statistics operations
export async function getStats(period = 'week') {
  const meals = await readJSON(MEALS_FILE);
  const exercises = await readJSON(EXERCISES_FILE);
  const water = await readJSON(WATER_FILE);
  const profile = await readJSON(PROFILE_FILE, {});

  const now = new Date();
  let startDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const periodMeals = meals.filter(m => new Date(m.timestamp) >= startDate);
  const periodExercises = exercises.filter(e => new Date(e.timestamp) >= startDate);
  const periodWater = water.filter(w => new Date(w.date) >= startDate);

  // Calculate totals
  const totalCalories = periodMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = periodMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = periodMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFats = periodMeals.reduce((sum, m) => sum + (m.fats || 0), 0);
  const totalFiber = periodMeals.reduce((sum, m) => sum + (m.fiber || 0), 0);

  const caloriesBurned = periodExercises.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0);
  const totalWaterGlasses = periodWater.reduce((sum, w) => sum + (w.glasses || 0), 0);

  // Calculate averages
  const days = Math.max(1, Math.ceil((now - startDate) / (24 * 60 * 60 * 1000)));

  return {
    period,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFats,
    totalFiber,
    caloriesBurned,
    netCalories: totalCalories - caloriesBurned,
    avgDailyCalories: Math.round(totalCalories / days),
    avgDailyProtein: Math.round(totalProtein / days),
    avgDailyCarbs: Math.round(totalCarbs / days),
    avgDailyFats: Math.round(totalFats / days),
    totalWaterGlasses,
    avgDailyWater: Math.round(totalWaterGlasses / days),
    dailyCalorieGoal: profile.dailyCalorieGoal || 2000,
    dailyWaterGoal: profile.dailyWaterGoal || 8,
    mealCount: periodMeals.length,
    exerciseCount: periodExercises.length
  };
}

// Weight tracking operations
export async function getWeightHistory() {
  return await readJSON(WEIGHT_FILE);
}

export async function addWeightEntry(entry) {
  const history = await readJSON(WEIGHT_FILE);

  const newEntry = {
    id: uuidv4(),
    date: entry.date || new Date().toISOString().split('T')[0],
    weight: entry.weight,
    unit: entry.unit || 'kg',
    notes: entry.notes || ''
  };

  history.push(newEntry);
  history.sort((a, b) => new Date(a.date) - new Date(b.date));

  await writeJSON(WEIGHT_FILE, history);
  return newEntry;
}

// User profile operations
export async function getUserProfile() {
  return await readJSON(PROFILE_FILE, {
    name: '',
    age: null,
    gender: '',
    height: null,
    targetWeight: null,
    dailyCalorieGoal: 2000,
    dailyWaterGoal: 8,
    activityLevel: 'moderate'
  });
}

export async function updateUserProfile(updates) {
  const profile = await getUserProfile();
  const updated = { ...profile, ...updates };
  await writeJSON(PROFILE_FILE, updated);
  return updated;
}

// Water intake operations
export async function getWaterIntake(date) {
  const water = await readJSON(WATER_FILE);

  if (date) {
    return water.filter(w => w.date === date);
  }

  return water;
}

export async function addWaterIntake(entry) {
  const water = await readJSON(WATER_FILE);

  const today = new Date().toISOString().split('T')[0];
  const date = entry.date || today;

  // Check if entry for today exists
  const existing = water.find(w => w.date === date);

  if (existing) {
    existing.glasses = (existing.glasses || 0) + (entry.glasses || 1);
    existing.timestamp = new Date().toISOString();
  } else {
    water.push({
      id: uuidv4(),
      date,
      glasses: entry.glasses || 1,
      timestamp: new Date().toISOString()
    });
  }

  await writeJSON(WATER_FILE, water);
  return existing || water[water.length - 1];
}

// Exercise operations
export async function getExercises(startDate, endDate) {
  const exercises = await readJSON(EXERCISES_FILE);

  if (!startDate && !endDate) {
    return exercises;
  }

  return exercises.filter(exercise => {
    const exDate = new Date(exercise.timestamp);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    return exDate >= start && exDate <= end;
  });
}

export async function addExercise(exerciseData) {
  const exercises = await readJSON(EXERCISES_FILE);

  const newExercise = {
    id: uuidv4(),
    timestamp: exerciseData.timestamp || new Date().toISOString(),
    type: exerciseData.type || 'other', // cardio, strength, sports, other
    name: exerciseData.name || '',
    duration: exerciseData.duration || 0, // minutes
    caloriesBurned: exerciseData.caloriesBurned || 0,
    distance: exerciseData.distance || null, // km
    notes: exerciseData.notes || ''
  };

  exercises.push(newExercise);
  await writeJSON(EXERCISES_FILE, exercises);

  return newExercise;
}
