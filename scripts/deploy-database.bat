@echo off
REM Database Deployment Script for Hemalink (Windows)
REM This script helps deploy the database schema and triggers to Supabase

echo 🚀 Starting Hemalink Database Deployment...

REM Check if supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Supabase CLI not found. Please install it first:
    echo npm install -g supabase
    pause
    exit /b 1
)

REM Check if user is logged in to Supabase
echo 🔐 Checking Supabase authentication...
supabase projects list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Not logged in to Supabase. Please run:
    echo supabase login
    pause
    exit /b 1
)

REM Get project reference
echo 📋 Available Supabase Projects:
supabase projects list

echo.
echo Please enter your Supabase Project Reference (from the list above):
set /p PROJECT_REF=

if "%PROJECT_REF%"=="" (
    echo ❌ Project reference is required
    pause
    exit /b 1
)

REM Link to project
echo 🔗 Linking to project %PROJECT_REF%...
supabase link --project-ref "%PROJECT_REF%"

REM Deploy database schema
echo 🗄️ Deploying database schema...
supabase db push --database="%PROJECT_REF%"

REM Deploy triggers and functions
echo ⚡ Deploying triggers and functions...
supabase functions deploy --no-verify-jwt

echo ✅ Database deployment completed!
echo.
echo 📝 Next Steps:
echo 1. Update your Vercel Environment Variables with:
echo    - VITE_SUPABASE_URL=https://%PROJECT_REF%.supabase.co
echo    - VITE_SUPABASE_ANON_KEY=your_anon_key_from_supabase_dashboard
echo.
echo 2. Test the registration flow for all user types
echo 3. Verify dashboard loading after registration
echo.
pause
