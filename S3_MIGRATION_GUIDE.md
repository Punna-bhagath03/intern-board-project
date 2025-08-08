# S3 Migration Guide

## 1. AWS Configuration Required

1. Create S3 buckets (if not already created):

   ```bash
   aws s3 mb s3://$S3_AVATARS_BUCKET --region $AWS_REGION
   aws s3 mb s3://$S3_BACKGROUNDS_BUCKET --region $AWS_REGION
   aws s3 mb s3://$S3_DECORS_BUCKET --region $AWS_REGION
   aws s3 mb s3://$S3_BOARDS_BUCKET --region $AWS_REGION
   ```

2. Configure CORS for all buckets:
   ```bash
   cd backend/scripts
   ./configure-s3-cors.sh
   ```

## 2. Environment Variables

Add these to your `.env` file:

```env
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

S3_DECORS_BUCKET=intern-board-decors
S3_BACKGROUNDS_BUCKET=intern-board-backgrounds
S3_BOARDS_BUCKET=intern-board-content
S3_AVATARS_BUCKET=intern-board-avatars
```

## 3. Migration Steps

1. Install new dependencies:

   ```bash
   cd backend
   npm install @aws-sdk/client-s3 @aws-sdk/lib-storage sharp
   ```

2. The code changes have been made to:

   - Created new S3 utility functions
   - Updated multer configuration to use memory storage
   - Modified upload endpoints to use S3
   - Removed local file serving

3. Data Migration:
   ```bash
   # If needed, migrate existing files to S3 (create a migration script)
   node scripts/migrate-files-to-s3.js
   ```

## 4. Testing Checklist

- [ ] User avatar upload & display
- [ ] Background image upload & selection
- [ ] Board creation with custom backgrounds
- [ ] Decor uploads and display
- [ ] All image URLs are S3 links
- [ ] No 404 errors for images
- [ ] CORS properly configured
- [ ] File size limits working
- [ ] Error handling for failed uploads

## 5. Security Considerations

1. **IAM User Permissions**:

   - Ensure IAM user has minimal required permissions
   - Use bucket policies to restrict access

2. **Bucket Configuration**:

   - Enable versioning for recovery
   - Consider enabling encryption
   - Set up lifecycle rules for cost management

3. **Access Control**:
   - Public read-only access for uploaded files
   - Write access only through application
   - CORS configured for frontend domain only

## 6. Monitoring

1. Set up CloudWatch Alarms for:

   - S3 Error Rates
   - Bucket Size
   - Request Latency

2. Enable S3 Access Logs for security monitoring

## 7. Rollback Plan

If issues occur:

1. Keep local file storage code commented (don't delete)
2. Maintain backup of `/uploads` directory
3. Can quickly revert to local storage if needed

## 8. Cost Considerations

1. Monitor S3 usage and costs
2. Set up billing alerts
3. Configure lifecycle rules for old files
4. Use CloudFront for better caching (optional)
