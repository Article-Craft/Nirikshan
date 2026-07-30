const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');
const { Promise, Evidence, StatusHistory, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Apply protection to all moderation endpoints
router.use(authenticateToken, authorizeRoles('moderator', 'admin'));

/**
 * @openapi
 * /api/moderation/queue:
 *   get:
 *     summary: Fetch all unverified/pending updates and evidence
 */
router.get('/queue', async (req, res) => {
  try {
    // A pending change is a StatusHistory entry where the associated Evidence is not verified
    const pendingUpdates = await StatusHistory.findAll({
      include: [
        {
          model: Evidence,
          as: 'evidence',
          where: { verified: false },
          include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'is_anonymous'] }]
        },
        {
          model: Promise,
          as: 'promise',
          attributes: ['id', 'title', 'official_name', 'official_role', 'status']
        },
        {
          model: User,
          as: 'changer',
          attributes: ['id', 'name', 'is_anonymous']
        }
      ],
      order: [['timestamp', 'DESC']]
    });

    res.json(pendingUpdates);
  } catch (err) {
    console.error('Fetch moderation queue error:', err);
    res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
});

/**
 * @openapi
 * /api/moderation/:id/approve:
 *   post:
 *     summary: Approve status history change and verify associated evidence
 */
router.post('/:id/approve', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const historyId = parseInt(req.params.id);

    // Find history record
    const history = await StatusHistory.findByPk(historyId, {
      include: [
        { model: Evidence, as: 'evidence' },
        { model: Promise, as: 'promise' }
      ]
    });

    if (!history) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Pending update not found' });
    }

    // Verify evidence
    if (history.evidence) {
      history.evidence.verified = true;
      await history.evidence.save({ transaction });
    }

    // Update promise status
    if (history.promise) {
      history.promise.status = history.newStatus;
      history.promise.dateUpdated = new Date();
      await history.promise.save({ transaction });
    }

    await transaction.commit();
    res.json({ message: 'Update approved and promise status updated successfully.' });
  } catch (err) {
    await transaction.rollback();
    console.error('Approve update error:', err);
    res.status(500).json({ error: 'Failed to approve status update' });
  }
});

/**
 * @openapi
 * /api/moderation/:id/reject:
 *   post:
 *     summary: Reject and delete the pending update and evidence submission
 */
router.post('/:id/reject', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const historyId = parseInt(req.params.id);

    const history = await StatusHistory.findByPk(historyId, {
      include: [{ model: Evidence, as: 'evidence' }]
    });

    if (!history) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Pending update not found' });
    }

    // Delete associated unverified evidence
    if (history.evidence) {
      await history.evidence.destroy({ transaction });
    }

    // Delete status history record
    await history.destroy({ transaction });

    await transaction.commit();
    res.json({ message: 'Update rejected and deleted successfully.' });
  } catch (err) {
    await transaction.rollback();
    console.error('Reject update error:', err);
    res.status(500).json({ error: 'Failed to reject status update' });
  }
});

module.exports = router;
