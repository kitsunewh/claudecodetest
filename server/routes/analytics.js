const express = require('express');
const { db } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview
router.get('/dashboard', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  // Get all data in parallel using Promise.all
  const getUserQuery = new Promise((resolve, reject) => {
    db.get(
      'SELECT daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fats_goal, daily_water_goal FROM users WHERE id = ?',
      [userId],
      (err, row) => err ? reject(err) : resolve(row)
    );
  });

  const getTodayMealsQuery = new Promise((resolve, reject) => {
    db.get(
      `SELECT
        COUNT(*) as meal_count,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbs) as total_carbs,
        SUM(fats) as total_fats
      FROM meals WHERE user_id = ? AND meal_date = ?`,
      [userId, today],
      (err, row) => err ? reject(err) : resolve(row)
    );
  });

  const getTodayWaterQuery = new Promise((resolve, reject) => {
    db.get(
      'SELECT glasses FROM water_intake WHERE user_id = ? AND entry_date = ?',
      [userId, today],
      (err, row) => err ? reject(err) : resolve(row)
    );
  });

  const getTodayExerciseQuery = new Promise((resolve, reject) => {
    db.get(
      `SELECT
        COUNT(*) as exercise_count,
        SUM(duration) as total_duration,
        SUM(calories_burned) as total_calories_burned
      FROM exercises WHERE user_id = ? AND entry_date = ?`,
      [userId, today],
      (err, row) => err ? reject(err) : resolve(row)
    );
  });

  const getLatestWeightQuery = new Promise((resolve, reject) => {
    db.get(
      'SELECT weight, entry_date FROM weight_entries WHERE user_id = ? ORDER BY entry_date DESC LIMIT 1',
      [userId],
      (err, row) => err ? reject(err) : resolve(row)
    );
  });

  Promise.all([
    getUserQuery,
    getTodayMealsQuery,
    getTodayWaterQuery,
    getTodayExerciseQuery,
    getLatestWeightQuery
  ])
    .then(([user, meals, water, exercise, weight]) => {
      const caloriesConsumed = meals?.total_calories || 0;
      const caloriesBurned = exercise?.total_calories_burned || 0;
      const netCalories = caloriesConsumed - caloriesBurned;

      res.json({
        goals: {
          calories: user?.daily_calorie_goal || 2000,
          protein: user?.daily_protein_goal || 150,
          carbs: user?.daily_carbs_goal || 200,
          fats: user?.daily_fats_goal || 65,
          water: user?.daily_water_goal || 8
        },
        today: {
          calories: caloriesConsumed,
          protein: meals?.total_protein || 0,
          carbs: meals?.total_carbs || 0,
          fats: meals?.total_fats || 0,
          water: water?.glasses || 0,
          meals: meals?.meal_count || 0,
          exercises: exercise?.exercise_count || 0,
          caloriesBurned,
          netCalories
        },
        weight: weight || null
      });
    })
    .catch(err => {
      console.error('Dashboard error:', err);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    });
});

// Get weekly trends
router.get('/weekly', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const startDate = sevenDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const getMealsQuery = new Promise((resolve, reject) => {
    db.all(
      `SELECT meal_date,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbs) as total_carbs,
        SUM(fats) as total_fats
      FROM meals
      WHERE user_id = ? AND meal_date BETWEEN ? AND ?
      GROUP BY meal_date
      ORDER BY meal_date`,
      [userId, startDate, endDate],
      (err, rows) => err ? reject(err) : resolve(rows)
    );
  });

  const getExercisesQuery = new Promise((resolve, reject) => {
    db.all(
      `SELECT entry_date,
        SUM(calories_burned) as total_calories_burned,
        SUM(duration) as total_duration
      FROM exercises
      WHERE user_id = ? AND entry_date BETWEEN ? AND ?
      GROUP BY entry_date
      ORDER BY entry_date`,
      [userId, startDate, endDate],
      (err, rows) => err ? reject(err) : resolve(rows)
    );
  });

  const getWaterQuery = new Promise((resolve, reject) => {
    db.all(
      'SELECT entry_date, glasses FROM water_intake WHERE user_id = ? AND entry_date BETWEEN ? AND ? ORDER BY entry_date',
      [userId, startDate, endDate],
      (err, rows) => err ? reject(err) : resolve(rows)
    );
  });

  const getWeightQuery = new Promise((resolve, reject) => {
    db.all(
      'SELECT entry_date, weight FROM weight_entries WHERE user_id = ? AND entry_date BETWEEN ? AND ? ORDER BY entry_date',
      [userId, startDate, endDate],
      (err, rows) => err ? reject(err) : resolve(rows)
    );
  });

  Promise.all([getMealsQuery, getExercisesQuery, getWaterQuery, getWeightQuery])
    .then(([meals, exercises, water, weight]) => {
      res.json({
        meals,
        exercises,
        water,
        weight
      });
    })
    .catch(err => {
      console.error('Weekly trends error:', err);
      res.status(500).json({ error: 'Failed to fetch weekly trends' });
    });
});

// Get monthly statistics
router.get('/monthly', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startDate = firstDayOfMonth.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const getStatsQuery = new Promise((resolve, reject) => {
    db.get(
      `SELECT
        COUNT(DISTINCT meal_date) as days_tracked,
        AVG(daily_calories) as avg_daily_calories,
        AVG(daily_protein) as avg_daily_protein
      FROM (
        SELECT meal_date,
          SUM(calories) as daily_calories,
          SUM(protein) as daily_protein
        FROM meals
        WHERE user_id = ? AND meal_date BETWEEN ? AND ?
        GROUP BY meal_date
      )`,
      [userId, startDate, endDate],
      (err, row) => err ? reject(err) : resolve(row)
    );
  });

  const getExerciseStatsQuery = new Promise((resolve, reject) => {
    db.get(
      `SELECT
        COUNT(*) as total_workouts,
        SUM(duration) as total_duration,
        SUM(calories_burned) as total_calories_burned
      FROM exercises
      WHERE user_id = ? AND entry_date BETWEEN ? AND ?`,
      [userId, startDate, endDate],
      (err, row) => err ? reject(err) : resolve(row)
    );
  });

  Promise.all([getStatsQuery, getExerciseStatsQuery])
    .then(([mealStats, exerciseStats]) => {
      res.json({
        period: {
          start: startDate,
          end: endDate
        },
        meals: mealStats,
        exercise: exerciseStats
      });
    })
    .catch(err => {
      console.error('Monthly stats error:', err);
      res.status(500).json({ error: 'Failed to fetch monthly statistics' });
    });
});

module.exports = router;
