#!/bin/bash

echo "🔍 Checking server status and logs..."

ssh -i ~/.ssh/intern-board-key.pem ubuntu@13.53.216.215 << 'EOF'
# Navigate to project directory
cd /home/ubuntu/intern-board-project/backend

# Show current directory
echo "📂 Current directory: $(pwd)"

# List directory contents
echo -e "\n📑 Directory contents:"
ls -la

# Show PM2 status
echo -e "\n🚀 PM2 process status:"
pm2 list

# Show recent logs
echo -e "\n📝 Recent PM2 logs:"
pm2 logs --lines 20 --nostream

# Show environment file
echo -e "\n📄 Current .env file:"
cat .env
EOF
