const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BudgetProject = sequelize.define('BudgetProject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  districtId: {
    type: DataTypes.INTEGER,
    field: 'district_id',
    allowNull: true
  },
  allocatedAmount: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'allocated_amount',
    allowNull: false
  },
  completionPercent: {
    type: DataTypes.INTEGER,
    field: 'completion_percent',
    defaultValue: 0
  },
  evidenceStatus: {
    type: DataTypes.ENUM('unverified', 'pending', 'verified'),
    field: 'evidence_status',
    defaultValue: 'unverified'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'budget_projects'
});

module.exports = BudgetProject;
