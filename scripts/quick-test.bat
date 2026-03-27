@echo off
REM Quick Local Test Script for Hemalink
REM This will test everything locally before deployment

echo 🧪 Starting Local Hemalink Testing...
echo =====================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️ .env.local file not found
    echo Creating from .env.example...
    copy .env.example .env.local
    echo.
    echo 🔧 Please edit .env.local with your Supabase credentials:
    echo    VITE_SUPABASE_URL=https://your-project.supabase.co
    echo    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    echo.
    echo Then run this script again.
    pause
    exit /b 1
)

REM Start development server
echo 🚀 Starting development server...
echo.
echo 📝 Testing Instructions:
echo 1. Browser will open to http://localhost:5173
echo 2. Open browser console (F12)
echo 3. Run: testLocalSetup()
echo 4. Follow the test results
echo.
echo Press Ctrl+C to stop the server when done testing
echo.

npm run dev
