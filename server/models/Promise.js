const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PromiseModel = sequelize.define('Promise', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  officialName: {
    type: DataTypes.STRING,
    field: 'official_name',
    allowNull: false
  },
  officialRole: {
    type: DataTypes.STRING,
    field: 'official_role',
    allowNull: false
  },
  constituency: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('promised', 'in_progress', 'delayed', 'fulfilled', 'broken'),
    defaultValue: 'promised'
  },
  datePromised: {
    type: DataTypes.DATEONLY,
    field: 'date_promised',
    allowNull: false
  },
  dateUpdated: {
    type: DataTypes.DATE,
    field: 'date_updated',
    defaultValue: DataTypes.NOW
  },
  sourceUrl: {
    type: DataTypes.TEXT,
    field: 'source_url',
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by',
    allowNull: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'promises'
});

module.exports = PromiseModel;
