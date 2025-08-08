#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local expected_status=$2
    local description=$3
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" $endpoint)
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} $description: Success (Status: $http_code)"
        return 0
    else
        echo -e "${RED}✗${NC} $description: Failed (Status: $http_code)"
        return 1
    fi
}

# Check backend health
echo "Checking Backend Health..."
check_endpoint "http://13.53.216.215:5001/health" 200 "Backend Health Check"

# Check S3 buckets
echo -e "\nChecking S3 Buckets..."
buckets=("intern-board-decors" "intern-board-backgrounds" "intern-board-content" "intern-board-avatars")
for bucket in "${buckets[@]}"; do
    aws s3 ls "s3://$bucket" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Bucket $bucket is accessible"
    else
        echo -e "${RED}✗${NC} Bucket $bucket is not accessible"
    fi
done

# Check MongoDB connection
echo -e "\nChecking MongoDB Connection..."
mongo_status=$(ssh -i /Users/punnabhagath/intern-board-key.pem ubuntu@13.53.216.215 'pm2 logs intern-board-backend --lines 1 | grep "MongoDB connected"')
if [[ $mongo_status == *"MongoDB connected"* ]]; then
    echo -e "${GREEN}✓${NC} MongoDB connection successful"
else
    echo -e "${RED}✗${NC} MongoDB connection failed"
fi

# Check frontend deployment
echo -e "\nChecking Frontend Deployment..."
check_endpoint "http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com" 200 "Frontend Deployment"

echo -e "\nDeployment Verification Complete!"
