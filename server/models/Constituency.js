const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Constituency = sequelize.define('Constituency', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false
  },
  districtId: {
    type: DataTypes.INTEGER,
    field: 'district_id',
    allowNull: true
  },
  winnerRepresentativeId: {
    type: DataTypes.INTEGER,
    field: 'winner_representative_id',
    allowNull: true
  }
}, {
  tableName: 'constituencies'
});

module.exports = Constituency;
