const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task-controller');
const { verifyUser } = require('../middlewares/auth');

// Create a new task
router.post('/createTask', verifyUser, TaskController.createTask);

// Get all tasks
router.get('/getAll', TaskController.getAllTasks);


// Get tasks by user
router.get('/user/:userId', verifyUser, TaskController.getTasksByUser);

// Update a task
router.put('/update/:id', TaskController.updateTask);

// Delete a task
router.delete('/delete/:id', TaskController.deleteTask);

module.exports = router;
