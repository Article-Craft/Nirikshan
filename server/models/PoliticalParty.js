const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PoliticalParty = sequelize.define('PoliticalParty', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  logoUrl: {
    type: DataTypes.STRING,
    field: 'logo_url',
    allowNull: true
  },
  manifesto: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  leaders: {
    type: DataTypes.TEXT, // Stored as comma-separated or text description
    allowNull: true
  }
}, {
  tableName: 'political_parties',
  timestamps: false
});

module.exports = PoliticalParty;
