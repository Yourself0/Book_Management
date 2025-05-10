#!/bin/bash

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "Node.js and npm are required but not installed. Please install Node.js."
    exit 1
fi

echo "🔧 Installing dependencies..."
npm install

echo "⚙️  Running build..."
npm run build

echo "✅ Build completed"
echo "🚀 Starting the application..."