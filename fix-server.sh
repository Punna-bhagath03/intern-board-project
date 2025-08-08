#!/bin/bash

echo "🔄 Starting comprehensive server update..."

# SSH into EC2 and run updates
ssh -i ~/.ssh/intern-board-key.pem ubuntu@13.53.216.215 << 'EOF'
echo "1️⃣ Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "2️⃣ Checking and fixing Node.js installation..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "3️⃣ Updating project code..."
cd /var/www/intern-board
git fetch origin
git reset --hard origin/main

echo "4️⃣ Installing backend dependencies..."
cd backend
npm install

echo "5️⃣ Updating Nginx configuration..."
sudo cp nginx.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl restart nginx

echo "6️⃣ Restarting backend service..."
pm2 delete all || true
pm2 start index.js --name "intern-board"

echo "7️⃣ Verifying services..."
echo "Nginx status:"
sudo systemctl status nginx | grep active
echo "Node process:"
pm2 list
echo "Listening ports:"
sudo netstat -tulpn | grep LISTEN

echo "8️⃣ Testing backend..."
curl -v -X OPTIONS http://localhost:5001/api/register \
  -H "Origin: http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com" \
  -H "Access-Control-Request-Method: POST"

echo "✅ Update complete!"
EOF
