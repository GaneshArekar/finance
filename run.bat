@echo off
title FinanceFlow - Personal Finance Management System
echo ========================================================
echo   FinanceFlow - Personal Finance System
echo ========================================================
echo.

if not exist .env (
    echo [WARNING] .env file not found! Copying from .env.example...
    copy .env.example .env
    echo Please verify your database credentials in .env.
)

echo Starting FinanceFlow development server...
echo URL: http://localhost:3000
echo.
call npm run dev
pause
