process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'sqlite::memory:';

const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/db');
const { User } = require('../models');

describe('Authentication Endpoints', () => {
  beforeEach(async () => {
    // Re-sync database to clean slate before each test
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should register a new citizen user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ashmit Test',
        email: 'ashmit.test@nirikshan.gov.np',
        password: 'password123',
        role: 'citizen'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.name).toBe('Ashmit Test');
    expect(res.body.user.email).toBe('ashmit.test@nirikshan.gov.np');
    expect(res.body.user.role).toBe('citizen');
  });

  it('should fail to register with an existing email', async () => {
    // Register once
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ashmit Test',
        email: 'duplicate@nirikshan.gov.np',
        password: 'password123'
      });

    // Try again with duplicate email
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email: 'duplicate@nirikshan.gov.np',
        password: 'password123'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email already registered');
  });

  it('should login an existing user and return a JWT token', async () => {
    // Register
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ashmit Login',
        email: 'login@nirikshan.gov.np',
        password: 'password123'
      });

    // Login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@nirikshan.gov.np',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('login@nirikshan.gov.np');
  });

  it('should reject login with wrong credentials', async () => {
    // Register
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ashmit Login',
        email: 'wrong@nirikshan.gov.np',
        password: 'password123'
      });

    // Try wrong password
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@nirikshan.gov.np',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });
});
