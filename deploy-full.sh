#!/bin/bash

# Load environment variables
if [ ! -f ~/.intern-board.env ]; then
    echo "Error: Environment file not found. Please run configure-local.sh first"
    exit 1
fi

# Source environment variables securely
while IFS='=' read -r key value; do
    [[ $key =~ ^# ]] || [ -z "$key" ] && continue
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    export "$key=$value"
done < ~/.intern-board.env

echo "🔄 Starting server deployment..."

# Verify required environment variables
required_vars=(
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "MONGODB_URI"
    "JWT_SECRET"
    "GMAIL_USER"
    "GMAIL_PASS"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: Required environment variable $var is not set"
        exit 1
    fi
done

# SSH into EC2 and run setup
ssh -i ~/.ssh/intern-board-key.pem ubuntu@13.53.216.215 << EOF
# Update system
sudo apt update && sudo apt upgrade -y

# Ensure nginx is installed
sudo apt install -y nginx

# Stop services
sudo systemctl stop nginx
pm2 delete all

# Create necessary directories
sudo mkdir -p /var/www/intern-board
sudo chown -R ubuntu:ubuntu /var/www/intern-board

# Update code
cd /var/www/intern-board
git fetch origin
git reset --hard origin/main

# Setup backend
cd backend
npm install

# Configure Nginx
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-available/default
sudo cp nginx/default /etc/nginx/sites-available/default
sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Verify Nginx config
sudo nginx -t

# Start services
pm2 start index.js --name "intern-board"
sudo systemctl start nginx

# Show status
echo "📊 Service Status:"
echo "-------------------"
echo "Nginx status:"
sudo systemctl status nginx | grep active
echo "Node process:"
pm2 list
echo "Listening ports:"
sudo netstat -tulpn | grep LISTEN

# Test the server
echo "🧪 Testing server..."
curl -v -X OPTIONS http://localhost/api/register \
  -H "Origin: http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization"

echo "✅ Deployment complete!"
EOF
