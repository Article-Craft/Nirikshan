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
  assistantCdo: {
    type: DataTypes.STRING,
    field: 'assistant_cdo',
    allowNull: true
  },
  headquarters: {
    type: DataTypes.STRING,
    allowNull: true
  },
  areaSqKm: {
    type: DataTypes.STRING,
    field: 'area_sq_km',
    allowNull: true
  },
  population: {
    type: DataTypes.STRING,
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
  daoEmail: {
    type: DataTypes.STRING,
    field: 'dao_email',
    allowNull: true
  },
  daoWebsite: {
    type: DataTypes.STRING,
    field: 'dao_website',
    allowNull: true
  },
  daoOfficeHours: {
    type: DataTypes.STRING,
    field: 'dao_office_hours',
    allowNull: true
  },
  municipalitiesCount: {
    type: DataTypes.INTEGER,
    field: 'municipalities_count',
    allowNull: true
  },
  ruralMunicipalitiesCount: {
    type: DataTypes.INTEGER,
    field: 'rural_municipalities_count',
    allowNull: true
  },
  policeContact: {
    type: DataTypes.STRING,
    field: 'police_contact',
    allowNull: true
  },
  emergencyContact: {
    type: DataTypes.STRING,
    field: 'emergency_contact',
    allowNull: true
  },
  mayorName: {
    type: DataTypes.STRING,
    field: 'mayor_name',
    allowNull: true
  }
}, {
  tableName: 'districts'
});

module.exports = District;
