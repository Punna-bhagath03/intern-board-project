#!/bin/bash

# Update Nginx configuration
sudo cp /var/www/intern-board/backend/nginx.conf /etc/nginx/sites-available/default
sudo systemctl restart nginx

# Update backend code and restart
cd /var/www/intern-board/backend
npm install
pm2 restart all

echo "✅ Backend update complete!"
