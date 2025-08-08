const fs = require('fs').promises;
const path = require('path');
const { uploadToS3, getBucketForFileType, s3Client } = require('../utils/s3');
const {
  HeadObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');

async function testS3Uploads() {
  try {
    console.log('🚀 Starting S3 upload tests...\n');

    // Test image path (create a small test image)
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    // Test each bucket type
    const tests = [
      { type: 'avatar', filename: 'test-avatar.png' },
      { type: 'background', filename: 'test-background.png' },
      { type: 'decor', filename: 'test-decor.png' },
      { type: 'board', filename: 'test-board.png' },
    ];

    for (const test of tests) {
      console.log(`\n📝 Testing ${test.type} upload...`);

      try {
        // Upload test
        const s3Url = await uploadToS3(
          testImage,
          test.filename,
          getBucketForFileType(test.type),
          'image/png'
        );
        console.log('✅ Upload successful');
        console.log('🔗 URL:', s3Url);

        // Verify the file exists
        await s3Client.send(
          new HeadObjectCommand({
            Bucket: getBucketForFileType(test.type),
            Key: test.filename,
          })
        );
        console.log('✅ File verification successful');

        // Test public access
        const response = await fetch(s3Url);
        if (response.ok) {
          console.log('✅ Public access verified');
        } else {
          throw new Error(`Public access failed: ${response.status}`);
        }

        // Cleanup
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: getBucketForFileType(test.type),
            Key: test.filename,
          })
        );
        console.log('✅ Cleanup successful');
      } catch (err) {
        console.error(`❌ ${test.type} test failed:`, err);
      }
    }

    console.log('\n✅ All tests completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

testS3Uploads();
