# 🚀 Render Deployment Guide - Local MongoDB + Single Repository

## 📋 Prerequisites

1. **GitHub Repository** - Your code should be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Local MongoDB** - You're using MongoDB locally
4. **Single Repository** - Backend and frontend in same repo

## 🗂️ Project Structure

```
intern-board-project/
├── backend/
│   ├── index.js
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

## 🔧 Step 1: MongoDB Atlas Setup (Required for Production)

**Note**: Render cannot connect to your local MongoDB. You need to use MongoDB Atlas for production.

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Try Free" and create account
3. Choose "Free" plan (M0)

### 1.2 Create Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select cloud provider (AWS/Google Cloud/Azure)
4. Choose region (closest to you)
5. Click "Create"

### 1.3 Set Up Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Select "Read and write to any database"
6. Click "Add User"

### 1.4 Set Up Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password

**Example connection string:**
```
mongodb+srv://username:password@cluster.mongodb.net/intern-board?retryWrites=true&w=majority
```

## 🔧 Step 2: Deploy Backend Service

### 2.1 Go to Render Dashboard
1. Visit [dashboard.render.com](https://dashboard.render.com)
2. Sign in to your account

### 2.2 Create New Web Service
1. Click "New +" button
2. Select "Web Service"

### 2.3 Connect Repository
1. Click "Connect a repository"
2. Select your GitHub repository
3. Authorize Render if needed

### 2.4 Configure Backend Service
Fill in these exact settings:

```
Name: intern-board-backend
Root Directory: backend
Environment: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

### 2.5 Set Environment Variables
Click "Advanced" and add these environment variables:

```
Key: NODE_ENV
Value: production

Key: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/intern-board?retryWrites=true&w=majority

Key: JWT_SECRET
Value: your-super-secret-jwt-key-here-make-it-long-and-random

Key: CLIENT_ORIGIN
Value: https://your-frontend-domain.onrender.com
(Leave this empty for now, we'll update it after frontend deployment)

Key: EMAIL_USER
Value: your-email@gmail.com
(Optional - for email notifications)

Key: EMAIL_PASS
Value: your-app-password
(Optional - for email notifications)
```

### 2.6 Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Note the backend URL (e.g., `https://intern-board-backend.onrender.com`)

## 🔧 Step 3: Deploy Frontend Service

### 3.1 Create New Static Site
1. Go back to Render dashboard
2. Click "New +" button
3. Select "Static Site"

### 3.2 Connect Same Repository
1. Click "Connect a repository"
2. Select the same GitHub repository

### 3.3 Configure Frontend Service
Fill in these exact settings:

```
Name: intern-board-frontend
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

### 3.4 Set Environment Variables
Add this environment variable:

```
Key: VITE_API_URL
Value: https://your-backend-domain.onrender.com
(Use the backend URL from Step 2.6)
```

### 3.5 Deploy Frontend
1. Click "Create Static Site"
2. Wait for deployment (2-3 minutes)
3. Note the frontend URL (e.g., `https://intern-board-frontend.onrender.com`)

## 🔧 Step 4: Update Backend Configuration

### 4.1 Update CLIENT_ORIGIN
1. Go to your backend service in Render
2. Click "Environment" tab
3. Find `CLIENT_ORIGIN` variable
4. Update the value to your frontend URL:
   ```
   CLIENT_ORIGIN = https://intern-board-frontend.onrender.com
   ```

### 4.2 Redeploy Backend
1. Go to "Manual Deploy" tab
2. Click "Deploy latest commit"
3. Wait for redeployment

## 🔧 Step 5: Test Deployment

### 5.1 Test Backend
- Visit: `https://your-backend-domain.onrender.com/`
- Should see: "✅ Backend is running"

### 5.2 Test Frontend
- Visit: `https://your-frontend-domain.onrender.com/`
- Should load the application

### 5.3 Test Full Application
1. Try registering a new user
2. Try logging in
3. Create a board
4. Upload an avatar
5. Test all features

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Failures
**Problem**: Service fails to build
**Solution**: 
- Check the build logs in Render
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

#### 2. Database Connection Issues
**Problem**: Backend can't connect to MongoDB
**Solution**:
- Verify MongoDB Atlas connection string
- Check username/password in connection string
- Ensure network access allows all IPs (0.0.0.0/0)

#### 3. CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**:
- Verify `CLIENT_ORIGIN` in backend matches frontend URL exactly
- Check that backend is deployed and running
- Ensure CORS configuration is correct

#### 4. Environment Variables Not Working
**Problem**: Variables not being read
**Solution**:
- Redeploy service after adding variables
- Check variable names match code exactly
- Verify no typos in values

### Debugging Steps

1. **Check Render Logs**
   - Go to service → "Logs" tab
   - Look for error messages
   - Check build logs for issues

2. **Test Locally First**
   - Clone repository locally
   - Set up environment variables
   - Test with `npm start`

3. **Check Network Tab**
   - Open browser dev tools
   - Check for failed API requests
   - Verify URLs are correct

## 📊 Monitoring

### Health Checks
- Backend: `https://your-backend-domain.onrender.com/`
- Frontend: `https://your-frontend-domain.onrender.com/`

### Performance Monitoring
- Monitor Render dashboard for:
  - Response times
  - Error rates
  - Resource usage

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to Git
- Use Render's environment variable system
- Rotate JWT secrets regularly

### CORS Configuration
- Only allow your frontend domain
- Don't use `*` in production

### Rate Limiting
- Backend has rate limiting enabled in production
- Monitor for abuse

## 📈 Scaling

### Free Tier Limitations
- Backend: 750 hours/month
- Frontend: 100GB bandwidth/month
- Database: 512MB storage

### Upgrading
- Consider paid plans for production use
- Monitor usage in Render dashboard

## 🎉 Success Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed and responding
- [ ] Frontend deployed and loading
- [ ] Database connected
- [ ] User registration working
- [ ] User login working
- [ ] Board creation working
- [ ] Avatar upload working
- [ ] Real-time collaboration working
- [ ] No console errors
- [ ] All features functional

## 📞 Support

If you encounter issues:
1. Check Render documentation
2. Review application logs
3. Test locally first
4. Check environment variables
5. Verify all services are running

## 🔄 Continuous Deployment

Once set up, Render will automatically:
- Deploy on every Git push
- Build and test your code
- Update your live application

Your Intern Board application is now ready for production use! 🚀 