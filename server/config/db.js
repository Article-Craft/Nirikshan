const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
let sequelize;

if (!databaseUrl || databaseUrl.startsWith('sqlite:')) {
  console.log('Initializing with SQLite database.');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './nirikshan.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: false,
      underscored: true
    }
  });
} else {
  console.log('Initializing with PostgreSQL database.');
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      // Enable SSL if required for production deployments (e.g. Render/Neon)
      ssl: process.env.DATABASE_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    define: {
      timestamps: false,
      underscored: true
    }
  });
}

module.exports = sequelize;

