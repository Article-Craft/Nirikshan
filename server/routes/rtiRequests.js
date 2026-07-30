const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { RtiRequest, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Validation schemas
const createRtiSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  targetOffice: z.string().min(2, 'Target office must be at least 2 characters'),
  letterContent: z.string().min(10, 'Letter content must be at least 10 characters'),
  deadlineDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline date must be YYYY-MM-DD').optional().or(z.literal(''))
});

// GET /api/rti-requests/mine (Auth required)
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const rtiRequests = await RtiRequest.findAll({
      where: { userId: req.user.id },
      order: [['id', 'DESC']]
    });
    res.json(rtiRequests);
  } catch (err) {
    console.error('Fetch my RTI requests error:', err);
    res.status(500).json({ error: 'Failed to fetch your RTI requests' });
  }
});

// GET /api/rti-requests (Auth required, Admin/Moderator only)
router.get('/', authenticateToken, authorizeRoles('moderator', 'admin'), async (req, res) => {
  try {
    const rtiRequests = await RtiRequest.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['id', 'DESC']]
    });
    res.json(rtiRequests);
  } catch (err) {
    console.error('Fetch all RTI requests error:', err);
    res.status(500).json({ error: 'Failed to fetch RTI requests' });
  }
});

// POST /api/rti-requests (Auth required)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const validated = createRtiSchema.parse(req.body);

    const deadline = validated.deadlineDate ? new Date(validated.deadlineDate) : null;

    const rtiRequest = await RtiRequest.create({
      userId: req.user.id,
      subject: validated.subject,
      targetOffice: validated.targetOffice,
      letterContent: validated.letterContent,
      deadlineDate: deadline,
      status: 'submitted'
    });

    res.status(201).json(rtiRequest);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Create RTI request error:', err);
    res.status(500).json({ error: 'Failed to create RTI request' });
  }
});

module.exports = router;
