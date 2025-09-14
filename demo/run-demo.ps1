# demo/run-demo.ps1 - Bug Whisperer Demo Runner for Windows PowerShell
# This script sets up and runs the Bug Whisperer application for demonstration

Write-Host "🐛 Bug Whisperer Demo Setup" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 16+ and try again." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
npm run install-frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build frontend" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting Bug Whisperer server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Demo files available in demo/snippets/:" -ForegroundColor White
Write-Host "   • missingVar.js - ReferenceError due to undeclared variable" -ForegroundColor Gray
Write-Host "   • wrongEquality.js - Type coercion bugs with == vs ===" -ForegroundColor Gray
Write-Host "   • asyncAwaitError.js - Missing await in async functions" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Opening frontend at: http://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "💡 Instructions:" -ForegroundColor Yellow
Write-Host "   1. Copy content from any demo file in demo/snippets/" -ForegroundColor White
Write-Host "   2. Paste it into the code textarea" -ForegroundColor White
Write-Host "   3. Set the filename (e.g., 'missingVar.js')" -ForegroundColor White
Write-Host "   4. Click 'Analyze Code' to see issues and fixes" -ForegroundColor White
Write-Host "   5. View the fixed code and educational lesson" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

# Start the server on port 3002
$env:PORT = "3002"
npm start