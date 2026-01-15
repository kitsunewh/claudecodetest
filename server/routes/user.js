const express = require('express');
const { db } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
const googleDrive = require('../services/googleDrive');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get(
    'SELECT id, email, name, age, gender, height, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fats_goal, daily_water_goal FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    }
  );
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { name, age, gender, height, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fats_goal, daily_water_goal } = req.body;

  const query = `
    UPDATE users
    SET name = COALESCE(?, name),
        age = COALESCE(?, age),
        gender = COALESCE(?, gender),
        height = COALESCE(?, height),
        daily_calorie_goal = COALESCE(?, daily_calorie_goal),
        daily_protein_goal = COALESCE(?, daily_protein_goal),
        daily_carbs_goal = COALESCE(?, daily_carbs_goal),
        daily_fats_goal = COALESCE(?, daily_fats_goal),
        daily_water_goal = COALESCE(?, daily_water_goal),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(
    query,
    [name, age, gender, height, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fats_goal, daily_water_goal, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Get Google Drive auth URL
router.get('/google-drive/auth-url', authenticateToken, (req, res) => {
  try {
    const authUrl = googleDrive.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Handle Google Drive OAuth callback
router.post('/google-drive/callback', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    const tokens = await googleDrive.getTokenFromCode(code);

    // Store refresh token
    db.run(
      'UPDATE users SET google_drive_refresh_token = ? WHERE id = ?',
      [tokens.refresh_token, userId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to save Google Drive token' });
        }

        res.json({ message: 'Google Drive connected successfully' });
      }
    );
  } catch (error) {
    console.error('Google Drive callback error:', error);
    res.status(500).json({ error: 'Failed to connect Google Drive' });
  }
});

module.exports = router;
