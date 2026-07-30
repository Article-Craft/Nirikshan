const express = require('express');
const router = express.Router();
const { Constituency, District, Representative } = require('../models');

// GET /api/constituencies
router.get('/', async (req, res) => {
  try {
    const { district_id, map_identifier } = req.query;
    const where = {};
    if (district_id) {
      where.districtId = district_id;
    }
    if (map_identifier) {
      where.mapIdentifier = map_identifier.toUpperCase();
    }

    const constituencies = await Constituency.findAll({
      where,
      include: [
        { model: District, as: 'district', attributes: ['id', 'name', 'province'] },
        { model: Representative, as: 'winnerRepresentative' }
      ],
      order: [['name', 'ASC']]
    });
    res.json(constituencies);
  } catch (err) {
    console.error('Fetch constituencies error:', err);
    res.status(500).json({ error: 'Failed to fetch constituencies' });
  }
});

// GET /api/constituencies/:slug
router.get('/:slug', async (req, res) => {
  try {
    const constituency = await Constituency.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: District, as: 'district' },
        { model: Representative, as: 'winnerRepresentative' }
      ]
    });

    if (!constituency) {
      return res.status(404).json({ error: 'Constituency not found' });
    }

    res.json(constituency);
  } catch (err) {
    console.error('Fetch constituency detail by slug error:', err);
    res.status(500).json({ error: 'Failed to fetch constituency details' });
  }
});

module.exports = router;
