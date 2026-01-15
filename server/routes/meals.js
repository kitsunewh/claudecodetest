const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
const googleDrive = require('../services/googleDrive');
const foodAnalyzer = require('../services/foodAnalyzer');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Upload meal with image analysis
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { meal_type, meal_date, meal_time, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imagePath = req.file.path;

    // Analyze food image with AI
    const analysis = await foodAnalyzer.analyzeFoodImage(imagePath);

    // Get user's Google Drive refresh token
    db.get('SELECT google_drive_refresh_token FROM users WHERE id = ?', [userId], async (err, user) => {
      let driveFileId = null;
      let imageUrl = null;

      // Upload to Google Drive if user has connected their account
      if (!err && user && user.google_drive_refresh_token) {
        try {
          googleDrive.setCredentials(user.google_drive_refresh_token);
          const driveFile = await googleDrive.uploadFile(
            imagePath,
            `meal_${Date.now()}_${req.file.originalname}`
          );
          driveFileId = driveFile.fileId;
          imageUrl = driveFile.thumbnailLink;
        } catch (driveError) {
          console.error('Google Drive upload failed:', driveError);
          // Continue without Google Drive if it fails
        }
      }

      // Save meal to database
      const query = `
        INSERT INTO meals (
          user_id, meal_name, meal_type, calories, protein, carbs, fats,
          image_url, google_drive_id, notes, meal_date, meal_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(
        query,
        [
          userId,
          analysis.data.mealName,
          meal_type || 'snack',
          analysis.data.estimatedCalories,
          analysis.data.protein,
          analysis.data.carbs,
          analysis.data.fats,
          imageUrl,
          driveFileId,
          notes || analysis.data.notes,
          meal_date || new Date().toISOString().split('T')[0],
          meal_time || new Date().toTimeString().split(' ')[0]
        ],
        function(err) {
          // Clean up local file
          fs.unlinkSync(imagePath);

          if (err) {
            return res.status(500).json({ error: 'Failed to save meal' });
          }

          res.status(201).json({
            message: 'Meal uploaded and analyzed successfully',
            meal: {
              id: this.lastID,
              ...analysis.data,
              imageUrl,
              mealType: meal_type
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Meal upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to process meal upload' });
  }
});

// Get all meals for a user
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { start_date, end_date, meal_type } = req.query;

  let query = 'SELECT * FROM meals WHERE user_id = ?';
  const params = [userId];

  if (start_date) {
    query += ' AND meal_date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND meal_date <= ?';
    params.push(end_date);
  }

  if (meal_type) {
    query += ' AND meal_type = ?';
    params.push(meal_type);
  }

  query += ' ORDER BY meal_date DESC, meal_time DESC';

  db.all(query, params, (err, meals) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(meals);
  });
});

// Get meal by ID
router.get('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const mealId = req.params.id;

  db.get(
    'SELECT * FROM meals WHERE id = ? AND user_id = ?',
    [mealId, userId],
    (err, meal) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!meal) {
        return res.status(404).json({ error: 'Meal not found' });
      }

      res.json(meal);
    }
  );
});

// Update meal
router.put('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const mealId = req.params.id;
  const { meal_name, meal_type, calories, protein, carbs, fats, notes } = req.body;

  const query = `
    UPDATE meals
    SET meal_name = COALESCE(?, meal_name),
        meal_type = COALESCE(?, meal_type),
        calories = COALESCE(?, calories),
        protein = COALESCE(?, protein),
        carbs = COALESCE(?, carbs),
        fats = COALESCE(?, fats),
        notes = COALESCE(?, notes)
    WHERE id = ? AND user_id = ?
  `;

  db.run(
    query,
    [meal_name, meal_type, calories, protein, carbs, fats, notes, mealId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update meal' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Meal not found' });
      }

      res.json({ message: 'Meal updated successfully' });
    }
  );
});

// Delete meal
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const mealId = req.params.id;

  // Get meal to check for Google Drive file
  db.get(
    'SELECT google_drive_id, user_id FROM meals WHERE id = ? AND user_id = ?',
    [mealId, userId],
    async (err, meal) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!meal) {
        return res.status(404).json({ error: 'Meal not found' });
      }

      // Delete from Google Drive if exists
      if (meal.google_drive_id) {
        try {
          db.get('SELECT google_drive_refresh_token FROM users WHERE id = ?', [userId], async (err, user) => {
            if (!err && user && user.google_drive_refresh_token) {
              googleDrive.setCredentials(user.google_drive_refresh_token);
              await googleDrive.deleteFile(meal.google_drive_id);
            }
          });
        } catch (driveError) {
          console.error('Google Drive delete failed:', driveError);
        }
      }

      // Delete from database
      db.run('DELETE FROM meals WHERE id = ? AND user_id = ?', [mealId, userId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete meal' });
        }

        res.json({ message: 'Meal deleted successfully' });
      });
    }
  );
});

// Get today's nutrition summary
router.get('/summary/today', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  db.get(
    `SELECT
      COUNT(*) as meal_count,
      SUM(calories) as total_calories,
      SUM(protein) as total_protein,
      SUM(carbs) as total_carbs,
      SUM(fats) as total_fats
    FROM meals
    WHERE user_id = ? AND meal_date = ?`,
    [userId, today],
    (err, summary) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(summary || {
        meal_count: 0,
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fats: 0
      });
    }
  );
});

module.exports = router;
