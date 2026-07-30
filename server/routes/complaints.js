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
    // Public feed shows only verified complaints
    const complaints = await Complaint.findAll({
      where: { status: 'verified' },
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
