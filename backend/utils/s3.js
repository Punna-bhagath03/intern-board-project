const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const sharp = require('sharp');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadToS3(buffer, fileName, bucketName, mimeType) {
  try {
    // Optimize image before upload
    const optimizedBuffer = await sharp(buffer)
      .resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: fileName,
        Body: optimizedBuffer,
        ContentType: mimeType,
        ACL: 'public-read',
      },
    });

    const result = await upload.done();
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
}

function getBucketForFileType(fileType) {
  switch (fileType) {
    case 'avatar':
      return process.env.S3_AVATARS_BUCKET;
    case 'background':
      return process.env.S3_BACKGROUNDS_BUCKET;
    case 'decor':
      return process.env.S3_DECORS_BUCKET;
    case 'board':
      return process.env.S3_BOARDS_BUCKET;
    default:
      throw new Error('Invalid file type');
  }
}

module.exports = {
  s3Client,
  uploadToS3,
  getBucketForFileType,
};
