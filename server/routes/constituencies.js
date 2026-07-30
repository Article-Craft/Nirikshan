const express = require('express');
const router = express.Router();
const { Constituency, District, Representative } = require('../models');

// GET /api/constituencies
router.get('/', async (req, res) => {
  try {
    const { district_id } = req.query;
    const where = {};
    if (district_id) {
      where.districtId = district_id;
    }

    const constituencies = await Constituency.findAll({
      where,
      include: [{ model: District, as: 'district', attributes: ['id', 'name'] }],
      order: [['id', 'ASC']]
    });
    res.json(constituencies);
  } catch (err) {
    console.error('Fetch constituencies error:', err);
    res.status(500).json({ error: 'Failed to fetch constituencies' });
  }
});

// GET /api/constituencies/:id
router.get('/:id', async (req, res) => {
  try {
    const constituency = await Constituency.findByPk(req.params.id, {
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
    console.error('Fetch constituency detail error:', err);
    res.status(500).json({ error: 'Failed to fetch constituency details' });
  }
});

module.exports = router;
