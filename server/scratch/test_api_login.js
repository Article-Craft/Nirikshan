process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../server');

async function testApi() {
  try {
    // 1. Try registering a user
    const email = `test_${Date.now()}@gmail.com`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: email,
        password: 'password123',
        role: 'citizen'
      });
    console.log('Register status:', regRes.status);
    console.log('Register body:', regRes.body);

    // 2. Try registering the same user again
    const dupRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: email,
        password: 'password123',
        role: 'citizen'
      });
    console.log('Dup Register status:', dupRes.status);
    console.log('Dup Register body:', dupRes.body);

    // 3. Try logging in with the registered user
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: email,
        password: 'password123'
      });
    console.log('Login status:', loginRes.status);
    console.log('Login body:', loginRes.body);

  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

testApi();
