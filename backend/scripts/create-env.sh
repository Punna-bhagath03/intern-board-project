#!/bin/bash

# Function to load environment variables securely
load_env() {
  if [ -f ~/.intern-board.env ]; then
    while IFS='=' read -r key value; do
      # Skip comments and empty lines
      [[ $key =~ ^# ]] || [ -z "$key" ] && continue
      # Remove any surrounding quotes from the value
      value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
      # Export the variable
      export "$key=$value"
    done < ~/.intern-board.env
  else
    echo "Error: Environment file not found. Please run configure-local.sh first"
    exit 1
  fi
}

# Function to create .env file
create_env_file() {
  local env_file=$1
  
  # Generate a new JWT secret if not exists
  if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
  fi
  
  cat > $env_file << EOF
# AWS Configuration
AWS_REGION=${AWS_REGION:-eu-north-1}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

# S3 Bucket Names 
S3_DECORS_BUCKET=${S3_DECORS_BUCKET:-intern-board-decors}
S3_BACKGROUNDS_BUCKET=${S3_BACKGROUNDS_BUCKET:-intern-board-backgrounds}
S3_BOARDS_BUCKET=${S3_BOARDS_BUCKET:-intern-board-content}
S3_AVATARS_BUCKET=${S3_AVATARS_BUCKET:-intern-board-avatars}

# MongoDB Configuration
MONGODB_URI=${MONGODB_URI}

# Application Settings
PORT=${PORT:-5001}
JWT_SECRET=${JWT_SECRET}
CLIENT_ORIGIN=${CLIENT_ORIGIN:-http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com}

# Email Configuration
GMAIL_SERVICE=gmail
GMAIL_USER=${GMAIL_USER}
GMAIL_PASS=${GMAIL_PASS}
EOF

  # Secure the file
  chmod 600 $env_file
}

# Main script
echo "🔐 Creating secure environment file..."

# Load environment variables
load_env

# Create .env file
create_env_file .env

echo "✅ Environment file created successfully!"
