const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Representative = sequelize.define('Representative', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  photoUrl: {
    type: DataTypes.STRING,
    field: 'photo_url',
    allowNull: true
  },
  party: {
    type: DataTypes.STRING,
    allowNull: false
  },
  constituencyId: {
    type: DataTypes.STRING,
    field: 'constituency_id',
    allowNull: true
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attendancePercent: {
    type: DataTypes.INTEGER,
    field: 'attendance_percent',
    allowNull: true
  },
  billsSponsored: {
    type: DataTypes.INTEGER,
    field: 'bills_sponsored',
    allowNull: true
  },
  contactInfo: {
    type: DataTypes.TEXT,
    field: 'contact_info',
    allowNull: true
  }
}, {
  tableName: 'representatives'
});

module.exports = Representative;
