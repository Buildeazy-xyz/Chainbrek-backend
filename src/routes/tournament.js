const express = require('express');
const router = express.Router();
const {
  getCurrentTournament,
  getLeaderboard,
  makeInvestment,
  getUserStats
} = require('../controllers/tournamentController');
const auth = require('../middleware/auth');

// GET /api/tournament - Get current active tournament
router.get('/', auth, getCurrentTournament);

// GET /api/tournament/leaderboard - Get tournament leaderboard
router.get('/leaderboard', auth, getLeaderboard);

// POST /api/tournament/invest - Make an investment
router.post('/invest', auth, makeInvestment);

// GET /api/tournament/user-stats - Get user's tournament statistics
router.get('/user-stats', auth, getUserStats);

module.exports = router;