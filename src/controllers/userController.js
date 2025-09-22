const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Prevent password update here

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const saveOnboarding = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { onboardingData: req.body }, { new: true });
    res.json(user.onboardingData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getOnboarding = async (req, res) => {
  try {
    let user;

    // Check if the parameter is an email or user ID
    if (req.params.userId.includes('@')) {
      // It's an email, find by email
      user = await User.findOne({ email: req.params.userId });
    } else {
      // It's a user ID, find by ID
      user = await User.findById(req.params.userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.onboardingData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, saveOnboarding, getOnboarding };