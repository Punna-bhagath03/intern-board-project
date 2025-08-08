#!/bin/bash

# Generate new JWT secret
NEW_JWT_SECRET=$(openssl rand -base64 32)

# Generate new Gmail App Password
# Note: You need to generate this manually from Google Account settings
# Visit: https://myaccount.google.com/security > 2-Step Verification > App passwords

# Generate new environment file with secure credentials
./scripts/create-env.sh

# Create git ignore if it doesn't exist
echo ".env*" >> .gitignore
echo "*.pem" >> .gitignore

echo "New secure credentials generated. Please update the placeholders in .env.production"
