import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

import { runQuery, getOne, getAll } from './database.js'
import { initializeDrive, uploadImageToDrive, deleteImageFromDrive } from './googleDrive.js'
import { analyzeFoodImage, searchFoodByName } from './aiService.js'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use('/uploads', express.static(uploadsDir))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

// Initialize Google Drive
initializeDrive()

// ============ AUTH ROUTES ============

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name, email } = req.body

    // Check if user exists
    const existingUser = await getOne('SELECT * FROM users WHERE username = ?', [username])
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await runQuery(
      'INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, name, email]
    )

    // Create default goals for user
    await runQuery('INSERT INTO goals (user_id) VALUES (?)', [result.id])

    const user = await getOne('SELECT id, username, name, email FROM users WHERE id = ?', [
      result.id,
    ])

    res.json(user)
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await getOne('SELECT * FROM users WHERE username = ?', [username])

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const { password: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// ============ MEAL ROUTES ============

app.post('/api/meals', upload.single('image'), async (req, res) => {
  try {
    const { userId, foodName, calories, protein, carbs, fats, mealType, timestamp } = req.body

    let imageUrl = null

    if (req.file) {
      // Upload to Google Drive or use local path
      imageUrl = await uploadImageToDrive(req.file.path, req.file.filename)

      // If using local storage, construct the URL
      if (imageUrl.startsWith('/uploads/')) {
        imageUrl = `http://localhost:${PORT}${imageUrl}`
      }
    }

    const result = await runQuery(
      `INSERT INTO meals (user_id, food_name, calories, protein, carbs, fats, meal_type, image_url, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, foodName, calories, protein, carbs, fats, mealType, imageUrl, timestamp]
    )

    const meal = await getOne('SELECT * FROM meals WHERE id = ?', [result.id])
    res.json(meal)
  } catch (error) {
    console.error('Error logging meal:', error)
    res.status(500).json({ error: 'Failed to log meal' })
  }
})

app.get('/api/meals/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { date } = req.query

    let query = 'SELECT * FROM meals WHERE user_id = ?'
    const params = [userId]

    if (date) {
      query += ' AND DATE(timestamp) = ?'
      params.push(date)
    }

    query += ' ORDER BY timestamp DESC'

    const meals = await getAll(query, params)
    res.json(meals)
  } catch (error) {
    console.error('Error fetching meals:', error)
    res.status(500).json({ error: 'Failed to fetch meals' })
  }
})

app.delete('/api/meals/:mealId', async (req, res) => {
  try {
    const { mealId } = req.params

    // Get meal to delete image
    const meal = await getOne('SELECT image_url FROM meals WHERE id = ?', [mealId])

    if (meal && meal.image_url) {
      await deleteImageFromDrive(meal.image_url)
    }

    await runQuery('DELETE FROM meals WHERE id = ?', [mealId])
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting meal:', error)
    res.status(500).json({ error: 'Failed to delete meal' })
  }
})

app.put('/api/meals/:mealId', async (req, res) => {
  try {
    const { mealId } = req.params
    const { foodName, calories, protein, carbs, fats } = req.body

    await runQuery(
      'UPDATE meals SET food_name = ?, calories = ?, protein = ?, carbs = ?, fats = ? WHERE id = ?',
      [foodName, calories, protein, carbs, fats, mealId]
    )

    const meal = await getOne('SELECT * FROM meals WHERE id = ?', [mealId])
    res.json(meal)
  } catch (error) {
    console.error('Error updating meal:', error)
    res.status(500).json({ error: 'Failed to update meal' })
  }
})

// ============ WEIGHT ROUTES ============

app.post('/api/weight', async (req, res) => {
  try {
    const { userId, weight, date } = req.body

    // Check if weight already logged for this date
    const existing = await getOne(
      'SELECT * FROM weight_logs WHERE user_id = ? AND date = ?',
      [userId, date]
    )

    if (existing) {
      // Update existing
      await runQuery('UPDATE weight_logs SET weight = ? WHERE id = ?', [weight, existing.id])
      const updated = await getOne('SELECT * FROM weight_logs WHERE id = ?', [existing.id])
      return res.json(updated)
    }

    // Create new
    const result = await runQuery('INSERT INTO weight_logs (user_id, weight, date) VALUES (?, ?, ?)', [
      userId,
      weight,
      date,
    ])

    const log = await getOne('SELECT * FROM weight_logs WHERE id = ?', [result.id])
    res.json(log)
  } catch (error) {
    console.error('Error logging weight:', error)
    res.status(500).json({ error: 'Failed to log weight' })
  }
})

app.get('/api/weight/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { days = 30 } = req.query

    const logs = await getAll(
      `SELECT * FROM weight_logs
       WHERE user_id = ?
       AND date >= DATE('now', '-' || ? || ' days')
       ORDER BY date DESC`,
      [userId, days]
    )

    res.json(logs)
  } catch (error) {
    console.error('Error fetching weight logs:', error)
    res.status(500).json({ error: 'Failed to fetch weight logs' })
  }
})

// ============ GOALS ROUTES ============

app.get('/api/goals/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    let goals = await getOne('SELECT * FROM goals WHERE user_id = ?', [userId])

    if (!goals) {
      // Create default goals
      await runQuery('INSERT INTO goals (user_id) VALUES (?)', [userId])
      goals = await getOne('SELECT * FROM goals WHERE user_id = ?', [userId])
    }

    res.json(goals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    res.status(500).json({ error: 'Failed to fetch goals' })
  }
})

app.put('/api/goals/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { daily_calorie_goal, protein_goal, carbs_goal, fats_goal, water_goal, target_weight } =
      req.body

    await runQuery(
      `UPDATE goals
       SET daily_calorie_goal = ?, protein_goal = ?, carbs_goal = ?, fats_goal = ?, water_goal = ?, target_weight = ?
       WHERE user_id = ?`,
      [daily_calorie_goal, protein_goal, carbs_goal, fats_goal, water_goal, target_weight, userId]
    )

    const goals = await getOne('SELECT * FROM goals WHERE user_id = ?', [userId])
    res.json(goals)
  } catch (error) {
    console.error('Error updating goals:', error)
    res.status(500).json({ error: 'Failed to update goals' })
  }
})

// ============ WATER ROUTES ============

app.post('/api/water', async (req, res) => {
  try {
    const { userId, amount, date } = req.body

    const result = await runQuery(
      'INSERT INTO water_intake (user_id, amount, date) VALUES (?, ?, ?)',
      [userId, amount, date]
    )

    const log = await getOne('SELECT * FROM water_intake WHERE id = ?', [result.id])
    res.json(log)
  } catch (error) {
    console.error('Error logging water:', error)
    res.status(500).json({ error: 'Failed to log water' })
  }
})

app.get('/api/water/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { date } = req.query

    const result = await getOne(
      'SELECT SUM(amount) as total FROM water_intake WHERE user_id = ? AND date = ?',
      [userId, date]
    )

    res.json({ total: result?.total || 0 })
  } catch (error) {
    console.error('Error fetching water intake:', error)
    res.status(500).json({ error: 'Failed to fetch water intake' })
  }
})

// ============ EXERCISE ROUTES ============

app.post('/api/exercise', async (req, res) => {
  try {
    const { userId, exerciseName, duration, caloriesBurned, timestamp } = req.body

    const result = await runQuery(
      'INSERT INTO exercises (user_id, exercise_name, duration, calories_burned, timestamp) VALUES (?, ?, ?, ?, ?)',
      [userId, exerciseName, duration, caloriesBurned, timestamp]
    )

    const exercise = await getOne('SELECT * FROM exercises WHERE id = ?', [result.id])
    res.json(exercise)
  } catch (error) {
    console.error('Error logging exercise:', error)
    res.status(500).json({ error: 'Failed to log exercise' })
  }
})

app.get('/api/exercise/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { date } = req.query

    let query = 'SELECT * FROM exercises WHERE user_id = ?'
    const params = [userId]

    if (date) {
      query += ' AND DATE(timestamp) = ?'
      params.push(date)
    }

    query += ' ORDER BY timestamp DESC'

    const exercises = await getAll(query, params)
    res.json(exercises)
  } catch (error) {
    console.error('Error fetching exercises:', error)
    res.status(500).json({ error: 'Failed to fetch exercises' })
  }
})

// ============ STATISTICS ROUTES ============

app.get('/api/statistics/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { days = 7 } = req.query

    // Get daily calorie totals
    const dailyStats = await getAll(
      `SELECT DATE(timestamp) as date,
              SUM(calories) as calories,
              COUNT(*) as meals
       FROM meals
       WHERE user_id = ?
       AND DATE(timestamp) >= DATE('now', '-' || ? || ' days')
       GROUP BY DATE(timestamp)
       ORDER BY date DESC`,
      [userId, days]
    )

    // Get goals
    const goals = await getOne('SELECT daily_calorie_goal FROM goals WHERE user_id = ?', [userId])

    // Calculate streak
    const allMeals = await getAll(
      `SELECT DISTINCT DATE(timestamp) as date
       FROM meals
       WHERE user_id = ?
       ORDER BY date DESC`,
      [userId]
    )

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const meal of allMeals) {
      const mealDate = new Date(meal.date)
      mealDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((currentDate - mealDate) / (1000 * 60 * 60 * 24))

      if (daysDiff === streak) {
        streak++
      } else {
        break
      }
    }

    // Add goal to daily stats
    const daily = dailyStats.map((d) => ({
      ...d,
      goal: goals?.daily_calorie_goal || 2000,
    }))

    res.json({
      daily,
      totalMeals: dailyStats.reduce((sum, d) => sum + d.meals, 0),
      streakDays: streak,
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

// ============ AI ANALYSIS ROUTE ============

app.post('/api/analyze-food', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' })
    }

    const nutritionData = await analyzeFoodImage(req.file.path)

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path)

    res.json(nutritionData)
  } catch (error) {
    console.error('Error analyzing food:', error)
    res.status(500).json({ error: 'Failed to analyze food' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Health Tracker API is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api`)
})
