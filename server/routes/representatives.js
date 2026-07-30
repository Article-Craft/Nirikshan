const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { Op } = require('sequelize');
const { Representative, Constituency, Rating, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { upload, uploadToS3IfConfigured } = require('../middleware/upload');

// Validation schemas
const createRepSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  party: z.string().min(1, 'Party is required'),
  constituencyId: z.string().min(1, 'Constituency ID is required'),
  position: z.string().optional(),
  attendancePercent: z.preprocess((val) => (val === undefined || val === '' ? undefined : Number(val)), z.number().min(0).max(100).optional()),
  billsSponsored: z.preprocess((val) => (val === undefined || val === '' ? undefined : Number(val)), z.number().nonnegative().optional()),
  contactInfo: z.string().optional()
});

const submitRatingSchema = z.object({
  stars: z.number().min(1).max(5, 'Stars must be between 1 and 5'),
  comment: z.string().optional()
});

// GET /api/representatives
router.get('/', async (req, res) => {
  try {
    const { constituency_id, search } = req.query;
    const where = {};

    if (constituency_id) {
      where.constituencyId = constituency_id;
    }
    if (search) {
      where.name = { [Op.iLike || Op.like]: `%${search}%` };
    }

    const representatives = await Representative.findAll({
      where,
      include: [
        { model: Constituency, as: 'constituency', attributes: ['id', 'name', 'province'] },
        { model: Rating, as: 'ratings', attributes: ['stars'] }
      ],
      order: [['name', 'ASC']]
    });

    // Attach calculated average rating to each rep
    const results = representatives.map((rep) => {
      const plain = rep.get({ plain: true });
      const starsList = plain.ratings || [];
      const totalStars = starsList.reduce((sum, r) => sum + r.stars, 0);
      plain.averageRating = starsList.length > 0 ? parseFloat((totalStars / starsList.length).toFixed(1)) : 0;
      plain.ratingsCount = starsList.length;
      delete plain.ratings;
      return plain;
    });

    res.json(results);
  } catch (err) {
    console.error('Fetch representatives error:', err);
    res.status(500).json({ error: 'Failed to fetch representatives' });
  }
});

// GET /api/representatives/:id
router.get('/:id', async (req, res) => {
  try {
    const rep = await Representative.findByPk(req.params.id, {
      include: [
        { model: Constituency, as: 'constituency' },
        {
          model: Rating,
          as: 'ratings',
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
        }
      ]
    });

    if (!rep) {
      return res.status(404).json({ error: 'Representative not found' });
    }

    const plain = rep.get({ plain: true });
    const starsList = plain.ratings || [];
    const totalStars = starsList.reduce((sum, r) => sum + r.stars, 0);
    plain.averageRating = starsList.length > 0 ? parseFloat((totalStars / starsList.length).toFixed(1)) : 0;
    plain.ratingsCount = starsList.length;

    res.json(plain);
  } catch (err) {
    console.error('Fetch representative detail error:', err);
    res.status(500).json({ error: 'Failed to fetch representative details' });
  }
});

// POST /api/representatives
router.post(
  '/',
  authenticateToken,
  authorizeRoles('moderator', 'admin'),
  upload.single('photo'),
  async (req, res) => {
    try {
      const validated = createRepSchema.parse(req.body);
      let photoUrl = req.body.photo_url || null;

      if (req.file) {
        photoUrl = await uploadToS3IfConfigured(req.file);
      }

      const rep = await Representative.create({
        ...validated,
        photoUrl
      });

      res.status(201).json(rep);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors[0].message });
      }
      console.error('Create representative error:', err);
      res.status(500).json({ error: 'Failed to create representative' });
    }
  }
);

// POST /api/representatives/:id/rating
router.post('/:id/rating', authenticateToken, async (req, res) => {
  try {
    const repId = parseInt(req.params.id);
    const validated = submitRatingSchema.parse(req.body);

    const rep = await Representative.findByPk(repId);
    if (!rep) {
      return res.status(404).json({ error: 'Representative not found' });
    }

    // Check if user already rated this representative to prevent duplicate ratings
    const existingRating = await Rating.findOne({
      where: { representativeId: repId, userId: req.user.id }
    });

    if (existingRating) {
      existingRating.stars = validated.stars;
      existingRating.comment = validated.comment || existingRating.comment;
      await existingRating.save();
      return res.json({ message: 'Rating updated successfully', rating: existingRating });
    }

    const rating = await Rating.create({
      representativeId: repId,
      userId: req.user.id,
      stars: validated.stars,
      comment: validated.comment
    });

    res.status(201).json({ message: 'Rating submitted successfully', rating });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Submit rating error:', err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

module.exports = router;
