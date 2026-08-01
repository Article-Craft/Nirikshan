const sequelize = require('../config/db');

async function checkSchema() {
  try {
    await sequelize.authenticate();
    const [results, metadata] = await sequelize.query("PRAGMA table_info(users);");
    console.log('Users table columns:', results);
    const [indexes] = await sequelize.query("PRAGMA index_list(users);");
    console.log('Users table indexes:', indexes);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

checkSchema();
