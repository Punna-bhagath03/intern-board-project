#!/bin/bash

echo "🔍 Checking server configuration..."

# SSH into EC2 and run diagnostics
ssh -i ~/.ssh/intern-board-key.pem ubuntu@13.53.216.215 << 'EOF'
echo "1️⃣ Checking Node process..."
pm2 list
echo ""

echo "2️⃣ Checking listening ports..."
sudo netstat -tulpn | grep LISTEN
echo ""

echo "3️⃣ Checking Nginx configuration..."
sudo nginx -T
echo ""

echo "4️⃣ Testing backend directly..."
curl -v -X OPTIONS http://localhost:5001/api/register \
  -H "Origin: http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization"
echo ""

echo "5️⃣ Testing through Nginx..."
curl -v -X OPTIONS http://localhost:80/api/register \
  -H "Origin: http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization"
echo ""

echo "6️⃣ Checking logs..."
echo "Nginx error log:"
sudo tail -n 50 /var/log/nginx/error.log
echo ""
echo "PM2 logs:"
pm2 logs --lines 50
EOF
