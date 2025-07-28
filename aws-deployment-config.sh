#!/bin/bash

# AWS Deployment Configuration Script for Intern Board Application
# This script sets up the complete AWS infrastructure for deployment

set -e

echo "🚀 Starting AWS Deployment Configuration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
PROJECT_NAME="intern-board"
REGION="us-east-1"
EC2_INSTANCE_TYPE="t3.medium"
EC2_KEY_NAME="intern-board-key"
S3_BUCKET_NAME="intern-board-frontend"
DOMAIN_NAME="your-domain.com"  # Change this to your domain

echo -e "${BLUE}📋 Configuration:${NC}"
echo "Project Name: $PROJECT_NAME"
echo "Region: $REGION"
echo "EC2 Instance Type: $EC2_INSTANCE_TYPE"
echo "S3 Bucket: $S3_BUCKET_NAME"
echo "Domain: $DOMAIN_NAME"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI and credentials verified${NC}"

# Create S3 bucket for frontend
echo -e "${BLUE}📦 Creating S3 bucket for frontend...${NC}"
aws s3 mb s3://$S3_BUCKET_NAME --region $REGION

# Configure S3 bucket for static website hosting
aws s3 website s3://$S3_BUCKET_NAME --index-document index.html --error-document index.html

# Create S3 bucket policy for public read access
cat > s3-bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$S3_BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $S3_BUCKET_NAME --policy file://s3-bucket-policy.json

# Create EC2 key pair
echo -e "${BLUE}🔑 Creating EC2 key pair...${NC}"
aws ec2 create-key-pair --key-name $EC2_KEY_NAME --query 'KeyMaterial' --output text > $EC2_KEY_NAME.pem
chmod 400 $EC2_KEY_NAME.pem

# Create security group for EC2
echo -e "${BLUE}🛡️ Creating security group...${NC}"
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name $PROJECT_NAME-sg \
    --description "Security group for $PROJECT_NAME" \
    --query 'GroupId' --output text)

# Add rules to security group
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 5001 \
    --cidr 0.0.0.0/0

# Get latest Ubuntu AMI
AMI_ID=$(aws ec2 describe-images \
    --owners 099720109477 \
    --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-22.04-amd64-server-*" \
    --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
    --output text)

# Create EC2 instance
echo -e "${BLUE}🖥️ Creating EC2 instance...${NC}"
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --count 1 \
    --instance-type $EC2_INSTANCE_TYPE \
    --key-name $EC2_KEY_NAME \
    --security-group-ids $SECURITY_GROUP_ID \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$PROJECT_NAME-backend}]" \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo -e "${GREEN}✅ EC2 instance created successfully${NC}"
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"

# Create deployment script for EC2
cat > deploy-backend.sh << 'EOF'
#!/bin/bash

# Backend deployment script for EC2

set -e

echo "🚀 Deploying backend to EC2..."

# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create application directory
sudo mkdir -p /var/www/intern-board
sudo chown ubuntu:ubuntu /var/www/intern-board

# Configure Nginx
sudo tee /etc/nginx/sites-available/intern-board << 'NGINX'
server {
    listen 80;
    server_name _;

    # Frontend (served from S3)
    location / {
        return 301 https://intern-board-frontend.s3-website-us-east-1.amazonaws.com;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5001/;
        proxy_set_header Host $host;
    }
}
NGINX

# Enable site
sudo ln -sf /etc/nginx/sites-available/intern-board /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "✅ Backend deployment completed!"
EOF

chmod +x deploy-backend.sh

# Create environment files
echo -e "${BLUE}📝 Creating environment files...${NC}"

# Backend environment file
cat > backend.env << EOF
NODE_ENV=production
PORT=5001
MONGO_URL=mongodb://localhost:27017/intern-board
JWT_SECRET=$(openssl rand -base64 32)
CLIENT_ORIGIN=https://$S3_BUCKET_NAME.s3-website-$REGION.amazonaws.com
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
EOF

# Frontend environment file
cat > frontend.env << EOF
VITE_API_URL=http://$PUBLIC_IP
EOF

# Create deployment instructions
cat > AWS_DEPLOYMENT_INSTRUCTIONS.md << EOF
# AWS Deployment Instructions

