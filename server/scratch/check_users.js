const { User } = require('../models');
const sequelize = require('../config/db');

async function checkUsers() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll();
    console.log('All Users with hashes:', users.map(u => ({ id: u.id, name: u.name, email: u.email, passwordHash: u.passwordHash, isAnonymous: u.isAnonymous })));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

checkUsers();
