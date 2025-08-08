#!/bin/bash

echo "🚀 Starting comprehensive server setup..."

# SSH into EC2 and run setup
ssh -i ~/.ssh/intern-board-key.pem ubuntu@13.53.216.215 << 'EOF'
# Stop existing processes
echo "Stopping existing processes..."
pm2 delete all
sudo systemctl stop nginx

# Update code
echo "Updating code..."
cd /var/www/intern-board
git fetch origin
git reset --hard origin/main

# Setup backend
echo "Setting up backend..."
cd backend

# Setup environment
echo "Setting up environment..."
./scripts/create-env.sh

# Install dependencies
echo "Installing dependencies..."
npm install

# Start backend with PM2
echo "Starting backend service..."
pm2 delete all
pm2 start index.js --name "intern-board" --time --watch

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Check if backend is running
echo "Checking backend status..."
curl -s http://localhost:5001/ || echo "Backend not responding"

# Check PM2 logs
echo "Recent PM2 logs:"
pm2 logs --lines 10 --nostream

echo "✅ Setup complete! Check the logs above for any errors."
EOF
