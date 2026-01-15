import sqlite3 from 'sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, '../database/health_tracker.db')

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err)
  } else {
    console.log('Connected to SQLite database')
    initializeDatabase()
  }
})

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Meals table
    db.run(`
      CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        food_name TEXT NOT NULL,
        calories INTEGER NOT NULL,
        protein REAL DEFAULT 0,
        carbs REAL DEFAULT 0,
        fats REAL DEFAULT 0,
        meal_type TEXT,
        image_url TEXT,
        timestamp DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Weight logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS weight_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        weight REAL NOT NULL,
        date DATE NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Goals table
    db.run(`
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        daily_calorie_goal INTEGER DEFAULT 2000,
        protein_goal REAL DEFAULT 150,
        carbs_goal REAL DEFAULT 200,
        fats_goal REAL DEFAULT 65,
        water_goal INTEGER DEFAULT 8,
        target_weight REAL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Water intake table
    db.run(`
      CREATE TABLE IF NOT EXISTS water_intake (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        date DATE NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Exercise table
    db.run(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        exercise_name TEXT NOT NULL,
        duration INTEGER,
        calories_burned INTEGER,
        timestamp DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    console.log('Database tables initialized')
  })
}

// Helper function to run queries with promises
export const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err)
      else resolve({ id: this.lastID, changes: this.changes })
    })
  })
}

export const getOne = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

export const getAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

export default db
