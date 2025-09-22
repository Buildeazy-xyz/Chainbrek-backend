const Tournament = require('../models/Tournament');
const TournamentInvestment = require('../models/TournamentInvestment');
const UserTournamentStats = require('../models/UserTournamentStats');
const User = require('../models/User');

// Get current active tournament
const getCurrentTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findOne({ status: 'active' })
      .sort({ start_date: -1 });

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'No active tournament available'
      });
    }

    // Calculate time left
    const now = new Date();
    const endDate = new Date(tournament.end_date);
    const timeLeft = Math.max(0, endDate - now);

    // Convert to days, hours format
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    res.json({
      id: tournament._id,
      name: tournament.name,
      description: tournament.description,
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      status: tournament.status,
      total_invested: parseFloat(tournament.total_invested.toString()),
      player_count: tournament.player_count,
      time_left: `${days}d ${hours}h`
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get tournament leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const tournament = await Tournament.findOne({ status: 'active' });

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'No active tournament available'
      });
    }

    // Get leaderboard data
    const leaderboardData = await UserTournamentStats.find({ tournament_id: tournament._id })
      .populate('user_id', 'name')
      .sort({ total_invested: -1 })
      .limit(limit);

    const leaderboard = leaderboardData.map((stat, index) => ({
      rank: index + 1,
      name: stat.user_id.name,
      amount: parseFloat(stat.total_invested.toString()),
      streak: stat.streak_days,
      badge: stat.badge,
      isCurrentUser: stat.user_id._id.toString() === req.user._id.toString()
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Make an investment in tournament
const makeInvestment = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    // Validate amount
    if (amount < 25 || amount > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Investment amount must be between ₦25 and ₦1000'
      });
    }

    // Get active tournament
    const tournament = await Tournament.findOne({ status: 'active' });
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'No active tournament available'
      });
    }

    // Check if user already invested
    const existingInvestment = await TournamentInvestment.findOne({
      tournament_id: tournament._id,
      user_id: userId
    });

    if (existingInvestment) {
      return res.status(400).json({
        success: false,
        message: 'You have already invested in this tournament'
      });
    }

    // Create investment
    const investment = await TournamentInvestment.create({
      tournament_id: tournament._id,
      user_id: userId,
      amount: amount
    });

    // Update or create user stats
    let userStats = await UserTournamentStats.findOne({
      user_id: userId,
      tournament_id: tournament._id
    });

    if (!userStats) {
      userStats = await UserTournamentStats.create({
        user_id: userId,
        tournament_id: tournament._id,
        total_invested: amount,
        last_investment: new Date()
      });
    } else {
      userStats.total_invested = parseFloat(userStats.total_invested.toString()) + amount;
      userStats.last_investment = new Date();
      await userStats.save();
    }

    // Update tournament totals
    tournament.total_invested = parseFloat(tournament.total_invested.toString()) + amount;
    tournament.player_count += 1;
    await tournament.save();

    // Recalculate ranks
    await recalculateRanks(tournament._id);

    // Get updated user stats with new rank
    const updatedStats = await UserTournamentStats.findOne({
      user_id: userId,
      tournament_id: tournament._id
    });

    res.json({
      success: true,
      message: 'Investment successful',
      new_rank: updatedStats.current_rank,
      total_invested: parseFloat(updatedStats.total_invested.toString())
    });
  } catch (error) {
    console.error('Error making investment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user tournament statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const tournament = await Tournament.findOne({ status: 'active' });

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'No active tournament available'
      });
    }

    let userStats = await UserTournamentStats.findOne({
      user_id: userId,
      tournament_id: tournament._id
    });

    if (!userStats) {
      userStats = {
        current_rank: 0,
        total_invested: 0,
        streak_days: 0,
        badge: 'Marathon',
        last_investment: null
      };
    }

    // Calculate monthly invested (simplified - could be more complex)
    const monthlyInvested = parseFloat(userStats.total_invested?.toString() || '0');
    const tournamentsJoined = await UserTournamentStats.countDocuments({ user_id: userId });

    res.json({
      current_rank: userStats.current_rank || 0,
      total_invested: parseFloat(userStats.total_invested?.toString() || '0'),
      streak_days: userStats.streak_days || 0,
      badge: userStats.badge || 'Marathon',
      last_investment: userStats.last_investment,
      monthly_invested: monthlyInvested,
      tournaments_joined: tournamentsJoined
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to recalculate ranks
const recalculateRanks = async (tournamentId) => {
  try {
    const stats = await UserTournamentStats.find({ tournament_id: tournamentId })
      .sort({ total_invested: -1 });

    for (let i = 0; i < stats.length; i++) {
      stats[i].current_rank = i + 1;
      stats[i].assignBadge();
      await stats[i].save();
    }
  } catch (error) {
    console.error('Error recalculating ranks:', error);
  }
};

module.exports = {
  getCurrentTournament,
  getLeaderboard,
  makeInvestment,
  getUserStats
};