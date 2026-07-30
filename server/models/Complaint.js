const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  serviceType: {
    type: DataTypes.STRING,
    field: 'service_type',
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  locationLat: {
    type: DataTypes.DOUBLE,
    field: 'location_lat',
    allowNull: true
  },
  locationLng: {
    type: DataTypes.DOUBLE,
    field: 'location_lng',
    allowNull: true
  },
  ward: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    field: 'is_anonymous',
    defaultValue: false
  },
  photoUrl: {
    type: DataTypes.STRING,
    field: 'photo_url',
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'complaints'
});

module.exports = Complaint;
