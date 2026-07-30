// Himal & Pagoda watchdog platform mock data for Nepal Map

export const PARTIES = {
  'NC': { name: 'Nepali Congress', short: 'NC', color: '#4F6B45', text: 'white' }, // Rhododendron Leaf Green
  'UML': { name: 'CPN (Unified Marxist–Leninist)', short: 'CPN-UML', color: '#6E4438', text: 'white' }, // Charred Brick Red
  'MC': { name: 'CPN (Maoist Centre)', short: 'CPN-MC', color: '#8C6A32', text: 'white' }, // Turmeric Clay Orange/Red
  'RSP': { name: 'Rastriya Swatantra Party', short: 'RSP', color: '#1E40AF', text: 'white' }, // Bell Blue
  'RPP': { name: 'Rastriya Prajatantra Party', short: 'RPP', color: '#D97706', text: 'black' }, // Golden Yellow
  'IND': { name: 'Independent / Others', short: 'IND', color: '#6B7280', text: 'white' } // Slate Grey
};

// Mapped by uppercase district name to match the GeoJSON DISTRICT property
const explicitDistrictData = {
  'KATHMANDU': {
    cdo: {
      name: 'Jitendra Basnet',
      phone: '+977-01-4262961',
      email: 'cdo.kathmandu@moha.gov.np',
      office: 'District Administration Office, Babarmahal, Kathmandu',
      cdoPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60'
    },
    constituencies: [
      { id: 'KTM-1', name: 'Kathmandu 1', winner: 'Prakash Man Singh', party: 'NC', votes: 7143, margin: '125 votes', promisesCount: 12, progress: 65 },
      { id: 'KTM-2', name: 'Kathmandu 2', winner: 'Sobita Gautam', party: 'RSP', votes: 15229, margin: '3,122 votes', promisesCount: 8, progress: 40 },
      { id: 'KTM-3', name: 'Kathmandu 3', winner: 'Santosh Chalise', party: 'NC', votes: 15158, margin: '1,420 votes', promisesCount: 10, progress: 50 },
      { id: 'KTM-4', name: 'Kathmandu 4', winner: 'Gagan Kumar Thapa', party: 'NC', votes: 21302, margin: '7,446 votes', promisesCount: 18, progress: 75 },
      { id: 'KTM-5', name: 'Kathmandu 5', winner: 'Pradip Paudel', party: 'NC', votes: 15237, margin: '5,022 votes', promisesCount: 14, progress: 60 },
      { id: 'KTM-6', name: 'Kathmandu 6', winner: 'Shishir Khanal', party: 'RSP', votes: 14204, margin: '4,102 votes', promisesCount: 9, progress: 45 },
      { id: 'KTM-7', name: 'Kathmandu 7', winner: 'Ganesh Parajuli', party: 'RSP', votes: 8743, margin: '1,502 votes', promisesCount: 7, progress: 30 },
      { id: 'KTM-8', name: 'Kathmandu 8', winner: 'Biraj Bhakta Shrestha', party: 'RSP', votes: 10105, margin: '4,120 votes', promisesCount: 11, progress: 55 },
      { id: 'KTM-9', name: 'Kathmandu 9', winner: 'Krishna Gopal Shrestha', party: 'UML', votes: 11956, margin: '992 votes', promisesCount: 6, progress: 80 },
      { id: 'KTM-10', name: 'Kathmandu 10', winner: 'Rajendra Kumar KC', party: 'NC', votes: 14458, margin: '2,310 votes', promisesCount: 15, progress: 70 }
    ]
  },
  'LALITPUR': {
    cdo: {
      name: 'Tulsibahadur Shrestha',
      phone: '+977-01-5521260',
      email: 'cdo.lalitpur@moha.gov.np',
      office: 'District Administration Office, Hariharbhawan, Lalitpur',
      cdoPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60'
    },
    constituencies: [
      { id: 'LPT-1', name: 'Lalitpur 1', winner: 'Udaya Shumsher Rana', party: 'NC', votes: 23871, margin: '1,314 votes', promisesCount: 9, progress: 45 },
      { id: 'LPT-2', name: 'Lalitpur 2', winner: 'Prem Bahadur Maharjan', party: 'UML', votes: 15025, margin: '2,502 votes', promisesCount: 7, progress: 50 },
      { id: 'LPT-3', name: 'Lalitpur 3', winner: 'Dr. Toshima Karki', party: 'RSP', votes: 31136, margin: '18,173 votes', promisesCount: 16, progress: 60 }
    ]
  },
  'JHAPA': {
    cdo: {
      name: 'Bandhu Prasad Bastola',
      phone: '+977-023-456002',
      email: 'cdo.jhapa@moha.gov.np',
      office: 'District Administration Office, Bhadrapur, Jhapa',
      cdoPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60'
    },
    constituencies: [
      { id: 'JHP-1', name: 'Jhapa 1', winner: 'Vishwa Prakash Sharma', party: 'NC', votes: 39624, margin: '14,275 votes', promisesCount: 15, progress: 70 },
      { id: 'JHP-2', name: 'Jhapa 2', winner: 'Devraj Ghimire', party: 'UML', votes: 26315, margin: '2,102 votes', promisesCount: 5, progress: 85 },
      { id: 'JHP-3', name: 'Jhapa 3', winner: 'Rajendra Lingden', party: 'RPP', votes: 40648, margin: '3,276 votes', promisesCount: 12, progress: 55 },
      { id: 'JHP-4', name: 'Jhapa 4', winner: 'Lal Prasad Sawa Limbu', party: 'UML', votes: 29315, margin: '1,506 votes', promisesCount: 8, progress: 60 },
      { id: 'JHP-5', name: 'Jhapa 5', winner: 'Kharga Prasad (K.P.) Oli', party: 'UML', votes: 39612, margin: '28,576 votes', promisesCount: 22, progress: 80 }
    ]
  },
  'CHITWAN': {
    cdo: {
      name: 'Indradev Yadav',
      phone: '+977-056-520177',
      email: 'cdo.chitwan@moha.gov.np',
      office: 'District Administration Office, Bharatpur, Chitwan',
      cdoPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60'
    },
    constituencies: [
      { id: 'CTW-1', name: 'Chitwan 1', winner: 'Hari Dhakal', party: 'RSP', votes: 34189, margin: '7,512 votes', promisesCount: 11, progress: 50 },
      { id: 'CTW-2', name: 'Chitwan 2', winner: 'Rabi Lamichhane', party: 'RSP', votes: 54176, margin: '42,962 votes', promisesCount: 20, progress: 65 },
      { id: 'CTW-3', name: 'Chitwan 3', winner: 'Dr. Bikram Pandey', party: 'RPP', votes: 22366, margin: '9,215 votes', promisesCount: 10, progress: 40 }
    ]
  },
  'KASKI': {
    cdo: {
      name: 'Bharat Mani Pandey',
      phone: '+977-061-520008',
      email: 'cdo.kaski@moha.gov.np',
      office: 'District Administration Office, Pokhara, Kaski',
      cdoPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60'
    },
    constituencies: [
      { id: 'KSK-1', name: 'Kaski 1', winner: 'Man Bahadur Gurung', party: 'UML', votes: 25712, margin: '2,510 votes', promisesCount: 8, progress: 50 },
      { id: 'KSK-2', name: 'Kaski 2', winner: 'Bidya Bhattarai', party: 'UML', votes: 16998, margin: '4,503 votes', promisesCount: 7, progress: 60 },
      { id: 'KSK-3', name: 'Kaski 3', winner: 'Damodar Bairagi', party: 'UML', votes: 22915, margin: '5,402 votes', promisesCount: 9, progress: 55 }
    ]
  },
  'GORKHA': {
    cdo: {
      name: 'Bhola Dahal',
      phone: '+977-064-420144',
      email: 'cdo.gorkha@moha.gov.np',
      office: 'District Administration Office, Gorkha Bazaar, Gorkha',
      cdoPhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=60'
    },
    constituencies: [
      { id: 'GRK-1', name: 'Gorkha 1', winner: 'Rajendra Bajgain', party: 'NC', votes: 22137, margin: '3,102 votes', promisesCount: 11, progress: 45 },
      { id: 'GRK-2', name: 'Gorkha 2', winner: 'Pushpa Kamal Dahal (Prachanda)', party: 'MC', votes: 26109, margin: '13,467 votes', promisesCount: 25, progress: 65 }
    ]
  }
};

