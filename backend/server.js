import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Import route handlers
import { analyzeFoodImage } from './services/aiService.js';
import { uploadToGoogleDrive, initGoogleDrive } from './services/driveService.js';
import {
  getMeals,
  addMeal,
  deleteMeal,
  getStats,
  getWeightHistory,
  addWeightEntry,
  getUserProfile,
  updateUserProfile,
  getWaterIntake,
  addWaterIntake,
  getExercises,
  addExercise
} from './services/dataService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = join(__dirname, 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Initialize Google Drive
initGoogleDrive().catch(console.error);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HealthTrack API is running' });
});

// Food image analysis endpoint
app.post('/api/analyze-food', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Analyzing food image:', req.file.filename);

    // Analyze image with AI
    const analysis = await analyzeFoodImage(req.file.path);

    // Upload to Google Drive
    let driveUrl = null;
    try {
      driveUrl = await uploadToGoogleDrive(req.file.path, req.file.filename);
    } catch (driveError) {
      console.error('Google Drive upload failed:', driveError.message);
      // Continue without drive URL
    }

    // Clean up local file
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.error('Failed to delete local file:', unlinkError);
    }

    res.json({
      ...analysis,
      driveUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Food analysis error:', error);

    // Clean up file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete local file:', unlinkError);
      }
    }

    res.status(500).json({
      error: 'Failed to analyze food image',
      details: error.message
    });
  }
});

// Meal endpoints
app.get('/api/meals', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const meals = await getMeals(startDate, endDate);
    res.json(meals);
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ error: 'Failed to retrieve meals' });
  }
});

app.post('/api/meals', async (req, res) => {
  try {
    const meal = await addMeal(req.body);
    res.status(201).json(meal);
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(500).json({ error: 'Failed to add meal' });
  }
});

app.delete('/api/meals/:id', async (req, res) => {
  try {
    await deleteMeal(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

// Statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const { period } = req.query; // 'day', 'week', 'month'
    const stats = await getStats(period || 'week');
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// Weight tracking endpoints
app.get('/api/weight', async (req, res) => {
  try {
    const history = await getWeightHistory();
    res.json(history);
  } catch (error) {
    console.error('Get weight error:', error);
    res.status(500).json({ error: 'Failed to retrieve weight history' });
  }
});

app.post('/api/weight', async (req, res) => {
  try {
    const entry = await addWeightEntry(req.body);
    res.status(201).json(entry);
  } catch (error) {
    console.error('Add weight error:', error);
    res.status(500).json({ error: 'Failed to add weight entry' });
  }
});

// User profile endpoints
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await getUserProfile();
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    const profile = await updateUserProfile(req.body);
    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Water intake endpoints
app.get('/api/water', async (req, res) => {
  try {
    const { date } = req.query;
    const intake = await getWaterIntake(date);
    res.json(intake);
  } catch (error) {
    console.error('Get water error:', error);
    res.status(500).json({ error: 'Failed to retrieve water intake' });
  }
});

app.post('/api/water', async (req, res) => {
  try {
    const entry = await addWaterIntake(req.body);
    res.status(201).json(entry);
  } catch (error) {
    console.error('Add water error:', error);
    res.status(500).json({ error: 'Failed to add water intake' });
  }
});

// Exercise endpoints
app.get('/api/exercises', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const exercises = await getExercises(startDate, endDate);
    res.json(exercises);
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ error: 'Failed to retrieve exercises' });
  }
});

app.post('/api/exercises', async (req, res) => {
  try {
    const exercise = await addExercise(req.body);
    res.status(201).json(exercise);
  } catch (error) {
    console.error('Add exercise error:', error);
    res.status(500).json({ error: 'Failed to add exercise' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HealthTrack API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
