const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 1. SIGNUP LOGIC
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Encrypt the password so it is safe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user in MongoDB
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Member' // Defaults to Member if not provided
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// 2. LOGIN LOGIC
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials (Email not found)' });
    }

    // Check if the typed password matches the encrypted password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials (Wrong password)' });
    }

    // Send back a success message along with user details (excluding password)
    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};