#!/bin/bash

# Stop running server
pm2 stop all

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Set up environment variables (these should be set in EC2 environment)
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export MONGODB_URI="your-mongodb-uri"
export JWT_SECRET="your-jwt-secret"
export GMAIL_USER="your-email"
export GMAIL_PASS="your-app-password"

# Copy production env file
cp .env.production .env

# Start server with PM2
pm2 start index.js --name "intern-board-backend"

# Save PM2 process list
pm2 save
