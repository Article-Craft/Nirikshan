const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'd:\\Internship Projecct\\nirikshan.sqlite'
});

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: true },
  passwordHash: { type: DataTypes.STRING, field: 'password_hash', allowNull: true },
  role: { type: DataTypes.ENUM('citizen', 'moderator', 'admin'), defaultValue: 'citizen' },
  isAnonymous: { type: DataTypes.BOOLEAN, field: 'is_anonymous', defaultValue: false }
}, {
  tableName: 'users',
  timestamps: false
});

async function check() {
  try {
    const users = await User.findAll();
    console.log('Users in root DB:', users.map(u => ({ id: u.id, name: u.name, email: u.email, passwordHash: u.passwordHash })));
  } catch (e) {
    console.error('Error reading root DB:', e.message);
  } finally {
    process.exit(0);
  }
}

check();
