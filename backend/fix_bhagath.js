require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function fixBhagath() {
  await mongoose.connect(process.env.MONGO_URL);
  const hash = await bcrypt.hash('bhagath', 10);
  const result = await User.updateOne(
    { username: 'bhagath' },
    { $set: { email: 'punnabhagath03@gmail.com', password: hash } }
  );
  console.log('Update result:', result);
  await mongoose.disconnect();
}

fixBhagath(); 