const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { CivicEvent } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Validation schemas
const createCivicEventSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  eventType: z.string().min(2, 'Event type must be at least 2 characters'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  locationLat: z.preprocess((val) => (val === undefined || val === '' ? undefined : Number(val)), z.number().min(-90).max(90).optional()),
  locationLng: z.preprocess((val) => (val === undefined || val === '' ? undefined : Number(val)), z.number().min(-180).max(180).optional()),
  organizer: z.string().min(2, 'Organizer must be at least 2 characters'),
  description: z.string().optional()
});

// GET /api/civic-events
router.get('/', async (req, res) => {
  try {
    const events = await CivicEvent.findAll({
      where: { verified: true },
      order: [['date', 'ASC']]
    });
    res.json(events);
  } catch (err) {
    console.error('Fetch civic events error:', err);
    res.status(500).json({ error: 'Failed to fetch civic events' });
  }
});

// POST /api/civic-events (Auth required)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const validated = createCivicEventSchema.parse(req.body);

    const event = await CivicEvent.create({
      ...validated,
      date: new Date(validated.date),
      verified: false // Must go to moderation queue first
    });

    res.status(202).json({
      message: 'Civic event submitted for moderation. It will show up on the map once verified.',
      event
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Create civic event error:', err);
    res.status(500).json({ error: 'Failed to submit civic event' });
  }
});

module.exports = router;
