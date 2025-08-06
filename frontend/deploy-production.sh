#!/bin/bash

# Build the frontend
npm install
npm run build

# Sync with S3 bucket
aws s3 sync dist/ s3://intern-board-frontend --delete

# Set bucket website configuration
aws s3 website s3://intern-board-frontend --index-document index.html --error-document index.html

# Set bucket policy for public access
aws s3api put-bucket-policy --bucket intern-board-frontend --policy '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::intern-board-frontend/*"
        }
    ]
}'
