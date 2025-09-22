const mongoose = require('mongoose');
const Tournament = require('./src/models/Tournament');
require('dotenv').config();

const createSampleTournament = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if tournament already exists
    const existingTournament = await Tournament.findOne({ status: 'active' });
    if (existingTournament) {
      console.log('Active tournament already exists:', existingTournament.name);
      return;
    }

    // Create sample tournament
    const tournament = new Tournament({
      name: 'December Investment Challenge',
      description: 'Compete to build wealth, not lose it. Invest ₦25-₦1000 to climb the leaderboard!',
      start_date: new Date('2024-12-01T00:00:00Z'),
      end_date: new Date('2024-12-31T23:59:59Z'),
      status: 'active',
      total_invested: 0,
      player_count: 0
    });

    await tournament.save();
    console.log('Sample tournament created successfully!');
    console.log('Tournament ID:', tournament._id);
    console.log('Tournament Name:', tournament.name);

  } catch (error) {
    console.error('Error creating sample tournament:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
createSampleTournament();