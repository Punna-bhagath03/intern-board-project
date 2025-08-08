#!/bin/bash

echo "🔄 Updating EC2 configuration..."

# SSH into EC2 and run commands
ssh -i ~/.ssh/intern-board-key.pem ubuntu@13.53.216.215 << 'EOF'
# Pull latest changes
cd /var/www/intern-board
git pull origin main

# Copy Nginx configuration
sudo cp backend/nginx.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl restart nginx

# Update backend and restart
cd backend
npm install
pm2 restart all

# Check services
echo "Checking Nginx status..."
sudo systemctl status nginx | grep Active
echo "Checking Node process..."
pm2 list

echo "✅ Update complete!"
EOF
