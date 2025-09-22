const express = require('express');
const router = express.Router();
const { saveOnboarding, getOnboarding } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/', auth, saveOnboarding);
router.get('/:userId', auth, getOnboarding);

module.exports = router;