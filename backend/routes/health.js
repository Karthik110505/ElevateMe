const express = require('express');
const router = express.Router();

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ElevateMe API is running!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;