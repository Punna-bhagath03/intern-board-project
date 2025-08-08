#!/bin/bash

# Array of bucket names
BUCKETS=(
    "intern-board-avatars"
    "intern-board-backgrounds"
    "intern-board-content"
    "intern-board-decors"
)

# Create policy file for each bucket
for BUCKET in "${BUCKETS[@]}"; do
    echo "Configuring bucket: $BUCKET"
    
    # Create bucket policy
    cat > "${BUCKET}-policy.json" << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET}/*"
        }
    ]
}
EOF

    # Apply bucket policy
    aws s3api put-bucket-policy \
        --bucket "${BUCKET}" \
        --policy "file://${BUCKET}-policy.json"
    
    # Create CORS configuration
    cat > "${BUCKET}-cors.json" << EOF
{
    "CORSRules": [
        {
            "AllowedOrigins": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedHeaders": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3600
        }
    ]
}
EOF

    # Apply CORS configuration
    aws s3api put-bucket-cors \
        --bucket "${BUCKET}" \
        --cors-configuration "file://${BUCKET}-cors.json"
    
    # Verify policy
    echo "Verifying policy for $BUCKET:"
    aws s3api get-bucket-policy --bucket "${BUCKET}"
    
    # Verify CORS
    echo "Verifying CORS for $BUCKET:"
    aws s3api get-bucket-cors --bucket "${BUCKET}"
    
    # Cleanup
    rm "${BUCKET}-policy.json" "${BUCKET}-cors.json"
done

echo "✅ All buckets configured successfully!"
