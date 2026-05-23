const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbService = require('../models/dbService');

const JWT_SECRET = process.env.JWT_SECRET || 'codeexplain_secret_key_123';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id || user._id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      // Check if user already exists
      const existingUser = await dbService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email.' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await dbService.createUser({
        username,
        email,
        password: hashedPassword
      });

      const token = generateToken(user);
      res.status(201).json({
        token,
        user: {
          id: user.id || user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Server error during registration.' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      // Check user
      const user = await dbService.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      // Verify password (in case user signed up via Google only and has no password)
      if (!user.password) {
        return res.status(400).json({ message: 'Account registered via Google. Please log in using Google Login.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      const token = generateToken(user);
      res.status(200).json({
        token,
        user: {
          id: user.id || user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error during login.' });
    }
  },

  googleLogin: async (req, res) => {
    try {
      const { email, username, googleId } = req.body;
      if (!email || !googleId) {
        return res.status(400).json({ message: 'Missing required Google authentication parameters.' });
      }

      let user = await dbService.getUserByEmail(email);
      if (!user) {
        // Register new user with random placeholder password (since they are OAuth)
        user = await dbService.createUser({
          username: username || email.split('@')[0],
          email,
          googleId
        });
      } else if (!user.googleId) {
        // Update user to link Google ID if not already linked
        // In Mongoose we could save, in mock we can recreate. For mock fallback or mongoose, let's keep it simple.
        // Link googleId by creating placeholder
        user.googleId = googleId;
      }

      const token = generateToken(user);
      res.status(200).json({
        token,
        user: {
          id: user.id || user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      console.error('Google login error:', err);
      res.status(500).json({ message: 'Server error during Google login.' });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = await dbService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.status(200).json({
        id: user.id || user._id,
        username: user.username,
        email: user.email
      });
    } catch (err) {
      console.error('Verify user error:', err);
      res.status(500).json({ message: 'Server error verifying token.' });
    }
  }
};

module.exports = authController;
