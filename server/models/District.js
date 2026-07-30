const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const District = sequelize.define('District', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cdoName: {
    type: DataTypes.STRING,
    field: 'cdo_name',
    allowNull: true
  },
  daoAddress: {
    type: DataTypes.TEXT,
    field: 'dao_address',
    allowNull: true
  },
  daoContact: {
    type: DataTypes.STRING,
    field: 'dao_contact',
    allowNull: true
  },
  daoOfficeHours: {
    type: DataTypes.STRING,
    field: 'dao_office_hours',
    allowNull: true
  }
}, {
  tableName: 'districts'
});

module.exports = District;
