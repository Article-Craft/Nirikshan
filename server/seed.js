const sequelize = require('./config/db');
const { District, Constituency, Representative } = require('./models');

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
  { name: 'Kapilvastu 3', winner: 'Abhishek Pratap Shah', party: 'Nepali Congress' },
  { name: 'Kaski 1', winner: 'Khadak Raj Paudel', party: 'RSP' },
  { name: 'Kaski 2', winner: 'Uttam Prasad Paudel', party: 'RSP' },
  { name: 'Kaski 3', winner: 'Bina Gurung', party: 'RSP' },
  { name: 'Kathmandu 1', winner: 'Ranju Darshana', party: 'RSP' },
  { name: 'Kathmandu 2', winner: 'Sunil K.C.', party: 'RSP' },
  { name: 'Kathmandu 3', winner: 'Rajunath Pandey', party: 'RSP' },
  { name: 'Kathmandu 4', winner: 'Pukar Bam', party: 'RSP' },
  { name: 'Kathmandu 5', winner: 'Sasmit Pokharel', party: 'RSP' },
  { name: 'Kathmandu 6', winner: 'Shishir Khanal', party: 'RSP' },
  { name: 'Kathmandu 7', winner: 'Ganesh Parajuli', party: 'RSP' },
  { name: 'Kathmandu 8', winner: 'Biraj Bhakta Shrestha', party: 'RSP' },
  { name: 'Kathmandu 9', winner: 'Dol Prasad Aryal', party: 'RSP' },
  { name: 'Kathmandu 10', winner: 'Pradip Bista', party: 'RSP' },
  { name: 'Kavrepalanchok 1', winner: 'Madhu Kumar Chaulagain', party: 'RSP' },
  { name: 'Kavrepalanchok 2', winner: 'Badan Kumar Bhandari', party: 'RSP' },
  { name: 'Khotang 1', winner: 'Aaren Rai', party: 'Shram Sanskriti Party' },
  { name: 'Lalitpur 1', winner: 'Buddha Ratna Maharjan', party: 'RSP' },
  { name: 'Lalitpur 2', winner: 'Jagdish Kharel', party: 'RSP' },
  { name: 'Lalitpur 3', winner: 'Toshima Karki', party: 'RSP' },
  { name: 'Lamjung 1', winner: 'Dharmaraj K.C.', party: 'RSP' },
  { name: 'Mahottari 1', winner: 'Pramod Kumar Mahato', party: 'RSP' },
  { name: 'Mahottari 2', winner: 'Dipak Kumar Sah', party: 'RSP' },
  { name: 'Mahottari 3', winner: 'Ujjawal Kumar Jha', party: 'RSP' },
  { name: 'Mahottari 4', winner: 'Gauri Kumari', party: 'RSP' },
  { name: 'Makwanpur 1', winner: 'Prakash Gautam', party: 'RSP' },
  { name: 'Makwanpur 2', winner: 'Prashant Uprety', party: 'RSP' },
  { name: 'Manang 1', winner: 'Tek Bahadur Gurung', party: 'Nepali Congress' },
  { name: 'Morang 1', winner: 'Yagyamani Neupane', party: 'RSP' },
  { name: 'Morang 2', winner: 'Krishna Kumar Karki', party: 'RSP' },
  { name: 'Morang 3', winner: 'Ganesh Karki', party: 'RSP' },
  { name: 'Morang 4', winner: 'Santosh Rajbanshi', party: 'RSP' },
  { name: 'Morang 5', winner: 'Asha Jha', party: 'RSP' },
  { name: 'Morang 6', winner: 'Rubina Acharya', party: 'RSP' },
  { name: 'Mugu 1', winner: 'Khadga Shahi', party: 'Nepali Congress' },
  { name: 'Mustang 1', winner: 'Yogesh Gauchan Thakali', party: 'Nepali Congress' },
  { name: 'Myagdi 1', winner: 'Mahabir Pun', party: 'Independent' },
  { name: 'Nawalpur 1', winner: 'Rajan Gautam', party: 'RSP' },
  { name: 'Nawalpur 2', winner: 'Manish Khanal', party: 'RSP' },
  { name: 'Nuwakot 1', winner: 'Bikram Timilsina', party: 'RSP' },
  { name: 'Nuwakot 2', winner: 'Achuttam Lamichhane', party: 'RSP' },
  { name: 'Okhaldhunga 1', winner: 'Bishwaraj Pokharel', party: 'RSP' },
  { name: 'Palpa 1', winner: 'Sandeep Rana', party: 'Nepali Congress' },
  { name: 'Palpa 2', winner: 'Madhav Bahadur Thapa', party: 'RSP' },
  { name: 'Panchthar 1', winner: 'Narendra Kerung', party: 'Nepali Congress' },
  { name: 'Parasi 1 (Nawalparasi)', winner: 'Bikram Khanal', party: 'RSP' },
  { name: 'Parasi 2 (Nawalparasi)', winner: 'Narendra Kumar Gupta', party: 'RSP' },
  { name: 'Parbat 1', winner: 'Sagar Bhusal', party: 'RSP' },
  { name: 'Parsa 1', winner: 'Buddhi Prasad Pant', party: 'RSP' },
  { name: 'Parsa 2', winner: 'Sushil Kumar Kanu', party: 'RSP' },
  { name: 'Parsa 3', winner: 'Ramakant Chaurasiya', party: 'RSP' },
  { name: 'Parsa 4', winner: 'Tek Bahadur Shakya', party: 'RSP' },
  { name: 'Pyuthan 1', winner: 'Sushant Vaidik', party: 'RSP' },
  { name: 'Ramechhap 1', winner: 'Krishna Hari Budhathoki', party: 'RSP' },
  { name: 'Rasuwa 1', winner: 'Mohan Acharya', party: 'Nepali Congress' },
  { name: 'Rautahat 1', winner: 'Rajesh Kumar Chaudhary', party: 'RSP' },
  { name: 'Rautahat 2', winner: 'Firdosh Alam', party: 'Nepali Congress' },
  { name: 'Rautahat 3', winner: 'Ravindra Patel', party: 'RSP' },
  { name: 'Rautahat 4', winner: 'Ganesh Paudel', party: 'RSP' },
  { name: 'Rolpa 1', winner: 'Barshman Pun', party: 'Nepali Communist Party' },
  { name: 'Eastern Rukum 1', winner: 'Pushpa Kamal Dahal', party: 'Nepali Communist Party' },
  { name: 'Western Rukum 1', winner: 'Gopal Sharma', party: 'Nepali Communist Party' },
  { name: 'Rupandehi 1', winner: 'Sunil Lamsal', party: 'RSP' },
  { name: 'Rupandehi 2', winner: 'Sulabh Kharel', party: 'RSP' },
  { name: 'Rupandehi 3', winner: 'Lekhjung Thapa', party: 'RSP' },
  { name: 'Rupandehi 4', winner: 'Kanhaiya Baniya', party: 'RSP' },
  { name: 'Rupandehi 5', winner: 'Taufiq Ahmed Khan', party: 'RSP' },
  { name: 'Salyan 1', winner: 'Ramesh Kumar Malla', party: 'Nepali Communist Party' },
  { name: 'Sankhuwasabha 1', winner: 'Arjun Kumar Karki', party: 'CPN (UML)' },
  { name: 'Saptari 1', winner: 'Pushpa Kumari Chaudhary', party: 'RSP' },
  { name: 'Saptari 2', winner: 'Ramjee Yadav', party: 'RSP' },
  { name: 'Saptari 3', winner: 'Amarkant Chaudhary', party: 'RSP' },
  { name: 'Saptari 4', winner: 'Sitaram Sah', party: 'RSP' },
  { name: 'Sarlahi 1', winner: 'Nitima Bhandari', party: 'RSP' },
  { name: 'Sarlahi 2', winner: 'Rabin Mahato', party: 'RSP' },
  { name: 'Sarlahi 3', winner: 'Narendra Sah Kalwar', party: 'RSP' },
  { name: 'Sarlahi 4', winner: 'Amresh Kumar Singh', party: 'RSP' },
  { name: 'Sindhuli 1', winner: 'Dhanendra Karki', party: 'RSP' },
  { name: 'Sindhuli 2', winner: 'Aashish Gajurel', party: 'RSP' },
  { name: 'Sindhupalchok 1', winner: 'Bharat Prasad Parajuli', party: 'RSP' },
  { name: 'Sindhupalchok 2', winner: 'Yubaraj Dulal', party: 'Nepali Communist Party' },
  { name: 'Siraha 1', winner: 'Bablu Gupta', party: 'RSP' },
  { name: 'Siraha 2', winner: 'Shiv Shankar Yadav', party: 'RSP' },
  { name: 'Siraha 3', winner: 'Shambhu Kumar Yadav', party: 'RSP' },
  { name: 'Siraha 4', winner: 'Tapeshwar Yadav', party: 'RSP' },
  { name: 'Solukhumbu 1', winner: 'Prakash Singh Karki', party: 'Nepali Congress' },
  { name: 'Sunsari 1', winner: 'Harka Sampang', party: 'Shram Sanskriti Party' },
  { name: 'Sunsari 2', winner: 'Lal Bikram Thapa', party: 'RSP' },
  { name: 'Sunsari 3', winner: 'Ashok Kumar Chaudhary', party: 'RSP' },
  { name: 'Sunsari 4', winner: 'Deepak Kumar Sah', party: 'RSP' },
  { name: 'Surkhet 1', winner: 'Bishnu Bahadur Khadka', party: 'Nepali Congress' },
  { name: 'Surkhet 2', winner: 'Ramesh Kumar Sapkota', party: 'RSP' },
  { name: 'Syangja 1', winner: 'Dhananjaya Regmi', party: 'RSP' },
  { name: 'Syangja 2', winner: 'Jhabilal Dumre', party: 'RSP' },
  { name: 'Tanahun 1', winner: 'Swarnim Wagle', party: 'RSP' },
  { name: 'Tanahun 2', winner: 'Shreeram Neupane', party: 'RSP' },
  { name: 'Taplejung 1', winner: 'Kshitij Thebe', party: 'CPN (UML)' },
  { name: 'Tehrathum 1', winner: 'Santosh Subba', party: 'Nepali Congress' },
  { name: 'Udayapur 1', winner: 'Parash Mani Gelal', party: 'RSP' },
  { name: 'Udayapur 2', winner: 'Surya Bahadur Tamang', party: 'RSP' }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database. Seeding canonical 165 FPTP election results...');

    // Recreate tables to avoid conflicts
    await sequelize.sync({ force: true });
    console.log('Database synced (tables recreated).');

    // 1. Seed Districts
    const districtMap = new Map();
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

    // 2. Seed Constituencies and Winner Representatives
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
        attendancePercent: 85,
        billsSponsored: 5,
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
        voteCount: 'pending_verification',
        victoryMargin: 'pending_verification'
      });

      // Update Representative with constituencyId
      rep.constituencyId = constituency.id;
      await rep.save();
    }

    console.log(`${canonicalWinners.length} FPTP Constituencies and Representatives seeded.`);
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}
