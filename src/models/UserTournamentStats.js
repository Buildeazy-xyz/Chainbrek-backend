const mongoose = require('mongoose');

const userTournamentStatsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tournament_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  total_invested: {
    type: mongoose.Decimal128,
    default: 0
  },
  current_rank: {
    type: Number,
    default: 0
  },
  streak_days: {
    type: Number,
    default: 0
  },
  badge: {
    type: String,
    enum: ['Hero', 'Builder', 'Rising', 'Steady', 'Marathon'],
    default: 'Marathon'
  },
  last_investment: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
userTournamentStatsSchema.index({ user_id: 1, tournament_id: 1 }, { unique: true });

// Index for leaderboard queries
userTournamentStatsSchema.index({ tournament_id: 1, total_invested: -1 });
userTournamentStatsSchema.index({ tournament_id: 1, current_rank: 1 });

// Method to assign badge based on rank
userTournamentStatsSchema.methods.assignBadge = function() {
  if (this.current_rank <= 3) {
    this.badge = 'Hero';
  } else if (this.current_rank <= 10) {
    this.badge = 'Builder';
  } else if (this.current_rank <= 25) {
    this.badge = 'Rising';
  } else if (this.current_rank <= 50) {
    this.badge = 'Steady';
  } else {
    this.badge = 'Marathon';
  }
};

module.exports = mongoose.model('UserTournamentStats', userTournamentStatsSchema);