@echo off
REM demo/run-demo.bat - Bug Whisperer Demo Runner for Windows Command Prompt

echo 🐛 Bug Whisperer Demo Setup
echo ==========================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ and try again.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

echo 📦 Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo 📦 Installing frontend dependencies...
call npm run install-frontend
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo 🔨 Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
)

echo.
echo ✅ Setup complete!
echo.
echo 🚀 Starting Bug Whisperer server...
echo.
echo 📁 Demo files available in demo/snippets/:
echo    • missingVar.js - ReferenceError due to undeclared variable
echo    • wrongEquality.js - Type coercion bugs with == vs ===
echo    • asyncAwaitError.js - Missing await in async functions
echo.
echo 🌐 Opening frontend at: http://localhost:3001
echo.
echo 💡 Instructions:
echo    1. Copy content from any demo file in demo/snippets/
echo    2. Paste it into the code textarea
echo    3. Set the filename (e.g., 'missingVar.js')
echo    4. Click 'Analyze Code' to see issues and fixes
echo    5. View the fixed code and educational lesson
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.

REM Start the server
npm start