const express = require('express');
const router = express.Router();
const { PoliticalParty } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * GET /api/parties
 * Fetch all political parties
 */
router.get('/', async (req, res) => {
  try {
    const parties = await PoliticalParty.findAll();
    res.json(parties);
  } catch (err) {
    console.error('Fetch parties error:', err);
    res.status(500).json({ error: 'Failed to fetch political parties' });
  }
});

/**
 * POST /api/parties
 * Create new party profile
 */
router.post('/', authenticateToken, authorizeRoles('moderator', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { name, logoUrl, manifesto, leaders } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Party name is required' });
    }
    const newParty = await PoliticalParty.create({ name, logoUrl, manifesto, leaders });
    res.status(201).json(newParty);
  } catch (err) {
    console.error('Create party error:', err);
    res.status(500).json({ error: 'Failed to create political party' });
  }
});

/**
 * PUT /api/parties/:id
 * Edit political party details
 */
router.put('/:id', authenticateToken, authorizeRoles('moderator', 'admin', 'super_admin'), async (req, res) => {
  try {
    const party = await PoliticalParty.findByPk(req.params.id);
    if (!party) {
      return res.status(404).json({ error: 'Political party not found' });
    }
    const { name, logoUrl, manifesto, leaders } = req.body;
    if (name) party.name = name;
    if (logoUrl !== undefined) party.logoUrl = logoUrl;
    if (manifesto !== undefined) party.manifesto = manifesto;
    if (leaders !== undefined) party.leaders = leaders;
    
    await party.save();
    res.json(party);
  } catch (err) {
    console.error('Update party error:', err);
    res.status(500).json({ error: 'Failed to update political party' });
  }
});

/**
 * DELETE /api/parties/:id
 * Delete political party
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const party = await PoliticalParty.findByPk(req.params.id);
    if (!party) {
      return res.status(404).json({ error: 'Political party not found' });
    }
    await party.destroy();
    res.json({ message: 'Political party deleted successfully' });
  } catch (err) {
    console.error('Delete party error:', err);
    res.status(500).json({ error: 'Failed to delete political party' });
  }
});

module.exports = router;
