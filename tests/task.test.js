const supertest = require("supertest");
const app = require("../index"); // Import your Express app
const mongoose = require("mongoose");
const Task = require("../models/Task"); // Import your Task model

const api = supertest(app);

beforeAll(async () => {
  await Task.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Task Controller", () => {
  test("Create a new task", async () => {
    const loginResponse = await api.post("/users/login").send({
      username: "testUser1",
      password: "abc123",
    });

    const newTask = {
      title: "New Task",
      desc: "Description of new task",
      status: "pending",
      dueDate: "2023-12-31",
      reminderDate: "2023-12-30",
    };

    const response = await api
      .post("/tasks/createTask")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(newTask)
      .expect(201);

    expect(response.body.title).toBe(newTask.title);

    // Fetch the task from the database and verify its existence
    const createdTask = await Task.findById(response.body._id);
    expect(createdTask).toBeTruthy();
  });

  test("Get all tasks", async () => {
    const response = await api.get("/tasks/getAll").expect(200);

    // Assert response body
    expect(Array.isArray(response.body)).toBe(true);
  });
});

test("Get tasks by user", async () => {
  const loginResponse = await api.post("/users/login").send({
    username: "testUser1",
    password: "abc123",
  });

  const response = await api
    .get("/tasks/user")
    .set("Authorization", `Bearer ${loginResponse.body.token}`)
    .expect(201);

  // Assert response body
  expect(Array.isArray(response.body)).toBe(true);
});

test("Update a task", async () => {
  const loginResponse = await api.post("/users/login").send({
    username: "testUser1",
    password: "abc123",
  });

  const newTask = {
    title: "New Task",
    desc: "Description of new task",
    status: "pending",
    dueDate: "2023-12-31",
    reminderDate: "2023-12-30",
  };

  // Create a task first
  const createResponse = await api
    .post("/tasks/createTask")
    .set("Authorization", `Bearer ${loginResponse.body.token}`)
    .send(newTask)
    .expect(201);

  // Update the task
  const updatedTaskData = {
    title: "Updated Task Title",
    desc: "Updated task description",
    status: "completed",
    dueDate: "2023-12-31",
    reminderDate: "2023-12-30",
  };

  const updateResponse = await api
    .put(`/tasks/update/${createResponse.body._id}`)
    .set("Authorization", `Bearer ${loginResponse.body.token}`)
    .send(updatedTaskData)
    .expect(201);

  // Assert response body
  expect(updateResponse.body.title).toBe(updatedTaskData.title);
  expect(updateResponse.body.status).toBe(updatedTaskData.status);
});

test("Delete a task", async () => {
  const loginResponse = await api.post("/users/login").send({
    username: "testUser1",
    password: "abc123",
  });

  const newTask = {
    title: "New Task",
    desc: "Description of new task",
    status: "pending",
    dueDate: "2023-12-31",
    reminderDate: "2023-12-30",
  };

  // Create a task first
  const createResponse = await api
    .post("/tasks/createTask")
    .set("Authorization", `Bearer ${loginResponse.body.token}`)
    .send(newTask)
    .expect(201);

  // Delete the task
  const deleteResponse = await api
    .delete(`/tasks/delete/${createResponse.body._id}`)
    .set("Authorization", `Bearer ${loginResponse.body.token}`)
    .expect(201);

  // Fetch the task from the database and expect it to be null
  const deletedTask = await Task.findById(createResponse.body._id);
  expect(deletedTask).toBeNull();
});
