const express = require('express');
const router = express.Router();
const { District, Constituency } = require('../models');

// GET /api/districts
router.get('/', async (req, res) => {
  try {
    const districts = await District.findAll({
      order: [['name', 'ASC']]
    });
    res.json(districts);
  } catch (err) {
    console.error('Fetch districts error:', err);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

// GET /api/districts/:id
router.get('/:id', async (req, res) => {
  try {
    const district = await District.findByPk(req.params.id, {
      include: [{ model: Constituency, as: 'constituencies' }]
    });

    if (!district) {
      return res.status(404).json({ error: 'District not found' });
    }

    res.json(district);
  } catch (err) {
    console.error('Fetch district detail error:', err);
    res.status(500).json({ error: 'Failed to fetch district details' });
  }
});

module.exports = router;
