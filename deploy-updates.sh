#!/bin/bash

# Script to deploy both frontend and backend updates

echo "🚀 Starting deployment of updates..."

# Navigate to project directory
cd /Users/punnabhagath/Downloads/intern-board1/intern-board-project

# Build and deploy frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

# Deploy to S3
echo "🚀 Deploying frontend to S3..."
aws s3 sync dist/ s3://intern-board-frontend --delete

# Deploy backend
echo "🔄 Deploying backend to EC2..."
cd ../backend

# SSH into EC2 and update backend
ssh -i ~/.ssh/intern-board-key.pem ubuntu@13.53.216.215 << 'EOF'
cd /var/www/intern-board
git pull origin main
cd backend
npm install
pm2 restart all
EOF

echo "✅ Deployment complete!"
