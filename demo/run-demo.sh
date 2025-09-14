#!/bin/bash

# demo/run-demo.sh - Bug Whisperer Demo Runner
# This script sets up and runs the Bug Whisperer application for demonstration

echo "🐛 Bug Whisperer Demo Setup"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "📦 Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm run install-frontend

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "🔨 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build frontend"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Starting Bug Whisperer server..."
echo ""
echo "📁 Demo files available in demo/snippets/:"
echo "   • missingVar.js - ReferenceError due to undeclared variable"
echo "   • wrongEquality.js - Type coercion bugs with == vs ==="
echo "   • asyncAwaitError.js - Missing await in async functions"
echo ""
echo "🌐 Opening frontend at: http://localhost:3001"
echo ""
echo "💡 Instructions:"
echo "   1. Copy content from any demo file in demo/snippets/"
echo "   2. Paste it into the code textarea"
echo "   3. Set the filename (e.g., 'missingVar.js')"
echo "   4. Click 'Analyze Code' to see issues and fixes"
echo "   5. View the fixed code and educational lesson"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start