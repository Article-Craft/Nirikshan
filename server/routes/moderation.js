const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');
const { Promise, Evidence, StatusHistory, User, Complaint, CivicEvent } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Apply protection to all moderation endpoints
router.use(authenticateToken, authorizeRoles('moderator', 'admin'));

/**
 * GET /api/moderation/queue
 * Fetch all unverified/pending updates, complaints, and civic events
 */
router.get('/queue', async (req, res) => {
  try {
    // 1. Fetch pending promise updates
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

    const formattedUpdates = pendingUpdates.map(history => ({
      id: `update-${history.id}`,
      type: 'update',
      newStatus: history.newStatus,
      changer: {
        name: history.changer?.isAnonymous ? 'Anonymous Citizen' : (history.changer?.name || 'Citizen')
      },
      promise: history.promise ? {
        id: history.promise.id,
        title: history.promise.title
      } : null,
      evidence: history.evidence ? {
        description: history.evidence.description,
        file_url: history.evidence.fileUrl,
        location: history.evidence.location
      } : null
    }));

    // 2. Fetch pending complaints
    const pendingComplaints = await Complaint.findAll({
      where: { status: 'pending' },
      order: [['created_at', 'DESC']]
    });

    const formattedComplaints = pendingComplaints.map(complaint => ({
      id: `complaint-${complaint.id}`,
      type: 'complaint',
      newStatus: 'verified',
      changer: {
        name: complaint.isAnonymous ? 'Anonymous Citizen' : 'Citizen'
      },
      promise: {
        title: `[Complaint] ${complaint.serviceType} (Ward ${complaint.ward || 'N/A'})`
      },
      evidence: {
        description: complaint.description,
        file_url: complaint.photoUrl,
        location: (complaint.locationLat && complaint.locationLng) ? {
          type: 'Point',
          coordinates: [complaint.locationLng, complaint.locationLat]
        } : null
      }
    }));

    // 3. Fetch pending civic events
    const pendingEvents = await CivicEvent.findAll({
      where: { verified: false },
      order: [['date', 'ASC']]
    });

    const formattedEvents = pendingEvents.map(event => ({
      id: `event-${event.id}`,
      type: 'event',
      newStatus: 'verified',
      changer: {
        name: `Organizer: ${event.organizer}`
      },
      promise: {
        title: `[Civic Event] ${event.name} (${event.eventType})`
      },
      evidence: {
        description: `${event.description || 'No description provided.'} - Scheduled for ${new Date(event.date).toLocaleDateString()}`,
        file_url: null,
        location: (event.locationLat && event.locationLng) ? {
          type: 'Point',
          coordinates: [event.locationLng, event.locationLat]
        } : null
      }
    }));

    // Combine all into a single list
    const fullQueue = [...formattedUpdates, ...formattedComplaints, ...formattedEvents];
    res.json(fullQueue);
  } catch (err) {
    console.error('Fetch moderation queue error:', err);
    res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
});

/**
 * POST /api/moderation/:id/approve
 * Approve pending updates, complaints, or civic events
 */
router.post('/:id/approve', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const rawId = req.params.id;

    if (rawId.startsWith('complaint-')) {
      const complaintId = parseInt(rawId.replace('complaint-', ''));
      const complaint = await Complaint.findByPk(complaintId);
      if (!complaint) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Complaint not found' });
      }
      complaint.status = 'verified';
      await complaint.save({ transaction });
      await transaction.commit();
      return res.json({ message: 'Complaint approved and verified successfully.' });
    }

    if (rawId.startsWith('event-')) {
      const eventId = parseInt(rawId.replace('event-', ''));
      const event = await CivicEvent.findByPk(eventId);
      if (!event) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Civic Event not found' });
      }
      event.verified = true;
      await event.save({ transaction });
      await transaction.commit();
      return res.json({ message: 'Civic Event approved and verified successfully.' });
    }

    // Default: Promise Status Update (with or without prefix)
    const historyId = parseInt(rawId.replace('update-', ''));
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

    if (history.evidence) {
      history.evidence.verified = true;
      await history.evidence.save({ transaction });
    }

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
 * POST /api/moderation/:id/reject
 * Reject and delete pending updates, complaints, or civic events
 */
router.post('/:id/reject', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const rawId = req.params.id;

    if (rawId.startsWith('complaint-')) {
      const complaintId = parseInt(rawId.replace('complaint-', ''));
      const complaint = await Complaint.findByPk(complaintId);
      if (!complaint) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Complaint not found' });
      }
      complaint.status = 'rejected';
      await complaint.save({ transaction });
      await transaction.commit();
      return res.json({ message: 'Complaint rejected successfully.' });
    }

    if (rawId.startsWith('event-')) {
      const eventId = parseInt(rawId.replace('event-', ''));
      const event = await CivicEvent.findByPk(eventId);
      if (!event) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Civic Event not found' });
      }
      // Deleting unverified civic events on rejection is the typical standard
      await event.destroy({ transaction });
      await transaction.commit();
      return res.json({ message: 'Civic Event rejected and deleted successfully.' });
    }

    // Default: Promise Status Update (with or without prefix)
    const historyId = parseInt(rawId.replace('update-', ''));
    const history = await StatusHistory.findByPk(historyId, {
      include: [{ model: Evidence, as: 'evidence' }]
    });

    if (!history) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Pending update not found' });
    }

    if (history.evidence) {
      await history.evidence.destroy({ transaction });
    }

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
