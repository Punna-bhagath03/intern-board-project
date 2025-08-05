#!/bin/bash

# Deploy updated backend to EC2
echo "🚀 Deploying updated backend with S3 integration..."

# Update system packages
sudo apt update
sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx

# Create application directory if it doesn't exist
sudo mkdir -p /var/www/intern-board
sudo chown -R ubuntu:ubuntu /var/www/intern-board

# Copy new backend code
cd /var/www/intern-board
git pull origin main

# Install dependencies
cd backend
npm install

# Update environment variables
cp backend.env .env

# Restart PM2 process
pm2 restart intern-board-backend || pm2 start index.js --name intern-board-backend

# Configure Nginx
sudo tee /etc/nginx/sites-available/intern-board << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        return 301 https://intern-board-frontend.s3-website-eu-north-1.amazonaws.com;
    }

    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:5001/;
        proxy_set_header Host $host;
    }
}
EOF

# Enable site and restart Nginx
sudo ln -sf /etc/nginx/sites-available/intern-board /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Deployment completed!"
