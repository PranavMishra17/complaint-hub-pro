@echo off
echo ========================================
echo   DATABASE TEST SCRIPT
echo ========================================

cd /d "%~dp0backend"

echo.
echo Checking environment variables...
if not defined SUPABASE_URL (
    echo ERROR: SUPABASE_URL not found in .env
    pause
    exit /b 1
)

if not defined SUPABASE_SERVICE_KEY (
    echo ERROR: SUPABASE_SERVICE_KEY not found in .env
    pause
    exit /b 1
)

echo Environment variables found!

echo.
echo Installing bcryptjs for testing...
npm install bcryptjs
if errorlevel 1 (
    echo ERROR: Failed to install bcryptjs
    pause
    exit /b 1
)

echo.
echo Running database test...
echo ----------------------------------------
node ../test-database.js

echo.
echo ----------------------------------------
echo Test completed! Check output above for results.
echo.
pause