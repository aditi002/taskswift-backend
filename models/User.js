const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 6,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profilePicture: {
    type: String,
    default: 'default.jpg'
  },
  
});

userSchema.set('toJSON', {
  transform: (document, returnDocument) => {
    returnDocument.id = document._id.toString();
    delete returnDocument._id;
    delete returnDocument.password;
    delete returnDocument.__v;
  }
});

module.exports = mongoose.model('User', userSchema);
