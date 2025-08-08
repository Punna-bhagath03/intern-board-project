#!/bin/bash

echo "🔄 Restarting server with updated configuration..."

# SSH into EC2 and run updates
ssh -i ~/.ssh/intern-board-key.pem ubuntu@13.53.216.215 << 'EOF'
# Navigate to project directory
cd /var/www/intern-board

# Pull latest changes
git fetch origin
git reset --hard origin/main

# Copy environment variables
cd backend
# Setup environment
./scripts/create-env.sh

# Start the server
pm2 restart all
ENVFILE

# Install dependencies
npm install

# Restart the server
pm2 delete all
pm2 start index.js --name "intern-board" --watch

# Show running processes
echo "🔍 Checking server status..."
pm2 list

# Check the logs
echo "📝 Recent logs:"
pm2 logs --lines 10 --nostream

echo "✅ Server restarted! Check the logs above for any errors."
EOF
