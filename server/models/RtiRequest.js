const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RtiRequest = sequelize.define('RtiRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetOffice: {
    type: DataTypes.STRING,
    field: 'target_office',
    allowNull: false
  },
  letterContent: {
    type: DataTypes.TEXT,
    field: 'letter_content',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'processing', 'completed', 'appealed'),
    defaultValue: 'submitted'
  },
  submittedDate: {
    type: DataTypes.DATEONLY,
    field: 'submitted_date',
    defaultValue: DataTypes.NOW
  },
  deadlineDate: {
    type: DataTypes.DATEONLY,
    field: 'deadline_date',
    allowNull: true
  }
}, {
  tableName: 'rti_requests'
});

module.exports = RtiRequest;
