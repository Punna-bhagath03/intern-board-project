#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting Comprehensive Deployment Verification${NC}\n"

# 1. Check Backend Health
echo "1. Checking Backend Status:"
backend_health=$(curl -s http://13.53.216.215:5001/health || curl -s http://13.53.216.215:5001/api/health)
if [[ $backend_health == *"ok"* ]]; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi

# 2. Check Frontend Deployment
echo -e "\n2. Checking Frontend Deployment:"
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com)
if [ "$frontend_status" == "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${RED}✗ Frontend is not accessible (Status: $frontend_status)${NC}"
fi

# 3. Check S3 Buckets
echo -e "\n3. Checking S3 Buckets:"
buckets=("intern-board-decors" "intern-board-backgrounds" "intern-board-content" "intern-board-avatars" "intern-board-frontend")
for bucket in "${buckets[@]}"; do
    if aws s3 ls "s3://$bucket" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Bucket '$bucket' is accessible${NC}"
    else
        echo -e "${RED}✗ Bucket '$bucket' is not accessible${NC}"
    fi
done

# 4. Check MongoDB Connection
echo -e "\n4. Checking Database Connection:"
mongo_status=$(ssh -i /Users/punnabhagath/intern-board-key.pem ubuntu@13.53.216.215 'pm2 logs intern-board-backend --lines 1 | grep "MongoDB connected"')
if [[ $mongo_status == *"MongoDB connected"* ]]; then
    echo -e "${GREEN}✓ MongoDB connection successful${NC}"
else
    echo -e "${RED}✗ MongoDB connection failed${NC}"
fi

# 5. Check CORS Configuration
echo -e "\n5. Checking CORS Configuration:"
cors_status=$(curl -X OPTIONS -H "Origin: http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type" \
    -I http://13.53.216.215:5001/api/auth/login 2>/dev/null | grep -i "access-control-allow-origin")
if [[ ! -z "$cors_status" ]]; then
    echo -e "${GREEN}✓ CORS is properly configured${NC}"
else
    echo -e "${RED}✗ CORS configuration issue detected${NC}"
fi

# 6. Check PM2 Process
echo -e "\n6. Checking PM2 Process:"
pm2_status=$(ssh -i /Users/punnabhagath/intern-board-key.pem ubuntu@13.53.216.215 'pm2 list | grep intern-board-backend')
if [[ $pm2_status == *"online"* ]]; then
    echo -e "${GREEN}✓ PM2 process is running${NC}"
else
    echo -e "${RED}✗ PM2 process is not running${NC}"
fi

# 7. Check Nginx Configuration
echo -e "\n7. Checking Nginx Configuration:"
nginx_status=$(ssh -i /Users/punnabhagath/intern-board-key.pem ubuntu@13.53.216.215 'sudo nginx -t 2>&1')
if [[ $nginx_status == *"successful"* ]]; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ Nginx configuration has errors${NC}"
fi

echo -e "\n${YELLOW}Deployment Verification Complete!${NC}"
