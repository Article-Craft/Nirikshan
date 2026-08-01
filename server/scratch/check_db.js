const { District } = require('../models');
const sequelize = require('../config/db');

async function checkDb() {
  try {
    await sequelize.authenticate();
    const districts = await District.findAll();
    console.log('Total DB Districts:', districts.length);
    console.log('First 5 DB Districts:', districts.slice(0, 5).map(d => d.toJSON()));
    
    // Check if Kailali or Western Rukum is in the DB
    const kailali = districts.find(d => d.name.toUpperCase().includes('KAILALI'));
    const wRukum = districts.find(d => d.name.toUpperCase().includes('RUKUM'));
    console.log('Kailali in DB:', kailali ? kailali.toJSON() : 'Not Found');
    console.log('Rukum in DB:', wRukum ? wRukum.toJSON() : 'Not Found');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

checkDb();
