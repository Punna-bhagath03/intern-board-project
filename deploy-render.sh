#!/bin/bash

echo "🚀 Render Deployment Script for Intern Board Project"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the root directory of the project."
    exit 1
fi

print_status "Starting deployment preparation..."

# Step 1: Check git status
print_status "Step 1: Checking Git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please commit them first."
    echo "Current status:"
    git status
    echo ""
    read -p "Do you want to commit these changes? (y/n): " commit_changes
    if [ "$commit_changes" = "y" ] || [ "$commit_changes" = "Y" ]; then
        read -p "Enter commit message: " commit_message
        git add .
        git commit -m "$commit_message"
        print_success "Changes committed successfully."
    else
        print_error "Please commit your changes before deploying."
        exit 1
    fi
else
    print_success "No uncommitted changes found."
fi

# Step 2: Check for sensitive files
print_status "Step 2: Checking for sensitive files..."
if git ls-files | grep -E "\.env$" > /dev/null; then
    print_error "Found .env files in repository. Please remove them from git tracking."
    echo "Files found:"
    git ls-files | grep -E "\.env$"
    exit 1
fi

if git ls-files | grep "node_modules" > /dev/null; then
    print_error "Found node_modules in repository. Please remove them from git tracking."
    exit 1
fi

print_success "No sensitive files found in repository."

# Step 3: Push to GitHub
print_status "Step 3: Pushing to GitHub..."
if git push origin main; then
    print_success "Code pushed to GitHub successfully."
else
    print_error "Failed to push to GitHub. Please check your git configuration."
    exit 1
fi

# Step 4: Display next steps
echo ""
echo "🎯 NEXT STEPS FOR RENDER DEPLOYMENT:"
echo "===================================="
echo ""
echo "1. 📊 SETUP MONGODB ATLAS:"
echo "   - Go to https://cloud.mongodb.com"
echo "   - Create a new cluster"
echo "   - Configure network access (Allow from anywhere)"
echo "   - Create database user"
echo "   - Get connection string"
echo ""
echo "2. 🔧 DEPLOY BACKEND ON RENDER:"
echo "   - Go to https://dashboard.render.com"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repository"
echo "   - Build Command: cd backend && npm install"
echo "   - Start Command: cd backend && npm start"
echo "   - Set environment variables (see guide)"
echo ""
echo "3. 🎨 DEPLOY FRONTEND ON RENDER:"
echo "   - Create new Static Site"
echo "   - Connect your GitHub repository"
echo "   - Build Command: cd frontend && npm install && npm run build"
echo "   - Publish Directory: frontend/dist"
echo "   - Set VITE_API_URL environment variable"
echo ""
echo "4. 🔗 UPDATE CORS:"
echo "   - Update CLIENT_ORIGIN in backend environment variables"
echo "   - Redeploy backend"
echo ""
echo "📋 ENVIRONMENT VARIABLES NEEDED:"
echo "================================"
echo ""
echo "Backend (.env):"
echo "MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/intern-board?retryWrites=true&w=majority"
echo "JWT_SECRET=your-super-secret-jwt-key-here"
echo "NODE_ENV=production"
echo "CLIENT_ORIGIN=https://your-frontend-app-name.onrender.com"
echo "GMAIL_USER=your-email@gmail.com"
echo "GMAIL_PASS=your-gmail-app-password"
echo ""
echo "Frontend (.env):"
echo "VITE_API_URL=https://your-backend-app-name.onrender.com"
echo ""
echo "📖 For detailed instructions, see: RENDER_DEPLOYMENT_GUIDE.md"
echo ""
print_success "Deployment preparation completed successfully!"
echo ""
echo "🚀 Ready to deploy on Render!" 