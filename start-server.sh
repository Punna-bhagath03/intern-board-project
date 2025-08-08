#!/bin/bash

echo "🚀 Starting server setup and verification..."

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
npm install

# Check MongoDB connection
echo "Checking MongoDB connection..."
node << 'NODEJS'
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
NODEJS

# Start backend with proper environment
echo "Starting backend service..."
PORT=5001 pm2 start index.js --name "intern-board" --time

# Configure and start Nginx
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;

    # Larger buffer size
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;

    # Error log with debug level
    error_log /var/log/nginx/error.log debug;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,x-share-token' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Handle preflight
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,x-share-token' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
NGINX

# Test and start Nginx
echo "Testing Nginx configuration..."
sudo nginx -t
sudo systemctl start nginx

# Verify services
echo "Verifying services..."
echo "Nginx status:"
sudo systemctl status nginx | grep active
echo "PM2 processes:"
pm2 list
echo "Listening ports:"
sudo netstat -tulpn | grep LISTEN

# Test endpoints
echo "Testing endpoints..."
echo "Testing backend directly:"
curl -v -X OPTIONS http://localhost:5001/api/register \
  -H "Origin: http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com" \
  -H "Access-Control-Request-Method: POST"

echo "Testing through Nginx:"
curl -v -X OPTIONS http://localhost/api/register \
  -H "Origin: http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com" \
  -H "Access-Control-Request-Method: POST"

# Show recent logs
echo "Recent Nginx error logs:"
sudo tail -n 5 /var/log/nginx/error.log
echo "Recent PM2 logs:"
pm2 logs --lines 5

EOF
