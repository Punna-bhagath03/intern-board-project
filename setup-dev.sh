#!/bin/bash

echo "🚀 Development Setup for Intern Board Project"
echo "=============================================="
echo ""

echo "Current IP Address: $(curl -s ifconfig.me)"
echo ""

echo "Choose your MongoDB setup:"
echo "1. Use MongoDB Atlas (Cloud) - Add IP to whitelist"
echo "2. Use Local MongoDB (Development)"
echo "3. Exit"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
  1)
    echo ""
    echo "📋 To use MongoDB Atlas:"
    echo "1. Go to: https://cloud.mongodb.com"
    echo "2. Login and select your cluster: mi-board"
    echo "3. Go to Network Access (left sidebar)"
    echo "4. Click 'Add IP Address'"
    echo "5. Add your IP: $(curl -s ifconfig.me)"
    echo "6. Or click 'Allow Access from Anywhere' for development"
    echo ""
    echo "After adding your IP, run: cd backend && npm start"
    ;;
  2)
    echo ""
    echo "🔧 Setting up local MongoDB..."
    cd backend
    
    # Update .env for local MongoDB
    sed -i '' 's|MONGO_URL=mongodb+srv://.*|MONGO_URL=mongodb://localhost:27017/intern-board|' .env
    
    echo "✅ Updated .env for local MongoDB"
    echo "🚀 Starting backend..."
    npm start
    ;;
  3)
    echo "👋 Exiting..."
    exit 0
    ;;
  *)
    echo "❌ Invalid choice. Please run the script again."
    exit 1
    ;;
esac 