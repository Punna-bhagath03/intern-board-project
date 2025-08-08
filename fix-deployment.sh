#!/bin/bash

echo "🔄 Fixing server deployment..."

ssh -i ~/.ssh/intern-board-key.pem ubuntu@13.53.216.215 << 'EOF'
# Navigate to project directory
cd /home/ubuntu/intern-board-project/backend

# Stop all processes and clear logs
echo "Stopping all PM2 processes..."
pm2 delete all
pm2 flush

# Remove node_modules and package-lock.json for clean install
echo "Cleaning npm cache and node_modules..."
rm -rf node_modules package-lock.json
npm cache clean --force

# Install dependencies
echo "Installing dependencies..."
npm install

# Setup environment
echo "Setting up environment..."
./scripts/create-env.sh

# Email Configuration
GMAIL_SERVICE=gmail
GMAIL_USER=punnabhagath03@gmail.com
GMAIL_PASS=unwt lixo knyk gdwq
ENVFILE

# Update file permissions
chmod 600 .env

# Start the server with PM2
echo "Starting server with PM2..."
pm2 start index.js --name "intern-board-backend" --time

# Save PM2 process list
pm2 save

# Show status and logs
echo -e "\n📊 PM2 Status:"
pm2 list

echo -e "\n📝 Recent Logs:"
sleep 2
pm2 logs --lines 20 --nostream
EOF
