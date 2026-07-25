const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { User } = require('../models');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'nirikshan_fallback_secret';

// Input validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').transform(val => val.toLowerCase()),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['citizen', 'moderator', 'admin']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').transform(val => val.toLowerCase()),
  password: z.string().min(1, 'Password is required')
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 */
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: validatedData.email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    // Create user
    const newUser = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
      role: validatedData.role || 'citizen',
      isAnonymous: false
    });

    // Create token
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, role: newUser.role, isAnonymous: false },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isAnonymous: false
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login standard user
 *     tags: [Authentication]
 */
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ where: { email: validatedData.email } });
    if (!user || user.isAnonymous) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role, isAnonymous: false },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAnonymous: false
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @openapi
 * /api/auth/anonymous-session:
 *   post:
 *     summary: Create an anonymous guest token
 *     tags: [Authentication]
 */
router.post('/anonymous-session', async (req, res) => {
  try {
    // Generate a unique random profile name for the guest session
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const guestName = `Citizen_${randomId}`;

    // Create user record for tracking contributions, but mark as anonymous
    const anonymousUser = await User.create({
      name: guestName,
      isAnonymous: true,
      role: 'citizen'
    });

    const token = jwt.sign(
      { id: anonymousUser.id, name: anonymousUser.name, role: 'citizen', isAnonymous: true },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      user: {
        id: anonymousUser.id,
        name: anonymousUser.name,
        role: 'citizen',
        isAnonymous: true
      }
    });
  } catch (err) {
    console.error('Anonymous session creation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
