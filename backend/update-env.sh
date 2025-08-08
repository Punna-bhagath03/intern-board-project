#!/bin/bash

# Stop the application
pm2 stop intern-board-backend

# Update environment variables
sudo tee /etc/environment << EOF
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=NEW_KEY_HERE
AWS_SECRET_ACCESS_KEY=NEW_SECRET_HERE
MONGODB_URL=NEW_MONGODB_URL
JWT_SECRET=NEW_JWT_SECRET
GMAIL_USER=punnabhagath03@gmail.com
GMAIL_PASS=NEW_APP_PASSWORD
EOF

# Reload environment variables
source /etc/environment

# Restart the application
pm2 restart intern-board-backend
pm2 save