## Infrastructure Created

- **EC2 Instance**: $INSTANCE_ID ($PUBLIC_IP)
- **S3 Bucket**: $S3_BUCKET_NAME
- **Security Group**: $SECURITY_GROUP_ID
- **Key Pair**: $EC2_KEY_NAME.pem

## Deployment Steps

### 1. Backend Deployment (EC2)

1. **Connect to EC2 instance**:
   \`\`\`bash
   ssh -i $EC2_KEY_NAME.pem ubuntu@$PUBLIC_IP
   \`\`\`

2. **Upload backend code**:
   \`\`\`bash
   scp -i $EC2_KEY_NAME.pem -r backend/ ubuntu@$PUBLIC_IP:/var/www/intern-board/
   \`\`\`

3. **Upload environment file**:
   \`\`\`bash
   scp -i $EC2_KEY_NAME.pem backend.env ubuntu@$PUBLIC_IP:/var/www/intern-board/backend/.env
   \`\`\`

4. **Run deployment script**:
   \`\`\`bash
   scp -i $EC2_KEY_NAME.pem deploy-backend.sh ubuntu@$PUBLIC_IP:~/
   ssh -i $EC2_KEY_NAME.pem ubuntu@$PUBLIC_IP "chmod +x deploy-backend.sh && ./deploy-backend.sh"
   \`\`\`

5. **Install dependencies and start application**:
   \`\`\`bash
   ssh -i $EC2_KEY_NAME.pem ubuntu@$PUBLIC_IP
   cd /var/www/intern-board/backend
   npm install --production
   pm2 start index.js --name "intern-board-backend"
   pm2 startup
   pm2 save
   \`\`\`

### 2. Frontend Deployment (S3)

1. **Build frontend**:
   \`\`\`bash
   cd frontend
   cp ../frontend.env .env
   npm install
   npm run build
   \`\`\`

2. **Upload to S3**:
   \`\`\`bash
   aws s3 sync dist/ s3://$S3_BUCKET_NAME --delete
   \`\`\`

3. **Configure CloudFront (Optional)**:
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure custom domain if needed

## Environment Variables

### Backend (.env)
\`\`\`env
$(cat backend.env)
\`\`\`

### Frontend (.env)
\`\`\`env
$(cat frontend.env)
\`\`\`

## URLs

- **Frontend**: https://$S3_BUCKET_NAME.s3-website-$REGION.amazonaws.com
- **Backend API**: http://$PUBLIC_IP/api
- **Health Check**: http://$PUBLIC_IP/health

## Security Notes

1. **Update JWT_SECRET** in backend.env with a secure random string
2. **Configure Gmail credentials** for email notifications
3. **Set up SSL certificate** for HTTPS (recommended)
4. **Restrict security group** to specific IP ranges if needed
5. **Set up monitoring** and logging

## Monitoring

- **PM2 Status**: \`pm2 status\`
- **Nginx Logs**: \`sudo tail -f /var/log/nginx/access.log\`
- **Application Logs**: \`pm2 logs intern-board-backend\`
- **MongoDB Status**: \`sudo systemctl status mongod\`

## Backup

- **Database**: Set up MongoDB Atlas or regular backups
- **Application**: Use version control and automated deployments
- **Files**: S3 versioning for uploaded files

## Cost Optimization

- **EC2**: Use reserved instances for production
- **S3**: Enable lifecycle policies for cost management
- **Monitoring**: Set up CloudWatch alarms for cost tracking
EOF

echo -e "${GREEN}✅ AWS deployment configuration completed!${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Review AWS_DEPLOYMENT_INSTRUCTIONS.md"
echo "2. Update environment variables with your values"
echo "3. Deploy backend to EC2"
echo "4. Deploy frontend to S3"
echo "5. Test all functionality"
echo ""
echo -e "${BLUE}🔐 Security Files:${NC}"
echo "- Key file: $EC2_KEY_NAME.pem (keep secure!)"
echo "- Backend env: backend.env"
echo "- Frontend env: frontend.env"
echo ""
echo -e "${GREEN}🎉 Ready for deployment!${NC}" 