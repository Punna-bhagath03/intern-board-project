#!/bin/bash

# Configure CORS for all S3 buckets
BUCKETS=(
  "$S3_AVATARS_BUCKET"
  "$S3_BACKGROUNDS_BUCKET"
  "$S3_DECORS_BUCKET"
  "$S3_BOARDS_BUCKET"
)

CORS_CONFIG='{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["'"$CORS_ORIGIN"'"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}'

for BUCKET in "${BUCKETS[@]}"
do
  echo "Configuring CORS for bucket: $BUCKET"
  aws s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration "$CORS_CONFIG"
done

echo "✅ CORS configuration complete for all buckets"
