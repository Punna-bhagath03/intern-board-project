#!/bin/bash

echo "🔧 Setting up local environment..."

# Check if environment file exists
if [ -f ~/.intern-board.env ]; then
  read -p "Environment file already exists. Overwrite? (y/n) " overwrite
  if [[ $overwrite != "y" ]]; then
    echo "Aborting..."
    exit 1
  fi
fi

# Generate random JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Collect configurations
read -p "AWS Region [eu-north-1]: " AWS_REGION
AWS_REGION=${AWS_REGION:-eu-north-1}

read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY

echo "Configuring bucket names..."
read -p "Decors bucket [intern-board-decors]: " S3_DECORS_BUCKET
S3_DECORS_BUCKET=${S3_DECORS_BUCKET:-intern-board-decors}

read -p "Backgrounds bucket [intern-board-backgrounds]: " S3_BACKGROUNDS_BUCKET
S3_BACKGROUNDS_BUCKET=${S3_BACKGROUNDS_BUCKET:-intern-board-backgrounds}

read -p "Boards bucket [intern-board-content]: " S3_BOARDS_BUCKET
S3_BOARDS_BUCKET=${S3_BOARDS_BUCKET:-intern-board-content}

read -p "Avatars bucket [intern-board-avatars]: " S3_AVATARS_BUCKET
S3_AVATARS_BUCKET=${S3_AVATARS_BUCKET:-intern-board-avatars}

read -p "MongoDB URI: " MONGODB_URI

read -p "Gmail Address: " GMAIL_USER
read -p "Gmail App Password: " GMAIL_PASS

read -p "Frontend Origin [http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com]: " CLIENT_ORIGIN
CLIENT_ORIGIN=${CLIENT_ORIGIN:-http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com}

# Save environment file
cat > ~/.intern-board.env << EOF
# AWS Configuration
AWS_REGION=$AWS_REGION
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

# S3 Bucket Names
S3_DECORS_BUCKET=$S3_DECORS_BUCKET
S3_BACKGROUNDS_BUCKET=$S3_BACKGROUNDS_BUCKET
S3_BOARDS_BUCKET=$S3_BOARDS_BUCKET
S3_AVATARS_BUCKET=$S3_AVATARS_BUCKET

# MongoDB Configuration
MONGODB_URI=$MONGODB_URI

# Application Settings
PORT=5001
JWT_SECRET=$JWT_SECRET
CLIENT_ORIGIN=$CLIENT_ORIGIN

# Email Configuration
GMAIL_SERVICE=gmail
GMAIL_USER=$GMAIL_USER
GMAIL_PASS=$GMAIL_PASS
EOF

# Secure the file
chmod 600 ~/.intern-board.env

echo "✅ Environment configuration saved to ~/.intern-board.env"
