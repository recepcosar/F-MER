const router = require('express').Router();
const auth = require('../middleware/auth');

// Protected route example
router.get('/data', auth, async (req, res) => {
  try {
    // This is where you would typically fetch data from your database
    // For now, we'll just return a sample response
    res.json({
      message: 'This is protected data',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching protected data', error: error.message });
  }
});

module.exports = router; 