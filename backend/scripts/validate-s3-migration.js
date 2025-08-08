const mongoose = require('mongoose');
const { Board } = require('../models/Board');
const User = require('../models/User');
const Decor = require('../models/Decor');
const { HeadObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('../utils/s3');
require('dotenv').config();

async function validateS3Migration() {
  try {
    console.log('🔍 Starting S3 migration validation...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Validate User Avatars
    console.log('👤 Checking user avatars...');
    const users = await User.find({ avatar: { $exists: true, $ne: '' } });
    console.log(`Found ${users.length} users with avatars`);

    let validAvatars = 0;
    for (const user of users) {
      if (user.avatar.includes('amazonaws.com')) {
        try {
          const key = user.avatar.split('/').pop();
          await s3Client.send(
            new HeadObjectCommand({
              Bucket: process.env.S3_AVATARS_BUCKET,
              Key: key,
            })
          );
          validAvatars++;
        } catch (err) {
          console.log(`❌ Invalid avatar for user ${user._id}: ${user.avatar}`);
        }
      } else {
        console.log(
          `⚠️ Non-S3 avatar found for user ${user._id}: ${user.avatar}`
        );
      }
    }
    console.log(`✅ ${validAvatars}/${users.length} avatars validated\n`);

    // Validate Decors
    console.log('🎨 Checking decors...');
    const decors = await Decor.find();
    console.log(`Found ${decors.length} decors`);

    let validDecors = 0;
    for (const decor of decors) {
      if (decor.imageUrl.includes('amazonaws.com')) {
        try {
          const key = decor.imageUrl.split('/').pop();
          await s3Client.send(
            new HeadObjectCommand({
              Bucket: process.env.S3_DECORS_BUCKET,
              Key: key,
            })
          );
          validDecors++;
        } catch (err) {
          console.log(`❌ Invalid decor: ${decor._id}: ${decor.imageUrl}`);
        }
      } else {
        console.log(`⚠️ Non-S3 decor found: ${decor._id}: ${decor.imageUrl}`);
      }
    }
    console.log(`✅ ${validDecors}/${decors.length} decors validated\n`);

    // Validate Boards (backgrounds and content)
    console.log('📋 Checking boards...');
    const boards = await Board.find();
    console.log(`Found ${boards.length} boards`);

    let validBackgrounds = 0;
    let totalBackgrounds = 0;

    for (const board of boards) {
      if (board.background) {
        totalBackgrounds++;
        if (board.background.includes('amazonaws.com')) {
          try {
            const key = board.background.split('/').pop();
            await s3Client.send(
              new HeadObjectCommand({
                Bucket: process.env.S3_BACKGROUNDS_BUCKET,
                Key: key,
              })
            );
            validBackgrounds++;
          } catch (err) {
            console.log(
              `❌ Invalid background in board ${board._id}: ${board.background}`
            );
          }
        } else {
          console.log(
            `⚠️ Non-S3 background in board ${board._id}: ${board.background}`
          );
        }
      }
    }
    console.log(
      `✅ ${validBackgrounds}/${totalBackgrounds} backgrounds validated\n`
    );

    console.log('🎉 Validation complete!\n');
    console.log('Summary:');
    console.log(`- Avatars: ${validAvatars}/${users.length}`);
    console.log(`- Decors: ${validDecors}/${decors.length}`);
    console.log(`- Backgrounds: ${validBackgrounds}/${totalBackgrounds}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Validation failed:', err);
    process.exit(1);
  }
}

validateS3Migration();
