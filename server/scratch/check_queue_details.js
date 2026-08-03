require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { StatusHistory, Evidence, User, Complaint, CivicEvent, Promise: PromiseModel } = require('../models');
const sequelize = require('../config/db');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('--- CONNECTED TO DB ---');

    // 1. Pending Updates
    const updates = await StatusHistory.findAll({
      include: [
        {
          model: Evidence,
          as: 'evidence',
          where: { verified: false },
          include: [{ model: User, as: 'uploader' }]
        },
        {
          model: PromiseModel,
          as: 'promise'
        },
        {
          model: User,
          as: 'changer'
        }
      ]
    });

    console.log(`\nFound ${updates.length} Pending Promise Status Updates:`);
    updates.forEach(u => {
      console.log(`- Promise: "${u.promise?.title}"`);
      console.log(`  Proposed Status: "${u.newStatus}"`);
      console.log(`  Changer/Submitter: ${u.changer?.name || 'Guest'} (ID: ${u.changer?.id || 'N/A'}, Email: ${u.changer?.email || 'N/A'})`);
      console.log(`  Evidence Link: ${u.evidence?.fileUrl || 'N/A'}`);
    });

    // 2. Pending Complaints
    const complaints = await Complaint.findAll({
      where: { status: 'pending' }
    });
    console.log(`\nFound ${complaints.length} Pending Citizen Complaints:`);
    complaints.forEach(c => {
      console.log(`- Service Type: "${c.serviceType}"`);
      console.log(`  Description: "${c.description}"`);
      console.log(`  Uploader Mode: ${c.isAnonymous ? 'Anonymous' : 'Public Citizen'}`);
    });

    // 3. Pending Civic Events
    const events = await CivicEvent.findAll({
      where: { verified: false }
    });
    console.log(`\nFound ${events.length} Pending Civic Events:`);
    events.forEach(e => {
      console.log(`- Event Name: "${e.name}"`);
      console.log(`  Organizer: "${e.organizer}"`);
      console.log(`  Type: "${e.eventType}"`);
    });

  } catch (err) {
    console.error('Error querying queue:', err);
  } finally {
    process.exit(0);
  }
}

main();
