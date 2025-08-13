const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const sharp = require('sharp');

// Configure S3 client. Prefer explicit credentials if provided; otherwise
// allow the default provider chain (e.g., EC2 instance role) to supply creds.
const clientConfig = {
  region: process.env.AWS_REGION || 'eu-north-1',
};
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}
const s3Client = new S3Client(clientConfig);

async function uploadToS3(buffer, fileName, bucketName, mimeType) {
  try {
    // Optimize image before upload. If optimization fails (e.g., missing libvips),
    // gracefully fall back to the original buffer to avoid breaking uploads.
    let optimizedBuffer = buffer;
    try {
      optimizedBuffer = await sharp(buffer)
        .resize(2000, 2000, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer();
    } catch (optErr) {
      console.warn('Image optimization failed, uploading original buffer:', optErr?.message);
      optimizedBuffer = buffer;
    }

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: fileName,
        Body: optimizedBuffer,
        ContentType: mimeType,
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
  // Sensible defaults to avoid undefined bucket errors if env vars are missing
  const defaults = {
    avatar: 'intern-board-avatars',
    background: 'intern-board-backgrounds',
    decor: 'intern-board-decors',
    board: 'intern-board-content',
  };

  switch (fileType) {
    case 'avatar':
      return process.env.S3_AVATARS_BUCKET || defaults.avatar;
    case 'background':
      return process.env.S3_BACKGROUNDS_BUCKET || defaults.background;
    case 'decor':
      return process.env.S3_DECORS_BUCKET || defaults.decor;
    case 'board':
      return process.env.S3_BOARDS_BUCKET || defaults.board;
    default:
      throw new Error('Invalid file type');
  }
}

module.exports = {
  s3Client,
  uploadToS3,
  getBucketForFileType,
};
