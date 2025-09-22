const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming'
  },
  total_invested: {
    type: mongoose.Decimal128,
    default: 0
  },
  player_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
tournamentSchema.index({ status: 1, start_date: -1 });
tournamentSchema.index({ end_date: 1 });

module.exports = mongoose.model('Tournament', tournamentSchema);