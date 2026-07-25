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
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  education: {
    type: DataTypes.STRING,
    allowNull: true
  },
  electionHistory: {
    type: DataTypes.TEXT,
    field: 'election_history',
    allowNull: true
  },
  assets: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  declarations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  votingRecord: {
    type: DataTypes.TEXT,
    field: 'voting_record',
    allowNull: true
  },
  promisesCompleted: {
    type: DataTypes.INTEGER,
    field: 'promises_completed',
    defaultValue: 0
  },
  promisesInProgress: {
    type: DataTypes.INTEGER,
    field: 'promises_in_progress',
    defaultValue: 0
  },
  promisesBroken: {
    type: DataTypes.INTEGER,
    field: 'promises_broken',
    defaultValue: 0
  },
  promisesDelayed: {
    type: DataTypes.INTEGER,
    field: 'promises_delayed',
    defaultValue: 0
  },
  ratingValue: {
    type: DataTypes.DECIMAL(3, 2),
    field: 'rating_value',
    defaultValue: 4.0
  }
}, {
  tableName: 'representatives'
});

module.exports = Representative;
