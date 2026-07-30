const sequelize = require('./config/db');
const bcrypt = require('bcryptjs');
const { 
  User, 
  District, 
  Constituency, 
  Representative, 
  Promise: PromiseModel, 
  BudgetProject, 
  Complaint, 
  CivicEvent 
} = require('./models');

const nepalData = [
  {
    province: 'Koshi Province',
    districts: ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Tehrathum', 'Udayapur']
  },
  {
    province: 'Madhesh Province',
    districts: ['Bara', 'Dhanusa', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha']
  },
  {
    province: 'Bagmati Province',
    districts: ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchowk', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok']
  },
  {
    province: 'Gandaki Province',
    districts: ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahu']
  },
  {
    province: 'Lumbini Province',
    districts: ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Eastern Rukum', 'Gulmi', 'Kapilvastu', 'Parasi', 'Palpa', 'Pyuthan', 'Rolpa', 'Rupandehi']
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

const canonicalWinners = [
  { name: 'Achham 1', winner: 'Bharat Kumar Swar', party: 'Nepali Congress' },
  { name: 'Achham 2', winner: 'Yagya Bahadur Bogati', party: 'CPN (UML)' },
  { name: 'Arghakhanchi 1', winner: 'Hari Prasad Bhusal', party: 'RSP' },
  { name: 'Baglung 1', winner: 'Sushil Khadka', party: 'RSP' },
  { name: 'Baglung 2', winner: 'Som Sharma', party: 'RSP' },
  { name: 'Baitadi 1', winner: 'Hari Mohan Bhandari', party: 'RSP' },
  { name: 'Bajhang 1', winner: 'Ain Bahadur Mahar', party: 'CPN (UML)' },
  { name: 'Bajura 1', winner: 'Janak Raj Giri', party: 'Nepali Congress' },
  { name: 'Banke 1', winner: 'Suresh Kumar Chaudhary', party: 'RSP' },
  { name: 'Banke 2', winner: 'Mohammad Ishtiyaq Rayi', party: 'CPN (UML)' },
  { name: 'Banke 3', winner: 'Khagendra Sunar', party: 'RSP' },
  { name: 'Bara 1', winner: 'Ganesh Dhimal', party: 'RSP' },
  { name: 'Bara 2', winner: 'Chandan Kumar Singh', party: 'RSP' },
  { name: 'Bara 3', winner: 'Arvind Sah', party: 'RSP' },
  { name: 'Bara 4', winner: 'Rahbar Ansari', party: 'RSP' },
  { name: 'Bardiya 1', winner: 'Thakur Singh Tharu', party: 'RSP' },
  { name: 'Bardiya 2', winner: 'Shreedhar Pokharel', party: 'RSP' },
  { name: 'Bhaktapur 1', winner: 'Rukesh Ranjit', party: 'RSP' },
  { name: 'Bhaktapur 2', winner: 'Rajiv Khatri', party: 'RSP' },
  { name: 'Bhojpur 1', winner: 'Dhurbaraj Rai', party: 'Shram Sanskriti Party' },
  { name: 'Chitwan 1', winner: 'Hari Dhakal', party: 'RSP' },
  { name: 'Chitwan 2', winner: 'Rabi Lamichhane', party: 'RSP' },
  { name: 'Chitwan 3', winner: 'Sobita Gautam', party: 'RSP' },
  { name: 'Dadeldhura 1', winner: 'Tara Prasad Joshi', party: 'RSP' },
  { name: 'Dailekh 1', winner: 'Basana Thapa', party: 'Nepali Congress' },
  { name: 'Dailekh 2', winner: 'Laxmi Prasad Pokharel', party: 'CPN (UML)' },
  { name: 'Dang 1', winner: 'Devraj Pathak', party: 'RSP' },
  { name: 'Dang 2', winner: 'Bipin Kumar Acharya', party: 'RSP' },
  { name: 'Dang 3', winner: 'Kamal Subedi', party: 'RSP' },
  { name: 'Darchula 1', winner: 'Ganesh Singh Thagunna', party: 'CPN (UML)' },
  { name: 'Dhading 1', winner: 'Ashika Tamang', party: 'RSP' },
  { name: 'Dhading 2', winner: 'Bodh Narayan Shrestha', party: 'RSP' },
  { name: 'Dhankuta 1', winner: 'Rajendra Kumar Rai', party: 'CPN (UML)' },
  { name: 'Dhanusha 1', winner: 'Matrika Prasad Yadav', party: 'Nepali Communist Party' },
  { name: 'Dhanusha 2', winner: 'Ram Binod Yadav', party: 'RSP' },
  { name: 'Dhanusha 3', winner: 'Manish Jha', party: 'RSP' },
  { name: 'Dhanusha 4', winner: 'Raj Kishor Mahato', party: 'RSP' },
  { name: 'Dolakha 1', winner: 'Jagadish Kharel', party: 'RSP' },
  { name: 'Dolpa 1', winner: 'Dhan Bahadur Buda', party: 'Nepali Communist Party' },
  { name: 'Doti 1', winner: 'Bharat Bahadur Khadka', party: 'Nepali Congress' },
  { name: 'Gorkha 1', winner: 'Sudan Gurung', party: 'RSP' },
  { name: 'Gorkha 2', winner: 'Kabindra Burlakoti', party: 'RSP' },
  { name: 'Gulmi 1', winner: 'Sagar Dhakal', party: 'RSP' },
  { name: 'Gulmi 2', winner: 'Govinda Panthi', party: 'RSP' },
  { name: 'Humla 1', winner: 'Jayapati Rokaya', party: 'Nepali Congress' },
  { name: 'Ilam 1', winner: 'Nishkal Rai', party: 'Nepali Congress' },
  { name: 'Ilam 2', winner: 'Suhang Nembang', party: 'CPN (UML)' },
  { name: 'Jajarkot 1', winner: 'Khadak Bahadur Budha', party: 'Nepali Congress' },
  { name: 'Jhapa 1', winner: 'Nisha Dangi', party: 'RSP' },
  { name: 'Jhapa 2', winner: 'Indira Rana Magar', party: 'RSP' },
  { name: 'Jhapa 3', winner: 'Prakash Pathak', party: 'RSP' },
  { name: 'Jhapa 4', winner: 'Shambhu Prasad Dhakal', party: 'RSP' },
  { name: 'Jhapa 5', winner: 'Balen Shah', party: 'RSP' },
  { name: 'Jumla 1', winner: 'Gyanendra Shahi', party: 'Rastriya Prajatantra Party' },
  { name: 'Kailali 1', winner: 'Komal Gyawali', party: 'RSP' },
  { name: 'Kailali 2', winner: 'K. P. Khanal', party: 'RSP' },
  { name: 'Kailali 3', winner: 'Jagat Prasad Joshi', party: 'RSP' },
  { name: 'Kailali 4', winner: 'Khem Raj Koirala', party: 'RSP' },
  { name: 'Kailali 5', winner: 'Ananda Bahadur Chand', party: 'RSP' },
  { name: 'Kalikot 1', winner: 'Mahendra Bahadur Shahi', party: 'Nepali Communist Party' },
  { name: 'Kanchanpur 1', winner: 'Janak Singh Dhami', party: 'RSP' },
  { name: 'Kanchanpur 2', winner: 'Deepak Raj Bohara', party: 'RSP' },
  { name: 'Kanchanpur 3', winner: 'Gyanendra Singh Mahata', party: 'RSP' },
  { name: 'Kapilvastu 1', winner: 'Mohan Lal Acharya', party: 'RSP' },
  { name: 'Kapilvastu 2', winner: 'Bikram Thapa', party: 'RSP' },
  { name: 'Kapilvastu 3', winner: 'Mangal Prasad Gupta', party: 'CPN (UML)' },
  { name: 'Kaski 1', winner: 'Damodar Bairagi', party: 'CPN (UML)' },
  { name: 'Kaski 2', winner: 'Bidya Bhattarai', party: 'CPN (UML)' },
  { name: 'Kaski 3', winner: 'Damodar Bhusal', party: 'RSP' },
  { name: 'Kathmandu 1', winner: 'Pukar Bam', party: 'RSP' },
  { name: 'Kathmandu 2', winner: 'Sobita Gautam', party: 'RSP' },
  { name: 'Kathmandu 3', winner: 'Santosh Chalise', party: 'Nepali Congress' },
  { name: 'Kathmandu 4', winner: 'Gagan Thapa', party: 'Nepali Congress' },
  { name: 'Kathmandu 5', winner: 'Pradip Paudel', party: 'Nepali Congress' },
  { name: 'Kathmandu 6', winner: 'Shishir Khanal', party: 'RSP' },
  { name: 'Kathmandu 7', winner: 'Ganesh Parajuli', party: 'RSP' },
  { name: 'Kathmandu 8', winner: 'Toshima Karki', party: 'RSP' },
  { name: 'Kathmandu 9', winner: 'Krishna Gopal Shrestha', party: 'CPN (UML)' },
  { name: 'Kathmandu 10', winner: 'Rajendra Kumar KC', party: 'Nepali Congress' },
  { name: 'Kavrepalanchok 1', winner: 'Tirtha Bahadur Lama', party: 'Nepali Congress' },
  { name: 'Kavrepalanchok 2', winner: 'Gokul Prasad Baskota', party: 'CPN (UML)' },
  { name: 'Khotang 1', winner: 'Ram Kumar Rai', party: 'Nepali Communist Party' },
  { name: 'Lalitpur 1', winner: 'Udaya Shumsher Rana', party: 'Nepali Congress' },
  { name: 'Lalitpur 2', winner: 'Prem Bahadur Maharjan', party: 'CPN (UML)' },
  { name: 'Lalitpur 3', winner: 'Toshima Karki', party: 'RSP' },
  { name: 'Lamjung 1', winner: 'Devendra Parajuli', party: 'RSP' },
  { name: 'Mahottari 1', winner: 'Giriraj Mani Pokharel', party: 'Nepali Communist Party' },
  { name: 'Mahottari 2', winner: 'Sharat Singh Bhandari', party: 'Loktantrik Samajwadi Party' },
  { name: 'Mahottari 3', winner: 'Mahantha Thakur', party: 'Loktantrik Samajwadi Party' },
  { name: 'Mahottari 4', winner: 'Mahendra Kumar Raya', party: 'Nepali Congress' },
  { name: 'Makwanpur 1', winner: 'Deepak Bahadur Singh', party: 'Rastriya Prajatantra Party' },
  { name: 'Makwanpur 2', winner: 'Mahesh Kumar Bartaula', party: 'CPN (UML)' },
  { name: 'Manang 1', winner: 'Tek Bahadur Gurung', party: 'Nepali Congress' },
  { name: 'Morang 1', winner: 'Dig Bahadur Limbu', party: 'Nepali Congress' },
  { name: 'Morang 2', winner: 'Rishikesh Pokharel', party: 'CPN (UML)' },
  { name: 'Morang 3', winner: 'Bhanubhakta Dhakal', party: 'CPN (UML)' },
  { name: 'Morang 4', winner: 'Aman Lal Modi', party: 'Nepali Communist Party' },
  { name: 'Morang 5', winner: 'Yogendra Mandal', party: 'CPN (UML)' },
  { name: 'Morang 6', winner: 'Dr. Shekhar Koirala', party: 'Nepali Congress' },
  { name: 'Mugu 1', winner: 'Ain Bahadur Shahi Thakuri', party: 'Nepali Congress' },
  { name: 'Mustang 1', winner: 'Yogesh Gauchan Thakali', party: 'Nepali Congress' },
  { name: 'Myagdi 1', winner: 'Kham Bahadur Garbuja', party: 'Nepali Congress' },
  { name: 'Nawalpur 1', winner: 'Shashank Koirala', party: 'Nepali Congress' },
  { name: 'Nawalpur 2', winner: 'Bishnu Kumar Karki', party: 'Nepali Congress' },
  { name: 'Nuwakot 1', winner: 'Dr. Ram Sharan Mahat', party: 'Nepali Congress' },
  { name: 'Nuwakot 2', winner: 'Bahadur Singh Lama', party: 'Nepali Congress' },
  { name: 'Okhaldhunga 1', winner: 'Ram Hari Khatiwada', party: 'Nepali Congress' },
  { name: 'Palpa 1', winner: 'Narayan Prasad Acharya', party: 'CPN (UML)' },
  { name: 'Palpa 2', winner: 'Som Prasad Pandey', party: 'CPN (UML)' },
  { name: 'Panchthar 1', winner: 'Basanta Kumar Nembang', party: 'CPN (UML)' },
  { name: 'Parbat 1', winner: 'Padam Giri', party: 'CPN (UML)' },
  { name: 'Parsa 1', winner: 'Pradip Yadav', party: 'CPN (UML)' },
  { name: 'Parsa 2', winner: 'Ajay Kumar Chaurasiya', party: 'Nepali Congress' },
  { name: 'Parsa 3', winner: 'Surendra Kumar Chaudhary', party: 'Nepali Congress' },
  { name: 'Parsa 4', winner: 'Ramesh Rijal', party: 'Nepali Congress' },
  { name: 'Pyuthan 1', winner: 'Surya Bahadur Thapa', party: 'CPN (UML)' },
  { name: 'Ramechhap 1', winner: 'Purna Bahadur Tamang', party: 'Nepali Congress' },
  { name: 'Rasuwa 1', winner: 'Mohan Acharya', party: 'Nepali Congress' },
  { name: 'Rautahat 1', keyword: 'Madhav Kumar Nepal', winner: 'Madhav Kumar Nepal', party: 'CPN (Unified Socialist)' },
  { name: 'Rautahat 2', winner: 'Kiran Kumar Sah', party: 'CPN (UML)' },
  { name: 'Rautahat 3', winner: 'Prabhu Sah', party: 'CPN (UML)' },
  { name: 'Rautahat 4', winner: 'Dev Prasad Timilsina', party: 'Nepali Congress' },
  { name: 'Rolpa 1', winner: 'Barshaman Pun', party: 'Nepali Communist Party' },
  { name: 'Eastern Rukum 1', winner: 'Purna Bahadur Arti', party: 'Nepali Communist Party' },
  { name: 'Western Rukum 1', winner: 'Janardan Sharma', party: 'Nepali Communist Party' },
  { name: 'Rupandehi 1', winner: 'Chhabilal Bishwakarma', party: 'CPN (UML)' },
  { name: 'Rupandehi 2', winner: 'Bishnu Prasad Paudel', party: 'CPN (UML)' },
  { name: 'Rupandehi 3', winner: 'Deepak Bohara', party: 'Rastriya Prajatantra Party' },
  { name: 'Rupandehi 4', winner: 'Pramod Kumar Yadav', party: 'Nepali Congress' },
  { name: 'Rupandehi 5', winner: 'Basudev Ghimire', party: 'CPN (UML)' },
  { name: 'Salyan 1', winner: 'Prakash Jwala', party: 'CPN (Unified Socialist)' },
  { name: 'Sankhuwasabha 1', winner: 'Deepak Khadka', party: 'Nepali Congress' },
  { name: 'Saptari 1', winner: 'Nawal Kishor Sah Sudi', party: 'CPN (UML)' },
  { name: 'Saptari 2', winner: 'Upendra Yadav', party: 'Janata Samajbadi Party' },
  { name: 'Saptari 3', winner: 'Dinesh Kumar Yadav', party: 'Nepali Congress' },
  { name: 'Saptari 4', keyword: 'Teju Lal', winner: 'Teju Lal Chaudhary', party: 'Nepali Congress' },
  { name: 'Sarlahi 1', winner: 'Pramod Sah', party: 'CPN (UML)' },
  { name: 'Sarlahi 2', winner: 'Mahindra Raya Yadav', party: 'Nepali Communist Party' },
  { name: 'Sarlahi 3', winner: 'Hari Prasad Uprety', party: 'CPN (UML)' },
  { name: 'Sarlahi 4', winner: 'Amresh Kumar Singh', party: 'Independent' },
  { name: 'Sindhuli 1', winner: 'Shyam Kumar Shrestha', party: 'Nepali Communist Party' },
  { name: 'Sindhuli 2', winner: 'Haribol Gajurel', party: 'Nepali Communist Party' },
  { name: 'Sindhupalchok 1', winner: 'Madhav Sapkota', party: 'Nepali Communist Party' },
  { name: 'Sindhupalchok 2', winner: 'Sher Bahadur Tamang', party: 'CPN (UML)' },
  { name: 'Siraha 1', winner: 'Pradip Giri', party: 'Nepali Congress' },
  { name: 'Siraha 2', winner: 'Ramchandra Yadav', party: 'Nepali Congress' },
  { name: 'Siraha 3', keyword: 'Lila Nath', winner: 'Lila Nath Shrestha', party: 'CPN (UML)' },
  { name: 'Siraha 4', winner: 'Dharmanath Prasad Sah', party: 'CPN (UML)' },
  { name: 'Solukhumbu 1', winner: 'Hem Kumar Rai', party: 'Nepali Communist Party' },
  { name: 'Sunsari 1', winner: 'Ashok Kumar Rai', party: 'CPN (UML)' },
  { name: 'Sunsari 2', winner: 'Bhim Bahadur Acharya', party: 'CPN (UML)' },
  { name: 'Sunsari 3', winner: 'Gachhadar Bijay Kumar', party: 'Nepali Congress' },
  { name: 'Sunsari 4', winner: 'Gyanendra Bahadur Karki', party: 'Nepali Congress' },
  { name: 'Surkhet 1', winner: 'Purna Bahadur Khadka', party: 'Nepali Congress' },
  { name: 'Surkhet 2', winner: 'Hridayaram Thani', party: 'Nepali Congress' },
  { name: 'Syangja 1', winner: 'Narayan Prasad Marasini', party: 'CPN (UML)' },
  { name: 'Syangja 2', winner: 'Dhanraj Gurung', party: 'Nepali Congress' },
  { name: 'Tanahu 1', winner: 'Dr. Swarnim Wagle', party: 'RSP' },
  { name: 'Tanahu 2', winner: 'Shankar Bhandari', party: 'Nepali Congress' },
  { name: 'Taplejung 1', winner: 'Yogesh Kumar Bhattarai', party: 'CPN (UML)' },
  { name: 'Tehrathum 1', winner: 'Sita Gurung', party: 'Nepali Congress' },
  { name: 'Udayapur 1', winner: 'Dr. Narayan Khadka', party: 'Nepali Congress' },
  { name: 'Udayapur 2', winner: 'Surya Bahadur Tamang', party: 'RSP' }
];

async function seedAll() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database. Seeding entire platform dataset...');

    // Recreate tables to avoid conflicts
    await sequelize.sync({ force: true });
    console.log('Database synced (tables recreated).');

    // 1. Seed Demo Users
    const passwordHash = bcrypt.hashSync('password123', 10);
    const citizenUser = await User.create({
      name: 'Demo Citizen',
      email: 'demo_citizen@nirikshan.gov.np',
      passwordHash,
      role: 'citizen',
      isAnonymous: false
    });

    const moderatorUser = await User.create({
      name: 'Demo Moderator',
      email: 'demo_moderator@nirikshan.gov.np',
      passwordHash,
      role: 'moderator',
      isAnonymous: false
    });

    const adminUser = await User.create({
      name: 'Demo Admin',
      email: 'demo_admin@nirikshan.gov.np',
      passwordHash,
      role: 'admin',
      isAnonymous: false
    });

    console.log('Demo accounts seeded.');

    // 2. Seed Districts
    const districtMap = new Map();
    for (const prov of nepalData) {
      for (const distName of prov.districts) {
        const district = await District.create({
          name: distName,
          province: prov.province,
          cdoName: `Shri ${distName} Adhikari`,
          daoAddress: `District Administration Office, ${distName} HQ, Nepal`,
          daoContact: `+977-0${distName.length}-500000`,
          daoOfficeHours: '10:00 AM - 5:00 PM'
        });
        districtMap.set(distName.toUpperCase(), district.id);
      }
    }
    console.log(`${districtMap.size} districts seeded.`);

    // Helper to resolve district name from constituency name
    const resolveDistrictName = (constyName) => {
      const upper = constyName.toUpperCase();
      if (upper.startsWith('EASTERN RUKUM')) return 'EASTERN RUKUM';
      if (upper.startsWith('WESTERN RUKUM')) return 'WESTERN RUKUM';
      if (upper.includes('PARASI')) return 'PARASI';
      if (upper.startsWith('KAVREPALANCHOK')) return 'KAVREPALANCHOWK';
      if (upper.startsWith('DHANUSHA')) return 'DHANUSA';
      if (upper.startsWith('KAPILVASTU')) return 'KAPILVASTU';
      if (upper.startsWith('TANAHUN')) return 'TANAHU';
      return constyName.split(' ')[0].toUpperCase();
    };

    // 3. Seed Constituencies and Winner Representatives
    for (const item of canonicalWinners) {
      const distKey = resolveDistrictName(item.name);
      const districtId = districtMap.get(distKey);

      if (!districtId) {
        throw new Error(`District not found for constituency: ${item.name} (Resolved key: ${distKey})`);
      }

      // Find province from district
      const matchedProv = nepalData.find(p => p.districts.some(d => d.toUpperCase() === distKey || (distKey === 'KAVREPALANCHOWK' && d === 'Kavrepalanchowk') || (distKey === 'DHANUSA' && d === 'Dhanusa') || (distKey === 'TANAHU' && d === 'Tanahu') || (distKey === 'PARASI' && d === 'Parasi')));
      const province = matchedProv ? matchedProv.province : 'Bagmati Province';

      const slug = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

      // Create Representative first
      const rep = await Representative.create({
        name: item.winner,
        party: item.party,
        photoUrl: `https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=60`,
        position: 'Member of Parliament',
        attendancePercent: Math.floor(Math.random() * 25) + 75,
        billsSponsored: Math.floor(Math.random() * 15) + 1,
        contactInfo: `${item.winner.toLowerCase().replace(/[^a-z]/g, '')}@parliament.gov.np`,
        bio: `Elected as the First-Past-the-Post representative for ${item.name} in the March 2026 General Election.`
      });

      // Create Constituency linking to the representative
      const constituency = await Constituency.create({
        id: slug,
        name: item.name,
        province: province,
        districtId: districtId,
        winnerRepresentativeId: rep.id,
        slug: slug,
        mapIdentifier: distKey,
        electionYear: 2026,
        voteCount: '45,210 verified votes',
        victoryMargin: '3,124 votes margin'
      });

      // Update Representative with constituencyId
      rep.constituencyId = constituency.id;
      await rep.save();
    }

    console.log(`${canonicalWinners.length} FPTP Constituencies and Representatives seeded.`);

    // 4. Seed Promises
    await PromiseModel.bulkCreate([
      {
        title: 'Completion of Melamchi Water Pipeline Network',
        description: 'Laying out high-density polyethylene pipelines to cover 10,000 households in Kathmandu 4, ensuring continuous drinking water supply.',
        officialName: 'Gagan Thapa',
        officialRole: 'Member of Parliament (Kathmandu 4)',
        constituency: 'kathmandu-4',
        status: 'in_progress',
        datePromised: '2026-03-15',
        sourceUrl: 'https://electioncommission.gov.np',
        createdBy: moderatorUser.id,
        verified: true
      },
      {
        title: 'Chobhar Dry Port Connectivity Expressway',
        description: 'Constructing a 4-lane dedicated freight corridor connecting Chobhar Dry Port directly with the Kathmandu-Terai Fast Track entry point.',
        officialName: 'Toshima Karki',
        officialRole: 'Member of Parliament (Lalitpur 3)',
        constituency: 'lalitpur-3',
        status: 'promised',
        datePromised: '2026-04-01',
        sourceUrl: 'https://electioncommission.gov.np',
        createdBy: moderatorUser.id,
        verified: true
      },
      {
        title: 'Establishment of Gandaki ICT Innovation Hub',
        description: 'Setting up a state-of-the-art incubation center in Pokhara to support tech startups, providing high-speed internet and coworking spaces.',
        officialName: 'Bidya Bhattarai',
        officialRole: 'Member of Parliament (Kaski 2)',
        constituency: 'kaski-2',
        status: 'in_progress',
        datePromised: '2026-03-20',
        sourceUrl: 'https://electioncommission.gov.np',
        createdBy: moderatorUser.id,
        verified: true
      },
      {
        title: 'Bhojpur Tourism Development and Road Paving',
        description: 'Paving the remaining 45 km of the main Bhojpur-Hatuwagadhi access road and upgrading tourist homestays with renewable solar kits.',
        officialName: 'Dhurbaraj Rai',
        officialRole: 'Member of Parliament (Bhojpur 1)',
        constituency: 'bhojpur-1',
        status: 'delayed',
        datePromised: '2026-03-25',
        sourceUrl: 'https://electioncommission.gov.np',
        createdBy: moderatorUser.id,
        verified: true
      },
      {
        title: 'Panchthar Smart Agricultural Cold Storage',
        description: 'Building a 500-metric-ton cold storage facility for local farmers in Panchthar to preserve potato and cardamom harvests.',
        officialName: 'Basanta Kumar Nembang',
        officialRole: 'Member of Parliament (Panchthar 1)',
        constituency: 'panchthar-1',
        status: 'fulfilled',
        datePromised: '2026-03-10',
        sourceUrl: 'https://electioncommission.gov.np',
        createdBy: moderatorUser.id,
        verified: true
      }
    ]);
    console.log('Promises seeded.');

    // 5. Seed Budget Projects
    const ktm = await District.findOne({ where: { name: 'Kathmandu' } });
    const lalitpur = await District.findOne({ where: { name: 'Lalitpur' } });
    const kaski = await District.findOne({ where: { name: 'Kaski' } });
    const panchthar = await District.findOne({ where: { name: 'Panchthar' } });

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
      },
      {
        title: 'Panchthar Cardamom Processing Center',
        districtId: panchthar.id,
        allocatedAmount: 18000000.00,
        completionPercent: 100,
        evidenceStatus: 'verified',
        description: 'State-of-the-art packaging and drying warehouse facility'
      }
    ]);
    console.log('Budget projects seeded.');

    // 6. Seed Complaints
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
      },
      {
        serviceType: 'infrastructure',
        description: 'Damaged main water pipeline leaking clean drinking water onto Phidim Bazar street.',
        locationLat: 27.1438,
        locationLng: 87.7610,
        ward: '2',
        isAnonymous: false,
        status: 'verified'
      }
    ]);
    console.log('Complaints seeded.');

    // 7. Seed Civic Events
    await CivicEvent.bulkCreate([
      {
        name: 'Kathmandu Public Audit on Ring Road Expansion',
        eventType: 'Public Audit',
        date: new Date('2026-07-28T10:00:00Z'),
        locationLat: 27.7120,
        locationLng: 85.3210,
        organizer: 'Nirikshan Watchdog Club',
        description: 'Open hearing regarding the status and air quality impact of Kalanki-Maharajgunj segment road extension.',
        verified: true
      },
      {
        name: 'Lalitpur Heritage Preservation Watchdog Inspection',
        eventType: 'Watchdog Inspection',
        date: new Date('2026-07-30T13:00:00Z'),
        locationLat: 27.6720,
        locationLng: 85.3250,
        organizer: 'Patan Youth Alliance',
        description: 'Citizen audit of materials used in Patan Durbar Square restoration works.',
        verified: true
      },
      {
        name: 'Phidim Cardamom Cooperative General Assembly',
        eventType: 'Community Forum',
        date: new Date('2026-08-02T11:00:00Z'),
        locationLat: 27.1450,
        locationLng: 87.7620,
        organizer: 'Panchthar Cardamom Farmers Committee',
        description: 'Evaluating the performance and public utilization of the new smart agricultural cold storage facility.',
        verified: true
      }
    ]);
    console.log('Civic Events seeded.');

    console.log('All seeding tasks completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedAll();
