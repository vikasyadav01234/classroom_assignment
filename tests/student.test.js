const request = require('supertest');
const app = require('../app');
const Assignment = require('../models/Assignment');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

describe('Student API', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('Create draft assignment', async () => {
    const res = await request(app)
      .post('/student/assignments')
      .set('X-Principal', JSON.stringify({ user_id: 1, student_id: 1 }))
      .send({ content: 'Test Assignment' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.state).toBe('DRAFT');
  });
});