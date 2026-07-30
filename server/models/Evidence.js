const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Evidence = sequelize.define('Evidence', {
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
  fileUrl: {
    type: DataTypes.TEXT,
    field: 'file_url',
    allowNull: false
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    field: 'uploaded_by',
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    allowNull: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'evidence'
});

module.exports = Evidence;
