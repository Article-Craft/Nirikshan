const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StatusHistory = sequelize.define('StatusHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  promiseId: {
    type: DataTypes.INTEGER,
    field: 'promise_id',
    allowNull: false
  },
  oldStatus: {
    type: DataTypes.ENUM('promised', 'in_progress', 'delayed', 'fulfilled', 'broken'),
    field: 'old_status',
    allowNull: true
  },
  newStatus: {
    type: DataTypes.ENUM('promised', 'in_progress', 'delayed', 'fulfilled', 'broken'),
    field: 'new_status',
    allowNull: false
  },
  changedBy: {
    type: DataTypes.INTEGER,
    field: 'changed_by',
    allowNull: true
  },
  evidenceId: {
    type: DataTypes.INTEGER,
    field: 'evidence_id',
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'status_history'
});

module.exports = StatusHistory;
