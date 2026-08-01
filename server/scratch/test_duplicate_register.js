const { User } = require('../models');
const sequelize = require('../config/db');

async function testDup() {
  try {
    await sequelize.authenticate();
    const email = 'ashmit@gmail.com';
    const existingUser = await User.findOne({ where: { email } });
    console.log('existingUser found:', existingUser ? existingUser.toJSON() : 'None');
    
    // Let's try creating a user with the same email directly
    const newUser = await User.create({
      name: 'Test Duplicate',
      email: email,
      passwordHash: 'dummyhash',
      role: 'citizen',
      isAnonymous: false
    });
    console.log('New user created directly:', newUser.toJSON());
  } catch (e) {
    console.error('Error creating duplicate:', e.message);
  } finally {
    process.exit(0);
  }
}

testDup();
