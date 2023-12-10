const supertest = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const User = require('../models/User');

const api = supertest(app);

beforeAll(async () => {
  await User.deleteMany({});
});

test('User Registration', async () => {
  const response = await api
    .post('/users/register')
    .send({
      username: 'testUser1',
      password: 'abc123',
      fullname: 'Test User',
      email: 'test@gmail.com',
      profilePicture: 'default.jpg',
    })
    .expect(201);

  expect(response.body.username).toBe('testUser1');
});

test('Registration of Duplicate Username', async () => {
  const response = await api
    .post('/users/register')
    .send({
      username: 'testUser1',
      password: 'abc123',
      fullname: 'Test User',
      email: 'test@gmail.com',
      profilePicture: 'default.jpg',
    })
    .expect(400);

    expect(response.body.error).toEqual("Duplicated username!");

});

test('Registered User Can Log In', async () => {
  const response = await api
    .post('/users/login')
    .send({
      username: 'testUser1',
      password: 'abc123',
    })
    .expect(200);

  expect(response.body.token).toBeDefined();
});

test('Wrong Credentials Should Fail to Log In', async () => {
  const response = await api
    .post('/users/login')
    .send({
      username: 'testUser1',
      password: 'wrongpassword',
    })
    .expect(400);

  expect(response.body.error).toMatch("Password does not match");
});

afterAll(async () => {
  await mongoose.connection.close();
});
test('Get User Profile', async () => {
  // Perform a login before retrieving the user profile
  const loginResponse = await api.post('/users/login').send({
    username: 'testUser1',
    password: 'abc123',
  });

  const response = await api
    .get('/users/profile')
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .expect(200);

  expect(response.body.username).toBe('testUser1');
});

test('Update User Profile', async () => {
  const loginResponse = await api.post('/users/login').send({
    username: 'testUser1',
    password: 'abc123',
  });

  const response = await api
    .put('/users/profile/:userId')
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .send({
      username: 'updatedUsername',
      fullname: 'Updated Full Name',
      email: 'updated@gmail.com',
    })
    .expect(200);

  expect(response.body.username).toBe('updatedUsername');
});

test('Update User Profile Picture', async () => {
  // Log in to obtain an authentication token
  const loginResponse = await api.post('/users/login').send({
    username: 'testUser1',
    password: 'abc123',
  });

  // Make the request to update the profile picture
  const response = await api
    .put('/users/profile/picture')
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    
    .send({
      profilePicture: 'new_picture.jpg',
    })
    .expect(200);
    console.log(`Authorization Header: Bearer ${loginResponse.body.token}`);


  // Assert that the response contains the updated profile picture
  expect(response.body.profilePicture).toBe('new_picture.jpg');

  // Fetch the user from the database and verify the profile picture update
  const updatedUser = await User.findById(loginResponse.body.user.id);
  expect(updatedUser.profilePicture).toBe('new_picture.jpg');
});

