const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { BudgetProject, District } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Validation schemas
const createBudgetProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  districtId: z.preprocess((val) => Number(val), z.number().min(1, 'District ID must be valid')),
  allocatedAmount: z.preprocess((val) => Number(val), z.number().positive('Allocated amount must be positive')),
  completionPercent: z.preprocess((val) => (val === undefined || val === '' ? undefined : Number(val)), z.number().min(0).max(100).optional()),
  evidenceStatus: z.enum(['unverified', 'pending', 'verified']).optional(),
  description: z.string().optional()
});

// GET /api/budget-projects
router.get('/', async (req, res) => {
  try {
    const { district_id } = req.query;
    const where = {};

    if (district_id) {
      where.districtId = district_id;
    }

    const projects = await BudgetProject.findAll({
      where,
      include: [{ model: District, as: 'district', attributes: ['id', 'name', 'province'] }],
      order: [['id', 'DESC']]
    });

    res.json(projects);
  } catch (err) {
    console.error('Fetch budget projects error:', err);
    res.status(500).json({ error: 'Failed to fetch budget projects' });
  }
});

// POST /api/budget-projects
router.post('/', authenticateToken, authorizeRoles('moderator', 'admin'), async (req, res) => {
  try {
    const validated = createBudgetProjectSchema.parse(req.body);

    // Verify district exists
    const district = await District.findByPk(validated.districtId);
    if (!district) {
      return res.status(404).json({ error: 'District not found' });
    }

    const project = await BudgetProject.create(validated);
    res.status(201).json(project);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Create budget project error:', err);
    res.status(500).json({ error: 'Failed to create budget project' });
  }
});

module.exports = router;
