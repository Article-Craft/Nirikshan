const sequelize = require('../config/db');

async function checkPostgres() {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL successfully.');
    const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public';");
    console.log('Tables in database:', results.map(r => r.table_name));
    
    const [userCount] = await sequelize.query("SELECT COUNT(*) FROM users;");
    console.log('Number of seeded users:', userCount[0].count);
  } catch (e) {
    console.error('Error connecting or querying PostgreSQL:', e);
  } finally {
    process.exit(0);
  }
}

checkPostgres();
