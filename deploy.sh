#!/bin/bash

echo "🔄 Deploying updates to EC2..."

# Copy files to EC2
scp -i ~/.ssh/intern-board-key.pem -r ./backend/* ubuntu@13.53.216.215:/home/ubuntu/intern-board-project/backend/

# SSH into EC2 and restart the server
ssh -i ~/.ssh/intern-board-key.pem ubuntu@13.53.216.215 << 'EOF'
cd /home/ubuntu/intern-board-project/backend
pm2 delete all
pm2 start index.js --name "intern-board-backend"
echo "📝 Recent logs:"
pm2 logs --lines 15 --nostream
EOF
