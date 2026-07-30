const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CivicEvent = sequelize.define('CivicEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eventType: {
    type: DataTypes.STRING,
    field: 'event_type',
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
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
  organizer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'civic_events'
});

module.exports = CivicEvent;
