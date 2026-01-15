const express = require('express');
const { db } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Add weight entry
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { weight, entry_date, notes } = req.body;

  if (!weight) {
    return res.status(400).json({ error: 'Weight is required' });
  }

  const query = `
    INSERT INTO weight_entries (user_id, weight, entry_date, notes)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    query,
    [userId, weight, entry_date || new Date().toISOString().split('T')[0], notes || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add weight entry' });
      }

      res.status(201).json({
        message: 'Weight entry added successfully',
        id: this.lastID
      });
    }
  );
});

// Get all weight entries
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { start_date, end_date, limit } = req.query;

  let query = 'SELECT * FROM weight_entries WHERE user_id = ?';
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

  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit));
  }

  db.all(query, params, (err, entries) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(entries);
  });
});

// Get latest weight
router.get('/latest', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get(
    'SELECT * FROM weight_entries WHERE user_id = ? ORDER BY entry_date DESC LIMIT 1',
    [userId],
    (err, entry) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(entry || null);
    }
  );
});

// Update weight entry
router.put('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const entryId = req.params.id;
  const { weight, notes } = req.body;

  db.run(
    'UPDATE weight_entries SET weight = COALESCE(?, weight), notes = COALESCE(?, notes) WHERE id = ? AND user_id = ?',
    [weight, notes, entryId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update weight entry' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Weight entry not found' });
      }

      res.json({ message: 'Weight entry updated successfully' });
    }
  );
});

// Delete weight entry
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const entryId = req.params.id;

  db.run(
    'DELETE FROM weight_entries WHERE id = ? AND user_id = ?',
    [entryId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete weight entry' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Weight entry not found' });
      }

      res.json({ message: 'Weight entry deleted successfully' });
    }
  );
});

module.exports = router;