// Generates dynamic fallback data for any district in Nepal
export const getDistrictData = (districtName) => {
  if (!districtName) return null;
  const key = districtName.toUpperCase().trim();
  
  if (explicitDistrictData[key]) {
    return explicitDistrictData[key];
  }

  // Generate realistic CDO and Constituency data based on the district name seed
  const charSum = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const partyKeys = Object.keys(PARTIES);
  const primaryParty = partyKeys[charSum % partyKeys.length];
  
  const cdoNames = [
    'Ram Prasad Acharya', 'Krishna Bahadur Thapa', 'Devendra Lamichhane', 
    'Shyam Prasad Bhandari', 'Govinda Bahadur Rijal', 'Tek Bahadur KC', 
    'Bishnu Prasad Pokharel', 'Madhav Prasad Sharma', 'Janardan Gautam'
  ];
  const cdoName = cdoNames[charSum % cdoNames.length];
  
  const numConstituencies = (charSum % 3) + 1; // 1, 2, or 3 constituencies
  
  const constituencies = [];
  for (let i = 1; i <= numConstituencies; i++) {
    const party = partyKeys[(charSum + i) % partyKeys.length];
    const repNames = [
      'Min Bahadur Bishwakarma', 'Pradip Kumar Gyawali', 'Gokul Prasad Baskota',
      'Sher Bahadur Deuba', 'Narayan Kaji Shrestha', 'Surendra Prasad Pandey',
      'Janardan Sharma', 'Yogesh Kumar Bhattarai', 'Chandra Kanta Raut (C.K.)'
    ];
    const representative = repNames[(charSum * i) % repNames.length];
    const votes = 12000 + ((charSum * i) % 15000);
    const margin = 800 + ((charSum * i) % 4000);
    const promises = 4 + ((charSum * i) % 12);
    const progress = 30 + ((charSum * i) % 55);

    constituencies.push({
      id: `${key.substring(0, 3)}-${i}`,
      name: `${districtName.charAt(0) + districtName.slice(1).toLowerCase()} ${i}`,
      winner: representative,
      party: party,
      votes: votes,
      margin: `${margin.toLocaleString()} votes`,
      promisesCount: promises,
      progress: progress
    });
  }

  return {
    cdo: {
      name: cdoName,
      phone: `+977-0${(charSum % 9) + 1}-5${charSum.toString().substring(0, 5)}`,
      email: `cdo.${key.toLowerCase()}@moha.gov.np`,
      office: `District Administration Office, ${districtName.charAt(0) + districtName.slice(1).toLowerCase()} HQ, Nepal`,
      cdoPhoto: `https://images.unsplash.com/photo-${1500000000000 + (charSum % 1000000)}?w=150&auto=format&fit=crop&q=60`
    },
    constituencies
  };
};
