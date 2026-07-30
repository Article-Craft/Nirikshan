const sequelize = require('./config/db');
const { District, Constituency, Representative } = require('./models');

const nepalData = [
  {
    province: 'Koshi Province',
    districts: ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur']
  },
  {
    province: 'Madhesh Province',
    districts: ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha']
  },
  {
    province: 'Bagmati Province',
    districts: ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok']
  },
  {
    province: 'Gandaki Province',
    districts: ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun']
  },
  {
    province: 'Lumbini Province',
    districts: ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Eastern Rukum', 'Gulmi', 'Kapilvastu', 'Nawalparasi', 'Palpa', 'Pyuthan', 'Rolpa', 'Rupandehi']
  },
  {
    province: 'Karnali Province',
    districts: ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Salyan', 'Western Rukum', 'Surkhet']
  },
  {
    province: 'Sudurpashchim Province',
    districts: ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur']
  }
];

const explicitReps = [
  // Kathmandu
  { name: 'Prakash Man Singh', party: 'NC', constituencyId: 'KTM-1', position: 'Member of Parliament', attendancePercent: 82, billsSponsored: 4, contactInfo: 'prakash.singh@parliament.gov.np' },
  { name: 'Sobita Gautam', party: 'RSP', constituencyId: 'KTM-2', position: 'Member of Parliament', attendancePercent: 94, billsSponsored: 8, contactInfo: 'sobita.gautam@parliament.gov.np' },
  { name: 'Santosh Chalise', party: 'NC', constituencyId: 'KTM-3', position: 'Member of Parliament', attendancePercent: 78, billsSponsored: 3, contactInfo: 'santosh.chalise@parliament.gov.np' },
  { name: 'Gagan Kumar Thapa', party: 'NC', constituencyId: 'KTM-4', position: 'Member of Parliament', attendancePercent: 90, billsSponsored: 12, contactInfo: 'gagan.thapa@parliament.gov.np' },
  { name: 'Pradip Paudel', party: 'NC', constituencyId: 'KTM-5', position: 'Member of Parliament', attendancePercent: 88, billsSponsored: 5, contactInfo: 'pradip.paudel@parliament.gov.np' },
  { name: 'Shishir Khanal', party: 'RSP', constituencyId: 'KTM-6', position: 'Member of Parliament', attendancePercent: 91, billsSponsored: 7, contactInfo: 'shishir.khanal@parliament.gov.np' },
  { name: 'Ganesh Parajuli', party: 'RSP', constituencyId: 'KTM-7', position: 'Member of Parliament', attendancePercent: 85, billsSponsored: 4, contactInfo: 'ganesh.parajuli@parliament.gov.np' },
  { name: 'Biraj Bhakta Shrestha', party: 'RSP', constituencyId: 'KTM-8', position: 'Member of Parliament', attendancePercent: 89, billsSponsored: 6, contactInfo: 'biraj.shrestha@parliament.gov.np' },
  { name: 'Krishna Gopal Shrestha', party: 'UML', constituencyId: 'KTM-9', position: 'Member of Parliament', attendancePercent: 75, billsSponsored: 2, contactInfo: 'krishna.shrestha@parliament.gov.np' },
  { name: 'Rajendra Kumar KC', party: 'NC', constituencyId: 'KTM-10', position: 'Member of Parliament', attendancePercent: 80, billsSponsored: 3, contactInfo: 'rajendra.kc@parliament.gov.np' },
  // Lalitpur
  { name: 'Udaya Shumsher Rana', party: 'NC', constituencyId: 'LPT-1', position: 'Member of Parliament', attendancePercent: 83, billsSponsored: 5, contactInfo: 'udaya.rana@parliament.gov.np' },
  { name: 'Prem Bahadur Maharjan', party: 'UML', constituencyId: 'LPT-2', position: 'Member of Parliament', attendancePercent: 79, billsSponsored: 2, contactInfo: 'prem.maharjan@parliament.gov.np' },
  { name: 'Dr. Toshima Karki', party: 'RSP', constituencyId: 'LPT-3', position: 'Member of Parliament', attendancePercent: 95, billsSponsored: 10, contactInfo: 'toshima.karki@parliament.gov.np' },
  // Jhapa
  { name: 'Vishwa Prakash Sharma', party: 'NC', constituencyId: 'JHP-1', position: 'Member of Parliament', attendancePercent: 87, billsSponsored: 6, contactInfo: 'vishwa.sharma@parliament.gov.np' },
  { name: 'Devraj Ghimire', party: 'UML', constituencyId: 'JHP-2', position: 'Speaker of House', attendancePercent: 99, billsSponsored: 1, contactInfo: 'speaker@parliament.gov.np' },
  { name: 'Rajendra Lingden', party: 'RPP', constituencyId: 'JHP-3', position: 'Member of Parliament', attendancePercent: 84, billsSponsored: 3, contactInfo: 'rajendra.lingden@parliament.gov.np' },
  { name: 'Lal Prasad Sawa Limbu', party: 'UML', constituencyId: 'JHP-4', position: 'Member of Parliament', attendancePercent: 80, billsSponsored: 2, contactInfo: 'lal.sawa@parliament.gov.np' },
  { name: 'Kharga Prasad (K.P.) Oli', party: 'UML', constituencyId: 'JHP-5', position: 'Member of Parliament', attendancePercent: 70, billsSponsored: 4, contactInfo: 'kp.oli@parliament.gov.np' },
  // Chitwan
  { name: 'Hari Dhakal', party: 'RSP', constituencyId: 'CTW-1', position: 'Member of Parliament', attendancePercent: 88, billsSponsored: 5, contactInfo: 'hari.dhakal@parliament.gov.np' },
  { name: 'Rabi Lamichhane', party: 'RSP', constituencyId: 'CTW-2', position: 'Member of Parliament', attendancePercent: 85, billsSponsored: 9, contactInfo: 'rabi.lamichhane@parliament.gov.np' },
  { name: 'Dr. Bikram Pandey', party: 'RPP', constituencyId: 'CTW-3', position: 'Member of Parliament', attendancePercent: 72, billsSponsored: 2, contactInfo: 'bikram.pandey@parliament.gov.np' },
  // Kaski
  { name: 'Man Bahadur Gurung', party: 'UML', constituencyId: 'KSK-1', position: 'Member of Parliament', attendancePercent: 81, billsSponsored: 3, contactInfo: 'man.gurung@parliament.gov.np' },
  { name: 'Bidya Bhattarai', party: 'UML', constituencyId: 'KSK-2', position: 'Member of Parliament', attendancePercent: 86, billsSponsored: 4, contactInfo: 'bidya.bhattarai@parliament.gov.np' },
  { name: 'Damodar Bairagi', party: 'UML', constituencyId: 'KSK-3', position: 'Member of Parliament', attendancePercent: 83, billsSponsored: 3, contactInfo: 'damodar.bairagi@parliament.gov.np' },
  // Gorkha
  { name: 'Rajendra Bajgain', party: 'NC', constituencyId: 'GRK-1', position: 'Member of Parliament', attendancePercent: 84, billsSponsored: 4, contactInfo: 'rajendra.bajgain@parliament.gov.np' },
  { name: 'Pushpa Kamal Dahal (Prachanda)', party: 'MC', constituencyId: 'GRK-2', position: 'Member of Parliament', attendancePercent: 78, billsSponsored: 5, contactInfo: 'prachanda@parliament.gov.np' },
  // Gulmi
  { name: 'Hon. Pradeep Gyawali', party: 'UML', constituencyId: 'GLM-1', position: 'Member of Parliament', attendancePercent: 85, billsSponsored: 7, contactInfo: 'pradeep.gyawali@parliament.gov.np' }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database. Seeding...');

    // Sync to ensure all tables exist
    await sequelize.sync({ force: true });
    console.log('Database synced (tables recreated).');

    for (const prov of nepalData) {
      for (const distName of prov.districts) {
        const district = await District.create({
          name: distName,
          province: prov.province,
          cdoName: `CDO of ${distName}`,
          daoAddress: `District Administration Office, ${distName} HQ, Nepal`,
          daoContact: `+977-0${distName.length}-500000`,
          daoOfficeHours: '10:00 AM - 5:00 PM'
        });

        // Seed some explicit constituencies for specific districts
        const key = distName.toUpperCase();
        if (key === 'KATHMANDU') {
          for (let i = 1; i <= 10; i++) {
            await Constituency.create({
              id: `KTM-${i}`,
              name: `Kathmandu ${i}`,
              province: prov.province,
              districtId: district.id
            });
          }
        } else if (key === 'LALITPUR') {
          for (let i = 1; i <= 3; i++) {
            await Constituency.create({
              id: `LPT-${i}`,
              name: `Lalitpur ${i}`,
              province: prov.province,
              districtId: district.id
            });
          }
        } else if (key === 'JHAPA') {
          for (let i = 1; i <= 5; i++) {
            await Constituency.create({
              id: `JHP-${i}`,
              name: `Jhapa ${i}`,
              province: prov.province,
              districtId: district.id
            });
          }
        } else if (key === 'CHITWAN') {
          for (let i = 1; i <= 3; i++) {
            await Constituency.create({
              id: `CTW-${i}`,
              name: `Chitwan ${i}`,
              province: prov.province,
              districtId: district.id
            });
          }
        } else if (key === 'KASKI') {
          for (let i = 1; i <= 3; i++) {
            await Constituency.create({
              id: `KSK-${i}`,
              name: `Kaski ${i}`,
              province: prov.province,
              districtId: district.id
            });
          }
        } else if (key === 'GORKHA') {
          for (let i = 1; i <= 2; i++) {
            await Constituency.create({
              id: `GRK-${i}`,
              name: `Gorkha ${i}`,
              province: prov.province,
              districtId: district.id
            });
          }
        } else if (key === 'GULMI') {
          await Constituency.create({
            id: `GLM-1`,
            name: `Gulmi 1`,
            province: prov.province,
            districtId: district.id
          });
        } else {
          // Standard default constituency for other districts
          const cleanName = distName.toLowerCase().replace(/[^a-z0-9]/g, '');
          await Constituency.create({
            id: `${cleanName}-1`,
            name: `${distName} 1`,
            province: prov.province,
            districtId: district.id
          });
        }
      }
    }

    console.log('Districts and Constituencies seeded.');

    // Seed representatives
    for (const repData of explicitReps) {
      // Find if constituency exists
      const consty = await Constituency.findByPk(repData.constituencyId);
      if (consty) {
        const rep = await Representative.create({
          name: repData.name,
          party: repData.party,
          constituencyId: repData.constituencyId,
          position: repData.position,
          attendancePercent: repData.attendancePercent,
          billsSponsored: repData.billsSponsored,
          contactInfo: repData.contactInfo,
          photoUrl: `https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=60`
        });

        // Set as winner representative
        consty.winnerRepresentativeId = rep.id;
        await consty.save();
      }
    }

    console.log('Representatives seeded.');
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}
