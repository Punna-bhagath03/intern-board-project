#!/bin/bash

echo "🔧 Fixing .env file for local development..."

# Go to backend directory
cd backend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from env.example..."
    cp env.example .env
fi

# Update the .env file for local development
echo "Updating .env file for local MongoDB..."

# Use sed to replace the MongoDB URI
sed -i '' 's/MONGODB_URI=/MONGO_URL=/' .env
sed -i '' 's|mongodb+srv://username:password@cluster.mongodb.net/intern-board?retryWrites=true&w=majority|mongodb://localhost:27017/intern-board|' .env

# Update NODE_ENV to development
sed -i '' 's/NODE_ENV=production/NODE_ENV=development/' .env

# Update CLIENT_ORIGIN to localhost
sed -i '' 's|CLIENT_ORIGIN=https://your-frontend-domain.onrender.com|CLIENT_ORIGIN=http://localhost:5173|' .env

echo "✅ .env file updated successfully!"
echo "📋 Current .env configuration:"
echo "----------------------------------------"
cat .env
echo "----------------------------------------"
echo ""
echo "🚀 You can now start the backend with: npm start" 