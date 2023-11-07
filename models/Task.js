// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  
  desc: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Incomplete"
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  reminderDate: {
    type: Date,
  },
});

taskSchema.set('toJSON', {
  transform: (document, returnedDocument) => {
    returnedDocument.id = document._id.toString();
    delete returnedDocument._id;
    delete returnedDocument.__v;
  },
});

module.exports = mongoose.model('Task', taskSchema);
