require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { uploadToS3, getBucketForFileType } = require('../utils/s3');
const { Decor } = require('../models/Decor');
const mongoose = require('mongoose');

async function migrateFilesToS3() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Migrate decors
    const decorUploadsDir = path.join(__dirname, '../../uploads/decors');
    const decorFiles = await fs.readdir(decorUploadsDir);

    for (const file of decorFiles) {
      const filePath = path.join(decorUploadsDir, file);
      const fileBuffer = await fs.readFile(filePath);
      const s3Url = await uploadToS3(
        fileBuffer,
        file,
        getBucketForFileType('decor'),
        'image/jpeg' // You might want to detect actual mime type
      );

      // Update database record
      const decor = await Decor.findOne({
        imageUrl: `/uploads/decors/${file}`,
      });
      if (decor) {
        decor.imageUrl = s3Url;
        await decor.save();
        console.log(`Migrated decor: ${file}`);
      }
    }

    // Migrate backgrounds
    const backgroundsDir = path.join(__dirname, '../../uploads/backgrounds');
    const backgroundFiles = await fs.readdir(backgroundsDir);

    for (const file of backgroundFiles) {
      const filePath = path.join(backgroundsDir, file);
      const fileBuffer = await fs.readFile(filePath);
      const s3Url = await uploadToS3(
        fileBuffer,
        file,
        getBucketForFileType('background'),
        'image/jpeg' // You might want to detect actual mime type
      );
      console.log(`Migrated background: ${file}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateFilesToS3();
