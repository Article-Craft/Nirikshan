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
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  mapIdentifier: {
    type: DataTypes.STRING,
    field: 'map_identifier',
    allowNull: false
  },
  electionYear: {
    type: DataTypes.INTEGER,
    field: 'election_year',
    defaultValue: 2026
  },
  voteCount: {
    type: DataTypes.STRING,
    field: 'vote_count',
    defaultValue: 'pending_verification'
  },
  victoryMargin: {
    type: DataTypes.STRING,
    field: 'victory_margin',
    defaultValue: 'pending_verification'
  }
}, {
  tableName: 'constituencies'
});

module.exports = Constituency;
