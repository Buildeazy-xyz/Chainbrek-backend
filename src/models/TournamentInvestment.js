const mongoose = require('mongoose');

const tournamentInvestmentSchema = new mongoose.Schema({
  tournament_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: mongoose.Decimal128,
    required: true,
    min: 25,
    max: 1000
  },
  invested_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate investments
tournamentInvestmentSchema.index({ tournament_id: 1, user_id: 1 }, { unique: true });

// Index for efficient queries
tournamentInvestmentSchema.index({ user_id: 1, invested_at: -1 });
tournamentInvestmentSchema.index({ tournament_id: 1, invested_at: -1 });

module.exports = mongoose.model('TournamentInvestment', tournamentInvestmentSchema);