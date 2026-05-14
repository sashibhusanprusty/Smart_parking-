const mongoose = require('mongoose');

async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_parking';
  return mongoose.connect(mongoUri, { autoIndex: true });
}

module.exports = { connectDB };

