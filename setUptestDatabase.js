const mongoose = require('mongoose');

async function setupTestDatabase() {
  await mongoose.connect('mongodb://localhost:27017/testdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });


}

module.exports = setupTestDatabase;
