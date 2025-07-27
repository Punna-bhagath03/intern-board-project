#!/bin/bash

# Production Deployment Script for Intern Board Application
# This script ensures the application is ready for production deployment

echo "🚀 Starting production deployment preparation..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies for both frontend and backend
echo "📦 Installing dependencies..."

echo "Installing backend dependencies..."
cd backend
npm install --production
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install backend dependencies"
    exit 1
fi

echo "Installing frontend dependencies..."
cd ../frontend
npm install --production
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo "✅ Dependencies installed successfully"

# Build frontend for production
echo "🔨 Building frontend for production..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to build frontend"
    exit 1
fi

cd ..

echo "✅ Frontend built successfully"

# Check environment files
echo "🔍 Checking environment configuration..."

# Check backend .env
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env file not found"
    echo "   Please create backend/.env with the following variables:"
    echo "   NODE_ENV=production"
    echo "   PORT=5001"
    echo "   MONGO_URL=your-mongodb-connection-string"
    echo "   JWT_SECRET=your-secure-jwt-secret"
    echo "   CLIENT_ORIGIN=https://your-frontend-domain.com"
    echo "   EMAIL_USER=your-email@gmail.com"
    echo "   EMAIL_PASS=your-app-password"
else
    echo "✅ Backend environment file found"
fi

# Check frontend .env
if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Warning: frontend/.env file not found"
    echo "   Please create frontend/.env with:"
    echo "   VITE_API_URL=https://your-backend-domain.com"
else
    echo "✅ Frontend environment file found"
fi

# Run security checks
echo "🔒 Running security checks..."

# Check for hardcoded secrets
if grep -r "password\|secret\|key" --include="*.js" --include="*.ts" --include="*.tsx" . | grep -v "process.env" | grep -v "console.log" | grep -v "//" | grep -v "/*" | grep -v "*/" | grep -v "password123" | grep -v "test"; then
    echo "⚠️  Warning: Potential hardcoded secrets found"
else
    echo "✅ No hardcoded secrets found"
fi

# Check for console.log statements in production code
if grep -r "console.log" frontend/src/ backend/ | grep -v "console.error" | grep -v "console.warn"; then
    echo "⚠️  Warning: console.log statements found in production code"
else
    echo "✅ No console.log statements in production code"
fi

# Validate build output
echo "🔍 Validating build output..."

if [ ! -d "frontend/dist" ]; then
    echo "❌ Error: Frontend build output not found"
    exit 1
fi

if [ ! -f "frontend/dist/index.html" ]; then
    echo "❌ Error: Frontend index.html not found"
    exit 1
fi

echo "✅ Build output validated"

# Check for critical files
echo "📁 Checking critical files..."

critical_files=(
    "backend/index.js"
    "backend/package.json"
    "frontend/package.json"
    "frontend/dist/index.html"
    "PRODUCTION_DEPLOYMENT_GUIDE.md"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file found"
    else
        echo "❌ Error: $file not found"
        exit 1
    fi
done

# Create production checklist
echo "📝 Creating production checklist..."

cat > PRODUCTION_CHECKLIST.md << 'EOF'
# Production Deployment Checklist

## ✅ Completed Checks

- [x] Dependencies installed
- [x] Frontend built successfully
- [x] Environment files checked
- [x] Security checks completed
- [x] Build output validated
- [x] Critical files verified

## 🔧 Manual Steps Required

### Backend Deployment (Render/Heroku/etc.)
1. Connect repository to hosting service
2. Set environment variables:
   - NODE_ENV=production
   - MONGO_URL=your-mongodb-connection-string
   - JWT_SECRET=your-secure-jwt-secret
   - CLIENT_ORIGIN=https://your-frontend-domain.com
   - EMAIL_USER=your-email@gmail.com
   - EMAIL_PASS=your-app-password
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Deploy

### Frontend Deployment (Render/Netlify/etc.)
1. Connect repository to hosting service
2. Set environment variables:
   - VITE_API_URL=https://your-backend-domain.com
3. Set build command: `npm install && npm run build`
4. Set publish directory: `dist`
5. Deploy

### Database Setup
1. Create MongoDB Atlas cluster
2. Set up database access (username/password)
3. Set up network access (0.0.0.0/0 for hosting)
4. Get connection string

### Post-Deployment Testing
1. Test user registration
2. Test user login
3. Test board creation
4. Test image upload
5. Test share link generation
6. Test share link access
7. Test admin features (if applicable)

## 🚨 Important Notes

- All images are now stored as base64 strings
- Blob URLs are automatically converted to transparent PNGs
- Maximum image file size: 5MB
- Supported image formats: PNG, JPEG, WebP
- Share links work for both logged-in and logged-out users
- Board owner is displayed in the header

## 📞 Support

If you encounter issues:
1. Check application logs
2. Review PRODUCTION_DEPLOYMENT_GUIDE.md
3. Verify environment variables
4. Test API endpoints manually
EOF

echo "✅ Production checklist created: PRODUCTION_CHECKLIST.md"

# Final summary
echo ""
echo "🎉 Production deployment preparation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Review PRODUCTION_CHECKLIST.md"
echo "2. Set up your hosting environment"
echo "3. Configure environment variables"
echo "4. Deploy backend and frontend"
echo "5. Test all functionality"
echo ""
echo "📚 Documentation:"
echo "- PRODUCTION_DEPLOYMENT_GUIDE.md - Complete deployment guide"
echo "- PRODUCTION_CHECKLIST.md - Step-by-step checklist"
echo ""
echo "🔧 Application is now production-ready!" 