#!/bin/bash

echo "� Deploying backend to EC2..."

# SSH into EC2 and set up the environment
ssh -i ~/.ssh/intern-board-key.pem ubuntu@13.53.216.215 << 'EOF'
# Navigate to project directory
cd /home/ubuntu/intern-board-project/backend

# Stop any running processes
pm2 delete all

# Run environment setup script
./scripts/create-env.sh

# Install dependencies
npm install

# Start the server
pm2 start index.js --name "intern-board-backend"

# Show logs
echo "📝 Recent logs:"
sleep 2
pm2 logs --lines 15 --nostream
EOF
