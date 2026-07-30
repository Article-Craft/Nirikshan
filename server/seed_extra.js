const sequelize = require('./config/db');
const { BudgetProject, District, Complaint } = require('./models');

async function seedExtra() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database. Seeding extra projects and complaints...');

    // Find a couple of districts
    const ktm = await District.findOne({ where: { name: 'Kathmandu' } });
    const lalitpur = await District.findOne({ where: { name: 'Lalitpur' } });
    const kaski = await District.findOne({ where: { name: 'Kaski' } });

    if (!ktm || !lalitpur || !kaski) {
      console.error('Seed districts not found. Run main seed.js first.');
      process.exit(1);
    }

    // 1. Seed Budget Projects
    await BudgetProject.bulkCreate([
      {
        title: 'Kathmandu Ring Road Extension Phase 2',
        districtId: ktm.id,
        allocatedAmount: 120000000.00,
        completionPercent: 45,
        evidenceStatus: 'unverified',
        description: 'Road widening and underpass construction'
      },
      {
        title: 'Melamchi Water Supply Distribution Network',
        districtId: ktm.id,
        allocatedAmount: 85000000.00,
        completionPercent: 80,
        evidenceStatus: 'verified',
        description: 'Laying pipes and water tank builds'
      },
      {
        title: 'Patan Durbar Square Temple Restoration',
        districtId: lalitpur.id,
        allocatedAmount: 35000000.00,
        completionPercent: 95,
        evidenceStatus: 'verified',
        description: 'Monuments restoration project'
      },
      {
        title: 'Lakeside Sewage Treatment Plant',
        districtId: kaski.id,
        allocatedAmount: 50000000.00,
        completionPercent: 30,
        evidenceStatus: 'pending',
        description: 'Sewage and wastewater management facility'
      }
    ]);
    console.log('Budget projects seeded.');

    // 2. Seed Complaints (Verified ones to show on the heatmap initially)
    await Complaint.bulkCreate([
      {
        serviceType: 'infrastructure',
        description: 'Potholes on the road to Gongabu are causing traffic issues.',
        locationLat: 27.7314,
        locationLng: 85.3110,
        ward: '26',
        isAnonymous: true,
        status: 'verified'
      },
      {
        serviceType: 'services',
        description: 'Frequent power outages in Bakhundole without schedule.',
        locationLat: 27.6792,
        locationLng: 85.3142,
        ward: '3',
        isAnonymous: false,
        status: 'verified'
      },
      {
        serviceType: 'corruption',
        description: 'Bribery demanded at land revenue office.',
        locationLat: 28.2120,
        locationLng: 83.9575,
        ward: '6',
        isAnonymous: true,
        status: 'verified'
      }
    ]);
    console.log('Complaints seeded.');
    process.exit(0);
  } catch (error) {
    console.error('Extra seeding failed:', error);
    process.exit(1);
  }
}

seedExtra();
