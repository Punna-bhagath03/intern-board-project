# Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Intern Board application to production.

## Prerequisites
- MongoDB Atlas account (or MongoDB instance)
- Render account (or similar hosting service)
- Email service (Gmail, SendGrid, etc.)

## Environment Variables Setup

### Backend Environment Variables (.env)
```env
NODE_ENV=production
PORT=5001
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/intern-board
JWT_SECRET=your-super-secure-jwt-secret-key-here
CLIENT_ORIGIN=https://your-frontend-domain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend Environment Variables (.env)
```env
VITE_API_URL=https://your-backend-domain.com
```

## Deployment Steps

### 1. Backend Deployment (Render)

1. **Connect Repository**
   - Connect your GitHub repository to Render
   - Select the backend directory as the root

2. **Configure Service**
   - **Name**: `intern-board-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/`

3. **Environment Variables**
   - `NODE_ENV`: `production`
   - `MONGO_URL`: Your MongoDB connection string
   - `JWT_SECRET`: Secure random string (32+ characters)
   - `CLIENT_ORIGIN`: Your frontend URL
   - `EMAIL_USER`: Your email address
   - `EMAIL_PASS`: Your email app password

### 2. Frontend Deployment (Render)

1. **Connect Repository**
   - Connect your GitHub repository to Render
   - Select the frontend directory as the root

2. **Configure Service**
   - **Name**: `intern-board-frontend`
   - **Environment**: `Static Site`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Environment Variables**
   - `VITE_API_URL`: Your backend URL

### 3. Database Setup

1. **MongoDB Atlas**
   - Create a new cluster
   - Set up database access (username/password)
   - Set up network access (0.0.0.0/0 for Render)
   - Get connection string

2. **Database Collections**
   - The application will automatically create required collections:
     - `users`
     - `boards`
     - `decors`
     - `sharelinks`

## Security Considerations

### 1. JWT Secret
- Use a strong, random string (32+ characters)
- Never commit to version control
- Example: `openssl rand -base64 32`

### 2. MongoDB Security
- Use strong username/password
- Enable network access restrictions
- Enable MongoDB Atlas security features

### 3. CORS Configuration
- Backend is configured to accept requests from frontend domain
- Update `CLIENT_ORIGIN` in backend environment variables

### 4. Rate Limiting
- Enabled in production mode
- 100 requests per 15 minutes per IP

## Performance Optimizations

### 1. Image Handling
- Images are stored as base64 strings
- Maximum file size: 5MB
- Supported formats: PNG, JPEG, WebP

### 2. Caching
- Static assets are cached by CDN
- API responses include appropriate headers

### 3. Database Indexes
- Automatic TTL indexes for share links
- User and board indexes for fast queries

## Monitoring and Logging

### 1. Application Logs
- Backend logs are available in Render dashboard
- Frontend errors are logged to browser console

### 2. Health Checks
- Backend health check endpoint: `/`
- Returns "✅ Backend is running" when healthy

### 3. Error Handling
- Comprehensive error handling throughout application
- User-friendly error messages
- Detailed logging for debugging

## Testing Production Deployment

### 1. Health Check
```bash
curl https://your-backend-domain.com/
# Should return: ✅ Backend is running
```

### 2. API Endpoints
```bash
# Test user registration
curl -X POST https://your-backend-domain.com/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST https://your-backend-domain.com/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'
```

### 3. Frontend Functionality
- Test user registration and login
- Test board creation and editing
- Test image upload and display
- Test share link generation and access
- Test admin features (if applicable)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CLIENT_ORIGIN` is set correctly
   - Check frontend URL matches backend configuration

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network access settings
   - Ensure database user has proper permissions

3. **Image Loading Issues**
   - Check file size limits (5MB max)
   - Verify supported image formats
   - Check browser console for errors

4. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Ensure proper CORS headers

### Debug Steps

1. **Check Backend Logs**
   - View logs in Render dashboard
   - Look for error messages and stack traces

2. **Check Frontend Console**
   - Open browser developer tools
   - Check for JavaScript errors
   - Verify API calls are successful

3. **Test API Endpoints**
   - Use curl or Postman to test endpoints
   - Verify authentication and authorization

## Maintenance

### Regular Tasks

1. **Database Backups**
   - MongoDB Atlas provides automatic backups
   - Consider additional backup strategies

2. **Security Updates**
   - Keep dependencies updated
   - Monitor for security vulnerabilities

3. **Performance Monitoring**
   - Monitor application performance
   - Check for memory leaks or slow queries

### Scaling Considerations

1. **Database Scaling**
   - MongoDB Atlas provides automatic scaling
   - Monitor usage and upgrade as needed

2. **Application Scaling**
   - Render provides automatic scaling
   - Monitor resource usage

## Support

For issues or questions:
1. Check application logs
2. Review this deployment guide
3. Check GitHub repository for updates
4. Contact development team

## Version History

- v1.0.0: Initial production release
- Fixed image loading issues
- Improved share link functionality
- Enhanced error handling and logging
- Production-ready deployment configuration 