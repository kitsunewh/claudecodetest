const express = require('express');
const { db } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Add exercise entry
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { exercise_name, exercise_type, duration, calories_burned, entry_date, entry_time, notes } = req.body;

  if (!exercise_name || !duration || !calories_burned) {
    return res.status(400).json({ error: 'Exercise name, duration, and calories burned are required' });
  }

  const query = `
    INSERT INTO exercises (
      user_id, exercise_name, exercise_type, duration, calories_burned,
      entry_date, entry_time, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      userId,
      exercise_name,
      exercise_type || 'other',
      duration,
      calories_burned,
      entry_date || new Date().toISOString().split('T')[0],
      entry_time || new Date().toTimeString().split(' ')[0],
      notes || null
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add exercise entry' });
      }

      res.status(201).json({
        message: 'Exercise entry added successfully',
        id: this.lastID
      });
    }
  );
});

// Get all exercises
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { start_date, end_date, exercise_type } = req.query;

  let query = 'SELECT * FROM exercises WHERE user_id = ?';
  const params = [userId];

  if (start_date) {
    query += ' AND entry_date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND entry_date <= ?';
    params.push(end_date);
  }

  if (exercise_type) {
    query += ' AND exercise_type = ?';
    params.push(exercise_type);
  }

  query += ' ORDER BY entry_date DESC, entry_time DESC';

  db.all(query, params, (err, exercises) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(exercises);
  });
});

// Get today's exercise summary
router.get('/summary/today', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  db.get(
    `SELECT
      COUNT(*) as exercise_count,
      SUM(duration) as total_duration,
      SUM(calories_burned) as total_calories_burned
    FROM exercises
    WHERE user_id = ? AND entry_date = ?`,
    [userId, today],
    (err, summary) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(summary || {
        exercise_count: 0,
        total_duration: 0,
        total_calories_burned: 0
      });
    }
  );
});

// Update exercise entry
router.put('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const exerciseId = req.params.id;
  const { exercise_name, exercise_type, duration, calories_burned, notes } = req.body;

  const query = `
    UPDATE exercises
    SET exercise_name = COALESCE(?, exercise_name),
        exercise_type = COALESCE(?, exercise_type),
        duration = COALESCE(?, duration),
        calories_burned = COALESCE(?, calories_burned),
        notes = COALESCE(?, notes)
    WHERE id = ? AND user_id = ?
  `;

  db.run(
    query,
    [exercise_name, exercise_type, duration, calories_burned, notes, exerciseId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update exercise entry' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Exercise entry not found' });
      }

      res.json({ message: 'Exercise entry updated successfully' });
    }
  );
});

// Delete exercise entry
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const exerciseId = req.params.id;

  db.run(
    'DELETE FROM exercises WHERE id = ? AND user_id = ?',
    [exerciseId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete exercise entry' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Exercise entry not found' });
      }

      res.json({ message: 'Exercise entry deleted successfully' });
    }
  );
});

module.exports = router;
