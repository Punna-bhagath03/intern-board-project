# Secure Deployment Guide

## Overview

This guide covers the secure deployment process for both development and production environments, ensuring all sensitive data is properly protected.

## Security First

### 1. Environment Setup

1. Generate secure credentials:

   ```bash
   # Generate secure JWT secret
   JWT_SECRET=$(openssl rand -base64 32)

   # Generate secure database password
   DB_PASSWORD=$(openssl rand -base64 24)
   ```

2. Configure your local environment:
   ```bash
   cd backend/scripts
   ./configure-local.sh
   ```
   This creates `~/.intern-board.env` with your secure credentials.
3. Important Security Rules:
   - Never commit credentials or .env files to git
   - Store sensitive data only in `~/.intern-board.env`
   - Rotate credentials regularly
   - Use strong, unique passwords
   - Enable 2FA for all services

### 2. AWS Configuration

1. Create an IAM user with minimal permissions:

   - S3 bucket access (read/write for specific buckets only)
   - CloudWatch logging (write only)
   - Enable MFA for the IAM user
   - Generate and securely store access keys

2. Configure S3 buckets with security best practices:

   ```bash
   # Configure buckets with proper permissions
   ./configure-s3-buckets.sh

   # Setup CORS with strict origin checking
   ./configure-s3-cors.sh

   # Enable bucket versioning
   aws s3api put-bucket-versioning \
     --bucket $BUCKET_NAME \
     --versioning-configuration Status=Enabled

   # Enable access logging
   aws s3api put-bucket-logging \
     --bucket $BUCKET_NAME \
     --bucket-logging-status file://logging.json
   ```

### 3. Database Security

1. Create a dedicated MongoDB user with appropriate permissions
2. Use strong passwords and secure connection strings
3. Enable database access controls and network restrictions

## Deployment Process

### Backend Deployment

1. Configure production environment:

   ```bash
   # First time setup
   ./scripts/configure-local.sh

   # Deploy to EC2
   ./deploy-backend.sh
   ```

2. Verify deployment:
   ```bash
   ./verify-deployment.sh
   ```

### Frontend Deployment

1. Build the frontend:

   ```bash
   cd frontend
   npm run build
   ```

2. Deploy to S3:
   ```bash
   ./deploy-frontend.sh
   ```

## Post-Deployment

1. Test the application end-to-end
2. Verify security configurations
3. Monitor application logs and metrics

## Credential Rotation

Regularly rotate credentials using:

```bash
./backend/rotate-credentials.sh
```

## Security Checklist

- [ ] Environment variables securely configured
- [ ] No credentials in code or git history
- [ ] S3 buckets properly configured
- [ ] Database access restricted
- [ ] CORS policies in place
- [ ] SSL/TLS enabled
- [ ] Regular security updates
- [ ] Monitoring and logging enabled
