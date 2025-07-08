require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing connection to MongoDB...');

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ Test: Connected to MongoDB');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Test: Connection failed:', err);
    process.exit(1);
  });