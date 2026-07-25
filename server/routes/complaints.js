const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { Complaint } = require('../models');
const { upload, uploadToS3IfConfigured } = require('../middleware/upload');

// Validation schemas
const createComplaintSchema = z.object({
  serviceType: z.string().min(2, 'Service type must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  locationLat: z.preprocess((val) => (val === undefined || val === '' ? undefined : Number(val)), z.number().min(-90).max(90).optional()),
  locationLng: z.preprocess((val) => (val === undefined || val === '' ? undefined : Number(val)), z.number().min(-180).max(180).optional()),
  ward: z.string().optional(),
  isAnonymous: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional())
});

// GET /api/complaints
router.get('/', async (req, res) => {
  try {
    const { serviceType, status, startDate, endDate } = req.query;
    const { Op } = require('sequelize');
    const where = {};

    // Filter by status (defaulting to 'verified' if not provided)
    if (status && status !== 'all') {
      where.status = status;
    } else if (!status) {
      where.status = 'verified';
    }

    // Filter by service type
    if (serviceType && serviceType !== 'all') {
      where.serviceType = serviceType;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        // To make the endDate inclusive of the entire day, set it to the end of that day (23:59:59)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = end;
      }
    }

    const complaints = await Complaint.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
    res.json(complaints);
  } catch (err) {
    console.error('Fetch complaints error:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// POST /api/complaints
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const validated = createComplaintSchema.parse(req.body);
    let photoUrl = req.body.photo_url || null;

    if (req.file) {
      photoUrl = await uploadToS3IfConfigured(req.file);
    }

    const complaint = await Complaint.create({
      ...validated,
      photoUrl,
      status: 'pending' // Enters moderation queue by default
    });

    res.status(201).json(complaint);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Create complaint error:', err);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});

module.exports = router;
