const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Route for User Registration: POST /api/auth/register
router.post('/register', register);

// Route for User Login: POST /api/auth/login
router.post('/login', login);

module.exports = router;