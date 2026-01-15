const express = require('express');
const { db } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Add/Update water intake for a day
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { glasses, entry_date } = req.body;

  if (glasses === undefined) {
    return res.status(400).json({ error: 'Number of glasses is required' });
  }

  const date = entry_date || new Date().toISOString().split('T')[0];

  // Check if entry exists for this date
  db.get(
    'SELECT id FROM water_intake WHERE user_id = ? AND entry_date = ?',
    [userId, date],
    (err, existing) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existing) {
        // Update existing entry
        db.run(
          'UPDATE water_intake SET glasses = ? WHERE user_id = ? AND entry_date = ?',
          [glasses, userId, date],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update water intake' });
            }

            res.json({ message: 'Water intake updated successfully', id: existing.id });
          }
        );
      } else {
        // Create new entry
        db.run(
          'INSERT INTO water_intake (user_id, glasses, entry_date) VALUES (?, ?, ?)',
          [userId, glasses, date],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to add water intake' });
            }

            res.status(201).json({
              message: 'Water intake added successfully',
              id: this.lastID
            });
          }
        );
      }
    }
  );
});

// Increment water intake for today
router.post('/increment', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  db.get(
    'SELECT id, glasses FROM water_intake WHERE user_id = ? AND entry_date = ?',
    [userId, today],
    (err, existing) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existing) {
        db.run(
          'UPDATE water_intake SET glasses = glasses + 1 WHERE id = ?',
          [existing.id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to increment water intake' });
            }

            res.json({ message: 'Water intake incremented', glasses: existing.glasses + 1 });
          }
        );
      } else {
        db.run(
          'INSERT INTO water_intake (user_id, glasses, entry_date) VALUES (?, 1, ?)',
          [userId, today],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to add water intake' });
            }

            res.status(201).json({ message: 'Water intake started', glasses: 1 });
          }
        );
      }
    }
  );
});

// Get water intake for a date range
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { start_date, end_date } = req.query;

  let query = 'SELECT * FROM water_intake WHERE user_id = ?';
  const params = [userId];

  if (start_date) {
    query += ' AND entry_date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND entry_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY entry_date DESC';

  db.all(query, params, (err, entries) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(entries);
  });
});

// Get today's water intake
router.get('/today', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  db.get(
    'SELECT * FROM water_intake WHERE user_id = ? AND entry_date = ?',
    [userId, today],
    (err, entry) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(entry || { glasses: 0, entry_date: today });
    }
  );
});

module.exports = router;
