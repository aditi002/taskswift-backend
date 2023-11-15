const Task = require('../models/Task');

module.exports = {
  createTask: (req, res, next) => {
    const { title, desc, status, dueDate, reminderDate } = req.body;

    console.log(req.user)
    const user = req.user.id
    console.log(req.user.id)

    Task.create({ title, desc, status, user, dueDate, reminderDate })
      .then((task) => {
        res.status(201).json(task);
      })
      .catch(next);
  },

  getAllTasks: (req, res, next) => {
    Task.find()
    .then((task)=> res.status(200).json(task))
    .catch(next)
  },
  
  
  getTasksByUser: (req, res, next) => {
    const userId = req.user.id;
    console.log("Received request to fetch tasks for user:", userId);
  
    Task.find({ user: userId })
      .then((tasks) => {
        console.log("Fetched tasks for user:", userId);
        res.json(tasks);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        next(error);
      });
  },
  
  updateTask: (req, res, next) => {
    const taskId = req.params.id;
    const { title, desc, status, user, dueDate, reminderDate } = req.body;

    Task.findByIdAndUpdate(taskId, { title, desc, status, user, dueDate, reminderDate }, { new: true })
      .then((task) => {
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
      })
      .catch(next);
  },

  deleteTask: (req, res, next) => {
    const taskId = req.params.id;

    Task.findByIdAndRemove(taskId)
      .then((task) => {
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
      })
      .catch(next);
  },
};
