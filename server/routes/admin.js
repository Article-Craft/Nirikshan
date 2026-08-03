const express = require('express');
const router = express.Router();
const { User, PlatformSetting, Complaint, RtiRequest, Representative, BudgetProject, Promise: PromiseModel } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Protect all admin endpoints
router.use(authenticateToken, authorizeRoles('admin', 'super_admin'));

/**
 * GET /api/admin/users
 * Retrieve all registered users
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash'] },
      order: [['id', 'ASC']]
    });
    res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to fetch users list' });
  }
});

/**
 * PUT /api/admin/users/:id/status
 * Suspend/Ban/Activate users
 */
router.put('/users/:id/status', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { status } = req.body;
    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status parameter' });
    }
    user.status = status;
    await user.save();
    res.json({ message: `User status set to ${status} successfully.`, user });
  } catch (err) {
    console.error('Update user status error:', err);
    res.status(500).json({ error: 'Failed to change user status' });
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Assign user permissions/roles
 */
router.put('/users/:id/role', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { role } = req.body;
    if (!['citizen', 'moderator', 'government_office', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role parameter' });
    }
    user.role = role;
    await user.save();
    res.json({ message: `User role updated to ${role} successfully.`, user });
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({ error: 'Failed to assign user role' });
  }
});

/**
 * GET /api/admin/settings
 * Fetch site configuration settings
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await PlatformSetting.findAll();
    const configMap = {};
    settings.forEach(s => {
      configMap[s.key] = s.value;
    });
    res.json(configMap);
  } catch (err) {
    console.error('Fetch settings error:', err);
    res.status(500).json({ error: 'Failed to fetch platform settings' });
  }
});

/**
 * PUT /api/admin/settings
 * Update platform configuration key-values
 */
router.put('/settings', async (req, res) => {
  try {
    const config = req.body; // e.g. { platformName: 'Nirikshan Core', maintenanceMode: 'false' }
    for (const key of Object.keys(config)) {
      await PlatformSetting.upsert({ key, value: String(config[key]) });
    }
    res.json({ message: 'Settings saved successfully' });
  } catch (err) {
    console.error('Save settings error:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

/**
 * GET /api/admin/metrics
 * Fetch system wide administrative analytics
 */
router.get('/metrics', async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalComplaints, totalRti, totalReps, totalPromises, totalBudgets] = await Promise.all([
      User.count({ where: { isAnonymous: false } }),
      User.count({ where: { status: 'active', isAnonymous: false } }),
      Complaint.count(),
      RtiRequest.count(),
      Representative.count(),
      PromiseModel.count(),
      BudgetProject.count()
    ]);

    // Dummy values for trend aggregation (complaints per month/ward)
    const complaintTrends = [
      { month: 'Jan', count: Math.round(totalComplaints * 0.15) },
      { month: 'Feb', count: Math.round(totalComplaints * 0.2) },
      { month: 'Mar', count: Math.round(totalComplaints * 0.25) },
      { month: 'Apr', count: Math.round(totalComplaints * 0.4) }
    ];

    res.json({
      totalUsers,
      activeUsers,
      totalComplaints,
      totalRti,
      totalReps,
      totalPromises,
      totalBudgets,
      complaintTrends
    });
  } catch (err) {
    console.error('Fetch metrics error:', err);
    res.status(500).json({ error: 'Failed to compile platform metrics' });
  }
});

module.exports = router;
