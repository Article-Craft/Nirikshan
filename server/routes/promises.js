const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const { Promise, Evidence, StatusHistory, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Zod validation schemas
const createPromiseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  officialName: z.string().min(2),
  officialRole: z.string().min(2),
  constituency: z.string().min(2),
  datePromised: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  sourceUrl: z.string().url().optional().or(z.literal(''))
});

const statusUpdateSchema = z.object({
  newStatus: z.enum(['promised', 'in_progress', 'delayed', 'fulfilled', 'broken']),
  fileUrl: z.string().url('Invalid evidence file URL'),
  description: z.string().min(5, 'Evidence explanation must be detailed'),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional()
});

/**
 * @openapi
 * /api/promises:
 *   get:
 *     summary: Retrieve promises list (paginated & filtered)
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { status, constituency, official, search } = req.query;
    const where = { verified: true }; // Only show admin-verified promises on main feed

    if (status) where.status = status;
    if (constituency) where.constituency = constituency;
    if (official) where.officialName = { [Op.iLike]: `%${official}%` };
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { officialName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Promise.findAndCountAll({
      where,
      limit,
      offset,
      order: [['date_updated', 'DESC']],
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }]
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: page,
      promises: rows
    });
  } catch (err) {
    console.error('Fetch promises error:', err);
    res.status(500).json({ error: 'Failed to fetch promises' });
  }
});

/**
 * @openapi
 * /api/promises/:id:
 *   get:
 *     summary: Fetch detailed promise by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const promise = await Promise.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Evidence, as: 'evidences', where: { verified: true }, required: false }
      ]
    });

    if (!promise) {
      return res.status(404).json({ error: 'Promise not found' });
    }

    res.json(promise);
  } catch (err) {
    console.error('Fetch promise detail error:', err);
    res.status(500).json({ error: 'Failed to fetch promise details' });
  }
});

/**
 * @openapi
 * /api/promises:
 *   post:
 *     summary: Create a promise (Admin/Moderator only)
 */
router.post('/', authenticateToken, authorizeRoles('moderator', 'admin'), async (req, res) => {
  try {
    const validated = createPromiseSchema.parse(req.body);
    const promise = await Promise.create({
      ...validated,
      createdBy: req.user.id,
      verified: true // Creator is trusted staff
    });

    res.status(201).json(promise);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Create promise error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @openapi
 * /api/promises/:id/status-update:
 *   post:
 *     summary: Submit a status update request with evidence (requires auth)
 */
router.post('/:id/status-update', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validated = statusUpdateSchema.parse(req.body);
    const promiseId = parseInt(req.params.id);

    const promise = await Promise.findByPk(promiseId);
    if (!promise) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Promise not found' });
    }

    // Set up location point geometry if provided
    let locationGeometry = null;
    if (validated.lat && validated.lng) {
      locationGeometry = {
        type: 'Point',
        coordinates: [validated.lng, validated.lat] // longitude first in GeoJSON
      };
    }

    // Create unverified evidence record
    const evidence = await Evidence.create({
      promiseId,
      fileUrl: validated.fileUrl,
      uploadedBy: req.user.id,
      description: `${validated.description} (Proposed status change: ${validated.newStatus})`,
      location: locationGeometry,
      verified: false
    }, { transaction });

    // Create a pending status history entry
    // NOTE: The actual promise status does NOT change yet until a moderator approves it.
    await StatusHistory.create({
      promiseId,
      oldStatus: promise.status,
      newStatus: validated.newStatus,
      changedBy: req.user.id,
      evidenceId: evidence.id,
      timestamp: new Date()
    }, { transaction });

    await transaction.commit();

    res.status(202).json({
      message: 'Status update submitted for review. It will display once verified by moderators.',
      evidenceId: evidence.id
    });
  } catch (err) {
    await transaction.rollback();
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Status update submit error:', err);
    res.status(500).json({ error: 'Failed to submit status update' });
  }
});

/**
 * @openapi
 * /api/promises/:id/timeline:
 *   get:
 *     summary: Get status updates timeline history
 */
router.get('/:id/timeline', async (req, res) => {
  try {
    const history = await StatusHistory.findAll({
      where: { promise_id: req.params.id },
      order: [['timestamp', 'ASC']],
      include: [
        { model: User, as: 'changer', attributes: ['id', 'name', 'role', 'is_anonymous'] },
        { model: Evidence, as: 'evidence', attributes: ['id', 'file_url', 'description', 'location', 'verified'] }
      ]
    });

    res.json(history);
  } catch (err) {
    console.error('Fetch timeline error:', err);
    res.status(500).json({ error: 'Failed to fetch status timeline' });
  }
});

module.exports = router;
