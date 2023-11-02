
require("dotenv").config();
const express = require('express');
const userRoutes = require('./routes/user-routes');
const { verifyUser } = require('./middlewares/auth');
const taskRoutes = require('./routes/task-routes');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const path = require('path');

mongoose
  .connect('mongodb://127.0.0.1:27017/Taskswift')
  .then(() => console.log('Connected to MongoDB.'))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    res.status(400);
  }
  res.json({ error: err.message });
});

// Unknown Path
app.use((req, res) => {
  res.status(404).json({ error: 'Path Not Found' });
});

module.exports = app;
