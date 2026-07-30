process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'sqlite::memory:';

const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/db');
const { User, Representative, Constituency, District, Complaint } = require('../models');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nirikshan_fallback_secret';

let adminToken;
let citizenToken;

beforeAll(async () => {
  // Re-sync database for clean test
  await sequelize.sync({ force: true });

  // Create tests users
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@nirikshan.gov.np',
    role: 'admin',
    isAnonymous: false
  });

  const citizen = await User.create({
    name: 'Citizen User',
    email: 'citizen@nirikshan.gov.np',
    role: 'citizen',
    isAnonymous: false
  });

  adminToken = jwt.sign({ id: admin.id, name: admin.name, role: admin.role }, JWT_SECRET);
  citizenToken = jwt.sign({ id: citizen.id, name: citizen.name, role: citizen.role }, JWT_SECRET);

  // Seed minimal District/Constituency
  const dist = await District.create({ name: 'Kathmandu', province: 'Bagmati Province' });
  await Constituency.create({
    id: 'KTM-1',
    name: 'Kathmandu 1',
    province: 'Bagmati Province',
    districtId: dist.id,
    slug: 'ktm-1',
    mapIdentifier: 'KATHMANDU'
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Complaints Endpoints', () => {
  it('should submit a complaint anonymously without auth', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .send({
        serviceType: 'Road Damage',
        description: 'Large pothole on Koteshwor main road',
        locationLat: 27.6775,
        locationLng: 85.3489,
        ward: '32',
        isAnonymous: true
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.serviceType).toBe('Road Damage');
    expect(res.body.status).toBe('pending');
  });

  it('should not list pending complaints in public feed', async () => {
    const res = await request(app).get('/api/complaints');
    expect(res.status).toBe(200);
    // Since it starts as pending, public feed should be empty
    expect(res.body.length).toBe(0);
  });
});

describe('Representatives Endpoints', () => {
  it('should return empty list initially', async () => {
    const res = await request(app).get('/api/representatives');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should create a representative with admin auth', async () => {
    const res = await request(app)
      .post('/api/representatives')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Gagan Kumar Thapa',
        party: 'NC',
        constituencyId: 'KTM-1',
        position: 'Member of Parliament',
        attendancePercent: 90,
        billsSponsored: 12,
        contactInfo: 'gagan@thapa.com'
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Gagan Kumar Thapa');
  });

  it('should fail to create a representative with citizen auth', async () => {
    const res = await request(app)
      .post('/api/representatives')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        name: 'Invalid User',
        party: 'IND',
        constituencyId: 'KTM-1'
      });

    expect(res.status).toBe(403);
  });

  it('should submit rating for a representative with token', async () => {
    // Fetch the representative first
    const reps = await request(app).get('/api/representatives');
    const repId = reps.body[0].id;

    const res = await request(app)
      .post(`/api/representatives/${repId}/rating`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        stars: 5,
        comment: 'Very active representative!'
      });

    expect(res.status).toBe(201);
    expect(res.body.rating.stars).toBe(5);
  });
});
